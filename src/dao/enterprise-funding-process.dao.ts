import { getConnection } from "commons/connection";
import { EnterpriseInvoiceFundingProcess } from "entities/enterprise-invoice-funding-process";


export class EnterpriseInvoiceFundingProcessDAO {

    static async getProcessById(processId: number, enterpriseId: number) {
        console.log('DAO: Starting getProcessById');
        await getConnection();
        const  process = await EnterpriseInvoiceFundingProcess.getProcessByIdAndEnterpriseId(processId, enterpriseId);
        console.log('DAO: Ending getProcessById');
        return process;
    }

    static async saveFundingProcess(fundingProcess: EnterpriseInvoiceFundingProcess) {
        console.log('DAO: Starting saveFundingProcess');
        await getConnection();
        await EnterpriseInvoiceFundingProcess.save(fundingProcess);
        console.log('DAO: Ending saveFundingProcess');        
    }

    static async getSimpleProccessById (processId: number, enterpriseId: number) {
        console.log('DAO: Starting getSimpleProccessById');
        await getConnection();
        const  process = await EnterpriseInvoiceFundingProcess.getSimpleProccessById(processId, enterpriseId);
        console.log('DAO: Ending getSimpleProccessById');
        return process;
    }
}