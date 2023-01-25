import { FilterUserStatusEnum } from "./filter-status.enum";

export enum FilterEnterpriseEnum{
   DATE = 'DATE',
   NIT = 'NIT',
   PROVIDER = 'PROVIDER',
   PAYER = 'PAYER',
   FUNDING = 'FUNDING',
   ENTERPRISE_NAME = 'ENTERPRISE_NAME',
   ROLE = 'ROLE',
   MODULE = 'MODULE',
   STATUS = 'STATUS',
   REGION = 'REGION',
   ACTIVE_PRODUCTS = 'ACTIVE_PRODUCTS',
   FINANCIAL_CONDITIONS = 'FINANCIAL_CONDITIONS',
}

export enum FilterEnterpriseRequestEnum{
    DATE = 'DATE',
    NIT = 'NIT',
    ENTERPRISE_NAME = 'ENTERPRISE_NAME'
 }

export enum FilterUsersEnum {
    STATUS = 'STATUS',
    ROLE = 'ROLE',
    FULL_NAME = 'FULL_NAME',
    EMAIL = 'EMAIL',
    VINCULATION_DATE = 'VINCULATION_DATE',
    REGION = 'REGION'
}

export enum FilterEnterpriseInvoiceEnum {
    provider = 'provider',
    expirationDate = 'expirationDate',
    invoiceNumber = 'invoiceNumber',
    paymentExpirationDate = 'paymentExpirationDate'
}

export enum FilterLastInvoiceNegotiationEnum {
    invoiceNumber = 'invoiceNumber',
    payer = 'payer',
    nit = 'nit',
    startingDate = 'startingDate',
    effectivePaymentDate = 'effectivePaymentDate',
    discountDueDate = 'discountDueDate',
    discountPercentage = 'discountPercentage',
    discountValue = 'discountValue'
 }

 export enum FilterFundingRequestEnum {
    PAYER = 'payer',
    STATUS = 'status',
    EFFECTIVEPAYMENTDATE = 'effectivePaymentDate',
    EXPECTEDPAYMENTDATE = 'expectedPaymentDate'
 }

export enum FilterLendersAvaiableEnum {
    ENTERPRISE_NAME = 'enterpriseName',
    NIT = 'nit'
}

export enum FilterBulkNegotiationEnum {
    CREATION_DATE = 'creationDate',
    STATUS = 'status',
    ENTERPRISE_NAME = 'enterpriseName',
    FOLIO = 'folio'
}

export const parseFilterEnterpriseRequest = (value : String) => {
    if(!value) return null;

    switch (value) {
        case FilterEnterpriseEnum.DATE:
            return FilterEnterpriseEnum.DATE
        case FilterEnterpriseEnum.NIT:
            return FilterEnterpriseEnum.NIT
        case FilterEnterpriseEnum.ENTERPRISE_NAME:
            return FilterEnterpriseEnum.ENTERPRISE_NAME
        default:
            return null;
    }
}

export const parseFilterBy = (value : String) => {
    if(!value) return null;

    switch (value) {
        case FilterEnterpriseEnum.DATE:
            return FilterEnterpriseEnum.DATE
        case FilterEnterpriseEnum.NIT:
            return FilterEnterpriseEnum.NIT
        case FilterEnterpriseEnum.PROVIDER:
            return FilterEnterpriseEnum.PROVIDER
        case FilterEnterpriseEnum.PAYER:
            return FilterEnterpriseEnum.PAYER
        case FilterEnterpriseEnum.FUNDING:
            return FilterEnterpriseEnum.FUNDING
        case FilterEnterpriseEnum.ENTERPRISE_NAME:
            return FilterEnterpriseEnum.ENTERPRISE_NAME
        case FilterEnterpriseEnum.ROLE:
            return FilterEnterpriseEnum.ROLE
        case FilterEnterpriseEnum.MODULE:
            return FilterEnterpriseEnum.MODULE
        case FilterEnterpriseEnum.STATUS:
            return FilterEnterpriseEnum.STATUS
        case FilterEnterpriseEnum.REGION:
            return FilterEnterpriseEnum.REGION
        case FilterEnterpriseEnum.ACTIVE_PRODUCTS:
            return FilterEnterpriseEnum.ACTIVE_PRODUCTS
        case FilterEnterpriseEnum.FINANCIAL_CONDITIONS:
            return FilterEnterpriseEnum.FINANCIAL_CONDITIONS
        default:
            return null;
    }
}

export const isFilterEnterpriseValid = (value: string) => {
    if(!value) return true;

    switch (value) {
        case FilterEnterpriseEnum.ROLE:
            return FilterEnterpriseEnum.ROLE;

        case FilterEnterpriseEnum.MODULE:
            return FilterEnterpriseEnum.MODULE;

        case FilterEnterpriseEnum.STATUS:
            return FilterEnterpriseEnum.STATUS;

        default:
            return null;
    }
}

export const isFilterUserStatusValid = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FilterUserStatusEnum.ENABLED:
            return FilterUserStatusEnum.ENABLED;

        case FilterUserStatusEnum.DISABLED:
            return FilterUserStatusEnum.DISABLED;

        case FilterUserStatusEnum.PENDING:
            return FilterUserStatusEnum.PENDING;
            
        default:
            return null;
    }
}

