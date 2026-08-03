import { Router } from 'express';
import { Invoice } from '../models/Invoice';
import { Inventory } from '../models/Inventory';
const router = Router();
function parseItemWeights(item) {
    let grossWt = item.grossWeight;
    let stoneWt = item.stoneWeight;
    let netWt = item.netWeight;
    if ((grossWt === undefined || grossWt === null) && item.productId && typeof item.productId === 'string' && item.productId.includes('__GW_')) {
        const parts = item.productId.split('__GW_');
        if (parts[1]) {
            const sub = parts[1].split('__SW_');
            if (sub[0])
                grossWt = Number(sub[0]);
            if (sub[1])
                stoneWt = Number(sub[1]);
        }
    }
    const net = Number(netWt || 0);
    const gross = Number(grossWt !== undefined && grossWt !== null && !isNaN(Number(grossWt)) ? grossWt : net);
    const stone = Number(stoneWt !== undefined && stoneWt !== null && !isNaN(Number(stoneWt)) ? stoneWt : 0);
    return { grossWt: gross, netWt: net, stoneWt: stone };
}
// Restore inventory stock/weight when invoice is deleted or items are removed
async function restoreInventoryFromInvoiceItems(invoiceItems, session = null) {
    const ownSession = session ?? await Inventory.startSession();
    const manageSession = !session;
    try {
        if (manageSession) {
            ownSession.startTransaction();
        }
        for (const item of invoiceItems) {
            const normalizedProductId = normalizeInvoiceProductId(item.productId);
            if (!normalizedProductId ||
                normalizedProductId === 'manual' ||
                normalizedProductId.startsWith('manual-')) {
                continue;
            }
            let inventory = null;
            // Try to find inventory by _id first
            try {
                inventory = await Inventory.findById(normalizedProductId).session(ownSession);
            }
            catch {
                // ignore cast errors
            }
            // If not found, try by huid
            if (!inventory) {
                inventory = await Inventory.findOne({ huid: normalizedProductId }).session(ownSession);
            }
            // If not found, try by barcode
            if (!inventory) {
                inventory = await Inventory.findOne({ barcode: normalizedProductId }).session(ownSession);
            }
            // If not found, try by name
            if (!inventory) {
                inventory = await Inventory.findOne({ name: normalizedProductId }).session(ownSession);
            }
            // If still not found, try as _id string
            if (!inventory) {
                try {
                    inventory = await Inventory.findOne({ _id: normalizedProductId }).session(ownSession);
                }
                catch {
                    // ignore
                }
            }
            if (!inventory) {
                continue; // Skip if inventory not found during restoration
            }
            const { grossWt: restoreGrossWt, netWt: restoreNetWt, stoneWt: restoreStoneWt } = parseItemWeights(item);
            const restoreStock = Number(item.qty || 1);
            const currentStock = Number(inventory.stock ?? 0);
            const currentNetWt = Number(inventory.netWeight ?? 0);
            const currentGrossWt = Number(inventory.grossWeight !== undefined && inventory.grossWeight !== null ? inventory.grossWeight : currentNetWt);
            const currentStoneWt = Number(inventory.stoneWeight ?? 0);
            inventory.stock = currentStock + restoreStock;
            inventory.netWeight = Number((currentNetWt + restoreNetWt).toFixed(3));
            inventory.grossWeight = Number((currentGrossWt + restoreGrossWt).toFixed(3));
            inventory.stoneWeight = Number((currentStoneWt + restoreStoneWt).toFixed(3));
            await inventory.save({ session: ownSession });
        }
        if (manageSession) {
            await ownSession.commitTransaction();
        }
    }
    catch (err) {
        if (manageSession) {
            await ownSession.abortTransaction();
        }
        throw err;
    }
    finally {
        if (manageSession) {
            ownSession.endSession();
        }
    }
}
// Deduct inventory stock/weight when invoice is created
function normalizeInvoiceProductId(productId) {
    if (!productId || typeof productId !== 'string')
        return productId;
    if (productId === 'manual')
        return 'manual';
    if (productId.startsWith('manual-'))
        return productId;
    if (productId.includes('__GW_')) {
        return productId.split('__GW_')[0];
    }
    return productId;
}
async function applyInventoryDeductionFromInvoiceItems(invoiceItems, session = null) {
    const ownSession = session ?? await Inventory.startSession();
    const manageSession = !session;
    try {
        if (manageSession) {
            ownSession.startTransaction();
        }
        for (const item of invoiceItems) {
            const normalizedProductId = normalizeInvoiceProductId(item.productId);
            if (!normalizedProductId || normalizedProductId.startsWith('manual-')) {
                continue;
            }
            // productId may be an actual Inventory document _id or some other identifier.
            // Try multiple matching strategies.
            let inventory = null;
            // 1) Try _id match (works only if productId is a valid ObjectId)
            try {
                inventory = await Inventory.findById(normalizedProductId).session(ownSession);
            }
            catch {
                // ignore cast errors
            }
            // 2) If not found, try matching by huid
            if (!inventory) {
                inventory = await Inventory.findOne({ huid: normalizedProductId }).session(ownSession);
            }
            // 3) If not found, try matching by barcode
            if (!inventory) {
                inventory = await Inventory.findOne({ barcode: normalizedProductId }).session(ownSession);
            }
            // 4) If not found, try matching by name
            if (!inventory) {
                inventory = await Inventory.findOne({ name: normalizedProductId }).session(ownSession);
            }
            // 5) If still not found, try matching by _id as plain string
            if (!inventory) {
                try {
                    inventory = await Inventory.findOne({ _id: normalizedProductId }).session(ownSession);
                }
                catch {
                    // ignore
                }
            }
            // Skip placeholder/manual lines even if they reach this point (safety net)
            if (item.productId === 'manual' || normalizedProductId === 'manual') {
                continue;
            }
            if (!inventory) {
                console.warn(`Inventory item not found for productId during deduction: ${item.productId} (normalized: ${normalizedProductId}). Skipping stock update.`);
                continue; // Skip if inventory not found
            }
            const { grossWt: deductGrossWt, netWt: deductNetWt, stoneWt: deductStoneWt } = parseItemWeights(item);
            const deductStock = Number(item.qty || 1);
            const currentStock = Number(inventory.stock ?? 0);
            const currentNetWt = Number(inventory.netWeight ?? 0);
            const currentGrossWt = Number(inventory.grossWeight !== undefined && inventory.grossWeight !== null ? inventory.grossWeight : currentNetWt);
            const currentStoneWt = Number(inventory.stoneWeight ?? 0);
            inventory.stock = Math.max(0, currentStock - deductStock);
            inventory.grossWeight = Math.max(0, Number((currentGrossWt - deductGrossWt).toFixed(3)));
            inventory.stoneWeight = Math.max(0, Number((currentStoneWt - deductStoneWt).toFixed(3)));
            inventory.netWeight = Math.max(0, Number((currentNetWt - deductNetWt).toFixed(3)));
            await inventory.save({ session: ownSession });
        }
        if (manageSession) {
            await ownSession.commitTransaction();
        }
    }
    catch (err) {
        if (manageSession) {
            await ownSession.abortTransaction();
        }
        throw err;
    }
    finally {
        if (manageSession) {
            ownSession.endSession();
        }
    }
}
router.get('/', async (_req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice)
            return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});
