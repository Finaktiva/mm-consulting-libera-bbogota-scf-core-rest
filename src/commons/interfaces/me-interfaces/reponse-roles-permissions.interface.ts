export interface IRolesPermissions {
    code: String;
    acronym: String;
    description: String;
    permissions: IPermission[];
}

export interface IPermission {
    code: string;
    description: string;
}