export enum CatEnterpriseDocumentCodeTypeEnum {
    NIT = 'NT',
    IDENTIFICATION_CARD = 'CC',
    FOREIGNER_ID = 'CE',
    AUTONOMOUS_HERITAGE = 'PA',
    PASSPORT = 'PS'
}

export const parseToEnterpriseDocumentCode = (value: string) => {
    if(!value)
        return null;

    switch(value) {
        case 'NIT':
            return CatEnterpriseDocumentCodeTypeEnum.NIT;
        case 'IDENTIFICATION_CARD':
            return CatEnterpriseDocumentCodeTypeEnum.IDENTIFICATION_CARD;
        case 'FOREIGNER_ID':
            return CatEnterpriseDocumentCodeTypeEnum.FOREIGNER_ID;
        case 'AUTONOMOUS_HERITAGE':
            return CatEnterpriseDocumentCodeTypeEnum.AUTONOMOUS_HERITAGE;
        case 'PASSPORT':
            return CatEnterpriseDocumentCodeTypeEnum.PASSPORT;
        default:
            return null;
    }
}

export const isValidEnterpriseDocumentCodeType = (value: string) => {
    if(!value)
        return null;
    
    switch(value) {
        case CatEnterpriseDocumentCodeTypeEnum.NIT:
            return CatEnterpriseDocumentCodeTypeEnum.NIT;
        case CatEnterpriseDocumentCodeTypeEnum.IDENTIFICATION_CARD:
            return CatEnterpriseDocumentCodeTypeEnum.IDENTIFICATION_CARD;
        case CatEnterpriseDocumentCodeTypeEnum.FOREIGNER_ID:
            return CatEnterpriseDocumentCodeTypeEnum.FOREIGNER_ID;
        case CatEnterpriseDocumentCodeTypeEnum.AUTONOMOUS_HERITAGE:
            return CatEnterpriseDocumentCodeTypeEnum.AUTONOMOUS_HERITAGE;
        case CatEnterpriseDocumentCodeTypeEnum.PASSPORT:
            return CatEnterpriseDocumentCodeTypeEnum.PASSPORT;
        default:
            return null;
    }
}