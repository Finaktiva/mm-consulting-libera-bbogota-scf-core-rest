import { EnterpriseInvoice } from "entities/enterprise-invoice";
import { getConnection } from "commons/connection";
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";
import { EnterpriseInvoiceBulkNegotiation } from "entities/enterprise-invoice-bulk-negotiation";
import { CreateNewNegotiationBulk } from "commons/interfaces/payer-interfaces/create-new-negotiation-bulk";
import { UpdateNegotiationById } from "commons/interfaces/invoice-negotiation-process.interface";

export class EnterpriseInvoiceDAO {

    static async saveInvoice(enterpriseInvoice: EnterpriseInvoice){
        console.log('DAO: Starting saveInvoice method');
        await getConnection();
        const savedInvoice = await EnterpriseInvoice.save(enterpriseInvoice);
        console.log('DAO: Ending saveInvoice method');
        return savedInvoice;
    }
    
    static async getInvoiceById(enterpriseId: number, invoiceId: number) {
        console.log('DAO: Starting getInvoiceById method');
        await getConnection();
        const eInvoice = await EnterpriseInvoice.getInvoiceById(enterpriseId, invoiceId);
        console.log('DAO: Ending getInvoiceById method');
        return eInvoice;
    }
    
    static async getInvoiceByIdAndEnterpriseId(invoiceId: number, enterpriseId: number) {
        console.log('DAO: Starting getInvoiceByIdAndEnterpriseId');
        await getConnection();
        const invoice = await EnterpriseInvoice.getInvoiceByIdAndEnterpriseId(invoiceId, enterpriseId);
        console.log('DAO: Ending getInvoiceByIdAndEnterpriseId');
        return invoice;
    }

    static async getInvoiceByEnterpriseIdAndId(enterpriseId: number, invoiceId: number) {
        console.log('DAO: Starting getInvoiceByEnterpriseIdAndId');
        await getConnection();
        const invoice = await EnterpriseInvoice.getInvoiceByEnterpriseId(invoiceId, enterpriseId);
        console.log('DAO: Ending getInvoiceByEnterpriseIdAndId');
        return invoice;
    }

    static async getEnterpriseInvoiceById(invoiceId: number) {
        console.log('DAO: Starting getEnterpriseInvoiceById');
        const invoice = await EnterpriseInvoice.getEnterpriseInvoiceById(invoiceId);
        console.log('DAO: Ending getEnterpriseInvoiceById');
        return invoice;
    }

    static async updateInvoiceStatus(invoiceId: number, status: EnterpriseInvoiceStatusEnum){
        console.log('DAO: Starting updateInvoiceStatus method');
        await getConnection();
        const updateStatus = await EnterpriseInvoice.updateInvoiceStatus(invoiceId, status);
        console.log('DAO: Ending updateInvoiceStatus method');
        return updateStatus;
    }

    static async getInvoiceProviderById(enterpriseId: number, invoiceId: number) {
        console.log('DAO: Starting getInvoiceProviderById method');
        await getConnection();
        const eInvoice = await EnterpriseInvoice.getInvoiceProviderById(enterpriseId, invoiceId);
        console.log('DAO: Ending getInvoiceProviderById method');
        return eInvoice;
    }
    
    static async getInvoiceByIdAndStatus(invoiceId: number) {
        console.log('DAO: Starting getInvoiceByIdAndStatus');
        await getConnection();
        const invoice = await EnterpriseInvoice.getInvoiceWithStatus(invoiceId);
        console.log('DAO: Ending getInvoiceByIdAndStatus');
        return invoice;
    }

    static async rollbackInvoiceBulk(invoiceId: number) {
        console.log('DAO: Starting rollbackInvoiceBulk');
        await getConnection();
        await EnterpriseInvoice.deleteInvoiceOfBulk(invoiceId);
        console.log('DAO: Ending rollbackInvoiceBulk');
    }

    static async getByInvoiceNumber(enterpriseId: number, invoiceNumber: string) {
        console.log('DAO: Starting getByInvoiceNumber');
        await getConnection();
        const invoice = await EnterpriseInvoice.getByInvoiceNumber(enterpriseId, invoiceNumber);
        console.log('DAO: Ending getByInvoiceNumber');
        return invoice;
    }
    
    static async getProviderInvoicesByEnterpriseId(enterpriseId: number, params: any) {
        console.log('DAO: Starting getProviderInvoicesByEnterpriseId...');
        await getConnection();
        const invoices = await EnterpriseInvoice.getProviderInvoicesByEnterpriseId(enterpriseId, params);
        console.log('DAO: Ending getProviderInvoicesByEnterpriseId...');
        return invoices;
    }

    static async getByFundingId(enterpriseId: number, invoiceId: number) {
        console.log('DAO: Starting getByFundingId');
        await getConnection();
        const invoice = await EnterpriseInvoice.getByFundingId(enterpriseId, invoiceId);
        console.log('DAO: Ending getByFundingId');
        return invoice;
    }
    
