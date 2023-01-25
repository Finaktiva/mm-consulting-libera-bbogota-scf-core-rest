import { getConnection } from "commons/connection";
import { EnterpriseInvoiceFiles } from "entities/enterprise-invoice-files";


export class EnterpriseInvoiceFilesDAO { 
    static async getInvoiceFiles(fundingProcessId: number) {
        console.log('DAO: Starting getInvoiceFiles');
        await getConnection();
        const files = await EnterpriseInvoiceFiles.getInvoiceFileByFundingProcessId(fundingProcessId);
        console.log('DAO: Ending getInvoiceFiles');
        return files;
    }

    static async getInvoiceFilesByInvoiceId(invoiceId: number) {
        console.log('DAO: Starting getInvoiceFilesByInvoiceId');
        await getConnection();
        const invoiceFiles = await EnterpriseInvoiceFiles.getInvoiceFilesByInvoiceId(invoiceId);
        console.log('DAO: Ending getInvoiceFilesByInvoiceId');
        return invoiceFiles;
    }

    static async saveFiles(invoiceFiles: EnterpriseInvoiceFiles): Promise<EnterpriseInvoiceFiles> {
        console.log('DAO: Starting saveFiles...');
        await getConnection();
        const saveFiles = await invoiceFiles.save();
        console.log('DAO: Ending saveInvoiceBulk...');
        return saveFiles;
    }

    static async deleteInvoiceFiles(invoiceFiles: EnterpriseInvoiceFiles) {
        console.log('DAO: Starting deleteInvoiceFiles...');
        await getConnection();
        await invoiceFiles.remove();
        console.log('DAO: Ending deleteInvoiceFiles...');
    }
    
}