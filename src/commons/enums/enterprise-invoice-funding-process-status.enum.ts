export enum EnterpriseInvoiceFundingProcessStatusEnum {
    PENDING_LENDER_PAYMENT_CONFIRMATION = 'PENDING_LENDER_PAYMENT_CONFIRMATION',
    PENDING_PROVIDER_PAYMENT_CONFIRMATION = 'PENDING_PROVIDER_PAYMENT_CONFIRMATION',
    REJECTED = 'REJECTED',
    PROVIDER_PAYMENT_CONFIRMATION = 'PROVIDER_PAYMENT_CONFIRMATION',
    LENDER_PAYMENT_CONFIRMATION = 'LENDER_PAYMENT_CONFIRMATION',
    EXPIRED = 'EXPIRED'
}


export const isFilterFundingProcessStatusValid = (value : String) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceFundingProcessStatusEnum.PENDING_LENDER_PAYMENT_CONFIRMATION:
            EnterpriseInvoiceFundingProcessStatusEnum.PENDING_LENDER_PAYMENT_CONFIRMATION;

        case EnterpriseInvoiceFundingProcessStatusEnum.REJECTED:
            return EnterpriseInvoiceFundingProcessStatusEnum.REJECTED;

        case EnterpriseInvoiceFundingProcessStatusEnum.LENDER_PAYMENT_CONFIRMATION:
            return EnterpriseInvoiceFundingProcessStatusEnum.LENDER_PAYMENT_CONFIRMATION;

        default:
            return null;
    }
}