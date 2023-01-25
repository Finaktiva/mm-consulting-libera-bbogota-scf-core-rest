import _ from 'lodash';
import moment from 'moment';
import { EnterpriseDAO } from "dao/enterprise.dao";
import { ConflictException, BadRequestException, InternalServerException } from "commons/exceptions";
import { EnterpriseInvoiceDAO } from "dao/enterprise-invoice.dao";
import { InvoiceNegotiationProcessDAO } from 'dao/invoice-negotiation-process.dao'
import { DiscountNegotiationsLogBookDAO } from "dao/logging/discount-negotiations-log-book.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { EnterpriseInvoiceBulkDAO } from "dao/enterprise-invoice-bulk.dao";
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";
import { EnterpriseInvoiceFundingProcessDAO } from "dao/enterprise-invoice-funding-process.dao";
import { IQueryFilters } from "commons/interfaces/query-filters.interface";
import { CreateNewFundingRequest } from "commons/interfaces/payer-interfaces/create-new-funding-request.interface";
import { EnterpriseFundingLinkDAO } from "dao/enterprise-funding-link.dao";
import { EnterpriseFundingTransactionsTypeEnum } from "commons/enums/enterprise-funding-transactions-type.enum";
import { EnterpriseFundingTransactionStatusEnum } from "commons/enums/enterprise-funding-transactions-status.enum";
import { EnterpriseInvoiceFundingProcess } from "entities/enterprise-invoice-funding-process";
import { EnterpriseInvoiceFundingProcessStatus } from 'commons/enums/enterprise-invoice-funding-process-status';
import { BPMService } from './bpm.service';
import { IProcessInstance } from 'commons/interfaces/process-instance.interface';
import { SQSMetadata } from 'commons/interfaces/sqs.interface';
import { FundingLogBookRoleEnum } from 'commons/enums/funding-log-book-role.enum';
import { SQSService } from './sqs.service';
import { S3Service } from './s3.service';
import { UserDAO } from 'dao/user.dao';
import { UserStatus } from 'commons/enums/user-status.enum';
import { NegotiationRoleEnum } from "commons/enums/negotiation-role.enum";
import { IGetRecordNegotiation } from "commons/interfaces/get-record-negotiation.interface";
import { EnterpriseInvoiceFilesDAO } from 'dao/enterprise-invoice-files.dao';
import LiberaUtils from 'commons/libera.utils';
import { IRequestQuotaAdjustment } from "commons/interfaces/request-quota-adjustment.interface";
import { EnterpriseQuotaRequest } from "entities/enterprise-quota-request";
import { MeDAO } from "dao/me.dao";
import { EnterpriseQuotaRequestDAO } from "dao/enterprise-quota-request.dao";
import { EnterpriseQuotaRequestStatusEnum } from "commons/enums/enterprise-quota-request-status.enum";
import { EnterpriseQuotaRequestTypeEnum } from "commons/enums/enterprise-quota-request-type.enum";
import { SESService } from "./ses.service";
import { CatModuleEnum } from "commons/enums/cat-module.enum";
import { EnterpriseFundingTransactions } from 'entities/enterprise-funding-transaccions';
import S3Utils from 'commons/s3.utils';
import { EnterpriseInvoiceFiles } from 'entities/enterprise-invoice-files';
import { EnterpriseInvoiceFilesTypeEnum } from 'commons/enums/enterprise-invoice-files-type.enum';
import { S3MetadataService } from './s3-metadata.service';
import { S3MetadataDAO } from 'dao/s3-metadata.dao';
import { RateTypeEnum } from 'commons/enums/rate-type.enum';

const SES_QUOTA_REQUEST_TEMPLATE = process.env.SES_QUOTA_REQUEST_TEMPLATE;
const SES_UPDATE_QUOTA_PAYMENT_TEMPLATE = process.env.SES_UPDATE_QUOTA_PAYMENT_TEMPLATE;
const SES_UPDATE_QUOTA_UPGRADE_TEMPLATE = process.env.SES_UPDATE_QUOTA_UPGRADE_TEMPLATE;
const BPM_PROCESS_DEFINITION_KEY_FUNDING_PROCESS = process.env.BPM_PROCESS_DEFINITION_KEY_FUNDING_PROCESS;
const SQS_LIBERA_ENTERPRISE_INVOICE_FUNDING_QUEUE =  process.env.SQS_LIBERA_ENTERPRISE_INVOICE_FUNDING_QUEUE;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_DOCUMENTATION_FILE_PATH_PREFIX = process.env.S3_DOCUMENTATION_FILE_PATH_PREFIX;
const S3_FILE_PATH_PREFIX = process.env.S3_FILE_PATH_PREFIX;

