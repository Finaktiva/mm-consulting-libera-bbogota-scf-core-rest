import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { EnterpriseTypeEnum } from 'commons/enums/enterprise-type-enum';

export interface ILenderPayer {
    id: number,
    enterpriseName: string,
    nit: string,
    sector: {
        id: number,
        name: string
    },
    enterpriseType: EnterpriseTypeEnum,
    owner: IOwnerPayer,
    customAttributes: ICustomAttribute[]
}

export interface IOwnerPayer {
    name: string,
    firstSurname: string,
    secondSurname: string,
    email: string
}

export interface ICustomAttribute {
    id: number,
    name: string,
    attributeId: number,
    value?: string,
    type: CustomAttributesTypeEnum,
    options?: IOptionCustomAttribute[]
}

export interface IOptionCustomAttribute {
    id: number,
    value: string,
    isChecked?: boolean
}

export interface IAnswerOptions {
    answerId: number,
    optionId: number
}