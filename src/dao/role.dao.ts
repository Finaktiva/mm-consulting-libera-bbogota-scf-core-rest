import { Role } from 'entities/role';
import { getConnection } from 'commons/connection';
import { RoleEnum } from 'commons/enums/role.enum';
import { User } from 'entities/user';

export class RoleDAO {

    static async getRoles(){
        console.log('DAO: Starting getRoles');
        await getConnection();
        const roles = await Role.getRoles();
        console.log('DAO: Ending getRoles');
        return roles;
    }

    static async getRole(roleName: RoleEnum) {
        console.log('DAO: Starting getRole...');
        await getConnection();
        const role = await Role.getByName(roleName);
        console.log('DAO: Ending getRole...');
        return role;
    }
    static async getRolesByName(roleName: RoleEnum) {
        console.log('DAO: Starting getRolesByName...');
        await getConnection();
        const role = await Role.getByName(roleName);
        console.log('DAO: Ending getRolesByName...');
        return role;
    }

    static async save(role : Role): Promise<Role> {
        console.log('DAO: Starting saveRole');
        await getConnection();
        const roleDB: Role = await Role.save(role);
        console.log('DAO: Ending saveRole');
    
        return roleDB;
    }

    static async getLiberaUserRoles(): Promise<Role[]>{
        console.log('DAO: Starting getLiberaUserRoles...');
        await getConnection();
        const roles = await Role.getLiberaUserRoles();
        console.log('DAO: Ending getLiberaUserRoles...');
        return roles;
    }

    static async getRoleByCode(code: string): Promise<Role> {
        console.log('DAO: Starting getRoleByCode...');
        await getConnection();
        const role: Role = await Role.getByCode(code);
        console.log('DAO: Ending getRoleByCode...');
        return role;
    }

    static async getRoleByAcronym(acronym: string): Promise<Role> {
        console.log('DAO: Starting getRoleByAcronym...');
        await getConnection();
        const role: Role = await Role.getRoleByAcronym(acronym);
        console.log('DAO: Ending getRoleByAcronym...');
        return role;
    }

    static async countUsersByRole(roleName: String): Promise<number> {
        console.log('DAO: Starting countUsersByRole...');
        await getConnection();
        const count: number = await Role.countUsersByRole(roleName);
        console.log('DAO: Ending countUsersByRole...');
        return count;
    }
    
}