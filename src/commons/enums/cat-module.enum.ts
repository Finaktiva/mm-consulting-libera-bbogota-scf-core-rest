export enum CatModuleEnum {
    PAYER = 'PAYER',
    PROVIDER = 'PROVIDER',
    FUNDING = 'FUNDING',
    ADMIN = 'ADMIN'
}

export const parseCatModule = (value: string) => {
    if(!value) return null

    switch (value) {

        case CatModuleEnum.PAYER:
            return CatModuleEnum.PAYER;

        case CatModuleEnum.PROVIDER:
            return CatModuleEnum.PROVIDER;

        case CatModuleEnum.FUNDING:
            return CatModuleEnum.FUNDING;

        case CatModuleEnum.ADMIN:
            return CatModuleEnum.ADMIN;
        default:
            return null;
    }
}


export const isEnterpriseModuleValid = (value: string) => {
    if(!value) return null

    switch (value) {
        case CatModuleEnum.PROVIDER:
            return CatModuleEnum.PROVIDER;

        case CatModuleEnum.FUNDING:
            return CatModuleEnum.FUNDING;

        default:
            return null;
    }
}

export const isCatModuleValid = (value: string) => {
    if(!value) return null

    switch (value) {

        case CatModuleEnum.PAYER:
            return CatModuleEnum.PAYER;

        case CatModuleEnum.PROVIDER:
            return CatModuleEnum.PROVIDER;

        case CatModuleEnum.FUNDING:
            return CatModuleEnum.FUNDING;

        default:
            return null;
    }
}
