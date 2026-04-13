import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  organization: mongoose.Types.ObjectId;
  template: mongoose.Types.ObjectId;
  uniqueId: string;
  data: Record<string, any>;
  filePath: string;
  verificationUrl: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    template: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    uniqueId: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Map, of: Schema.Types.Mixed, required: true },
    filePath: { type: String, required: true },
    verificationUrl: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', DocumentSchema);