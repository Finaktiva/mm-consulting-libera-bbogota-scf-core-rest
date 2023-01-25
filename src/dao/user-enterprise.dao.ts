import { getConnection } from 'commons/connection';
import { FilterEnterprises } from 'commons/filter';
import { UserEnterprise } from 'entities/user-enterprise';

export class UserEnterpriseDAO {

    static async save(userEnterprise: UserEnterprise) {
        console.log('DAO: Starting save...');
        await getConnection();
        const userEnterpriseSaved = await userEnterprise.save(); 
        console.log('DAO: Ending save...');
        return userEnterpriseSaved;
    }

    static async getByEnterpriseId(enterpriseId: number, filter: FilterEnterprises){
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const usersEnterprise = await UserEnterprise.getByEnterpriseId(enterpriseId, filter);
        console.log('DAO: Ending getByEnterpriseId');
        return usersEnterprise;
    }

    static async getByUserAndEnterpriseId(userId: number, enterpriseId: number){
        console.log('DAO: Starting getByUserAndEnterpriseId');
        await getConnection();
        const usersEnterprise = await UserEnterprise.getByUserAndEnterpriseId(userId, enterpriseId);
        console.log('DAO: Ending getByUserAndEnterpriseId');
        return usersEnterprise;
    }

    static async getByEnterpriseIdAndUserId(enterpriseId: number, userId: number) {
        console.log('DAO: Starting getByEnterpriseIdAndUserId');
        await getConnection();
        const usersEnterprise = await UserEnterprise.getByEnterpriseIdAndUserId(enterpriseId, userId);
        console.log('DAO: Ending getByEnterpriseIdAndUserId');
        return usersEnterprise;
    }
 
    static async getProviderContactInformation(enterpriseId: number, page: number, per_page: number) {
        console.log('DAO: Starting getProviderContactInformation');
        await getConnection();
        const usersEnterprise = await UserEnterprise.getProviderContactInformation(enterpriseId, page,per_page);
        console.log('DAO: Ending getProviderContactInformation');
        return usersEnterprise;
    }
}