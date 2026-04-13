import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'user';
  orgRole?: 'owner' | 'admin' | 'member';
  organization?: mongoose.Types.ObjectId;
  customRole?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'user'], required: true },
    orgRole: { type: String, enum: ['owner', 'admin', 'member'] },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    customRole: { type: Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);