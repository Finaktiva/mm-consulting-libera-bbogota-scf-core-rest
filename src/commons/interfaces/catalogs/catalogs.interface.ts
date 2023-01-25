export interface IBankCatalog {
    code: string
    name?: string
}

export interface IRatePeriodicityRelationResponse {
    code: string,
    description: string,
    periodicityTypes?: string[]
}