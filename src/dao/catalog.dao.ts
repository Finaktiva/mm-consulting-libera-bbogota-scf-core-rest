import { getConnection } from "commons/connection";
import { CatLada } from "entities/cat-lada";
import { CatSector } from "entities/cat-sector";
import { CatCurrency } from "entities/cat-currency";
import { CatLanguage } from "entities/cat-language";
import { CitiesDepartments } from "entities/cities-departments";
import { Banks } from "entities/banks";
import { InternalServerException } from "commons/exceptions";
import { CatDocumentType } from "entities/cat-document-type";
import { CatBankRegion } from "entities/cat-bank-regions";
import { Role } from "entities/role";
import { CatPermission } from "entities/cat-permissions";
import { FilterUserTypeEnum } from "commons/enums/filter-by.enum";

export class CatalogDAO {
 
    static async getLadas(){
        console.log('DAO: Starting getLadas...');
        await getConnection();
        
        const ladas = await CatLada.getLadas();
        console.log('DAO: Ending getLadas...');
        return ladas;
    }

    static async getSectors(){
        console.log('DAO: Starting getSectors...');

        await getConnection();        
        const sectors = await CatSector.getSectors();

        console.log('DAO: Ending getSectors...');
        return sectors;
    }

    static async getAllCurrencyCodes() {
        console.log('DAO: Starting getAllCurrencyCodes...');
        await getConnection();        
        const currency = await CatCurrency.getAllCurrencyCodes();
        console.log('DAO: Ending getAllCurrencyCodes...');
        return currency;
    }

    static async getAllLanguages() {
        console.log('DAO: Starting getAllLanguages...');
        await getConnection();        
        const result = await CatLanguage.getAllLanguages();
        console.log('DAO: Ending getAllLanguages...');
        return result;
    }

    static async getCitiesAndDepartments(){
        console.log('DAO: Starting getCitiesAndDepartments...');
        await getConnection();
        const result = await CitiesDepartments.getAllCitiesDepartments();
        console.log('DAO: Ending getCitiesAndDepartments...');
        return result;

    }

    static async getBanks(){
        console.log('DAO: Starting getAllBanks...');
        await getConnection();
        const result = await Banks.getAllBanks();
        console.log('DAO: Ending getAllBanks...');
        return result;
    }

    static async getBankByCode(code: string): Promise<Banks> {
        console.log('DAO: Starting getBankByCode function');
        try {
            await getConnection();

            const banks: Banks = await Banks.findOne(code);
            console.log('DAO: Ending getBankByCode function');
            return banks;
        }
        catch(errors) {
            console.error('DAO ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
    }

    static async getDocuments(isDefault: boolean){
        console.log('DAO: Starting getDocuments...');
        await getConnection();
        const result = await CatDocumentType.getDocuments(isDefault);
        console.log('DAO: Ending getDocuments...');
        return result;
    }

    static async getDptoCiudRelation(city: string, department: string){
        console.log('DAO: Starting getDptoCiudRelation...');
        await getConnection();
        const result = await CitiesDepartments.getDptoCiudRelation(city, department);
        console.log('DAO: Ending getDptoCiudRelation...');

        return result;
    }

    static async getAllRegions():Promise<CatBankRegion[]> {
        console.log('DAO: Starting getAllRegions...');
        await getConnection();
        const result: CatBankRegion[] = await CatBankRegion.getAllRegions();
        console.log('DAO: Ending getAllRegions...');

        return result;
    }

    static async getRegionById(id: number):Promise<CatBankRegion> {
        console.log('DAO: Starting getRegionById...');
        await getConnection();
        const result: CatBankRegion = await CatBankRegion.getRegionById(id);
        console.log('DAO: Ending getRegionById...');

        return result;
    }

    static async getAllRoles(user_type: string, fliter_by: string, q : string, proximity_search: boolean, page:string, per_page:string):Promise<[Role[],number]> {
        console.log('DAO: Starting getAllRoles...');
        await getConnection();
        const result: [Role[],number] = await Role.getAllRoles(user_type, fliter_by, q, proximity_search, page, per_page);
        console.log('DAO: Ending getAllRoles...');

        return result;
    }

    static async getAllPermissions(userType?: FilterUserTypeEnum):Promise<CatPermission[]> {
        console.log('DAO: Starting getAllPermissions...');
        await getConnection();
        const permissions: CatPermission[] = await CatPermission.getAllPermissions(userType);
        console.log('DAO: Ending getAllPermissions...');

        return permissions;
    }

}