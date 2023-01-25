export enum EnterpriseFundingRequestRateType {
    DUE_MONTH_RATE = 'DUE_MONTH_RATE',
    FIXED_RATE = 'FIXED_RATE', 
    ANNUAL_RATE = 'ANNUAL_RATE',
    ADVANCE_MONTH_RATE = 'ADVANCE_MONTH_RATE',
    PREFERENTIAL_RATE = 'PREFERENTIAL_RATE',
    VARIABLE_RATE = 'VARIABLE_RATE'
}

export const isValidFundingRequestRateType = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseFundingRequestRateType.DUE_MONTH_RATE:
            return EnterpriseFundingRequestRateType.DUE_MONTH_RATE;

        case EnterpriseFundingRequestRateType.FIXED_RATE:
            return EnterpriseFundingRequestRateType.FIXED_RATE;

        case EnterpriseFundingRequestRateType.ANNUAL_RATE:
            return EnterpriseFundingRequestRateType.ANNUAL_RATE;

        case EnterpriseFundingRequestRateType.ADVANCE_MONTH_RATE:
            return EnterpriseFundingRequestRateType.ADVANCE_MONTH_RATE;

        case EnterpriseFundingRequestRateType.PREFERENTIAL_RATE:
            return EnterpriseFundingRequestRateType.PREFERENTIAL_RATE;

        case EnterpriseFundingRequestRateType.VARIABLE_RATE:
            return EnterpriseFundingRequestRateType.VARIABLE_RATE;

        default:
            return null;
    }
}