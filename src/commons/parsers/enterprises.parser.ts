import { EFinancingObservations, EFinancingPlanClientPermission, EFinancingPlanType, FPlanStatus } from "commons/enums/financing-plan-type.enum";
import { IBankRegion, IRoles, IRolesWithUsersAssociated } from "commons/interfaces/catalogs";
import { IEnterpriseByDocument, IEnterpriseDocumentation, IEnterpriseFinancingPlan } from "commons/interfaces/enterprise-document.interface";
import { IEnterpriseFinancingPlans, IFinancingPlanDetail, IParseEnterprisePayers } from "commons/interfaces/enterprise.interface";
import { EconomicGroupDAO } from "dao/enterprise-economic-group.dao";
import { CatBankRegion } from "entities/cat-bank-regions";
import { CatEconomicActivity } from "entities/cat-ciiu-economic-activity";
import { Enterprise } from "entities/enterprise";
import { EnterpriseDocumentation } from "entities/enterprise-documentation";
import { EnterpriseEconomicGroup } from "entities/enterprise-economic-group";
import { EnterpriseFinancingPlan } from "entities/enterprise-financing-plan";
import { Role } from "entities/role";
import { S3Metadata } from "entities/s3-metadata";
import { S3Service } from "services/s3.service";
import moment, { Moment } from 'moment-timezone';
import { UserTypeEnum } from "commons/enums/user-type.enum";

export default class EnterprisesParser {
    static parseCatBankRegion(catBankRegion: CatBankRegion): IBankRegion{
        console.log('PARSER: Starting parseCatBankRegion function...');
        return {
            id: +catBankRegion.id,
            description: catBankRegion.description
        }
    }

    static parseEconomicActivity(economicActivity: CatEconomicActivity) {
        console.log('PARSER: Starting parseGetEnterpriseDocument function...');
        return economicActivity ? {
            ciiuCode: economicActivity.ciiuCode,
            description: economicActivity.description,
            economicSector: {
                id: +economicActivity.economicSector.id,
                description: economicActivity.economicSector.description
            }
        } : null;
    }

    static parseGetEnterpriseDocument(searchEnterprise): IEnterpriseByDocument {
        console.log('PARSER: Starting parseGetEnterpriseDocument function...');
        let finalResponse: IEnterpriseByDocument = {
            id: searchEnterprise.id,
            enterpriseName: searchEnterprise.enterpriseName,
            documentType: searchEnterprise.documentType,
            nit: searchEnterprise.nit,
            city: searchEnterprise.city,
            creationDate: searchEnterprise.creationDate,
            creationUser: searchEnterprise.creationUser,
            department: searchEnterprise.department,
            documentationCount: searchEnterprise.documentationCount,
            relationshipManager: searchEnterprise.relationshipManager,
            sales: +searchEnterprise.sales,
            salesCut: searchEnterprise.salesCut,
            vinculationDate: searchEnterprise.vinculationDate,
            productType: searchEnterprise.productType,
            status: searchEnterprise.status,
            modules: searchEnterprise.modules,
            economicActivity: EnterprisesParser.parseEconomicActivity(searchEnterprise.economicActivity),
            owner: searchEnterprise.owner,
            phone: searchEnterprise.phone,
            bankRegion: searchEnterprise.bankRegion ? EnterprisesParser.parseCatBankRegion(searchEnterprise.bankRegion) : null
          }
        console.log('PARSER: Ending parseGetEnterpriseDocument function...');
        return finalResponse;
    }

    static parseEnterprisePayers(enterprisePayers: Enterprise[]): IParseEnterprisePayers[] {
        console.log('PARSER: Starting parseEnterprisePayers function...');
        let parsedEnterprises: IParseEnterprisePayers[] = enterprisePayers.map((enterprise) => {
            return {
                id: +enterprise.id,
                documentType: enterprise.enterpriseDocumentType,
                documentNumber: enterprise.nit,
                enterpriseName: enterprise.enterpriseName,
                sales: +enterprise.sale,
                salesCut: enterprise.salesCut
            } 
        });
        console.log('PARSER: Ending parseEnterprisePayers function...');
        return parsedEnterprises
    }

    static parseEnterpriseDocumentation(enterpriseDocumentation: EnterpriseDocumentation, file: S3Metadata, url: S3Service) {
        console.log('PARSER: Starting parseEnterpriseDocumentation function...');
        let parseEnterprise: IEnterpriseDocumentation = {
            id: +enterpriseDocumentation.id,
            status: enterpriseDocumentation.status,
            modificationDate: enterpriseDocumentation.modificationDate,
            comment: enterpriseDocumentation.comment,
            expeditionDate: enterpriseDocumentation.expeditionDate,
            effectivenessDate: enterpriseDocumentation.effectivenessDate,
            file: {
                id: file.id,
                name: file.filename,
                url: url
            }
          }
        console.log('PARSER: Ending parseEnterpriseDocumentation function...');
        return parseEnterprise;
    }

