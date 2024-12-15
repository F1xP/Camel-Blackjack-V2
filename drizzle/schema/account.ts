import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import userTable from './user';

const accountTable = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .unique(),

  discordId: varchar('discord_id', { length: 255 }).unique(),
  discordUsername: varchar('discord_username', { length: 255 }),
  discordEmail: varchar('discord__email', { length: 255 }),

  googleId: varchar('google_id', { length: 255 }).unique(),
  googleUsername: varchar('google_username', { length: 255 }),
  googleEmail: varchar('google_email', { length: 255 }),

  githubId: varchar('github_id', { length: 255 }).unique(),
  githubUsername: varchar('github_username', { length: 255 }),

  xId: varchar('x_id', { length: 255 }).unique(),
  xUsername: varchar('x_username', { length: 255 }),

  dribbbleId: varchar('dribbble_id', { length: 255 }).unique(),
  dribbbleUsername: varchar('dribbble_username', { length: 255 }),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export const accountTableRelations = relations(accountTable, ({ one, many }) => {
  return {
    user: one(userTable, {
      fields: [accountTable.userId],
      references: [userTable.id],
    }),
  };
});

export default accountTable;
