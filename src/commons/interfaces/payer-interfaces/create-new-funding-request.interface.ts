export interface CreateNewFundingRequest {
    lenderId: number,
    paymentInstructions?: string,
    filename?: string,
    contentType?: string
}