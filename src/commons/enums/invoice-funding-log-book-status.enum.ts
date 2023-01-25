export enum InvoiceFundingLogBookStatusEnum {
    PENDING_LENDER_PAYMENT_CONFIRMATION = 'PENDING_LENDER_PAYMENT_CONFIRMATION', 
    PENDING_PROVIDER_PAYMENT_CONFIRMATION = 'PENDING_PROVIDER_PAYMENT_CONFIRMATION',
    REJECTED = 'REJECTED',
    PROVIDER_PAYMENT_CONFIRMATION = 'PROVIDER_PAYMENT_CONFIRMATION',
    LENDER_PAYMENT_CONFIRMATION = 'LENDER_PAYMENT_CONFIRMATION'
}

export const parseInvoiceFundingStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case InvoiceFundingLogBookStatusEnum.LENDER_PAYMENT_CONFIRMATION:
            return InvoiceFundingLogBookStatusEnum.LENDER_PAYMENT_CONFIRMATION;
        case InvoiceFundingLogBookStatusEnum.PENDING_LENDER_PAYMENT_CONFIRMATION:
            return InvoiceFundingLogBookStatusEnum.PENDING_LENDER_PAYMENT_CONFIRMATION;
        case InvoiceFundingLogBookStatusEnum.PENDING_PROVIDER_PAYMENT_CONFIRMATION:
            return InvoiceFundingLogBookStatusEnum.PENDING_PROVIDER_PAYMENT_CONFIRMATION;
        case InvoiceFundingLogBookStatusEnum.PROVIDER_PAYMENT_CONFIRMATION:
            return InvoiceFundingLogBookStatusEnum.PROVIDER_PAYMENT_CONFIRMATION;
        case InvoiceFundingLogBookStatusEnum.REJECTED:
            return InvoiceFundingLogBookStatusEnum.REJECTED;
        default:
            return null;
    }
}