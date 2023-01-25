export enum EnterpriseFundingRequestType {
    NEW_FUNDING = 'NEW_FUNDING',
    PAYMENT = 'PAYMENT', 
    AMOUNT_UPGRADE = 'AMOUNT_UPGRADE'
}

export const isValidFundingRequestType = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseFundingRequestType.NEW_FUNDING:
            return EnterpriseFundingRequestType.NEW_FUNDING;

        case EnterpriseFundingRequestType.PAYMENT:
            return EnterpriseFundingRequestType.PAYMENT;

        case EnterpriseFundingRequestType.AMOUNT_UPGRADE:
            return EnterpriseFundingRequestType.AMOUNT_UPGRADE;

        default:
            return null;
    }
}