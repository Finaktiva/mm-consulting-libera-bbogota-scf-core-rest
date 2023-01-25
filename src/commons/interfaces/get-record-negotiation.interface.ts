import { NegotiationRoleEnum } from "commons/enums/negotiation-role.enum"
import { NPDiscountTypeEnum } from "commons/enums/negotiation-process-discount-type.enum"
import { EnterpriseInvoiceNegotiationtTypeEventEnum } from "commons/enums/enterprise-invoice-negotiation-process-status.enum"

export interface IGetRecordNegotiation {
    enterpriseName: string,
    negotiationRole: NegotiationRoleEnum,
    eventDate: Date,
    eventType: EnterpriseInvoiceNegotiationtTypeEventEnum,
    discountType: NPDiscountTypeEnum,
    discountPercentage: number,
    discountDueDate: Date,
    expectedPaymentDate: Date,
    discountValue: number
}