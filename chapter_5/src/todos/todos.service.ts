import { Injectable, NotFoundException } from '@nestjs/common';
import {CreateTodoDto} from './dto/create-todo.dto.js';
import {UpdateTodoDto} from './dto/update-todo.dto.js';
import {DatabaseService} from "../database/database.service.js";
import {todosTable} from "../database/schema/todos.schema.js";
import {and, eq} from "drizzle-orm";

@Injectable()
export class TodosService {
    constructor(private readonly databaseService: DatabaseService) {
    }

    create(userId: string, todo: CreateTodoDto) {
        return this.databaseService.db
          .insert(todosTable)
          .values({
            title: todo.title,
            userId,
          })
          .returning({
            id: todosTable.id,
          });
    }

    findAll(userId: string) {
        return this.databaseService.db.select().from(todosTable).where(eq(todosTable.userId, userId));
    }

    async findOne(userId: string, id: string) {
        const result = await this.databaseService.db
          .select()
          .from(todosTable)
          .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)));

      if (result.length === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }

      return result[0];
    }

    async update(userId: string, id: string, todo: UpdateTodoDto) {
        const result = await this.databaseService.db
          .update(todosTable)
          .set({
            completed: todo.completed,
          })
          .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
          .returning({
            id: todosTable.id,
          });

      if (result.length === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }

      return result[0];
    }

    async remove(userId: string, id: string) {
        const result = await this.databaseService.db
          .delete(todosTable)
          .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
          .returning({
            id: todosTable.id
          });

        if (result.length === 0) {
          throw new NotFoundException(`Todo with id ${id} not found`);
        }

        return result[0];
    }
}
