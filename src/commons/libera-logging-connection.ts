import { Connection, createConnection } from 'typeorm';
import { DiscountNegotiationsLogBook } from 'entities/logging/discount-negotiations-log-book';
import { InvoiceFundingLogBook } from 'entities/logging/invoice-funding-log-book';
import { EnterpriseRecodLogBook } from 'entities/logging/enterprise-record-log-book';

const host: string = process.env.DB_LL_HOST;
const port: number = +process.env.DB_LL_PORT;
const username: string = process.env.DB_LL_USER;
const password: string = process.env.DB_LL_PASSWORD;
const database: string = process.env.DB_LL_NAME;
let liberaLoggingConnection: Connection = null;

export async function getLiberaLoggingConnection() {
    if (!liberaLoggingConnection || !liberaLoggingConnection.isConnected) {
        liberaLoggingConnection = await createConnection({
            type: 'mongodb',
            name: 'liberalogging',
            host,
            port,
            database,
            username,
            password,
            entities: [
                DiscountNegotiationsLogBook,
                InvoiceFundingLogBook,
                EnterpriseRecodLogBook
            ],
            synchronize: false
        })
    }

    console.log('connected');
    return liberaLoggingConnection;
}