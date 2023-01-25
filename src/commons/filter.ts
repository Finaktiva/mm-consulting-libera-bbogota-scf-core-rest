export class FilterEnterprises {
    constructor(
        public page: number,
        public per_page: number,
        public filter_by?: string,
        public status?: string,
        public q?: string,
        public documentType?: string,
        public hint?:string,
        public module?:string
    ){}
}

export class FilterEnterpriseRequests {
    constructor(
        public page: number,
        public per_page: number,
        public request: string,
        public filter_by?: string,
        public q?: string,
        public status?: string,
        public link_type?: string
    ){}
}

export class FilterUsers {
    constructor(
        public page: number,
        public per_page: number,
        public filter_by?: string,
        public q?: string
    ){}
}

export class SimpleFilter {
    constructor(
        public page: number,
        public per_page: number
    ){}
}

export class BasicFilter<T,K> {
    constructor(
        public page: number,
        public perPage: number,
        public filterBy?: T,
        public q?: any,
        public orderBy?: K
    ) { }
}

export type QuotaRequestFilterBy = 'STATUS' | 'ENTERPRISE_NAME' | 'NONE' | 'INVALID';

export const parseQuotaRequestFilterBy = (value: string) => {
    if(!value)
        return <QuotaRequestFilterBy>'NONE';

    switch(value) {
        case 'status':
            return <QuotaRequestFilterBy>'STATUS';
        case 'enterpriseName':
            return <QuotaRequestFilterBy>'ENTERPRISE_NAME';
        default:
            return <QuotaRequestFilterBy>'INVALID';
    }
}

export type EnterpriseQuotaRequestFilterBy = 'ENTERPRISE_NAME' | 'NIT' | 'NONE' | 'INVALID';

export const parseEnterpriseQuotaRequestFilterBy = (value: string) => {
    if(!value)
        return <EnterpriseQuotaRequestFilterBy>'NONE';

    switch(value) {
        case 'enterpriseName':
            return <EnterpriseQuotaRequestFilterBy>'ENTERPRISE_NAME';
        case 'nit':
            return <EnterpriseQuotaRequestFilterBy>'NIT';
        default:
            return <EnterpriseQuotaRequestFilterBy>'INVALID';
    }
}

export type EnterpriseQuotaRequestOrderBy = 'AVAILABLE_QUOTA' | 'GRANTED_QUOTA' | 'RATE' | 'NONE' | 'INVALID';

export const parseEnterpriseQuotaRequestOrderBy = (value: string) => {
    if(!value)
        return <EnterpriseQuotaRequestOrderBy>'NONE';
    
    switch(value) {
        case 'availableQuota':
            return <EnterpriseQuotaRequestOrderBy>'AVAILABLE_QUOTA';
        case 'grantedQuota':
            return <EnterpriseQuotaRequestOrderBy>'GRANTED_QUOTA';
        case 'rate':
            return <EnterpriseQuotaRequestOrderBy>'RATE';
        default:
            return <EnterpriseQuotaRequestOrderBy>'INVALID';
    }
}

export type LenderPayersFilterBy = 'ENTERPRISE_NAME' | 'NIT' | 'SECTOR' | 'ENTERPRISE_TYPE' | 'NONE' | 'INVALID';

export const parseLenderPayersFilterBy = (value: string) => {
    if(!value)
        return <LenderPayersFilterBy>'NONE';

    switch(value) {
        case 'enterpriseName':
            return <LenderPayersFilterBy>'ENTERPRISE_NAME';
        case 'nit':
            return <LenderPayersFilterBy>'NIT';
        case 'sector':
            return <LenderPayersFilterBy>'SECTOR';
        case 'enterpriseType':
            return <LenderPayersFilterBy>'ENTERPRISE_TYPE';
        default:
            return <LenderPayersFilterBy>'INVALID';
    }
}

export type LenderCustomAttributesOrderBy = 'ASC' | 'DESC' | 'INVALID';

export const parseLenderCustomAttributesOrderBy = (value: string) => {
    if(!value)
        return <LenderCustomAttributesOrderBy>'ASC';

    switch(value) {
        case 'asc':
            return <LenderCustomAttributesOrderBy>'ASC';
        case 'desc':
            return <LenderCustomAttributesOrderBy>'DESC';
        default:
            return <LenderCustomAttributesOrderBy>'INVALID';
    }
}

export type LiberaUserFilterType = 'ROLE' | 'STATUS' | 'FULL_NAME' | 'EMAIL' | 'VINCULATION_DATE';

export const isFilterLiberaUserValid = (value: string) => {
    if(!value) return true;

    switch (value) {
        case 'ROLE':
            return <LiberaUserFilterType>'ROLE';

        case 'STATUS':
            return <LiberaUserFilterType>'STATUS';
            
        case 'FULL_NAME':
            return <LiberaUserFilterType>'FULL_NAME';

        case 'EMAIL':
            return <LiberaUserFilterType>'EMAIL';

        case 'VINCULATION_DATE':
            return <LiberaUserFilterType>'VINCULATION_DATE';

        case 'REGION':
            return <LiberaUserFilterType>'REGION';

        default:
            return null;
    }
}

export class FilterFinancingPlans {
    constructor(
        public enterpriseId: number,
        public page: number,
        public per_page: number
    ){}
}