export class PayerService {

    static async getPayerInvoicesNegociationRecord(enterpriseId: number, invoiceId: number,
        negotiationId: number) {
        console.log('SERVICE: Starting getPayerInvoicesNegociationRecord method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if (!enterprise)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoice = await EnterpriseInvoiceDAO.getInvoiceById(enterprise.id, invoiceId);

        if (!invoice)
            throw new ConflictException('SCF.LIBERA.130', { enterpriseId, invoiceId });

        const negotiation = await InvoiceNegotiationProcessDAO.getInvoiceNegotiationByNegotiationProcessId(negotiationId);

        if(!negotiation)
            throw new ConflictException('SCF.LIBERA.162', {negotiationId});

        if(negotiation.enterpriseInvoice.id != invoice.id)
            throw new ConflictException('SCF.LIBERA.163', { negotiationId, invoiceId});

        
        const discountNegotiationsLogBook = await DiscountNegotiationsLogBookDAO
            .getDiscountNegotiationLogBook(invoiceId, negotiationId);

        if(!discountNegotiationsLogBook)
            throw new ConflictException('SCF.LIBERA.166', { invoiceId, negotiationId});
        
        let logBook = discountNegotiationsLogBook.logBook;
        const logBookArr: IGetRecordNegotiation[] =[]

        for(let logBook of discountNegotiationsLogBook.logBook) {
                logBookArr.push({
                    enterpriseName: logBook.negotiationRole == NegotiationRoleEnum.PAYER ? discountNegotiationsLogBook.payerEnterprise.name : discountNegotiationsLogBook.providerEnterprise.name,
                    negotiationRole: logBook.negotiationRole,
                    eventDate: logBook.eventDate,
                    eventType: logBook.eventType,
                    discountType: logBook.discountType,
                    discountPercentage: logBook.discountPercentage,
                    discountDueDate: logBook.discountDueDate,
                    expectedPaymentDate: logBook.expectedPaymentDate,
                    discountValue: logBook.discountValue
                });
        }        
        console.log('logBookArr', logBookArr);
        console.log('SERVICE: Ending getPayerInvoicesNegociationRecord method');
        return _.orderBy(logBookArr, ['eventDate'], ['desc']);
    }

    static async getInvoiceBulkLoadDetail(enterpriseId: number, invoiceBulkId: number) {
        console.log('SERVICE: Starting getInvoiceBulkLoadDetail');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if(!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', {enterpriseId});
        
        const invoiceBulk = await EnterpriseInvoiceBulkDAO.getByInvoiceBulkIdAndEnterpriseId(invoiceBulkId, enterpriseId);
        if(!invoiceBulk)
            throw new ConflictException('SCF.LIBERA.175', {invoiceBulkId});
    
        console.log('SERVICE: Ending getInvoiceBulkLoadDetail');

        return {
            id: invoiceBulk.id,
            filename: invoiceBulk.s3Metadata.filename,
            status: invoiceBulk.status,
            folio: invoiceBulk.folioNumber,
            creationDate: invoiceBulk.creationDate,
            creationUser: invoiceBulk.creationUser,
            totalCount: invoiceBulk.initialLoadCount,
            successCount: invoiceBulk.successfulLoadedCount,
            errorCount: invoiceBulk.errorLoadedCount
        }        
    }

    static async getInvoiceFundingRequest(enterpriseId: number, invoiceId: number, params: IQueryFilters) {
        console.log('SERVICE: Starting getInvoiceFundingRequest method...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseIdAndId(enterpriseId, invoiceId);
        if(!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });

        if(invoice && !invoice.lender) throw new ConflictException('SCF.LIBERA.150', { invoiceId });

        if (params.size && +params.size == 0) return { invoiceFundingProcess: [], total: 0 };
        const result = await EnterpriseInvoiceFundingProcessDAO.getAllInvoiceFundingProcess(enterpriseId, invoiceId, params);
        

        if(!result[0] || !result[0].length)
            throw new ConflictException('SCF.LIBERA.177', { invoiceId });

        console.log('SERVICE: Ending getInvoiceFundingRequest method...');
        
        const invoiceFundingProcess = result[0].map(item => ({
            id: item.fundingProcess,
            amount: item.enterpriseInvoice.amount,
            discountValue: item.enterpriseInvoice && item.enterpriseInvoice.currentAmount ? item.enterpriseInvoice.currentAmount : item.enterpriseInvoice.amount,
            expectedPaymentDate: item.enterpriseInvoice.currentExpectedPaymentDate,
            creationDate: item.creationDate,
            finishDate: item.finishedDate,
            lender: item.lender.enterpriseName,
            status: item.status
        }));

        return { invoiceFundingProcess, total: params.size? result[0].length : result[1] }
    }

    static async createNewFundingRequest(enterpriseId: number, invoiceId: number, data: CreateNewFundingRequest, userId: number) {
        console.log('SERVICE: Starting createNewFundingRequest');
        const { contentType, filename, lenderId, paymentInstructions } = data;
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const user = await UserDAO.getBasicUserById(userId);
        if(!user || user.status == UserStatus.DELETED)
            throw new ConflictException('SCF.LIBERA.56', {userId});

        const lender = await EnterpriseDAO.getBasicEnterpriseById(lenderId);
        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const invoice = await EnterpriseInvoiceDAO.getInvoiceByEnterpriseAndIdAvailable(invoiceId, enterpriseId);
        if (!invoice)
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });
        
        const enterpriseFundingLink = await EnterpriseFundingLinkDAO.getLinkByLenderIdAndPayerId(enterpriseId, lenderId);
        if (!enterpriseFundingLink)
            throw new ConflictException('SCF.LIBERA.181');

        const newInvoice = _.clone(invoice);

        try {
            newInvoice.lender = lender;
            await EnterpriseInvoiceDAO.saveInvoice(newInvoice);
        } catch (errors) {
            await EnterpriseInvoiceDAO.saveInvoice(invoice);
            throw new InternalServerException('SCF.LIBERA.COMMONS.500', { errors });
        }

        let paymentCount: number = 0;
        let withDrawCount: number = 0;
        let balance: number = null;
        let generalBalance: number = null;

        for (let transaction of enterpriseFundingLink.enterpriseFundingTransactions) {
            console.log('Transaction_LOOP');
            switch (transaction.transactionType) {
                case EnterpriseFundingTransactionsTypeEnum.PAYMENT:
                    if (transaction.status == EnterpriseFundingTransactionStatusEnum.APPROVED)
                        paymentCount += transaction.amount;
                    break;
                case EnterpriseFundingTransactionsTypeEnum.WITHDRAW:
                    if (transaction.status == EnterpriseFundingTransactionStatusEnum.PENDING_APPROVAL || transaction.status == EnterpriseFundingTransactionStatusEnum.APPROVED)
                        withDrawCount += transaction.amount;
                    break;
            }
        }
        console.log(`PAYMENT = ${paymentCount}`);
        console.log(`WITHDRAW = ${withDrawCount}`);

        balance = paymentCount - withDrawCount;

        console.log(`BALANCE = ${balance}`);

        generalBalance = enterpriseFundingLink.totalFundingAmount - balance - invoice.amount;

        if (generalBalance <= 0) throw new BadRequestException('SCF.LIBERA.182');

        console.log('Funding Creation Process');
        const enterpriseFundingProcess = new EnterpriseInvoiceFundingProcess();
        enterpriseFundingProcess.creationDate = moment(moment.now(), 'x').toDate();
        enterpriseFundingProcess.enterpriseInvoice = invoice;
        enterpriseFundingProcess.lender = lender;
        enterpriseFundingProcess.status = EnterpriseInvoiceFundingProcessStatus.PENDING_LENDER_PAYMENT_CONFIRMATION;
        enterpriseFundingProcess.creationUser = user;

        let fundingRequest = await EnterpriseInvoiceFundingProcess.save(enterpriseFundingProcess);
        newInvoice.status = EnterpriseInvoiceStatusEnum.FUNDING_IN_PROGRESS;
        newInvoice.paymentSpecifications = paymentInstructions ? paymentInstructions : null;
        let newInvoiceFiles: EnterpriseInvoiceFiles = null;

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
            let saveFiles: EnterpriseInvoiceFiles;
            const metadata = { bucket, filename, fileKey: fromDir };
            const files = new EnterpriseInvoiceFiles();
            files.enterpriseInvoice = invoice;
            files.type = EnterpriseInvoiceFilesTypeEnum.PAYMENT_SPECIFICATIONS;
            files.creationDate = moment(moment.now(), 'x').toDate();
            files.creationUser = user;

            let savedMetadata;
            try {
                savedMetadata = await S3MetadataService.createS3Metadata(metadata);
                files.s3Metadata = savedMetadata;
                saveFiles = await EnterpriseInvoiceFilesDAO.saveFiles(files);
            } catch (errors) {
                await EnterpriseInvoiceFilesDAO.deleteInvoiceFiles(files);
                await S3MetadataDAO.delete(savedMetadata);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
            }

            const invoiceFiles = await EnterpriseInvoiceFilesDAO.getInvoiceFilesByInvoiceId(invoiceId);
            if (!invoiceFiles)
                throw new ConflictException('SCF.LIBERA.202');
            console.log('invoiceFiles --->>>', invoiceFiles);


            newInvoiceFiles = _.clone(saveFiles)

            for (let invoiceFile of invoiceFiles) {
                console.log('Files_LOOP');
                console.log('Content-type ', contentType);
                console.log('Filename ', filename);
                const fromDir = invoiceFile && invoiceFile.s3Metadata.filename == filename ? invoiceFile.s3Metadata.fileKey : null;
                const toDir = S3_DOCUMENTATION_FILE_PATH_PREFIX.replace('{enterpriseId}', enterpriseId.toString()).concat(filename);
                if (fromDir)
                    await S3Service.moveFile(S3_BUCKET_NAME, fromDir, toDir);
            }
            // enterpriseFundingProcess.invoiceFiles = invoiceFiles;
            newInvoiceFiles.invoiceFundingProcess = fundingRequest;            
            await EnterpriseInvoiceFilesDAO.saveFiles(newInvoiceFiles);
        }

