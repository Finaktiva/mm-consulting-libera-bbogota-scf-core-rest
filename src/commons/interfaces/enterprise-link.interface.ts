export interface IOwner {
    name: string,
    firstSurname: string,
    secondSurname: string,
    email: string
}

export interface IPhone {
    number: string
}

export interface IRequest {
    enterpriseName: string,
    nit: string,
    owner: IOwner,
    phone: IPhone,
    comments: string
}

export interface IEnterpriseLinks {
    enterpriseRequestBulkId: number,
    request: IRequest
}