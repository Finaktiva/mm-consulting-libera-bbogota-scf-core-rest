import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { IOptionCustomAttribute } from './lender-payer.interface';

export interface ICustomAttribute {
    id?: number;
    name: string;
    type: CustomAttributesTypeEnum;
    options?: IOptionCustomAttribute[];
    userId?: number;
    creationDate?: Date;
}