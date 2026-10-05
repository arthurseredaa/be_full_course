import {Module} from '@nestjs/common';
import {TodosService} from './todos.service.js';
import {TodosController} from './todos.controller.js';
import {DatabaseModule} from "../database/database.module.js";

@Module({
    controllers: [TodosController],
    providers: [TodosService],
    imports: [DatabaseModule]
})
export class TodosModule {
}
