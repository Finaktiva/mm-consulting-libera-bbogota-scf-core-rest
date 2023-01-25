import { EnterpriseInvoiceNegotiationProcessStatus, EnterpriseInvoiceNegotiationRoleEnum, EnterpriseInvoiceNegotiationtTypeEventEnum } from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { NPDiscountTypeEnum } from "commons/enums/negotiation-process-discount-type.enum";
import { NegotiationRoleEnum } from "commons/enums/negotiation-role.enum";

export interface UpdateNegotiationById {
    status: EnterpriseInvoiceNegotiationProcessStatus;
    newOffer?: {
        discountType: NPDiscountTypeEnum,
        percentage: number,
        discountDueDate: Date,
        expectedPaymentDate: Date,
        currentAmount?: number
    }
}

export interface ISaveInvoiceNegotiationRecord {
    negotiationId: number,
    userId: number,
    negotiationRole: NegotiationRoleEnum,
    eventDate: Date,
    typeEvent: EnterpriseInvoiceNegotiationtTypeEventEnum
}

export interface INewInvoiceNegotiation {
    discountDueDate: Date, 
    expectedPaymentDate: Date, 
    discountType: NPDiscountTypeEnum, 
    percentage: number
}