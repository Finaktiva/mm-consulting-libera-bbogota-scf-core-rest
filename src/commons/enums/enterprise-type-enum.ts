export enum EnterpriseTypeEnum {
    PRIVATE = 'PRIVATE',
    PUBLIC = 'PUBLIC',
    MIXED = 'MIXED',
    SELF_MANAGEMENT = 'SELF_MANAGEMENT',
}

export const isEnterpriseTypeValid = (value: string)  => {
    if(!value) return null;

    switch (value) {
        case EnterpriseTypeEnum.MIXED:
            return EnterpriseTypeEnum.MIXED;
        case EnterpriseTypeEnum.PRIVATE:
            return EnterpriseTypeEnum.PRIVATE;
        case EnterpriseTypeEnum.PUBLIC:
            return EnterpriseTypeEnum.PUBLIC;
        case EnterpriseTypeEnum.SELF_MANAGEMENT:
            return EnterpriseTypeEnum.SELF_MANAGEMENT
        default:
            return null;
    }
}

export const parseEnterpriseType = (value: string)  => {
    if(!value) return null;

    switch (value) {
        case EnterpriseTypeEnum.MIXED:
            return EnterpriseTypeEnum.MIXED;
        case EnterpriseTypeEnum.PRIVATE:
            return EnterpriseTypeEnum.PRIVATE;
        case EnterpriseTypeEnum.PUBLIC:
            return EnterpriseTypeEnum.PUBLIC;
        case EnterpriseTypeEnum.SELF_MANAGEMENT:
            return EnterpriseTypeEnum.SELF_MANAGEMENT
        default:
            return null;
    }
}