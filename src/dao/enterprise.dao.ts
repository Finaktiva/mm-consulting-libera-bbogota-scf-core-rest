import { getConnection } from 'commons/connection';
import { FilterEnterprises } from 'commons/filter';
import { Enterprise } from 'entities/enterprise';
import { EnterpriseDocumentation } from 'entities/enterprise-documentation';
import { EnterpriseModule } from 'entities/enterprise-module';
import { UserDAO } from './user.dao';
import { Connection } from 'typeorm';
import { User } from 'entities/user';
import { UserProperties } from 'entities/user-properties';
import { UserPropertiesDAO } from './user-properties.dao';
import { EnterpriseModuleDAO } from './enterprise-module.dao';
import { UserRoleDAO } from './user-role.dao';
import { UserModuleDAO } from './user-module.dao';
import { UserModule } from 'entities/user-module';
import { UserRole } from 'entities/user-role';
import { EnterpriseInvoice } from 'entities/enterprise-invoice';
import { IFilterLenders } from 'commons/interfaces/query-filters.interface';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { EnterpriseBranding } from 'entities/enterprise-branding';
import { EnterpriseBrandingDAO } from './enterprise-branding.dao';

export class EnterpriseDAO{
    
    static async getEnterprise(filter: FilterEnterprises){
        console.log('DAO: Starting getEnterprise');
        await getConnection();
        const enterprisesTotal = await Enterprise.getEnterprise(filter);
        console.log('DAO: Ending getEnterprise');
        return enterprisesTotal;
    }

    static async updateEnterpriseAndOwner(enterprise: Enterprise): Promise<void> {
        console.log('DAO: Starting updateEnterpriseAndOwner');
        const connection:Connection = await getConnection();

        await connection.getRepository(Enterprise).update(enterprise.id, enterprise);
        await connection.getRepository(User).update(enterprise.owner.id,enterprise.owner);

        console.log('DAO: Ending updateEnterpriseAndOwner');

    }

    static async getEnterpriseAndOwnerByDocumentTypeAndNumber(nit : string, documentType: string) {
        console.log('DAO: Starting getEnterpriseAndOwnerByDocumentTypeAndNumber');
        console.log('documentNumber received: ', nit);
        console.log('documentType received: ', documentType);
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseAndOwnerByDocumentTypeAndNumber(nit, documentType);
        console.log('DAO : Ending getEnterpriseAndOwnerByDocumentTypeAndNumber');
        return enterprise;
    }

    static async saveEnterprise(enterprise: Enterprise): Promise<Enterprise> {
        console.log('DAO: Starting saveEnterprise');
        await getConnection();
        const createdEnterprise = await enterprise.save();
        console.log('DAO: Ending saveEnterprise');
        return createdEnterprise;
    }

    static async getEnterpriseByUserId(userId: number): Promise<Enterprise> {
        console.log('DAO: Starting getEnterpriseByUserId');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByUserId(userId);
        console.log('DAO: Ending getEnterpriseByUserId');
        return enterprise;
    }

    static async getEnterpriseByOwnerIdAndEnterpriseId(enterpriseId:number, ownerId:number){
        console.log('DAO: Starting getEnterpriseByOwnerIdAndEnterpriseId method');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByOwnerIdAndEnterpriseId(ownerId,enterpriseId);
        console.log('DAO: Finished getEnterpriseByOwnerIdAndEnterpriseId method');
        return enterprise;
    }
    
    static async getEnterpriseByNit(nit : string) {
        console.log('DAO: Starting getEnterpriseByNit');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByNit(nit);
        console.log('DAO : Ending getEnterpriseByNit');
        return enterprise;
    }
    
    static async getEnterpriseByNIT(nit : string) {
        console.log('DAO: Starting getEnterpriseByNIT');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByNIT(nit);
        console.log('DAO : Ending getEnterpriseByNIT');
        return enterprise;
    }

    static async getEnterpriseToLinkByNIT(nit : string) {
        console.log('DAO: Starting getEnterpriseToLinkByNIT');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseToLinkByNIT(nit);
        console.log('DAO : Ending getEnterpriseToLinkByNIT');
        return enterprise;
    }

    static async getEnterpriseById(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseById method');
        await getConnection();
        const enterprise = await Enterprise.getById(enterpriseId);
        console.log('DAO: Ending getEnterpriseById method');
        return enterprise;
    }

