export enum EnterpriseInvoiceStatusEnum {
    LOADED = 'LOADED',
    NEGOTIATION_IN_PROGRESS = 'NEGOTIATION_IN_PROGRESS',
    NEGOTIATION_FINISHED = 'NEGOTIATION_FINISHED',
    FUNDING_IN_PROGRESS = 'FUNDING_IN_PROGRESS',
    FUNDING_FINISHED = 'FUNDING_FINISHED',
    PAID = 'PAID',
    PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
    DELETED = 'DELETED',
    AVAILABLE = 'AVAILABLE'
}

export const isNotValidInvoiceStatus  = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS:
            return EnterpriseInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS;
        case EnterpriseInvoiceStatusEnum.FUNDING_IN_PROGRESS:
            return EnterpriseInvoiceStatusEnum.FUNDING_IN_PROGRESS;
        case EnterpriseInvoiceStatusEnum.PAID:
            return EnterpriseInvoiceStatusEnum.PAID;
        case EnterpriseInvoiceStatusEnum.DELETED:
            return EnterpriseInvoiceStatusEnum.DELETED;
        case EnterpriseInvoiceStatusEnum.NEGOTIATION_FINISHED:
            return EnterpriseInvoiceStatusEnum.NEGOTIATION_FINISHED;
        case EnterpriseInvoiceStatusEnum.PAYMENT_CONFIRMED:
            return EnterpriseInvoiceStatusEnum.PAYMENT_CONFIRMED;
        default:
            return null;
    }
}