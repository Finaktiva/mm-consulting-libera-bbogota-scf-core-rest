import { EnterpriseCustomAttributes } from "entities/enterprise-custom-attributes";
import { getConnection } from "commons/connection";
import { CreateEnterpriseCustomAttributes } from "commons/interfaces/enterprise.interface";


export class EnterpriseCustomAttributesDAO {
    
    static async save(eCustomAttribute: EnterpriseCustomAttributes) {
        console.log('DAO: Starting save');
        await getConnection();
        await EnterpriseCustomAttributes.save(eCustomAttribute);
        console.log('DAO: Ending save');
    }

    static async getManyByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getManyByEnterpriseId');
        await getConnection();
        const eCustomAttributes = await EnterpriseCustomAttributes.getManyByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getManyByEnterpriseId');
        return eCustomAttributes;
    }

    static async deleteEnterpriseCustomAttribute(enterpriseId: number, attributeId: number) {
        console.log('DAO: Starting deleteEnterpriseCustomAttribute');
        await getConnection();
        const deleteEnterpriseCustomAttribute = await EnterpriseCustomAttributes.deleteEnterpriseCustomAttribute(enterpriseId, attributeId);
        console.log('DAO: Ending deleteEnterpriseCustomAttribute');        
        return deleteEnterpriseCustomAttribute;
    }

    static async getByAttributeId(attributeId: number) {
        console.log('DAO: Starting getByAttributeId');
        await getConnection();
        const attributes = await EnterpriseCustomAttributes.getByAttributeId(attributeId);
        console.log('att',attributes );
        
        console.log('DAO: Ending getByAttributeId');
        return attributes;
    }

    static async getByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const eCustomAttributes = await EnterpriseCustomAttributes.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getByEnterpriseId');
        return eCustomAttributes;
    }

    static async deleteEnterpriseCA(enterpriseCustomAttributes: EnterpriseCustomAttributes[]) {
        console.log('DAO: Starting deleteEnterpriseCA');
        await getConnection();
        await EnterpriseCustomAttributes.remove(enterpriseCustomAttributes);
        console.log('DAO: Ending deleteEnterpriseCA');
    }

    static async getByEnterpriseIdTypeAndName(enterpriseId: number, createEnterpriseCA: CreateEnterpriseCustomAttributes) {
        console.log('DAO: Starting getByEnterpriseIdTypeAndName');
        await getConnection();
        const eCustomAttributes = await EnterpriseCustomAttributes.getByEnterpriseIdTypeAndName(enterpriseId, createEnterpriseCA);
        console.log('DAO: Ending getByEnterpriseIdTypeAndName');
        return eCustomAttributes;
    }
}