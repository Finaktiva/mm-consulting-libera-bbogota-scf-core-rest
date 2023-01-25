import { OrderByEnum } from "commons/enums/order-by.enum";
import { FilterFundingRequestEnum, FilterLendersAvaiableEnum } from "commons/enums/filter-by.enum";

export interface IQueryFilters {
    orderBy?: OrderByEnum,
    size?: number
}

export  interface IFilterFundingRequest {
    page: number,
    perPage: number,
    filterBy?: FilterFundingRequestEnum,
    q?: string 
}

export interface IFilterLenders {
    page: number,
    perPage: number,
    filterBy?: FilterLendersAvaiableEnum,
    q?: string
}

export  interface IFilterBasic {
    page: number,
    perPage: number,
    filterBy?: any,
    q?: string 
}