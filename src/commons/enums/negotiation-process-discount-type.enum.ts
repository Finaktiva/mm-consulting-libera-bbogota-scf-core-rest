export enum NPDiscountTypeEnum {
    FIXED_RATE = 'FIXED_RATE',
    ANTICIPATED_MONTH_RATE = 'ANTICIPATED_MONTH_RATE',
    EXPIRED_MONTH_RATE = 'EXPIRED_MONTH_RATE'
}

export const isValidDiscountType = (value: string) => {
    if(!value) return null;

    switch (value) {
        case NPDiscountTypeEnum.FIXED_RATE:
            return NPDiscountTypeEnum.FIXED_RATE;
        case NPDiscountTypeEnum.ANTICIPATED_MONTH_RATE:
            return NPDiscountTypeEnum.FIXED_RATE;
        case NPDiscountTypeEnum.EXPIRED_MONTH_RATE:
            return NPDiscountTypeEnum.EXPIRED_MONTH_RATE;    
        default:
            return null;
    }
}