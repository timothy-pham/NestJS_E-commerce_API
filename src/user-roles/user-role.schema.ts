import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PermissionScope } from '../permissions/permission.schema';

export type UserRoleDocument = UserRole & Document;

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  @Prop({ type: String, enum: PermissionScope, required: true })
  scope: PermissionScope;

  @Prop({ type: Types.ObjectId, refPath: 'scopeModel' })
  scopeId: Types.ObjectId; // organizationId or storeId

  @Prop({ type: String, enum: ['Organization', 'Store'] })
  scopeModel: string; // For dynamic reference

  @Prop({ default: true })
  isActive: boolean;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

// Create compound index for uniqueness - a user can only have one specific role per scope
UserRoleSchema.index({ userId: 1, roleId: 1, scope: 1, scopeId: 1 }, { unique: true });
