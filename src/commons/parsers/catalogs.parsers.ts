import { IRoleInformation, IPermissionResponse, IRoleResponse } from "commons/interfaces/catalogs";
import { RelRolePermission } from "entities/rel-role-permission";
import { CatPermission } from "entities/cat-permissions";
import { Role } from "entities/role";
import moment, { Moment } from 'moment-timezone';

export class CatalogsParsers {

    static parseReponseRole(role:Role): IRoleResponse {
        console.log('PARSER: Starting parseReponseRole function...');
        console.log('PARSER: Ending parseReponseRole function...');
        return{
            code: role.name,
            description: role.description,
            appliesTo: role.appliesTo,
            creationDate: moment(role.creationDate).format('YYYY-MM-DD'),
            modificationDate: null,
            acronym: role.acronym,
            associatedUsers: 0,
            status: role.status
        }
    }

    static parseRoleInformation(role:Role, associatedUsers:number, permissions: RelRolePermission[]): IRoleInformation {
        console.log('PARSER: Starting parseRoleInformation function...');
        const permissionsInfo = permissions.map(permission => ({
            code: permission.permission.code,
            description: permission.permission.description
        }));
        console.log('PARSER: Ending parseRoleInformation function...');
        return {
            code: role.name,
            description: role.description,
            appliesTo: role.appliesTo,
            creationDate: moment(role.creationDate).format('YYYY-MM-DD'),
            modificationDate: role.modificationDate ? moment(role.modificationDate).format('YYYY-MM-DD') : null,
            acronym: role.acronym,
            status: role.status,
            associatedUsers: associatedUsers,
            permissions: permissionsInfo
        };
        
    }

    static parseToRolePermissionResponseList(permissionsEntityList: CatPermission[]): IPermissionResponse[]{
        console.log(`PARSER: Starting parseToRolePermissionResponseList funciton...`);
        const response: IPermissionResponse[] = permissionsEntityList.map(permissionEntity => {
            const { creationDate, ...segmentCode } = permissionEntity.segmentCode;
            console.log('PARSER: Ending parseToRolePermissionResponseList function...');
            return {
                code: permissionEntity.code,
                description: permissionEntity.description,
                segment: segmentCode,
                appliesTo: permissionEntity.appliesToUserType,
                order: permissionEntity.order
            }
        });

        /*
        for (const permissionEntity of permissionsEntityList){
            let permission: IPermissionResponse = {
                code: permissionEntity.code,
                description: permissionEntity.description,
                segment: permissionEntity.segment,
                appliesTo: permissionEntity.appliesToUserType
            }

            response.push(permission);
        }*/

        console.log(`Data parsed: ${ response }`);

        console.log(`PARSER: Ending parseToRolePermissionResponseList funciton...`);

        return response;
    }
}