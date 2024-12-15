import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import userTable from './user';

const sessionTable = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export default sessionTable;
