export enum EnterpriseFundingRequestStatus {
    PENDING_LENDER_APPROVAL = 'PENDING_LENDER_APPROVAL',
    PENDING_PAYER_APPROVAL = 'PENDING_PAYER_APPROVAL', 
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED'
}

export const isValidFundingRequestStatus = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseFundingRequestStatus.PENDING_LENDER_APPROVAL:
            return EnterpriseFundingRequestStatus.PENDING_LENDER_APPROVAL;

        case EnterpriseFundingRequestStatus.PENDING_PAYER_APPROVAL:
            return EnterpriseFundingRequestStatus.PENDING_PAYER_APPROVAL;

        case EnterpriseFundingRequestStatus.REJECTED:
            return EnterpriseFundingRequestStatus.REJECTED;

        case EnterpriseFundingRequestStatus.APPROVED:
            return EnterpriseFundingRequestStatus.APPROVED;

        default:
            return null;
    }
}