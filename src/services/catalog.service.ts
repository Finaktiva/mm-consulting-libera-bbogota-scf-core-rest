import { CatalogDAO } from "dao/catalog.dao";
import { ICatLanguage } from "commons/interfaces/cat-language.interface";
import _ from "lodash";
import { CatBankRegion } from "entities/cat-bank-regions";
import { RelRatePeriodicityDAO } from "dao/rel-base-rate-periodicity.dao";
import { RelBaseRatePeriodicity } from "entities/rel_base_rate_periodicity";
import { IRatePeriodicityRelationResponse } from "commons/interfaces/catalogs/catalogs.interface";
import { Role } from "entities/role";
import { CatPermissionsDAO } from "dao/cat-permissions.dao";
import { BadRequestException, ConflictException, NotFoundException } from "commons/exceptions";
import moment, { Moment } from 'moment-timezone';
import { RoleDAO } from "dao/role.dao";
import { RelRolePermission } from "entities/rel-role-permission";
import { RelRolePermissionsDAO } from "dao/rel-role-permissions.dao";
import LiberaUtils from "commons/libera.utils";
import { CatPermission } from "entities/cat-permissions";
import { UserDAO } from "dao/user.dao";
import { CatRoleAppliesToEnum, CatRoleFilterEnum, CatRoleStatusEnum } from "commons/enums/cat-role.enums";
import { User } from 'entities/user';
import { IRolesWithUsersAssociated } from "commons/interfaces/catalogs";
import { FilterUserTypeEnum } from "commons/enums/filter-by.enum";



export class CatalogService {

    static async getLadas(){
        console.log ('SERVICE: Starting getLadas');
        const ladas = await CatalogDAO.getLadas();
        
        console.log('SERVICE: Ending getLadas');
        return ladas.map(ladas => (
            {
                id: +ladas.id,
                code: ladas.lada,
                country: ladas.country
            }
        ));
    }

    static async getSectors(){
        console.log('SERVICE: Starting getSector');
        const sectors = await CatalogDAO.getSectors();
        console.log('SERVICE: Ending getSectors');

        return sectors.map(sectors => (
            {
                id: +sectors.id,
                name: sectors.name
            }
        ))
    }

    static async getAllCurrencyCodes() {
        console.log('SERVICE: Starting getAllCurrencyCodes');
        const currency = await CatalogDAO.getAllCurrencyCodes();
        console.log('SERVICE: Ending getAllCurrencyCodes');
        return currency;
    }

    static async getAllLanguages() {
        console.log('SERVICE: Starting getAllLanguages...');

        const result = await CatalogDAO.getAllLanguages();
        const languages: ICatLanguage[] = result[0].map(lang => ({
            code: lang.code,
            description: lang.description
        }));
        const total = result[1];
        
        console.log('SERVICE: Ending getAllLanguages');
        return { languages, total }
    }

    static async getCitiesAndDepartments(){
        console.log("SERVICE: Starting getCitiesAndDepartments");
        const result = await CatalogDAO.getCitiesAndDepartments();
        const cities = result[0].map(data=>({
            cityCode: data.COD_CIU,
            cityName: data.CIUD
        }));

        const departments = result[0].map(data=>({
            departmentCode: data.COD_DEP,
            departmentName: data.DPTO
        }));

        const noRepeatedDepartments = departments.filter((v,i,a)=>a.findIndex(v2=>(v2.departmentCode===v.departmentCode))===i)

        console.log("SERVICE: Ending getCitiesAndDepartments");
        return [cities, noRepeatedDepartments];

    }

    static async getBanks(){
        console.log("SERVICE: Starting getBanks");
        const result = await CatalogDAO.getBanks();

        console.log("SERVICE: Ending getBanks");
        return result;
    }

    static async getBanksByCode(code: string) {
        console.log("SERVICE: Starting getBanksByCode function");
        const result = await CatalogDAO.getBankByCode(code);

        console.log("SERVICE: Ending getBanksByCode function");
        return result;
    }

