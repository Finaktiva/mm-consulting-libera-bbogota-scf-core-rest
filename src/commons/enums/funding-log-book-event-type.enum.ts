export enum FundingLogBookEventTypeEnum {
    PENDING_LENDER_PAYMENT_CONFIRMATION = 'PENDING_LENDER_PAYMENT_CONFIRMATION',
    PENDING_PROVIDER_PAYMENT_CONFIRMATION = 'PENDING_PROVIDER_PAYMENT_CONFIRMATION',
    PROVIDER_PAYMENT_CONFIRMATION = 'PROVIDER_PAYMENT_CONFIRMATION',
    LENDER_PAYMENT_CONFIRM = 'LENDER_PAYMENT_CONFIRM',
    LENDER_PAYMENT_IN_WAIT ='LENDER_PAYMENT_IN_WAIT',  
    LENDER_PAYMENT_REJECTED = 'LENDER_PAYMENT_REJECTED', 
    PROVIDER_PAYMENT_CONFIRM = 'PROVIDER_PAYMENT_CONFIRM', 
    PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
    REJECTED = 'REJECTED'
}

export enum FundingLogBookEventTypeStatusEnum {
    WAIT = 'WAIT',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export const parseFundingLogBookEventType = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_CONFIRM:
            return FundingLogBookEventTypeEnum.LENDER_PAYMENT_CONFIRM;
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_IN_WAIT:
            return FundingLogBookEventTypeEnum.LENDER_PAYMENT_IN_WAIT;
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_REJECTED:
            return FundingLogBookEventTypeEnum.LENDER_PAYMENT_REJECTED;
        case FundingLogBookEventTypeEnum.PAYMENT_EXPIRED:
            return FundingLogBookEventTypeEnum.PAYMENT_EXPIRED;
        case FundingLogBookEventTypeEnum.PROVIDER_PAYMENT_CONFIRMATION:
            return FundingLogBookEventTypeEnum.PROVIDER_PAYMENT_CONFIRM;
        case FundingLogBookEventTypeEnum.PENDING_LENDER_PAYMENT_CONFIRMATION:
            return FundingLogBookEventTypeEnum.LENDER_PAYMENT_IN_WAIT
        case FundingLogBookEventTypeEnum.PENDING_PROVIDER_PAYMENT_CONFIRMATION:
            return FundingLogBookEventTypeEnum.LENDER_PAYMENT_CONFIRM;
        case FundingLogBookEventTypeEnum.PROVIDER_PAYMENT_CONFIRM:
            return FundingLogBookEventTypeEnum.PROVIDER_PAYMENT_CONFIRM
        default:
           return null;
    }
}

export const parseFundingLogBookEventTypeToStatus = (value: FundingLogBookEventTypeEnum) =>{
    if (!value) return null;

    switch(value){
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_CONFIRM:
            return FundingLogBookEventTypeStatusEnum.APPROVED;
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_IN_WAIT:
                return FundingLogBookEventTypeStatusEnum.WAIT;
        case FundingLogBookEventTypeEnum.LENDER_PAYMENT_REJECTED:
                return FundingLogBookEventTypeStatusEnum.REJECTED;
        case FundingLogBookEventTypeEnum.PAYMENT_EXPIRED:
                return FundingLogBookEventTypeStatusEnum.REJECTED;
        case FundingLogBookEventTypeEnum.PROVIDER_PAYMENT_CONFIRM:
                return FundingLogBookEventTypeStatusEnum.APPROVED;
        case FundingLogBookEventTypeEnum.PENDING_LENDER_PAYMENT_CONFIRMATION:
                return FundingLogBookEventTypeStatusEnum.APPROVED;
        default:
            return null;
    }

} 
    
