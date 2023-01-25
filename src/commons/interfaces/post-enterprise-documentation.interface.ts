import { CatDocumentTypeEnum } from "commons/enums/cat-document-type.enum"
import { EnterpriseDocumentationStatusEnum } from "commons/enums/enterprise-documentation-status.enum"
import { S3Metadata } from "entities/s3-metadata"

export interface PostEnterpriseDocumentResponse {
    id: number,
    documentTypeDescription: string,
    effectiveness: number,
    creationDate: string,
    status: EnterpriseDocumentationStatusEnum,
    modificationDate: string,
    expeditionDate: string,
    effectivenessDate: string,
    file: S3Metadata,
    type: {
        templateUrl: string,
        required:  boolean,
        code:  CatDocumentTypeEnum,
        description:  string,
        announcement:  string,
        monthEffectiveness: number
    },
    comment: string
}
