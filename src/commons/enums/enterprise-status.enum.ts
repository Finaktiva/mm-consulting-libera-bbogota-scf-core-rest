export enum EnterpriseStatusEnum {
    PENDING_ACCOUNT_CREATION = 'PENDING_ACCOUNT_CREATION',
    PENDING_ACCOUNT_CONFIRMATION = 'PENDING_ACCOUNT_CONFIRMATION',
    ENABLED = 'ENABLED',
    REJECTED = 'REJECTED',
    INCOMPLETE_ACCOUNT = 'INCOMPLETE_ACCOUNT',
    EVALUATION_PENDING = 'EVALUATION_PENDING',
    DISABLED = 'DISABLED',
    REQUESTED_MODULE = 'REQUESTED_MODULE',
    DELETED = 'DELETED'
}

// - PENDING_ACCOUNT_CREATION
// - PENDING_ACCOUNT_CONFIRMATION 
// - ENABLED
// - REJECTED
// - INCOMPLETE_ACCOUNT
// - EVALUATION_PENDING
// - DISABLED

export const parseEnterpriseStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseStatusEnum.ENABLED:
            return EnterpriseStatusEnum.ENABLED;
        case EnterpriseStatusEnum.DISABLED:
            return EnterpriseStatusEnum.DISABLED;
        case EnterpriseStatusEnum.EVALUATION_PENDING:
            return EnterpriseStatusEnum.EVALUATION_PENDING;
        case EnterpriseStatusEnum.INCOMPLETE_ACCOUNT:
            return EnterpriseStatusEnum.INCOMPLETE_ACCOUNT;
        case EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION:
            return EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION;
        case EnterpriseStatusEnum.REJECTED:
            return EnterpriseStatusEnum.REJECTED;
        case EnterpriseStatusEnum.REQUESTED_MODULE:
            return EnterpriseStatusEnum.REQUESTED_MODULE;
        case EnterpriseStatusEnum.DELETED:
            return EnterpriseStatusEnum.DELETED;
        default:
            return null;
    }
}

export const isValidEnterpriseStatus = (value: string) => {
    if (!value) return null;

    switch (value) {
        case EnterpriseStatusEnum.ENABLED:
            return EnterpriseStatusEnum.ENABLED;

        case EnterpriseStatusEnum.DISABLED:
            return EnterpriseStatusEnum.DISABLED;

        case EnterpriseStatusEnum.REJECTED:
            return EnterpriseStatusEnum.REJECTED;

        case EnterpriseStatusEnum.EVALUATION_PENDING:
            return EnterpriseStatusEnum.EVALUATION_PENDING;

        case EnterpriseStatusEnum.INCOMPLETE_ACCOUNT:
            return EnterpriseStatusEnum.INCOMPLETE_ACCOUNT;

        default:
            return null;
    }
}