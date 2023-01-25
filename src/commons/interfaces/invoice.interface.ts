import { EnterpriseInvoiceTypeEnum } from 'commons/enums/enterprise-invoice-type.enum';
import { EnterpriseInvoicePaymentTypeEnum } from 'commons/enums/enterprise-invoice-payment-type.enum';

export interface BulkLoad {
    invoiceBulkId: number,
    invoiceBulk: EInvoiceBulkLoad
}

export interface EInvoiceBulkLoad {
    enterpriseInvoiceBulkId?: number,
    filename: string,
    currencyCode: string,
    documentType: EnterpriseInvoiceTypeEnum,
    paymentType: EnterpriseInvoicePaymentTypeEnum,
    customAttributes: InvoiceCA[],
    invoices: EInvoice[]
}

export interface EInvoice {    
    enterpriseId?: number,
    invoiceNumber: string,
    alternativeInvoiceNumber: string,
    expirationDate: Date,
    emissionDate: Date,
    payment: InvoicePayment,
    providerNIT: string
}

export interface InvoicePayment {
    inAdvance: number,
    creditNotesValue: string,
    retentions: string,
    vat: string,
    amount: number
}

export interface InvoiceCA {
    id: number,
    value: string
}

export interface EInvoiceBulk {
    enterpriseInvoiceBulkId? : number,
    currencyCode: string,
    documentType: EnterpriseInvoiceTypeEnum,
    paymentType: EnterpriseInvoicePaymentTypeEnum,
    customAttribute: InvoiceCA,
    invoice: EInvoice
}