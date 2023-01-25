export enum UserStatus {
    PENDING_ACCOUNT_CONFIRMATION = 'PENDING_ACCOUNT_CONFIRMATION',
    PENDING_ACCOUNT_INFO = 'PENDING_ACCOUNT_INFO',
    PENDING_ADMINISTRATOR_CONFIRMATION = 'PENDING_ADMINISTRATOR_CONFIRMATION',
    PENDING_ACCOUNT_ACTIVATION = 'PENDING_ACCOUNT_ACTIVATION',
    ON_ADMINISTRATOR_REVISION = 'ON_ADMINISTRATOR_REVISION',
    PENDING_ACCOUNT_COMPLETION = 'PENDING_ACCOUNT_COMPLETION',
    ADMIN_REJECTED = 'ADMIN_REJECTED',
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
    DELETED = 'DELETED',
    PENDING_ACCOUNT_CREATION = 'PENDING_ACCOUNT_CREATION',
    PENDING_FEDERAL_ACCOUNT = 'PENDING_FEDERAL_ACCOUNT'
}

export const isValidStatus = (value: string) => {
    if(!value) return null

    switch (value) {

        case UserStatus.ENABLED:
            return UserStatus.ENABLED;

        case UserStatus.DISABLED:
            return UserStatus.DISABLED;

        default:
            return null;
    }
}

export const isListEnterpriseUserValidStatus = (value: string) => {
    if(!value) return null

    switch (value) {

        case UserStatus.ENABLED:
            return UserStatus.ENABLED;

        case UserStatus.DISABLED:
            return UserStatus.DISABLED;

        case UserStatus.PENDING_ACCOUNT_CONFIRMATION:
            return UserStatus.PENDING_ACCOUNT_CONFIRMATION;

        default:
            return null;
    }
}