    static async getDocuments(isDefault: boolean) {
        console.log("SERVICE: Starting getDocuments");
        const result = await CatalogDAO.getDocuments(isDefault);

        console.log("SERVICE: Ending getDocuments");
        return result;
    }
    static async getAllRatePeriodicityRelations(): Promise<IRatePeriodicityRelationResponse[]>{
        console.log("SERVICE: Starting getAllRatePeriodicityRelations");
        const ratesTypeList: RelBaseRatePeriodicity[] = await RelRatePeriodicityDAO.getAllRatePeriodicityRelations();
        const differentTypes: string[] = [];
        ratesTypeList.forEach(type => differentTypes.push(type.baseRateType.code));        

        let uniqueTypes = [...new Set(differentTypes)];
        let coreArray = [];
        for (const uniqType of uniqueTypes) {
            let typesfiltered = ratesTypeList.find(type => type.baseRateType.code === uniqType);
            coreArray.push(typesfiltered);
        }
        let finalArray: IRatePeriodicityRelationResponse[]  = coreArray.map(type => {
            return {
                code: type.baseRateType.code,
                description: type.baseRateType.description,
                periodicityTypes: []
            }
        });

        ratesTypeList.forEach(rateType => 
            finalArray.forEach(finalElement => {
                if(finalElement.code === rateType.baseRateType.code)
                    finalElement.periodicityTypes.push(rateType.basePeriodicityType.code);
            })
        );

        console.log("SERVICE: Ending getAllRatePeriodicityRelations");
        return finalArray;
    }

    static async getAllRegions(): Promise<CatBankRegion[]>{
        console.log("SERVICE: Starting getAllRegions");
        const result: CatBankRegion[] = await CatalogDAO.getAllRegions();

        console.log("SERVICE: Ending getAllRegions");
        return result;
    }

    static async getAllRoles(user_type: string, filter_by: string, q: string, proximity_search: boolean, page:string , per_page: string): Promise<[IRolesWithUsersAssociated[],number]>{
        console.log("SERVICE: Starting getAllRoles");

        const [roles,total]: [Role[],number] = await CatalogDAO.getAllRoles(user_type, filter_by, q, proximity_search, page, per_page);

        const rolesWithUsersAssociated: IRolesWithUsersAssociated[] = [];

        for(let i= 0 ; i < roles.length; i++){
            const role = roles[i];
            const associatedUsers = await RoleDAO.countUsersByRole(role.name);
            rolesWithUsersAssociated.push({
                name: role.name,
                description: role.description,
                appliesTo: role.appliesTo,
                status: role.status,
                creationDate: moment(role.creationDate).format('YYYY-MM-DD'),
                modificationDate: role.modificationDate ? moment(role.modificationDate).format('YYYY-MM-DD') : null,
                acronym: role.acronym,
                associatedUsers
            });
        }
        console.log("SERVICE: Ending getAllRoles");
        return [rolesWithUsersAssociated,total];
    }

    static async createRole(reqBody, userId) {
        console.log("SERVICE: Starting createRole");
        const permissionsCatalog : CatPermission[] = await CatPermissionsDAO.getAllPermissions();
        const [roles,total]: [Role[],number] = await CatalogDAO.getAllRoles(null,null,null,null,null,null);

        
        const { permissions, acronym, description } = reqBody;

        const acronymRole = roles.find(item => item.acronym === acronym);

        if(acronymRole) {
            throw new ConflictException('SCF.LIBERA.355');
        }

        for ( let permission of permissions ) {
            const exits =  permissionsCatalog.find(perm => perm.code === permission && ( perm.appliesToUserType === 'BOTH' || perm.appliesToUserType === 'LIBERA_USER' ) ) 
            
            if( !exits ) {
                throw new ConflictException('SCF.LIBERA.356', {permission});
            }
        }

        const name : String = LiberaUtils.roleNameParser(description);

        const user = await UserDAO.getUserById(userId);

        const role = new Role();

        role.acronym = acronym;
        role.description = description;
        role.name = name;
        role.appliesTo = CatRoleAppliesToEnum.LIBERA_USER;
        role.status = CatRoleStatusEnum.ENABLED;
        role.isVisible = true;
        role.creationDate = moment().tz('UTC').toDate();
        role.creationUser = user;

        const roleDB : Role  = await RoleDAO.save(role);

        for(let permission of permissions){
            const relRolePermission = new RelRolePermission();
            relRolePermission.role = roleDB;
            relRolePermission.permission = permission;
            relRolePermission.creationDate = moment().tz('UTC').toDate();
            await RelRolePermissionsDAO.save(relRolePermission);
        }
        
        console.log("SERVICE: Ending createRole");
        return roleDB;
    }

