import _ from 'lodash';
import moment from 'moment';
import { EnterpriseInvoiceDAO } from "dao/enterprise-invoice.dao";
import { ConflictException, InternalServerException } from "commons/exceptions";
import { EnterpriseDAO } from "dao/enterprise.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";
import LiberaUtils from "commons/libera.utils";
import { InvoiceNegotiationProcessDAO } from "dao/invoice-negotiation-process.dao";
import { EnterpriseInvoiceNegotiationProcessStatus, EnterpriseInvoiceNegotiationRoleEnum } from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { UpdateNegotiationById } from "commons/interfaces/invoice-negotiation-process.interface";
import { ISpecificProcessInstance } from "commons/interfaces/process-instance.interface";
import { BPMService } from "./bpm.service";
import { SQSService } from './sqs.service';
import { DiscountNegotiationsLogBookStatusEnum } from 'commons/enums/discount-negotiations-log-book-status.enum';
import { EnterpriseInvoiceFundingProcessDAO } from 'dao/enterprise-invoice-funding-process.dao';
import { EnterpriseInvoiceFundingProcessStatus, EnterpriseInvoiceFundingRoleEnum } from 'commons/enums/enterprise-invoice-funding-process-status';
import { EnterpriseInvoiceFundingProcess } from 'entities/enterprise-invoice-funding-process';
import { CatCustomAttributes } from 'entities/cat-custom-attributes';
import { EnterpriseInvoiceCustomAttributes } from 'entities/enterprise-invoice-custom-attributes';
import { EnterpriseInvoice } from 'entities/enterprise-invoice';
import { UserEnterpriseDAO } from 'dao/user-enterprise.dao';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { DisbursementContractTypeEnum } from 'commons/enums/entities/disbursement-contract.enum';
import { S3Service } from './s3.service';
import ProviderParsers from 'commons/parsers/provider.parsers';

const BPM_PROVIDER_NEGOTIATION_ANSWERED_EVENT = process.env.BPM_PROVIDER_NEGOTIATION_ANSWERED_EVENT;
const SQS_LIBERA_NEGOTIATION_QUEUE = process.env.SQS_LIBERA_NEGOTIATION_QUEUE;
const BPM_PROVIDER_PAYMENT_CONFIRMATION_EVENT = process.env.BPM_PROVIDER_PAYMENT_CONFIRMATION_EVENT;

export class ProviderService {

    static async getInvoiceProviderById(enterpriseId: number, invoiceId: number) {
        console.log('SERVICE: Starting getInvoiceProviderById');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        const invoice = await EnterpriseInvoiceDAO.getInvoiceProviderById(enterpriseId, invoiceId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.152', { invoiceId, enterpriseId });

        const result = {
            id: +invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            alternativeInvoiceId: invoice.alternativeInvoiceNumber,
            documentType: invoice.documentType,
            creationDate: invoice.creationDate,
            creationUser: +invoice.creationUser.id,
            emissionDate: invoice.emissionDate,
            expirationDate: invoice.expirationDate,
            effectivePaymentDate: invoice.paymentDate,
            status: invoice.status,
            currencyCode: invoice.currencyCode.code,
            bulkNegotiationId: invoice.bulkNegotiation? +invoice.bulkNegotiation.id : null,
            payment: {
                inAdvance: +invoice.advancePayment,
                creditNotesValue: +invoice.creditNotesValue,
                retentions: +invoice.retentions,
                vat: +invoice.vat,
                amount: +invoice.amount,
                paymentType: invoice.paymentType
            },
            payer: {
                id: +invoice.enterprise.id,
                enterpriseName: invoice.enterprise.enterpriseName,
                nit: invoice.enterprise.nit,
                owner: {
                    id: +invoice.enterprise.owner.id,
                    name: invoice.enterprise.owner.userProperties.name,
                    firstSurname: invoice.enterprise.owner && invoice.enterprise.owner.userProperties ? invoice.enterprise.owner.userProperties.firstSurname : null,
                    secondSurname: invoice.enterprise.owner && invoice.enterprise.owner.userProperties ? invoice.enterprise.owner.userProperties.secondSurname : null,
                    email: invoice.enterprise.owner.email
                }
            },
            lender: invoice.lender ? {
                id: +invoice.lender.id,
                enterpriseName: invoice.lender.enterpriseName,
                nit: invoice.lender.nit,
                owner: {
                    id: +invoice.lender.owner.id,
                    name: invoice.lender.owner.userProperties.name,
                    firstSurname: invoice.lender.owner && invoice.lender.owner.userProperties ? invoice.lender.owner.userProperties.firstSurname : null,
                    secondSurname: invoice.lender.owner && invoice.lender.owner.userProperties ? invoice.lender.owner.userProperties.secondSurname : null,
                    email: invoice.lender.owner.email
                }
            } : null,
            negotiation: invoice.invoiceNegotiationProcess && invoice.invoiceNegotiationProcess.length != 0 ? {
                discountValue: +LiberaUtils.calculateDiscountValueByTypeOfDiscount(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, invoice.amount, invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].discountType, invoice.expirationDate, invoice.emissionDate),
                expectedPaymentDate: invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate,
                percentage: invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage,
                discountDays: +LiberaUtils.getDiffDates(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate),
                paymentDueDays: +LiberaUtils.getDiffDates(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate)
            } : null
        };
        console.log('result', result);

        console.log('SERVICE: Ending getInvoiceProviderById');
        return result;
    }

