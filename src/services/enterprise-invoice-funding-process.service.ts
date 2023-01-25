import { EnterpriseDAO } from "dao/enterprise.dao";
import _ from 'lodash';
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ConflictException } from "commons/exceptions";
import { EnterpriseInvoiceFundingProcessDAO } from "dao/enterprise-invoice-funding-process.dao";
import LiberaUtils from "commons/libera.utils";
import { IFilterFundingRequest } from "commons/interfaces/query-filters.interface";
import { FundingRecord } from "commons/interfaces/lender-interfaces/funding-record.inteface";
import { UserDAO } from "dao/user.dao";
import { InvoiceFundingLogBook } from "entities/logging/invoice-funding-log-book";
import { parseInvoiceFundingStatus } from "commons/enums/invoice-funding-log-book-status.enum";
import { PayerEnterprise } from "entities/logging/payer-enterprise";
import { ProviderEnterprise } from "entities/logging/provider-enterprise";
import { LenderEnterprise } from "entities/logging/lender-enterprise";
import { FundingLogBook } from "entities/logging/funding-log-book";
import { parseFundingLogBookEventType, parseFundingLogBookEventTypeToStatus } from "commons/enums/funding-log-book-event-type.enum";
import { parseFundingLogBookRole, FundingLogBookRoleEnum } from "commons/enums/funding-log-book-role.enum";
import { User } from "entities/logging/user";
import { InvoiceFundingLogBookDAO } from "dao/logging/invoice-funding-log-book.dao";
import { EnterpriseInvoiceDAO } from "dao/enterprise-invoice.dao";
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";
import { EnterpriseInvoiceFilesDAO } from "dao/enterprise-invoice-files.dao";
import { S3Service } from "./s3.service";
import { EnterpriseInvoice } from "entities/enterprise-invoice";
import { EnterpriseInvoiceFundingProcessStatus } from "commons/enums/enterprise-invoice-funding-process-status";

import { IGetInvoiceFundingRequestRecordResponse } from "commons/interfaces/get-invoice-funding-request-record.interface";

export class EnterpriseInvoiceFundingProcessService {
    