    static async updateRole(reqBody, userId: number , code: string): Promise<void>{
        console.log("SERVICE: Starting updateRole");

        const {permissions,acronym} = reqBody;

        const role: Role = await RoleDAO.getRoleByCode(code);

        if(!role)
            throw new NotFoundException('SCF.LIBERA.357');

        if(role.status !== 'ENABLED')
            throw new ConflictException('SCF.LIBERA.358');

        const permissionsCatalog : CatPermission[] = await CatPermissionsDAO.getAllPermissions();
        
        for ( let permission of permissions ) {
            const exits =  permissionsCatalog.find(perm => perm.code === permission && ( perm.appliesToUserType === 'BOTH' || perm.appliesToUserType === 'LIBERA_USER' ) ) 
            
            if( !exits ) {
                throw new ConflictException('SCF.LIBERA.356', {permission});
            }
        }

        const existsAcronym: Role = await RoleDAO.getRoleByAcronym(acronym);
    
        if(existsAcronym && existsAcronym.name !== role.name)
            throw new ConflictException('SCF.LIBERA.355');
            
        const user: User = await UserDAO.getUserById(userId);

        role.acronym = acronym;
        role.modificationDate = moment().tz('UTC').toDate();
        role.modificationUser = user;

        await RoleDAO.save(role);
        
        await RelRolePermissionsDAO.deleteByRole(role.name);

        for(let permission of permissions){
            const relRolePermission = new RelRolePermission();
            relRolePermission.role = role;
            relRolePermission.permission = permission;
            relRolePermission.creationDate = moment().tz('UTC').toDate();
            await RelRolePermissionsDAO.save(relRolePermission);
        }

        console.log("SERVICE: Ending updateRole");
    }

    static async getRoleInformation (code){
        console.log("SERVICE: Starting getRoleInformation");
        const role: Role = await RoleDAO.getRoleByCode(code);

        if(!role)
            throw new NotFoundException('SCF.LIBERA.357');
        
        if(!role.isVisible)
            throw new NotFoundException('Role is not visible');

        const associatedUsers : number = await RoleDAO.countUsersByRole(role.name);

        const permissions: RelRolePermission[] = await RelRolePermissionsDAO.getPermissionsByRole(role.name);

        console.log("SERVICE: Ending getRoleInformation");

        return {
            role,
            associatedUsers,
            permissions
        }
    }

    static async updateRoleStatus (code, status) {
        console.log("SERVICE: Starting updateRoleStatus");
        const role: Role = await RoleDAO.getRoleByCode(code);

        const exitsEnum = Object.values(CatRoleStatusEnum).find(item => item === status);

        if(!exitsEnum)
            throw new BadRequestException('SFC.LIBERA.365');
            
        if(!role)
            throw new NotFoundException('SCF.LIBERA.357');

        const associatedUsers : number = await RoleDAO.countUsersByRole(role.name);

        if(associatedUsers !== 0)
            throw new ConflictException('SFC.LIBERA.366');

        role.status = status;

        await RoleDAO.save(role);

        console.log("SERVICE: Ending updateRoleStatus");
    }

    static async getAllPermissions(userType?: FilterUserTypeEnum): Promise<CatPermission[]> {
        console.log("SERVICE: Starting getAllPermissions");
        
        if(userType)
            console.log(`user type received: ${userType}`);

        const permissions: CatPermission[] = await CatalogDAO.getAllPermissions(userType);

        console.log("SERVICE: Ending getAllPermissions");

        return permissions;
    }
}