import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';

export interface ILenderCustomAttribute {
    id: number;
    name: string;
    type: CustomAttributesTypeEnum;
    options?: OptionsAttribute[];
    creationDate: Date;
}

export interface OptionsAttribute {
    id: number;
    value: string;
}