    static async getLenderListRequestFunds(enterpriseId: number, params: IFilterFundingRequest) {
        console.log('SERVICE: Starting getLenderListRequestFunds method');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoiceFundingProcess = await EnterpriseInvoiceFundingProcessDAO.getInvoiceFundingProcessByEnterpriseId(enterpriseId, params);
        console.log('invoiceFundingProcess -->>', invoiceFundingProcess);

        const result = invoiceFundingProcess[0].map(item => ({
            requestId: +item.fundingProcess,
            payer: item && item.enterpriseInvoice.enterprise ? {
                id: item.enterpriseInvoice.enterprise.id,
                enterpriseName: item.enterpriseInvoice.enterprise.enterpriseName,
                nit: item.enterpriseInvoice.enterprise.nit
            } : null,
            invoiceId: item.enterpriseInvoice ? +item.enterpriseInvoice.id : null,
            invoiceNumber: item.enterpriseInvoice ? item.enterpriseInvoice.invoiceNumber : null,
            discountPercentage: item.enterpriseInvoice.invoiceNegotiationProcess && item.enterpriseInvoice.invoiceNegotiationProcess.length >= 1
                ? +item.enterpriseInvoice.invoiceNegotiationProcess[item.enterpriseInvoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage
                : null,
            discountValue: item.enterpriseInvoice  && item.enterpriseInvoice.invoiceNegotiationProcess.length >= 1
                ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                    item.enterpriseInvoice.currentDiscountPercentage, 
                    item.enterpriseInvoice.amount, 
                    item.enterpriseInvoice.invoiceNegotiationProcess[item.enterpriseInvoice.invoiceNegotiationProcess.length - 1].discountType, 
                    item.enterpriseInvoice.expirationDate, item.enterpriseInvoice.emissionDate
                    )
                : null,
            currencyCode: item.enterpriseInvoice.currencyCode ? item.enterpriseInvoice.currencyCode.code : null,
            discountDueDate: item.enterpriseInvoice && item.enterpriseInvoice.invoiceNegotiationProcess && item.enterpriseInvoice.invoiceNegotiationProcess.length >= 1
                ? item.enterpriseInvoice.invoiceNegotiationProcess[item.enterpriseInvoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate
                : null,
            effectivePaymentDate: item.providerConfirmationDate ? item.providerConfirmationDate : null, 
            expectedPaymentDate: item.enterpriseInvoice.currentExpectedPaymentDate,
            negotationFinishedDate: item.enterpriseInvoice && item.enterpriseInvoice.invoiceNegotiationProcess.length != 0
                ? item.enterpriseInvoice.invoiceNegotiationProcess[item.enterpriseInvoice.invoiceNegotiationProcess.length - 1].finishedDate
                : null,
            status: item.status ? item.status : null,
            creationDate: item.creationDate ? item.creationDate : null,
            creationUser: item.creationUser ? +item.creationUser.id : null,
            amount: item.enterpriseInvoice ? item.enterpriseInvoice.amount : null,
        }));
        const total = invoiceFundingProcess[1];
        console.log('Result --->', result);
        console.log('SERVICE: Ending getLenderListRequestFunds method');
        return {result, total} ;
    }

    static async saveInvoiceFundingRecord(fundingRecord: FundingRecord) {
        console.log('SERVICE: Starting saveInvoiceFundingRecord');
        const { userId, fundingRequestId, typeEvent, eventDate, fundingRole } = fundingRecord;
        const user = await UserDAO.getBasicUserById(userId); 
        try {
            if (!user)
                return;
            const invoiceFundingProcess = await EnterpriseInvoiceFundingProcessDAO.getInvoiceFundingProcessById(fundingRequestId);
            if (!invoiceFundingProcess || !invoiceFundingProcess.enterpriseInvoice || !invoiceFundingProcess.enterpriseInvoice.enterprise)
                return;

            const invoice = invoiceFundingProcess.enterpriseInvoice;
            const payer = invoice.enterprise;
            const provider = invoice.provider ? invoice.provider : null;
            const lender = invoice.lender ? invoice.lender : null;
            let providerEnterprise;
            let lenderEnterprise;

            console.log('Creating Lender, Payer, Provider');
            const payerEnterprise = new PayerEnterprise(payer.id.toString(), payer.enterpriseName, LiberaUtils.getFullName(payer.owner.userProperties.name, payer.owner.userProperties.firstSurname, payer.owner.userProperties.secondSurname), payer.owner.email);
            console.log('PAYER');
            if(provider) {
                console.log('PROVIDER');
                providerEnterprise = provider ? new ProviderEnterprise(provider.id.toString(), provider.enterpriseName, LiberaUtils.getFullName(provider.owner.userProperties.name, provider.owner.userProperties.firstSurname, provider.owner.userProperties.secondSurname), provider.owner.email) : null;
            }
            if(lender){
                console.log('LENDER');
                lenderEnterprise = lender ? new LenderEnterprise(lender.id.toString(), lender.enterpriseName, LiberaUtils.getFullName(lender.owner.userProperties.name, lender.owner.userProperties.firstSurname, lender.owner.userProperties.secondSurname), lender.owner.email) : null;
            }

            const invoiceFundingLogBookExist = await InvoiceFundingLogBookDAO.getInvoiceFundingLogBook(parseInt(invoice.id.toString()), parseInt(fundingRequestId.toString()));

            console.log('LogBook[]');
            const fundingLogBook = new FundingLogBook();
            fundingLogBook.effectivePaymentAmount = invoiceFundingProcess.lenderEffectivePaymentAmount;
            fundingLogBook.effectivePaymentDate = invoiceFundingProcess.lenderEffectivePaymentDate;
            fundingLogBook.eventDate = eventDate;
            fundingLogBook.eventType = parseFundingLogBookEventType(typeEvent);
            fundingLogBook.fundingRole = parseFundingLogBookRole(fundingRole);
            fundingLogBook.user = new User(user.id.toString(), LiberaUtils.getFullName(user.userProperties.name, user.userProperties.firstSurname, user.userProperties.secondSurname), user.email);
            fundingLogBook.discountValue = invoiceFundingProcess.enterpriseInvoice.currentAmount;
        
            if (!invoiceFundingLogBookExist){
                const invoiceFundingLogBook: InvoiceFundingLogBook = new InvoiceFundingLogBook();
                invoiceFundingLogBook.invoiceId = parseInt(invoiceFundingProcess.enterpriseInvoice.id.toString());
                invoiceFundingLogBook.fundingRequestId = fundingRequestId;
                invoiceFundingLogBook.bpmProcessInstance = invoiceFundingProcess.bpmProcessInstance.toString();
                invoiceFundingLogBook.creationUser = invoiceFundingProcess.creationUser.id;
                invoiceFundingLogBook.creationDate = invoiceFundingProcess.creationDate;
                invoiceFundingLogBook.finishedDate = invoiceFundingProcess.finishedDate;
                invoiceFundingLogBook.effectivePaymentDate = invoice.effectivePaymentDate;
                invoiceFundingLogBook.invoiceAmount = invoiceFundingProcess.enterpriseInvoice.amount;
                invoiceFundingLogBook.expectedPaymentDate = invoiceFundingProcess.enterpriseInvoice.currentExpectedPaymentDate;
                invoiceFundingLogBook.status = parseInvoiceFundingStatus(invoiceFundingProcess.status);
                invoiceFundingLogBook.amountToPay = invoiceFundingProcess.lenderEffectivePaymentAmount;
                invoiceFundingLogBook.lenderEnterprise = lenderEnterprise ? lenderEnterprise : null;
                invoiceFundingLogBook.payerEnterprise = payerEnterprise;
                invoiceFundingLogBook.providerEnterprise = providerEnterprise ? providerEnterprise : null;
                invoiceFundingLogBook.invoiceInt = invoice.alternativeInvoiceNumber.toString();
                
                const logBook: FundingLogBook[] = [];
                logBook.push(fundingLogBook);        
                invoiceFundingLogBook.logBook = logBook;
                await InvoiceFundingLogBookDAO.saveFundingLogBook(invoiceFundingLogBook);    
            }else{
                const logBook: FundingLogBook[] = invoiceFundingLogBookExist.logBook;
                logBook.push(fundingLogBook);
                const discountNegotiationsLogBook = await InvoiceFundingLogBookDAO.updateInvoiceFundigLogBook(parseInt(invoice.id.toString()), parseInt(fundingRequestId.toString()), logBook);
                console.log('discountNegotiationLogBook', discountNegotiationsLogBook);
            }
        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
        }        
        console.log('SERVICE: Ending saveInvoiceFundingRecord');
    }
    
    static async getLenderFundingRequestsDetails(enterpriseId: number, invoiceId: number) {
        console.log('SERVICE: Starting getLenderFundingRequestsDetails');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoice = await EnterpriseInvoiceDAO.getByFundingId(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED) 
            throw new ConflictException('SCF.LIBERA.152', { invoiceId, enterpriseId });
        console.log('invoice -->', invoice);

        const invoiceFiles = await EnterpriseInvoiceFilesDAO.getInvoiceFilesByInvoiceId(invoiceId);

        const invoiceFilesResult = [];
        let url = null;
        let filename = null;
        for (let file of invoiceFiles) {
            url = await S3Service.getObjectUrl({ bucket: file.s3Metadata.bucket, fileKey: file.s3Metadata.fileKey });
            filename = file.s3Metadata.filename;
            invoiceFilesResult.push({ url, filename });
        }
        const result = {
            requestId: invoice.invoiceFundingProcess ? +invoice.invoiceFundingProcess[invoice.invoiceFundingProcess.length - 1].fundingProcess : null,
            invoiceId: +invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            emissionDate: invoice.emissionDate,
            currencyCode: invoice.currencyCode.code,
            fundStatus: invoice.invoiceFundingProcess ? invoice.invoiceFundingProcess[invoice.invoiceFundingProcess.length - 1].status : null,
            discountValue: invoice.invoiceNegotiationProcess.length >= 1 ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, 
                invoice.amount, 
                invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].discountType, 
                invoice.expirationDate, 
                invoice.emissionDate
                ):null,
            discountDays: invoice.invoiceNegotiationProcess.length >= 1 ? 
            +LiberaUtils.getDiffDates(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate): 
            +LiberaUtils.getDiffDates(invoice.expirationDate),
            provider: invoice.provider ? {
                id: +invoice.provider.id,
                enterpriseName: invoice.provider.enterpriseName,
                nit: invoice.provider.nit
            } : null,
            payer: {
                id: +invoice.enterprise.id,
                enterpriseName: invoice.enterprise.enterpriseName,
                nit: invoice.enterprise.nit
            },
            payment: {
                paymentInstruction: invoice.paymentSpecifications,
                paymentDocumentation: invoiceFilesResult
            }
        };
        console.log('SERVICE: Starting getLenderFundingRequestsDetails');
        return result;
    }

    static async getPaymentDetail(enterpriseId: number, invoiceId: number) {
        console.log('SERVICE: Starting getPaymentDetail');

        const enterprise = await EnterpriseDAO.getBasic(enterpriseId);
        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const eInvoice = await EnterpriseInvoice.getBasicEnterpriseInvoiceByIdAndProviderId(enterpriseId, invoiceId);
        if (!eInvoice)
            return {};
        if (eInvoice && eInvoice.status === EnterpriseInvoiceStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });
        

        const fundingPaymentDetail = await EnterpriseInvoiceFundingProcessDAO.getPaymentDetail(invoiceId);

        console.log('obtaning fundingPaymentDetail --->', fundingPaymentDetail);
        
        if (!fundingPaymentDetail || fundingPaymentDetail && fundingPaymentDetail.status === EnterpriseInvoiceFundingProcessStatus.REJECTED) 
            throw new ConflictException('SCF.LIBERA.189', { invoiceId });

        let file = null;

        if(fundingPaymentDetail.invoiceFiles && fundingPaymentDetail.invoiceFiles.length != 0 ? fundingPaymentDetail.invoiceFiles[fundingPaymentDetail.invoiceFiles.length - 1].s3Metadata ? true : false: false ){
            console.log('entrando al if de si existe el archivo');
            file = {
                id: fundingPaymentDetail.invoiceFiles[fundingPaymentDetail.invoiceFiles.length - 1].s3Metadata.id,
                name: fundingPaymentDetail.invoiceFiles[fundingPaymentDetail.invoiceFiles.length - 1].s3Metadata.filename,
                url: await S3Service.getObjectUrl({
                    bucket: fundingPaymentDetail.invoiceFiles[fundingPaymentDetail.invoiceFiles.length - 1].s3Metadata.bucket,
                    fileKey: fundingPaymentDetail.invoiceFiles[fundingPaymentDetail.invoiceFiles.length - 1].s3Metadata.fileKey
                })
            }
        }
        const result = {
            id: +fundingPaymentDetail.fundingProcess,
            lenderName: fundingPaymentDetail.lender
                ? fundingPaymentDetail.lender.enterpriseName
                : null,
            comments: fundingPaymentDetail.lenderPaymentConfirmComments,
            effectivePaymentDate: fundingPaymentDetail.lenderEffectivePaymentDate,
            effectivePaymentAmount: fundingPaymentDetail.lenderEffectivePaymentAmount,
            file
        }
        console.log('const result',result),
        console.log('SERVICE: Ending getPaymentDetail');
        return result;
    }
    
    static async getInvoiceFundingRecord(enterpriseId: number, invoiceId: number, requestId: number) {
        console.log('SERVICE: Starting getInvoiceFundingRecord...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoice = await EnterpriseInvoiceDAO.getBasicEnterpriseInvoice(enterpriseId, invoiceId);
        if (!invoice || invoice && invoice.status == EnterpriseInvoiceStatusEnum.DELETED) 
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });

        const invoiceFundingProcess = await EnterpriseInvoiceFundingProcessDAO.getInvoiceFundingProcessById(requestId);
        if (!invoiceFundingProcess)
            throw new ConflictException('SCF.LIBERA.82', { requestId });

        const invoiceFundingLogBook = await InvoiceFundingLogBookDAO.getInvoiceFundingLogBook(invoiceId, requestId);

        if (!invoiceFundingLogBook)
            throw new ConflictException('SCF.LIBERA.232', { invoiceId })

        let record: IGetInvoiceFundingRequestRecordResponse[] = invoiceFundingLogBook.logBook.map(record => ({
            enterpriseName: record.fundingRole == FundingLogBookRoleEnum.PAYER ? invoiceFundingLogBook.payerEnterprise.name
                : record.fundingRole == FundingLogBookRoleEnum.PROVIDER ? invoiceFundingLogBook.providerEnterprise.name
                : invoiceFundingLogBook.lenderEnterprise.name,
            fundingRole: record.fundingRole,
            eventDate: record.eventDate,
            eventType: parseFundingLogBookEventTypeToStatus(record.eventType)
        }));

        console.log('SERVICE: Ending getInvoiceFundingRecord...');
        record = _.orderBy(record,  ['eventDate'], ['desc']);
        return { record, total: record.length }
    }

}