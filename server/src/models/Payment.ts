import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayment extends Document {
  loanId: Types.ObjectId;
  borrowerId: Types.ObjectId;
  amount: number;
  utr: string;
  paymentDate: Date;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    borrowerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    utr: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ utr: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
