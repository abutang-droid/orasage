import { pgTable, serial, varchar, text, timestamp, integer, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nickname: varchar('nickname', { length: 100 }),
  avatarUrl: text('avatar_url'),
  birthDate: varchar('birth_date', { length: 20 }),
  birthHour: integer('birth_hour'),
  birthPlaceProvince: varchar('birth_place_province', { length: 100 }),
  birthPlaceCity: varchar('birth_place_city', { length: 100 }),
  birthplaceLongitude: real('birthplace_longitude'),
  gender: varchar('gender', { length: 20 }),
  preferredDeity: varchar('preferred_deity', { length: 100 }),
  languagePreference: varchar('language_preference', { length: 10 }).default('zh-CN'),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastSignedIn: timestamp('last_signed_in'),
});

export type User = typeof users.$inferSelect;
