import { Schema, model, Document } from 'mongoose';

function getElapsedMonthsAndDays(dateStr: string) {
  if (!dateStr) return { months: 0, days: 0 };
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (now.getTime() <= start.getTime()) return { months: 0, days: 0 };

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  return { months, days };
}

interface IItem {
  id?: string;
  itemType: string;
  itemCategory?: string;
  itemDescription: string;
  grossWeight: number;
  netWeight: number;
  purity: string;
  marketValue?: number;
}

export interface IGirvi extends Document {
  date: string;
  loanNo: string;
  customerName: string;
  customerMobile: string;
  customerMobile2?: string;
  customerAddress?: string;
  items?: IItem[];
  itemType?: string;
  itemCategory?: string;
  itemDescription?: string;
  grossWeight?: number;
  netWeight?: number;
  purity?: string;
  marketValue?: number;
  loanAmount: number;
  interestPct: number;
  documentType?: string;
  documentNumber?: string;
  imageUrl?: string;
  dueDate?: string;
  status: string;
  forwardedTo?: string;
  forwardedShopName?: string;
  forwardedShopGstNo?: string;
  forwardedShopAddress?: string;
  forwardedDate?: string;
  forwardedAmount?: number;
  forwardedInterestPct?: number;
  isForwardedSettled?: boolean;
  forwardedSettledDate?: string;
  forwardedSettledInterest?: number;
  forwardedImageUrl?: string;
  customerSignature?: string;
  authorizedSignatory?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateInterestAmount(): number;
  calculateForwardedInterestAmount(): number;
}

const girviSchema = new Schema<IGirvi>(
  {
    date: { type: String, required: true },
    loanNo: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerMobile2: { type: String },
    customerAddress: { type: String },
    items: [{
      id: { type: String },
      itemType: { type: String, required: true },
      itemCategory: { type: String },
      itemDescription: { type: String, required: true },
      grossWeight: { type: Number, required: true },
      netWeight: { type: Number, required: true },
      purity: { type: String, required: true },
      marketValue: { type: Number },
    }],
    itemType: { type: String },
    itemCategory: { type: String },
    itemDescription: { type: String },
    grossWeight: { type: Number },
    netWeight: { type: Number },
    purity: { type: String },
    marketValue: { type: Number },
    loanAmount: { type: Number, required: true },
    interestPct: { type: Number, required: true },
    documentType: { type: String },
    documentNumber: { type: String },
    imageUrl: { type: String },
    dueDate: { type: String },
    status: { type: String, required: true, default: 'Active' },
    forwardedTo: { type: String },
    forwardedShopName: { type: String },
    forwardedShopGstNo: { type: String },
    forwardedShopAddress: { type: String },
    forwardedDate: { type: String },
    forwardedAmount: { type: Number },
    forwardedInterestPct: { type: Number },
    isForwardedSettled: { type: Boolean },
    forwardedSettledDate: { type: String },
    forwardedSettledInterest: { type: Number },
    forwardedImageUrl: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
    note: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

girviSchema.methods.calculateInterestAmount = function () {
  const principal = this.loanAmount || 0;
  const monthlyRatePct = this.interestPct || 0;
  if (!this.date || !principal || !monthlyRatePct) return 0;

  const { months, days } = getElapsedMonthsAndDays(this.date);
  const monthlyRate = monthlyRatePct / 100;

  // Rule: Simple interest for the first 12 months.
  if (months < 12) {
    const simpleInterest = principal * monthlyRate * months;
    const dailyInterest = (principal * monthlyRate * days) / 30;
    return Math.round(simpleInterest + dailyInterest);
  } else {
    // Rule: Calculate interest for the first 12 months (simple).
    const interestAfter12Months = principal * monthlyRate * 12;
    const principalAfter12Months = principal + interestAfter12Months;
    // Rule: Calculate compound interest for the remaining full months.
    const remainingMonths = months - 12;
    const amountAfterCompounding = principalAfter12Months * Math.pow(1 + monthlyRate, remainingMonths);
    const compoundInterest = amountAfterCompounding - principalAfter12Months;
    // Rule: Calculate simple interest for the remaining days on the latest principal.
    const dailyInterest = (amountAfterCompounding * monthlyRate * days) / 30;
    // Rule: Sum all parts and round the final result.
    return Math.round(interestAfter12Months + compoundInterest + dailyInterest);
  }
};

girviSchema.methods.calculateForwardedInterestAmount = function () {
  const P = this.forwardedAmount || 0;
  const monthlyRatePct = this.forwardedInterestPct || this.interestPct || 0;
  const startDate = this.forwardedDate || this.date;
  if (!startDate || !P || !monthlyRatePct) return 0;

  const { months, days } = getElapsedMonthsAndDays(startDate);
  const monthlyRate = monthlyRatePct / 100;

  if (months < 12) {
    const simpleInterest = P * monthlyRate * months;
    const dailyInterest = (P * monthlyRate * days) / 30;
    return Math.round(simpleInterest + dailyInterest);
  } else {
    const interestAfter12Months = P * monthlyRate * 12;
    const principalAfter12Months = P + interestAfter12Months;

    const remainingMonths = months - 12;
    const amountAfterCompounding = principalAfter12Months * Math.pow(1 + monthlyRate, remainingMonths);
    const compoundInterest = amountAfterCompounding - principalAfter12Months;

    const dailyInterest = (amountAfterCompounding * monthlyRate * days) / 30;

    return Math.round(interestAfter12Months + compoundInterest + dailyInterest);
  }
};

girviSchema.virtual('interestAmount').get(function () {
  return this.calculateInterestAmount();
});

girviSchema.virtual('forwardedInterestAmount').get(function () {
  return this.calculateForwardedInterestAmount();
});

girviSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Girvi = model<IGirvi>('Girvi', girviSchema);