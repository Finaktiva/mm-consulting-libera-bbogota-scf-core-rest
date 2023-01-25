import { EnterpriseInvoiceService } from 'services/enterprise-invoice.service';
import { IEnterpriseInvoice, IEnterpriseInvoiceRecord } from 'commons/interfaces/enterprise-invoice.interface';
import Response from 'commons/response';

export const handler = async (event, context) => {
    try {
        console.log(`HANDLER: Starting ${context.functionName}`);
    context.callbackWaitsForEmptyEventLoop = false;
    const { Records } = event;
    console.log(Records);
    if(!Records.length) 
        return;

    const body = JSON.parse(Records[0].body) as IEnterpriseInvoiceRecord;
    const invoice: IEnterpriseInvoice = {
        currencyCode: body.currencyCode,
        documentType: body.documentType,
        paymentType: body.paymentType,
        alternativeInvoiceId: body.invoice.alternativeInvoiceId,
        emissionDate: body.invoice.emissionDate,
        expirationDate: body.invoice.expirationDate,
        invoiceNumber: body.invoice.invoiceNumber,
        enterpriseId: body.invoice.enterpriseId,
        payment: {
            inAdvance: body.invoice.payment.inAdvance,
            creditNotesValue: body.invoice.payment.creditNotesValue,
            retentions: body.invoice.payment.retentions,
            vat: body.invoice.payment.vat,
            amount: body.invoice.payment.amount
        },
        provider: {
            nit: body.invoice.providerNIT
        },
        customAttributes: body.customAttribute,
        enterpriseInvoiceBulkId: body.enterpriseInvoiceBulkId
    };
    console.log('registering invoice', invoice);
    await EnterpriseInvoiceService.createInvoice(invoice);
    } catch (error) {
        console.log('ERRORS: ' , error);
        return Response.Ok(error);
    }
    
    console.log(`HANDLER: Ending ${context.functionName}`);
}