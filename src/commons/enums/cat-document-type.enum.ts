export enum CatDocumentTypeEnum {
    ENROLLMENT_FORM = 'ENROLLMENT_FORM',
    CHAMBER_OF_COMMERCE_CERTIFICATE = 'CHAMBER_OF_COMMERCE_CERTIFICATE',
    LEGAL_REPRESENTATIVE_ID = 'LEGAL_REPRESENTATIVE_ID',
    RUT = 'RUT',
    PAYER_AGREEMENT = 'PAYER_AGREEMENT',
    PROVIDER_AGREEMENT = 'PROVIDER_AGREEMENT',
    FUNDING_AGREEMENT = 'FUNDING_AGREEMENT',
    SHAREHOLDING_STRUCTURE = 'SHAREHOLDING_STRUCTURE',
    CODEBTORS_CHAMBER_COMMERCE = 'CODEBTORS_CHAMBER_COMMERCE',
    DEBTORS_CHAMBER_COMMERCE = 'DEBTORS_CHAMBER_COMMERCE',
    ENTAILMENT_FORM = 'ENTAILMENT_FORM',
    FINANCIAL_STATEMENTS_DEBTOR = 'FINANCIAL_STATEMENTS_DEBTOR',
    MINUTES_DEBTORS_SHAREHOLDERS_MEETING = 'MINUTES_DEBTORS_SHAREHOLDERS_MEETING',
    MINUTES_MEETING_CODEBTORS = 'MINUTES_MEETING_CODEBTORS',
    OTHER_DOCUMENTS = 'OTHER_DOCUMENTS'

}

export const parseCatDocumentTypeStatus = (value: string) => {
    if(!value) return null

    switch (value) {

        case 'REJECTED':
            return 'Documento rechazado';

        case 'CURRENT':
            return 'Documento aprobado';
        
        case 'PENDING':
            return 'Documento solicitado';
        default:
            return null;
    }
}

export const parseCatDocumentTypeActions = (value: string) => {
    if(!value) return null

    switch (value) {

        case 'REJECTED':
            return 'Por favor adjuntar un nuevo documento en la plataforma';

        case 'CURRENT':
            return ' ';
        
        case 'PENDING':
            return 'Por favor adjuntar documento en la plataforma';
        default:
            return null;
    }
}