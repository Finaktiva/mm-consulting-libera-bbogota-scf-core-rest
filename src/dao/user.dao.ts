import { getConnection } from 'commons/connection';
import { User } from 'entities/user';
import { UserToken } from 'entities/user-token';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserModule } from 'entities/user-module';
import { UserRole } from 'entities/user-role';
import { UserProperties } from 'entities/user-properties';
import { UserEnterprise } from 'entities/user-enterprise';
import { UserStatus } from 'commons/enums/user-status.enum';
import { UserPropertiesDAO } from './user-properties.dao';
import { UserModuleDAO } from './user-module.dao';
import { UserRoleDAO } from './user-role.dao';
import { FilterUsers } from 'commons/filter';

export class UserDAO {

    static async saveUser(user: User): Promise<User> {
        console.log('DAO: Starting saveUser');
        await getConnection();

        await user.save();
        console.log('DAO: Ending saveUser');
        return user;
    }

    static async getBasicUserByEmail(email: string): Promise<User> {
        console.log('DAO: Starting getUserByEmail');
        try {
            await getConnection();

            const user = await User.getBasicUserByEmail(email);
            console.log('DAO: Ending getUserByEMail');
            return user;
        }
        catch(errors) {
            console.log('DAO ERRORS: ', errors);
        }
    }

    static async getUserByEmail(email: string): Promise<User> {
        console.log('DAO: Starting getUserByEmail');
        try {
            await getConnection();

            const user = await User.getUserByEmail(email);
            console.log('DAO: Ending getUserByEMail');
            return user;
        }
        catch(errors) {
            console.log('DAO ERRORS: ', errors);
        }
    }

    static async saveTemporalToken(userToken: UserToken) : Promise<UserToken>{
        console.log('DAO: Starting saveTemporalToken');
        await getConnection();
        await userToken.save();
        console.log('DAO: Ending saveTemporalToken');
        return userToken;
    }

    static async getUserByIdAndRoles(userId: number, roles: RoleEnum[]) {
        console.log('DAO: Starting getUserByIdAndRoles method');
        try {
            await getConnection();
            const user = await User.getUserByIdAndRoles(userId, roles);
            console.log(user);
            console.log('DAO: Ending getUserByIdAndRoles method');
            return user;
        }
        catch(errors) {
            console.log('DAO ERRORS: ', errors);
        }
    }

    static async getUserById(userId: number){
        console.log('DAO: Starting getUserById');
        await getConnection();
        const user = await User.getUserById(userId);
        console.log('DAO: Ending getUserById');
        return user;
    }

    static async getBasicUserById(userId: number){
        console.log('DAO: Starting getBasicUserById');
        await getConnection();
        const user = await User.getBasicUserById(userId);
        console.log('DAO: Ending getBasicUserById');
        return user;
    }

    static async deleteUserById(userId: number) {
        console.log('DAO: Starting deleteUserById method...');
        
        await UserModule.deleteUserModuleById(userId);
        console.log('deleteUserModuleById >>>>>');

        await UserRole.deleteUserRoleById(userId);
        console.log('deleteUserRoleById >>>>>');
        
        await UserProperties.deleteUserPropertiesById(userId);
        console.log('deleteUserPropertiesById >>>>>');

        await UserEnterprise.deleteUserEnterpriseByUserId(userId);
        console.log('deleteUserEnterpriseByUserId >>>>>');
        
        await User.deleteUserById(userId);
        console.log('DAO: Ending deleteUserById method...');
    }

    static async getUsersCountByEmail(email: string){
        console.log('DAO: Starting getUserCountByEmail');
        await getConnection();
        const users = await User.getUsersCountByEmailAndStatus(email);
        console.log('DAO: Ending getUserCountByEmail');
        return users;
    }

    static async updateUserStatusById(userId: number, status: UserStatus){
        console.log('DAO: Starting updateUserStatusById method...');
        await User.updateUserStatusById(userId, status);
        console.log('DAO: Ending updateUserStatusById method...');
    }

