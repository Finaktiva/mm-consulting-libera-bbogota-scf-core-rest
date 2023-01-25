import { Connection, ObjectID } from 'typeorm';
import { getLiberaLoggingConnection } from 'commons/libera-logging-connection';
import { DiscountNegotiationsLogBook } from 'entities/logging/discount-negotiations-log-book';
import { LogBook } from 'entities/logging/log-book';

export class DiscountNegotiationsLogBookDAO {

    static async getDiscountNegotiationLogBook(invoiceId: number, negotiationId: number) {
        console.log('DAO: Starting getDiscountNegotiationLogBook method');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const discountNegotiationsLogBook = await manager.findOne(DiscountNegotiationsLogBook, { invoiceId, negotiationId})
        console.log('DAO: Ending getDiscountNegotiationLogBook method');
        return discountNegotiationsLogBook;
    }

    static async saveInvoiceNegotiationRecord(logBook: LogBook[] ){
        console.log('DAO: Starting saveInvoiceNegotiationRecord method');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const discountNegotiationsLogBook = await manager.save(logBook)
        console.log('DAO: Ending saveInvoiceNegotiationRecord method');
        return discountNegotiationsLogBook;
    }

    static async saveInvoiceNegotiation(discountNegotiationsLogBook: DiscountNegotiationsLogBook) {
        console.log('DAO: Starting saveInvoiceNegotiation');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const logbook = await manager.save(discountNegotiationsLogBook);
        console.log('DAO: Ending saveInvoiceNegotiation');
        return logbook;
    }

    static async updateInvoiceNegotiationLogBook(invoiceId: number, negotiationId: number, logBook: LogBook[] ) {
        console.log('DAO: Starting updateInvoiceNegotiation');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const logbook = await manager.update(DiscountNegotiationsLogBook, { invoiceId, negotiationId}, {logBook});
        console.log('DAO: Ending updateInvoiceNegotiation');
        return logbook;
    }
}