    static async getBasicEnterpriseById(enterpriseId: number){
        console.log('DAO: Starting getBasicEnterpriseById');
        await getConnection();
        const enterprise = await Enterprise.getBasicEnterpriseById(enterpriseId);
        console.log('DAO: Ending getBasicEnterpriseById');
        return enterprise;
    }

    static async deleteUserAndEnterpriseById(userId: number, enterpriseId: number) {
        console.log ('DAO: starting deleteUserAndEnterpriseById...');
        await getConnection();
        console.log(`userId >>>> ${userId} enterpriseId >>>>> ${enterpriseId}`);
        await EnterpriseDocumentation.deleteEnterpriseDocumentationById(enterpriseId);
        console.log('deleteEnterpriseDocumentationById >>>>>');

        await EnterpriseModule.deleteEnterpriseModuleById(enterpriseId);
        console.log('deleteEnterpriseModuleById >>>>>');

        await EnterpriseBranding.delete(enterpriseId);
        console.log('deleteEnterpriseBranding >>>>>');

        await Enterprise.deleteEnterpriseById(enterpriseId);
        console.log('deleteEnterpriseById >>>>>');

        await UserDAO.deleteUserById(userId);
        console.log('DAO: Ending deleteUserAndEnterpriseById');
    }

    static async getEnterpriseByIdToUpdate(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseByIdToUpdate');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByIdToUpdate(enterpriseId);
        console.log('DAO: Ending getEnterpriseByIdToUpdate');
        return enterprise;
    }

    static async getEnterpriseForCustomAttributes(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseForCustomAttributes');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseForCustomAttributes(enterpriseId);
        console.log('DAO: Ending getEnterpriseForCustomAttributes');
        return enterprise;
    }

    static async rollbackCreatedEnterprise(user: User, userProperties: UserProperties, enterprise: Enterprise){
        console.log('DAO: Starting rollbackCreatedEnterprise');
        await getConnection();
        const updateUser = await UserDAO.saveUser(user);
        console.log('update User', updateUser);
        
        const updateUserProperties = await UserPropertiesDAO.save(userProperties);
        console.log('update updateUserProperties', updateUserProperties);

        const updateEnterprise = await EnterpriseDAO.saveEnterprise(enterprise);
        console.log('update updateEnterprise', updateEnterprise);

        await EnterpriseDocumentation.deleteEnterpriseDocumentationById(enterprise.id);
        console.log('deleteEnterpriseDocumentationById >>>>>');

        console.log('DAO: Ending rollbackCreatedEnterprise');
    }
    
    static async rollbackCreateLinkRequestNewEnterprise(enterpriseId: number, userId: number, eModules: EnterpriseModule[], uModules: UserModule[], uRoles: UserRole[]) {
        for(let eModule of eModules) {
            await EnterpriseModuleDAO.deleteEnterpriseModule(eModule);
            console.log('removing EnterpriseModules...')
        }
        await Enterprise.removeEnterprise(enterpriseId);
        console.log('removing Enterprise');
        for(let role of uRoles) {
            await UserRoleDAO.deleteUserRole(role);
            console.log('removing UserRoles');
        }
        for(let uModule of uModules) {
            await UserModuleDAO.deleteUserModule(uModule);
            console.log('removing UserModules');
        }
        await UserProperties.deleteUserPropertiesById(userId);
        console.log('removing Userprops');
        await User.removeUser(userId);
        console.log('removing User');
    }

    static async deleteEnterpriseInvoice(enterpriseId: number, invoiceId: number) {
        console.log('DAO: Starting deleteEnterpriseInvoice');
        await getConnection();
        await EnterpriseInvoice.deleteEnterpriseInvoice(enterpriseId, invoiceId);
        console.log('DAO: Ending deleteEnterpriseInvoice');
    }

    static async getEnterpriseInvoicesByEnterpriseId(enterpriseId: number, filter: FilterEnterprises) {
        console.log('DAO: Starting getEnterpriseInvoicesByEnterpriseId');
        await getConnection();
        const invoices = await EnterpriseInvoice.getByEnterpriseId(enterpriseId, filter);
        console.log('DAO: Ending getEnterpriseInvoicesByEnterpriseId');
        return invoices;
    }

    static async getEnterpriseByIdForDeleteCA(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseByIdForDeleteCA');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByIdForDeleteCA(enterpriseId);
        console.log('DAO: Ending getEnterpriseByIdForDeleteCA');
        return enterprise;
    }