    static async rollbackUserEnterprise(userProperties: UserProperties, userModules: UserModule[], userRoles: UserRole[]) {
        console.log('DAO: Starting updateUserEnterpriseRollback...');
        await UserPropertiesDAO.save(userProperties);
        await UserModuleDAO.deleteUserModuleById(userProperties.user.id);
        await UserRoleDAO.deleteUserRoleById(userProperties.user.id);

        for(const mod of userModules) {
            await UserModuleDAO.save(mod);
        }

        for(const rol of userRoles) {
            await UserRoleDAO.save(rol);
        }
        console.log('DAO: Ending updateUserEnterpriseRollback...');
    }

    static async getUsersByRole(roleName: RoleEnum){
        console.log('DAO: Starting getUsersByRole...');
        await getConnection();
        const users = await User.getUsersByRole(roleName);
        console.log('DAO: Ending getUsersByRole...');
        return users;
    }
    
    static async getFullInformationByUserId(userId: number) {
        console.log('DAO: Starting getFullInformationByUserId');
        try {
            await getConnection();
            const user = await User.getFullInformationByUserId(userId);
            console.log('DAO: Ending getFullInformationByUserId method');
            return user;
        }
        catch(errors) {
            console.log('DAO ERRORS: ', errors);
        }
    }

    static async rollbackLiberaUser(userId: number){  
        console.log('DAO: Starting rollbackLiberaUser method...');

        await UserRole.deleteUserRoleById(userId);
        await UserProperties.deleteUserPropertiesById(userId);
        await User.deleteUserById(userId);

        console.log('DAO: Ending rollbackLiberaUser method...');
    }

    static async rollbackUpdateLiberaUser(userProperties: UserProperties, userRoles: UserRole[]){
        console.log('DAO: Starting rollbackUpdateLiberaUser...');
        await UserPropertiesDAO.save(userProperties);
        await UserRole.save(userRoles);
        console.log('DAO: Ending rollbackUpdateLiberaUser...');
    }
    
    static async getLiberaUsers(filter: FilterUsers) {
        console.log('DAO: Starting getLiberaUsers');
        await getConnection();
        const users = await User.getLiberaUsers(filter);
        console.log('DAO: Ending getLiberaUsers');
        return users;
    }

    static async getByEnterpriseId(enterpriseId: number) {
        console.log('DAO: Starting getByEnterpriseId');
        await getConnection();
        const user = await User.getByEnterpriseId(enterpriseId);
        console.log('DAO: Ending getByEnterpriseId');
        return user;
    }

    static async getBasicUserByIdToUpdate(userId: number) {
        console.log('DAO: Starting getBasicUserByIdToUpdate');
        await getConnection();
        const user = await User.getBasicUserByIdToUpdate(userId);
        console.log('DAO: Ending getBasicUserByIdToUpdate');
        return user;
    }

    static async getById(userId: number) {
        console.log('DAO: Starting getById');
        await getConnection();
        const user = await User.getMeById(userId);
        console.log('DAO: Ending getById');
        return user;   
    }

    static async getUserByIdAndModules(userId: number) {
        console.log('DAO: Starting getUserByIdAndModules');
        await getConnection();
        const user = await User.getUserAndModules(userId);
        console.log('DAO: Ending getUserByIdAndModules');
        return user;
    }

    static async getUserByuserId(userId: number){
        console.log('DAO: Starting getUserByuserId')
        await getConnection();
        const user = await User.getUserByuserId(userId);
        console.log('DAO: Ending getUserByuserId')
        return user;
    }
    static async getBasicUserRoleById(userId: number, role){
        console.log('DAO: Starting getBasicUserRoleById');
        await getConnection();
        const user = await UserRole.getRoleByUserId(userId, role);
        console.log('DAO: Ending getBasicUserRoleById');
        return user;
    }

    static async getBasicUserAndLanguage(userId: number) {
        console.log('DAO: Starting getBasicUserAndLanguage');
        await getConnection();
        const user = await User.getBasicUserAndLanguage(userId);
        console.log('DAO: Ending getBasicUserAndLanguage');
        return user;
    }

    static async getUserRolesAndVinculationEnterpriseByUserId(userId: number) {
        console.log('DAO: Starting getUserRolesAndVinculationEnterpriseByUserId method');
        try {
            await getConnection();
            const user = await User.getUserRolesAndVinculationEnterpriseByUserId(userId);
            console.log(user);
            console.log('DAO: Ending getUserRolesAndVinculationEnterpriseByUserId method');
            return user;
        }
        catch(errors) {
            console.log('DAO ERRORS: ', errors);
        }
    }
}
