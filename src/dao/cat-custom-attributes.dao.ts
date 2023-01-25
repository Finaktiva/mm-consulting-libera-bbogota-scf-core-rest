import { getConnection } from "commons/connection";
import { CatCustomAttributes } from "entities/cat-custom-attributes";
import { CustomAttributesTypeEnum } from "commons/enums/custom-attributes-type.enum";


export class CatCustomAttributesDAO {
    
    static async getById(attributeId: number) {
        console.log('DAO: Starting getById');
        await getConnection();
        const attribute = await CatCustomAttributes.getByCustomAttribute(attributeId);
        console.log('DAO: Ending getById');        
        return attribute;
    }

    static async create(catCustomAttribute: CatCustomAttributes) {
        console.log('DAO: Starting create method');
        await getConnection();
        const customAttribute = await catCustomAttribute.save();
        console.log('DAO: Starting create method');
        return customAttribute;
    }

    static async update(catCustomAttribute: CatCustomAttributes) {
        console.log(`DAO: Starting update method`);
        await getConnection();
        const customAttribute = await CatCustomAttributes.update({ id: catCustomAttribute.id }, catCustomAttribute);
        console.log(`DAO: Ending update method`);
        return customAttribute;
    }

    static async validateByTypeAndName( name: string, attributeType: CustomAttributesTypeEnum) {
        console.log(`DAO: Starting GET method validateByTypeAndName`);
        await getConnection();
        const customAttribute = CatCustomAttributes.getvalidateByTypeAndName(name, attributeType);
        console.log(`DAO: Ending GET method validateByTypeAndName`);
        return customAttribute;
    }
}