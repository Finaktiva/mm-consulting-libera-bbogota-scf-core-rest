import { IPermission, IRolesPermissions } from "commons/interfaces/me-interfaces/reponse-roles-permissions.interface";
import { UserRole } from "entities/user-role";

export class MeParsers {

    static parseRolesWithPermissions(data: UserRole[]): IRolesPermissions[] {
        console.log('PARSER: Starting parseRolesWithPermissions');

        const roles: IRolesPermissions[] = [];

        data.forEach(role => {
            const permissions: IPermission[] = [];

            role.role.relRolePermissions.forEach(permission => {
                permissions.push({
                    code: permission.permission.code,
                    description: permission.permission.description,
                });
            });

            roles.push({
                code: role.role.name,
                description: role.role.description,
                acronym: role.role.acronym,
                permissions
            });
        });
        console.log('Result of parseRolesWithPermissions: ', roles);
        console.log('PARSER: Ending parseRolesWithPermissions');

        return roles;
    }
}