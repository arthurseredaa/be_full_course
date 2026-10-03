import {Module} from '@nestjs/common';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'node:path';
import {TodosModule} from './todos/todos.module.js';
import {AuthModule} from './auth/auth.module.js';

@Module({
    imports: [
        ServeStaticModule.forRoot({rootPath: join(import.meta.dirname, '..', 'public')}),
        TodosModule,
        AuthModule
    ],
})
export class AppModule {
}

