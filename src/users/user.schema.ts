import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserType {
  CUSTOMER = 'customer',
  STAFF = 'staff',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: String, enum: UserType, default: UserType.CUSTOMER })
  userType: UserType;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Optional reference to primary store (for staff members)
  @Prop({ type: Types.ObjectId, ref: 'Store' })
  primaryStoreId?: Types.ObjectId;

  // Optional reference to organization (for staff members)
  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  // Virtual field for roles - populated from UserRole collection
  roles?: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual for roles relationship
UserSchema.virtual('userRoles', {
  ref: 'UserRole',
  localField: '_id',
  foreignField: 'userId',
});
