import { RelRolePermission } from 'entities/rel-role-permission';
import { getConnection } from 'commons/connection';


export class RelRolePermissionsDAO {

    static async save(relRolePermission : RelRolePermission): Promise<RelRolePermission> {
        console.log('DAO: Starting saveRelRolePermission');
        await getConnection();
        const relRolePermissionDB = await RelRolePermission.save(relRolePermission);
        console.log('DAO: Ending saveRelRolePermission');
        return relRolePermissionDB;
    }

    static async deleteByRole(role: String): Promise<void> {
        console.log('DAO: Starting deleteByRole');
        await getConnection();
        await RelRolePermission.deleteByRole(role);
        console.log('DAO: Ending deleteByRole');
    }

    static async getPermissionsByRole(role: String): Promise<RelRolePermission[]> {
        console.log('DAO: Starting getPermissionsByRole');
        await getConnection();
        const relRolePermissions = await RelRolePermission.getPermissionsByRole(role);
        console.log('DAO: Ending getPermissionsByRole');
        return relRolePermissions;
    }

}