import { CatDocumentTypeEnum, parseCatDocumentTypeActions, parseCatDocumentTypeStatus } from 'commons/enums/cat-document-type.enum';
import { CatModuleEnum, parseCatModule } from 'commons/enums/cat-module.enum';
import { CatNotificationTypeEnum } from 'commons/enums/cat-notification-type.enum';
import { DiscountNegotiationsLogBookStatusEnum } from 'commons/enums/discount-negotiations-log-book-status.enum';
import { DocumentTypeEnum, DocumentTypeTranslationEnum } from 'commons/enums/document-type-enum';
import { EnterpriseInvoiceBulkStatus } from 'commons/enums/enterprise-invoice-bulk-status.enum';
import { EnterpriseInvoiceNegotiationProcessStatus, EnterpriseInvoiceNegotiationRoleEnum } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';
import { EnterpriseInvoiceStatusEnum } from 'commons/enums/enterprise-invoice-status.enum';
import { EnterpriseLinkStatus } from 'commons/enums/enterprise-link-status.enum';
import { EnterpriseLinkTypeEnum } from 'commons/enums/enterprise-link-type.enum';
import { EnterpriseModuleStatusEnum, parseEnterpriseStatusToEnterpriseModuleStatus } from 'commons/enums/enterprise-module-status.enum';
import { EnterpriseRecordTypeEventEnum } from 'commons/enums/enterprise-record-type-event.enum';
import { EnterpriseRequestBulkStatus } from 'commons/enums/enterprise-request-bulk.enum';
import { EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseRequestTypeEnum } from 'commons/enums/enterprise-request-type.enum';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { DisbursementContractTypeEnum, parseDisbursementContractAccountType, parseDisbursementContractType } from 'commons/enums/entities/disbursement-contract.enum';
import { EntitytoRecordEnum } from 'commons/enums/entity-to-record.enum';
import { FinancingPlanStatusActionsEnum, FinancingPlanStatusEnum } from 'commons/enums/financing-plan-status-actions.enum';
import { ModuleRoleEnum, parseModuleRole } from 'commons/enums/module-role.enum';
import { PermissionEnum } from 'commons/enums/permission.enum';
import { parseUserRole, RoleEnum } from 'commons/enums/role.enum';
import { UserStatus } from 'commons/enums/user-status.enum';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import { BadRequestException, ConflictException, InternalServerException, NotFoundException } from 'commons/exceptions';
import { FilterEnterpriseRequests, FilterEnterprises, FilterFinancingPlans, SimpleFilter } from 'commons/filter';
import { ICreateFinancingPlanReq, IEnterpriseFinancingPlan, IResponseFinancingPlan } from 'commons/interfaces/enterprise-document.interface';
import { IRequest } from 'commons/interfaces/enterprise-link.interface';
import { CreateEnterpriseCustomAttributes, IEnterpriseModules, IParseEnterprisePayers } from 'commons/interfaces/enterprise.interface';
import { INewInvoiceNegotiation, UpdateNegotiationById } from 'commons/interfaces/invoice-negotiation-process.interface';
import { EInvoiceBulkLoad } from 'commons/interfaces/invoice.interface';
import { IAccount, ICreateNewLinkRequest, IOwner, IPhone } from 'commons/interfaces/payer-interfaces/create-link-request.interface';
import { PostEnterpriseDocumentResponse } from 'commons/interfaces/post-enterprise-documentation.interface';
import { IProcessInstance, ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { IFilterLenders } from 'commons/interfaces/query-filters.interface';
import LiberaUtils from 'commons/libera.utils';
import ClientPermissionParser from 'commons/parsers/client-permissions.parser';
import ClientsParser from 'commons/parsers/clients.parser';
import EconomicGroupParser from 'commons/parsers/economic-group.parser';
import EnterprisesParser from 'commons/parsers/enterprises.parser';
import FinancingPlanParser from 'commons/parsers/financing-plan.parser';
import S3Utils from 'commons/s3.utils';
import { EconomicActivitiesDAO } from 'dao/cat-economic-activities.dao';
import { CatModuleDocumentationDAO } from 'dao/cat-module-documentation.dao';
import { CatModuleDAO } from 'dao/cat-module.dao';
import { CatalogDAO } from 'dao/catalog.dao';
import { CustomAttributesDAO } from 'dao/custom-attributes.dao';
import { EnterpriseBrandingDAO } from 'dao/enterprise-branding.dao';
import { EnterpriseCustomAttributesDAO } from 'dao/enterprise-custom-attributes.dao';
import { EnterpriseDocumentationDAO } from 'dao/enterprise-documentation.dao';
import { EconomicGroupDAO } from 'dao/enterprise-economic-group.dao';
import { FinancingPlanDAO } from 'dao/enterprise-financing-plan.dao';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import { EnterpriseInvoceCustomAttributesDAO } from 'dao/enterprise-invoce-custom-attribute.dao';
import { EnterpriseInvoiceBulkDAO } from 'dao/enterprise-invoice-bulk.dao';
import { EnterpriseInvoiceDAO } from 'dao/enterprise-invoice.dao';
import { EnterpriseLinkDAO } from 'dao/enterprise-link.dao';
import { EnterpriseLinksDisbursementContractDAO } from 'dao/enterprise-links-disbursement-contract.dao';
import { EnterpriseModuleDAO } from 'dao/enterprise-module.dao';
import { EnterpriseRequestBulkDAO } from 'dao/enterprise-request-bulk.dao';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { FinancingPlanPermissionDAO } from 'dao/financing-plan-permission.dao';
import { InvoiceNegotiationProcessDAO } from 'dao/invoice-negotiation-process.dao';
import { EnterpriseLogBookDAO } from 'dao/logging/enterprise-log-book.dao';
import { NotificationDAO } from 'dao/notification.dao';
import { NotificationTypeDAO } from 'dao/notificationType.dao';
import { RelRatePeriodicityDAO } from 'dao/rel-base-rate-periodicity.dao';
import { RoleDAO } from 'dao/role.dao';
import { S3MetadataDAO } from 'dao/s3-metadata.dao';
import { UserEnterpriseDAO } from 'dao/user-enterprise.dao';
import { UserModuleDAO } from 'dao/user-module.dao';
import { UserPropertiesDAO } from 'dao/user-properties.dao';
import { UserRoleDAO } from 'dao/user-role.dao';
import { UserDAO } from 'dao/user.dao';
import { Banks } from 'entities/banks';
import { CatBankRegion } from 'entities/cat-bank-regions';
import { CatEconomicActivity } from 'entities/cat-ciiu-economic-activity';
import { CatCustomAttributes } from 'entities/cat-custom-attributes';
import { CatDocumentType } from 'entities/cat-document-type';
import { CatModuleDocumentation } from 'entities/cat-module-documentation';
import { Enterprise } from 'entities/enterprise';
import { EnterpriseBranding } from 'entities/enterprise-branding';
import { EnterpriseCustomAttributes } from 'entities/enterprise-custom-attributes';
import { EnterpriseDocumentation } from 'entities/enterprise-documentation';
import { EnterpriseFinancingPlan } from 'entities/enterprise-financing-plan';
import { EnterpriseInvoice } from 'entities/enterprise-invoice';
import { EnterpriseInvoiceBulk } from 'entities/enterprise-invoice-bulk';
import { InvoiceNegotiationProcess } from 'entities/enterprise-invoice-negotiation-process';
import { EnterpriseLinks } from 'entities/enterprise-links';
import { EnterpriseLinksDisbursementContract } from 'entities/enterprise-links-disbursement-contract';
import { EnterpriseModule } from 'entities/enterprise-module';
import { EnterpriseRequest } from 'entities/enterprise-request';
import { EnterpriseRequestBulk } from 'entities/enterprise-request-bulk';
import { Notification } from 'entities/notification';
import { Role } from 'entities/role';
import { S3Metadata } from 'entities/s3-metadata';
import { User } from 'entities/user';
import { UserEnterprise } from 'entities/user-enterprise';
import { UserModule } from 'entities/user-module';
import { UserProperties } from 'entities/user-properties';
import { UserRole } from 'entities/user-role';
import _ from 'lodash';
import moment from 'moment-timezone';
import { BPMService } from 'services/bpm.service';
import uuid from 'uuid';
import { EnterpriseDocumentationStatusEnum, parseEnterpriseDocumentationStatus } from '../commons/enums/enterprise-documentation-status.enum';
import { ClientsAndContactsService } from './clients-and-contacts.service';
import CognitoIdentityService from './cognito.identity.service';
import { EnterpriseDocumentationService } from './enterprise-documentation.service';
import { EnterpriseLinkService } from './enterprise-link.service';
import { EnterpriseModuleService } from './enterprise-module.service';
import { S3MetadataService } from './s3-metadata.service';
import { S3Service } from './s3.service';
import { SESService } from './ses.service';
import { SQSService } from './sqs.service';
import { UserService } from './user.service';
import { RelEnterpriseTermsDAO } from 'dao/rel-enterprise-terms.dao';
import { TermsDAO } from 'dao/terms.dao';
import { FilterEnterpriseEnum } from 'commons/enums/filter-by.enum';
import { EnterpriseUtils } from 'commons/utils/enterprise';

const notificationSubject: string = process.env.NOTIFICATION_SUBJECT;
const COGNITO_USER_POOL_ID: string = process.env.COGNITO_USER_POOL_ID;
const S3_BUCKET_NAME: string = process.env.S3_BUCKET_NAME;
const S3_FILE_PATH_PREFIX: string = process.env.S3_FILE_PATH_PREFIX;
const S3_DESTINATION_BUCKET: string = process.env.S3_DESTINATION_BUCKET;
const S3_DESTINATION_PATH_PREFIX: string = process.env.S3_DESTINATION_PATH_PREFIX;
const CLOUDFRONT_URL: string = process.env.CLOUDFRONT_RESOURCES_URL;
const S3_ENTERPRISE_REQUEST_FILES_PATH_PREFIX: string = process.env.S3_ENTERPRISE_REQUEST_FILES_PATH_PREFIX;
const SQS_LIBERA_ENTERPRISE_BULK_QUEUE: string = process.env.SQS_LIBERA_ENTERPRISE_BULK_QUEUE;
const SQS_LIBERA_NEGOTIATION_QUEUE: string = process.env.SQS_LIBERA_NEGOTIATION_QUEUE;
const SES_REQUEST_DECLINED_TEMPLATE: string = process.env.SES_REQUEST_DECLINED_TEMPLATE;
const BPM_ENTERPRISE_SIGNAL_ID: string = process.env.BPM_ENTERPRISE_SIGNAL_ID;
const BPM_PAYER_NEGOTIATION_ANSWERED_EVENT: string = process.env.BPM_PAYER_NEGOTIATION_ANSWERED_EVENT;
const S3_ENTERPRISES_INVOICES_FILES_PATH_PREFIX: string = process.env.S3_ENTERPRISES_INVOICES_FILES_PATH_PREFIX;
const SQS_LIBERA_ENTERPRISE_INVOICES_BULK_QUEUE: string = process.env.SQS_LIBERA_ENTERPRISE_INVOICES_BULK_QUEUE;
const SQS_LIBERA_ENTERPRISE_RECORD: string = process.env.SQS_LIBERA_ENTERPRISE_RECORD;
const ENTERPRISE_DOCUMENTATION_ADMIN_REQUEST: string = process.env.ENTERPRISE_DOCUMENTATION_ADMIN_REQUEST;
const temporalDocumentationPathPrefix:string = process.env.S3_FILE_PATH_PREFIX;
const providerDisbursementContractPathPrefix:string = process.env.S3_PROVIDER_DISBURSEMENT_CONTRACT_FILE_PATH_PREFIX;
const bucket:string = process.env.S3_BUCKET_NAME;
const SES_SEND_DOCUMENTATION_RESOLUTION = process.env.SES_SEND_DOCUMENTATION_RESOLUTION;
const SES_UPDATE_DOCUMENTATION_BY_CLIENT: string = process.env.SES_UPDATE_DOCUMENTATION_BY_CLIENT;
const SES_SEND_PENDING_FINANCING_PLAN_APPROVAL_NOTIFICATION = process.env.SES_SEND_PENDING_FINANCING_PLAN_APPROVAL_NOTIFICATION;
const HOST = process.env.HOST;
const SES_SEND_FINANCING_PLAN_APPROVED_NOTIFICATION = process.env.SES_SEND_FINANCING_PLAN_APPROVED_NOTIFICATION;
const SES_SEND_FINANCING_PLAN_REJECTED_NOTIFICATION = process.env.SES_SEND_FINANCING_PLAN_REJECTED_NOTIFICATION;
const fileKey = 'resources/back/email-resources/' ;

export class EnterpriseService {

    static async updateEnterpriseStatusById(enterpriseId: number, status: EnterpriseStatusEnum, userId: number, explanation?: string): Promise<void> {
        console.log('SERVICE: Starting updateEnterpriseStatusById method');
        const enterprise: Enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        const enterpriseModules: EnterpriseModule[] = await EnterpriseModuleDAO.getModulesByEnterpriseById(enterpriseId);
        const { email } = enterprise.owner;

        try {
            if (!enterprise || enterprise.status === EnterpriseStatusEnum.DISABLED)
                throw new ConflictException('SCF.LIBERA.71', { enterpriseId });

            if (status === EnterpriseStatusEnum.ENABLED) {
                enterprise.affiliationAcceptanceDate = moment(moment.now(), 'x').toDate();
                if (enterprise.referenceRequest) {
                    const enterpriseRequest = await EnterpriseRequestDAO.getBasicEnterpriseRequest(enterprise.referenceRequest);
                    if (!enterpriseRequest) throw new Error(`Request with id: ${enterprise.referenceRequest} does not have bpmProcessInstanceId`);
                    const { bpmProccesInstanceId } = enterpriseRequest
                    const specificProcessInstance: ISpecificProcessInstance = {
                        processInstanceId: bpmProccesInstanceId.toString(),
                        event_id: BPM_ENTERPRISE_SIGNAL_ID,
                        reply: { reply: status }
                    }
                    const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
                    console.log(result);
                }

                try {
                    const sqsMetadata = {
                        sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                        body: {
                            userId: userId,
                            enterpriseId: +enterpriseId,
                            eventDate: moment(moment.now(), 'x').toDate(),
                            typeEvent: EnterpriseRecordTypeEventEnum.ENTERPRISE_APPROVED.toString(),
                            comments: explanation ? explanation.toString() : 'null',
                        }
                    }
                    await SQSService.sendMessage(sqsMetadata);
                } catch (errors) {
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                }
            };

            if (status === EnterpriseStatusEnum.DISABLED)
                enterprise.owner.status = UserStatus.DISABLED;

            for (let eModule of enterpriseModules) {
                if (eModule.status === EnterpriseModuleStatusEnum.REQUESTED_MODULE) {
                    eModule.status = parseEnterpriseStatusToEnterpriseModuleStatus(status.toString());
                }
            }

            const params: any = {
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: enterprise.owner.email
            };

            if (status === EnterpriseStatusEnum.REJECTED) {
                if (enterprise.referenceRequest) {
                    const enterpriseRequest = await EnterpriseRequestDAO.getBasicEnterpriseRequest(enterprise.referenceRequest);
                    const { bpmProccesInstanceId } = enterpriseRequest
                    const specificProcessInstance: ISpecificProcessInstance = {
                        processInstanceId: bpmProccesInstanceId.toString(),
                        event_id: BPM_ENTERPRISE_SIGNAL_ID,
                        reply: { reply: status }
                    }
                    const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
                    console.log(result);
                }
                if (explanation) {
                    await SESService.sendTemplatedEmail({
                        template: SES_REQUEST_DECLINED_TEMPLATE,
                        destinationEmail: email,
                        mergeVariables: {
                            enterpriseName: enterprise.enterpriseName,
                            explanation
                        }
                    });
                } else {
                    enterprise.status = status;
                    const result = await await CognitoIdentityService.adminDeleteUser(params).promise();
                    console.log(result);
                }

                try {
                    const sqsMetadata = {
                        sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                        body: {
                            userId: userId,
                            enterpriseId: +enterpriseId,
                            eventDate: moment(moment.now(), 'x').toDate(),
                            typeEvent: EnterpriseRecordTypeEventEnum.ENTERPRISE_REJECTED.toString(),
                            comments: explanation ? explanation.toString() : 'null',
                        }
                    }
                    await SQSService.sendMessage(sqsMetadata);
                } catch (errors) {
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                }
            }

            enterprise.status = status;
            await EnterpriseModuleDAO.saveEnterpriseModules(enterpriseModules);
            await EnterpriseDAO.updateEnterpriseAndOwner(enterprise);

            if (status === EnterpriseStatusEnum.ENABLED) {
                const comesFromService: boolean = true;
                await EnterpriseService.sendDocumentationResolution(+enterpriseId, comesFromService);
            }

        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            await EnterpriseDAO.updateEnterpriseAndOwner(enterprise);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }


        console.log('SERVICE: Finished updateEnterpriseStatusById method');
    }

    static async getEnterpriseDocumentationByEnterpriseId(enterpriseId: number, userId: number, param?: boolean) {
        console.log('SERVICE: Starting getEnterpriseDocumentationByEnterpriseId method');
        console.log('enterpriseId', enterpriseId);
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        if(!enterprise)
            throw new NotFoundException('SFC.LIBERA.375');
            
        const user = await UserDAO.getUserById(userId);
        //        if(enterprise.owner.id != userId)
        //            throw new ConflictException('SCF.LIBERA.22', {userId, enterpriseId});
        const enterpriseDocumentations = await EnterpriseDocumentationDAO
            .getEnterpriseDocumentationByEnterpriseId(enterpriseId, param);
        console.log('enterpriceDocumentation ===>', enterpriseDocumentations[0])
        const enterpriseDocumentationResult = [];

        for (let { id, creationDate, status, modificationDate, userId ,comment, documentType, s3Metadata, documentTypeDescription, expeditionDate, effectiveness, effectivenessDate, required } of enterpriseDocumentations) {
            let url = null;
            let file = null;
            if (s3Metadata) {
                url = await S3Service.getObjectUrl({ bucket: s3Metadata.bucket, fileKey: s3Metadata.fileKey });
                file = {
                    id: s3Metadata.id,
                    name: s3Metadata.filename,
                    url
                }
            }
            enterpriseDocumentationResult.push({
                id,
                creationDate,
                status,
                modificationDate,
                comment,
                documentTypeDescription,
                expeditionDate,
                effectiveness: effectiveness ? effectiveness : documentType.effectiveness,
                effectivenessDate,
                type: {
                    templateUrl: documentType.templateUrl ? await S3Service.getObjectUrl({ bucket: S3_BUCKET_NAME, fileKey: documentType.templateUrl }) : null,
                    required: required != null ? required : documentType.required,
                    code: documentType.code,
                    description: documentType.description,
                    announcement: documentType.announcement
                },
                file,
                isDeletable: (user.type == "LIBERA_USER") ? true : (user.type == "ENTERPRISE_USER" && user.id == userId) ? true : false
            });
        }
        console.log('SERVICE: Ending getEnterpriseDocumentationByEnterpriseId method');
        return enterpriseDocumentationResult;
    }

    static async getEnterprises(filter: FilterEnterprises) {
        console.log('SERVICE: Starting getEnterprises');

        const enterprisesTotal = await EnterpriseDAO.getEnterprise(filter);
        console.log('=== enterprisesTotal ===', enterprisesTotal);

        if (!enterprisesTotal[0].length)
            return ({ enterprisesDocCount: [], total: 0 });


        let enterprises = enterprisesTotal[0].map(({ id, enterpriseName, nit, owner, status, enterpriseModules, creationUser, creationDate, 
                affiliationAcceptanceDate, enterpriseDocumentType, sale, salesCut, bankRegion, financialConditions, productType }) => (
            {
                id: +id,
                enterpriseName,
                status,
                documentType: enterpriseDocumentType,
                phone: owner.userProperties.phoneNumber ?
                    {   
                        extension: owner.userProperties.phoneExt ? owner.userProperties.phoneExt : null,
                        number: owner.userProperties.phoneNumber
                    } : null,
                modules: enterpriseModules.map((enterpriseModules) => (enterpriseModules.status && enterpriseModules.status == EnterpriseModuleStatusEnum.ENABLED ? 
                        enterpriseModules.catModule.name : null)).filter(item => item),
                nit,
                owner: {
                    id: +owner.id,
                    name: owner.userProperties.name ? owner.userProperties.name : null,
                    firstSurname: owner.userProperties.firstSurname ? owner.userProperties.firstSurname : null,
                    secondSurname: owner.userProperties.secondSurname ? owner.userProperties.secondSurname : null,
                    email: owner.email
                },
                creationUser: +creationUser.id,
                creationDate: creationDate,
                documentationCount: null,
                vinculationDate: affiliationAcceptanceDate,
                sales: +sale,
                salesCut,
                bankRegion: bankRegion ? EnterprisesParser.parseCatBankRegion(bankRegion) : null,
                activeProducts: [productType], 
                financialConditions
            }));
        

        const enterprisesDocCount = await EnterpriseDocumentationService.documentationCount(enterprises);
        const total = enterprisesTotal[1];
        console.log(enterprisesDocCount)
        console.log('SERVICE: Ending getEnterprises');
        return ({ enterprisesDocCount, total });
    }

    static async deleteDocument(enterpriseId: number, documentationId: number) {
        console.log('SERVICE: Starting deleteDocument');
        console.log(`enterpriseId: ${enterpriseId}. documentationId: ${documentationId}`);
        const enterpriseDocumentation = await EnterpriseDocumentationDAO
            .getEnterpriseDocumentation(enterpriseId, documentationId);

        console.log(`enterpriseDocumentation: ${JSON.stringify(enterpriseDocumentation)}`);

        if (!enterpriseDocumentation || enterpriseDocumentation.status == EnterpriseDocumentationStatusEnum.DISABLED)
            throw new ConflictException('SCF.LIBERA.25', { documentationId });
        if (!enterpriseDocumentation.s3Metadata) throw new ConflictException('SCF.LIBERA.26');
        if (enterpriseDocumentation.enterprise.status == EnterpriseStatusEnum.DISABLED)
            throw new ConflictException('SCF.LIBERA.38', { enterpriseId: enterpriseDocumentation.enterprise.id });

        const file = enterpriseDocumentation.s3Metadata;

        const param: any = {
            bucket: file.bucket,
            filekey: file.fileKey
        }

        console.log(`param : ${param}`);

        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.PENDING;
        enterpriseDocumentation.s3Metadata = null;
        enterpriseDocumentation.expeditionDate = null;
        enterpriseDocumentation.effectivenessDate = null;
        enterpriseDocumentation.comment = null;
        await enterpriseDocumentation.save();

        await S3MetadataDAO.delete(file);
        await await S3Service.deleteFile(param);
        console.log('SERVICE: Ending deleteDocument');
    }

    static async updateDocumentationStatus(enterpriseId: number, documentationId: number, data: any, userId: number) {
        console.log('SERVICE: Starting updateDocumentationStatus');

        const enterpriseDocumentation = await EnterpriseDocumentationDAO.getEnterpriseDocumentation(enterpriseId, documentationId);

        if (!enterpriseDocumentation) throw new ConflictException('SCF.LIBERA.33');
        if (enterpriseDocumentation.status == EnterpriseDocumentationStatusEnum.DISABLED) throw new ConflictException('SCF.LIBERA.34');

        enterpriseDocumentation.status = parseEnterpriseDocumentationStatus(data.status)
        enterpriseDocumentation.modificationDate = moment(moment.now(), 'x').toDate();
        if (data.explanation)
            enterpriseDocumentation.comment = data.explanation;
        if (data.expeditionDate) 
            enterpriseDocumentation.expeditionDate = data.expeditionDate;

        if (enterpriseDocumentation.status == EnterpriseDocumentationStatusEnum.ACCEPTED) {
            if (enterpriseDocumentation.effectiveness)
                enterpriseDocumentation.effectivenessDate = moment( data.expeditionDate ).add( enterpriseDocumentation.effectiveness, 'M' ).toDate();
            else if (enterpriseDocumentation.documentType.effectiveness && enterpriseDocumentation.documentType.code.toString() != CatDocumentTypeEnum.OTHER_DOCUMENTS)
                enterpriseDocumentation.effectivenessDate = moment( data.expeditionDate ).add( enterpriseDocumentation.documentType.effectiveness, 'M' ).toDate();
            else
                enterpriseDocumentation.effectivenessDate = null
        
            if(enterpriseDocumentation.effectivenessDate){
                const effectiveness = moment(enterpriseDocumentation.effectivenessDate).diff(moment(moment.now(), 'x'), 'd') + 1;
                const colombiaCurrentTime = moment().tz('America/Bogota');
                const limitTime = moment('10:00 am', "HH:mm a");

                switch(true){
                    case (effectiveness < 1):
                        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.EXPIRED;
                        console.log(`effectiveness ==> ${effectiveness}, status ==> ${enterpriseDocumentation.status}`);
                    break;
                    case (effectiveness == 1 && colombiaCurrentTime.isAfter(limitTime)):
                        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.EXPIRED;
                        console.log(`effectiveness ==> ${effectiveness}, status ==> ${enterpriseDocumentation.status}`);
                    break;
                    case (effectiveness >= 1 && effectiveness <= 15):
                        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.ABOUT_TO_EXPIRE;
                        console.log(`effectiveness ==> ${effectiveness}, status ==> ${enterpriseDocumentation.status}`);
                    break;
                    case (effectiveness > 15):
                        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.CURRENT;
                        console.log(`effectiveness ==> ${effectiveness}, status ==> ${enterpriseDocumentation.status}`);
                    break;
                }
            }
            else
                enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.CURRENT
        }
        console.log('enterpriseDocumentation ==>', enterpriseDocumentation)
        await EnterpriseDocumentationDAO.saveEnterpriseDocumentation(enterpriseDocumentation);

        // const user = enterpriseDocumentation.enterprise.owner;

        // const notificationsStatus = [EnterpriseDocumentationStatusEnum.REJECTED, EnterpriseDocumentationStatusEnum.PENDING, EnterpriseDocumentationStatusEnum.RELOAD_FILE];

        // if (notificationsStatus.includes(enterpriseDocumentation.status))
        //     await SESService.sendTemplatedEmail({
        //         destinationEmail: user.email,
        //         template: ENTERPRISE_DOCUMENTATION_ADMIN_REQUEST,
        //         mergeVariables: {
        //             enterpriseName: enterpriseDocumentation.enterprise.enterpriseName,
        //             documentName: enterpriseDocumentation.documentType.description,
        //             explanation: data.explanation ? data.explanation : "Sin comentarios de rechazo"
        //         }
        //     });

        // if (EnterpriseDocumentationStatusEnum.REJECTED || EnterpriseDocumentationStatusEnum.ACCEPTED || EnterpriseDocumentationStatusEnum.RELOAD_FILE) {
        //     try {
        //         const sqsMetadata = {
        //             sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
        //             body: {
        //                 userId: userId,
        //                 enterpriseId: +enterpriseId,
        //                 eventDate: moment(moment.now(), 'x').toDate(),
        //                 typeEvent: data.statuts == EnterpriseDocumentationStatusEnum.REJECTED ? EnterpriseRecordTypeEventEnum.DOCUMENT_REJECTED :
        //                     data.status == EnterpriseDocumentationStatusEnum.ACCEPTED ? EnterpriseRecordTypeEventEnum.DOCUMENT_APPROVED :
        //                         data.status == EnterpriseDocumentationStatusEnum.RELOAD_FILE ? EnterpriseRecordTypeEventEnum.DOCUMENT_REQUESTED : null,
        //                 comments: data.explanation ? data.explanation.toString() : null,
        //                 entity: enterpriseDocumentation.documentType.code.toString()
        //             }
        //         }
        //         await SQSService.sendMessage(sqsMetadata);
        //     } catch (errors) {
        //         throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        //     }
        // }

        console.log('SERVICE: Ending updateDocumentationStatus');
    }

    static async updateEnterpriseDocumentationByEnterpriseId(enterpriseId: number, userId: number) {
        console.log('SERVICE: Starting sendRequest');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        // console.log('---> ENTERPRISE: ', enterprise);
        
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const enterpriseDocumentations = await EnterpriseDocumentationDAO
            .getEnterpriseDocumentationByEnterpriseIdAndStatus(enterpriseId);
        console.log('---> enterpriseDocumentations : ', enterpriseDocumentations);

        //Enterprise documents stauts updating---
        for (let enterpriseDocumentation of enterpriseDocumentations) {
            enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.EVALUATION_PENDING;
            await EnterpriseDocumentationDAO.save(enterpriseDocumentation);
        }

        //Enterprise status updating---
        enterprise.status = EnterpriseStatusEnum.EVALUATION_PENDING;
        await EnterpriseDAO.saveEnterprise(enterprise);

        const user = await UserDAO.getUserById(userId);
        if (user.id != enterprise.owner.id)
            throw new ConflictException('SCF.LIBERA.35',
                { ownerId: userId, enterpriseId: enterpriseId });

        const notificationType = await NotificationTypeDAO
            .getNotificationType(CatNotificationTypeEnum.NEW_REQUEST);

        const notification = new Notification();
        notification.user = user;
        notification.subject = notificationSubject;
        notification.creationDate = moment(moment.now(), 'x').toDate();
        notification.seen = false;
        notification.notificationType = notificationType;
        await NotificationDAO.save(notification);

        if(user.type === UserTypeEnum.ENTERPRISE_USER) {
            // console.log(`--->> Is ENTERPRISE USER`);
            const evaluationPendingEnterprises = await EnterpriseDocumentationDAO.getEnterpriseDocumentationByStatus(enterpriseId, EnterpriseDocumentationStatusEnum.EVALUATION_PENDING);
            // console.log('=====> EVALUATION PENDING ENTERPRISES: ', evaluationPendingEnterprises);
            
            let documentsNameList = evaluationPendingEnterprises.map((document) => {
                return {
                    nameDocument: (document.documentType.code !== CatDocumentTypeEnum.OTHER_DOCUMENTS) ? document.documentType.description : document.documentTypeDescription
                }
            });

            await SESService.sendTemplatedEmail({
                template: SES_UPDATE_DOCUMENTATION_BY_CLIENT,
                destinationEmail: enterprise.invitationUser.email, 
                mergeVariables: {
                    enterpriseName: enterprise.enterpriseName,
                    clientName: enterprise.enterpriseName,
                    documents: documentsNameList,
                }
            });
        }

        console.log('SERVICE: Ending updateEnterpriseDocumentationByEnterpriseId');
    }

    static async getEnterpriseByOwnerIdAndEnterpriseId(enterpriseId: number, ownerId: number) {
        console.log('SERVICE: Starting getEnterpriseByOwnerId method');
        const role = RoleEnum.LIBERA_ADMIN;
        const userAdminLibera = await UserDAO.getBasicUserRoleById(ownerId, role);
        let enterprise: Enterprise;
        if (userAdminLibera) {
            enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        }
        else {
            enterprise = await EnterpriseDAO
                .getEnterpriseByOwnerIdAndEnterpriseId(enterpriseId, ownerId);
            if (!enterprise) throw new ConflictException("SCF.LIBERA.35", { ownerId, enterpriseId });
        }
        console.log('SERVICE: Ending getEnterpriseByOwnerId method');
        return enterprise;
    }

    static async getEnterpriseById(enterpriseId: number, userId: number, fullData?: boolean) {
        console.log('SERVICE: Starting getEnterpriseById method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        console.log('<== Enterprise ==>', enterprise);
        const owner = enterprise.owner ? enterprise.owner : null;
        const accepted = await EnterpriseDocumentationDAO.getEnterpriseDocumentationCountByEnterpriseId(enterprise.id)
        const total = await EnterpriseDocumentationDAO.getTotalDocumentationCount(enterprise.id);
        const docCount = `${accepted}/${total}`;

        let haveReadEnterpriseDetailPermission = null;
        if(userId){
            const userPermissionsDB = await UserRoleDAO.getRolesPermissionsByUserId(userId);
            haveReadEnterpriseDetailPermission = userPermissionsDB.find(role=> role.role.relRolePermissions.find(permission=> permission.permission.code === PermissionEnum.READ_ENTERPRISE_DETAIL));
        }

        const relEnterpriseTerms = await RelEnterpriseTermsDAO.getByEnterpriseId(enterprise.id);
        const latestTerms = await TermsDAO.getLatestTerms();
        
        const enterpriseResult = {
            id: +enterprise.id,
            enterpriseName: enterprise.enterpriseName,
            documentType: enterprise.enterpriseDocumentType,
            nit: enterprise.nit,
            relationShipManager: enterprise.relationshipManager,
            sales: +enterprise.sale,
            salesCut: enterprise.salesCut,
            productType: enterprise.productType,
            status: enterprise.status,
            modules: enterprise.enterpriseModules.map(enterpriseModule => enterpriseModule.catModule.name),
            owner: {
                id: +owner.id,
                name: owner.userProperties.name ? owner.userProperties.name : null,
                firstSurname: owner.userProperties.firstSurname ? owner.userProperties.firstSurname : null,
                secondSurname: owner.userProperties.secondSurname ? owner.userProperties.secondSurname : null,
                email: owner.email
            },
            acceptedTerms: ( !relEnterpriseTerms || relEnterpriseTerms.terms.id !== latestTerms.id ) ? false : true
        }

        if(haveReadEnterpriseDetailPermission || fullData){
            enterpriseResult['city'] = enterprise.city;
            enterpriseResult['creationDate'] = enterprise.creationDate;
            enterpriseResult['creationUser'] = +enterprise.creationUser.id;
            enterpriseResult['department'] = enterprise.department;
            enterpriseResult['documentationCount'] = docCount;
            enterpriseResult['relationshipManager'] = enterprise.relationshipManager;
            enterpriseResult['vinculationDate'] = enterprise.affiliationAcceptanceDate;
            enterpriseResult['economicActivity'] = enterprise.economicActivity;
            enterpriseResult['phone'] = (owner.userProperties.phoneNumber) ? {
                extension: owner.userProperties.phoneExt ? owner.userProperties.phoneExt : null,
                number: owner.userProperties.phoneNumber ? owner.userProperties.phoneNumber : null,
            } : null;
            enterpriseResult['bankRegion'] = enterprise.bankRegion ? EnterprisesParser.parseCatBankRegion(enterprise.bankRegion) : null;
            enterpriseResult['owner']['documentType'] = owner.userProperties.documentType;
            enterpriseResult['owner']['documentNumber'] = owner.userProperties.documentNumber;
            enterpriseResult['owner']['modules'] = owner.userModules && owner.userModules[0].catModule ? owner.userModules.map(({ catModule }) => catModule.name) : null;
        }

        console.log('SERVICE: Ending getEnterpriseById method');
        return enterpriseResult;

    }

    static async createEnterprise(newEnterprise, userId, economicActivity?: CatEconomicActivity) {
        console.log('SERVICE: Starting createEnterprise...');
        const enterprise = await EnterpriseDAO.getEnterpriseAndOwnerByDocumentTypeAndNumber(
            newEnterprise.nit, newEnterprise.enterpriseDocumentType);
        console.log('enterprise obtained: ', enterprise);
        const creationUser = await UserDAO.getUserById(userId);

        let userRolesCreated;
        let savedUser;
        let moduleEnterprise;
        let userCreated;
        let saveEnterprise;

        //Aceptar solicitud de vinculacion
        if (enterprise && newEnterprise.referenceRequestId) {
            console.log('==> referenceRequestId is not null');

            const user = await UserDAO.getUserByuserId(enterprise.owner.id);
            const userTemp = _.clone(user);

            const userProperties = await UserPropertiesDAO.getUserPropertiesById(userTemp.id);
            moduleEnterprise = await EnterpriseModuleDAO.getModuleByEntepriseId(enterprise.id);
            userRolesCreated = await UserRoleDAO.getRolesByUserId(userTemp.id);

            try {
                userTemp.email = newEnterprise.email;
                userTemp.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
                userTemp.modificationDate = moment(moment.now(), 'x').toDate();
                savedUser = await UserDAO.saveUser(userTemp);

                userProperties.name = newEnterprise && newEnterprise.name ? newEnterprise.name : userProperties.name;
                userProperties.firstSurname = newEnterprise && newEnterprise.firstSurname ? newEnterprise.firstSurname : userProperties.firstSurname;
                userProperties.secondSurname = newEnterprise && newEnterprise.secondSurname ? newEnterprise.secondSurname : userProperties.secondSurname;
                userProperties.modifiedDate = moment(moment.now(), 'x').toDate();
                userProperties.phoneExt = newEnterprise.phoneExt;
                userProperties.phoneNumber = newEnterprise.phoneNumber;
                const updateUserProperties = await UserPropertiesDAO.save(userProperties);

                enterprise.enterpriseName = newEnterprise && newEnterprise.enterpriseName ? newEnterprise.enterpriseName : enterprise.enterpriseName;
                enterprise.status = EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION;
                enterprise.creationUser = creationUser;
                enterprise.referenceRequest = newEnterprise.referenceRequestId;
                enterprise.department = newEnterprise.department;
                enterprise.city = newEnterprise.city;
                enterprise.economicActivity = economicActivity;
                saveEnterprise = await EnterpriseDAO.saveEnterprise(enterprise);

                const catModules = moduleEnterprise.map(modEnterprise => modEnterprise.catModule);
                await EnterpriseDocumentationService.createDocumentation(saveEnterprise, catModules);

                userCreated = {
                    id: +saveEnterprise.id,
                    enterpriseName: saveEnterprise.enterpriseName,
                    status: saveEnterprise.status,
                    modules: moduleEnterprise.map(moduleEnterpriseI => moduleEnterpriseI.catModule.name),
                    nit: saveEnterprise.nit,
                    owner: {
                        id: +savedUser.id,
                        name: updateUserProperties ? LiberaUtils.getFullName(updateUserProperties.name, updateUserProperties.firstSurname, updateUserProperties.secondSurname) : null,
                        email: savedUser.email
                    },
                    creationUser: creationUser && creationUser.userProperties ? LiberaUtils.getFullName(creationUser.userProperties.name, creationUser.userProperties.firstSurname, creationUser.userProperties.secondSurname) : null,
                    creationDate: saveEnterprise.creationDate
                }

                const TemporaryPassword = LiberaUtils.generatePassword();
                const params: any = {
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: savedUser.email,
                    TemporaryPassword,
                    UserAttributes: [
                        {
                            Name: 'email_verified',
                            Value: 'true'
                        },
                        {
                            Name: 'email',
                            Value: savedUser.email
                        },
                        {
                            Name: 'custom:roles',
                            Value: JSON.stringify(userRolesCreated.map(userRolesCreated => userRolesCreated.role.name))
                        },
                        {
                            Name: 'custom:status',
                            Value: savedUser.status.toString()
                        },
                        {
                            Name: 'custom:userType',
                            Value: savedUser.type
                        },
                        {
                            Name: 'custom:modules',
                            Value: JSON.stringify(moduleEnterprise.map(moduleEnterpriseI => moduleEnterpriseI.catModule.name))
                        },
                        {
                            Name: 'custom:enterpriseId',
                            Value: saveEnterprise.id.toString()
                        }
                    ]
                };

                const result = await await CognitoIdentityService.adminCreateUser(params).promise();
                console.log(result);

            }
            catch (errors) {
                console.log('SERVICE ERROR: ', errors);
                await EnterpriseDAO.rollbackCreatedEnterprise(user, userProperties, enterprise);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +saveEnterprise.id,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.CREATION.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                await EnterpriseDAO.rollbackCreatedEnterprise(user, userProperties, enterprise);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }

        if (enterprise && !newEnterprise.referenceRequestId || newEnterprise.referenceRequestId === undefined) {
            console.log('==> referenceRequestId is null or referenceRequestId is undefined');
            const region = await CatalogDAO.getRegionById(+newEnterprise.bankRegion.id);
            if(!region)
            throw new ConflictException('SCF.LIBERA.307');

            if (newEnterprise.comesFromAPI !== true && newEnterprise.comesFromAPI !== false)
                throw new BadRequestException('SCF.LIBERA.302');
            if (enterprise) 
                throw new ConflictException('SCF.LIBERA.300', { enterpriseDocumentType: newEnterprise.enterpriseDocumentType, nit: newEnterprise.nit });
            
            const userByEmail = await UserDAO.getUserByEmail(newEnterprise.email);
            if (userByEmail && userByEmail.status !== UserStatus.DELETED)
			    throw new ConflictException('SCF.LIBERA.04', { email: newEnterprise.email });

            if(!newEnterprise.city || !newEnterprise.department)
                throw new BadRequestException('SCF.LIBERA.304')
            const departmentCity = await EnterpriseLinkService.departmenAndCityValidation(newEnterprise.city, newEnterprise.department);
            console.log('---> department city relation: ', departmentCity);

            try {
                const newUser = new User();
                newUser.email = newEnterprise.email;
                newUser.type = UserTypeEnum.ENTERPRISE_USER;
                newUser.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
                newUser.creationDate = moment(moment.now(), 'x').toDate();
                newUser.modificationDate = moment(moment.now(), 'x').toDate();
                newUser.affiliationAcceptanceDate = null;
                savedUser = await UserDAO.saveUser(newUser);

                const userProperties = new UserProperties();
                userProperties.user = savedUser;
                userProperties.name = newEnterprise ? newEnterprise.name : null;
                userProperties.firstSurname = newEnterprise ? newEnterprise.firstSurname : null;
                userProperties.secondSurname = newEnterprise ? newEnterprise.secondSurname : null;
                userProperties.createdDate = moment(moment.now(), 'x').toDate();
                userProperties.modifiedDate = moment(moment.now(), 'x').toDate();
                userProperties.documentType = newEnterprise.documentType;
                userProperties.documentNumber = newEnterprise.documentNumber;
                userProperties.phoneExt = newEnterprise.phoneExt;
                userProperties.phoneNumber = newEnterprise.phoneNumber;
                await UserPropertiesDAO.save(userProperties);
                console.log('userProperties ======>', userProperties)

                userRolesCreated = [];
                const userModulesCreated = [];

                const modulesRoles: ModuleRoleEnum[] = newEnterprise.modules.map(mod => parseModuleRole(mod));
                modulesRoles.push(ModuleRoleEnum.ADMIN);

                for (const modRole of modulesRoles) {
                    const userRole = new UserRole();
                    const rol = await Role.findOne(modRole);
                    userRole.role = rol;
                    userRole.user = savedUser;
                    const userRoleCreated = await UserRoleDAO.save(userRole);
                    userRolesCreated.push(userRoleCreated);
                }
                console.log('>>>>>>> userRolesCreated', userRolesCreated);

                const catModules: CatModuleEnum[] = newEnterprise.modules.map(mod => parseCatModule(mod));
                catModules.push(CatModuleEnum.ADMIN);

                for (const catMod of catModules) {
                    const userModule = new UserModule();
                    const modul = await CatModuleDAO.getModule(catMod);
                    userModule.user = savedUser;
                    userModule.catModule = modul;
                    const userModuleCreated = await UserModuleDAO.save(userModule);
                    userModulesCreated.push(userModuleCreated);
                }

                const createdEnterprise = new Enterprise();
                createdEnterprise.owner = savedUser;
                createdEnterprise.enterpriseName = newEnterprise.enterpriseName;
                createdEnterprise.nit = newEnterprise.nit;
                createdEnterprise.status = EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION;
                createdEnterprise.creationDate = moment(moment.now(), 'x').toDate();
                createdEnterprise.creationUser = creationUser;
                createdEnterprise.enterpriseDocumentType = newEnterprise.enterpriseDocumentType;
                createdEnterprise.productType = newEnterprise.productType;
                createdEnterprise.department = departmentCity.DPTO;
                createdEnterprise.city = departmentCity.CIUD;
                createdEnterprise.economicActivity = economicActivity;
                createdEnterprise.relationshipManager = newEnterprise.relationshipManager;
                createdEnterprise.sale = newEnterprise.sales ? newEnterprise.sales.toString() : null;
                createdEnterprise.salesCut = newEnterprise.salesPerYear ? newEnterprise.salesPerYear : null;
                createdEnterprise.comesFromAPI = newEnterprise.comesFromAPI;
                createdEnterprise.bankRegion = region;
                saveEnterprise = await EnterpriseDAO.saveEnterprise(createdEnterprise);
                console.log('saveEnterprise ======>', saveEnterprise);

                const enterpriseBranding = new EnterpriseBranding();
                enterpriseBranding.enterprise = saveEnterprise;
                await EnterpriseBrandingDAO.save(enterpriseBranding);

                newEnterprise.modules.push(CatModuleEnum.ADMIN);
                const modules = await CatModuleDAO.getCatModules(newEnterprise.modules);
                if (!modules) throw new BadRequestException('SCF.LIBERA.42');

                moduleEnterprise = await EnterpriseModuleService.setModuleToEnterprise(saveEnterprise, modules);
                await EnterpriseDocumentationService.createDocumentation(saveEnterprise, modules);

                userCreated = {
                    id: +saveEnterprise.id,
                    enterpriseName: saveEnterprise.enterpriseName,
                    status: saveEnterprise.status,
                    modules: catModules,
                    nit: saveEnterprise.nit,
                    owner: {
                        id: +savedUser.id,
                        name: userProperties ? LiberaUtils.getFullName(userProperties.name, userProperties.firstSurname, userProperties.secondSurname) : null,
                        email: savedUser.email
                    },
                    creationUser: creationUser && creationUser.userProperties ? LiberaUtils.getFullName(creationUser.userProperties.name, creationUser.userProperties.firstSurname, creationUser.userProperties.secondSurname) : null,
                    creationDate: saveEnterprise.creationDate,
                    bankRegion: EnterprisesParser.parseCatBankRegion(saveEnterprise.bankRegion)
                }
                
                const TemporaryPassword = LiberaUtils.generatePassword();
                const params: any = {
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    MessageAction: 'SUPPRESS',
                    Username: savedUser.email,
                    TemporaryPassword,
                    UserAttributes: [
                        {
                            Name: 'email_verified',
                            Value: 'true'
                        },
                        {
                            Name: 'email',
                            Value: savedUser.email
                        },
                        {
                            Name: 'custom:roles',
                            Value: JSON.stringify(userRolesCreated.map(userRolesCreated => userRolesCreated.role.name))
                        },
                        {
                            Name: 'custom:status',
                            Value: savedUser.status.toString()
                        },
                        {
                            Name: 'custom:userType',
                            Value: savedUser.type
                        },
                        {
                            Name: 'custom:modules',
                            Value: JSON.stringify(moduleEnterprise.map(moduleEnterpriseI => moduleEnterpriseI.catModule.name))
                        },
                        {
                            Name: 'custom:enterpriseId',
                            Value: saveEnterprise.id.toString()
                        }
                    ]
                };

                const result = await await CognitoIdentityService.adminCreateUser(params).promise();
                console.log(result);
            }
            catch (errors) {
                console.log('SERVICE ERROR: ', errors);
                await EnterpriseDAO.deleteUserAndEnterpriseById(savedUser.id, saveEnterprise.id);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +saveEnterprise.id,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.CREATION.toString(),
                        comments: 'null'
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }
        console.log('SERVICE: Ending createEnterprise...');
        return userCreated;
    }

    static async getUsersByEnterpriseId(enterpriseId: number, filter: FilterEnterprises) {
        console.log('SERVICE: Starting getUsersByEnterpriseId');
        const usersEnterpriseAndTotal = await UserEnterpriseDAO.getByEnterpriseId(enterpriseId, filter);
        console.log('usersEnterpriseAndTotal', usersEnterpriseAndTotal);
        console.log('total', usersEnterpriseAndTotal[1]);

        if (!usersEnterpriseAndTotal) throw new ConflictException('SCF.LIBERA.40');

        const users = usersEnterpriseAndTotal[0].map(({ user }) => (
            {
                id: user.id,
                name: user.userProperties.name,
                firstSurname: user.userProperties.firstSurname,
                secondSurname: user.userProperties.secondSurname,
                email: user.email,
                modules: user.userModules && user.userModules[0].catModule ? user.userModules.map(({ catModule }) => catModule.name) : null,
                vinculationDate: user.affiliationAcceptanceDate,
                status: user.status
            }));
        const total = usersEnterpriseAndTotal[1];

        console.log('SERVICE: Ending getUsersByEnterpriseId');
        return { users, total };
    }

    static async createEnterpriseUser(enterpriseId: number, userId: number, newUser: any) {
        console.log('SERVICE: Starting createEnterpriseUser...');
        const userFound = await UserDAO.getUsersCountByEmail(newUser.email);
        let isUserMemberEnterprise;

        if (userFound > 0)
            throw new ConflictException('SCF.LIBERA.04', { email: newUser.email })

        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if (!enterprise)
            throw new ConflictException('SCF.LIBERA.19');

        const isOwner = enterprise.owner.id == userId;
        if (!isOwner) {
            const isUserAdmin = await UserDAO.getUserRolesAndVinculationEnterpriseByUserId(userId);
            const enterpriseByUserAdmin = isUserAdmin.userEnterprises[0].enterprise.id;
            const roleTrue = isUserAdmin.userRoles ? isUserAdmin.userRoles.filter(userRole => userRole.role.name == 'ENTERPRISE_CONSOLE_ADMIN').length > 0 ? true : false : false;
            isUserMemberEnterprise = roleTrue && (+enterpriseId == enterpriseByUserAdmin) ? true : false;
        } else {
            isUserMemberEnterprise = enterprise.userEnterprises ? enterprise.userEnterprises.filter(userEnterprise => userEnterprise.user.id == userId).length > 0 ? true : false : false;
        }
        if (!isOwner && !isUserMemberEnterprise)
            throw new ConflictException('SCF.LIBERA.35', { ownerId: userId, enterpriseId });

        const user = new User();
        user.email = newUser.email;
        user.type = UserTypeEnum.ENTERPRISE_USER;
        user.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
        user.creationDate = moment(moment.now(), 'x').toDate();
        user.modificationDate = moment(moment.now(), 'x').toDate();
        const createdUser = await UserDAO.saveUser(user);

        const userProperties = new UserProperties();
        userProperties.name = newUser.name;
        userProperties.firstSurname = newUser.firstSurname;
        if (newUser.secondSurname)
            userProperties.secondSurname = newUser.secondSurname;
        userProperties.user = createdUser;
        userProperties.createdDate = moment(moment.now(), 'x').toDate();
        userProperties.modifiedDate = moment(moment.now(), 'x').toDate();
        const createdUserProperties = await UserPropertiesDAO.save(userProperties);

        const userEnterprise = new UserEnterprise();
        userEnterprise.user = createdUser;
        userEnterprise.enterprise = enterprise;
        await UserEnterpriseDAO.save(userEnterprise);

        const { userRolesResult, userModulesResult } = await UserService.generateUserModuleAndUserRole(createdUser, newUser.modules);

        const modulesResult = userModulesResult.map(userModuleResult => userModuleResult.catModule.name);
        const createdUserResult = {
            id: createdUser.id,
            name: createdUserProperties.name,
            firstSurname: createdUserProperties.firstSurname,
            secondSurname: createdUserProperties.secondSurname,
            email: createdUser.email,
            modules: modulesResult,
            vinculationDate: createdUser.affiliationAcceptanceDate ? createdUser.affiliationAcceptanceDate.toISOString() : null,
            status: user.status
        };
        const TemporaryPassword = LiberaUtils.generatePassword();
        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: createdUser.email,
            TemporaryPassword,
            UserAttributes: [
                {
                    Name: 'email_verified',
                    Value: 'true'
                },
                {
                    Name: 'email',
                    Value: createdUser.email
                },
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(userRolesResult.map(userRolesCreated => userRolesCreated.role.name))
                },
                {
                    Name: 'custom:status',
                    Value: createdUser.status.toString()
                },
                {
                    Name: 'custom:userType',
                    Value: createdUser.type
                },
                {
                    Name: 'custom:modules',
                    Value: JSON.stringify(modulesResult)
                },
                {
                    Name: 'custom:enterpriseId',
                    Value: userEnterprise.enterprise.id.toString()
                }
            ]
        };
        try {
            const result = await await CognitoIdentityService.adminCreateUser(params).promise();
            console.log(result);
        } catch (errors) {
            await UserDAO.deleteUserById(createdUser.id);
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending createEnterpriseUser...');
        return createdUserResult;
    }

    static async getModulesByEnterprise(enterpriseId: number) {
        console.log('SERVICE: Starting getModulesByEnterprise method');
        console.log(`enterpriseId >>>> ${enterpriseId}`);

        const enterpriseModules = await EnterpriseModule.getModulesByEntepriseId(enterpriseId);
        console.log('enterpriseModules ==> ', enterpriseModules);
        let response: IEnterpriseModules [] = [];
        enterpriseModules.map(module => response.push({ name: module.catModule.name }));

        console.log('SERVICE: Ending getModulesByEnterprise method');
        return response;
    }

    static async deleteUserById(enterpriseId: number, userId: number) {
        console.log('SERVICE: Starting deleteUserById');
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const userFound = await UserDAO.getBasicUserById(userId);
        if (userFound && userFound.status == UserStatus.DELETED)
            throw new ConflictException('SCF.LIBERA.53', { userId });

        if (!userFound) throw new ConflictException('SCF.LIBERA.55', { userId });

        const status = userFound.status;
        console.log('status ', status);

        const isEnterpriseUser = await UserEnterpriseDAO
            .getByUserAndEnterpriseId(userFound.id, enterprise.id);

        if (!isEnterpriseUser)
            throw new ConflictException('SCF.LIBERA.35', { ownerId: userId, enterpriseId })

        userFound.status = UserStatus.DELETED;
        await UserDAO.saveUser(userFound);
        const params = {
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: userFound.email
        }

        try {
            const cognito = await await CognitoIdentityService.adminDeleteUser(params).promise();
            console.log(cognito);
        }
        catch (errors) {
            console.log(errors);
            userFound.status = status;
            await UserDAO.saveUser(userFound);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }



        console.log('SERVICE: Ending deleteUserById');
    }

    static async updateUserEnterpriseById(enterpriseId: number, userId: number, data: any) {
        console.log('SERVICE: Starting updateUserEnterpriseById');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const user = await UserDAO.getUserById(userId);
        if (!user || (user && user.status == UserStatus.DELETED)) throw new ConflictException('SCF.LIBERA.55', { userId });

        const userEnterprise = await UserEnterpriseDAO.getByEnterpriseIdAndUserId(enterpriseId, userId);
        if (!userEnterprise) throw new ConflictException('SCF.LIBERA.35', { ownerId: userId, enterpriseId });

        const userProperties = await UserPropertiesDAO.getUserPropertiesById(user.id);
        userProperties.name = data.name;
        userProperties.firstSurname = data.firstSurname;
        if (data.secondSurname) userProperties.secondSurname = data.secondSurname;
        userProperties.modifiedDate = moment(moment.now(), 'x').toDate();
        await UserPropertiesDAO.save(userProperties);

        await UserModuleDAO.deleteUserModuleById(user.id);
        await UserRoleDAO.deleteUserRoleById(user.id);

        const userModules = data.modules;
        const newUserModules: UserModule[] = [];
        const newUserRoles: UserRole[] = [];

        for (const mod of userModules) {
            const newUserModule = new UserModule();
            newUserModule.user = user;
            newUserModule.catModule = await CatModuleDAO.getModule(parseCatModule(mod));
            await UserModuleDAO.save(newUserModule);
            newUserModules.push(newUserModule);

            const newUserRole = new UserRole();
            const roleName = parseModuleRole(newUserModule.catModule.name);
            newUserRole.user = user;
            newUserRole.role = await RoleDAO.getRole(parseUserRole(roleName));
            await UserRoleDAO.save(newUserRole);
            newUserRoles.push(newUserRole);
        }

        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: user.email,
            UserAttributes: [
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(newUserRoles.map(userRole => userRole.role.name))
                },
                {
                    Name: 'custom:modules',
                    Value: JSON.stringify(newUserModules.map(userModule => userModule.catModule.name))
                }
            ]
        };

        try {
            await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
        } catch (errors) {
            const userProperties = userEnterprise.user.userProperties;
            const userModules = userEnterprise.user.userModules;
            const userRoles = userEnterprise.user.userRoles;
            await UserDAO.rollbackUserEnterprise(userProperties, userModules, userRoles);
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending updateUserEnterpriseById');
    }

    static async moveLogoOrFaviconFromFolder(enterpriseId: number, data: any) {
        console.log('SERVICE: Starting moveLogoOrFaviconFromFolder...');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const branding = await EnterpriseBrandingDAO.getByEnterpriseId(enterpriseId, data.brandingLogoName, data.brandingFaviconName);
        if (!branding) throw new ConflictException('SCF.LIBERA.67', { enterpriseId });

        const brandingLogoName = data.brandingLogoName ? data.brandingLogoName : null;
        console.log(`brandingLogoName: ${brandingLogoName}`);
        const brandingFaviconName = data.brandingFaviconName ? data.brandingFaviconName : null;
        console.log(`brandingFaviconName: ${brandingFaviconName}`);
        const bucket = S3_BUCKET_NAME;
        console.log(`bucket: ${bucket}`);
        const destinationBucket = S3_DESTINATION_BUCKET;
        console.log(`destinationBucket: ${destinationBucket}`);
        try {

            if (brandingLogoName && !brandingFaviconName) {
                const encodedFileName = S3Utils.cleanS3Filename(brandingLogoName);
                const fromDir = S3_FILE_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(S3Utils.s3UrlEncode(encodedFileName));
                console.log(`fromDir: ${fromDir}`);
                const toDir = S3_DESTINATION_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(encodedFileName);
                console.log(`toDir: ${toDir}`);
                await S3Service.moveFile(bucket, fromDir, toDir, destinationBucket);

                const metadata = {
                    bucket: destinationBucket,
                    filename: brandingLogoName,
                    fileKey: toDir
                };
                console.log(`metadata: ${JSON.stringify(metadata)}`);
                const savedMetadata = await S3MetadataService.createS3Metadata(metadata);
                console.log('savedMetadata', JSON.stringify(savedMetadata));
                branding.brandingLogo = savedMetadata;
                await EnterpriseBrandingDAO.saveBranding(branding);
                const logoUrl = CLOUDFRONT_URL.concat(toDir);
                console.log(`brandingLogoUrl: ${logoUrl}`);
                const url = await S3Service.getObjectUrl({ bucket: destinationBucket, fileKey: toDir });
                return { brandingLogoURL: url };
            }

            if (brandingFaviconName && !brandingLogoName) {
                const encodedFileName = S3Utils.cleanS3Filename(brandingFaviconName);
                const fromDir = S3_FILE_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(S3Utils.s3UrlEncode(encodedFileName));
                console.log(`fromDir: ${fromDir}`);
                const toDir = S3_DESTINATION_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(encodedFileName);
                await S3Service.moveFile(bucket, fromDir, toDir, destinationBucket);

                const metadata = {
                    bucket: destinationBucket,
                    filename: brandingFaviconName,
                    fileKey: toDir
                };
                console.log(`metadata: ${JSON.stringify(metadata)}`);
                const savedMetadata = await S3MetadataService.createS3Metadata(metadata);
                branding.brandingFavicon = savedMetadata;
                await EnterpriseBrandingDAO.saveBranding(branding);
                const faviconUrl = CLOUDFRONT_URL.concat(toDir);
                console.log(`brandingFaviconUrl: ${faviconUrl}`);
                const url = await S3Service.getObjectUrl({ bucket: destinationBucket, fileKey: toDir });
                return { brandingFaviconURL: url };
            }

            if (brandingFaviconName && brandingLogoName) {
                const encodedLogoName = S3Utils.cleanS3Filename(brandingLogoName);
                const encodedFaviconName = S3Utils.cleanS3Filename(brandingFaviconName);
                const fromDirLogo = S3_FILE_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(S3Utils.s3UrlEncode(encodedLogoName));
                console.log(`fromDirLogo: ${fromDirLogo}`);
                const toLogoDir = S3_DESTINATION_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(S3Utils.s3UrlEncode(encodedFaviconName));
                await S3Service.moveFile(bucket, fromDirLogo, toLogoDir, destinationBucket);

                const logoMetadata = {
                    bucket: destinationBucket,
                    filename: brandingLogoName,
                    fileKey: toLogoDir
                };
                console.log(`logoMetadata: ${JSON.stringify(logoMetadata)}`);
                const savedLogoMetadata = await S3MetadataService.createS3Metadata(logoMetadata);

                const fromDirFavicon = S3_FILE_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(brandingFaviconName);
                console.log(`fromDirFavicon: ${fromDirFavicon}`);
                const toFaviconDir = S3_DESTINATION_PATH_PREFIX
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .concat(brandingFaviconName);
                await S3Service.moveFile(bucket, fromDirFavicon, toFaviconDir, destinationBucket);

                const faviconMetadata = {
                    bucket: destinationBucket,
                    filename: brandingFaviconName,
                    fileKey: toFaviconDir
                };
                console.log(`faviconMetadata: ${JSON.stringify(faviconMetadata)}`);
                const savedFaviconMetadata = await S3MetadataService.createS3Metadata(faviconMetadata);

                branding.brandingFavicon = savedFaviconMetadata;
                branding.brandingLogo = savedLogoMetadata;
                await EnterpriseBrandingDAO.saveBranding(branding);
                const logoUrl = CLOUDFRONT_URL.concat(toLogoDir);
                const faviconUrl = CLOUDFRONT_URL.concat(toFaviconDir);
                console.log(`brandingLogoUrl ${logoUrl}
                    brandingFaviconUrl: ${faviconUrl}`);

                const urlLogo = await S3Service.getObjectUrl({ bucket: destinationBucket, fileKey: toLogoDir });
                const urlFavicon = await S3Service.getObjectUrl({ bucket: destinationBucket, fileKey: toFaviconDir })
                return { brandingLogoURL: urlLogo, brandingFaviconURL: urlFavicon };
            }

            console.log('SERVICE: Ending moveLogoOrFaviconFromFolder...');
        }
        catch (errors) {
            console.log('SERVICE ERRORs:', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async createEnterpriseBranding(enterpriseId, body) {
        console.log('SERVICE: Starting createEnterpriseBranding method');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DISABLED || enterprise.status == EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const enterpriseBranding = new EnterpriseBranding();
        enterpriseBranding.enterprise = enterprise;
        enterpriseBranding.primaryColor = body.primaryColor ? body.primaryColor : null;
        enterpriseBranding.accentColor = body.accentColor ? body.accentColor : null;
        await EnterpriseBrandingDAO.save(enterpriseBranding);

        console.log('SERVICE: Ending createEnterpriseBranding method');
    }

    static async getEnterpriseBranding(enterpriseId: number) {
        console.log('SERVICE: Starting getEnterpriseBranding method');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DISABLED || enterprise.status == EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const enterpriseBranding: EnterpriseBranding = await EnterpriseBrandingDAO.getEnterpriseBrandingById(enterpriseId);
        console.log('enterprise branding', enterpriseBranding);
        const urlLogo = await S3Service.getObjectUrl({ bucket: enterpriseBranding.brandingLogo.bucket, fileKey: enterpriseBranding.brandingLogo.fileKey });
        const urlFavicon = await S3Service.getObjectUrl({ bucket: enterpriseBranding.brandingFavicon.bucket, fileKey: enterpriseBranding.brandingFavicon.fileKey });

        const branding = {
            primaryColor: enterpriseBranding.primaryColor,
            accentColor: enterpriseBranding.accentColor,
            brandingLogoURL: enterpriseBranding.brandingLogo ? urlLogo : null,
            brandingFaviconURL: enterpriseBranding.brandingFavicon ? urlFavicon : null
        };

        console.log('SERVICE: Ending getEnterpriseBranding method');
        return branding;
    }

    static async deleteEnterpriseBranding(enterpriseId: number) {
        console.log('SERVICE: StartingdeleteEnterpriseBranding...');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED || enterprise && enterprise.status === EnterpriseStatusEnum.DISABLED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const branding = await EnterpriseBrandingDAO.getEnterpriseBrandingById(enterpriseId);
        if (!branding) throw new ConflictException('SCF.LIBERA.67', { enterpriseId });

        const logo = branding.brandingLogo ? await S3MetadataDAO.getByBranding(branding.brandingLogo.id) : null;
        const favicon = branding.brandingFavicon ? await S3MetadataDAO.getByBranding(branding.brandingFavicon.id) : null;
        try {
            const bucketLogo = branding.brandingLogo ? branding.brandingLogo.bucket : null;
            const fileKeyLogo = branding.brandingLogo ? branding.brandingLogo.fileKey : null;
            const bucketFavicon = branding.brandingFavicon ? branding.brandingFavicon.bucket : null;
            const fileKeyFavicon = branding.brandingFavicon ? branding.brandingFavicon.fileKey : null;

            const paramsLogo = bucketLogo && fileKeyLogo ? { bucket: bucketLogo, filekey: fileKeyLogo } : null;
            const paramsFavicon = bucketFavicon && fileKeyFavicon ? { bucket: bucketFavicon, filekey: fileKeyFavicon } : null;

            branding.brandingLogo = null;
            branding.brandingFavicon = null;
            branding.accentColor = null;
            branding.primaryColor = null;

            await EnterpriseBrandingDAO.save(branding);

            if (paramsLogo) {
                await S3Service.deleteFile(paramsLogo);
                await S3MetadataDAO.delete(logo);
            }
            if (paramsFavicon) {
                await S3Service.deleteFile(paramsFavicon);
                await S3MetadataDAO.delete(favicon);
            }

        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending deleteEnterpriseBranding...');
    }

    static async admResendInvitation(enterpriseId: number) {
        console.log('SERVICE: Starting amdResendInvitation');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DISABLED || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        console.log('todo bien')
        const status = enterprise.status;
        console.log('status guardado')
        console.log('comienzo de condicional')
        if (status !== EnterpriseStatusEnum.PENDING_ACCOUNT_CONFIRMATION) throw new ConflictException('SCF.LIBERA.39', { status });
        console.log('fin de condicional de status')
        const email = enterprise.owner.email;
        const TemporaryPassword = LiberaUtils.generatePassword();
        const params: any = {
            MessageAction: 'RESEND',
            TemporaryPassword,
            Username: email,
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        }
        try {
            await await CognitoIdentityService.adminCreateUser(params).promise();
        }
        catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending adminResendInvitation');
    }

    static async getEnterpriseRequests(filter: FilterEnterpriseRequests) {
        console.log('SERVICE: Starting getEnterpriseRequests...');
        const enterpriseRequests = await EnterpriseRequestDAO.getEnterpriseRequests(filter);
        console.log('enterpriseRequests ', JSON.stringify(enterpriseRequests[0]));
        console.log('enterpriseRequest total ', enterpriseRequests[1]);

        if (filter.request == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION) {
            const requests = enterpriseRequests[0].map(({ enterprise, id, status, requestedModule, creationDate }) => ({
                requestId: +id,
                enterpriseId: +enterprise.id,
                enterpriseName: enterprise.enterpriseName,
                nit: enterprise.nit,
                email: enterprise.owner.email,
                modules: enterprise.enterpriseModules.map((enterpriseModules) => (enterpriseModules.status && enterpriseModules.status == EnterpriseModuleStatusEnum.ENABLED ? enterpriseModules.catModule.name : null)).filter(item => item),
                documentationCount: null,
                requestDate: creationDate,
                moduleRequested: requestedModule,
                status: status,
                owner: {
                    id: +enterprise.owner.id,
                    name: enterprise.owner.userProperties ? enterprise.owner.userProperties.name : null,
                    firstSurname: enterprise.owner.userProperties ? enterprise.owner.userProperties.firstSurname : null,
                    secondSurname: enterprise.owner.userProperties ? enterprise.owner.userProperties.secondSurname : null,
                    email: enterprise.owner.email
                }
            }));
            console.log('requests', requests);
            const doc = await this.requestDocumentationCount(requests);
            console.log('doc', doc);
            const total = enterpriseRequests[1];
            console.log('SERVICE: Ending getEnterpriseRequests...');
            return { doc, total }
        }

        if (filter.request == EnterpriseRequestTypeEnum.ENTERPRISE_LINKING) {
            const requests = enterpriseRequests[0].map(({ enterprise, id, status, creationDate, enterpriseLink }) => ({
                requestId: +id,
                status: status,
                vinculationType: enterpriseLink.linkType,
                requestDate: creationDate,
                enterpriseRequested: {
                    id: enterpriseLink.enterpriseLink ? +enterpriseLink.enterpriseLink.id : null,
                    enterpriseName: enterpriseLink.enterpriseLink ? enterpriseLink.enterpriseLink.enterpriseName : null,
                    nit: enterpriseLink.enterpriseLink ? enterpriseLink.enterpriseLink.nit : null,
                    email: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.owner ? enterpriseLink.enterpriseLink.owner.email : null,
                    status: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.status ? enterpriseLink.enterpriseLink.status : null,
                    owner: {
                        id: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.owner ? +enterpriseLink.enterpriseLink.owner.id : null,
                        name: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.owner && enterpriseLink.enterpriseLink.owner.userProperties ? enterpriseLink.enterpriseLink.owner.userProperties.name : null,
                        firstSurname: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.owner && enterpriseLink.enterpriseLink.owner.userProperties ? enterpriseLink.enterpriseLink.owner.userProperties.firstSurname : null,
                        secondSurname: enterpriseLink.enterpriseLink && enterpriseLink.enterpriseLink.owner && enterpriseLink.enterpriseLink.owner.userProperties ? enterpriseLink.enterpriseLink.owner.userProperties.secondSurname : null
                    }
                },
                enterpriseRequester: {
                    id: +enterprise.id,
                    enterpriseName: enterprise.enterpriseName,
                    nit: enterprise.nit,
                    email: enterprise.owner.email,
                    owner: {
                        id: +enterprise.owner.id,
                        name: enterprise.owner.userProperties ? enterprise.owner.userProperties.name : null,
                        firstSurname: enterprise.owner.userProperties ? enterprise.owner.userProperties.firstSurname : null,
                        secondSurname: enterprise.owner.userProperties ? enterprise.owner.userProperties.secondSurname : null
                    }
                }
            }));
            console.log('requests', requests);
            const total = enterpriseRequests[1];
            console.log('SERVICE: Ending getEnterpriseRequests...');
            return { requests, total };
        }
    }

    static async requestDocumentationCount(requests: Array<any>) {
        console.log('SERVICE: Starting requestDocumentationCount');
        for (const request of requests) {
            const accepted = await EnterpriseDocumentationDAO
                .getEnterpriseDocumentationCountByEnterpriseId(request.enterpriseId);
            const total = await EnterpriseDocumentationDAO
                .getTotalDocumentationCount(request.enterpriseId);

            const documentationCount = `${accepted}/${total}`;
            request.documentationCount = documentationCount;
        }
        console.log('req ', requests);
        console.log('SERVICE: Ending requestDocumentationCount');
        return requests;
    }

    static async getEnterpriseProviders(filter: FilterEnterprises, enterpriseId: number) {
        console.log('SERVICE: Starting getEnterpriseProviders...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED || enterprise.status === EnterpriseStatusEnum.DISABLED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const providers = await EnterpriseLinkDAO.getProviders(filter, enterpriseId);

        const providersResponse = providers[0].map(({ id, enterpriseLink, status }) => ({
            id: +id,
            enterpriseName: enterpriseLink && enterpriseLink.enterpriseName ? enterpriseLink.enterpriseName : null,
            nit: enterpriseLink && enterpriseLink.nit ? enterpriseLink.nit : null,
            providerDocumentType: enterpriseLink && enterpriseLink.enterpriseDocumentType ? enterpriseLink.enterpriseDocumentType : null,
            providerId: enterpriseLink && enterpriseLink.id ? +enterpriseLink.id : null,
            vinculationDate: enterpriseLink && enterpriseLink.affiliationAcceptanceDate ? enterpriseLink.affiliationAcceptanceDate : null,
            phone: enterpriseLink.owner.userProperties.phoneNumber ? {
                extension: enterpriseLink.owner.userProperties.phoneExt ? enterpriseLink.owner.userProperties.phoneExt : null,
                number: enterpriseLink.owner.userProperties.phoneNumber ? enterpriseLink.owner.userProperties.phoneNumber : null,
            } : null,
            owner: {
                id: +enterpriseLink && enterpriseLink.owner ? enterpriseLink.owner.id : null,
                name: enterpriseLink && enterpriseLink.owner.userProperties.name ? enterpriseLink.owner.userProperties.name : null,
                firstSurname: enterpriseLink && enterpriseLink.owner.userProperties.firstSurname ? enterpriseLink.owner.userProperties.firstSurname : null,
                secondSurname: enterpriseLink && enterpriseLink.owner.userProperties.secondSurname ? enterpriseLink.owner.userProperties.secondSurname : null,
                email: enterpriseLink && enterpriseLink.owner.email
            },
            status: enterpriseLink && enterpriseLink.status,
            modules: enterpriseLink && enterpriseLink.enterpriseModules.map((enterpriseModules) => (enterpriseModules.catModule ? enterpriseModules.catModule.name : null)).filter(item => item),
            linkStatus: status
        }));

        const total = providers[1];
        console.log('SERVICE: Ending getEnterpriseProviders...');
        return { providersResponse, total };
    }

    static async getEnterpriseRequestDetail(requestId: number) {
        console.log('SERVICE: Starting getEnterpriseRequestDetail...');
        let url = null
        const request = await EnterpriseRequestDAO.getBasicEnterpriseRequest(requestId);
        if (!request) throw new ConflictException('SCF.LIBERA.82', { requestId });
        const { enterprise } = request;
        const enterpriseLink: Enterprise = request.enterpriseLink ? request.enterpriseLink.enterpriseLink : null;
        const { owner } = enterprise;
        let enterpriseDisbursement = null;
        console.log('======>request', request);
        
        if(request.enterpriseLink){
            enterpriseDisbursement = await EnterpriseRequestDAO.getEnterpriseDisbursementContract(request.enterpriseLink.id);
            
            console.log('enterpriseDisbursement =>', enterpriseDisbursement);

            if (enterpriseDisbursement && enterpriseDisbursement.bankCertificationFile) {
                let toDir = enterpriseDisbursement.bankCertificationFile.fileKey;
                url = await S3Service.getObjectUrl({bucket,fileKey:toDir});
            };
        }

        console.log('enterpriseLink =====>', enterpriseLink);

        const requestDetails = {
            requestId: +request.id,
            status: request.status ? request.status : null,
            requestDate: request.creationDate ? moment(request.creationDate).format('YYYY-MM-DD') : null,
            vinculationType: request.enterpriseLink ? request.enterpriseLink.linkType : null,
            enterpriseRequested: enterpriseLink ? {
                id: +enterpriseLink.id,
                providerDocumentType: enterpriseLink.enterpriseDocumentType,
                nit: enterpriseLink.nit ? enterpriseLink.nit : null,
                enterpriseName: enterpriseLink.enterpriseName ? enterpriseLink.enterpriseName : null,
                department: enterpriseLink.department,
                city: enterpriseLink.city,
                productType: enterpriseLink.productType,
                comesFromAPI: enterpriseLink.comesFromAPI,
                status: enterpriseLink.status ? enterpriseLink.status : null,
                economicActivity: enterpriseLink.economicActivity ? EnterprisesParser.parseEconomicActivity(enterpriseLink.economicActivity): null,
                disbursementContract: enterpriseDisbursement ? {
                    type: enterpriseDisbursement.type ? enterpriseDisbursement.type : null,
                    account: enterpriseDisbursement.type == DisbursementContractTypeEnum.ACCOUNT_DEPOSIT ? {
                        type: enterpriseDisbursement?.accountType ? enterpriseDisbursement.accountType : null, 
                        number: enterpriseDisbursement?.accountNumber ? enterpriseDisbursement.accountNumber : null,
                        bank: {
                            "code": enterpriseDisbursement?.bank.code ? enterpriseDisbursement.bank.code : null,
                            "name": enterpriseDisbursement?.bank.businessName ? enterpriseDisbursement?.bank.businessName : null
                        }
                    } : null,
                    bankCertificationFile: url != null ? {
                        "id": enterpriseDisbursement.bankCertificationFile.id,
                        "name": enterpriseDisbursement.bankCertificationFile.filename,
                        "url": url
                    } : null
                } : null,
                email: enterpriseLink.owner.email ? enterpriseLink.owner.email : null,
                phoneExt: enterpriseLink.owner.userProperties.phoneExt,
                phoneNumber: enterpriseLink.owner.userProperties.phoneNumber,
                owner: enterpriseLink.owner && enterpriseLink.owner.id ? {
                    id: +enterpriseLink.owner.id,
                    name: enterpriseLink.owner.userProperties.name,
                    firstSurname: enterpriseLink.owner.userProperties.firstSurname,
                    secondSurname: enterpriseLink.owner.userProperties.secondSurname ? enterpriseLink.owner.userProperties.secondSurname : null
                } : null
            } : null,
            enterpriseRequester: enterprise ? {
                id: +enterprise.id,
                enterpriseName: enterprise.enterpriseName ? enterprise.enterpriseName : null,
                nit: enterprise.nit ? enterprise.nit : null,
                email: enterprise.owner.email ? enterprise.owner.email : null,
                owner: owner ? {
                    id: +owner.id,
                    name: owner.userProperties.name,
                    firstSurname: owner.userProperties.firstSurname,
                    secondSurname: owner.userProperties.secondSurname
                } : null
            } : null
        }

        console.log('SERVICE: Ending getEnterpriseProviders...');
        return requestDetails;
    }

    static async updateEnterpriseById(enterpriseId: number, data: any, userId: number) {
        console.log('SERVICE: Starting updateEnterpriseById');
        const { enterpriseName, phone, owner, department, city } = data;
        const enterprise = await EnterpriseDAO.getEnterpriseByIdToUpdate(enterpriseId);

        if (data.bankRegion) {
            const region: CatBankRegion = await CatalogDAO.getRegionById(+data.bankRegion.id);
            if(!region)
                throw new ConflictException('SCF.LIBERA.307');
            console.log('---> region: ', region);
            
            if(region.id !== data.bankRegion.id) {
                enterprise.bankRegion = region;
            }
        }

        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        if(city && department) {
            var departmentCity = await EnterpriseLinkService.departmenAndCityValidation(city, department);
            enterprise.city = departmentCity.CIUD;
            console.log('city', city);

            enterprise.department = departmentCity.DPTO;
            console.log('department', department);
        }

        const userProps = await UserPropertiesDAO.getUserPropertiesById(enterprise.owner.id);
        const enterpriseTemp = _.clone(enterprise);
        const userPropsTemp = _.clone(userProps);
        console.log('enterprise', enterprise);

        if (enterpriseName) {
            enterprise.enterpriseName = enterpriseName;
            console.log('enterpriseName', enterpriseName);
        }

        if (owner || phone) {
            console.log('userProps', userProps);
            userProps.name = owner.name ? owner.name : userProps.name;
            userProps.firstSurname = owner.firstSurname ? owner.firstSurname : userProps.firstSurname;
            userProps.secondSurname = owner.secondSurname ? owner.secondSurname : null;
            userProps.modifiedDate = moment(moment.now(), 'x').toDate();
            userProps.phoneExt = phone.extension ? phone.extension : null;
            userProps.phoneNumber = phone.number ? phone.number : userProps.phoneNumber;
            await userProps.save();
            const user = await UserDAO.getBasicUserByIdToUpdate(enterprise.owner.id);
            console.log('user-saved');

            const params: any = {
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: user.email,
                UserAttributes: [
                    {
                        Name: 'custom:business_name',
                        Value: user.ownerEnterprise.enterpriseName
                    },
                    {
                        Name: 'custom:userType',
                        Value: user.type.toString()
                    }
                ]
            };
            try {
                await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
            } catch (errors) {
                console.log('SERVICE ERRORS: ', errors);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors })
            }
        }



        if (enterpriseName !== enterpriseTemp.enterpriseName) {
            console.log('enterprisename');
            await EnterpriseService.delay(100);
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +enterpriseId,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.PROFILE_UPDATED.toString(),
                        entity: EntitytoRecordEnum.ENTERPRISE_NAME.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }
        if (+phone.number !== +userPropsTemp.phoneNumber) {
            console.log('phone');
            await EnterpriseService.delay(100);
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +enterpriseId,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.PROFILE_UPDATED.toString(),
                        entity: EntitytoRecordEnum.PHONE.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }
        if (owner.name !== userPropsTemp.name) {
            console.log('nombre');
            await EnterpriseService.delay(100);
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +enterpriseId,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.PROFILE_UPDATED.toString(),
                        entity: EntitytoRecordEnum.OWNER_NAME.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }
        if (owner.firstSurname !== userPropsTemp.firstSurname) {
            console.log('primer apellido');
            await EnterpriseService.delay(100);
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +enterpriseId,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.PROFILE_UPDATED.toString(),
                        entity: EntitytoRecordEnum.OWNER_FIRST_SURNAME.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }
        if (owner.secondSurname !== userPropsTemp.secondSurname) {
            console.log('segundo apellido');
            await EnterpriseService.delay(100);
            try {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body: {
                        userId: userId,
                        enterpriseId: +enterpriseId,
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.PROFILE_UPDATED.toString(),
                        entity: EntitytoRecordEnum.OWNER_SECOND_SURNAME.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }
        }

        console.log('SERVICE: Ending updateEnterpriseById');
        await EnterpriseDAO.saveEnterprise(enterprise);
    }

    static async getEnterpriseByNIT(q) {
        console.log('SERVICE: Starting getEnterpriseByNIT method...');
        const enterprise = await EnterpriseDAO.getEnterpriseByNIT(q);
        if (!enterprise) throw new ConflictException('SCF.LIBERA.91', { nit: q });
        if (enterprise && enterprise.status == EnterpriseStatusEnum.DISABLED) throw new ConflictException('SCF.LIBERA.92', { nit: q });
        const owner = enterprise.owner ? enterprise.owner : null;

        const enterpriseResult = {
            id: +enterprise.id,
            enterpriseName: enterprise.enterpriseName,
            status: enterprise.status,
            sector: {
                id: enterprise.sector ? +enterprise.sector.id : null,
                name: enterprise.sector ? enterprise.sector.name : null,
            },
            enterpriseType: enterprise.type,
            phone: {
                countryCode: enterprise.lada ? {
                    id: +enterprise.lada.id,
                    code: enterprise.lada.lada,
                    country: enterprise.lada.country
                } : null,
                number: enterprise.phoneNumber ? enterprise.phoneNumber : null
            },
            modules: enterprise.enterpriseModules.map(enterpriseModule => enterpriseModule.catModule.name),
            nit: enterprise.nit,
            owner: {
                id: +owner.id,
                name: owner.userProperties.name ? owner.userProperties.name : null,
                firstSurname: owner.userProperties.firstSurname ? owner.userProperties.firstSurname : null,
                secondSurname: owner.userProperties.secondSurname ? owner.userProperties.secondSurname : null,
                email: owner.email,
                documentType: owner.userProperties.documentType,
                documentNumber: owner.userProperties.documentNumber,
                modules: owner.userModules && owner.userModules[0].catModule ? owner.userModules.map(({ catModule }) => catModule.name) : null,
            },
            creationUser: +enterprise.creationUser.id,
            creationDate: enterprise.creationDate,
            vinculationDate: enterprise.affiliationAcceptanceDate,
            economicActivity: EnterprisesParser.parseEconomicActivity(enterprise.economicActivity),
            documentType: enterprise.enterpriseDocumentType,
            productType: enterprise.productType,
            department: enterprise.department,
            city: enterprise.city,
            relationshipManager: enterprise.relationshipManager
        }
        console.log('SERVICE: Ending getEnterpriseByNIT method...');
        return enterpriseResult;
    }

    static async createEnterpriseRequestBulk(enterpriseId: number, enterpriseRequestBulkId: number, requests: IRequest[]) {
        console.log('SERVICE: Starting createEnterpriseRequestBulk');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const providers = await EnterpriseLinkDAO.getProvidersByEnterpriseId(enterpriseId);

        const enterpriseBulk = await EnterpriseRequestBulkDAO.getByBulkId(enterpriseRequestBulkId);

        if (!enterpriseBulk)
            throw new ConflictException('SCF.LIBERA.99', { enterpriseRequestBulkId });

        for (let prov of providers) {
            _.remove(requests, req => req.nit === prov.enterpriseLink.nit || !req.enterpriseName || !req.owner.email || !req.nit);
        }
        enterpriseBulk.totalCount = requests.length;
        await enterpriseBulk.save();
        console.log('AFTER: ', requests);
        console.log('PROVIDERS: ', providers);
        const sqsResponse = requests.map(({ enterpriseName, nit, owner, phone, comments }) => ({
            enterpriseRequestBulkId: enterpriseBulk.id,
            request: {
                enterpriseName,
                nit,
                owner: {
                    name: owner && owner.name ? owner.name : null,
                    firstSurname: owner && owner.firstSurname ? owner.firstSurname : null,
                    secondSurname: owner && owner.secondSurname ? owner.secondSurname : null,
                    email: owner && owner.email ? owner.email : null
                },
                phone: {
                    number: phone && phone.number ? phone.number : null
                },
                comments
            }
        }));
        console.log(sqsResponse);
        try {
            const sqsMetada = {
                sqsUrl: SQS_LIBERA_ENTERPRISE_BULK_QUEUE,
                body: sqsResponse
            }
            await SQSService.sendMessage(sqsMetada);
        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending createEnterpriseRequestBulk');
        return {
            id: enterpriseBulk.id,
            filename: enterpriseBulk.s3Metadata.filename,
            folio: enterpriseBulk.folioNumber,
            status: enterpriseBulk.status,
            creationDate: enterpriseBulk.creationDate,
            totalRequests: enterpriseBulk.totalCount,
            completedRequests: 0
        }
    }

    static async getEnterpriseProvidersBulk(enterpriseId: number, filter: SimpleFilter) {
        console.log('SERVICE: Starting getEnterpriseProvidersBulk');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise && enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new BadRequestException('SCF.LIBERA.19', { enterpriseId });

        const bulk = await EnterpriseRequestBulkDAO.getBulksByEnterpriseId(enterpriseId, filter);

        const response = bulk[0].map(({ id, folioNumber, status, creationDate, enterpriseRequest, totalCount, s3Metadata }) => ({
            id,
            filename: s3Metadata.filename,
            folio: folioNumber,
            status,
            creationDate,
            totalRequests: totalCount,
            completedRequests: enterpriseRequest.length
        }));

        const total = bulk[1]
        console.log('SERVICE: Ending getEnterpriseProvidersBulk');
        return { response, total };
    }

    static async moveBulkFileToS3(enterpriseId: number, filename: string, contentType?: string) {
        console.log('SERVICE: Starting moveBulkFileToS3 method');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise && enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new BadRequestException('SCF.LIBERA.19', { enterpriseId });

        const bucket = S3_BUCKET_NAME;
        console.log(`bucket: ${bucket}`);
        const destinationBucket = S3_BUCKET_NAME;
        console.log(`destinationBucket: ${destinationBucket}`);

        const fromDir: string = S3_FILE_PATH_PREFIX
            .replace('{enterpriseId}', enterpriseId.toString())
            .concat(S3Utils.cleanS3Filename(filename));
        console.log(`fromDir: ${fromDir}`);
        const toDir: string = S3_ENTERPRISE_REQUEST_FILES_PATH_PREFIX
            .replace('{enterpriseId}', enterpriseId.toString())
            .concat(S3Utils.cleanS3Filename(filename));
        console.log(`toDir: ${toDir}`);

        const s3MetadataDoc = new S3Metadata();
        const enterpriseRequestBulk = new EnterpriseRequestBulk();

        try {

            s3MetadataDoc.creationDate = moment(moment.now(), 'x').toDate();
            s3MetadataDoc.bucket = bucket;
            s3MetadataDoc.filename = filename;
            s3MetadataDoc.fileKey = toDir;
            await s3MetadataDoc.save();
            const enterprise: Enterprise = new Enterprise;
            enterprise.id = enterpriseId;

            const date = moment(moment.now(), 'x');
            enterpriseRequestBulk.creationDate = date.toDate();
            console.log('antes del primer id')
            enterpriseRequestBulk.s3Metadata = s3MetadataDoc;
            console.log('imprimiendo id  ', s3MetadataDoc.id);
            enterpriseRequestBulk.status = EnterpriseRequestBulkStatus.PENDING_COMPLETION;
            enterpriseRequestBulk.enterprise = enterprise;
            enterpriseRequestBulk.totalCount = 0;
            enterpriseRequestBulk.folioNumber = uuid();


            await enterpriseRequestBulk.save();
        } catch (errors) {
            console.log('SERVICE ERRORS:', errors);
            await EnterpriseRequestBulkDAO.rollbackmoveBulkFileToS3(s3MetadataDoc.id, enterpriseRequestBulk.id);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        try {
            await S3Service.moveFile(bucket, fromDir, toDir, destinationBucket);
        } catch (errors) {
            console.log('SERVICE ERRORS:', errors);
            await EnterpriseRequestBulkDAO.rollbackmoveBulkFileToS3(s3MetadataDoc.id, enterpriseRequestBulk.id);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        try {
            const result = {
                metadataId: +s3MetadataDoc.id,
                enterpriseRequestBulkId: +enterpriseRequestBulk.id,
                url: await S3Service.getObjectUrl({ bucket: s3MetadataDoc.bucket, fileKey: s3MetadataDoc.fileKey })
            }
            console.log('SERVICE: Ending moveBulkFileToS3 method');
            return result;
        } catch (errors) {
            console.log('SERVICE ERRORS:', errors);
            await EnterpriseRequestBulkDAO.rollbackmoveBulkFileToS3(s3MetadataDoc.id, enterpriseRequestBulk.id);
            const metadata: any = {
                bucket: bucket,
                fileKey: toDir
            };
            await S3Service.deleteFile(metadata);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async createLinkRequest(enterpriseId: number, userId: number, linkRequest: ICreateNewLinkRequest) {
        console.log('SERVICE: Starting createEnterpriseProvider method ...');
        const user = await UserDAO.getBasicUserById(userId);
        const providers = await EnterpriseLinkDAO.getProvidersByEnterpriseId(enterpriseId);
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        if (enterprise && enterprise.status != EnterpriseStatusEnum.ENABLED)
            throw new BadRequestException('SCF.LIBERA.179', { enterpriseId: enterprise.id });

        const status: EnterpriseStatusEnum[] = [EnterpriseStatusEnum.ENABLED, EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION];
        const enterpriseByNit = await EnterpriseDAO.getEnterpriseByNitWithStatuses(linkRequest.nit, status);
        console.log('Imprimiento enterprise by nit', enterpriseByNit);

        if (providers && enterpriseByNit) {
            const enterpriseLinkExist = (providers.find(providers => providers.enterpriseLink.id === enterpriseByNit.id));
            if (enterpriseLinkExist) throw new ConflictException('SCF.LIBERA.95', { nit: linkRequest.nit });
        }

        let eOwner: User;
        let nEnterprise: Enterprise;
        let link: EnterpriseLinks;
        let request: EnterpriseRequest;
        let eDisbursementContract: EnterpriseLinksDisbursementContract;
        let eOwnerProps: UserProperties;
        let eModules: EnterpriseModule[] = [];
        let uModules: UserModule[] = [];
        let uRoles: UserRole[] = [];
        let phone: IPhone = linkRequest.phone;
        let owner: IOwner = linkRequest.owner;

        if (!enterpriseByNit) {
            console.log('Case: null');

            let ciiuCode = null;
            if(linkRequest.economicActivity){
                if(linkRequest.economicActivity.ciiuCode === null) throw new BadRequestException('SCF.LIBERA.301');
                ciiuCode = await EconomicActivitiesDAO.getActivityByCiiu(linkRequest.economicActivity.ciiuCode);
                if(!ciiuCode) throw new BadRequestException('SCF.LIBERA.301');            
            }

            eOwner = new User();
            eOwner.status = UserStatus.PENDING_ACCOUNT_CREATION;
            eOwner.type = UserTypeEnum.ENTERPRISE_USER;
            eOwner.email = linkRequest.owner.email;
            eOwner.creationDate = moment(moment.now(), 'x').toDate();
            eOwner.modificationDate = moment(moment.now(), 'x').toDate();

            console.log('creating user...');

            nEnterprise = new Enterprise();
            nEnterprise.enterpriseName = linkRequest.enterpriseName;
            
            nEnterprise.creationDate = moment(moment.now(), 'x').toDate();
            nEnterprise.nit = linkRequest.nit;
            nEnterprise.status = EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION;
            nEnterprise.enterpriseDocumentType = linkRequest.providerDocumentType;
            nEnterprise.productType = linkRequest.productType;
            nEnterprise.department = linkRequest.department;
            nEnterprise.city = linkRequest.city;
            nEnterprise.economicActivity = ciiuCode;            
            nEnterprise.comesFromAPI = linkRequest.comesFromAPI ? linkRequest.comesFromAPI : false; 
            nEnterprise.owner = eOwner;
            nEnterprise.creationUser = user;
            console.log('creating enterprise');

            eOwnerProps = new UserProperties();
            eOwnerProps.user = eOwner;
            eOwnerProps.name = owner.name ? owner.name : null;
            eOwnerProps.firstSurname = owner.firstSurname ? owner.firstSurname : null;
            eOwnerProps.secondSurname = owner.secondSurname ? owner.secondSurname : null;
            eOwnerProps.createdDate = moment(moment.now(), 'x').toDate();
            eOwnerProps.phoneNumber = phone && phone.number ? phone.number : null;
            eOwnerProps.phoneExt = phone && phone.extension ? phone.extension : null;
            console.log('creating userProps');

            const eModuleAdmin = new EnterpriseModule();
            eModuleAdmin.enterprise = nEnterprise;
            eModuleAdmin.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            eModuleAdmin.catModule = await CatModuleDAO.getModule(CatModuleEnum.ADMIN);
            eModules.push(eModuleAdmin);
            const eModuleProvider = new EnterpriseModule();
            eModuleProvider.enterprise = nEnterprise;
            eModuleProvider.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            eModuleProvider.catModule = await CatModuleDAO.getModule(CatModuleEnum.PROVIDER);
            eModules.push(eModuleProvider);
            console.log('creating eModules');
            const uModuleAdmin = new UserModule();
            uModuleAdmin.user = eOwner;
            uModuleAdmin.catModule = await CatModuleDAO.getModule(CatModuleEnum.ADMIN);
            uModules.push(uModuleAdmin);
            const uModuleProvider = new UserModule();
            uModuleProvider.user = eOwner;
            uModuleProvider.catModule = await CatModuleDAO.getModule(CatModuleEnum.PROVIDER);
            uModules.push(uModuleProvider);
            console.log('creating uModules');
            const uRoleAdmin = new UserRole();
            uRoleAdmin.user = eOwner;
            uRoleAdmin.role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_CONSOLE_ADMIN);
            uRoles.push(uRoleAdmin);
            const uRoleProvider = new UserRole();
            uRoleProvider.user = eOwner;
            uRoleProvider.role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PROVIDER_ADMIN);
            uRoles.push(uRoleProvider);
            console.log('creating uRoles');
            eOwner.ownerEnterprise = nEnterprise;

            console.log('new Owner -->>', eOwner);
            await UserDAO.saveUser(eOwner);
            console.log('new Enterprise -->> ', nEnterprise);
            await EnterpriseDAO.saveEnterprise(nEnterprise);
            console.log('new User Properties -->> ', eOwnerProps);
            await UserPropertiesDAO.save(eOwnerProps);

            for (let eModule of eModules) {
                await EnterpriseModuleDAO.saveEnterpriseModule(eModule);
            }
            for (let uModule of uModules) {
                await UserModuleDAO.save(uModule);
            }
            for (let uRole of uRoles) {
                await UserRoleDAO.save(uRole);
            }

            link = new EnterpriseLinks();
            console.log('enterpriselink');
            link.enterprise = enterprise;
            link.enterpriseLink = nEnterprise;
            link.status = EnterpriseLinkStatus.PENDING_LINK_CREATION;
            link.linkType = EnterpriseLinkTypeEnum.PROVIDER;
            link.linkDate = moment(moment.now(), 'x').toDate();
            await link.save();
        }
        else {
            console.log('Case: enterprise found');
            link = new EnterpriseLinks();
            console.log('enterpriselink');
            link.enterprise = enterprise;
            link.enterpriseLink = enterpriseByNit;
            link.status = EnterpriseLinkStatus.PENDING_LINK_CREATION;
            link.linkType = EnterpriseLinkTypeEnum.PROVIDER;
            link.linkDate = moment(moment.now(), 'x').toDate();
            await link.save();

            eOwnerProps = new UserProperties();
            eOwnerProps.user = enterpriseByNit.owner;
            eOwnerProps.name = owner.name ? owner.name : null;
            eOwnerProps.firstSurname = owner.firstSurname ? owner.firstSurname : null;
            eOwnerProps.secondSurname = owner.secondSurname ? owner.secondSurname : null;
            eOwnerProps.phoneNumber = phone && phone.number ? phone.number : null;
            eOwnerProps.phoneExt = phone && phone.extension ? phone.extension : null;
            console.log('updating userProps ==> ', eOwnerProps);
            await UserPropertiesDAO.save(eOwnerProps);
        }

        request = new EnterpriseRequest();
        console.log('enterpriseRequest');
        request.enterprise = enterprise;
        request.enterpriseLink = link;
        request.requestType = EnterpriseRequestTypeEnum.ENTERPRISE_LINKING;
        request.creationUser = enterprise.creationUser;
        request.requestedModule = CatModuleEnum.PROVIDER;
        request.status = EnterpriseRequestStatus.EVALUATION_PENDING;
        request.creationDate = moment(moment.now(), 'x').toDate();
        await request.save();

        if(!linkRequest.disbursementContract || !linkRequest.disbursementContract.type) {
            throw new BadRequestException('SCF.LIBERA.282');
        }

        let disbursementContractType = parseDisbursementContractType(linkRequest.disbursementContract.type);

        if(disbursementContractType == null){
            throw new BadRequestException('SCF.LIBERA.283', { disbursementContractType });
        }

        eDisbursementContract = new EnterpriseLinksDisbursementContract();
        eDisbursementContract.type = disbursementContractType;
        eDisbursementContract.enterpriseLink = link;

        if(eDisbursementContract.type == DisbursementContractTypeEnum.ACCOUNT_DEPOSIT){
            if(!linkRequest.disbursementContract.account){
                throw new BadRequestException('SCF.LIBERA.284', { disbursementContractType });
            }

            let account: IAccount = linkRequest.disbursementContract.account;
            let accountType = parseDisbursementContractAccountType(account.type);
            let bank: Banks = await CatalogDAO.getBankByCode(account.bank.code);

            if(accountType == null) {
                throw new BadRequestException('SCF.LIBERA.285', { accountType });
            }

            if (bank == null){
                throw new ConflictException('SCF.LIBERA.286', { code: account.bank.code });
            }
            
            eDisbursementContract.accountType = accountType;
            eDisbursementContract.accountNumber = account.number;
            eDisbursementContract.bank = bank;

            /* Moving file to right directory and saving relation in DB */

            if (linkRequest.disbursementContract.bankCertificationFilename){
                let encodedFile:string = S3Utils.cleanS3Filename(
                    linkRequest.disbursementContract.bankCertificationFilename);

                let fromDir:string = temporalDocumentationPathPrefix
                    .replace('{enterpriseId}',enterpriseId.toString())
                    .concat(S3Utils.s3UrlEncode(encodedFile));

                let toDir:string = providerDisbursementContractPathPrefix
                    .replace('{enterpriseId}', enterpriseId.toString())
                    .replace('{linkId}', link.id.toString())
                    .concat(encodedFile);

                console.log(`fromDir: ${ fromDir }`);
                console.log(`toDir: ${ toDir }`);
                console.log(`bucket: ${ bucket }`);

                await S3Service.moveFile(bucket,fromDir,toDir);

                const file: S3Metadata = await S3MetadataService.createS3Metadata({
                    bucket, filename: linkRequest.disbursementContract.bankCertificationFilename, fileKey:toDir
                });

                eDisbursementContract.bankCertificationFile = file;
            }
            
            /* Ending moving file to right directory and saving relation in DB */
        }

        console.log(`new disbursementContract -->>`, eDisbursementContract);
        await EnterpriseLinksDisbursementContractDAO.save(eDisbursementContract);
        
        /* Ending disbursement contract process */

        const processInstance: IProcessInstance = {
            processDefinitionKey: 'providerLinkingProcess',
            variables: [
                {
                    name: 'requestId',
                    value: request ? request.id.toString() : null
                },
                {
                    name: 'enterpriseRequesterId',
                    value: request && request.enterprise ? request.enterprise.id.toString() : null
                },
                {
                    name: 'enterpriseRequestedId',
                    value: link ? link.enterpriseLink.id.toString() : null
                },
            ]
        };

        try {
            console.log('processInstance ', processInstance)
            const createLinkRequestResult = await BPMService.runProcessInstance(processInstance);
            const { id } = createLinkRequestResult;
            const enterRest = await EnterpriseRequest.findOne({ id: request.id });
            enterRest.bpmProccesInstanceId = +id;
            await enterRest.save();
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            await EnterpriseLinkDAO.rollbackCreateLinkRequest(link.id, request.id);
            if (!enterpriseByNit) {
                await EnterpriseDAO.rollbackCreateLinkRequestNewEnterprise(nEnterprise.id, eOwner.id, eModules, uModules, uRoles);
            }
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        const result = enterpriseByNit ? {
            id: request.id,
            enterpriseName: linkRequest.enterpriseName ? linkRequest.enterpriseName : enterpriseByNit.enterpriseName ? enterpriseByNit.enterpriseName : null,
            nit: linkRequest.nit ? linkRequest.nit : enterpriseByNit.nit ? enterpriseByNit.nit : null,
            vinculationDate: enterpriseByNit && enterpriseByNit.affiliationAcceptanceDate ? enterpriseByNit.affiliationAcceptanceDate : null,
            status: enterpriseByNit && enterpriseByNit.status ? enterpriseByNit.status : null,
            phone: {
                number: phone && phone.number ? phone.number : enterpriseByNit && enterpriseByNit.owner.userProperties ? enterpriseByNit.owner.userProperties.phoneNumber : null,
                extension: phone && phone.extension ? phone.extension : enterpriseByNit && enterpriseByNit.owner.userProperties ? enterpriseByNit.owner.userProperties.phoneExt : null
            },
            owner: {
                id: enterpriseByNit ? +enterpriseByNit.owner.id : null,
                name: owner && owner.name ? owner.name : enterpriseByNit && enterpriseByNit.owner.userProperties.name ? enterpriseByNit.owner.userProperties.name : null,
                firstSurname: owner && owner.firstSurname ? owner.firstSurname : enterpriseByNit && enterpriseByNit.owner.userProperties.firstSurname ? enterpriseByNit.owner.userProperties.firstSurname : null,
                secondSurname: owner && owner.secondSurname ? owner.secondSurname : enterpriseByNit && enterpriseByNit.owner.userProperties.secondSurname ? enterpriseByNit.owner.userProperties.secondSurname : null,
                email: owner && owner.email ? owner.email : enterpriseByNit && enterpriseByNit.owner.email ? enterpriseByNit.owner.email : null
            },
            modules: enterpriseByNit ? enterpriseByNit.enterpriseModules.map(enterpriseModule => enterpriseModule.catModule ? enterpriseModule.catModule.name : null) : null,
            linkStatus: link.status ? link.status : null
        } :
            {
                id: request.id,
                enterpriseName: nEnterprise.enterpriseName,
                nit: nEnterprise.nit,
                vinculationDate: nEnterprise.affiliationAcceptanceDate ? nEnterprise.affiliationAcceptanceDate : null,
                status: nEnterprise.status,
                phone: phone ? {
                    number: eOwnerProps.phoneNumber ? eOwnerProps.phoneNumber : null,
                    extension: eOwnerProps.phoneExt ? eOwnerProps.phoneExt : null 
                } : null,
                owner: {
                    id: eOwner.id,
                    name: eOwnerProps.name,
                    firstSurname: eOwnerProps.firstSurname ? eOwnerProps.firstSurname : null,
                    secondSurname: eOwnerProps.secondSurname ? eOwnerProps.secondSurname : null,
                    email: eOwner.email
                },
                modules: eModules.map(eModule => eModule.catModule.name),
                linkStatus: link.status
            };

        console.log('Result ', result)
        console.log('SERVICE: Ending createEnterpriseProvider method...');
        return result;
    }

    static async deleteEnterpriseCustomAttribute(attributeId: number, enterpriseId: number) {
        console.log('SERVICE: Starting deleteEnterpriseCustomAttribute');
        const eCustomAttributes = await EnterpriseCustomAttributesDAO.getByEnterpriseId(enterpriseId);
        if (!eCustomAttributes) throw new BadRequestException('SCF.LIBERA.115', { enterpriseId });

        const eInvoceCustomAttibutes = await EnterpriseInvoceCustomAttributesDAO.getByAttributeId(attributeId);
        try {
            await EnterpriseCustomAttributesDAO.deleteEnterpriseCustomAttribute(enterpriseId, attributeId);

            const associatedAttribute = await EnterpriseCustomAttributesDAO.getByAttributeId(attributeId);
            if ((!associatedAttribute || associatedAttribute === undefined) && (!eInvoceCustomAttibutes || eInvoceCustomAttibutes === undefined)) {
                await CustomAttributesDAO.deleteAttribute(attributeId);
            }
            console.log('SERVICE: Ending deleteEnterpriseCustomAttribute');
        }
        catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            await EnterpriseCustomAttributesDAO.save(eCustomAttributes);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
    }

    static async createEnterpriseCustomAttributes(enterpriseId: number, customAttributes: CreateEnterpriseCustomAttributes) {
        console.log('SERVICE: Starting createEnterpriseCustomAttributes');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const cAttribute = await EnterpriseCustomAttributesDAO.getByEnterpriseIdTypeAndName(enterpriseId, customAttributes);
        if (cAttribute) throw new ConflictException('SCF.LIBERA.155');
        let attribute: CatCustomAttributes;
        let eCustomAttributes: EnterpriseCustomAttributes = new EnterpriseCustomAttributes();

        if (!cAttribute) {
            attribute = new CatCustomAttributes();
            attribute.name = customAttributes.name;
            attribute.type = customAttributes.type;
            attribute.creationDate = moment(moment.now(), 'x').toDate();
            await CustomAttributesDAO.save(attribute);
            eCustomAttributes.enterprise = enterprise;
            eCustomAttributes.customAttributes = attribute;
            eCustomAttributes.creationDate = moment(moment.now(), 'x').toDate();
            await EnterpriseCustomAttributesDAO.save(eCustomAttributes);
            return {
                id: attribute.id,
                name: attribute.name,
                type: attribute.type,
                creationDate: attribute.creationDate
            }
        }
        console.log('SERVICE: Ending createEnterpriseCustomAttributes');
    }

    static async getEnterpriseCustomAttributes(enterpriseId: number) {
        console.log('SERVICE: Starting getEnterpriseCustomAttributes');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const eCustomAttributes = await EnterpriseCustomAttributesDAO.getManyByEnterpriseId(enterpriseId);

        const eCAResponse = eCustomAttributes.map(({ customAttributes, creationDate }) => ({
            id: customAttributes.id,
            name: customAttributes.name,
            type: customAttributes.type,
            creationDate
        }));
        console.log('SERVICE: Ending getEnterpriseCustomAttributes');
        return eCAResponse;
    }

    static async deleteInvoice(enterpriseId: number, invoiceId: number) {
        console.log('SERVICE: Starting deleteInvoice');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceByIdAndEnterpriseId(invoiceId, enterpriseId);
        if (!invoice || invoice && invoice.status != EnterpriseInvoiceStatusEnum.LOADED)
            throw new ConflictException('SCF.LIBERA.127', { invoiceId, enterpriseId });
        console.log('INVOICE: >>>', invoice);
        const iCustomAttributes = invoice.enterpriseInvoiceCustomAttributes ? invoice.enterpriseInvoiceCustomAttributes : null;
        console.log('CA: >>>', iCustomAttributes);
        const iNegotiationProcess = invoice.invoiceNegotiationProcess ? invoice.invoiceNegotiationProcess : null;
        console.log('NP: >>>', iNegotiationProcess);

        if (iNegotiationProcess) {
            for (let NP of iNegotiationProcess) {
                console.log('NP - LOOP');
                await InvoiceNegotiationProcessDAO.deleteNegotiationProcess(invoice.id);
            }
        }

        if (iCustomAttributes) {
            for (let CA of iCustomAttributes) {
                console.log('CA - LOOP');
                await EnterpriseInvoceCustomAttributesDAO.deleteCustomAttributes(invoice.id);
            }
        }


        await EnterpriseDAO.deleteEnterpriseInvoice(enterpriseId, invoiceId);

        console.log('SERVICE: Ending deleteInvoice');
    }

    static async getEnterpriseInvoices(enterpriseId: number, filter: FilterEnterprises) {
        console.log('SERVICE: Starting getEnterpriseInvoices');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const eInvoices = await EnterpriseDAO.getEnterpriseInvoicesByEnterpriseId(enterpriseId, filter);
        console.log('eInvoices: ', eInvoices[0]);
        console.log('total: ', eInvoices[1]);

        let invoices = eInvoices[0].map(({ currentExpectedPaymentDate, effectivePaymentDate, id, invoiceNumber, alternativeInvoiceNumber, documentType, creationDate, expirationDate, paymentDate, status, currencyCode, advancePayment, creditNotesValue, retentions, vat, amount, paymentType, invoiceNegotiationProcess, enterpriseInvoiceCustomAttributes, provider, emissionDate, lender, bulkNegotiation }) => ({
            id: id ? +id : null,
            invoiceNumber,
            alternativeInvoiceId: alternativeInvoiceNumber,
            documentType,
            creationDate,
            emissionDate,
            expirationDate,
            effectivePaymentDate,
            currentExpectedPaymentDate,
            status,
            bulkNegotiationId: bulkNegotiation ? +bulkNegotiation.id : null,
            currencyCode: currencyCode.code,
            payment: {
                inAdvance: +advancePayment,
                creditNotesValue: +creditNotesValue,
                retentions: +retentions,
                vat: +vat,
                amount: +amount,
                paymentType
            },
            provider: provider && provider != undefined ? {
                id: provider ? +provider.id : null,
                enterpriseName: provider ? provider.enterpriseName : null,
                nit: provider ? provider.nit : null,
                owner: provider.owner ? {
                    id: provider.owner.id ? +provider.owner.id : null,
                    name: provider.owner.userProperties.name ? provider.owner.userProperties.name : null,
                    firstSurname: provider.owner.userProperties.firstSurname ? provider.owner.userProperties.firstSurname : null,
                    secondSurname: provider.owner.userProperties.secondSurname ? provider.owner.userProperties.secondSurname : null,
                    email: provider.owner.email ? provider.owner.email : null
                } : null
            } : null,
            lender: lender && lender != undefined ? {
                id: lender ? +lender.id : null,
                enterpriseName: lender ? lender.enterpriseName : null,
                nit: lender ? lender.nit : null,
                owner: lender.owner ? {
                    id: lender.owner.id ? +lender.owner.id : null,
                    name: lender.owner.userProperties.name ? lender.owner.userProperties.name : null,
                    firstSurname: lender.owner.userProperties.firstSurname ? lender.owner.userProperties.firstSurname : null,
                    secondSurname: lender.owner.userProperties.secondSurname ? lender.owner.userProperties.secondSurname : null,
                    email: lender.owner.email ? lender.owner.email : null
                } : null
            } : null,
            negotiation: invoiceNegotiationProcess.length != 0 ? {
                discountValue: null,
                expectedPaymentDate: invoiceNegotiationProcess[invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate,
                documentType,
                percentage: invoiceNegotiationProcess
                    ? invoiceNegotiationProcess[invoiceNegotiationProcess.length - 1].currentDiscountPercentage : null,
                discountDays: +LiberaUtils.getDiffDates(invoiceNegotiationProcess[invoiceNegotiationProcess.length - 1].currentDiscountDueDate),
                paymentDueDays: invoiceNegotiationProcess
                    ? +LiberaUtils.getDiffDates(invoiceNegotiationProcess[invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate)
                    : null
            } : null,
            customAttributes: enterpriseInvoiceCustomAttributes && enterpriseInvoiceCustomAttributes.length != 0 ? enterpriseInvoiceCustomAttributes.map(cAttribute => cAttribute && cAttribute.catCustomAttributes ? {
                id: +cAttribute.catCustomAttributes.id,
                name: cAttribute.catCustomAttributes.name,
                value: cAttribute.value
            } : null).filter(item => item) : null
        }));

        const list = await LiberaUtils.calculateNPDiscountValue(invoices);

        console.log(list);

        const total = eInvoices[1];
        console.log('SERVICE: Ending getEnterpriseInvoices');
        return { list, total }
    }

    static async updateInvoiceProvider(enterpriseId: number, invoiceId: number, providerId: number) {
        console.log('SERVICE: Starting updateInvoiceProvider');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseIdAndId(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.127', { invoiceId, enterpriseId });

        console.log(providerId);
        const provider = await EnterpriseDAO.getEnterpriseWithModulesAndRoles(providerId);
        console.log(provider.owner);
        if (!provider || provider && provider.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.131', { providerId });
        if (provider && !provider.enterpriseModules.filter(eModule => eModule.catModule.name == CatModuleEnum.PROVIDER) && !provider.owner.userRoles.filter(uRole => uRole.role.name == RoleEnum.ENTERPRISE_PROVIDER_ADMIN))
            throw new ConflictException('SCF.LIBERA.132', { providerId });
        const eLink = await EnterpriseRequestDAO.getRequestByEnterpriseIdAndLinkedId(enterpriseId, providerId);
        if (!eLink || eLink.status != EnterpriseLinkStatus.ENABLED)
            throw new ConflictException('SCF.LIBERA.138', { providerId, enterpriseId });

        invoice.provider = provider;

        const savedInvoice = await EnterpriseInvoiceDAO.saveInvoice(invoice);

        const result = {
            id: +savedInvoice.provider.id,
            enterpriseName: savedInvoice.provider.enterpriseName,
            nit: savedInvoice.provider.nit,
            owner: savedInvoice.provider.owner ? {
                id: +savedInvoice.provider.owner.id,
                name: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.name : null,
                firstSurname: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.firstSurname : null,
                secondSurname: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.secondSurname : null,
                email: savedInvoice.provider.owner ? savedInvoice.provider.owner.email : null,
            } : null
        };
        console.log('SERVICE: Ending updateInvoiceProvider');
        return result;
    }

    static async getEnterpriseProvidersByHint(enterpriseId: number, hint: string, link_type: EnterpriseLinkTypeEnum, documentType?: string ) {
        console.log('SERVICE: Starting getEnterpriseProvidersByHint method');
        console.log('invoice', hint);

        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        if (link_type == EnterpriseLinkTypeEnum.FUNDING) {
            const fundingLink = await EnterpriseFundingLinkDAO.getEnterpriseLendersByHint(enterpriseId, hint);
            let lendersLink = [];
            if (!fundingLink.length) return [];
            for (let { id, lender } of fundingLink) {
                const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(id);
                const funding = {
                    id: +lender.id,
                    enterpriseName: lender.enterpriseName,
                    nit: lender.nit,
                    availableQuota: +balanceData.generalBalance
                };
                lendersLink.push(funding)
            };
            lendersLink = _.uniqBy(lendersLink, 'id');
            return lendersLink;
        }

        const enterpriseLinks = await EnterpriseLinkDAO.getEnterpriseProvidersByHint(enterpriseId, hint, link_type, documentType);
        console.log(enterpriseLinks);
        let result;
        if (!enterpriseLinks.length) return [];

        result = enterpriseLinks.map(({ enterpriseLink }) => ({
            id: +enterpriseLink.id,
            enterpriseName: enterpriseLink.enterpriseName,
            nit: enterpriseLink.nit,
            availableQuota: null
        }));

        console.log('SERVICE: Ending getEnterpriseProvidersByHint method');
        return result;
    }

    static async cancelInvoiceNegotiation(negotiationId: number, enterpriseId: number, invoiceId: number, userId: number) {
        console.log('SERVICE: Starting cancelInvoiceNegotiation');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoiceNegotitation: InvoiceNegotiationProcess = await InvoiceNegotiationProcessDAO.getByNegotiationIdAndInvoiceId(negotiationId, invoiceId);
        if (!invoiceNegotitation) throw new BadRequestException('SCF.LIBERA.147', { negotiationId, invoiceId });
        if (invoiceNegotitation.status != EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE)
            throw new BadRequestException('SCF.LIBERA.148');
        const enterpriseInvoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseIdAndId(enterpriseId, invoiceId);
        if (!enterpriseInvoice) throw new BadRequestException('SCF.LIBERA.153');
        const bpmProccesInstanceId = invoiceNegotitation.bpmProcessInstance;

        const invoiceTemp = _.clone(enterpriseInvoice);
        invoiceTemp.currentExpectedPaymentDate = enterpriseInvoice.expirationDate;

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: bpmProccesInstanceId.toString(),
            event_id: 'PAYER_CANCEL_NEGOTIATION',
            reply: {
                reply: 'true',
                userId: userId.toString(),
            }
        }
        try {
            await EnterpriseInvoiceDAO.saveInvoice(invoiceTemp);
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result ', result);
        } catch (errors) {
            await EnterpriseInvoiceDAO.saveInvoice(enterpriseInvoice);
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending cancelInvoiceNegotiation');
    }

    static async createNewInvoiceNegotiation(enterpriseId: number, invoiceId: number, data: INewInvoiceNegotiation, userId: number) {
        console.log('SERVICE: Starting createNewInvoiceNegotiation method');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoice = await EnterpriseInvoiceDAO.getInvoiceByIdAndStatus(invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });
        if (!invoice.provider) throw new ConflictException('SCF.LIBERA.149', { invoiceId });

        const link = await EnterpriseLinkDAO.getProviderLinkedToEnterprise(enterpriseId, invoice.provider.id);
        const invoiceTemp = _.clone(invoice);
        let savedInvoice: EnterpriseInvoice;
        let savedInvoiceNegotiation: InvoiceNegotiationProcess;
        let newNegotiation: InvoiceNegotiationProcess;
        // const lender = await EnterpriseDAO.getLenderById(invoice.lender.id); pendiente de actualizacion para cargas masivas

        // if(!lender) throw new BadRequestException('SCF.LIBERA.151', { enterpriseId: invoice.lender.id }); pendiente de actualizacion para cargas masivas
        // if(!invoice.lender) throw new ConflictException('SCF.LIBERA.150' , {invoiceId}); pendiente de actualizacion para cargas masivas
        if (!link) throw new ConflictException('SCF.LIBERA.138', { providerId: invoice.provider.id, enterpriseId });

        invoiceTemp.status = EnterpriseInvoiceStatusEnum.NEGOTIATION_IN_PROGRESS;
        invoiceTemp.currentExpectedPaymentDate = data.expectedPaymentDate;
        invoiceTemp.currentAmount = +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
            data.percentage,
            invoice.amount,
            data.discountType,
            invoice.expirationDate,
            invoice.emissionDate
        );
        newNegotiation = new InvoiceNegotiationProcess();
        newNegotiation.enterpriseInvoice = invoice;
        newNegotiation.creationDate = moment(moment.now(), 'x').toDate();
        newNegotiation.finishedDate = null;
        newNegotiation.status = EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE;
        newNegotiation.bpmProcessInstance = null;
        newNegotiation.payerDiscountPorcentage = data.percentage;
        newNegotiation.payerRequestedDiscountDueDate = data.discountDueDate;
        newNegotiation.payerRequestedPaymentDate = data.expectedPaymentDate;
        newNegotiation.currentDiscountPercentage = data.percentage;
        newNegotiation.currentExpectedPaymentDate = data.expectedPaymentDate;
        newNegotiation.currentDiscountDueDate = data.discountDueDate;
        newNegotiation.discountType = data.discountType;
        newNegotiation.payerRequestedDiscountType = data.discountType;

        savedInvoice = await EnterpriseInvoiceDAO.saveInvoice(invoiceTemp);
        savedInvoiceNegotiation = await InvoiceNegotiationProcessDAO.saveInvoiceNegotiation(newNegotiation);

        const processInstance: IProcessInstance = {
            processDefinitionKey: 'discountNegotiationProcess',
            variables: [
                {
                    name: 'enterprisePayerId',
                    value: invoiceTemp.enterprise.id.toString()
                },
                {
                    name: 'enterpriseProviderId',
                    value: invoiceTemp.provider.id.toString()
                },
                {
                    name: 'invoiceId',
                    value: invoiceTemp.id.toString()
                }
            ]
        };

        console.log('processInstance', processInstance);

        try {
            const instance = await BPMService.runProcessInstance(processInstance);
            console.log('id', instance.id);
            newNegotiation.bpmProcessInstance = instance.id;
            await InvoiceNegotiationProcessDAO.updateBpmProcessInstance(newNegotiation.negotiationProcess, newNegotiation.bpmProcessInstance);
            console.log('entrando a sqs creando objeto');
            const sqsMetadata = {
                sqsUrl: SQS_LIBERA_NEGOTIATION_QUEUE,
                body: {
                    negotiationId: savedInvoiceNegotiation.negotiationProcess,
                    userId,
                    negotiationRole: EnterpriseInvoiceNegotiationRoleEnum.PAYER.toString(),
                    eventDate: moment(moment.now(), 'x').toDate(),
                    typeEvent: DiscountNegotiationsLogBookStatusEnum.CREATED.toString()
                }
            }
            await SQSService.sendMessage(sqsMetadata);
        }
        catch (errors) {
            await EnterpriseInvoiceDAO.saveInvoice(invoice);
            await InvoiceNegotiationProcessDAO.deleteNegotiationProcessByNegotiationId(newNegotiation.negotiationProcess);
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        const result = {
            id: +savedInvoiceNegotiation.negotiationProcess,
            invoiceNumber: savedInvoice.invoiceNumber,
            amount: +savedInvoice.amount,
            creationDate: savedInvoiceNegotiation.creationDate,
            finishDate: savedInvoiceNegotiation.finishedDate,
            status: savedInvoiceNegotiation.status,
            payerOffer: {
                discountType: savedInvoiceNegotiation.discountType,
                percentage: +savedInvoiceNegotiation.payerDiscountPorcentage,
                discountDueDate: savedInvoiceNegotiation.payerRequestedDiscountDueDate,
                expectedPaymentDate: savedInvoiceNegotiation.payerRequestedPaymentDate,
                discountValue: +LiberaUtils.calculateDiscountValueByTypeOfDiscount(savedInvoiceNegotiation.payerDiscountPorcentage, invoice.amount, savedInvoiceNegotiation.discountType, savedInvoice.expirationDate, savedInvoice.emissionDate)
            },
            providerOffer: null
        };
        console.log('SERVICE: Ending createNewInvoiceNegotiation method');
        return result;
    }

    static async updateInvoiceNegotiationById(enterpriseId: number, invoiceId: number, negotiationId: number, data: UpdateNegotiationById, userId: number) {
        console.log('SERVICE: Starting updateInvoiceNegotiationById');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseIdAndId(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });
        const negotiation = await InvoiceNegotiationProcessDAO.getByInvoiceIdAndId(invoiceId, negotiationId);
        if (!negotiation || negotiation && negotiation.status != EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE)
            throw new ConflictException('SCF.LIBERA.144', { status: EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE });

        const negotiationStatus = data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED ?
            EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE : data.status;

        const newNegotiation = _.clone(negotiation);
        const newInvoice = _.clone(invoice);
        switch (data.status) {
            case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
                newNegotiation.discountType = data.newOffer.discountType;
                newNegotiation.payerDiscountPorcentage = data.newOffer.percentage;
                newNegotiation.payerRequestedDiscountDueDate = data.newOffer.discountDueDate;
                newNegotiation.payerRequestedPaymentDate = data.newOffer.expectedPaymentDate;
                newNegotiation.currentDiscountPercentage = data.newOffer.percentage;
                newNegotiation.currentDiscountDueDate = data.newOffer.discountDueDate;
                newNegotiation.currentExpectedPaymentDate = data.newOffer.expectedPaymentDate;
                newNegotiation.payerRequestedDiscountType = data.newOffer.discountType;
                newInvoice.currentExpectedPaymentDate = data.newOffer.expectedPaymentDate;
                const currentAmount = +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                    data.newOffer.percentage,
                    invoice.amount,
                    data.newOffer.discountType,
                    invoice.expirationDate,
                    invoice.emissionDate
                );
                await EnterpriseInvoiceDAO.updateInvoiceCurrentAmount(invoiceId, currentAmount);
                break;
            case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
                newNegotiation.payerDiscountPorcentage = negotiation.providerDiscountPorcentage;
                newNegotiation.payerRequestedDiscountDueDate = negotiation.providerRequestedDiscountDueDate;
                newNegotiation.payerRequestedPaymentDate = negotiation.providerRequestedPaymentDate;
                newNegotiation.currentDiscountPercentage = negotiation.providerDiscountPorcentage;
                newNegotiation.currentDiscountDueDate = negotiation.providerRequestedDiscountDueDate;
                newNegotiation.currentExpectedPaymentDate = negotiation.providerRequestedPaymentDate;
                newNegotiation.payerRequestedDiscountType = negotiation.discountType;
            default:
                break;
        }

        newNegotiation.status = negotiationStatus;

        const negotiationUpdated = await InvoiceNegotiationProcessDAO.saveInvoiceNegotiation(newNegotiation);
        console.log('negotiationUpdated >>> ', negotiationUpdated);
        await EnterpriseInvoiceDAO.saveInvoice(newInvoice);

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: negotiationUpdated.bpmProcessInstance.toString(),
            event_id: BPM_PAYER_NEGOTIATION_ANSWERED_EVENT,
            reply: {
                payerNegotiationAnswer: data.status.toString(),
                userId: userId.toString(),
                role: EnterpriseInvoiceNegotiationRoleEnum.PAYER.toString(),
            }
        }
        console.log('specificProcessInstance >>> ', specificProcessInstance);

        try {
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result >>> ', result);
        } catch (errors) {
            await InvoiceNegotiationProcessDAO.rollbackInvoiceNegotiation(negotiation);
            await EnterpriseInvoiceDAO.saveInvoice(invoice);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        try {
            if (data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED) {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_NEGOTIATION_QUEUE,
                    body: {
                        negotiationId,
                        userId: userId,
                        negotiationRole: EnterpriseInvoiceNegotiationRoleEnum.PAYER.toString(),
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: DiscountNegotiationsLogBookStatusEnum.COUNTEROFFERED.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            }
        } catch (errors) {
            await InvoiceNegotiationProcessDAO.rollbackInvoiceNegotiation(negotiation);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        console.log('SERVICE: Ending updateInvoiceNegotiationById');
    }

    static async startProcessInvoicesBulkLoad(userId: number, enterpriseId: number, data: EInvoiceBulkLoad) {
        console.log('SERVICE: Starting startProcessInvoicesBulkLoad...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const initialLoadCount = data.invoices.length;
        let invoiceNumber;
        console.log('invoices recived -->> ', data.invoices);
        console.log('total invoices recived -->> ', initialLoadCount);
        const invoices = [];

        for await (let invoice of data.invoices) {
            invoice.enterpriseId = enterpriseId;

            if (!invoice.invoiceNumber)
                continue;

            invoiceNumber = await EnterpriseInvoiceDAO.getByInvoiceNumber(enterpriseId, invoice.invoiceNumber);

            if (invoiceNumber)
                continue;

            if (!invoice.emissionDate || !LiberaUtils.isValidFormatDate(invoice.emissionDate.toString()))
                continue;

            if (!invoice.expirationDate || !LiberaUtils.isValidFormatDate(invoice.expirationDate.toString()))
                continue;


            const provider = await EnterpriseDAO.getEnterpriseByNit(invoice.providerNIT);

            if (provider) {
                const linkProvider: EnterpriseLinks = await EnterpriseLinkDAO.getProviderLinkedToEnterpriseandStatus(enterpriseId, provider.id);
                console.log("linkprovider -->>", linkProvider);
                invoice.providerNIT = linkProvider ? linkProvider.enterpriseLink.nit : null;
            } else {
                continue;
            }

            if (isNaN(invoice.payment.amount) || isNaN(parseFloat(invoice.payment.creditNotesValue)) || isNaN(parseFloat(invoice.payment.retentions)) || isNaN(parseFloat(invoice.payment.vat)) || isNaN(invoice.payment.inAdvance)) {
                continue;
            }
            invoices.push(invoice);

        };

        const totalInvoicesAproved = invoices.length;
        console.log('total invoices aproved ----->>', totalInvoicesAproved);
        console.log('invoices aproved -->> ', invoices);

        const user = await UserDAO.getBasicUserById(userId);

        const bucket = S3_BUCKET_NAME;
        const filename = data.filename;
        console.log("filename before", filename);
        const encodedFileName = S3Utils.cleanS3Filename(filename);
        console.log('encodedFileName', encodedFileName);
        console.log("filename after", filename);
        const fromDir = S3_FILE_PATH_PREFIX
            .replace('{enterpriseId}', enterpriseId.toString())
            .concat(encodedFileName);
        const toDir = S3_ENTERPRISES_INVOICES_FILES_PATH_PREFIX
            .replace('{enterpriseId}', enterpriseId.toString())
            .concat(encodedFileName);
        try {
            await S3Service.getObjectFile({ bucket, filekey: fromDir });
        } catch (error) {
            console.log('ERROR: ', error);
            throw new ConflictException('SCF.LIBERA.176', { filename });
        }


        console.log(`FILEE FROM >>>>`, fromDir);
        console.log(`FILEE TO   >>>>`, toDir);


        await S3Service.moveFile(bucket, fromDir, toDir);
        await S3Service.deleteFile({ bucket, filekey: fromDir });

        const metadata = { bucket, filename, fileKey: toDir };
        const enterpriseInvoiceBulk = new EnterpriseInvoiceBulk();
        enterpriseInvoiceBulk.enterprise = enterprise;
        enterpriseInvoiceBulk.status = EnterpriseInvoiceBulkStatus.PENDING_COMPLETION;
        enterpriseInvoiceBulk.folioNumber = uuid();
        enterpriseInvoiceBulk.initialLoadCount = initialLoadCount;
        enterpriseInvoiceBulk.errorLoadedCount = initialLoadCount - totalInvoicesAproved;
        enterpriseInvoiceBulk.successfulLoadedCount = 0;
        enterpriseInvoiceBulk.creationDate = moment(moment.now(), 'x').toDate();
        enterpriseInvoiceBulk.creationUser = user;

        let savedMetadata;

        try {
            savedMetadata = await S3MetadataService.createS3Metadata(metadata);
            enterpriseInvoiceBulk.s3Metadata = savedMetadata;
            await EnterpriseInvoiceBulkDAO.saveInvoiceBulk(enterpriseInvoiceBulk);

            await SQSService.sendMessage({
                sqsUrl: SQS_LIBERA_ENTERPRISE_INVOICES_BULK_QUEUE,
                body: {
                    enterpriseInvoiceBulkId: enterpriseInvoiceBulk.id,
                    currencyCode: data.currencyCode,
                    documentType: data.documentType,
                    paymentType: data.paymentType,
                    customAttributes: data.customAttributes,
                    invoices: invoices
                }
            });

        } catch (errors) {
            await EnterpriseInvoiceBulkDAO.deleteInvoiceBulk(enterpriseInvoiceBulk);
            await S3MetadataDAO.delete(savedMetadata);
            await S3Service.moveFile(bucket, toDir, fromDir);
            await S3Service.deleteFile({ bucket, filekey: toDir });
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        console.log('SERVICE: Ending startProcessInvoicesBulkLoad...');
        return {
            id: enterpriseInvoiceBulk.id,
            filename: enterpriseInvoiceBulk.s3Metadata.filename,
            status: enterpriseInvoiceBulk.status,
            folio: enterpriseInvoiceBulk.folioNumber,
            creationDate: enterpriseInvoiceBulk.creationDate,
            creationUser: enterpriseInvoiceBulk.creationUser.id,
            totalCount: enterpriseInvoiceBulk.initialLoadCount,
            successCount: +0,
            errorCount: enterpriseInvoiceBulk.errorLoadedCount
        }
    }

    static async getEnterpriseRecord(enterpriseId: number) {
        console.log('SERVICE: Starting getEnterpriseRecord');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const records = await EnterpriseLogBookDAO.getEnterpriseRecordById(enterpriseId);

        if (!records.length)
            return [];

        let result;

        for (let record of records) {
            result = record.logBook.map(({ user, eventType, eventDate, entity, comments, value }) => ({
                id: `${record.id}${new Date(eventDate).getTime()}`,
                liberaUser: {
                    name: user.name,
                    firstSurname: user.firstSurname,
                    secondSurname: user.secondSurname
                },
                event: {
                    eventType,
                    entity,
                    value,
                    date: eventDate,
                    comment: comments !== 'null' ? comments : null
                }
            }))
        }

        console.log('SERVICE: Ending getEnterpriseRecord');
        return _.orderBy(result, ['event.date'], ['desc']);
    }

    static async getLendersAvaiable(filter: IFilterLenders, userId: number) {
        console.log('SERVICE: Starting getLendersAvaiable');

        const payer = await EnterpriseDAO.getEnterpriseByUserId(userId);
        console.log('Payer -->> ', payer.id);

        const eLenders = await EnterpriseDAO.getLendersAvaiable(filter, payer.id);
        console.log('eLenders -->>', eLenders[0]);
        console.log('total: ', eLenders[1]);

        let lenders = eLenders[0].map(({ id, nit, enterpriseName, owner }) => ({
            id: +id,
            nit,
            enterpriseName,
            owner: {
                id: +owner.id,
                name: owner.userProperties.name ? owner.userProperties.name : null,
                firstSurname: owner.userProperties.firstSurname ? owner.userProperties.firstSurname : null,
                secondSurname: owner.userProperties.secondSurname ? owner.userProperties.secondSurname : null,
                email: owner.email
            }
        }));
        const total = eLenders[1];
        console.log('SERVICE: Ending getLendersAvaiable');
        return { lenders, total };
    }
    static async delay(milliseconds: number) {
        return new Promise<void>(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    static async getModulesEnterprise(catModuleDocumentations: CatModuleDocumentation[], enterpriseDocumentations: EnterpriseDocumentation[], enterprise: Enterprise) {
        const modules = catModuleDocumentations.map(async (catModuleDocumentation) => {
            const enterpriseDocuments = enterpriseDocumentations.filter(enterpriseDocumentation => enterpriseDocumentation.documentType.code == catModuleDocumentation.documentType.code && enterpriseDocumentation.enterprise.id == enterprise.id);
            let enterpriseDocument = null;
            if (enterpriseDocuments.length > 0)
                enterpriseDocument = enterpriseDocuments[0];

            console.log('docuemtacion uno por uno', enterpriseDocument);
            console.log('catalogo de documentaci{on', catModuleDocumentation);
            console.log(catModuleDocumentation.catModule.name);
            console.log(JSON.stringify(enterpriseDocuments));
            const enterpriseModules = enterprise.enterpriseModules.filter(enterpriseModule => enterpriseModule.catModule.name == catModuleDocumentation.catModule.name);
            let enterpriseModule = null;
            if (enterpriseModules.length > 0)
                enterpriseModule = enterpriseModules[0];
            console.log(enterpriseModule);
            const url = await S3Service.getObjectUrl({ bucket: S3_BUCKET_NAME, fileKey: catModuleDocumentation.documentType.templateUrl });
            return {
                documentationId: enterpriseDocument ? enterpriseDocument.id : null,
                name: catModuleDocumentation.catModule.name,
                description: catModuleDocumentation.catModule.description,
                status: enterpriseModule ? enterpriseModule.status : null,
                activationDate: enterpriseModule ? enterpriseModule.activationDate : null,
                requiredDocumentation: catModuleDocumentation.documentType ? url : null
            }
        });
        return Promise.all(modules);
    }

    static async updateModulesProducts(enterpriseId, requestBody) {
        console.log('SERVICE: Starting updateModulesProducts...');

        const region = await CatalogDAO.getRegionById(+requestBody.bankRegion.id);
        if(!region)
            throw new ConflictException('SCF.LIBERA.307');

        const basicEnterprise = await Enterprise.getBasicEnterpriseById(enterpriseId);
        console.log('basicEnterprise ======>', basicEnterprise)
        
        let enterpriseActiveModules;
        let enterpriseModules;
        let saveEnterprise;
        let userModules;

        try {
            const userProperties = new UserProperties();
            userProperties.secondSurname = requestBody.owner.secondSurname ? requestBody.owner.secondSurname : null;
            userProperties.phoneExt = requestBody.phone.phoneExt ? requestBody.phone.phoneExt : null;
            userProperties.phoneNumber = requestBody.phone.number ? requestBody.phone.number : null;
            userProperties.documentNumber = requestBody.owner.documentNumber ? requestBody.owner.documentNumber : null;
            userProperties.documentType = requestBody.owner.documentType ? requestBody.owner.documentType : null;
            await UserPropertiesDAO.updateUserPropertiesById(userProperties, basicEnterprise.owner.id);
            console.log('saveUserProperties ======>', userProperties)

            const updatedEnterprise = new Enterprise();
            updatedEnterprise.relationshipManager = requestBody.relationshipManager ? requestBody.relationshipManager : null;
            updatedEnterprise.sale = requestBody.sales ? requestBody.sales.toString() : null;
            updatedEnterprise.salesCut = requestBody.salesCut ? requestBody.salesCut : null;
            updatedEnterprise.bankRegion = region;
            saveEnterprise = await EnterpriseDAO.updateEnterpriseById(updatedEnterprise, enterpriseId);
            console.log('saveEnterprise ======>', updatedEnterprise);

            enterpriseActiveModules = await EnterpriseModule.getModulesByEntepriseId(enterpriseId);
            let statusModule = enterpriseActiveModules[0].status;
            console.log('statusModule ======>', statusModule);

            let activeModules = [];
            for (let i = 0; i < enterpriseActiveModules.length; i++) {
                const module = enterpriseActiveModules[i];
                activeModules.push(module.catModule.name);
            }

            let modulesToUpdate = requestBody.owner.modules.filter( ( module ) => !activeModules.includes( module ) );
            enterpriseModules = await EnterpriseModuleService.updateModuleToEnterprise(basicEnterprise, modulesToUpdate, statusModule);
            console.log('Saved enterpriseModules ======>', enterpriseModules);
            userModules = await UserService.generateUserModuleAndUserRole(basicEnterprise.owner, modulesToUpdate)
            console.log('Saved userModules ======>', userModules);

            let modulesToCognito = [... new Set([...activeModules, ...requestBody.owner.modules])]
            console.log('modulesToCognito ======>', modulesToCognito);

            let role;
            let userRole;
            let roles = [];
            
            for(let Module of modulesToCognito) {
                switch (Module) {
                    case CatModuleEnum.ADMIN:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_CONSOLE_ADMIN);
                        roles.push(role.name);
                        break;

                    case CatModuleEnum.PROVIDER:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PROVIDER_ADMIN);
                        roles.push(role.name);
                        break;
                
                    case CatModuleEnum.PAYER:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PAYER_ADMIN);
                        roles.push(role.name);
                        break;

                    case CatModuleEnum.FUNDING:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_FUNDING_ADMIN);
                        roles.push(role.name);
                        break;
                }
            }
            console.log('roles ======>', roles);

            const params: any = {
                UserPoolId: process.env.COGNITO_USER_POOL_ID,
                Username: basicEnterprise.owner.email,
                UserAttributes: [
                    {
                        Name: 'custom:roles',
                        Value: JSON.stringify(roles)
                    },
                    {
                        Name: 'custom:modules',
                        Value: JSON.stringify(modulesToCognito)
                    }
                ]
            }
            console.log(JSON.stringify(params));  

            try {
                console.log('CognitoService');
                const result = await await CognitoIdentityService.adminUpdateUserAttributes(params).promise()
                console.log(result);
            } catch (errors) {
                throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors})
            }

            console.log('SERVICE: Ending updateModulesProducts...');
        }
        catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
        }
    }

    static async postEnterpriseDocumentationByEnterpriseId(enterpriseId: number, requestBody: { documentType: CatDocumentType; comment: string; documentTypeDescription: string; effectiveness: number; }, userId: number) {
        console.log('SERVICE: Starting postEnterpriseDocumentationByEnterpriseId');

        const enterprise = await Enterprise.getBasic(enterpriseId);
        console.log('basicEnterprise ===>', enterprise);
        const enterpriseDocuments = await EnterpriseDocumentation.getBasicEnterpriseDocumentation(enterpriseId);
        console.log('enterpriseDocuments ===>', enterpriseDocuments);
        const user = await User.getUserById(userId);
        console.log('user ===>', user);
        const enterpriseAdditionalDocuments = enterpriseDocuments.filter(type => type.TYPE === 'OTHER_DOCUMENTS')
        if (enterpriseAdditionalDocuments.length === 20) throw new BadRequestException('SCF.LIBERA.292')
        if (enterprise.status === EnterpriseStatusEnum.DELETED) throw new NotFoundException('SCF.LIBERA.71', { enterpriseId });
        
        const enterpriseDocumentation = new EnterpriseDocumentation();
        enterpriseDocumentation.creationDate = moment(moment.now(), 'x').toDate();
        enterpriseDocumentation.modificationDate = moment(moment.now(), 'x').toDate();
        enterpriseDocumentation.documentType = requestBody.documentType;
        enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.PENDING;
        enterpriseDocumentation.enterprise = enterprise;
        enterpriseDocumentation.comment = requestBody.comment;
        enterpriseDocumentation.documentTypeDescription = requestBody.documentTypeDescription;
        enterpriseDocumentation.effectiveness = requestBody.effectiveness;
        enterpriseDocumentation.userId = userId;
        user.type === UserTypeEnum.LIBERA_USER ? enterpriseDocumentation.required = true : enterpriseDocumentation.required = false;

        const savedEnterpriseDocumentation = await EnterpriseDAO.postEnterpriseDocumentationByEnterpriseId(enterpriseDocumentation);

        const savedEnterpriseDoc = await EnterpriseDocumentationDAO.getGeneralDocumentationByDocumentationId(savedEnterpriseDocumentation.id);
        const finalResponse: PostEnterpriseDocumentResponse = ClientsParser.parseCreateEnterpriseDocumentationResponse(savedEnterpriseDoc);

        console.log('SERVICE: Ending postEnterpriseDocumentationByEnterpriseId');
        return finalResponse;
    }

    static async sendDocumentationResolution(enterpriseId: number, comesFromService?: boolean) {
        console.log('SERVICE: Starting sendDocumentationResolution');
        const basicEnterprise = await Enterprise.getBasicEnterpriseById(enterpriseId);
        console.log('basicEnterprise ===> ', basicEnterprise);
        
        if (comesFromService == false || comesFromService == undefined) {
            if (basicEnterprise.status !== EnterpriseStatusEnum.EVALUATION_PENDING) 
                throw new ConflictException('SCF.LIBERA.297')
        }

        const enterpriseDocumentation = await EnterpriseDocumentation
            .getEnterpriseDocumentsByEnterpriseIdAndStatus(+enterpriseId, ['REJECTED', 'CURRENT', 'PENDING']);
        console.log('enterpriseDocumentation ==> ', enterpriseDocumentation);

        let parsedDocuments = enterpriseDocumentation.map((doc) => {
            return {
                document: doc.documentType.description,
                status: parseCatDocumentTypeStatus(doc.status),
                comment: doc.comment ? doc.comment : ' ',
                actions: parseCatDocumentTypeActions(doc.status)
            } 
        });
        console.log('parsedDocuments ==> ', parsedDocuments);
        
        await SESService.sendTemplatedEmail({
            template: SES_SEND_DOCUMENTATION_RESOLUTION,
            destinationEmail: basicEnterprise.owner.email, 
            mergeVariables: {
                documents: parsedDocuments,
            }
        });
        console.log('SERVICE: Ending sendDocumentationResolution');
    }

    static async getByOwnerId(ownerId: number) {
        console.log('SERVICE: Starting getByOwnerId method');
        const enterprise: Enterprise = await EnterpriseDAO.getByOwnerId(ownerId);
        console.log('SERVICE: Ending getByOwnerId method');
        return enterprise;
    }

    static async updateEnabledEnterprises(trmnalId): Promise<void> {
        console.log('SERVICE: Starting updateEnabledEnterprises method');

        const enabledEnterprises: Enterprise[] = await EnterpriseDAO.getEnterpriseByStatus(EnterpriseStatusEnum.ENABLED);
        if(enabledEnterprises.length > 0){
            for(let enterprise of enabledEnterprises) {
                try {
                    let documentNumberFixed = enterprise.nit;
                    if (enterprise.enterpriseDocumentType === 'NIT' ||
                        enterprise.enterpriseDocumentType === 'AUTONOMOUS_HERITAGE') {
                        documentNumberFixed = enterprise.nit.slice(0, (enterprise.nit.length - 1));
                    }

                    let responseFromApi = await ClientsAndContactsService.getInformation(
                        trmnalId, enterprise.enterpriseDocumentType, documentNumberFixed);
                    let mustSyncronize = false;

                    if(!enterprise.economicActivity || !enterprise.relationshipManager){
                        mustSyncronize = true;
                    } else if (responseFromApi.ciiu === enterprise.economicActivity.ciiuCode
                        && responseFromApi.enterpriseName === enterprise.enterpriseName
                        && responseFromApi.relationshipManager === enterprise.relationshipManager) {
                        console.log(`---> Enterprise with ID: ${enterprise.id} skipped, because it's alredy update.`);
                        continue;
                    }
                    if(mustSyncronize) {
                        console.log(`---> Must syncronize true`);
                        
                        let economicActivityEntity: CatEconomicActivity = await EconomicActivitiesDAO.getActivityByCiiu(responseFromApi.ciiu);
                        if(!economicActivityEntity){
                            console.error(`---> Ciiu belongs API: ${responseFromApi.ciiu} is not valid, enterprise skipped.`);
                            continue;
                        }

                        enterprise.economicActivity = economicActivityEntity;
                        enterprise.enterpriseName = responseFromApi.enterpriseName;
                        enterprise.relationshipManager = responseFromApi.relationshipManager;
                        await EnterpriseDAO.saveEnterprise(enterprise);
                        console.log(`---> Enterprise with ID: ${enterprise.id} updated.`);
                    }

                } catch (error) {
                    console.error(`---> Error triggered by enterprise with ID: ${enterprise.id}. \n ${error}`);
                    continue;
                }
            }
        } else {
            console.log('---> There is no enterprises to update.');
        }
        console.log('SERVICE: Ending updateEnabledEnterprises method');
    }

    static async getEnterprisePayers(enterprise_id: number):Promise<IParseEnterprisePayers[]> {
        console.log('SERVICE: Starting getEnterprisePayers method');
        const enterprisePayers: Enterprise[] = await EnterpriseDAO.getEnterprisePayers(enterprise_id);
        console.log('enterprisePayers ==>', enterprisePayers);

        const enterprises:IParseEnterprisePayers[] = EnterprisesParser.parseEnterprisePayers(enterprisePayers);
        console.log('SERVICE: Ending getEnterprisePayers method');
        return enterprises;
    }

    static async getEnterpriseFinancingPlans(enterprise_id: number, userId: number, filter_by?: string, q?: string, page?: string, per_page?: string):Promise<[IEnterpriseFinancingPlan[],number]> {
        console.log('SERVICE: Starting getEnterpriseFinancingPlans method');
        const { type: userType } = await User.getUserById(userId);
        console.log('userType ==> ', userType);

        const [enterprisePlansEntity,total]: [EnterpriseFinancingPlan[], number] = await FinancingPlanDAO
            .getFinancingPlansByEnterpriseId(enterprise_id, userType, filter_by, q, page, per_page);
        console.log('enterprisePlansEntity ===> ', enterprisePlansEntity);

        const finalResponse = await EnterprisesParser.parseEnterpriseFinancingPlans(enterprisePlansEntity, userType)
        console.log('SERVICE: Ending getEnterpriseFinancingPlans method');
        return [finalResponse, total];
    }

    static async createEnterpriseFinancingPlan(enterpriseId: number, reqBody: ICreateFinancingPlanReq, userId: number, evidenceFilename?: string):Promise<IResponseFinancingPlan> {
        console.log('SERVICE: Starting createEnterpriseFinancingPlan method');

        const documentationPathPrefix:string = process.env.S3_FILE_PATH_PREFIX;
        const finalDocumentationPathPrefix:string = process.env.S3_FINANCING_PLAN_PATH_PREFIX;
        const bucket:string = process.env.S3_BUCKET_NAME;
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        
        if(enterprise.status !== EnterpriseStatusEnum.ENABLED)
            throw new ConflictException('SCF.LIBERA.322');
        
        const payerModule = enterprise.enterpriseModules.find(module =>
            module.catModule.name === 'PAYER' && module.status === EnterpriseStatusEnum.ENABLED.valueOf());
        if(!payerModule)
            throw new ConflictException('SCF.LIBERA.323');

        const relMinRatePeriodicity = await RelRatePeriodicityDAO.getRateAndPeriodicityRelation(reqBody.minimumRate.baseType, reqBody.minimumRate.periodicityType);
        const relNegRatePeriodicity = await RelRatePeriodicityDAO.getRateAndPeriodicityRelation(reqBody.negotiatedRate.baseType, reqBody.negotiatedRate.periodicityType);
        
        if(!relMinRatePeriodicity)
            throw new ConflictException('SCF.LIBERA.324');
        if(!relNegRatePeriodicity)
            throw new ConflictException('SCF.LIBERA.324');
        
        if(reqBody.providerOptions){
            const enterpriseLinked = await EnterpriseLinkDAO.getProviderLinkedToEnterprise(enterpriseId, reqBody.providerOptions.providerId);
            
            if(!enterpriseLinked)
                throw new ConflictException('SCF.LIBERA.325');
        }

        let file;
        if(typeof evidenceFilename === "string"){
          let encodedFile:string = S3Utils.cleanS3Filename(evidenceFilename);
  
          let fromDir:string = documentationPathPrefix
            .replace('{enterpriseId}',enterpriseId.toString())
            .concat(S3Utils.s3UrlEncode(encodedFile));
  
          let toDir:string = finalDocumentationPathPrefix
            .replace('{enterpriseId}',enterpriseId.toString())
            .concat(S3Utils.fileKeyNameGenerator(encodedFile));
  
          console.log('---> S3 services');
          await S3Service.moveFile(bucket,fromDir,toDir);
          
          file = await S3MetadataService.createS3Metadata({
              bucket, filename: evidenceFilename, fileKey:toDir
          });
        }
        
        let economicGroups: Enterprise[];
        if (reqBody.economicGroup) {
            let enterpriseIds = reqBody.economicGroup.map( id => { return id.enterpriseId });
            console.log('enterpriseIds ==> ', enterpriseIds);
            economicGroups = await Enterprise.getEnterprisesById(enterpriseIds);
            console.log('economicGroups ==> ', economicGroups);

            for (const group of economicGroups) {
                if (group.status !== EnterpriseStatusEnum.ENABLED)
                    throw new ConflictException('SCF.LIBERA.326');

                const payerModuleEG = group.enterpriseModules.find(module =>
                    module.catModule.name === 'PAYER' && module.status === EnterpriseStatusEnum.ENABLED.valueOf());
                if(!payerModuleEG)
                    throw new ConflictException('SCF.LIBERA.323');  
            }
        }

        const userFirmed: User = await UserDAO.getBasicUserById(userId);
        const planParsed: EnterpriseFinancingPlan = FinancingPlanParser.parseFinancingPlanReq(reqBody, enterpriseId, userFirmed, file);
        const enterprisePlansEntity: EnterpriseFinancingPlan = await FinancingPlanDAO.createFinancingPlan(planParsed);
        const respFinancingPlanParsed: IResponseFinancingPlan = FinancingPlanParser.parseFinancingPlanRes(enterprisePlansEntity, reqBody, relNegRatePeriodicity);

        if(reqBody.economicGroup){
            console.log('---> Saving Economic Group');
            const reqEconomicGroup = economicGroups;
            for (const group of reqEconomicGroup) {
                const economicGroupToSave = EconomicGroupParser.parseEconomicGroup(enterprisePlansEntity, group, userFirmed);
                await EconomicGroupDAO.saveEnterpriseEconomicGroup(economicGroupToSave);    
            }
        }

        if(reqBody.clientPermissions && reqBody.clientPermissions.length > 0) {
            console.log('---> Saving Financing Plan Permission');
            const clientPermissionToSave = reqBody.clientPermissions;
            for (const permission of clientPermissionToSave) {
                const permissionTosave = ClientPermissionParser.parseClientPermission(enterprisePlansEntity, permission);
                await FinancingPlanPermissionDAO.saveFinancingPlanPermission(permissionTosave);
            }
        }

        const payerEnterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        
        let providerName: string = '';

        if(reqBody.providerOptions){
            const providerId = reqBody.providerOptions.providerId;
            const providerEnterprise = await EnterpriseDAO.getEnterpriseById(providerId);
            providerName = providerEnterprise.enterpriseName;
        }

        const {enterpriseName,nit, enterpriseDocumentType, bankRegion } = payerEnterprise;
        const {userProperties} = userFirmed;
        const {name,firstSurname, secondSurname} = userProperties;
        const userName = `${name ? name : ''} ${firstSurname ? firstSurname : ''} ${secondSurname ? secondSurname : ''}`;

        console.log('bankRegion.id --> ', bankRegion.id);
        const usersRoles: UserRole[] = await UserRoleDAO.getUserByPermission(PermissionEnum.AUTHORIZE_FINANCING_PLAN, bankRegion.id);
        console.log('usersRoles --> ', usersRoles);

        const emails : string[] = usersRoles.map(user=> user.user.email);
        console.log('emails --> ', emails);

        console.log('s3Bucket ====>',S3_BUCKET_NAME);
        console.log('host ====>',HOST);

        await SESService.sendBulkTemplatedEmail({
            template: SES_SEND_PENDING_FINANCING_PLAN_APPROVAL_NOTIFICATION,
            destinationEmails: emails,
            ReplacementTemplateData: JSON.stringify({
                enterpriseName,
                nit,
                enterpriseDocumentType: DocumentTypeTranslationEnum[enterpriseDocumentType],
                userName,
                host: HOST,
                fileKey,
                s3Bucket: S3_BUCKET_NAME,
                providerName
            })
        });

        await EnterpriseUtils.updateFinancialConditions(enterpriseId);

        console.log('SERVICE: Ending createEnterpriseFinancingPlan method');
        return respFinancingPlanParsed;
    }

    static async getFinancingPlanDetail(financingPlanId: number, userId: number) {
        console.log('SERVICE: Starting getFinancingPlanDetail');
        const financingPlanDetail = await FinancingPlanDAO.getFinancingPlanDetail(financingPlanId);
        console.log('financingPlanDetail ==> ', financingPlanDetail);

        const { type: userType } = await User.getUserById(userId);
        console.log('userType ==> ', userType);

        const parsedFinancingPlanDetail =  EnterprisesParser.parseFinancingPlanDetail(financingPlanDetail, userType);
        console.log('SERVICE: Ending getFinancingPlanDetail');
        return parsedFinancingPlanDetail;
    }

    static async updateFinancingPlansStatusCRON(){
        console.log('SERVICE: Starting updateFinancingPlansStatusCRON');
        const _16daysAheadofToday = moment().add(16, 'days').format('YYYY-MM-DD');
        const status = [FinancingPlanStatusEnum.CURRENT, FinancingPlanStatusEnum.ABOUT_TO_EXPIRE, FinancingPlanStatusEnum.PENDING_APPROVAL, FinancingPlanStatusEnum.PENDING_ACCEPTANCE];
        const financingPlans: EnterpriseFinancingPlan[] = await FinancingPlanDAO.getFinancingPlanstoUpdateStatus(_16daysAheadofToday, status);

        for (const financingPlan of financingPlans) {

            let status: FinancingPlanStatusEnum;
            if (financingPlan.status === FinancingPlanStatusEnum.PENDING_APPROVAL || financingPlan.status === FinancingPlanStatusEnum.PENDING_ACCEPTANCE) {
                status = this.updateFinancingPlansStatusToTimedOut(financingPlan);
            }else{
                status = this.updateFinancingPlansStatus(financingPlan);
            }
                
            financingPlan.status = status;

            if(financingPlan.validityDate > moment().tz('America/Bogota').toDate())
                financingPlan.validityDate = moment(financingPlan.validityDate).subtract(1, 'days').toDate();

            await FinancingPlanDAO.saveFinancingPlan(financingPlan);
            await EnterpriseUtils.updateFinancialConditions(financingPlan.payer.id);
        }
        
        console.log('SERVICE: Ending updateFinancingPlansStatusCRON');
    }

    static async updateStatusFinancingPlan(financingPlanId: number,userId: number ,status: FinancingPlanStatusActionsEnum , comments: string): Promise<string>{
        console.log('SERVICE: Starting updateStatusFinancingPlan');
        const financingPlan = await FinancingPlanDAO.getFinancingPlanById(financingPlanId);
        if(!financingPlan)
            throw new ConflictException('SFC.LIBERA.380');
        console.log('financingPlan ==> ', financingPlan);

        const user = await UserDAO.getBasicUserById(userId);

        const enterpiseUserAprove = ()=>{
            return this.updateFinancingPlansStatus(financingPlan);
        }

        const isExpired = enterpiseUserAprove() === FinancingPlanStatusEnum.EXPIRED;

        if(isExpired)
            throw new ConflictException('SCF.LIBERA.388');

        const stateTree = {
            [FinancingPlanStatusActionsEnum.APPROVE]: {
                [UserTypeEnum.LIBERA_USER]: {
                    current: FinancingPlanStatusEnum.PENDING_APPROVAL,
                    next: FinancingPlanStatusEnum.PENDING_ACCEPTANCE
                },
                [UserTypeEnum.ENTERPRISE_USER]:{
                    current: FinancingPlanStatusEnum.PENDING_ACCEPTANCE,
                    next: enterpiseUserAprove()
                }
            },
            [FinancingPlanStatusActionsEnum.DECLINE]: {
                [UserTypeEnum.LIBERA_USER]: {
                    current: FinancingPlanStatusEnum.PENDING_APPROVAL,
                    next: FinancingPlanStatusEnum.REJECTED_BY_LIBERA
                },
                [UserTypeEnum.ENTERPRISE_USER]:{
                    current: FinancingPlanStatusEnum.PENDING_ACCEPTANCE,
                    next: FinancingPlanStatusEnum.REJECTED_BY_ENTERPRISE
                }
            }
        };

        if(financingPlan.status !== stateTree[status][user.type].current)
            throw new ConflictException('SFC.LIBERA.381');

        financingPlan.status = stateTree[status][user.type].next;

        if(user.type === UserTypeEnum.LIBERA_USER){
            financingPlan.approvalUser = user;
            financingPlan.approvalDate = moment().tz('UTC').toDate()
        }else if(user.type === UserTypeEnum.ENTERPRISE_USER){
            financingPlan.acceptanceUser = user;
            financingPlan.acceptanceDate = moment().tz('UTC').toDate();
        }

        if(comments){
            financingPlan.comments = comments;
        }            
        
        await FinancingPlanDAO.saveFinancingPlan(financingPlan);
        await EnterpriseUtils.updateFinancialConditions(financingPlan.payer.id);

        if(status === FinancingPlanStatusActionsEnum.APPROVE && user.type === UserTypeEnum.LIBERA_USER){
            const payerEnterprise = await EnterpriseDAO.getEnterpriseById(+financingPlan.payer.id);

            const {email} = payerEnterprise.owner;

            const {enterpriseName} = payerEnterprise;
            

            await SESService.sendTemplatedEmail({
                destinationEmail: email,
                template: SES_SEND_FINANCING_PLAN_APPROVED_NOTIFICATION,
                mergeVariables: {
                    host: HOST,
                    id: financingPlan.payer.id,
                    enterpriseName,
                    s3Bucket: S3_BUCKET_NAME,
                    fileKey,
                }
            });
        }

        if(status === FinancingPlanStatusActionsEnum.DECLINE){
            const {name,firstSurname, secondSurname} = user.userProperties;
            const payerEnterprise = await EnterpriseDAO.getEnterpriseById(+financingPlan.payer.id);
            const {bankRegion} = payerEnterprise;

            const {email} = financingPlan.creationUser;
            const {nit} = payerEnterprise;

            const {enterpriseName} = payerEnterprise;

            let userName = `${name ? name : ''} ${firstSurname ? firstSurname: ''} ${secondSurname ? secondSurname : ''}`;

            if(user.type === UserTypeEnum.LIBERA_USER){
                await SESService.sendTemplatedEmail({
                    destinationEmail: email,
                    template: SES_SEND_FINANCING_PLAN_REJECTED_NOTIFICATION,
                    mergeVariables: {
                        host: HOST,
                        userName,
                        id: financingPlan.payer.id,
                        enterpriseName,
                        s3Bucket: S3_BUCKET_NAME,
                        comments,
                        nit,
                        fileKey
                    }
                });
            }else if(user.type === UserTypeEnum.ENTERPRISE_USER){
                console.log('bankRegion ======> ', bankRegion.id)
                const usersRoles: UserRole[] = await UserRoleDAO.getUserByPermission(PermissionEnum.AUTHORIZE_FINANCING_PLAN, bankRegion.id);

                const emails : string[] = usersRoles.map(user=> user.user.email);

                const {email} = financingPlan.creationUser;

                userName = enterpriseName;

                if(!emails.includes(email))
                    emails.push(email);
                
                await SESService.sendBulkTemplatedEmail({
                    destinationEmails: emails,
                    template: SES_SEND_FINANCING_PLAN_REJECTED_NOTIFICATION,
                    ReplacementTemplateData: JSON.stringify({
                        host: HOST,
                        userName,
                        id: financingPlan.payer.id,
                        enterpriseName,
                        s3Bucket: S3_BUCKET_NAME,
                        comments,
                        nit,
                        fileKey
                    })
                });
            }
        }
        
        console.log('Financing Plan updated', financingPlan);
        console.log('SERVICE: Ending updateStatusFinancingPlan');
        return financingPlan.status;
    }

    static updateFinancingPlansStatus(financingPlan: EnterpriseFinancingPlan): FinancingPlanStatusEnum{
        console.log('SERVICE: Starting updateFinancingPlansStatus');
        console.log('financingPlans to update ==> ', financingPlan);

        const today = moment().startOf('day');
        const validityDate = moment(financingPlan.validityDate).tz('UTC').endOf('day');
        const colombiaHour = moment().tz('America/Bogota');
        // const diffDays = LiberaUtils.getNumberOfDays(today, validityDate);
        const diffDays = moment(validityDate).diff(today, 'days', true);

        console.log('=================================================================================');
        console.log('diffDays --> ', diffDays);
        console.log('colombianHour --> ', colombiaHour);
        console.log('validityDate --> ', validityDate);
        console.log('today --> ', today);
        console.log('colombianHour.hour() --> ', colombiaHour.hour());

        console.log('=================================================================================');
        const colombiaNow = moment().tz('America/Bogota').format('MMMM Do YYYY');
        console.log('colombiaNow --> ', colombiaNow);
        const deadline = moment(financingPlan.validityDate).tz('UTC').format('MMMM Do YYYY');
        console.log('deadline --> ', deadline);
        console.log('=================================================================================');
        colombiaNow === deadline ? console.log('=== Son iguales colombiaNow y deadline ===') : 
                    console.log('*** Son diferentes colombiaNow y deadline ***');
        console.log('=================================================================================');

        let status: FinancingPlanStatusEnum;
        if (diffDays > 15) {
            status = FinancingPlanStatusEnum.CURRENT;
        } else if (diffDays <= 0 || ( diffDays <= 1 && colombiaNow === deadline && colombiaHour.hour() >= 10 )) {
            status = FinancingPlanStatusEnum.EXPIRED;
        } else {
           status = FinancingPlanStatusEnum.ABOUT_TO_EXPIRE; 
        }

        console.log('new status --> ', status);
        console.log('SERVICE: Ending updateFinancingPlansStatus');
        return status;
    }

    static updateFinancingPlansStatusToTimedOut(financingPlan: EnterpriseFinancingPlan): FinancingPlanStatusEnum{
        console.log('SERVICE: Starting updateFinancingPlansStatusToTimedOut');
        console.log('financingPlans to update ==> ', financingPlan);

        const today = moment().tz('UTC').toDate();
        const validityDate = moment(financingPlan.validityDate).tz('UTC').toDate();
        const colombiaHour = moment().tz('America/Bogota').toDate();
        const diffDays = LiberaUtils.getNumberOfDays(today, validityDate);

        let status = FinancingPlanStatusEnum[financingPlan.status];

        if( (diffDays == 1 && moment(colombiaHour).hour() >= 10) || (diffDays < 1) )
            status = FinancingPlanStatusEnum.TIMED_OUT;

        console.log('new status ==> ', status);
        console.log('SERVICE: Ending updateFinancingPlansStatusToTimedOut');
        return status;
    }
}