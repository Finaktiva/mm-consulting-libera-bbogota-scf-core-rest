export enum DisbursementContractTypeEnum {
    BANK_CHECK = 'BANK_CHECK',
    ACCOUNT_DEPOSIT = 'ACCOUNT_DEPOSIT'
};

export enum DisbursementContractAccountTypeEnum {
    SAVINGS = 'SAVINGS',
    CURRENT = 'CURRENT'
};

export const parseDisbursementContractType = (value: string ) => {
    if(!value)
        return null;
    
    switch(value) {
        case 'BANK_CHECK':
            return DisbursementContractTypeEnum.BANK_CHECK;
        case 'ACCOUNT_DEPOSIT':
            return DisbursementContractTypeEnum.ACCOUNT_DEPOSIT;
        default:
            return null;
    }
};

export const parseDisbursementContractAccountType = (value: string ) => {
    if(!value)
        return null;
    
    switch(value) {
        case 'SAVINGS':
            return DisbursementContractAccountTypeEnum.SAVINGS;
        case 'CURRENT':
            return DisbursementContractAccountTypeEnum.CURRENT;
        default:
            return null;
    }
};