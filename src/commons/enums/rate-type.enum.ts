export enum RateTypeEnum {
    DUE_MONTH_RATE = 'DUE_MONTH_RATE',
    FIXED_RATE = 'FIXED_RATE',
    ANNUAL_RATE = 'ANNUAL_RATE',
    ADVANCE_MONTH_RATE = 'ADVANCE_MONTH_RATE',
    PREFERENTIAL_RATE = 'PREFERENTIAL_RATE',
    VARIABLE_RATE = 'VARIABLE_RATE'
}

export const parseRateType = (value: string) => {
    if(!value)
        return null;

    switch(value) {
        case 'DUE_MONTH_RATE':
            return RateTypeEnum.DUE_MONTH_RATE;
        case 'FIXED_RATE':
            return RateTypeEnum.FIXED_RATE;
        case 'ANNUAL_RATE':
            return RateTypeEnum.ANNUAL_RATE;
        case 'ADVANCE_MONTH_RATE':
            return RateTypeEnum.ADVANCE_MONTH_RATE;
        case 'PREFERENTIAL_RATE':
            return RateTypeEnum.PREFERENTIAL_RATE;
        case 'VARIABLE_RATE':
            return RateTypeEnum.VARIABLE_RATE;
        default:
            return null;
    }
}