export enum EnterpriseModuleStatusEnum {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
    VALIDATING_REQUEST = 'VALIDATING_REQUEST',
    REJECTED = 'REJECTED',
    REQUESTED_MODULE = 'REQUESTED_MODULE',

}

export const parseEnterpriseStatusToEnterpriseModuleStatus = (value: string) => {
    if(!value || value.length == 0)
        return null;
        
    switch(value){

        case 'ENABLED':
            return EnterpriseModuleStatusEnum.ENABLED;
        case 'REJECTED':
            return EnterpriseModuleStatusEnum.REJECTED;
        case 'DISABLED':
            return EnterpriseModuleStatusEnum.DISABLED;
        default:
            return null;
    }
}

export const parseEnterpriseModuleStatus = (value: string) => {
    if(!value || value.length == 0)
        return null;

    switch(value) {
        case 'ENABLED':
            return EnterpriseModuleStatusEnum.ENABLED;
        case 'DISABLED':
            return EnterpriseModuleStatusEnum.DISABLED;
        case 'VALIDATING_REQUEST':
            return EnterpriseModuleStatusEnum.VALIDATING_REQUEST;
        case 'REJECTED':
            return EnterpriseModuleStatusEnum.REJECTED;
        case 'REQUESTED_MODULE':
            return EnterpriseModuleStatusEnum.REQUESTED_MODULE;
        default:
            return null;
    }
};