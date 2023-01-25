export enum EnterpriseQuotaRequestStatusEnum {
    PENDING_LENDER_APPROVAL = 'PENDING_LENDER_APPROVAL',
    PENDING_PAYER_APPROVAL = 'PENDING_PAYER_APPROVAL',
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED'
}

export const parseEnterpriseQuotaRequestStatus = (value: string) => {
    if(!value)
        return null;
    
    switch(value) {
        case 'PENDING_LENDER_APPROVAL':
            return EnterpriseQuotaRequestStatusEnum.PENDING_LENDER_APPROVAL;
        case 'PENDING_PAYER_APPROVAL':
            return EnterpriseQuotaRequestStatusEnum.PENDING_PAYER_APPROVAL;
        case 'APPROVED':
            return EnterpriseQuotaRequestStatusEnum.APPROVED;
        case 'REJECTED':
            return EnterpriseQuotaRequestStatusEnum.REJECTED;
        default:
            return null;
    }
}

export const parseUpdateEnterpriseQuotaRequestStatus = (value: string) => {
    if(!value)
        return null;
    
    switch(value) {
        case 'APPROVED':
            return EnterpriseQuotaRequestStatusEnum.APPROVED;
        case 'REJECTED':
            return EnterpriseQuotaRequestStatusEnum.REJECTED;
        default:
            return null;
    }
}