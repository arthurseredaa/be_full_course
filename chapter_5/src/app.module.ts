import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'node:path';
import {TodosModule} from './todos/todos.module.js';
import {AuthModule} from './auth/auth.module.js';
import {DatabaseModule} from "./database/database.module.js";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ServeStaticModule.forRoot({rootPath: join(import.meta.dirname, '..', 'public')}),
        TodosModule,
        AuthModule,
        DatabaseModule
    ],
})
export class AppModule {
}

