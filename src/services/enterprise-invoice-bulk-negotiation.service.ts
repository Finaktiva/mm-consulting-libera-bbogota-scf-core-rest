import _ from 'lodash';
import { EnterpriseDAO } from "dao/enterprise.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ConflictException, InternalServerException } from "commons/exceptions";
import { EnterpriseInvoiceBulkNegotiation } from "entities/enterprise-invoice-bulk-negotiation";
import { InvoiceNegotiationBulkDAO } from "dao/invoice-negotiation-bulk.dao";
import { EnterpriseInvoiceDAO } from "dao/enterprise-invoice.dao";
import { EnterpriseInvoiceNegotiationProcessStatus, EnterpriseInvoiceNegotiationRoleEnum } from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { UpdateNegotiationById } from "commons/interfaces/invoice-negotiation-process.interface";
import LiberaUtils from "commons/libera.utils";
import { ISpecificProcessInstance } from "commons/interfaces/process-instance.interface";
import { BPMService } from "./bpm.service";
import { InvoiceNegotiationProcessDAO } from 'dao/invoice-negotiation-process.dao';

const BPM_PROVIDER_NEGOTIATION_ANSWERED_EVENT = process.env.BPM_PROVIDER_NEGOTIATION_ANSWERED_EVENT;

export class EnterpriseInvoiceBulkNegotiationService {

    static async updateInvoiceBulkNegotiationStatus(enterpriseId: number, 
        bulkNegotiationId: number, data: UpdateNegotiationById, userId:number){

        console.log('SERVICE: Starting updateInvoiceBulkNegotiationStatus...');
        
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const bulkNegotiation: EnterpriseInvoiceBulkNegotiation = await InvoiceNegotiationBulkDAO.getBasicDataBulkNegotiationByProviderId(enterpriseId, bulkNegotiationId);
        if (!bulkNegotiation) throw new ConflictException('SCF.LIBERA.248', { bulkNegotiationId, enterpriseId })
        console.log('bulkNegotiation -->>', bulkNegotiation);

        const invoices = await EnterpriseInvoiceDAO.getInvoicesByBulkId(bulkNegotiationId);

        let bulkInviocesTemp = JSON.parse(JSON.stringify(invoices));
        console.log(invoices);

        const negotiationStatus = data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED ?
            EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE : data.status;

        const statusByUpdate:EnterpriseInvoiceNegotiationProcessStatus = EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE;
        const negotiations = await InvoiceNegotiationProcessDAO.getNegotiationsId(statusByUpdate, bulkNegotiationId);
        console.log('ids -->>', negotiations);
        let negotiationsId:number[] = [];
        for (let negotiation of negotiations) {
            negotiationsId.push(negotiation.negotiationProcess)
        }
        console.log('negotiationsIds-->> ', negotiationsId)
        const newBulkNegotiation = _.clone(bulkNegotiation);
        let newData:UpdateNegotiationById = null;
        switch (data.status) {
            case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
                newBulkNegotiation.invoiceNegotiationProcess.discountType = data.newOffer.discountType;
                newBulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage = data.newOffer.percentage;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate = data.newOffer.discountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate = data.newOffer.expectedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage = data.newOffer.percentage;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountDueDate = data.newOffer.discountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate = data.newOffer.expectedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountType = data.newOffer.discountType;
                newBulkNegotiation.currentAmount = data.newOffer.currentAmount;
                newBulkNegotiation.providerCurrentAmount = data.newOffer.currentAmount;
                newData = {
                    status: data.status,
                    newOffer: data.newOffer
                }
                await EnterpriseInvoiceDAO.UpdateBulkInvoicesCurrentAmount(data, bulkInviocesTemp)
                break;
            case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
                newBulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage = newBulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate = newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate = newBulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage = newBulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountDueDate = newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate = newBulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountType = newBulkNegotiation.invoiceNegotiationProcess.discountType;
                newBulkNegotiation.providerCurrentAmount = newBulkNegotiation.payerCurrentAmount;
                newData = {
                    status: data.status,
                    newOffer: {
                        discountType: newBulkNegotiation.invoiceNegotiationProcess.discountType,
                        percentage: newBulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage,
                        discountDueDate: newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate,
                        expectedPaymentDate: newBulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate
                    }
                }
            default:
                break;
        }
        
        newBulkNegotiation.invoiceNegotiationProcess.status = negotiationStatus;

        if(data.status !== EnterpriseInvoiceNegotiationProcessStatus.REJECTED)
            await InvoiceNegotiationProcessDAO.updateInvoicesNegotiationProcess(newData, negotiationsId, negotiationStatus);
        try {
            /* UPDATING ENTERPRISE_INVOICE_BULK_NEGOTIATION_REQUEST */
            await InvoiceNegotiationBulkDAO.saveBulkNegotiation(newBulkNegotiation);
            /* UPDATING ENTERPRISE_INVOICE_NEGOTIATION_PROCESS */
            await InvoiceNegotiationBulkDAO.updateInvoiceBulkNegotiation(newBulkNegotiation);
        } catch (errors) {
            await InvoiceNegotiationBulkDAO.saveBulkNegotiation(bulkNegotiation);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        
        }
        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: bulkNegotiation.invoiceNegotiationProcess.bpmProcessInstance.toString(),
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
        } catch (errors) {
            await InvoiceNegotiationBulkDAO.saveBulkNegotiation(bulkNegotiation);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        console.log('SERVICE: Ending updateInvoiceBulkNegotiationStatus...');
    }
}