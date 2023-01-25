export interface IUpdateFundingLinkPayerLenderCustomAttribute {
    id: number;
    value?: string;
    options?: options[]
    isChecked?: boolean;
}

interface options {
    id: number
}