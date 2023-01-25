import { ISaveInvoiceNegotiationRecord } from 'commons/interfaces/invoice-negotiation-process.interface';
import { EnterpriseInvoiceNegotiationService } from 'services/enterprise-invoice-negotiation.service';


export const handler = async (event, context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    const { Records } = event;

    if(!Records.length)
        return;

    try{
        const body = JSON.parse(Records[0].body);
        if(!body)
            return;
        const invoiceNegotiations: ISaveInvoiceNegotiationRecord = body;
        await EnterpriseInvoiceNegotiationService.saveInvoiceNegotiationRecord(invoiceNegotiations);
        
        console.log(`HANDLER: Ending ${context.functionName} method`);
    }
    catch (error) {
        console.log('ERRORS: ' , error);
    }
}