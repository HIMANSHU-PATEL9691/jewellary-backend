import 'dotenv/config';
import express from 'express';
import connectDB from './config/database';
import { errorHandler, corsMiddleware } from './middleware/errorHandler';
import customersRouter from './routes/customers';
import suppliersRouter from './routes/suppliers';
import inventoryRouter from './routes/inventory';
import salesRouter from './routes/sales';
import purchasesRouter from './routes/purchases';
import expensesRouter from './routes/expenses';
import karigarsRouter from './routes/karigars';
import jobworkRouter from './routes/jobwork';
import goldRatesRouter from './routes/gold-rates';
import repairsRouter from './routes/repairs';
import invoicesRouter from './routes/invoices';
import schemesRouter from './routes/schemes';
import advancesRouter from './routes/advances';
import girviRouter from './routes/girvi';
import ordersRouter from './routes/orders';
import employeesRouter from './routes/employees';

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(corsMiddleware);

// Request Logging Middleware
app.use((req, _res, next) => {
  console.log(`\n[Backend API] Incoming ${req.method} request to ${req.path}`);
  if (Object.keys(req.body).length > 0) console.log('[Backend API] Body:', req.body);
  next();
});

// Connect to MongoDB
connectDB();

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// API Routes
app.use('/api/customers', customersRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/sales', salesRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/karigars', karigarsRouter);
app.use('/api/jobwork', jobworkRouter);
app.use('/api/gold-rates', goldRatesRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/advances', advancesRouter);
app.use('/api/girvi', girviRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/employees', employeesRouter);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
