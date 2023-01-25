export enum EnterpriseInvoiceBulkNegotiationStatusEnum {
    NEGOTIATION_IN_PROGRESS = 'NEGOTIATION_IN_PROGRESS',
    NEGOTIATION_APPROVED = 'NEGOTIATION_APPROVED',
    NEGOTIATION_REJECTED = 'NEGOTIATION_REJECTED',
    NEGOTIATION_CANCELED = 'NEGOTIATION_CANCELED',
    NEGOTIATION_EXPIRED = 'NEGOTIATION_EXPIRED'
}

export const isNotValidEnterpriseInvoiceBulkNegotiationStatusEnum = (value: string) => {
    if (!value) return null;

    switch (value) {
        case EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_IN_PROGRESS:
            return EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_IN_PROGRESS;
        case EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_APPROVED:
            return EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_APPROVED;
        case EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_REJECTED:
            return EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_REJECTED;
        case EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_CANCELED:
            return EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_CANCELED;
        case EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_EXPIRED:
            return EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_EXPIRED;
        default:
            return null;
    }
}
