import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgOtp extends Document {
  organization: mongoose.Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  usedAt?: Date;
  createdAt: Date;
}

const OrgOtpSchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IOrgOtp>('OrgOtp', OrgOtpSchema);