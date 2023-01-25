export enum EnterpriseLinkTypeEnum {
        PAYER = 'PAYER',
        PROVIDER = 'PROVIDER',
        FUNDING = 'FUNDING'
    }

export const isEnterpriseLinkTypeValid = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseLinkTypeEnum.PAYER:
            return EnterpriseLinkTypeEnum.PAYER;
        case EnterpriseLinkTypeEnum.FUNDING:
            return EnterpriseLinkTypeEnum.FUNDING;
        case EnterpriseLinkTypeEnum.PROVIDER:
            return EnterpriseLinkTypeEnum.PROVIDER
        default:
            return null;
    }
}

export const isValidLinkType = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseLinkTypeEnum.FUNDING:
            return EnterpriseLinkTypeEnum.FUNDING;
        case EnterpriseLinkTypeEnum.PROVIDER:
            return EnterpriseLinkTypeEnum.PROVIDER
        default:
            return null;
    }
}

