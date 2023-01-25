export enum EnterpriseQuotaRequestTypeEnum {
    NEW_FUNDING = 'NEW_FUNDING',
    PAYMENT = 'PAYMENT',
    AMOUNT_UPGRADE = 'AMOUNT_UPGRADE'
}

export const parseQuotaRequestAdjustmentType = (value: string) => {
    if(!value)
        return null;
    
    switch(value) {
        case EnterpriseQuotaRequestTypeEnum.PAYMENT:
            return EnterpriseQuotaRequestTypeEnum.PAYMENT;

        case EnterpriseQuotaRequestTypeEnum.AMOUNT_UPGRADE:
            return EnterpriseQuotaRequestTypeEnum.AMOUNT_UPGRADE;
            
        default:
            return null;
    }
}