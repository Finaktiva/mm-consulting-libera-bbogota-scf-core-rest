import { getConnection } from 'commons/connection';
import {Terms} from 'entities/terms';

export class TermsDAO {

    static async getLatestTerms() {
        console.log('DAO: Starting getLatestTerms...');
        await getConnection();
        const terms = await Terms.getLatestTerms();
        console.log('DAO: Ending getLatestTerms...');
        return terms;
    }

    static async getTermsById(termsId: number) {
        console.log('DAO: Starting getTermsById...');
        await getConnection();
        const terms = await Terms.getTermsById(termsId);
        console.log('DAO: Ending getTermsById...');
        return terms;
    }
    
}