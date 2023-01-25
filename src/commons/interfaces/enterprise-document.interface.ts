import { EnterpriseDocumentationStatusEnum } from "commons/enums/enterprise-documentation-status.enum"
import { S3Service } from "services/s3.service"
import { IBankRegion } from "./catalogs"

export interface IEnterpriseByDocument {
    id: number,
    enterpriseName: string,
    documentType: string,
    nit: string,
    city: string,
    creationDate: Date,
    creationUser: number,
    department: string,
    documentationCount: string,
    relationshipManager: string,
    sales: number,
    salesCut: string,
    vinculationDate: Date,
    productType: string,
    status: string,
    modules: string[],
    economicActivity: IEconomicActivity,
    owner: {
      id: number,
      name: string,
      firstSurname: string,
      secondSurname: string,
      documentType: string,
      documentNumber: string,
      email: string,
      modules: string[]
    },
    phone: {
      extension: string,
      number: string
    },
    disbursementContract?: any,
    bankRegion?: IBankRegion 
}

export interface IEconomicActivity {
    ciiuCode: string,
    description: string,
    economicSector: IEconomicSector
}

export interface IEconomicSector {
    id: number,
    description: string
}

export interface IEnterpriseDocumentation {
  id: number,
  status: string,
  modificationDate: Date,
  comment: string,
  expeditionDate: Date,
  effectivenessDate: Date,
  file: {
      id: number,
      name: string,
      url: S3Service
  }
}

export interface IEnterpriseDocumentStatus {
  statusFromService: EnterpriseDocumentationStatusEnum,
  dateToService: Date
}

export interface IEnterpriseFinancingPlan {
  id: number,
  folio?: string,
  type: string,
  comments?: string,
  effectivenessDate?: string,
  status: string,
  summary: ISummary,
  observations?: string[]
	}

  export interface IRatePeriodicityType {
    code: string,
    description: string
  }

  export interface INegotiatedRate {
    baseType: IRatePeriodicityType,
    specialRate: number,
    periodicityType: IRatePeriodicityType
  }

  export interface ISummary {
    termDays?: number
    negotiatedRate?: INegotiatedRate
  }
  
  export interface ICreatePlanProviderOption {
    providerId: number,
    hasAgreement: boolean,
    requireAuthToPerformOperation: boolean,
    authDay?: number
  }
  
  export interface ICreatePlanEconomicGroup {
    enterpriseId: number,
    sales?: number,
    salesCut?: string
  }
  
  export interface ICreatePlanRateTemplate {
    baseType: string,
    baseValue: number,
    specialRate: number,
    periodicityType: string,
    ea: number,
    mv: number
  }
  export interface ICreateFinancingPlanReq {
    folio: string,
    type: string,
    minimumRate: ICreatePlanRateTemplate,
    negotiatedRate: ICreatePlanRateTemplate,
    validityDays: number,
    validityDate: string,
    paydayInitialRange: number,
    termDays: number,
    paymentMethod: string,
    clientPermissions: string[]
    salesCut?: string,
    comments?: string,
    providerOptions?: ICreatePlanProviderOption,
    economicGroup?: ICreatePlanEconomicGroup[],
    totalSales?: number,
    isSpecialRate?: boolean,
    paydayFinalRange?: number,
    isPunctualPlan?: boolean,
    evidenceFilename?: string,
  }

  export interface ISummaryPlanCreated {
    termDays: number,
    negotiatedRate: ISummaryNegociatedRateBody
  }

  export interface ISummaryNegociatedRateBody {
    baseType: IRatePeriodicityType,
    specialRate: number,
    periodicityType: IRatePeriodicityType
  }

  export interface IResponseFinancingPlan  {
  id: number,
  folio: string,
  type: string,
  comments: string,
  status: string,
  effectivenessDate: Date
  observations: string[],
  summary: ISummaryPlanCreated
}
