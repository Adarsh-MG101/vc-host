import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSession extends Document {
  userId: mongoose.Types.ObjectId;
  loginTime: Date;
  logoutTime?: Date;
  duration?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'active' | 'completed' | 'timeout';
  createdAt: Date;
}

const AdminSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    duration: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['active', 'completed', 'timeout'], default: 'active' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// Index for reporting
AdminSessionSchema.index({ userId: 1, loginTime: -1 });

export default mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