    static async parseFinancingPlanDetail(financingPlan: EnterpriseFinancingPlan, userType: string) {
        console.log('PARSER: Starting parseFinancingPlanDetail');
        let permissions = financingPlan.clientePermission.map( p => p.permission );
        console.log('permissions ==> ', permissions);

        let parseFinancingPlanDetail: IFinancingPlanDetail = {
            id: +financingPlan.id,
            folio: financingPlan.folioNumber,
            type: financingPlan.type,
            providerOptions: financingPlan.provider ? {
                provider: {
                    id: +financingPlan.provider.id,
                    document: financingPlan.provider.nit,
                    documentType: financingPlan.provider.enterpriseDocumentType,
                    name: financingPlan.provider.enterpriseName
                },
                hasAgreement: financingPlan.agreement,
                requireAuthToPerformOperation: financingPlan.providerAuth,
                authDay: +financingPlan.authDays
            } : null,
            economicGroup: financingPlan.economicGroup.length > 0 ? 
                financingPlan.economicGroup.map((economicGroup) => {
                    return {
                        enterpriseId: +economicGroup.enterprise.id,
                        enterpriseName: economicGroup.enterprise.enterpriseName,
                        documentType: economicGroup.enterprise.enterpriseDocumentType,
                        documentNumber: economicGroup.enterprise.nit,
                        sales: +economicGroup.sales,
                        salesCut: economicGroup.salesCut
                    }
                }) : null,
            totalSales: +financingPlan.sales,
            salesCut: financingPlan.salesCut,
            minimumRate: {
                baseType: financingPlan.minBaseRate.code,
                baseValue: +financingPlan.minBaseRateValue,
                specialRate: +financingPlan.minSpecialRateValue,
                periodicityType: financingPlan.minRatePeriodicity.code,
                ea: +financingPlan.minEfectiveRateEA,
                mv: +financingPlan.minEfectiveRateMV
            },
            isSpecialRate: financingPlan.specialRate,
            validityDays: +financingPlan.validityDays,
            validityDate: financingPlan.validityDate,
            paydayInitialRange: +financingPlan.payDayInitialRange,
            paydayFinalRange: financingPlan.payDayFinalRange,
            paymentMethod: financingPlan.paymentMethod,
            isPunctualPlan: financingPlan.punctualPlan,
            creationDate: financingPlan.creationDate,
            modificationDate: null,
            acceptanceDate: financingPlan.status in FPlanStatus ? financingPlan.acceptanceDate : null, 
            /* Esta fecha sólo será mostrada si previamente el cliente aceptó el plan, para determinar que un 
               cliente aceptó el plan, el mismo estaría en alguno de los estatus del enum */
            evidenceFile: financingPlan.evidenceFile ? {
                id: +financingPlan.evidenceFile.id,
                name: financingPlan.evidenceFile.filename,
                url: await S3Service.getObjectUrl({ bucket: financingPlan.evidenceFile.bucket, fileKey: financingPlan.evidenceFile.fileKey })
            } : null,
            creationUser: financingPlan.creationUser ? {
                id: +financingPlan.creationUser.id,
                name: financingPlan.creationUser.userProperties.name,
                firstSurname: financingPlan.creationUser.userProperties.firstSurname,
                secondSurname: financingPlan.creationUser.userProperties.secondSurname,
                email: financingPlan.creationUser.email
            } : null,
            approvalUser: financingPlan.approvalUser ? {
                id: +financingPlan.approvalUser.id,
                name: financingPlan.approvalUser.userProperties.name,
                firstSurname: financingPlan.approvalUser.userProperties.firstSurname,
                secondSurname: financingPlan.approvalUser.userProperties.secondSurname,
                email: financingPlan.approvalUser.email
            } : null,
            acceptanceUser: financingPlan.acceptanceUser ? {
                id: +financingPlan.acceptanceUser.id,
                name: financingPlan.acceptanceUser.userProperties.name,
                firstSurname: financingPlan.acceptanceUser.userProperties.firstSurname,
                secondSurname: financingPlan.acceptanceUser.userProperties.secondSurname,
                email: financingPlan.acceptanceUser.email
            } : null
        }
        userType === UserTypeEnum.ENTERPRISE_USER && permissions.includes(EFinancingPlanClientPermission.DAYS) ? 
            parseFinancingPlanDetail.termDays = +financingPlan.operationTermDays : userType === UserTypeEnum.LIBERA_USER ? 
            parseFinancingPlanDetail.termDays = +financingPlan.operationTermDays : null;
        userType === UserTypeEnum.ENTERPRISE_USER && permissions.includes(EFinancingPlanClientPermission.RATE) ?
            parseFinancingPlanDetail.negotiatedRate = {
                baseType: financingPlan.negociatedBaseRate.code,
                baseValue: +financingPlan.negociatedBaseRateValue,
                specialRate: +financingPlan.negociatedSpecialRateValue,
                periodicityType: financingPlan.negociatedRatePeriodicity.code,
                ea: +financingPlan.negociatedEfecRateEA,
                mv: +financingPlan.negociatedEfecRateMV
            } : userType === UserTypeEnum.LIBERA_USER ? 
            parseFinancingPlanDetail.negotiatedRate = {
                baseType: financingPlan.negociatedBaseRate.code,
                baseValue: +financingPlan.negociatedBaseRateValue,
                specialRate: +financingPlan.negociatedSpecialRateValue,
                periodicityType: financingPlan.negociatedRatePeriodicity.code,
                ea: +financingPlan.negociatedEfecRateEA,
                mv: +financingPlan.negociatedEfecRateMV
            } : null;
        userType === UserTypeEnum.LIBERA_USER ? parseFinancingPlanDetail.comments = financingPlan.comments : null;
        userType === UserTypeEnum.LIBERA_USER ? parseFinancingPlanDetail.clientPermissions = financingPlan.clientePermission.length > 0 ?
            financingPlan.clientePermission.map( p => p.permission ) : [] : null;
        
        console.log('PARSER: Ending parseFinancingPlanDetail');
        return parseFinancingPlanDetail;
    }

