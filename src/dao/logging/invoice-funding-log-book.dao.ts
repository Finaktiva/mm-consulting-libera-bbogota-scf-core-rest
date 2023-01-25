import { InvoiceFundingLogBook } from "entities/logging/invoice-funding-log-book";
import { Connection, ObjectID } from "typeorm";
import { getLiberaLoggingConnection } from "commons/libera-logging-connection";
import { FundingLogBook } from "entities/logging/funding-log-book";


export class InvoiceFundingLogBookDAO {

    static async saveFundingLogBook(invoiceFundingLogBook: InvoiceFundingLogBook) {
        console.log('DAO: Starting saveFundingLogBook');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        await manager.save(invoiceFundingLogBook);
        console.log('DAO: Ending saveFundingLogBook');
    }
    
    static async getInvoiceFundingLogBook(invoiceId: number, fundingRequestId: number) {
        console.log('DAO: Starting getDiscountNegotiationLogBook method');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const invoiceFundingLogBook = await manager.findOne(InvoiceFundingLogBook, { invoiceId, fundingRequestId})
        console.log('DAO: Ending getDiscountNegotiationLogBook method');
        return invoiceFundingLogBook;
    }

    static async updateInvoiceFundigLogBook(invoiceId: number, negotiationId: number, logBook: FundingLogBook[] ) {
        console.log('DAO: Starting updateInvoiceNegotiation');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const logbook = await manager.update(InvoiceFundingLogBook, { invoiceId, negotiationId}, {logBook});
        console.log('DAO: Ending updateInvoiceFundigLogBook');
        return logbook;
    }

}