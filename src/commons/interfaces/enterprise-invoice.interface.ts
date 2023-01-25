import { EnterpriseInvoiceTypeEnum } from 'commons/enums/enterprise-invoice-type.enum';
import { EnterpriseInvoicePaymentTypeEnum } from 'commons/enums/enterprise-invoice-payment-type.enum';

export interface IEnterpriseInvoiceRecord {
    enterpriseInvoiceBulkId: number,
	currencyCode: string,
    documentType: EnterpriseInvoiceTypeEnum,
    paymentType: EnterpriseInvoicePaymentTypeEnum,
	customAttribute: [{ id: number, value: string}],
	invoice: {
		invoiceNumber: string,
		alternativeInvoiceId: string,
		expirationDate: Date,
        emissionDate: Date,
        paymentType: EnterpriseInvoicePaymentTypeEnum,
		payment: {
			inAdvance: number,
			creditNotesValue: string,
			retentions: string,
			vat: string,
			amount: number
		},
        providerNIT: string,
        enterpriseId: number
	}
}

export interface IEnterpriseInvoice {
    documentType: EnterpriseInvoiceTypeEnum,
    invoiceNumber: string,
    alternativeInvoiceId: string,
    currencyCode: string,
    expirationDate: Date,
    emissionDate: Date,
    paymentType: EnterpriseInvoicePaymentTypeEnum,    
    payment: IPayment,
    provider: IProvider,
    customAttributes: [{ id: number, value: string}],
    enterpriseInvoiceBulkId?: number,
    lenderId?: number,
    enterpriseId?: number
}

export interface IPayment {
    inAdvance: number,
    creditNotesValue: string,
    retentions: string,
    vat: string,
    amount: number
}

export interface IProvider {
    id?: number,
    nit: string,
    enterpriseName?: number
}