export const isFilterEnterpriseInvoiceValid = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FilterEnterpriseInvoiceEnum.expirationDate:
            return FilterEnterpriseInvoiceEnum.expirationDate;
        case FilterEnterpriseInvoiceEnum.invoiceNumber:
            return FilterEnterpriseInvoiceEnum.invoiceNumber;
        case FilterEnterpriseInvoiceEnum.paymentExpirationDate:
            return FilterEnterpriseInvoiceEnum.paymentExpirationDate;
        case FilterEnterpriseInvoiceEnum.provider:
            return FilterEnterpriseInvoiceEnum.provider;
    
        default:
            return null;
    }
}

export const parseFilterLastInvoiceNegotiation = (value : String) => {
    if(!value) return null;

    switch (value) {
        case FilterLastInvoiceNegotiationEnum.invoiceNumber:
            return FilterLastInvoiceNegotiationEnum.invoiceNumber;

        case FilterLastInvoiceNegotiationEnum.payer:
            return FilterLastInvoiceNegotiationEnum.payer;

        case FilterLastInvoiceNegotiationEnum.nit:
            return FilterLastInvoiceNegotiationEnum.nit;

        case FilterLastInvoiceNegotiationEnum.startingDate:
            return FilterLastInvoiceNegotiationEnum.startingDate;

        case FilterLastInvoiceNegotiationEnum.effectivePaymentDate:
            return FilterLastInvoiceNegotiationEnum.effectivePaymentDate;

        case FilterLastInvoiceNegotiationEnum.discountDueDate:
            return FilterLastInvoiceNegotiationEnum.discountDueDate;

        case FilterLastInvoiceNegotiationEnum.discountPercentage:
            return FilterLastInvoiceNegotiationEnum.discountPercentage;

        case FilterLastInvoiceNegotiationEnum.discountValue:
            return FilterLastInvoiceNegotiationEnum.discountValue;

        default:
            return null;
    }
}

export const parseFilterFundingRequest = (value : String) => {
    if(!value) return null;

    switch (value) {
        case FilterFundingRequestEnum.PAYER :
            return FilterFundingRequestEnum.PAYER ;

        case FilterFundingRequestEnum.STATUS :
            return FilterFundingRequestEnum.STATUS;

        case FilterFundingRequestEnum.EFFECTIVEPAYMENTDATE :
            return FilterFundingRequestEnum.EFFECTIVEPAYMENTDATE ;

        case FilterFundingRequestEnum.EXPECTEDPAYMENTDATE :
            return FilterFundingRequestEnum.EXPECTEDPAYMENTDATE ;

        default:
            return null;
    }

}

export const parseFilterLendersAvaiable = (value: String) => {
    if (!value) return null;

    switch (value) {
        case FilterLendersAvaiableEnum.ENTERPRISE_NAME:
            return FilterLendersAvaiableEnum.ENTERPRISE_NAME;

        case FilterLendersAvaiableEnum.NIT:
            return FilterLendersAvaiableEnum.NIT;

        default:
            return null;
    } 
}

export const parseFilterBulkNegotiation = (value: String) => {
    if(!value) return null;

    switch (value) {
        case FilterBulkNegotiationEnum.CREATION_DATE:
            return FilterBulkNegotiationEnum.CREATION_DATE;
        case FilterBulkNegotiationEnum.ENTERPRISE_NAME:
            return FilterBulkNegotiationEnum.ENTERPRISE_NAME;
        case FilterBulkNegotiationEnum.FOLIO:
            return FilterBulkNegotiationEnum.FOLIO;
        case FilterBulkNegotiationEnum.STATUS:
            return FilterBulkNegotiationEnum.STATUS;
        default: 
            return null;
    }
}

export enum FilterRoleUserTypeEnum {
    LIBERA_USER = 'LIBERA_USER',
    ENTERPRISE_USER = 'ENTERPRISE_USER'
 }

 export enum FilterByFinancingPlans {
    OBSERVATION = 'OBSERVATION',
    STATUS = 'STATUS',
    TYPE = 'TYPE',
    PROVIDER = 'PROVIDER',
    DOCUMENT_NUMBER = 'DOCUMENT_NUMBER'
}

export enum FilterQFinancingPlans {
    ECONOMIC_GROUP = 'ECONOMIC_GROUP',
    SPECIAL_RATE = 'SPECIAL_RATE',
    AGREEMENT = 'AGREEMENT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    PENDING_ACCEPTANCE = 'PENDING_ACCEPTANCE',
    CURRENT = 'CURRENT',
    ABOUT_TO_EXPIRE = 'ABOUT_TO_EXPIRE',
    EXPIRED = 'EXPIRED',
    REJECTED = 'REJECTED',
    EXPONENTIAL = 'EXPONENTIAL',
    COMMISSION = 'COMMISSION',
    FUNDED = 'FUNDED'
}

export enum FilterUserTypeEnum {
    LIBERA_USER = 'LIBERA_USER',
    ENTERPRISE_USER = 'ENTERPRISE_USER'
}

export const parseFilterUserTypeEnum = (value: String) => {
    if(!value) return null;

    switch (value) {
        case FilterUserTypeEnum.LIBERA_USER:
            return FilterUserTypeEnum.LIBERA_USER;
        case FilterUserTypeEnum.ENTERPRISE_USER:
            return FilterUserTypeEnum.ENTERPRISE_USER;
        default: 
            return null;
    }
}