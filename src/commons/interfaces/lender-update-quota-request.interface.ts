import { RateTypeEnum } from "commons/enums/rate-type.enum";

export interface ILenderUpdateQuotaRequest {
    grantedQuota: number;
    rateType: RateTypeEnum;
    rate: number;
    comments?: string;
    userId: number;
}