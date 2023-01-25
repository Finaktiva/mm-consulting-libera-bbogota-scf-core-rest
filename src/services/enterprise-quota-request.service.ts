import _ from 'lodash';
import moment from 'moment';
import { BasicFilter, QuotaRequestFilterBy } from "commons/filter";
import { EnterpriseDAO } from "dao/enterprise.dao";
import { ConflictException, BadRequestException } from "commons/exceptions";
import { EnterpriseQuotaRequestDAO } from "dao/enterprise-quota-request.dao";
import { IQuotaRequest } from "commons/interfaces/quota-request.interface";
import { EnterpriseQuotaRequestStatusEnum } from "commons/enums/enterprise-quota-request-status.enum";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ILenderUpdateQuotaRequest } from "commons/interfaces/lender-update-quota-request.interface";
import { parseRateType, RateTypeEnum } from "commons/enums/rate-type.enum";
import { EnterpriseQuotaRequestTypeEnum } from "commons/enums/enterprise-quota-request-type.enum";
import { UserDAO } from 'dao/user.dao';
import { EnterpriseFundingTransactionsDAO } from "dao/enterprise-funding-transactions.dao";
import { EnterpriseFundingTransactionStatusEnum } from "commons/enums/enterprise-funding-transactions-status.enum";
import { SESService } from "./ses.service";
import { EnterpriseFundingLink } from 'entities/enterprise-funding-link';
import { EnterpriseFundingLinkStatusEnum } from 'commons/enums/enterprise-funding-link-status.enum';
import { EnterpriseFundingLinkRateType } from 'commons/enums/enterprise-funding-link-rate-type.enum';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import EmailTextParser from 'commons/libera-email-text-parser';
import CoreTransacctionManager from 'commons/transaction.manager';
import { EnterpriseFundingTransactions } from 'entities/enterprise-funding-transaccions';

const SES_QUOTA_REQUEST_REJECTED_TEMPLATE = process.env.SES_QUOTA_REQUEST_REJECTED_TEMPLATE;
const SES_QUOTA_REQUEST_APPROVED_TEMPLATE = process.env.SES_QUOTA_REQUEST_APPROVED_TEMPLATE;
const SES_QUOTA_ASIGNMENT_TEMPLATE = process.env.SES_QUOTA_ASIGNMENT_TEMPLATE;

export class EnterpriseQuotaRequestService {

