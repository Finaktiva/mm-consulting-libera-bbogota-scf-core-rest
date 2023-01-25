import _  from 'lodash';
import moment from 'moment';
import { ConfirmPayment } from "commons/interfaces/lender-interfaces/confirm-payment.interface";
import { EnterpriseDAO } from "dao/enterprise.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ConflictException, InternalServerException, BadRequestException } from "commons/exceptions";
import { EnterpriseInvoiceFundingProcessDAO } from "dao/enterprise-funding-process.dao";
import { EnterpriseInvoiceFundingProcessStatus } from "commons/enums/enterprise-invoice-funding-process-status";
import { ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { BPMService } from './bpm.service';
import { S3Service } from './s3.service';
import { SQSMetadata } from 'commons/interfaces/sqs.interface';
import { SQSService } from './sqs.service';
import { EnterpriseInvoiceFilesDAO } from 'dao/enterprise-invoice-files.dao';
import { EnterpriseInvoiceDAO } from 'dao/enterprise-invoice.dao';
import { EnterpriseInvoiceStatusEnum } from 'commons/enums/enterprise-invoice-status.enum';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { RoleEnum } from 'commons/enums/role.enum';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { EnterpriseFundingLinkStatusEnum } from 'commons/enums/enterprise-funding-link-status.enum';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import { EnterpriseInvoiceFundingProcess } from 'entities/enterprise-invoice-funding-process';
import S3Utils from 'commons/s3.utils';
import { EnterpriseInvoiceFiles } from 'entities/enterprise-invoice-files';
import { EnterpriseInvoiceFilesTypeEnum } from 'commons/enums/enterprise-invoice-files-type.enum';
import { UserDAO } from 'dao/user.dao';
import { UserStatus } from 'commons/enums/user-status.enum';
import { S3MetadataService } from './s3-metadata.service';
import { S3MetadataDAO } from 'dao/s3-metadata.dao';
import { LogBook } from 'entities/logging/log-book';
import { FundingLogBookEventTypeEnum } from 'commons/enums/funding-log-book-event-type.enum';

const BPM_LENDER_PAYMENT_CONFIRMATION = process.env.BPM_LENDER_PAYMENT_CONFIRMATION;
const BPM_LENDER_PAYMENT_REJECTION = process.env.BPM_LENDER_PAYMENT_REJECTION;
const S3_FILE_PATH_PREFIX = process.env.S3_FILE_PATH_PREFIX;
const SQS_LIBERA_ENTERPRISE_FUNDING_QUEUE = process.env.SQS_LIBERA_ENTERPRISE_FUNDING_QUEUE;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export class LenderService {
    static async confirmPayment(enterpriseId: number, requestId: number, data: ConfirmPayment, userId: number) {
        console.log('SERVICE: Starting confirmPayment');

        const { comments, effectivePaymentAmount, status, effectivePaymentDate, filename } = data;

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const fundingProcess = await EnterpriseInvoiceFundingProcessDAO.getSimpleProccessById(requestId, enterpriseId);
        if (!fundingProcess) throw new ConflictException('SCF.LIBERA.178', { processId: requestId, lenderId: enterpriseId });

        const user = await UserDAO.getBasicUserById(userId);
        if(!user || user.status == UserStatus.DELETED)
            throw new ConflictException('SCF.LIBERA.56', {userId});
            
        let fundingProcessCopy = _.clone(fundingProcess);
        console.log('FundingProcess ', fundingProcess);

        const bpmMessage: ISpecificProcessInstance = {
            processInstanceId: fundingProcess.bpmProcessInstance.toString(),
            event_id: null,
            reply: {userId}
        }
        console.log('BPM-Message --- ', bpmMessage);
        const sqsMessage: SQSMetadata = {
            sqsUrl: SQS_LIBERA_ENTERPRISE_FUNDING_QUEUE,
            body: null
        }
        let saveFiles;      
        console.log('SQS-Message --- ', sqsMessage);
        try {
            switch (status) {
                case 'ACCEPTED':
                    console.log('Case: ACCEPTED');
                    fundingProcessCopy.status = EnterpriseInvoiceFundingProcessStatus.PENDING_PROVIDER_PAYMENT_CONFIRMATION;
                    fundingProcessCopy.lenderEffectivePaymentAmount = effectivePaymentAmount;
                    fundingProcessCopy.lenderPaymentConfirmComments = comments ? comments : null;
                    fundingProcessCopy.lenderEffectivePaymentDate = effectivePaymentDate;
                    fundingProcessCopy.lenderConfirmationDate = moment(moment.now(), 'x').toDate();
                    bpmMessage.event_id = BPM_LENDER_PAYMENT_CONFIRMATION;
                    sqsMessage.body = {
                        fundingRequestId: fundingProcess.fundingProcess,
                        userId,
                        fundingRole: 'LENDER',
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: fundingProcessCopy.status
                    }

                    if(filename) {
                        const bucket = S3_BUCKET_NAME;
                        console.log("filename before", filename);
                        const encodedFileName = S3Utils.cleanS3Filename(filename);
                        console.log('encodedFileName', encodedFileName);
                        console.log("filename after", filename);
                        const fromDir = S3_FILE_PATH_PREFIX
                            .replace('{enterpriseId}', enterpriseId.toString())
                            .concat(S3Utils.s3UrlEncode(encodedFileName));

                        try {
                            await S3Service.getObjectFile({ bucket, filekey: fromDir });
                        } catch (error) {
                            console.log('ERROR: ', error);
                            throw new ConflictException('SCF.LIBERA.176', { filename });
                        }
                        const metadata = { bucket, filename, fileKey: fromDir };
                        const files = new EnterpriseInvoiceFiles();
                        files.enterpriseInvoice = fundingProcessCopy.enterpriseInvoice;
                        files.type = EnterpriseInvoiceFilesTypeEnum.PAYMENT_CONFIRMATION_EVIDENCE;
                        files.creationDate = moment(moment.now(), 'x').toDate();
                        files.creationUser = user;
                        files.invoiceFundingProcess = fundingProcess;

                        let savedMetadata;
                        try {
                            savedMetadata = await S3MetadataService.createS3Metadata(metadata);
                            files.s3Metadata = savedMetadata;
                            saveFiles = await EnterpriseInvoiceFilesDAO.saveFiles(files);
                            console.log('saveFiles FINAL', saveFiles);
                            
                        } catch (errors) {
                            await EnterpriseInvoiceFilesDAO.deleteInvoiceFiles(files);
                            await S3MetadataDAO.delete(savedMetadata);
                            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                        }
                    }
                    
                    await BPMService.runSpecificProcessInstance(bpmMessage);
                    await SQSService.sendMessage(sqsMessage);
                    await EnterpriseInvoiceFundingProcess.save(fundingProcessCopy);
                        
                    break;
                case 'REJECTED':
                    console.log('Case: REJECTED');
                    fundingProcessCopy.status = EnterpriseInvoiceFundingProcessStatus.REJECTED;
                    fundingProcessCopy.lenderRejectionDate = moment(moment.now(), 'x').toDate();
                    fundingProcessCopy.lenderRejectionComments = comments;
                    fundingProcessCopy.finishedDate = moment(moment.now(), 'x').toDate();
                    bpmMessage.event_id = BPM_LENDER_PAYMENT_REJECTION;
                    sqsMessage.body = {
                        fundingRequestId: fundingProcess.fundingProcess,
                        userId,
                        fundingRole: 'LENDER',
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: FundingLogBookEventTypeEnum.LENDER_PAYMENT_REJECTED
                    }
                    await BPMService.runSpecificProcessInstance(bpmMessage);
                    await EnterpriseInvoiceFundingProcess.save(fundingProcessCopy);
                    break;
            }

        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            await EnterpriseInvoiceFundingProcessDAO.saveFundingProcess(fundingProcess);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        console.log('SERVICE: Ending confirmPayment');
    }

    static async updateInvoiceLender(enterpriseId: number, invoiceId: number, lenderId: number) {
        console.log('SERVICE: Starting updateInvoiceLender');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseIdAndId(enterpriseId, invoiceId);
        if(!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.127', { invoiceId, enterpriseId });
        
        console.log(lenderId);
        const lender = await EnterpriseDAO.getEnterpriseWithModulesAndRoles(lenderId);
        console.log(lender.owner);
        if(!lender || lender && lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.238', { lenderId });   
        if(lender && !lender.enterpriseModules.filter(eModule => eModule.catModule.name == CatModuleEnum.FUNDING) && !lender.owner.userRoles.filter(uRole => uRole.role.name == RoleEnum.ENTERPRISE_FUNDING_ADMIN))
            throw new ConflictException('SCF.LIBERA.239', { lenderId });
        const eLink = await EnterpriseFundingLinkDAO.getRequestByEnterpriseIdAndLinkedId(enterpriseId, lenderId);
        if(!eLink || eLink.status != EnterpriseFundingLinkStatusEnum.ENABLED)
            throw new ConflictException('SCF.LIBERA.240', { lenderId, enterpriseId });
        
        invoice.lender = lender;

        const savedInvoice = await EnterpriseInvoiceDAO.saveInvoice(invoice);

        const result = {
            id: +savedInvoice.lender.id,
            enterpriseName: savedInvoice.lender.enterpriseName,
            nit: savedInvoice.lender.nit,
            owner: savedInvoice.lender.owner ? {
                id: +savedInvoice.lender.owner.id,
                name: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.name : null,
                firstSurname: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.firstSurname : null,
                secondSurname: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.secondSurname : null,
                email: savedInvoice.lender.owner ? savedInvoice.lender.owner.email : null,
            } : null
        };
        console.log('SERVICE: Ending updateInvoiceLender');    
        return result;    
    }    
}