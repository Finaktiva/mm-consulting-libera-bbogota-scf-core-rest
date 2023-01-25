export interface ILenderFundingLink {
    id: number;
    enterpriseName: string;
    nit: string;
    grantedQuota: number;
    availableQuota: number;
    rate?: number
}