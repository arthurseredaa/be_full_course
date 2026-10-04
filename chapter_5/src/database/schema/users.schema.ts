import {snakeCase, text, timestamp, uuid} from "drizzle-orm/pg-core";

export const userTable = snakeCase.table('users', {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    password: text().notNull(),
    createdAt: timestamp({
        withTimezone: true,
    }).notNull().defaultNow(),
});