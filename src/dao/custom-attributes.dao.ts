import { CreateEnterpriseCustomAttributes } from "commons/interfaces/enterprise.interface";
import { getConnection } from "commons/connection";
import { CatCustomAttributes } from "entities/cat-custom-attributes";


export class CustomAttributesDAO {

    static async getCustomAttributesByTypeAndName(createEnterpriseCA: CreateEnterpriseCustomAttributes) {
        console.log('DAO: Starting getCustomAttributesByTypeAndName');
        await getConnection();
        const cAttribute = await CatCustomAttributes.getByTypeAndName(createEnterpriseCA);
        console.log('DAO: Ending getCustomAttributesByTypeAndName');
        return cAttribute;
    }

    static async save(cAttribute: CatCustomAttributes) {
        console.log('DAO: Starting save');
        await getConnection();
        await CatCustomAttributes.save(cAttribute);
        console.log('DAO: Ending save');
    }

    static async deleteAttribute(attributeId: number) {
        console.log('DAO: Starting deleteAttribute');
        await getConnection();
        await CatCustomAttributes.deleteAttribute(attributeId);
        console.log('DAO: Ending deleteAttribute');
    }
}