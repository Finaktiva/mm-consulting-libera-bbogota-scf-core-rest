export enum CustomAttributesTypeEnum {
    INTEGER = 'INTEGER',
    DECIMAL = 'DECIMAL',
    TEXT = 'TEXT',
    DATE = 'DATE',
    RADIO = 'RADIO',
    CHECKBOX = 'CHECKBOX',
    CURRENCY = 'CURRENCY'
}

enum CustomAttributesBooleanTypeEnum {
    true = 'true',
    false = 'false'
}

export const isValidCustomAttributesType = (value) => {
    if(!value)
        return null;

    switch (value) {
        case CustomAttributesTypeEnum.DATE:
            return CustomAttributesTypeEnum.DATE;
    
        case CustomAttributesTypeEnum.DECIMAL:
            return CustomAttributesTypeEnum.DECIMAL;
        
        case CustomAttributesTypeEnum.INTEGER:
            return CustomAttributesTypeEnum.INTEGER;
        
        case CustomAttributesTypeEnum.TEXT:
            return CustomAttributesTypeEnum.TEXT;
        
        case CustomAttributesTypeEnum.CURRENCY:
            return CustomAttributesTypeEnum.CURRENCY;

        case CustomAttributesTypeEnum.CHECKBOX:
            return CustomAttributesTypeEnum.CHECKBOX;

        case CustomAttributesTypeEnum.RADIO:
            return CustomAttributesTypeEnum.RADIO;

        default:
            return null;
    }
}

export const parseBooleanAttribute = (value) => {
    if(!value)
        return null;
    switch(value){
        case true:
            return 'true';
        case false:
            return 'false';
        default:
            return null;
    }
}