import { EnterpriseStatusEnum } from "./enterprise-status.enum";

export enum FilterStatusEnum {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
    REQUEST = 'REQUEST',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED'
}

export enum FilterUserStatusEnum {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
    PENDING_ACCOUNT_CONFIRMATION = 'PENDING_ACCOUNT_CONFIRMATION',
    PENDING = 'PENDING'
}

export enum FilterEInvoiceStatusEnum {
    LOADED = 'LOADED',
    NEGOTIATION_IN_PROGRESS = 'NEGOTIATION_IN_PROGRESS',
    NEGOTIATION_FINISHED = 'NEGOTIATION_FINISHED',
    FUNDING_IN_PROGRESS = 'FUNDING_IN_PROGRESS',
    FUNDING_FINISHED = 'FUNDING_FINISHED', 
    PAID = 'PAID',
    AVAILABLE = 'AVAILABLE'
}

export enum InvoiceNPStatusEnum {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJETED',
    
}

export const parseFilterStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION:
            return EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION;
        case EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION:
            return EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION;
        case EnterpriseStatusEnum.ENABLED:
            return EnterpriseStatusEnum.ENABLED;
        case EnterpriseStatusEnum.REJECTED:
            return EnterpriseStatusEnum.REJECTED;
        case EnterpriseStatusEnum.INCOMPLETE_ACCOUNT:
            return EnterpriseStatusEnum.INCOMPLETE_ACCOUNT;
        case EnterpriseStatusEnum.EVALUATION_PENDING:
            return EnterpriseStatusEnum.EVALUATION_PENDING;
        default:
            return null
    }
}

export const parseFilterProvidersStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FilterStatusEnum.ENABLED:
            return FilterStatusEnum.ENABLED
        case FilterStatusEnum.DISABLED:
            return FilterStatusEnum.DISABLED;
        case FilterStatusEnum.PENDING:
            return FilterStatusEnum.PENDING;
        default:
            return null;
    }
}

export const parseFilterEnterpriseInvoiceStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FilterEInvoiceStatusEnum.LOADED:
            return FilterEInvoiceStatusEnum.LOADED;

        case FilterEInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS:
            return FilterEInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS;

        case FilterEInvoiceStatusEnum.NEGOTIATION_FINISHED:
            return FilterEInvoiceStatusEnum.NEGOTIATION_FINISHED;

        case FilterEInvoiceStatusEnum.FUNDING_IN_PROGRESS:
            return FilterEInvoiceStatusEnum.FUNDING_IN_PROGRESS;

        case FilterEInvoiceStatusEnum.FUNDING_FINISHED:
            return FilterEInvoiceStatusEnum.FUNDING_FINISHED;

        case FilterEInvoiceStatusEnum.PAID:
            return FilterEInvoiceStatusEnum.PAID;

        case FilterEInvoiceStatusEnum.AVAILABLE:
            return FilterEInvoiceStatusEnum.AVAILABLE;

        default:
            return null;
    }
}

