import { EnterpriseInvoiceCustomAttributes } from "entities/enterprise-invoice-custom-attributes";
import { getConnection } from "commons/connection";
import { InvoiceCA } from "commons/interfaces/invoice.interface";

export class EnterpriseInvoiceCustomAttributesDAO {

    static async saveCustomAttributes(eInvoiceCustomAttributes: EnterpriseInvoiceCustomAttributes){
        console.log('DAO: Starting saveCustomAttributes');
        await getConnection();
        const save = await EnterpriseInvoiceCustomAttributes.save(eInvoiceCustomAttributes);
        console.log('DAO: Ending saveCustomAttributes');
        return save;
    }

    static async getCustomAttributesById(attributeId: number){
        console.log('DAO: Starting getCustomAttributesById');
        await getConnection();
        const cAtrributes = await EnterpriseInvoiceCustomAttributes.getByAttributeId(attributeId);
        console.log('DAO: Ending getCustomAttributesById');
        return cAtrributes;
    }

    static async getCustomAttributesByIdAndBulk(cABulk: InvoiceCA[]){
        console.log('DAO: Starting getCustomAttributesByIdAndBulk');
        await getConnection();
        let CustomABulk: EnterpriseInvoiceCustomAttributes[] = [];
        let ca: EnterpriseInvoiceCustomAttributes;
        for(let CA of cABulk) {
            ca = await EnterpriseInvoiceCustomAttributes.getByAttributeId(CA.id);                
            CustomABulk.push(ca);
        }
        console.log('DAO: Ending getCustomAttributesByIdAndBulk');
        return CustomABulk;
    }
}