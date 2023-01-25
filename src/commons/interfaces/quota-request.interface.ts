import { EnterpriseQuotaRequestStatusEnum } from "commons/enums/enterprise-quota-request-status.enum";
import { EnterpriseQuotaRequestTypeEnum } from "commons/enums/enterprise-quota-request-type.enum";
import { RateTypeEnum } from "commons/enums/rate-type.enum";

export interface IQuotaRequest {
    id: number;
    lender?: IEnterprise;
    payer?: IEnterprise;
    requestedQuota: number;
    grantedQuota: number;
    creationDate: Date;
    status: EnterpriseQuotaRequestStatusEnum;
    payerComments: string;
    lenderComments: string;
    requestType: EnterpriseQuotaRequestTypeEnum;
    rateType: RateTypeEnum;
    rate: number;
}

export interface IEnterprise {
    id: number;
    enterpriseName: string;
    nit: string;
}