    static async updateInvoiceNegotiationById(enterpriseId: number, invoiceId: number, negotiationId: number, data: UpdateNegotiationById, userId: number) {
        console.log('SERVICE: Starting updateInvoiceNegotiationById');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceProviderById(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.152', { invoiceId, enterpriseId });
        const negotiation = await InvoiceNegotiationProcessDAO
            .getNegotiationByIdAndStatus(negotiationId, invoice.id, EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE);
        if (!negotiation) throw new ConflictException('SCF.LIBERA.147', { negotiationId, invoiceId });

        const negotiationStatus = data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED ?
            EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE : data.status;

        const newNegotiation = _.clone(negotiation);
        switch (data.status) {
            case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
                newNegotiation.discountType = data.newOffer.discountType;
                newNegotiation.providerDiscountPorcentage = data.newOffer.percentage;
                newNegotiation.providerRequestedDiscountDueDate = data.newOffer.discountDueDate;
                newNegotiation.providerRequestedPaymentDate = data.newOffer.expectedPaymentDate;
                newNegotiation.currentDiscountPercentage = data.newOffer.percentage;
                newNegotiation.currentDiscountDueDate = data.newOffer.discountDueDate;
                newNegotiation.currentExpectedPaymentDate = data.newOffer.expectedPaymentDate;
                newNegotiation.providerRequestedDiscountType = data.newOffer.discountType;
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
                newNegotiation.currentDiscountDueDate = negotiation.payerRequestedDiscountDueDate;
                newNegotiation.currentDiscountPercentage = negotiation.payerDiscountPorcentage;
                newNegotiation.currentExpectedPaymentDate = negotiation.payerRequestedPaymentDate;
                newNegotiation.providerDiscountPorcentage = negotiation.payerDiscountPorcentage;
                newNegotiation.providerRequestedDiscountDueDate = negotiation.payerRequestedDiscountDueDate;
                newNegotiation.providerRequestedPaymentDate = negotiation.payerRequestedPaymentDate;
                newNegotiation.providerRequestedDiscountType = negotiation.discountType;
                break;
            default:
                break;
        }
        newNegotiation.status = negotiationStatus;


        const negotiationUpdated = await InvoiceNegotiationProcessDAO.saveInvoiceNegotiation(newNegotiation);
        if(data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED)
            await EnterpriseInvoiceDAO.updateInvoiceCurrentExpectedPaymentDate(invoiceId, enterpriseId, data.newOffer.expectedPaymentDate);

        console.log('negotiationUpdated >>> ', negotiationUpdated);

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: negotiationUpdated.bpmProcessInstance.toString(),
            event_id: BPM_PROVIDER_NEGOTIATION_ANSWERED_EVENT,
            reply: {
                providerNegotiationAnswer: data.status.toString(),
                userId: userId.toString(),
                role: EnterpriseInvoiceNegotiationRoleEnum.PROVIDER.toString(),
            }
        }
        console.log('specificProcessInstance >>> ', specificProcessInstance);

        try {
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result >>> ', result);
            if (data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED) {
                const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_NEGOTIATION_QUEUE,
                    body: {
                        negotiationId,
                        userId: userId,
                        negotiationRole: EnterpriseInvoiceNegotiationRoleEnum.PROVIDER.toString(),
                        eventDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                        typeEvent: DiscountNegotiationsLogBookStatusEnum.COUNTEROFFERED.toString()
                    }
                }
                await SQSService.sendMessage(sqsMetadata);
            }
        } catch (errors) {
            await InvoiceNegotiationProcessDAO.rollbackInvoiceNegotiation(negotiation);
            if(data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED)
                await EnterpriseInvoiceDAO.updateInvoiceCurrentExpectedPaymentDate(invoiceId, enterpriseId, invoice.currentExpectedPaymentDate);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending updateInvoiceNegotiationById');
    }

