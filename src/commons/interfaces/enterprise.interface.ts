import { CustomAttributesTypeEnum } from "commons/enums/custom-attributes-type.enum";

export interface CreateEnterpriseCustomAttributes {
    name: string,
    type: CustomAttributesTypeEnum
}

export interface IParseEnterprisePayers {
    id: number,
    documentType: string,
    documentNumber: string,
    enterpriseName: string,
    sales: number,
    salesCut: string,
}

export interface IFinancingPlanDetail {
    id: number,
    folio: string,
    type: string,
    comments?: string,
    providerOptions: {
        provider: {
            id: number,
            document: string,
            documentType: string,
            name: string
        },
        hasAgreement: boolean,
        requireAuthToPerformOperation: boolean,
        authDay: number | null
    },
    economicGroup: {
        enterpriseId: number,
        enterpriseName: string,
        documentType: string,
        documentNumber: string,
        sales: number | null,
        salesCut: Date
    }[],
    totalSales: number,
    salesCut: Date,
    minimumRate: {
        baseType: string,
        baseValue: number,
        specialRate: number,
        periodicityType: string,
        ea: number,
        mv: number
    },
    negotiatedRate?: {
        baseType: string,
        baseValue: number,
        periodicityType: string,
        specialRate: number,
        ea: number,
        mv: number
    },
    isSpecialRate: boolean,
    validityDays: number,
    validityDate: Date,
    paydayInitialRange: number,
    paydayFinalRange: number,
    termDays?: number,
    paymentMethod: string,
    isPunctualPlan: boolean,
    creationDate: Date,
    modificationDate: Date,
    acceptanceDate: Date,
    evidenceFile: {
        id: number,
        name: string,
        url: string
    },
    clientPermissions?: string[],
    creationUser: {
        id: number,
        name: string,
        firstSurname: string,
        secondSurname: string,
        email: string,
    },
    approvalUser: {
        id: number,
        name: string,
        firstSurname: string,
        secondSurname: string,
        email: string,
    },
    acceptanceUser: {
        id: number,
        name: string,
        firstSurname: string,
        secondSurname: string,
        email: string,
    }
}

export interface IEnterpriseFinancingPlans {
    id: number;
    folio?: string;
    type: string;
    comments?: string;
    effectivenessDate?: string;
    description?: string;
    status: string;
    observations?: string[];
    provider?: {
        id: number;
        enterpriseName: string;
        documentNumber: string;
    };
    summary: {
        termDays?: number,
        negotiatedRate?: {
            baseType: {
                code: string,
                description: string
            },
            specialRate: number,
            periodicityType: {
                code: string,
                description: string
            }
        }
    }
}

export interface IEnterpriseModules {
    name: string
}