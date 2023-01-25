import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';
import { IEnterpriseRecord } from 'commons/interfaces/enterprise-record.interface';
import { EnterpriseRecordService } from 'services/enterprise-record.service';


export const handler = async (event, context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    const { Records } = event;

    if(!Records.length)
        return;

    try{
        const body = JSON.parse(Records[0].body);
        if(!body)
            return;
        const enterpriseRecord: IEnterpriseRecord = body;
        await EnterpriseRecordService.saveEnterpriseRecord(enterpriseRecord);
        
        console.log(`HANDLER: Ending ${context.functionName} method`);
    }
    catch (error) {
        console.log('ERRORS: ' , error);
    }
}