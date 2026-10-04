import type {Config} from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
}

export default {
    schema: './src/database/schema/*.schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: connectionString,
    },
} satisfies Config;