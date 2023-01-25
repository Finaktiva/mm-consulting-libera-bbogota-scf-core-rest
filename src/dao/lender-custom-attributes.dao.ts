import { getConnection } from 'commons/connection';
import { CustomAttributesTypeEnum } from 'commons/enums/custom-attributes-type.enum';
import { LenderCustomAttributesOrderBy } from 'commons/filter';
import { LenderCustomAttributes } from 'entities/lender-custom-attributes';

export class LenderCustomAttributesDAO {

    static async getByLenderId(lenderId: number, orderBy: LenderCustomAttributesOrderBy) {
        console.log('DAO: Starting getByLenderId method');
        await getConnection();
        const lenderCustomAttributesResult = await LenderCustomAttributes.getByLenderId(lenderId, orderBy);
        console.log('lenderCustomAttributesResult', lenderCustomAttributesResult);
        console.log('DAO: Ending getByLenderId method');
        return lenderCustomAttributesResult;
    }

    static async create(lenderCustomAttributes: LenderCustomAttributes) {
        console.log('DAO: Starting create method');
        await getConnection();
        await lenderCustomAttributes.save();
        console.log('lenderCustomAttributesCreted', lenderCustomAttributes);
        console.log('DAO: Ending create method');
    }

    /*
    static async getByLenderIdAndAttribute(lenderId: number, attributeId: number) {
        console.log('DAO: Starting getByLenderIdAndAttribute method');
        await getConnection();
        const result = await LenderCustomAttributes.getByLenderIdAndAttribute(lenderId, attributeId);
        console.log('DAO: Ending getByLenderIdAndAttribute method');
        return result;
    }
    */

    static async getById(customAttributeId: number) {
        console.log('DAO: Starting getById method');
        await getConnection();
        const result = await LenderCustomAttributes.getById(customAttributeId);
        console.log('DAO: Ending getById method');
        return result;
    }

    static async update(lenderCustomAttributes: LenderCustomAttributes) {
        console.log('DAO: Starting update method');
        await getConnection();
        await LenderCustomAttributes.update({ id: lenderCustomAttributes.id }, lenderCustomAttributes);
        console.log('DAO: Ending update method');
    }

    /*
    static async getAnswersByLinkId(lenderCustomAttributeLinkId: number) {
        console.log(`DAO: Starting getAnswersByLinkId method`);
        await getConnection();
        const result = LenderCustomAttributes.getAnswersByLinkId(lenderCustomAttributeLinkId);
        console.log(`DAO: Ending getAnswersByLinkId method`);
        return result;
    }
    */

    static async validateByNameAndType(lenderId: number, name: string, attributeType: CustomAttributesTypeEnum) {
        console.log('DAO: Starting validateByNameAndType method');
        await getConnection();
        const lenderCustomAttribute = await LenderCustomAttributes.validateByNameAndType(lenderId, name, attributeType);
        console.log('lenderCustomAttribute', lenderCustomAttribute);
        console.log('DAO: Ending validateByNameAndType method');
        return lenderCustomAttribute;
    }

    static async delete(lenderCustomAttributes: LenderCustomAttributes) {
        console.log('DAO: Starting delete method');
        await getConnection();
        await LenderCustomAttributes.deleteByLenderIdAndAttributeId(lenderCustomAttributes.lender.id, lenderCustomAttributes.customAttribute.id);
        console.log('lenderCustomAttributesCreted', lenderCustomAttributes);
        console.log('DAO: Ending delete method');
    }

    static async getByLenderIdAndCatCustomAttrId(lenderId: number, catCustomAttributeId: number): Promise<LenderCustomAttributes> {
        console.log('DAO: Starting getByLenderIdAndCatCustomAttrId method');
        await getConnection();
        const result = await LenderCustomAttributes.getByLenderIdAndCatCustomAttrId(lenderId, catCustomAttributeId);
        console.log('DAO: Ending getByLenderIdAndCatCustomAttrId method');
        return result;
    }
}