import { Connection, ObjectID } from 'typeorm';
import { getLiberaLoggingConnection } from 'commons/libera-logging-connection';
import { DiscountNegotiationsLogBook } from 'entities/logging/discount-negotiations-log-book';
import { LogBook } from 'entities/logging/log-book';
import { EnterpriseRecodLogBook } from 'entities/logging/enterprise-record-log-book';
import { EnterpriseLogBook } from 'entities/logging/enterprise-log-book';

export class EnterpriseRecordLogBookDAO {

    static async getenterpriseRecordLogBook(enterpriseId: number,) {
        console.log('DAO: Starting getEnterpriseRecord method');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const discountNegotiationsLogBook = await manager.findOne(EnterpriseRecodLogBook, { enterpriseId })
        console.log('DAO: Ending getEnterpriseRecord method');
        return discountNegotiationsLogBook;
    }

    static async saveEnterpriseRecord(enterpriseRecodLogBook: EnterpriseRecodLogBook) {
        console.log('DAO: Starting save enterpriseRecord');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const logbook = await manager.save(enterpriseRecodLogBook);
        console.log('DAO: Ending enterpriseRecord');
        return logbook;
    }

    static async updateEnterpriseRecordLogBook(enterpriseId, logBook: EnterpriseLogBook[] ) {
        console.log('DAO: Starting updateInvoiceNegotiation');
        let connection: Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const logbook = await manager.update(EnterpriseRecodLogBook, { enterpriseId }, {logBook});
        console.log('DAO: Ending updateInvoiceNegotiation');
        return logbook;
    }
    
}