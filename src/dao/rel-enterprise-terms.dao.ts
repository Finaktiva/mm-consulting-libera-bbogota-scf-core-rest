import { getConnection } from 'commons/connection';
import { RelEnterpriseTerms } from 'entities/rel-enterprise-terms';

export class RelEnterpriseTermsDAO {

    static async save(relEnterpriseTerms: RelEnterpriseTerms) {
        console.log('DAO: Starting save method');
        await getConnection();
        await relEnterpriseTerms.save();
        console.log('DAO: Ending save method');
    }

    static async getByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getByEnterpriseId method');
        await getConnection();
        const relEnterpriseTerms = await RelEnterpriseTerms.getByEnterpriseId(enterpriseId)
        console.log('DAO: Ending getByEnterpriseId method');
        return relEnterpriseTerms;
    }

}