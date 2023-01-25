import { DisbursementContractTypeEnum } from 'commons/enums/entities/disbursement-contract.enum';
import { Enterprise } from 'entities/enterprise';
import { EnterpriseLinksDisbursementContract } from 'entities/enterprise-links-disbursement-contract';
import { UserEnterprise } from 'entities/user-enterprise';
import { S3Service } from 'services/s3.service';

export default class ProviderParsers {
    static async parseGeneralData(enterprise: Enterprise, disbursementContract:EnterpriseLinksDisbursementContract){
        return {
            documentType: enterprise.enterpriseDocumentType,
            nit: enterprise.nit,
            enterpriseName: enterprise.enterpriseName,
            department: enterprise.department,
            city: enterprise.city,
            economicActivity: enterprise.economicActivity ? {
                ciiuCode: enterprise.economicActivity.ciiuCode,
                description: enterprise.economicActivity.description,
                economicSector: {
                    id: +enterprise.economicActivity.economicSector.id,
                    description: enterprise.economicActivity.economicSector.description
                }
            }: null,
            disbursementContract: disbursementContract ? {
                type: disbursementContract.type ? disbursementContract.type : null,
                account: disbursementContract.type == DisbursementContractTypeEnum.ACCOUNT_DEPOSIT ? {
                    type: disbursementContract?.accountType ? disbursementContract.accountType : null, 
                    number: disbursementContract?.accountNumber ? disbursementContract.accountNumber : null,
                    bank: {
                        "code": disbursementContract?.bank.code ? disbursementContract.bank.code : null,
                        "name": disbursementContract?.bank.businessName ? disbursementContract?.bank.businessName : null
                    }
                } : null,
                bankCertificationFile: disbursementContract.bankCertificationFile ? {
                    id: +disbursementContract.bankCertificationFile.id,
                    name: disbursementContract.bank.businessName,
                    url: await S3Service.getObjectUrl({ bucket: disbursementContract.bankCertificationFile.bucket, fileKey: disbursementContract.bankCertificationFile.fileKey })
                } : null
            } : null,
            vinculationDate: enterprise.affiliationAcceptanceDate,
            productType: enterprise.productType
        }
    }
    
    static parseContactInformation(usersEnteprise: UserEnterprise[]){
        return usersEnteprise.map(userEnterprise => {
            return {
                id : userEnterprise.user.id,
                name : userEnterprise.user.userProperties.name,
                firstSurname : userEnterprise.user.userProperties.firstSurname,
                secondSurname : userEnterprise.user.userProperties.secondSurname,
                email: userEnterprise.user.email,
                phone:{
                    number : userEnterprise.user.userProperties.phoneNumber,
                    extension: userEnterprise.user.userProperties.phoneExt
                },
                activeProducts: [userEnterprise.enterprise.productType],
                modules: userEnterprise.user.userModules.map(userModule => userModule.catModule.name),
                isOwner: false
            }
        });
    }
}