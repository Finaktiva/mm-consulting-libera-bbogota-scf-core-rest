import { SQSService } from "services/sqs.service";
import { SQSMetadata } from "commons/interfaces/sqs.interface";
import { EInvoiceBulkLoad } from "commons/interfaces/invoice.interface";

const SQS_LIBERA_ENTERPRISE_INVOICE_LOAD_QUEUE = process.env.SQS_LIBERA_ENTERPRISE_INVOICE_LOAD_QUEUE;

export const handler = async (event, context) => {
    
    try {
        console.log(`HANDLER: Starting ${context.functionName}`);
        context.callbackWaitsForEmptyEventLoop = false;
        const records = event.Records;
        console.log('records -->> ', records);
        if (!records.length)
            return;
    
        const bulk: EInvoiceBulkLoad = JSON.parse(records[0].body);
        const successLoadedCount = bulk.invoices.length;
        console.log('total invoices recived -->>', successLoadedCount);
    
        for (const invoice of bulk.invoices) {
            await delay(700);
            const bulk: EInvoiceBulkLoad = JSON.parse(records[0].body);
            const sqsMetadata: SQSMetadata = {
                sqsUrl: SQS_LIBERA_ENTERPRISE_INVOICE_LOAD_QUEUE,
                body: {
                    enterpriseInvoiceBulkId: bulk.enterpriseInvoiceBulkId,
                    currencyCode: bulk.currencyCode,
                    documentType: bulk.documentType,
                    paymentType: bulk.paymentType,
                    invoice
                }
            }
            for (let CA of bulk.customAttributes) {
                sqsMetadata.body.customAttribute = CA;
            }
            console.log('invoice to register -->>', invoice);
            await SQSService.sendMessage(sqsMetadata);
        }
        
    } catch (errors) {
        console.log('errors : ',errors);
    }
    console.log(`HANDLER: Ending ${context.functionName}`);
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}