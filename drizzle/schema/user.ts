import { relations } from 'drizzle-orm';
import { numeric, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { roleEnum } from './db-enums';
import accountTable from './account';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

const userTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: varchar('name', { length: 39 }).notNull(),
  hashedPassword: varchar('hashed_password', { length: 255 }).notNull(),
  passwordSalt: varchar('password_salt', { length: 255 }).notNull(),
  bio: text('bio'),
  role: text('role', { enum: roleEnum }).default('Default').notNull(),
  balance: numeric('balance', { precision: 10, scale: 2 }).notNull().default('1000'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userTableRelations = relations(userTable, ({ one, many }) => {
  return {
    account: one(accountTable),
  };
});

const baseSchema = createInsertSchema(userTable).extend({
  name: z
    .string()
    .min(1, 'Required')
    .min(3, 'Name must be at least 3 characters long')
    .max(39, 'Name cannot exceed 39 characters'),
  email: z
    .string()
    .min(1, 'Required')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address.'),
  bio: z.string().max(149, 'Bio cannot exceed 149 characters').optional().or(z.literal('')),
  password: z
    .string()
    .min(1, 'Required')
    .min(8, 'Password must be at least 8 characters long')
    .max(39, 'Password cannot exceed 39 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Required')
    .min(8, 'Password Confirmation must be at least 8 characters long')
    .max(39, 'Password Confirmation cannot exceed 39 characters'),
  currentPassword: z
    .string()
    .min(1, 'Required')
    .min(8, 'Password must be at least 8 characters long')
    .max(39, 'Password cannot exceed 39 characters'),
  newPassword: z
    .string()
    .min(1, 'Required')
    .min(8, 'New Password must be at least 8 characters long')
    .max(39, 'New Password cannot exceed 39 characters'),
  confirmNewPassword: z
    .string()
    .min(1, 'Required')
    .min(8, 'Confirm New Password must be at least 8 characters long')
    .max(39, 'Confirm New Password cannot exceed 39 characters'),
  image: z
    .custom<File | undefined>()
    .refine((file) => !file || (file instanceof File && file.type.startsWith('image/')), {
      message: 'Must be an image file',
    })
    .refine((file) => !file || file.size < 1024 * 1024 * 2, { message: 'Image must be less than 2MB' }),
});

export const CreateUserSchema = z
  .object({
    name: baseSchema.shape.name,
    email: baseSchema.shape.email,
    password: baseSchema.shape.password,
    confirmPassword: baseSchema.shape.confirmPassword,
    image: baseSchema.shape.image,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const UpdatePasswordSchema = z
  .object({
    currentPassword: baseSchema.shape.currentPassword,
    newPassword: baseSchema.shape.newPassword,
    confirmNewPassword: baseSchema.shape.confirmNewPassword,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export const SignInSchema = z.object({
  email: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

export default userTable;
