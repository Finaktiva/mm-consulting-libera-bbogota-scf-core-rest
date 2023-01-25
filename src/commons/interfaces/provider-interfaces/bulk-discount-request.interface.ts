import { NPDiscountTypeEnum } from "commons/enums/negotiation-process-discount-type.enum";
import { EnterpriseInvoiceNegotiationProcessStatus }
    from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { EnterpriseInvoiceBulkNegotiationStatusEnum }
    from "commons/enums/enterprise-invoice-bulk-negotiation-status.emun";

export interface BulkDiscountRequestInterface {
    id: number,
    folio: string,
    amountInvoices: number,
    amount: number,
    currentAmount: number,
    creationDate: Date,
    creationUser: number,
    finishDate: Date,
    status: EnterpriseInvoiceBulkNegotiationStatusEnum,
    provider: ProviderInterface,
    lender: LenderInterface,
    negotiation: NegotiationInterface,
    invoices: InvoiceInterface[]
}

export interface ProviderInterface{
    id: number,
    enterpriseName: string
}

export interface LenderInterface{
    id: number,
    enterpriseName: string,
    availableQuota: number
}

export interface InvoiceInterface{
    id: number,
    invoiceNumber: string,
    provider: invoiceProviderInterface,
    expirationDate: Date,
    amount: number,
    currencyCode: string
}

export interface invoiceProviderInterface{
    id: number,
    enterpriseName: string,
    nit: string
}

export interface NegotiationInterface{
    status: EnterpriseInvoiceNegotiationProcessStatus,
    payerOffer: OfferInterface,
    providerOffer?: OfferInterface
}

export interface OfferInterface{
    discountValue: number,
    discountType: NPDiscountTypeEnum,
    percentage: number,
    discountDueDate: Date,
    expectedPaymentDate: Date
}