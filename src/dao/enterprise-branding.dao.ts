import { getConnection } from "commons/connection";
import { EnterpriseBranding } from "entities/enterprise-branding";


export class EnterpriseBrandingDAO {
    static async getByEnterpriseId(enterpriseId: number, brandingLogo?: string, brandingFavicon?: string){
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const enterpriseBranding = await EnterpriseBranding.getByEnterpriseId(enterpriseId, brandingLogo, brandingFavicon);
        console.log('DAO: Ending getByEnterpriseId');
        return enterpriseBranding;
    }

    static async saveBranding(enterpriseBranding: EnterpriseBranding){
        console.log('DAO: Starting save');
        await getConnection();
        const branding = await EnterpriseBranding.save(enterpriseBranding);
        console.log('DAO: Ending save');
        return branding;
    }


    static async save(enterpriseBranding: EnterpriseBranding): Promise<EnterpriseBranding> {
        console.log('DAO: Starting save');
        await getConnection();
        await enterpriseBranding.save();
        console.log('DAO: Ending save');
        return enterpriseBranding;
    }

    static async getEnterpriseBrandingById(enterpriseId: number){
        console.log('DAO: Starting getEnterpriseBrandingById');
        await getConnection();
        const enterpriseBranding = await EnterpriseBranding.getEnterpriseBrandingById(enterpriseId);
        console.log('DAO: Ending getEnterpriseBrandingById');
        return enterpriseBranding;
    }
}