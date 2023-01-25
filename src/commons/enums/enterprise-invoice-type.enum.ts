export enum EnterpriseInvoiceTypeEnum {
    INVOICE = 'INVOICE',
    CREDIT_NOTE = 'CREDIT_NOTE' 
}

export const isValidEnterpriseInvoiceType  = (value: string) => {
    if(!value) return null;

    switch (value) {
        case EnterpriseInvoiceTypeEnum.INVOICE:
            return EnterpriseInvoiceTypeEnum.INVOICE;
        case EnterpriseInvoiceTypeEnum.CREDIT_NOTE:
            return EnterpriseInvoiceTypeEnum.CREDIT_NOTE;
        default:
            return null;
    }
}