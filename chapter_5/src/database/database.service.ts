import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {drizzle, NodePgDatabase} from 'drizzle-orm/node-postgres';
import {Pool} from "pg";

type DB = NodePgDatabase & { $client: Pool }

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);
    public db: DB;

    constructor(private readonly configService: ConfigService) {
    }

    async onModuleInit() {
        const connectionString = this.configService.get<string>('DATABASE_URL');

        if (!connectionString) {
            throw new Error('Missing DATABASE_URL environment variable');
        }

        this.db = drizzle(connectionString);

        try {
            await this.ping();
        } catch (error: unknown) {
            this.logger.error(error);
            throw error;
        }
    }

    async ping(): Promise<void> {
        await this.db.$client.query('select 1');
    }

    async onModuleDestroy() {
        await this.db.$client.end();

        this.logger.log('Connection is closed')
    }
}
