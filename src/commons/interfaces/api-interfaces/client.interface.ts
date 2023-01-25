import { CatEnterpriseDocumentCodeTypeEnum } from "commons/enums/cat-enterprise-document-code-type.enum"

export interface IClientBasicData {
    documentType: string,
    documentNumber: string,
	ciiu: string,
    enterpriseName: string,
	relationshipManager: string
}