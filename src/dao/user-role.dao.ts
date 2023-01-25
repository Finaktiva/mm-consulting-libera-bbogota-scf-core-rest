import { UserRole } from 'entities/user-role';
import { getConnection } from 'commons/connection';
import { Role } from 'entities/role';
import { RoleEnum } from 'commons/enums/role.enum';
import { Connection } from 'typeorm';
import { PermissionEnum } from 'commons/enums/permission.enum';

export class UserRoleDAO{

    static async save(userRole: UserRole): Promise<UserRole> {
        console.log('DAO: Starting save user role');
        await getConnection();

        await userRole.save();
        console.log('DAO: Ending save user role');
        return userRole;
    }

    static async deleteUserRoleById(userId: number) {
        console.log('DAO: Starting deleteUserRoleById');
        await getConnection();
        await UserRole.deleteUserRoleById(userId);
        console.log('DAO: Ending deleteUserRoleById');
    }

    static async getUserRoleById(userId:number, role: Role){
        console.log('DAO: Starting getUserRoleById');
        await getConnection();
        
        const roles = await UserRole.getRoleByUserId(userId, role);
        console.log('DAO: Ending getUserRoleById');
        return roles;
    }

    static async getByUserId(userId:number){
        console.log('DAO: Starting getByUserId');
        await getConnection();
        
        const roles = await UserRole.getByUserId(userId);
        console.log('DAO: Ending getByUserId');
        return roles;
    }

    static async getRolesByUserId(userId: number) {
        console.log('DAO: Starting getRolesByUserId');
        await getConnection();

        const roles = await UserRole.getRolesByUserId(userId);
        console.log('DAO: Ending getRolesByUserId');
        return roles;
    }

    static async deleteUserRoleByUserIdAndRole(userId: number, role: RoleEnum) {
        console.log('DAO: Starting deleteUserRoleByUserIdAndRole');
        await getConnection();
        await UserRole.deleteRoleByUserIdAndRole(userId, role);
        console.log('DAO: Ending deleteUserRoleByUserIdAndRole');
    }

    static async saveUserRoles(userRoles: UserRole[]){
        console.log('DAO: Starting saveEnterpriseModules method');
        let connection: Connection = await getConnection();
        userRoles = await connection.manager.save(userRoles);
        console.log('DAO: Finished saveEnterpriseModules method');
        return userRoles;
    }

    static async deleteUserRoles(userRoles: UserRole[]){
        console.log('DAO: Starting saveEnterpriseModules method');
        let connection:Connection = await getConnection();
        userRoles = await connection.manager.remove(userRoles);
        console.log('DAO: Finished saveEnterpriseModules method');
        return userRoles;
    }

    static async deleteUserRole(userRole: UserRole) {
        console.log('DAO: Starting deleteUserRole');
        await getConnection();
        await UserRole.remove(userRole);
        console.log('DAO: Ending deleteUserRole');
    }

    static async getUserRoleByIdAndName(userId: number, role: RoleEnum) {
        console.log('DAO: Starting getUserRoleByIdAndName');
        await getConnection();
        console.log(userId);
        const uRole = await UserRole.getByIdAndName(userId, role);
        console.log('DAO: Ending getUserRoleByIdAndName');
        return uRole;
    }

    static async getUserByIdAndPermissions(userId: number, permissions: PermissionEnum[]) {
        console.log('DAO: Starting getUserByIdAndPermissions');
        await getConnection();
        const user = await UserRole.getUserByIdAndPermissions(userId, permissions);
        console.log('DAO: Ending getUserByIdAndPermissions');
        return user;
    }

    static async getRolesPermissionsByUserId(userId: number): Promise<UserRole[]> {
        console.log('DAO: Starting getUserRoleByIdName');
        await getConnection();
        console.log('userId: ',userId);
        const Roles: UserRole[] = await UserRole.getRolesPermissionsByUserId(userId);
        console.log('DAO: Ending getUserRoleByIdName');
        return Roles;
    }

    static async getUserByPermission(permissions: PermissionEnum, region?: number): Promise<UserRole[]> {
        console.log('DAO: Starting getUsersByPermission');
        await getConnection();
        const users = await UserRole.getUserByPermission(permissions, region);
        console.log('DAO: Ending getUsersByPermission');
        return users;
    }
}