    static parseRoles(rolesEntity: IRolesWithUsersAssociated[]): IRoles[]{
        console.log('PARSER: Starting parseRoles function...');
        
        let finalArr = [];
        for (const role of rolesEntity) {
            let finalRole = {
                code: role.name,
                description: role.description,
                appliesTo: role.appliesTo,
                creationDate: role.creationDate,
                modificationDate: role.modificationDate,
                acronym: role.acronym,
                associatedUsers: role.associatedUsers,
                status: role.status
            }
            finalArr.push(finalRole);
        }
        console.log('PARSER: Ending parseRoles function...');
        return finalArr;
    }

    static async parseEnterpriseFinancingPlans(enterprisePlans: EnterpriseFinancingPlan[], userType: string): Promise<IEnterpriseFinancingPlan[]> {
        console.log('PARSER: Starting parseEnterpriseFinancingPlans');
        let finalResponse: IEnterpriseFinancingPlan[] = [];
        if (userType === UserTypeEnum.ENTERPRISE_USER) {
            for (const plan of enterprisePlans) {
                let permissions = plan.clientePermission.map( p => p.permission );
                console.log('permissions ==> ', permissions);
                console.log('plan ==> ', plan);
    
                let daysPermission = permissions.includes(EFinancingPlanClientPermission.DAYS);
                let ratePermission = permissions.includes(EFinancingPlanClientPermission.RATE);
    
                let elementOfResponse: IEnterpriseFinancingPlans = {
                    id: +plan.id,
                    type: plan.type,
                    comments: plan.comments,
                    description: plan.type === EFinancingPlanType.COMMISSION ? 'Sin descuento' : null || 
                                 plan.type === EFinancingPlanType.EXPONENTIAL ? 'Con descuento' : null ||
                                 plan.type === EFinancingPlanType.FUNDED ? 'Con descuento y financiación adicional' : null,
                    status: plan.status,
                    provider: plan.provider ? {
                        id: plan.provider.id,
                        enterpriseName: plan.provider.enterpriseName,
                        documentNumber: plan.provider.nit
                    } : null,
                    summary: null
                }
                
                daysPermission || ratePermission ? elementOfResponse.summary = {} : null
                daysPermission ? elementOfResponse.summary.termDays = +plan.operationTermDays : null;
                ratePermission ? elementOfResponse.summary.negotiatedRate = {
                    baseType: {
                        code: plan.negociatedBaseRate.code,
                        description: plan.negociatedBaseRate.description
                    },
                    specialRate: +plan.negociatedSpecialRateValue,
                    periodicityType: {
                        code: plan.negociatedRatePeriodicity.code,
                        description: plan.negociatedRatePeriodicity.description
                    }
                } : null;
                finalResponse.push(elementOfResponse);
            }
        } else {
            for (const plan of enterprisePlans) {
                let arrObservations: string[] = [];
                if(plan.agreement)
                    arrObservations.push(EFinancingObservations.AGREEMENT);
                if(plan.specialRate)
                    arrObservations.push(EFinancingObservations.SPECIAL_RATE);
                if(plan.economicGroup && plan.economicGroup.length > 0 )
                    arrObservations.push(EFinancingObservations.ECONOMIC_GROUP);
                    console.log('plan.economicGroup ==> ', plan.economicGroup);
    
                let elementOfResponse: IEnterpriseFinancingPlans = {
                    id: +plan.id,
                    folio: plan.folioNumber,
                    type: plan.type,
                    comments: plan.comments,
                    effectivenessDate: moment(plan.validityDate).format('YYYY-MM-DD'),
                    status: plan.status,
                    observations: arrObservations,
                    summary: {
                        termDays: +plan.operationTermDays,
                        negotiatedRate: {
                            baseType: {
                                code: plan.negociatedBaseRate.code,
                                description: plan.negociatedBaseRate.description
                            },
                            specialRate: +plan.negociatedSpecialRateValue,
                            periodicityType: {
                                code: plan.negociatedRatePeriodicity.code,
                                description: plan.negociatedRatePeriodicity.description
                            }
                        }
                    }
                }
                finalResponse.push(elementOfResponse);
            }
        }
        console.log('PARSER: Ending parseEnterpriseFinancingPlans');
        return finalResponse;
    }

}