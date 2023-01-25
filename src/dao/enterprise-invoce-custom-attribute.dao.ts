import { getConnection } from "commons/connection";
import { EnterpriseInvoiceCustomAttributes } from "entities/enterprise-invoice-custom-attributes";

export class EnterpriseInvoceCustomAttributesDAO {

    static async getByAttributeId(attributeId: number) {
        console.log('DAO: Starting getByAttributeId');
        await getConnection();
        const customAttributes = await EnterpriseInvoiceCustomAttributes.getByAttributeId(attributeId);
        console.log('DAOcustomAttributes', customAttributes);
        
        console.log('DAO: Ending getByAttributeId');
        return customAttributes;        
    }

    static async deleteCustomAttributes(invoiceId: number) {
        console.log('DAO: Starting deleteCustomAttributes');
        await getConnection();
        await EnterpriseInvoiceCustomAttributes.deleteInvoiceCA(invoiceId);
        console.log('DAO: Ending deleteCustomAttributes');
    }
}