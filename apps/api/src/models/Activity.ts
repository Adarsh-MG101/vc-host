import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  organization?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for organization + createdAt for reporting
ActivitySchema.index({ organization: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);