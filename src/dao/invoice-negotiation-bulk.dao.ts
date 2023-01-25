import { IFilterBasic } from "commons/interfaces/query-filters.interface";
import { getConnection } from "commons/connection";
import { EnterpriseInvoiceBulkNegotiation } from "entities/enterprise-invoice-bulk-negotiation";
import { Connection } from "typeorm";
import { InvoiceNegotiationProcess } from "entities/enterprise-invoice-negotiation-process";

export class InvoiceNegotiationBulkDAO {

    static async getAllPayerBulkDiscountNegotiations(enterpriseId: number, filter:IFilterBasic):Promise<[EnterpriseInvoiceBulkNegotiation[], number]>{
        console.log('DAO: Starting getAllPayerBulkDiscountNegotiations method');
        await getConnection();
        const negotiations = await EnterpriseInvoiceBulkNegotiation.getAllPayerBulkDiscountNegotiations(enterpriseId, filter);
        console.log('DAO: Ending getAllPayerBulkDiscountNegotiations method');
        return negotiations;
    }

    static async saveBulkNegotiation(bulkNegotiation: EnterpriseInvoiceBulkNegotiation):
        Promise<EnterpriseInvoiceBulkNegotiation> {
        console.log('DAO: Starting saveBulkNegotiation');
        await getConnection();
        const saveBulkNegotiation = await EnterpriseInvoiceBulkNegotiation.save(bulkNegotiation);
        console.log('DAO: Ending saveBulkNegotiation');
        return saveBulkNegotiation;
    }
    
    static async getInvoiceBulkNegotiationsById(enterpriseId: number, bulkNegotiationId: number):
        Promise<EnterpriseInvoiceBulkNegotiation> {
        console.log('DAO: Starting getInvoiceBulkNegotiationsAndOrderBy...');
        await getConnection();
        const bulkNegotiations = await EnterpriseInvoiceBulkNegotiation
            .getInvoiceBulkNegotiationsById(enterpriseId, bulkNegotiationId);
        console.log('DAO: Ending getInvoiceBulkNegotiationsAndOrderBy...');
        return bulkNegotiations;
    }

    static async deleteNegotiationBulk(negotiationBulk: EnterpriseInvoiceBulkNegotiation ) {
        console.log('DAO: Starting deleteNegotiationBulk...');
        await getConnection();
        await negotiationBulk.remove();
        console.log('DAO: Ending deleteNegotiationBulk...');

    }
   
    static async getAllByProviderEnterpriseIdAndFilters(enterpriseId: number, filter: IFilterBasic):
        Promise<[EnterpriseInvoiceBulkNegotiation[], number]>{
        console.log('DAO: Starting getAllByProviderEnterpriseIdAndFilters function...');
        await getConnection();
        const bulkNegotiations = await EnterpriseInvoiceBulkNegotiation
            .getAllByProviderEnterpriseIdAndFilters(enterpriseId, filter);
        console.log('DAO: Endig getAllByProviderEnterpriseIdAndFilters function...');
        return bulkNegotiations;
    }

    static async getByIdAndEnterpriseId(bulkNegotiationId: number, enterpriseId: number){
        console.log('DAO: Starting getByIdAndEnterpriseId...');
        await getConnection();
        const bulkNegotiation = await EnterpriseInvoiceBulkNegotiation.getByIdAndEnterpriseId(bulkNegotiationId, enterpriseId);
        console.log('DAO: Ending getByIdAndEnterpriseId...');
        return bulkNegotiation;
    }

    static async getById(bulkNegotiationId: number): Promise<EnterpriseInvoiceBulkNegotiation>{
        console.log(`DAO: Starting getById function`);
        console.log(`bulkNegotiationId received: ${bulkNegotiationId}`);
        await getConnection();
        console.log(`DAO: Ending getById function`);
        return await EnterpriseInvoiceBulkNegotiation.getById(bulkNegotiationId);
    }

    static async updateInvoiceBulkNegotiation(bulkNegotiation: EnterpriseInvoiceBulkNegotiation){
        console.log('DAO: Starting updateInvoiceBulkNegotiation');
        const connection:Connection = await getConnection();
        await connection.getRepository(InvoiceNegotiationProcess).update(bulkNegotiation.invoiceNegotiationProcess.negotiationProcess, bulkNegotiation.invoiceNegotiationProcess);
        console.log('DAO: Ending updateInvoiceBulkNegotiation');
    }

    static async getBasicDataBulkNegotiationById(enterpriseId: number, bulkNegotiationId: number):Promise<EnterpriseInvoiceBulkNegotiation> {
        console.log('DAO: Starting getBasicDataBulkNegotiationById...');
        await getConnection();
        const bulkNegotiation = await EnterpriseInvoiceBulkNegotiation
            .getBasicDataBulkNegotiationById(enterpriseId, bulkNegotiationId);
        console.log('DAO: Ending getBasicDataBulkNegotiationById...');
        return bulkNegotiation;
    }

    static async getBasicDataBulkNegotiationByProviderId(enterpriseId: number, bulkNegotiationId: number):Promise<EnterpriseInvoiceBulkNegotiation> {
        console.log('DAO: Starting getBasicDataBulkNegotiationById...');
        await getConnection();
        const bulkNegotiation = await EnterpriseInvoiceBulkNegotiation
            .getBasicDataBulkNegotiationByProviderId(enterpriseId, bulkNegotiationId);
        console.log('DAO: Ending getBasicDataBulkNegotiationById...');
        return bulkNegotiation;
    }
}