import { CatModuleEnum } from "./cat-module.enum";

export enum ModuleRoleEnum {
    PAYER = 'ENTERPRISE_PAYER_ADMIN',
    PROVIDER = 'ENTERPRISE_PROVIDER_ADMIN',
    FUNDING = 'ENTERPRISE_FUNDING_ADMIN',
    ADMIN = 'ENTERPRISE_CONSOLE_ADMIN'
}

export const parseModuleRole = (value: string) => {
    if(!value) return null

    switch (value) {

        case CatModuleEnum.PAYER:
            return ModuleRoleEnum.PAYER;

        case CatModuleEnum.PROVIDER:
            return ModuleRoleEnum.PROVIDER;

        case CatModuleEnum.FUNDING:
            return ModuleRoleEnum.FUNDING;

        case CatModuleEnum.ADMIN:
            return ModuleRoleEnum.ADMIN;
        default:
            return null;
    }
}