        // await EnterpriseInvoiceFundingProcessDAO.saveFundingProcess(enterpriseFundingProcess);
        const processInstance: IProcessInstance = {
            processDefinitionKey: BPM_PROCESS_DEFINITION_KEY_FUNDING_PROCESS,
            variables: [
                {
                    name: 'fundingRequestId',
                    value: enterpriseFundingProcess.fundingProcess.toString()
                },
                {
                    name: 'invoiceId',
                    value: invoiceId.toString()
                }
            ]
        };
        console.log('processInstace', processInstance);

        const sqsMetadata: SQSMetadata = {
            sqsUrl: SQS_LIBERA_ENTERPRISE_INVOICE_FUNDING_QUEUE,
            body: {
                fundingRequestId: enterpriseFundingProcess.fundingProcess,
                userId,
                fundingRole: FundingLogBookRoleEnum.LENDER,
                eventDate: moment(moment.now(), 'x').toDate(),
                typeEvent: enterpriseFundingProcess.status
            }
        }

        console.log('sqsMetadata', sqsMetadata);

        await EnterpriseInvoiceDAO.saveInvoice(newInvoice);
        try {
            const result = await BPMService.runProcessInstance(processInstance);
            console.log(result);
            const { id } = result;
            await SQSService.sendMessage(sqsMetadata);
            const eFundingProcess = await EnterpriseInvoiceFundingProcessDAO.getInvoiceFundingProcessById(enterpriseFundingProcess.fundingProcess);
            eFundingProcess.bpmProcessInstance = +id;
            await EnterpriseInvoiceFundingProcessDAO.saveFundingProcess(eFundingProcess);
        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            await EnterpriseInvoiceFundingProcessDAO.deleteFundingProcess(enterpriseFundingProcess);
            await EnterpriseInvoiceDAO.saveInvoice(invoice);
            throw new InternalServerException('SCF.LIBERA.COMMONS.500', { errors });
        }