    static async getBasicEnterpriseInvoice(invoiceId: number, enterpriseId: number) {
        console.log('DAO: Starting getBasicEnterpriseInvoice');
        await getConnection();
        const eInvoice = await EnterpriseInvoice.getBasicEnterpriseInvoice(invoiceId, enterpriseId);
        console.log('DAO: ending getBasicEnterpriseInvoice');
        return eInvoice;
    }

    static async updateInvoiceCurrentAmount(invoiceId: number, currentAmount: number){
        console.log('DAO: Starting updateInvoiceCurrentAmount method');
        await getConnection();
        await EnterpriseInvoice.updateInvoiceCurrentAmount(invoiceId, currentAmount);
        console.log('DAO: Ending updateInvoiceCurrentAmount method');
    }
    
    static async getInvoiceByEnterpriseAndIdAvailable(invoiceId: number, enterpriseId: number) {
        console.log('DAO: Starting getInvoiceByEnterpriseAndId');
        await getConnection();
        const eInvoice = await EnterpriseInvoice.getInvoiceAvailableWithIdAndEnterpriseId(invoiceId, enterpriseId);
        console.log('DAO: Ending getInvoiceByEnterpriseAndId');
        return eInvoice;
    }

    static async getTotalInvoicesLoadedByEnterpriseInvoiceBulkId(enterpriseInvoiceBulkId: number) {
        console.log('DAO: Starting getTotalInvoicesLoaded method');
        await getConnection();
        const total = await EnterpriseInvoice.getTotalInvoicesLoadedByEnterpriseInvoiceBulkId(enterpriseInvoiceBulkId);
        console.log('DAO: Starting getTotalInvoicesLoaded method');
        return total;
    }

    static async getTotalAmount (invoicesId: number[]) {
        console.log('DAO: Starting getTotalAmount method');
        await getConnection();
        const sum = await EnterpriseInvoice.getTotalAmount(invoicesId);
        console.log('DAO: Ending getTotalAmount method');
        return sum;
    }

    static async getNBulkInvoices(invoicesId: number[], enterpriseId: number):Promise<EnterpriseInvoice[]> {
        console.log(('DAO: Starting getNBulkInvoices method'));
        await getConnection();
        const invoices = await EnterpriseInvoice.getNBulkInvoices(invoicesId, enterpriseId);
        console.log(('DAO: Ending getNBulkInvoices method'));
        return invoices; 
    }

    static async getDiffCurrencyCode (invoicesId: number[]) {
        console.log(('DAO: Starting getDiffCurrencyCode method'));
        await getConnection();
        const invoices = await EnterpriseInvoice.getDiffCurrencyCode(invoicesId);
        console.log(('DAO: Ending getDiffCurrencyCode method'));
        return invoices; 
    }

    static async getCurrencyCode (invoicesId: number[]):Promise<EnterpriseInvoice> {
        console.log(('DAO: Starting getCurrencyCode method'));
        await getConnection();
        const currency = await EnterpriseInvoice.getCurrencyCode(invoicesId);
        console.log(('DAO: Ending getCurrencyCode method'));
        return currency; 
    }

    static async updateInvoicesBulkNegotiations( data:CreateNewNegotiationBulk, invoices: EnterpriseInvoice[], saveNewBulkNegotiation: EnterpriseInvoiceBulkNegotiation){
        console.log('DAO: Starting updateInvoicesBulkNegotiations method');
        await getConnection();
        await EnterpriseInvoice.updateInvoicesBulkNegotiations(data, invoices, saveNewBulkNegotiation);
        console.log('DAO: Ending updateInvoicesBulkNegotiations method');
    }

    static async rollbackInvoiceBulkNegotiations(invoicesId: number[]) {
        console.log('DAO: Starting rollbackInvoiceBulkNegotiations method');
        await getConnection();
        await EnterpriseInvoice.rollbackInvoiceBulkNegotiations(invoicesId);
        console.log('DAO: Ending rollbackInvoiceBulkNegotiations method');
    }

    static async UpdateBulkInvoicesCurrentAmount(data: UpdateNegotiationById, invoices: EnterpriseInvoice[]) {
        console.log('DAO: Starting UpdateBulkNegotiationById method');
        await getConnection();
        await EnterpriseInvoice.UpdateBulkInvoicesStatus(data, invoices);
        console.log('DAO: Ending UpdateBulkNegotiationById method');
    }

    static async getInvoicesByBulkId(bulkNegotiationId:number):Promise<EnterpriseInvoice[]> {
        console.log('DAO: Starting getInvoicesByBulkId...');
        await getConnection();
        const invoices = await EnterpriseInvoice.getInvoicesByBulkId(bulkNegotiationId);
        console.log('DAO: Ending getInvoicesByBulkId...');
        return invoices;
    }
    static async updateInvoiceCurrentExpectedPaymentDate(invoiceId: number, providerId: number, currentExpectedPaymentDate: Date){
        console.log('DAO: Starting updateInvoiceCurrentExpectedPaymentDate method');
        await getConnection();
        const updateStatus = await EnterpriseInvoice.updateInvoiceCurrentExpectedPaymentDate(invoiceId, providerId, currentExpectedPaymentDate);
        console.log('DAO: Ending updateInvoiceCurrentExpectedPaymentDate method');
        return updateStatus;
    }
}