function isDuplicateInvoiceNumberError(error) {
    const msg = typeof error?.message === 'string' ? error.message : '';
    return msg.includes('duplicate key error') && msg.includes('number');
}
function generateNewInvoiceNumber(baseNumber) {
    // Keep INV sequence style: INV-000001, INV-000002, ...
    // If baseNumber already matches INV-<digits>, increment it.
    // Otherwise fallback to current timestamp (still prefixed with INV-).
    if (baseNumber && typeof baseNumber === 'string') {
        const m = baseNumber.match(/^(INV-)(\d+)$/i);
        if (m) {
            const prefix = m[1];
            const digits = m[2];
            const width = digits.length;
            const next = String(Number(digits) + 1).padStart(width, '0');
            return `${prefix}${next}`;
        }
        const m2 = baseNumber.match(/^(INV-\s*?)(\d+)$/i);
        if (m2) {
            const prefix = m2[1].replace(/\s+/g, '');
            const digits = m2[2];
            const width = digits.length;
            const next = String(Number(digits) + 1).padStart(width, '0');
            return `${prefix}${next}`;
        }
    }
    const now = Date.now();
    const rand = Math.floor(Math.random() * 1000);
    return `INV-${now}${rand}`;
}
router.post('/', async (req, res) => {
    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const session = await Inventory.startSession();
        session.startTransaction();
        try {
            const invoicePayload = { ...req.body };
            // On retries, regenerate number (only if it's duplicate-prone / provided).
            if (attempt > 1) {
                invoicePayload.number = generateNewInvoiceNumber(req.body?.number);
            }
            // Recalculate invoice totals using: netWeight * ratePerGram + makingCharge
            // (Do NOT rely on frontend-calculated totals.)
            const items = Array.isArray(invoicePayload.items) ? invoicePayload.items : [];
            let itemSubtotal = 0;
            let gstAmount = 0;
            items.forEach((it) => {
                const netWeight = Number(it?.netWeight ?? 0);
                const ratePerGram = Number(it?.ratePerGram ?? 0);
                const makingCharge = Number(it?.makingCharge ?? 0);
                // The netWeight is the total for the line, so we do not multiply by quantity.
                const lineBase = netWeight * ratePerGram + makingCharge;
                const gstPct = Number(it?.gstPct ?? 0);
                itemSubtotal += lineBase;
                if (invoicePayload.type === 'GST') {
                    gstAmount += lineBase * (gstPct / 100);
                }
            });
            // Ensure hsnCode is preserved on items
            invoicePayload.items = items;
            invoicePayload.subtotal = itemSubtotal;
            invoicePayload.gstAmount = gstAmount;
            const preRound = itemSubtotal + gstAmount - (Number(invoicePayload.discount) || 0) - (Number(invoicePayload.oldGoldAmount) || 0);
            invoicePayload.total = Math.round(preRound);
            // Use frontend-provided date if available, otherwise default to now.
            if (invoicePayload.createdAt) {
                invoicePayload.createdAt = new Date(invoicePayload.createdAt);
            }
            const invoice = new Invoice(invoicePayload);
            const savedInvoice = await invoice.save({ session });
            // Deduct inventory based on invoice items (only after invoice save succeeds)
            await applyInventoryDeductionFromInvoiceItems(savedInvoice.items.map((it) => ({
                productId: it.productId,
                grossWeight: it.grossWeight,
                netWeight: it.netWeight,
                stoneWeight: it.stoneWeight,
                qty: it.qty,
            })), session);
            await session.commitTransaction();
            session.endSession();
            res.status(201).json(savedInvoice);
            return;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            // If invoice number duplicated, retry with new number.
            if (isDuplicateInvoiceNumberError(error) && attempt < maxAttempts) {
                continue;
            }
            console.error('[POST /api/invoices] failed:', error);
            const msg = error?.message || 'Failed to create invoice';
            if (isDuplicateInvoiceNumberError(error)) {
                res.status(409).json({ error: 'Invoice number already exists. Please regenerate with a new number.' });
                return;
            }
            res.status(400).json({ error: msg });
            return;
        }
    }
    res.status(500).json({ error: 'Failed to create invoice after multiple attempts due to duplicate invoice number.' });
});
router.put('/:id', async (req, res) => {
    const session = await Inventory.startSession();
    session.startTransaction();
    try {
        const existingInvoice = await Invoice.findById(req.params.id).session(session);
        if (!existingInvoice) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // Restore old inventory (based on old items)
        await restoreInventoryFromInvoiceItems(existingInvoice.items.map((it) => ({
            productId: it.productId,
            grossWeight: it.grossWeight,
            netWeight: it.netWeight,
            stoneWeight: it.stoneWeight,
            qty: it.qty,
        })), session);
        const updatePayload = { ...req.body };
        // Use frontend-provided date if available
        if (updatePayload.createdAt) {
            updatePayload.createdAt = new Date(updatePayload.createdAt);
        }
        // Update invoice
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, updatePayload, {
            new: true,
            runValidators: true,
            session,
        });
        if (!updatedInvoice) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // Deduct new inventory (based on updated items)
        await applyInventoryDeductionFromInvoiceItems(updatedInvoice.items.map((it) => ({
            productId: it.productId,
            grossWeight: it.grossWeight,
            netWeight: it.netWeight,
            stoneWeight: it.stoneWeight,
            qty: it.qty,
        })), session);
        await session.commitTransaction();
        session.endSession();
        return res.json(updatedInvoice);
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('[PUT /api/invoices] failed:', error);
        const msg = error?.message || 'Failed to update invoice';
        // Duplicate invoice number on update (unique index)
        if (isDuplicateInvoiceNumberError(error)) {
            return res.status(409).json({ error: 'Invoice number already exists.' });
        }
        return res.status(400).json({ error: msg });
    }
});
// Update only invoice date (no inventory changes, no item/payment changes)
const updateInvoiceDateHandler = async (req, res) => {
    try {
        if (!req.body?.createdAt) {
            return res.status(400).json({ error: 'createdAt is required' });
        }
        const parsedDate = new Date(req.body.createdAt);
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: 'Invalid createdAt date' });
        }
        const existingInvoice = await Invoice.findById(req.params.id);
        if (!existingInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        // Set the new date on the main document
        existingInvoice.createdAt = parsedDate;
        // Update the date for each payment subdocument
        (existingInvoice.payments || []).forEach((p) => {
            p.date = parsedDate;
        });
        // Save the changes to the document and its subdocuments
        const updatedInvoice = await existingInvoice.save({ validateBeforeSave: false });
        if (!updatedInvoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        return res.json(updatedInvoice);
    }
    catch (error) {
        console.error('[PUT/PATCH /api/invoices/:id/date] failed:', error);
        return res.status(400).json({ error: error?.message || 'Failed to update invoice date' });
    }
};
router.put('/:id/date', updateInvoiceDateHandler);
router.patch('/:id/date', updateInvoiceDateHandler);
router.delete('/:id', async (req, res) => {
    try {
        const session = await Inventory.startSession();
        session.startTransaction();
        try {
            const invoice = await Invoice.findById(req.params.id).session(session);
            if (!invoice) {
                session.endSession();
                return res.status(404).json({ error: 'Invoice not found' });
            }
            // Restore inventory before deleting
            await restoreInventoryFromInvoiceItems(invoice.items.map((it) => ({
                productId: it.productId,
                grossWeight: it.grossWeight,
                netWeight: it.netWeight,
                stoneWeight: it.stoneWeight,
                qty: it.qty,
            })), session);
            // Delete the invoice
            await Invoice.findByIdAndDelete(req.params.id).session(session);
            await session.commitTransaction();
            session.endSession();
            res.json({ message: 'Invoice deleted and inventory restored' });
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('[DELETE /api/invoices] failed:', error);
            res.status(400).json({ error: error?.message || 'Failed to delete invoice' });
        }
    }
    catch (error) {
        console.error('[DELETE /api/invoices] session failed:', error);
        res.status(500).json({ error: error?.message || 'Failed to delete invoice' });
    }
});
export default router;
