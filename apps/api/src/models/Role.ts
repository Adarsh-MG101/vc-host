import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  organization: mongoose.Types.ObjectId;
  name: string;
  permissions: string[];
  isSystem: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// All granular permissions available in the system
export const ALL_PERMISSIONS = [
  'dashboard.view',
  'template.view',
  'template.add',
  'template.edit',
  'template.delete',
  'certificate.view',
  'certificate.generate',
  'certificate.send',
  'certificate.delete',
  'profile.update',
  'activity.view',
  'activity.export',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

const RoleSchema: Schema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    permissions: [{ type: String, enum: ALL_PERMISSIONS }],
    isSystem: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Unique role names per organization
RoleSchema.index({ organization: 1, name: 1 }, { unique: true });

export default mongoose.model<IRole>('Role', RoleSchema);
