import { EnterpriseInvoiceFundingProcessService } from "services/enterprise-invoice-funding-process.service";
import { FundingRecord } from "commons/interfaces/lender-interfaces/funding-record.inteface";



export const handler = async (event, context) => {
    console.log(`HANDLER: Starting ${context.functionName}...`);
    const { Records } = event;

    if(!Records.length)
        return;

    try{
        const body = JSON.parse(Records[0].body);
        if(!body)
            return;
        const fundingRecord: FundingRecord = body;
        console.log(fundingRecord);
        await EnterpriseInvoiceFundingProcessService.saveInvoiceFundingRecord(fundingRecord);
        
        console.log(`HANDLER: Ending ${context.functionName} method`);
    }
    catch (error) {
        console.log('ERRORS: ' , error);
    }
}