export interface FundingRecord {
    fundingRequestId: number,
    userId: number,
    fundingRole: FundingRole,
    eventDate: Date,
    typeEvent: FundingEventType
}

export type FundingRole = 'PAYER' | 'PROVIDER' | 'LENDER';
export type FundingEventType = 
    'CREATED'| 
    'LENDER_PAYMENT_CONFIRM'| 
    'LENDER_PAYMENT_IN_WAIT' | 
    'LENDER_PAYMENT_REJECTED' |
    'PROVIDER_PAYMENT_CONFIRM' |
    'PAYMENT_EXPIRED';