    static async getEnterpriseWithModulesAndRoles(enterpriseId: number) {
        console.log('DAO: Starting getEnterpriseWithModulesAndRoles');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseWithModulesAndRoles(enterpriseId);
        console.log('DAO: Ending getEnterpriseWithModulesAndRoles');
        return enterprise;
    }

    static async getLenderById(lenderId: number) {
        console.log('DAO: Starting getLenderById');
        await getConnection();
        const lender = await Enterprise.getLenderById(lenderId);
        console.log('DAO: Ending getLenderById');
        return lender;
    }

    static async getLendersAvaiable(filter: IFilterLenders, payerId: number){
        console.log('DAO: Starting getLendersAvaiable');
        await getConnection();
        const lendersTotal = await Enterprise.getLendersAvaiable(filter, payerId);
        console.log('DAO: Ending getLendersAvaiable');
        return lendersTotal;
    }

    static async getBasic(enterpriseId: number) {
        console.log('DAO: Starting getBasic');
        await getConnection();
        const enterprise = await Enterprise.getBasic(enterpriseId);
        console.log('DAO: Ending getBasic');
        return enterprise;
    }

    static async getEnterpriseByNitWithStatuses(nit: string, status: EnterpriseStatusEnum[]) {
        console.log('DAO: Starting getEnterpriseByNitWithStatuses');
        await getConnection();
        const enterprise = await Enterprise.getEnterpriseByNitAndStatuses(nit, status);
        console.log('DAO: Ending getEnterpriseByNitWithStatuses');
        return enterprise;
    }

    static async getDocumentNumberRequest(documentNumber: string, type: string, module?: string, product?: string): Promise<Enterprise> {
        console.log('DAO: Starting getDocumentNumberRequest');
        await getConnection();
        const result = await Enterprise.getByDocumentNumber(documentNumber, type, module, product);
        console.log('DAO: Ending getDocumentNumberRequest');
        return result;
    }

    static async updateEnterpriseById(updatedEnterprise: Enterprise, id: number) {
        console.log('DAO: Starting updateUserPropertiesById');
        await getConnection();
        const updatedUserProperties = await Enterprise.update(id, updatedEnterprise);
        console.log('DAO: Ending updateUserPropertiesById');
        return updatedUserProperties;
    }

    static async postEnterpriseDocumentationByEnterpriseId(enterpriseDocumentation:EnterpriseDocumentation): Promise<EnterpriseDocumentation> {
        console.log('DAO: Starting saveEnterpriseDocumentation');
        await getConnection();
        const savedEnterpriseDocumentation = await EnterpriseDocumentation.save(enterpriseDocumentation);
        console.log('DAO: Ending saveEnterpriseDocumentation');
        return savedEnterpriseDocumentation;
    }

    static async getByOwnerId(ownerId:number){
        console.log('DAO: Starting getByOwnerId method');
        await getConnection();
        const enterprise = await Enterprise.getByOwnerId(ownerId);
        console.log('DAO: Finished getByOwnerId method');
        return enterprise;
    }

    static async getEnterpriseByStatus(status: EnterpriseStatusEnum){
        console.log('DAO: Starting getEnterpriseByStatus method');
        await getConnection();
        const enterprises = await Enterprise.getEnterpriseByStatus(status);
        console.log('DAO: Finished getEnterpriseByStatus method');
        return enterprises;
    }

    static async getEnterprisePayers(enterprise_id: number): Promise<Enterprise[]> {
        console.log('DAO: Starting getEnterprisePayers method');
        await getConnection();
        const enterprises = await Enterprise.getEnterprisePayers(enterprise_id);
        console.log('DAO: Finished getEnterprisePayers method');
        return enterprises;
    }

    static async getOwnerDetail(enterpriseId:number){
        console.log('DAO: Starting getOwnerDetail method');
        await getConnection();
        const enterprises = await Enterprise.getOwnerDetail(enterpriseId);
        console.log('DAO: Finished getOwnerDetail method');
        return enterprises;
    }
    
    static async updateFinancialConditionsById(financialConditions, enterpriseId){
        console.log('DAO: Starting updateFinancialConditionsById method');
        await getConnection();
        await Enterprise.updateFinancialConditionsById(financialConditions, enterpriseId);
        console.log('DAO: Finished updateFinancialConditionsById method');
    }
}