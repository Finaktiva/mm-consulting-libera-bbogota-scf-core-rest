import { EnterpriseQuotaRequestTypeEnum } from "commons/enums/enterprise-quota-request-type.enum";

export interface IRequestQuotaAdjustment {
    quota: number,
    comments?: string,
    type: EnterpriseQuotaRequestTypeEnum
}