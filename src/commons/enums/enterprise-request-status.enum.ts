export enum EnterpriseRequestStatus {
    EVALUATION_PENDING = 'EVALUATION_PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export const isEnterpriseRequestStatusValid = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseRequestStatus.ACCEPTED:
            return EnterpriseRequestStatus.ACCEPTED;
        case EnterpriseRequestStatus.EVALUATION_PENDING:
            return EnterpriseRequestStatus.EVALUATION_PENDING;
        case EnterpriseRequestStatus.REJECTED:
            return EnterpriseRequestStatus.REJECTED;
        default:
            return null;
    }
}

export const isValidStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseRequestStatus.ACCEPTED:
            return EnterpriseRequestStatus.ACCEPTED;
        case EnterpriseRequestStatus.REJECTED:
            return EnterpriseRequestStatus.REJECTED;
        default:
            return null;
    }
}