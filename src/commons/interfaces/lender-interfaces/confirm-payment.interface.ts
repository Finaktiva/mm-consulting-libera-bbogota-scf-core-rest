export interface ConfirmPayment {
    filename?: string,
    contentType?: string
    status: confirmPaymentStatus,
    comments?: string,
    effectivePaymentDate: Date,
    effectivePaymentAmount: number
}

export type confirmPaymentStatus = 'ACCEPTED' | 'REJECTED'