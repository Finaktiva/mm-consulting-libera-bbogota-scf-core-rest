export enum EnterpriseInvoiceNegotiationProcessStatus {
    PROVIDER_PENDING_RESPONSE = 'PROVIDER_PENDING_RESPONSE',
    PAYER_PENDING_RESPONSE = 'PAYER_PENDING_RESPONSE',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COUNTEROFFERED = 'COUNTEROFFERED', // only for the historical data storage process
    CREATED = 'CREATED'
}

export enum EnterpriseInvoiceNegotiationRoleEnum {
    PAYER = 'PAYER',
    PROVIDER = 'PROVIDER'
}

export enum EnterpriseInvoiceNegotiationtTypeEventEnum {
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    COUNTEROFFERED = 'COUNTEROFFERED', 
    CREATED = 'CREATED'
}

export const isNotValidInvoiceNegotiationStatus  = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE:
            return EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE;
        case EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE:
            return EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE;
        default:
            return null;
    }
}

export const parseNegotiationProcessStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE:
            return EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE;
            
        case EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE:
            return EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE;

        case EnterpriseInvoiceNegotiationProcessStatus.EXPIRED:
            return EnterpriseInvoiceNegotiationProcessStatus.EXPIRED;

        case EnterpriseInvoiceNegotiationProcessStatus.CANCELLED:
            return EnterpriseInvoiceNegotiationProcessStatus.CANCELLED;

        case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
            return EnterpriseInvoiceNegotiationProcessStatus.APPROVED;

        case EnterpriseInvoiceNegotiationProcessStatus.REJECTED:
            return EnterpriseInvoiceNegotiationProcessStatus.REJECTED;
    }
}

export const parseNegotiationUpdateProcessStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
            return EnterpriseInvoiceNegotiationProcessStatus.APPROVED;

        case EnterpriseInvoiceNegotiationProcessStatus.REJECTED:
            return EnterpriseInvoiceNegotiationProcessStatus.REJECTED;

        case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
            return EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED;
    }
}

export const isValidInvoiceNegotiationtTypeEvent = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceNegotiationProcessStatus.CREATED:
            return EnterpriseInvoiceNegotiationProcessStatus.CREATED;

        case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
            return EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED;

        case EnterpriseInvoiceNegotiationProcessStatus.EXPIRED:
            return EnterpriseInvoiceNegotiationProcessStatus.EXPIRED;

        case EnterpriseInvoiceNegotiationProcessStatus.CANCELLED:
            return EnterpriseInvoiceNegotiationProcessStatus.CANCELLED;
    
        case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
            return EnterpriseInvoiceNegotiationProcessStatus.APPROVED;

        case EnterpriseInvoiceNegotiationProcessStatus.REJECTED:
            return EnterpriseInvoiceNegotiationProcessStatus.REJECTED;
            
        default:
            return null;
    }
}

export const isValidInvoiceNegotiationRole = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceNegotiationRoleEnum.PAYER:
            return EnterpriseInvoiceNegotiationRoleEnum.PAYER;
        case EnterpriseInvoiceNegotiationRoleEnum.PROVIDER:
            return EnterpriseInvoiceNegotiationRoleEnum.PROVIDER;
        default: 
            return null;
    }
}