        console.log('SERVICE: Ending createNewFundingRequest');

        return { 
            id: enterpriseFundingProcess.fundingProcess,
            amount: invoice.amount,
            discountValue: LiberaUtils.calculateDiscountValue(invoice.currentDiscountPercentage, invoice.currentAmount),
            expectedPaymentDate: invoice.currentExpectedPaymentDate,
            creationDate: moment(moment.now(), 'x').toDate(),
            finishDate: enterpriseFundingProcess.finishedDate ? enterpriseFundingProcess.finishedDate : null,
            lender: lender.enterpriseName,
            status: enterpriseFundingProcess.status
        }

    }
    static async createQuotaRequest(enterpriseId: number, lenderId: number, userId: number, quota: number, comments: string) {
        console.log('SERVICE: Starting createQuotaRequest method');

        const enterprise = await EnterpriseDAO.getEnterpriseWithModulesAndRoles(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED || enterprise.status == EnterpriseStatusEnum.REJECTED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        if(!enterprise.enterpriseModules.find(eModule => eModule.catModule.name == CatModuleEnum.PAYER))
        throw new ConflictException('SCF.LIBERA.203', { enterpriseId });

        const lender = await EnterpriseDAO.getEnterpriseWithModulesAndRoles(lenderId);
        if (!lender || lender.status == EnterpriseStatusEnum.DELETED || lender.status == EnterpriseStatusEnum.REJECTED)
            throw new ConflictException('SCF.LIBERA.201', { lenderId });
        if(!lender.enterpriseModules.find(eModule => eModule.catModule.name == CatModuleEnum.FUNDING))
            throw new ConflictException('SCF.LIBERA.204', {lenderId});

        const user = await UserDAO.getBasicUserById(userId);

        let saveQuotaRequest: EnterpriseQuotaRequest;
        
            saveQuotaRequest = new EnterpriseQuotaRequest;
            saveQuotaRequest.payer = enterprise;
            saveQuotaRequest.lender = lender;
            saveQuotaRequest.creationDate = moment(moment.now(), 'x').toDate();
            saveQuotaRequest.creationUser = user;
            saveQuotaRequest.updateDate = null;
            saveQuotaRequest.updateUser = null;
            saveQuotaRequest.status = EnterpriseQuotaRequestStatusEnum.PENDING_LENDER_APPROVAL;
            saveQuotaRequest.rateType = null;
            saveQuotaRequest.rateType = null;
            saveQuotaRequest.payerComments = comments ? comments : null;
            saveQuotaRequest.lenderComments = null;
            saveQuotaRequest.quotaRequestType = EnterpriseQuotaRequestTypeEnum.NEW_FUNDING;
            saveQuotaRequest.approvalUser = null;
            saveQuotaRequest.approvalDate = null;
            saveQuotaRequest.payerRequestAmount = +quota;
            saveQuotaRequest.lenderGrantedAmount = null;
            saveQuotaRequest.enterpriseFundingTransaction = null;

        try {
            await EnterpriseQuotaRequestDAO.saveQuotaRequest(saveQuotaRequest);
        } catch (errors) {
            console.log('SERVICE ERROR', errors);
            await EnterpriseQuotaRequestDAO.rollbackCreateQuotaReques(saveQuotaRequest.id);                
        }
        console.log('saveQuotaRequest', saveQuotaRequest);
        try {
            const result = {
                id: +saveQuotaRequest.id,
                lender: {
                    id: +lender.id,
                    enterpriseName: lender.enterpriseName,
                    nit: lender.nit
                },
                requestedQuota: +quota,
                grantedQuota: null,
                rateType: null,
                rate: saveQuotaRequest.ratePercentage,
                creationDate: saveQuotaRequest.creationDate,
                requestType: saveQuotaRequest.quotaRequestType,
                payerComments: saveQuotaRequest.payerComments,
                lenderComments: null,
                status: saveQuotaRequest.status
            }

            await SESService.sendTemplatedEmail({
                template: SES_QUOTA_REQUEST_TEMPLATE,
                destinationEmail: lender.owner.email, 
                mergeVariables: {
                    lenderEnterpriseName: lender.enterpriseName, 
                    payerEnterpriseName: enterprise.enterpriseName,
                    requestedAmount: saveQuotaRequest.payerRequestAmount
                }
            }); 
            console.log('SERVICE: Ending createQuotaRequest method');
            return result;
        }
        catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            await EnterpriseQuotaRequestDAO.rollbackCreateQuotaReques(saveQuotaRequest.id);
        }
    }

    static async requestQuotaAdjustment(userId: number, payerId: number, lenderId: number, body: IRequestQuotaAdjustment) {

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(payerId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { payerId });

        const lender = await EnterpriseDAO.getLenderById(lenderId);
        if (!lender || lender.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.151', { enterpriseId: lenderId });

        const fundingLinkPayer = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payerId);
        if(!fundingLinkPayer)
            throw new ConflictException('SCF.LIBERA.219', { lenderId, payerId });
        
        const rateType: string = fundingLinkPayer.rateType.toString();
        const quotaRequestRateTypeEnum: RateTypeEnum = RateTypeEnum[rateType];

        const user = await MeDAO.getMeById(userId);
        let transaccion : EnterpriseFundingTransactions= null;
        
        if (body.type == 'PAYMENT'){
            const enterpriseFundingTransaction = new EnterpriseFundingTransactions();
            enterpriseFundingTransaction.creationDate = moment(moment.now(), 'x').toDate();
            enterpriseFundingTransaction.creationUser = user;
            enterpriseFundingTransaction.transactionType = EnterpriseFundingTransactionsTypeEnum.PAYMENT;
            enterpriseFundingTransaction.status = EnterpriseFundingTransactionStatusEnum.PENDING_APPROVAL;
            enterpriseFundingTransaction.amount = body.quota;
            enterpriseFundingTransaction.lenderComments = body.comments ? body.comments : null;
            enterpriseFundingTransaction.enterpriseFundingLink = fundingLinkPayer;
            transaccion = await EnterpriseFundingTransactions.save(enterpriseFundingTransaction);
            console.log("transaccion --> ", transaccion);
        }

        const enterpriseQuotaRequest = new EnterpriseQuotaRequest();
        enterpriseQuotaRequest.payer = enterprise;
        enterpriseQuotaRequest.lender = lender;
        enterpriseQuotaRequest.creationDate = moment(moment.now(), 'x').toDate();
        enterpriseQuotaRequest.creationUser = user;
        enterpriseQuotaRequest.status = EnterpriseQuotaRequestStatusEnum.PENDING_LENDER_APPROVAL;
        enterpriseQuotaRequest.payerComments = body.comments ? body.comments : null;
        enterpriseQuotaRequest.quotaRequestType = body.type;
        enterpriseQuotaRequest.ratePercentage = body.type == EnterpriseQuotaRequestTypeEnum.PAYMENT ? fundingLinkPayer.ratePercentage : null;
        enterpriseQuotaRequest.rateType = body.type == EnterpriseQuotaRequestTypeEnum.PAYMENT ? quotaRequestRateTypeEnum : null;
        enterpriseQuotaRequest.payerRequestAmount = body.quota;
        enterpriseQuotaRequest.enterpriseFundingTransaction = transaccion;

        try {
            
            await EnterpriseQuotaRequestDAO.createEntepriseQuotaRequest(enterpriseQuotaRequest);
            console.log('EnterpriseQuotaRequest Create -->');
    
            await SESService.sendTemplatedEmail({
                template: body.type == EnterpriseQuotaRequestTypeEnum.PAYMENT ? SES_UPDATE_QUOTA_PAYMENT_TEMPLATE : SES_UPDATE_QUOTA_UPGRADE_TEMPLATE ,
                destinationEmail: lender.owner.email,
                mergeVariables: {
                    lenderEnterpriseName: lender.enterpriseName, 
                    payerEnterpriseName: enterprise.enterpriseName,
                    requestAmount: body.quota
                }
            });

        } catch (errors) {
            console.log('SERVICE ERROR', errors);
            await EnterpriseQuotaRequestDAO.rollbackCreateQuotaReques(enterpriseQuotaRequest.id);
        }
        
    }

}