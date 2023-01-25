import { getConnection } from "commons/connection";
import { EnterpriseFundingTransactions } from "entities/enterprise-funding-transaccions";

export class EnterpriseFundingTransactionsDAO {
    
    static async getById(transactionId: number){
        console.log('DAO: Starting getById method');
        await getConnection();
        const result = await EnterpriseFundingTransactions.getById(transactionId);
        console.log('result', result);
        return result;
    }
    
    static async update(transaction: EnterpriseFundingTransactions) {
        console.log('DAO: Starting updateFundingTransactionStatus');
        await getConnection();
        await EnterpriseFundingTransactions.update({ id: transaction.id }, transaction);
        console.log('DAO: Ending updateFundingTransactionStatus')
    }
    /**@description Finds a funding transaction by id
     * @param  {number} transactionId
     * @returns {Promise<EnterpriseFundingTransactions>}
     * @author oramirez
     * @author festrada
     */
    static async getBasicById(transactionId: number): Promise<EnterpriseFundingTransactions>{
        console.log('DAO: Starting getById method');
        await getConnection();
        const result = await EnterpriseFundingTransactions.getBasicById(transactionId);
        console.log('DAO: Ending getById method');
        return result;
    }
}