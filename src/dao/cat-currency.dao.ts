import { getConnection } from "commons/connection";
import { CatCurrency } from "entities/cat-currency";


export class CatCurrencyDAO {

    static async getByCode(code: string) {
        console.log('DAO: Starting getByCode');
        await getConnection();
        const currency = await CatCurrency.getByCode(code);
        console.log('DAO: Ending getByCode');
        return currency;
    }

    static async getCurrencyCode(invoiceId: number):Promise<CatCurrency> {
        console.log('DAO: Starting getCurrencyCode');
        await getConnection();
        const currency = await CatCurrency.getCurrencyCode(invoiceId);
        console.log('DAO: Ending getCurrencyCode');
        return currency;
    }
}