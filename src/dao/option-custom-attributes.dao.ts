import { getConnection } from 'commons/connection';
import { OptionCustomAttributes } from 'entities/option-custom-attributes';

export class OptionCustomAttributesDAO {

    static async create(optionCustomAttribute: OptionCustomAttributes) {
        console.log('DAO: Starting create method');
        await getConnection();
        await optionCustomAttribute.save();
        console.log('optionCustomAttributeCreated', optionCustomAttribute);
        console.log('DAO: Ending create method');
    }

    static async getById(optionId: number) {
        console.log('DAO: Starting getById method');
        await getConnection();
        const result = await OptionCustomAttributes.getById(optionId);
        console.log('DAO: Ending getById method');
        return result;
    }

    static async getOptionsByAttributeId(attributeId: number): Promise<OptionCustomAttributes[]> {
        console.log(`DAO: Starting getOptionsByAttributeId`);
        await getConnection();
        const result = await OptionCustomAttributes.getOptionsByAttributeId(attributeId);
        console.log(`DAO: Ending getOptionsByAttributeId`);
        return result;
    }

    static async getOptionsByLenderCustomAttributesId(lenderCustomAttributesId: number) {
        console.log(`DAO: Starting getOptionsByLenderCustomAttributesId method`);
        await getConnection();
        const result = await OptionCustomAttributes.getOptionsByLenderCustomAttributesId(lenderCustomAttributesId);
        console.log(`DAO: Ending getOptionsByLenderCustomAttributesId method`);
        return result;
    }
}