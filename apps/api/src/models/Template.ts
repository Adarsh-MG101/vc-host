import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  organization: mongoose.Types.ObjectId;
  name: string;
  filePath: string;
  thumbnailPath?: string;
  placeholders: string[];
  enabled: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String },
    placeholders: [{ type: String }],
    enabled: { type: Boolean, default: true, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Compound index for organization + name
TemplateSchema.index({ organization: 1, name: 1 }, { unique: true });

export default mongoose.model<ITemplate>('Template', TemplateSchema);