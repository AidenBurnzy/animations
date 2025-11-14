#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const args = new Set(process.argv.slice(2));
const skipInsert = args.has('--skip-insert');

async function main() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL is missing. Populate it in .env.local or your environment.');
    }

    const sql = neon(databaseUrl);

    await sql`
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            service VARCHAR(255) NOT NULL,
            timeline VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;

    console.log('Ensured contact_submissions table exists.');

    if (skipInsert) {
        console.log('Skipped test insert. Pass no flags to verify inserts.');
        return;
    }

    const marker = crypto.randomUUID();

    const [inserted] = await sql`
        INSERT INTO contact_submissions (name, email, company, phone, service, timeline, message)
        VALUES ('Test User', 'test@example.com', 'Neon Check', '+10000000000', 'Web', 'ASAP', ${`Health check ${marker}`})
        RETURNING id
    `;

    console.log(`Inserted test row with id ${inserted.id}. Cleaning up...`);

    await sql`
        DELETE FROM contact_submissions
        WHERE id = ${inserted.id}
    `;

    console.log('Test insert removed. Neon connectivity verified.');
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
