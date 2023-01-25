import { getConnection } from "commons/connection";
import { InvoiceNegotiationProcess } from "entities/enterprise-invoice-negotiation-process";
import { EnterpriseInvoiceNegotiationProcessStatus } from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { EnterpriseInvoice } from "entities/enterprise-invoice";
import { UpdateNegotiationById } from "commons/interfaces/invoice-negotiation-process.interface";
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";


export class InvoiceNegotiationProcessDAO {

    static async deleteNegotiationProcess(invoiceId: number) {
        console.log('DAO: Starting deleteNegotiationProcessByInvoiceId');
        await getConnection();
        await InvoiceNegotiationProcess.removeNegotiationProcessByInvoiceId(invoiceId);
        console.log('DAO: Ending deleteNegotiationProcessByInvoiceId');
    }

    static async getInvoiceNegotiation(invoiceId: number) {
        console.log('DAO: Starting getInvoiceNegotiation');
        await getConnection();
        const invoiceNegotiation = await InvoiceNegotiationProcess.getInvoiceNegotiation(invoiceId);
        console.log('DAO: Ending getInvoiceNegotiation');
        return invoiceNegotiation;        
    }
    
    static async getInvoiceNegotiationsAndOrderBy(enterpriseId: number, invoiceId: number, params: any) {
        console.log('DAO: Starting getInvoiceNegotiationsAndOrderBy...');
        await getConnection();
        const invoiceNegotiations = await InvoiceNegotiationProcess.getInvoiceNegotiations(enterpriseId, invoiceId, params);
        console.log('DAO: Ending getInvoiceNegotiationsAndOrderBy...');
        return invoiceNegotiations;
    }

    static async getInvoiceNegotiationsByProviderId(enterpriseId: number, params: any) {
        console.log('DAO: Starting getInvoiceNegotiationsByProviderId...');
        await getConnection();
        const invoiceNegotiations = await InvoiceNegotiationProcess.getInvoiceNegotiationsByProviderId(enterpriseId, params);
        console.log('DAO: Ending getInvoiceNegotiationsByProviderId...');
        return invoiceNegotiations;
    }

    static async getByNegotiationIdAndInvoiceId(negotiationId: number, invoiceId: number){
        console.log('DAO Starting getByNegotiationIdAndInvoiceId');
        await getConnection();
        const invoiceNegotiation = await InvoiceNegotiationProcess.getByNegotiationIdAndInvoiceId(negotiationId, invoiceId);
        console.log('DAo Ending getByNegotiationIdAndInvoiceId');
        return invoiceNegotiation;
    }
       
    static async deleteNegotiationProcessByNegotiationId(negotiationProcessId: number) {
        console.log('DAO: Starting deleteNegotiationProcessByNegotiationId');
        await getConnection();
        await InvoiceNegotiationProcess.deleteNegotiationProcessByNegotiationId(negotiationProcessId);
        console.log('DAO: Ending deleteNegotiationProcessByNegotiationId');
    }

    static async updateBpmProcessInstance(negotiationProcessId: number, instanceId: number) {
        console.log('DAO: Starting updateBpmProcessInstance');
        await getConnection();
        await InvoiceNegotiationProcess.updateBpmProcessInstance(negotiationProcessId, instanceId);
        console.log('DAO: Ending updateBpmProcessInstance');        
    }

    static async getByInvoiceIdAndId(invoiceId: number, negotiationId: number) {
        console.log('DAO: Starting getByInvoiceIdAndId');
        await getConnection();
        const negotiation = await InvoiceNegotiationProcess.getByInvoiceIdAndId(invoiceId, negotiationId);
        console.log('DAO: Ending getByInvoiceIdAndId');
        return negotiation;
    }

    static async saveInvoiceNegotiation(invoiceNegotiation: InvoiceNegotiationProcess) {
        console.log('DAO: Starting saveInvoiceNegotiation...');
        await getConnection();
        const negotiation = await InvoiceNegotiationProcess.save(invoiceNegotiation);
        console.log('DAO: Ending saveInvoiceNegotiation...');
        return negotiation;
    }

