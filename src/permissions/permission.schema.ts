import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionScope {
  SYSTEM = 'system',
  ORGANIZATION = 'organization',
  STORE = 'store',
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  resource: string; // e.g., 'orders', 'products', 'users'

  @Prop({ type: String, enum: PermissionAction, required: true })
  action: PermissionAction;

  @Prop({ type: String, enum: PermissionScope, required: true })
  scope: PermissionScope;

  @Prop()
  description: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Create compound index for uniqueness
PermissionSchema.index({ resource: 1, action: 1, scope: 1 }, { unique: true });
