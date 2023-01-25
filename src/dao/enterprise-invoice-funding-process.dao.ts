import { getConnection } from "commons/connection";
import { EnterpriseInvoiceFundingProcess } from "entities/enterprise-invoice-funding-process";
import { IFilterFundingRequest } from "commons/interfaces/query-filters.interface";
import { IQueryFilters } from "commons/interfaces/query-filters.interface";

export class EnterpriseInvoiceFundingProcessDAO {

    static async getInvoiceFundingProcessByEnterpriseId(enterpriseId: number, params: IFilterFundingRequest) {
        console.log('DAO: Starting getInvoiceFundingProcessByEnterpriseId method');
        await getConnection();
        const eInvoice = await EnterpriseInvoiceFundingProcess.getInvoiceFundingProcessByEnterpriseId(enterpriseId, params);
        console.log('DAO: Ending getInvoiceFundingProcessByEnterpriseId method');
        return eInvoice;
    }
    
    static async getAllInvoiceFundingProcess(enterpriseId: number, invoiceId: number, params: IQueryFilters) {
        console.log('DAO: Starting getAllInvoiceFundingProcess method...');
        await getConnection();
        const result = await EnterpriseInvoiceFundingProcess.getByEnterpriseIdAndInvoiceId(enterpriseId, invoiceId, params);
        console.log('DAO: Ending getAllInvoiceFundingProcess method...');
        return result;
    }

    static async getInvoiceFundingProcessById(fundingProcessId: number) {
        console.log('DAO: Starting getInvoiceFundingProcessById');
        await getConnection();
        const process = await EnterpriseInvoiceFundingProcess.getProcessById(fundingProcessId);
        console.log('DAO: Ending getInvoiceFundingProcessById');
        return process;
    }

    static async saveFundingProcess(fundingProcess: EnterpriseInvoiceFundingProcess) {
        console.log('DAO: Starting saveFundingProcess');
        await getConnection();
        await EnterpriseInvoiceFundingProcess.save(fundingProcess);
        console.log('DAO: Ending saveFundingProcess');
    }

    static async deleteFundingProcess(fundingProcess: EnterpriseInvoiceFundingProcess) {
        console.log('DAO: Starting deleteFundingProcess');
        await getConnection();
        await EnterpriseInvoiceFundingProcess.remove(fundingProcess);
        console.log('DAO: Ending deleteFundingProcess');
    }
    
    static async getPaymentDetail(invoiceId: number) {
        console.log('DAO: Starting getPaymentDetail method');
        await getConnection();
        const paymentDetail = await EnterpriseInvoiceFundingProcess.getPaymentDetail(invoiceId);
        console.log('DAO: Ending getPaymentDetail method');
        return paymentDetail;
        
    }
    
    static async getProcessByInvoiceIdAndFundingProcessId(invoiceId: number, fundingProcessId: number) {
        console.log('DAO: Starting getInvoiceFundingProcessById');
        await getConnection();
        const process = await EnterpriseInvoiceFundingProcess.getProcessByInvoiceIdAndFundingProcessId(invoiceId, fundingProcessId);
        console.log('DAO: Ending getInvoiceFundingProcessById');
        return process;
    }

    static async saveInvoiceFundingProcess(invoiceFundingProcess: EnterpriseInvoiceFundingProcess) {
        console.log('DAO: Starting saveInvoiceFundingProcess');
        await getConnection();
        await EnterpriseInvoiceFundingProcess.save(invoiceFundingProcess);
        console.log('DAO: Ending saveInvoiceFundingProcess');
    }
}