    static async rollbackInvoiceNegotiation(invoiceNegotiation: InvoiceNegotiationProcess) {
        console.log('DAO: Starting rollbackInvoiceNegotiation...');
        await getConnection();
        await InvoiceNegotiationProcess.save(invoiceNegotiation);
        console.log('DAO: Ending rollbackInvoiceNegotiation...');
    }

    static async getNegotiationByIdAndStatus(negotiationId: number, invoiceId: number, status: EnterpriseInvoiceNegotiationProcessStatus) {
        console.log('DAO: Starting getNegotiationForIdAndStatus');
        await getConnection();
        const negotiation = await InvoiceNegotiationProcess.getByIdInvoiceAndStatus(negotiationId, invoiceId, status);
        console.log('DAO: Ending getNegotiationForIdAndStatus');
        return negotiation;
    }
    
    static async getProviderInvoiceNegotiationsAndOrderBy(enterpriseId: number, invoiceId: number, params: any) {
        console.log('DAO: Starting getProviderInvoiceNegotiationsAndOrderBy...');
        await getConnection();
        const invoiceNegotiations = await InvoiceNegotiationProcess.getProviderInvoiceNegotiations(enterpriseId, invoiceId, params);
        console.log('DAO: Ending getProviderInvoiceNegotiationsAndOrderBy...');
        return invoiceNegotiations;
    }
    
    static async getInvoiceNegotiationByNegotiationProcessId(negotiationProcessId: number) {
        console.log('DAO: Starting getInvoiceNegotiationByNegotiationProcessId method');
        await  getConnection();
        const negotiationProcess = await InvoiceNegotiationProcess.getInvoiceNegotiationByNegotiationProcessId(negotiationProcessId);
        console.log('DAO: Ending getInvoiceNegotiationByNegotiationProcessId method');
        return negotiationProcess;
    }

    static async getNegotiationAndInvoiceForCreateObjectMongoDB(negotiationProcessId: number) {
        console.log('DAO: Starting getInvoiceNegotiationByNegotiationProcessId method');
        await  getConnection();
        const negotiationProcess = await InvoiceNegotiationProcess.getNegotiationAndInvoiceForCreateObjectMongoDB(negotiationProcessId);
        console.log('DAO: Ending getInvoiceNegotiationByNegotiationProcessId method');
        return negotiationProcess;
    }

    static async saveInvoiceBulkNegotiation(negotiationsProcess: InvoiceNegotiationProcess[]) {
        console.log('DAO: Starting saveInvoiceBulkNegotiation...');
        await getConnection();
        await InvoiceNegotiationProcess.insertBulkNegotiations(negotiationsProcess);
        console.log('DAO: Ending saveInvoiceBulkNegotiation...');
    }

    static async deleteNegotiationsProcess(negotiationsProcess: number[]) {
        console.log('DAO: Starting deleteNegotiationProcessByInvoiceId');
        await getConnection();
        await InvoiceNegotiationProcess.deteleteInvoicesProcesById(negotiationsProcess);
        console.log('DAO: Ending deleteNegotiationProcessByInvoiceId');
    }

    static async getNegotiationsId(status:EnterpriseInvoiceNegotiationProcessStatus, bulkNegotiationId: number) {
        await getConnection();
        const ids = await InvoiceNegotiationProcess.getNegotiationsId(status, bulkNegotiationId);
        return ids;
    }

    static async updateInvoicesNegotiationProcess(data: UpdateNegotiationById, negotiationsId:number[], status: EnterpriseInvoiceNegotiationProcessStatus) {
        console.log('DAO: Starting updateInvoicesNegotiationProcess');
        await getConnection();
        await InvoiceNegotiationProcess.updateInvoicesNegotiationProcess(data, negotiationsId, status);
        console.log('DAO: Ending updateInvoicesNegotiationProcess');
    }
    
}