    static async updatePaymentStatusById(enterpriseId: number, invoiceId: number, fundingRequestId: number, userId: number) {
        console.log('SERVICE: Starting updatePaymentStatusById');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoice = await EnterpriseInvoiceDAO.getInvoiceProviderById(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.152', { invoiceId, enterpriseId });
        const fundingRequest = await EnterpriseInvoiceFundingProcessDAO.getProcessByInvoiceIdAndFundingProcessId(invoiceId, fundingRequestId);
        if (!fundingRequest || fundingRequest.status == EnterpriseInvoiceFundingProcessStatus.REJECTED)
            throw new ConflictException('SCF.LIBERA.189', { invoiceId, fundingRequestId });

        let newFundingRequest: EnterpriseInvoiceFundingProcess = fundingRequest;
        newFundingRequest.providerConfirmationDate = moment(moment.now(), 'x').toDate();
        newFundingRequest.providerEffectivePaymentDate = fundingRequest.lenderEffectivePaymentDate;
        newFundingRequest.providerEffectivePaymentAmount = fundingRequest.lenderEffectivePaymentAmount;
        newFundingRequest.status = EnterpriseInvoiceFundingProcessStatus.PROVIDER_PAYMENT_CONFIRMATION;

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: fundingRequest.bpmProcessInstance.toString(),
            event_id: BPM_PROVIDER_PAYMENT_CONFIRMATION_EVENT,
            reply: {
                userId: userId.toString(),
                role: EnterpriseInvoiceFundingRoleEnum.PROVIDER.toString()
            }
        }

        console.log('specificProcessInstance >>>', specificProcessInstance);
        await EnterpriseInvoiceFundingProcessDAO.saveInvoiceFundingProcess(newFundingRequest);

        try {
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result >>> ', result);
        } catch (errors) {
            console.log('Restoring Funding Request');
            await EnterpriseInvoiceFundingProcessDAO.saveInvoiceFundingProcess(fundingRequest);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending updatePaymentStatusById');
    }

    static async getContactInformation(enterpriseId: number, page: number, per_page: number) {
        console.log('SERVICE: Starting getContactInformation');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if(!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.61', { enterpriseId });
        
        const [users,total] = await UserEnterpriseDAO.getProviderContactInformation(enterpriseId, page, per_page);
        const usersParsed = ProviderParsers.parseContactInformation(users);

        if(page === 1){
            const enterprise = await EnterpriseDAO.getOwnerDetail(enterpriseId);

            const owner = {
                id : enterprise.owner.id,
                name : enterprise.owner.userProperties.name,
                firstSurname : enterprise.owner.userProperties.firstSurname,
                secondSurname : enterprise.owner.userProperties.secondSurname,
                email: enterprise.owner.email,
                phone:{
                    number : enterprise.owner.userProperties.phoneNumber,
                    extension: enterprise.owner.userProperties.phoneExt
                },
                activeProducts: [enterprise.productType],
                modules: enterprise.owner.userModules.map(userModule => userModule.catModule.name),
                isOwner: true
            }
            usersParsed.unshift(owner);
        }
        console.log('SERVICE: Ending getContactInformation');
        return {
            users: usersParsed,
            total: total +1 
        }
    }

    static async getGeneralData(enterpriseId: number, providerId: number){
        console.log('SERVICE: Starting getGeneralData');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(providerId);

        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const disbursementContract = await EnterpriseRequestDAO.getDisbursementContractByEnterpriseIdAndProviderId(enterpriseId, providerId);

        const responseParsed = await ProviderParsers.parseGeneralData(enterprise, disbursementContract);
        console.log('SERVICE: Ending getGeneralData');
        return responseParsed;
    }
}