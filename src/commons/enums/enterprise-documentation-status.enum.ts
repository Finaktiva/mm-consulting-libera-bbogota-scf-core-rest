export enum EnterpriseDocumentationStatusEnum {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
    LOADED = 'LOADED',
    EVALUATION_PENDING = 'EVALUATION_PENDING',
    DISABLED = 'DISABLED',
    RELOAD_FILE = 'RELOAD_FILE',
    CURRENT = 'CURRENT',
    ABOUT_TO_EXPIRE = 'ABOUT_TO_EXPIRE',
    EXPIRED = 'EXPIRED',
    NULL = 'NULL'
}

export const parseEnterpriseDocumentationStatus = (value: string ) => {
    if(!value)
        return null;
    
    switch(value) {
        case 'ACCEPTED':
            return EnterpriseDocumentationStatusEnum.ACCEPTED;
        case 'REJECTED':
            return EnterpriseDocumentationStatusEnum.REJECTED;
        case 'PENDING':
            return EnterpriseDocumentationStatusEnum.PENDING;
        case 'LOADED':
            return EnterpriseDocumentationStatusEnum.LOADED;
        case 'EVALUATION_PENDING':
            return EnterpriseDocumentationStatusEnum.EVALUATION_PENDING;
        case 'DISABLED':
            return EnterpriseDocumentationStatusEnum.DISABLED;
        case 'RELOAD_FILE':
            return EnterpriseDocumentationStatusEnum.RELOAD_FILE;
        default:
            return null;
    }
};