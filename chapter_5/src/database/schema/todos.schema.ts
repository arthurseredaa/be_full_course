import {boolean, index, snakeCase, text, uuid} from "drizzle-orm/pg-core";
import {userTable} from "./users.schema.js";

export const todosTable = snakeCase.table('todos', {
        id: uuid().primaryKey().defaultRandom(),
        title: text().notNull(),
        completed: boolean().notNull().default(false),
        userId: uuid().notNull().references(() => userTable.id, {
            onDelete: 'cascade'
        }),
    },
    (table) => [
        index('todos_user_id_idx').on(table.userId)
    ]);