import { Connection } from "typeorm";
import { getLiberaLoggingConnection } from "commons/libera-logging-connection";
import { EnterpriseRecodLogBook } from "entities/logging/enterprise-record-log-book";


export class EnterpriseLogBookDAO {

    static async getEnterpriseRecordById(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseRecordById');
        const connection : Connection = await getLiberaLoggingConnection();
        const manager = connection.manager;
        const record = await manager.find(EnterpriseRecodLogBook, { enterpriseId })
        console.log('DAO: Ending getEnterpriseRecordById');
        return record;
    }
}