    static async getQuotaRequests(enterpriseId: number, filter: BasicFilter<QuotaRequestFilterBy, string>) {
        console.log('SERVICE: Starting getQuotaRequests method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if(!enterprise)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const quotaRequestsPage = await EnterpriseQuotaRequestDAO.getQuotaRequests(enterpriseId, filter);

        if(!quotaRequestsPage[0].length)
            return { totalQuotaRequests: 0, quotaRequests: []}

        const totalQuotaRequests = quotaRequestsPage[1];
        const quotaRequests: IQuotaRequest[]  = quotaRequestsPage[0].map(({id, creationDate, lenderGrantedAmount, 
                lender, lenderComments, payerComments, ratePercentage, rateType, quotaRequestType, payerRequestAmount, status}) => {
            const quotaRequest: IQuotaRequest = {
                id,
                creationDate,
                grantedQuota: +lenderGrantedAmount,
                lender: {
                    id: lender.id,
                    nit: lender.nit,
                    enterpriseName: lender.enterpriseName
                },
                lenderComments,
                payerComments,
                rate: ratePercentage,
                rateType,
                requestType: quotaRequestType,
                requestedQuota: +payerRequestAmount,
                status
            };
            return quotaRequest;
        });
        console.log('SERVICE: Ending getQuotaRequests method');
        return { totalQuotaRequests, quotaRequests}
    }

    static async getLenderQuotaRequests(lenderId: number, filter: BasicFilter<QuotaRequestFilterBy, string>) {
        console.log('SERVICE: Starting getLenderQuotaRequests method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(lenderId);

        if(!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const quotaRequestsPage = await EnterpriseQuotaRequestDAO.getLenderQuotaRequests(lenderId, filter);

        if(!quotaRequestsPage[0].length)
            return { totalQuotaRequests: 0, quotaRequests: []}

        const totalQuotaRequests = quotaRequestsPage[1];
        const quotaRequests: IQuotaRequest[]  = quotaRequestsPage[0].map(({id, creationDate, lenderGrantedAmount, 
                payer, lenderComments, payerComments, ratePercentage, rateType, quotaRequestType, payerRequestAmount, status}) => {
            const quotaRequest: IQuotaRequest = {
                id,
                creationDate,
                grantedQuota: +lenderGrantedAmount,
                payer: {
                    id: payer.id,
                    nit: payer.nit,
                    enterpriseName: payer.enterpriseName
                },
                lenderComments,
                payerComments,
                rate: ratePercentage,
                rateType,
                requestType: quotaRequestType,
                requestedQuota: payerRequestAmount,
                status
            };
            return quotaRequest;
        });
        console.log('SERVICE: Ending getLenderQuotaRequests method');
        return { totalQuotaRequests, quotaRequests}
    }
    
    /**
     * @description Updates quota request, if it is new funding them just finishes the linking process
     * @param  {number} payerId
     * @param  {number} quotaRequestId
     * @param  {EnterpriseQuotaRequestStatusEnum} status
     * @param  {number} userId
     * @author penriquez
     * @author oramirez
     * @author festrada
     */
    static async updateQuotaRequestStatus(payerId: number, quotaRequestId: number, status: EnterpriseQuotaRequestStatusEnum, userId: number): Promise<void> {
        console.log('SERVICE: Starting updateQuotaRequestStatus method');
        const enterprise = await EnterpriseDAO.getEnterpriseById(payerId);
        const updateUser = await UserDAO.getBasicUserById(userId);

        if(!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: payerId });

        const quotaRequest = await EnterpriseQuotaRequestDAO.getById(quotaRequestId);

        if (!quotaRequest)
            throw new ConflictException('SCF.LIBERA.192', { quotaRequestId });

        if (quotaRequest.payer.id != enterprise.id)
            throw new ConflictException('SCF.LIBERA.193', { quotaRequestId, payerId });

        const lenderId: number = quotaRequest.lender.id;
        quotaRequest.status = status;
        if (status == EnterpriseQuotaRequestStatusEnum.APPROVED) {
            quotaRequest.approvalUser = updateUser;
            quotaRequest.approvalDate = moment(moment.now(), 'x').toDate();
        }

        let fundingLink: EnterpriseFundingLink = await EnterpriseFundingLinkDAO.getByLenderIdAndPayerId(lenderId, payerId);
        let transaction: EnterpriseFundingTransactions;

        if (status == EnterpriseQuotaRequestStatusEnum.APPROVED) {
            switch (quotaRequest.quotaRequestType) {
                case EnterpriseQuotaRequestTypeEnum.NEW_FUNDING:
                    console.log('NEW FOUNDING >>>');
                    /**
                     * When new funding is made, creates the record on ENTERPRISE_FUNDING_LINK
                     * Indicating it a new relationship between lender and payer.
                     */
                    fundingLink = new EnterpriseFundingLink();
                    fundingLink.payer = quotaRequest.payer;
                    fundingLink.lender = quotaRequest.lender;
                    fundingLink.creationDate = moment(moment.now(), 'x').toDate();
                    fundingLink.creationUser = updateUser;
                    fundingLink.updateDate = moment(moment.now(), 'x').toDate();
                    fundingLink.updateUser = updateUser;
                    fundingLink.status = status == EnterpriseQuotaRequestStatusEnum.APPROVED ? EnterpriseFundingLinkStatusEnum.ENABLED :
                        status == EnterpriseQuotaRequestStatusEnum.REJECTED ? EnterpriseFundingLinkStatusEnum.REJECTED :
                            status == EnterpriseQuotaRequestStatusEnum.PENDING_LENDER_APPROVAL ? EnterpriseFundingLinkStatusEnum.PENDING_LENDER_APPROVAL :
                                EnterpriseFundingLinkStatusEnum.PENDING_PAYER_APPROVAL;
                    fundingLink.linkDate = moment(moment.now(), 'x').toDate();
                    fundingLink.rateType = quotaRequest.rateType == RateTypeEnum.ADVANCE_MONTH_RATE ? EnterpriseFundingLinkRateType.ADVANCE_MONTH_RATE :
                        quotaRequest.rateType == RateTypeEnum.ANNUAL_RATE ? EnterpriseFundingLinkRateType.ANNUAL_RATE :
                            quotaRequest.rateType == RateTypeEnum.DUE_MONTH_RATE ? EnterpriseFundingLinkRateType.DUE_MONTH_RATE :
                                quotaRequest.rateType == RateTypeEnum.FIXED_RATE ? EnterpriseFundingLinkRateType.FIXED_RATE :
                                    quotaRequest.rateType == RateTypeEnum.PREFERENTIAL_RATE ? EnterpriseFundingLinkRateType.PREFERENTIAL_RATE :
                                        EnterpriseFundingLinkRateType.VARIABLE_RATE;
                    fundingLink.ratePercentage = quotaRequest.ratePercentage;
                    fundingLink.totalFundingAmount = quotaRequest.lenderGrantedAmount;
                    break;
                case EnterpriseQuotaRequestTypeEnum.AMOUNT_UPGRADE:
                    const fundingLinkRateTypeEnum: EnterpriseFundingLinkRateType = EnterpriseFundingLinkRateType[quotaRequest.rateType.toString()];
                    fundingLink.rateType = fundingLinkRateTypeEnum;
                    fundingLink.ratePercentage = quotaRequest.ratePercentage;
                    fundingLink.totalFundingAmount = +fundingLink.totalFundingAmount + +quotaRequest.lenderGrantedAmount;
                    break;
                case EnterpriseQuotaRequestTypeEnum.PAYMENT:
                    console.log('PAYMENT >>> ');
                    const transactionStatus: EnterpriseFundingTransactionStatusEnum = EnterpriseFundingTransactionStatusEnum[status.toString()];
                    transaction = await EnterpriseFundingTransactionsDAO.getBasicById(quotaRequest.enterpriseFundingTransaction.id);
                    transaction.status = transactionStatus;
                    transaction.aprovalDate = moment(moment.now(), 'x').toDate();
                    transaction.approvalUser = updateUser;
                    transaction.lenderComments = quotaRequest.lenderComments;
                    transaction.amount = quotaRequest.lenderGrantedAmount;
                    break;
                default:
                    console.log('NO action to perform!');
                    break;
            }
        }
        await CoreTransacctionManager.performTransacctions([quotaRequest, fundingLink, transaction]);

        console.log('SERVICE: Ending updateQuotaRequestStatus method');
    }

    static async updateLenderQuotaRequest(lenderId: number, quotaRequestId: number, lenderUpdateQuotaRequest: ILenderUpdateQuotaRequest) {
        console.log('SERVICE: Starting updateLenderQuotaRequest method');
        const updateUser = await UserDAO.getBasicUserById(lenderUpdateQuotaRequest.userId);

        const enterprise = await EnterpriseDAO.getEnterpriseById(lenderId);

        if(!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId: lenderId });

        const quotaRequest = await EnterpriseQuotaRequestDAO.getById(quotaRequestId);

        if(!quotaRequest)
            throw new ConflictException('SCF.LIBERA.192', { quotaRequestId });

        if(quotaRequest.lender.id != enterprise.id)
            throw new ConflictException('SCF.LIBERA.194', { quotaRequestId, lenderId });

        if(quotaRequest.status == EnterpriseQuotaRequestStatusEnum.APPROVED)
            throw new ConflictException('SCF.LIBERA.215', { quotaRequestId });

        
        if(quotaRequest.status == EnterpriseQuotaRequestStatusEnum.REJECTED)
            throw new ConflictException('SCF.LIBERA.216', { quotaRequestId });


        if (quotaRequest.quotaRequestType != EnterpriseQuotaRequestTypeEnum.PAYMENT) {
            
            if(!lenderUpdateQuotaRequest.rateType)
                throw new BadRequestException('SCF.LIBERA.196');
            
            console.log('lenderUpdateQuotaRequest.rateType', lenderUpdateQuotaRequest.rateType);
            if(!parseRateType(lenderUpdateQuotaRequest.rateType))
                throw new BadRequestException('SCF.LIBERA.195', { rateType: lenderUpdateQuotaRequest.rateType });

            if(!lenderUpdateQuotaRequest.rate)
                throw new  BadRequestException('SCF.LIBERA.196');
            quotaRequest.ratePercentage = lenderUpdateQuotaRequest.rate;
            quotaRequest.rateType = lenderUpdateQuotaRequest.rateType;
        }

        quotaRequest.updateDate = moment(moment.now(), 'x').toDate();
        quotaRequest.status = EnterpriseQuotaRequestStatusEnum.PENDING_PAYER_APPROVAL;
        quotaRequest.lenderGrantedAmount = lenderUpdateQuotaRequest.grantedQuota;
        quotaRequest.updateUser = updateUser;
        if(lenderUpdateQuotaRequest.comments)
            quotaRequest.lenderComments = lenderUpdateQuotaRequest.comments;

        await EnterpriseQuotaRequestDAO.update(quotaRequest);

        if (quotaRequest.quotaRequestType === EnterpriseQuotaRequestTypeEnum.NEW_FUNDING ||
            quotaRequest.quotaRequestType === EnterpriseQuotaRequestTypeEnum.AMOUNT_UPGRADE) {
            await SESService.sendTemplatedEmail({
                template: SES_QUOTA_ASIGNMENT_TEMPLATE,
                destinationEmail: quotaRequest.payer.owner.email,
                mergeVariables: {
                    payerEnterpriseName: quotaRequest.payer.enterpriseName,
                    lenderEnterpriseName: quotaRequest.lender.enterpriseName,
                    assignedAmount: lenderUpdateQuotaRequest.grantedQuota,
                    ratePercentage: lenderUpdateQuotaRequest.rate,
                    rateType: EmailTextParser.quotaRateTypeEspParser(lenderUpdateQuotaRequest.rateType)
                }
            });
        }

        console.log('SERVICE: Ending updateLenderQuotaRequest method');
    }

    static async updateQuotaRequestStatusByLenderId(lenderId: number, requestId: number, status: EnterpriseQuotaRequestStatusEnum, userId: number ) {
        console.log('SERVICE: Starting updateQuotaRequestStatusByLenderId');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(lenderId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { lenderId });

        console.log('usuariooooooooooooo', userId);
        
        
        console.log('**************statusssssss', status);


        const request = await EnterpriseQuotaRequestDAO.getByLenderId(lenderId, requestId);
        console.log('request.status', request.status);

        const fundingLink = await EnterpriseFundingLinkDAO.getLinkByLenderIdAndPayerIdexist(request.payer.id, lenderId);

        if(fundingLink)throw new ConflictException('SCF.LIBERA.233');

        if (!request || request.status == EnterpriseQuotaRequestStatusEnum.REJECTED)
            throw new ConflictException('SFC.LIBERA.194', { quotaRequestId: requestId, lenderId })
        
        console.log('**************statusssssss', status);

        request.status = status;

        console.log('request.status|||||||||||||||||', request.status);
        
        // const transaction: EnterpriseFundingTransactions = request.enterpriseFundingTransaction;
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!status', transaction.status);

        let eFundingLink = new EnterpriseFundingLink;
        
        let mergeVariables = {
            payerEnterpriseName: request.payer.enterpriseName,
            lenderEnterpriseName: request.lender.enterpriseName,
            amount: null
        };

        let template: string;
        if (status === EnterpriseQuotaRequestStatusEnum.REJECTED) {
            eFundingLink.payer = request.payer;
            eFundingLink.lender = request.lender;
            eFundingLink.creationDate = moment(moment.now(), 'x').toDate();
            console.log('id efunding creation user');
            eFundingLink.creationUser = request.lender.owner;
            eFundingLink.updateDate = moment(moment.now(), 'x').toDate();
            console.log('id efunding update user');
            eFundingLink.updateUser = request.lender.owner;
            eFundingLink.status = EnterpriseFundingLinkStatusEnum.REJECTED;
            eFundingLink.linkDate = moment(moment.now(), 'x').toDate();
            eFundingLink.rateType = EnterpriseFundingLinkRateType.FIXED_RATE; // pendiente
            eFundingLink.ratePercentage = 12.00;
            eFundingLink.totalFundingAmount = request.payerRequestAmount;
            template = SES_QUOTA_REQUEST_REJECTED_TEMPLATE;            
            mergeVariables.amount = request.payerRequestAmount;   
            request.updateDate = moment(moment.now(), 'x').toDate();
            console.log('id request update user');
            request.updateUser = request.lender.owner;
        } else {
            eFundingLink.payer = request.payer;
            eFundingLink.lender = request.lender;
            eFundingLink.creationDate = moment(moment.now(), 'x').toDate();
            console.log('id efunding creation user');
            eFundingLink.creationUser = request.lender.owner;
            eFundingLink.updateDate = moment(moment.now(), 'x').toDate();
            console.log('id efunding update user');
            eFundingLink.updateUser = request.lender.owner;
            eFundingLink.status = EnterpriseFundingLinkStatusEnum.PENDING_PAYER_APPROVAL;
            eFundingLink.linkDate = moment(moment.now(), 'x').toDate();
            eFundingLink.rateType = EnterpriseFundingLinkRateType.FIXED_RATE; // pendiente
            eFundingLink.ratePercentage = 12.00;
            eFundingLink.totalFundingAmount = request.payerRequestAmount;
            template = SES_QUOTA_REQUEST_APPROVED_TEMPLATE;
            mergeVariables.amount = request.payerRequestAmount;            
            request.updateDate = moment(moment.now(), 'x').toDate();
            console.log('id request update user');
            request.updateUser = request.lender.owner;
        }

        await SESService.sendTemplatedEmail({
            template,
            destinationEmail: request.payer.owner.email,
            mergeVariables
        });
        await EnterpriseFundingLinkDAO.saveEnterpriseFundingLink(eFundingLink);
        // await EnterpriseFundingTransactionsDAO.update(transaction); esperar a junta
        await EnterpriseQuotaRequestDAO.update(request);
        console.log('SERVICE: Ending updateQuotaRequestStatusByLenderId');
    }
}