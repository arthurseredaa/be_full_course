import { Body, Injectable, NotFoundException } from '@nestjs/common';
import {CreateTodoDto} from './dto/create-todo.dto.js';
import {UpdateTodoDto} from './dto/update-todo.dto.js';
import {DatabaseService} from "../database/database.service.js";
import {todosTable} from "../database/schema/todos.schema.js";
import {eq} from "drizzle-orm";

@Injectable()
export class TodosService {
    constructor(private readonly databaseService: DatabaseService) {
    }

    create(createTodoDto: CreateTodoDto) {
        return this.databaseService.db.insert(todosTable).values({
            title: createTodoDto.title,
            userId: 'eaeee260-dacf-4cf1-93aa-e618935c9532',
        }).returning({
            id: todosTable.id
        })
    }

    findAll() {
        return this.databaseService.db.select().from(todosTable);
    }

    async findOne(id: string) {
        const result = await this.databaseService.db.select().from(todosTable).where(eq(todosTable.id, id))

      if (result.length === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }

      return result[0];
    }

    async update(id: string, updateTodoDto: UpdateTodoDto) {
        const result = await this.databaseService.db.update(todosTable).set({
          completed: updateTodoDto.completed,
        }).where(eq(todosTable.id, id)).returning({
          id: todosTable.id,
        })

      if (result.length === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }

      return result[0];
    }

    async remove(id: string) {
        const result = await this.databaseService.db.delete(todosTable).where(eq(todosTable.id, id)).returning({
            id: todosTable.id
        });

        if (result.length === 0) {
          throw new NotFoundException(`Todo with id ${id} not found`);
        }

        return result[0];
    }
}
