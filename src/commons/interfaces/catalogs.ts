export interface IBankRegion {
    id: number,
    description: string
}

export interface IRoles {
    code: string,
    description: string,
    appliesTo: string,
    creationDate: string,
    modificationDate: string | null,
    acronym: string,
    status: string
}

export interface IRoleResponse {
    code: String,
    description: String,
    appliesTo: String,
    creationDate: String,
    modificationDate: String | null,
    acronym: String,
    associatedUsers: number,
    status: String
}

interface IRolePermissionsInfo{
    code: string,
    description: string
}

export interface IRoleInformation {
    code: String,
    description: String,
    appliesTo: String,
    creationDate: String,
    modificationDate: String | null,
    acronym: String,
    status: String,
    associatedUsers: number,
    permissions: IRolePermissionsInfo[]
}

export interface IRolesWithUsersAssociated {
    name: String,
    description: String,
    appliesTo: String,
    creationDate: String,
    modificationDate: String | null,
    acronym: String,
    status: String,
    associatedUsers: number
}

export interface IPermissionResponse {
    code: string,
    description: string,
    segment: ICatPermissionSegments ,
    appliesTo: string,
    order: number
}

export interface ICatPermissionSegments {
    code: string,
    description: string,
    order: number
}
