export enum RoleEnum{
    LIBERA_ADMIN = 'LIBERA_ADMIN',
    LIBERA_PROGRAM_MANAGER = 'LIBERA_PROGRAM_MANAGER',
    LIBERA_USER_MANAGER = 'LIBERA_USER_MANAGER',
    LIBERA_PROVIDER_MANAGER = 'LIBERA_PROVIDER_MANAGER',
    LIBERA_COLLABORATOR = 'LIBERA_COLLABORATOR',
    ENTERPRISE_CONSOLE_ADMIN = 'ENTERPRISE_CONSOLE_ADMIN',
    ENTERPRISE_PAYER_ADMIN = 'ENTERPRISE_PAYER_ADMIN',
    ENTERPRISE_PROVIDER_ADMIN = 'ENTERPRISE_PROVIDER_ADMIN',
    ENTERPRISE_FUNDING_ADMIN = 'ENTERPRISE_FUNDING_ADMIN',
    BOOC_VIEWER = 'BOOC_VIEWER'
}

export const parseUserRole = (value: string) => {
    if(!value) return null

    switch (value){
        case RoleEnum.LIBERA_ADMIN:
            return RoleEnum.LIBERA_ADMIN;
        
        case RoleEnum.LIBERA_COLLABORATOR:
            return RoleEnum.LIBERA_COLLABORATOR;

        case RoleEnum.ENTERPRISE_CONSOLE_ADMIN:
            return RoleEnum.ENTERPRISE_CONSOLE_ADMIN;

        case RoleEnum.ENTERPRISE_PAYER_ADMIN:
            return RoleEnum.ENTERPRISE_PAYER_ADMIN;
        
        case RoleEnum.ENTERPRISE_PROVIDER_ADMIN:
            return RoleEnum.ENTERPRISE_PROVIDER_ADMIN;

        case RoleEnum.ENTERPRISE_FUNDING_ADMIN:
            return RoleEnum.ENTERPRISE_FUNDING_ADMIN;
        
        case RoleEnum.BOOC_VIEWER:
            return RoleEnum.BOOC_VIEWER;
            
        default:
            return null;
    }
}

export const isValidLiberaRol = (value: string) => {
    if(!value) return null

    switch (value){
        case RoleEnum.LIBERA_PROGRAM_MANAGER:
            return RoleEnum.LIBERA_PROGRAM_MANAGER;
        
        case RoleEnum.LIBERA_USER_MANAGER:
            return RoleEnum.LIBERA_USER_MANAGER;

        case RoleEnum.LIBERA_PROVIDER_MANAGER:
            return RoleEnum.LIBERA_PROVIDER_MANAGER;

        case RoleEnum.BOOC_VIEWER:
            return RoleEnum.BOOC_VIEWER;
            
        default:
            return null;
    }
}