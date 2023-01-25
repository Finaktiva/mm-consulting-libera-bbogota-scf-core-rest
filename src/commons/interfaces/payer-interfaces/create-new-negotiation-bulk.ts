import { NPDiscountTypeEnum } from "commons/enums/negotiation-process-discount-type.enum";

export interface CreateNewNegotiationBulk {
    discountType: NPDiscountTypeEnum,
    percentage: number,
    discountDueDate: Date
    lenderId: number,
    expectedPaymentDate: Date,
    currentAmount: number,
    invoices: number[]
}
