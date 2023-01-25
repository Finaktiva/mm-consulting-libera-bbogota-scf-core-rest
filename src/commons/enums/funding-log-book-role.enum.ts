export enum FundingLogBookRoleEnum {
    PAYER = 'PAYER',
    PROVIDER = 'PROVIDER',
    LENDER = 'LENDER'
}

export const parseFundingLogBookRole = (value: string) => {
    if(!value) return null;

    switch (value) {
        case FundingLogBookRoleEnum.LENDER:
            return FundingLogBookRoleEnum.LENDER;
        case FundingLogBookRoleEnum.PAYER:
            return FundingLogBookRoleEnum.PAYER;
        case FundingLogBookRoleEnum.PROVIDER:
            return FundingLogBookRoleEnum.PROVIDER;
        default:
            return null;
    }
}