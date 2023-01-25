import { getConnection } from 'commons/connection';
import { EnterpriseInvoiceBulk } from 'entities/enterprise-invoice-bulk';
import { SimpleFilter } from 'commons/filter';
import { EnterpriseInvoiceBulkStatus } from 'commons/enums/enterprise-invoice-bulk-status.enum';

export class EnterpriseInvoiceBulkDAO {

    static async saveInvoiceBulk(invoiceBulk: EnterpriseInvoiceBulk): Promise<EnterpriseInvoiceBulk> {
        console.log('DAO: Starting saveInvoiceBulk...');
        await getConnection();
        const createdInvoiceBulk = await invoiceBulk.save();
        console.log('DAO: Ending saveInvoiceBulk...');
        return createdInvoiceBulk;
    }

    static async deleteInvoiceBulk(invoiceBulk: EnterpriseInvoiceBulk) {
        console.log('DAO: Starting deleteInvoiceBulk...');
        await getConnection();
        await invoiceBulk.remove();
        console.log('DAO: Ending deleteInvoiceBulk...');
    }

    static async getAllByEnterpriseIdAndFilter(enterpriseId: number, filter: SimpleFilter) {
        console.log('DAO: Starting getAllByEnterpriseIdAndFilter method');
        await getConnection();
        const result = await EnterpriseInvoiceBulk.getAllByEnterpriseAndFilter(enterpriseId, filter);
        console.log('DAO: Ending getAllByEnterpriseIdAndFilter method');
        return result;
    }

    static async getById(invoiceBulkId: number) {
        console.log('DAO: Starting getById');
        await getConnection();
        const bulk = await EnterpriseInvoiceBulk.getBulkById(invoiceBulkId);
        console.log('DAO: Ending getById');
        return bulk;
    }

    static async getByInvoiceBulkIdAndEnterpriseId(invoiceBulkId: number, enterpriseId: number) {
        console.log('DAO: Starting getByInvoiceBulkId');
        await getConnection();
        const bulk = await EnterpriseInvoiceBulk.getByInvoiceBulkId(invoiceBulkId, enterpriseId);
        console.log('DAO: Ending getByInvoiceBulkId');
        return bulk;
    }

    static async saveSuccessfulLoadedCount(successfulLoadedCount: number, enterpriseInvoiceBulkId: number) {
        console.log('DAO: Starting saveSuccessfulLoadedCount');
        await getConnection();
        await EnterpriseInvoiceBulk.saveSuccessfulLoadedCount(successfulLoadedCount, enterpriseInvoiceBulkId)
        console.log('DAO: Ending saveSuccessfulLoadedCount');
    }

    static async updateInvoiceBulkStatus(enterpriseInvoiceBulkId: number, status: EnterpriseInvoiceBulkStatus) {
        console.log('DAO: Starting updateInvoiceBulkStatus method');
        await getConnection();
        await EnterpriseInvoiceBulk.updateInvoiceBulkStatus(enterpriseInvoiceBulkId, status)
        console.log('DAO: Ending updateInvoiceBulkStatus method');
    }
}