import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {TodosService} from './todos.service.js';
import {CreateTodoDto} from './dto/create-todo.dto.js';
import {UpdateTodoDto} from './dto/update-todo.dto.js';
import {AuthGuard, type JwtPayload} from '../auth/auth.guard.js';
import {User} from '../auth/user.decorator.js';

@Controller('todos')
@UseGuards(AuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@User() user: JwtPayload, @Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(user.id, createTodoDto);
  }

  @Get()
  findAll(@User() user: JwtPayload) {
    return this.todosService.findAll(user.id);
  }

  @Get(':id')
  findOne(@User() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.todosService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @User() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(user.id, id, updateTodoDto);
  }

  @Delete(':id')
  remove(@User() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.todosService.remove(user.id, id);
  }
}
