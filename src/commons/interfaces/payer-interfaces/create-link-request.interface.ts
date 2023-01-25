import { IBankCatalog } from "../catalogs/catalogs.interface"

export interface IAccount {
    type: string
    number: string
    bank: IBankCatalog
}

export interface IDisbursementContract {
    type: string,
    account: IAccount,
    bankCertificationFilename: string
}

export interface IOwner {
    name: string,
    firstSurname: string,
    secondSurname: string,
    email: string
}

export interface IPhone {
    extension: string,
    number: string
}
export interface IEconomicActivity {
    ciiuCode: string,
}

export interface ICreateNewLinkRequest {
    providerDocumentType: string,
    nit: string,
    enterpriseName: string,
    comesFromAPI: boolean,
    productType: string,
    department: string,
    city: string,
    economicActivity: IEconomicActivity,
    owner: IOwner,
    phone: IPhone,
    disbursementContract: IDisbursementContract
}