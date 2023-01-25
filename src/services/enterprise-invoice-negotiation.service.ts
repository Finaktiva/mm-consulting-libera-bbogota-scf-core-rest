import moment from 'moment';
import uuid from 'uuid';
import _ from 'lodash';
import { ISaveInvoiceNegotiationRecord, UpdateNegotiationById } from "commons/interfaces/invoice-negotiation-process.interface";
import { UserDAO } from "dao/user.dao";
import { ConflictException, InternalServerException, BadRequestException } from "commons/exceptions";
import { InvoiceNegotiationProcessDAO } from "dao/invoice-negotiation-process.dao";
import { DiscountNegotiationsLogBookDAO } from "dao/logging/discount-negotiations-log-book.dao";
import LiberaUtils from "commons/libera.utils";
import { LogBook } from "entities/logging/log-book";
import { DiscountNegotiationsLogBook } from "entities/logging/discount-negotiations-log-book";
import { PayerEnterprise } from 'entities/logging/payer-enterprise';
import { ProviderEnterprise } from 'entities/logging/provider-enterprise';
import { User } from 'entities/logging/user';
import { InvoiceNegotiationProcess } from 'entities/enterprise-invoice-negotiation-process';
import { NegotiationRoleEnum } from 'commons/enums/negotiation-role.enum';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { IFilterBasic } from 'commons/interfaces/query-filters.interface';
import { InvoiceNegotiationBulkDAO } from 'dao/invoice-negotiation-bulk.dao';
import { CreateNewNegotiationBulk } from 'commons/interfaces/payer-interfaces/create-new-negotiation-bulk';
import { EnterpriseLinkDAO } from 'dao/enterprise-link.dao';
import { EnterpriseInvoiceBulkNegotiation } from 'entities/enterprise-invoice-bulk-negotiation';
import { EnterpriseInvoiceDAO } from 'dao/enterprise-invoice.dao';
import { EnterpriseInvoiceNegotiationProcessStatus, EnterpriseInvoiceNegotiationRoleEnum } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';
import { UserStatus } from 'commons/enums/user-status.enum';
import { EnterpriseInvoiceBulkNegotiationStatusEnum } from 'commons/enums/enterprise-invoice-bulk-negotiation-status.emun';
import { EnterpriseFundingLinkDAO } from 'dao/enterprise-funding-link.dao';
import { EnterpriseInvoice } from 'entities/enterprise-invoice';
import { CatCurrencyDAO } from 'dao/cat-currency.dao';
import { RelationNegotiationBulkDAO } from 'dao/rel-enterprise-invoice-bulk-negotiation-request.dao';
import { EnterpriseInvoiceStatusEnum } from 'commons/enums/enterprise-invoice-status.enum';
import { RelationBulkNegotiation } from 'entities/rel-enterprise-invoice-bulk-negotiation-request';
import { EnterpriseInvoiceBulkDAO } from 'dao/enterprise-invoice-bulk.dao';
import { ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { BPMService } from './bpm.service';
import { BulkDiscountRequestInterface } from "commons/interfaces/provider-interfaces/bulk-discount-request.interface";
import { IProcessInstance } from 'commons/interfaces/process-instance.interface';

const BPM_PAYER_NEGOTIATION_ANSWERED_EVENT = process.env.BPM_PAYER_NEGOTIATION_ANSWERED_EVENT;

export class EnterpriseInvoiceNegotiationService {

    static async saveInvoiceNegotiationRecord(invoiceNegotiation: ISaveInvoiceNegotiationRecord){
        console.log('SERVICE: Starting saveInvoiceNegotiationRecord');
        const { eventDate, negotiationId, negotiationRole, typeEvent, userId } = invoiceNegotiation;
        console.log('>>>>>>>>>>eventType<<<<<<<<<<<', typeEvent);
        
        const user = await UserDAO.getBasicUserById(userId);
        if(!user)
            return;
        
            
        const negotiation: InvoiceNegotiationProcess = await InvoiceNegotiationProcessDAO.getInvoiceNegotiationByNegotiationProcessId(negotiationId);
        if(!negotiation)
            return;

        const negotiationLogBook = await DiscountNegotiationsLogBookDAO.getDiscountNegotiationLogBook(parseInt(negotiation.enterpriseInvoice.id.toString()), parseInt(negotiationId.toString()));
            
        const logUser = new User(user.id.toString(), LiberaUtils.getFullName(user.userProperties.name, user.userProperties.firstSurname, user.userProperties.secondSurname), user.email)
        const logBook = new LogBook(logUser, negotiationRole, eventDate, typeEvent);
        logBook.discountPercentage = negotiationRole == NegotiationRoleEnum.PROVIDER ? negotiation.providerDiscountPorcentage : negotiation.payerDiscountPorcentage;
        logBook.discountType = negotiation.discountType;
        logBook.discountDueDate = negotiationRole == NegotiationRoleEnum.PROVIDER ? negotiation.providerRequestedDiscountDueDate : negotiation.payerRequestedDiscountDueDate;
        logBook.expectedPaymentDate = negotiationRole == NegotiationRoleEnum.PROVIDER ? negotiation.providerRequestedPaymentDate : negotiation.payerRequestedPaymentDate;
        logBook.discountValue = negotiation.enterpriseInvoice.currentAmount;
        logBook.eventType = typeEvent;
        logBook.eventDate = moment(moment.now(), 'x').toDate();
        
        
        if (!negotiationLogBook){  
            const { name, firstSurname, secondSurname } = negotiation.enterpriseInvoice.enterprise.owner.userProperties;
            let prOwnerName = negotiation.enterpriseInvoice.provider.owner.userProperties.name;
            let prOwnerFirstSurname = negotiation.enterpriseInvoice.provider.owner.userProperties.firstSurname;
            let prOwnerSecondSurname = negotiation.enterpriseInvoice.provider.owner.userProperties.secondSurname;
            
            const discountNegotiationLogBook: DiscountNegotiationsLogBook = new DiscountNegotiationsLogBook();
            discountNegotiationLogBook.status = negotiation.status;
            discountNegotiationLogBook.creationDate = moment(moment.now(), 'x').toDate();
            discountNegotiationLogBook.bpmProcessInstance = negotiation.bpmProcessInstance.toString();
            discountNegotiationLogBook.finished = negotiation.finishedDate;
            discountNegotiationLogBook.invoiceAmount = negotiation.enterpriseInvoice.amount;
            discountNegotiationLogBook.invoiceId = parseInt(negotiation.enterpriseInvoice.id.toString());
            discountNegotiationLogBook.negotiationId = negotiation.negotiationProcess;
            discountNegotiationLogBook.payerEnterprise = new PayerEnterprise( negotiation.enterpriseInvoice.enterprise.id.toString(), negotiation.enterpriseInvoice.enterprise.enterpriseName, LiberaUtils.getFullName(name, firstSurname, secondSurname), negotiation.enterpriseInvoice.enterprise.owner.email);
            discountNegotiationLogBook.providerEnterprise = new ProviderEnterprise( negotiation.enterpriseInvoice.provider.id.toString(), negotiation.enterpriseInvoice.provider.enterpriseName, LiberaUtils.getFullName(prOwnerName, prOwnerFirstSurname, prOwnerSecondSurname), negotiation.enterpriseInvoice.provider.owner.email) 
            
            const logBookArr: LogBook[] =[];
            logBookArr.push(logBook);
            discountNegotiationLogBook.logBook = logBookArr;
            const discountNegotiationsLogBook = await DiscountNegotiationsLogBookDAO.saveInvoiceNegotiation(discountNegotiationLogBook);
            console.log('discountNegotiationsLogBook', discountNegotiationsLogBook);
        }else{
            const logBookArr: LogBook[] = negotiationLogBook.logBook;
            logBookArr.push(logBook);
            const discountNegotiationsLogBook = await DiscountNegotiationsLogBookDAO.updateInvoiceNegotiationLogBook(parseInt(negotiation.enterpriseInvoice.id.toString()), parseInt(negotiationId.toString()), logBookArr);
            console.log('discountNegotiationsLogBook Update', discountNegotiationsLogBook);
        }

        console.log('SERVICE: Ending saveInvoiceNegotiationRecord');
    }

    static async getAllPayerBulkDiscountNegotiations(enterpriseId: number, filter: IFilterBasic ) {
        console.log('SERVICE: Starting getEnterpriseInvoices');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const negotiations = await InvoiceNegotiationBulkDAO.getAllPayerBulkDiscountNegotiations(+enterpriseId, filter)
        console.log('bulk negotiations -->>', negotiations);

        const result = negotiations[0].map(item =>({
            id: +item.id,
            folio: item.folioNumber,
            provider:  {
                 id: +item.provider.id,
                 enterpriseName: item.provider.enterpriseName
             },
            amountInvoices: +item.amountInvoices,
            amount: +item.amount,
            creationDate: item.creationDate,
            creationUser: +item.creationUser.id,
            finishDate: item.finishedDate,
            status: item.status   
        }));
        const total = negotiations[1];
        console.log('Result --->', result);
        console.log('SERVICE: Ending getLenderListRequestFunds method');
        return {result, total};
    }

    static async createNewBulkNegotiation (data: CreateNewNegotiationBulk, enterpriseId: number, userId: number) {
        console.log("SERVICE: Starting createNewBulkNegotiation");

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if(!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const user = await UserDAO.getBasicUserById(userId);
        if (user && user.status == UserStatus.DELETED)
            throw new ConflictException('SCF.LIBERA.53', { userId });

        const lender = await EnterpriseDAO.getBasicEnterpriseById(data.lenderId);
        if(!lender || lender && lender.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', data.lenderId);

        const linkLender = await EnterpriseFundingLinkDAO.getLinkByLenderIdAndPayerId(enterpriseId, lender.id);
        if (!linkLender) throw new ConflictException('SCF.LIBERA.240', { lenderId: lender.id, enterpriseId });

        if(data.invoices.length < 1) throw new ConflictException('SCF.LIBERA.245');
        if(data.invoices.length > 200) throw new ConflictException('SCF.LIBERA.256');
        
        const catCurrency = await EnterpriseInvoiceDAO.getDiffCurrencyCode(data.invoices);
        const numberCatCurrency:number = +catCurrency.count;
        console.log("catCurrency -->>", numberCatCurrency);

        if(numberCatCurrency > 1 ) throw new ConflictException('SCF.LIBERA.247');

        const sum = await EnterpriseInvoiceDAO.getTotalAmount(data.invoices);
        console.log("sum -->>", +sum.sum);

        const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(linkLender.id);

        if(data.currentAmount > balanceData.generalBalance) throw new ConflictException('SCF.LIBERA.246');

        const invoiceCurrency = _.head(data.invoices);
        const currency = await CatCurrencyDAO.getCurrencyCode(invoiceCurrency);


        const bulkInvioces: EnterpriseInvoice[] = await EnterpriseInvoiceDAO.getNBulkInvoices(data.invoices, enterpriseId);
        if(!bulkInvioces.length) throw new ConflictException('SCF.LIBERA.260');
        console.log('invoices -->>', bulkInvioces);
        let bulkInviocesTemp = JSON.parse(JSON.stringify(bulkInvioces)); 

        const provider = await EnterpriseDAO.getBasicEnterpriseById(+bulkInvioces[0].provider.id);
        if(!provider || provider && provider.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', bulkInvioces[0].provider.id );

        const linkProvider = await EnterpriseLinkDAO.getProviderLinkedToEnterprise(enterpriseId, +provider.id);
        if (!linkProvider) throw new ConflictException('SCF.LIBERA.138', { providerId: +provider.id, enterpriseId });

        let negotiationsProcess:InvoiceNegotiationProcess[] = [];
        let relBulkNegotiations:RelationBulkNegotiation[] = [];
        

        const newNegotiation = new InvoiceNegotiationProcess();
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

        const saveNewNegotiation = await InvoiceNegotiationProcessDAO.saveInvoiceNegotiation(newNegotiation);

        const newBulkNegotiation = new EnterpriseInvoiceBulkNegotiation();
        newBulkNegotiation.folioNumber = uuid();
        newBulkNegotiation.amountInvoices = data.invoices.length;
        newBulkNegotiation.amount = +sum.sum;
        newBulkNegotiation.creationDate = moment(moment.now(), 'x').toDate();
        newBulkNegotiation.creationUser = user;
        newBulkNegotiation.finishedDate = null;
        newBulkNegotiation.status = EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_IN_PROGRESS;
        newBulkNegotiation.enterprise = enterprise;
        newBulkNegotiation.provider = provider;
        newBulkNegotiation.lender = lender;
        newBulkNegotiation.currentAmount = data.currentAmount;
        newBulkNegotiation.currencyCode = currency;
        newBulkNegotiation.invoiceNegotiationProcess = newNegotiation;
        newBulkNegotiation.payerCurrentAmount = data.currentAmount;

        const saveNewBulkNegotiation = await InvoiceNegotiationBulkDAO.saveBulkNegotiation(newBulkNegotiation);

        const processInstance: IProcessInstance = {
            processDefinitionKey: 'bulkDiscountNegotiationProcess',
            variables: [
                {
                    name: 'enterprisePayerId',
                    value: saveNewBulkNegotiation.enterprise.id.toString()
                },
                {
                    name: 'enterpriseProviderId',
                    value: saveNewBulkNegotiation.provider.id.toString()
                },
                {
                    name: 'bulkNegotiationRequestId',
                    value: saveNewBulkNegotiation.id.toString()
                }
            ]
        };
        console.log('processInstance', processInstance);

        for(let invoice of bulkInviocesTemp ) {
            const newNegotiationProcess = new InvoiceNegotiationProcess();
            const relInvoiceNegotiationBulk = new RelationBulkNegotiation();
            relInvoiceNegotiationBulk.enterpriseInvoice = invoice;
            relInvoiceNegotiationBulk.invoiceBulkNegotiation = saveNewBulkNegotiation;
            newNegotiationProcess.creationDate = moment(moment.now(), 'x').toDate();
            newNegotiationProcess.finishedDate = null;
            newNegotiationProcess.status = EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE;
            newNegotiationProcess.bpmProcessInstance = null;
            newNegotiationProcess.payerDiscountPorcentage = data.percentage;
            newNegotiationProcess.payerRequestedDiscountDueDate = data.discountDueDate;
            newNegotiationProcess.payerRequestedPaymentDate = data.expectedPaymentDate;
            newNegotiationProcess.currentDiscountPercentage = data.percentage;
            newNegotiationProcess.currentExpectedPaymentDate = data.expectedPaymentDate;
            newNegotiationProcess.currentDiscountDueDate = data.discountDueDate;
            newNegotiationProcess.discountType = data.discountType;
            newNegotiationProcess.payerRequestedDiscountType = data.discountType;
            newNegotiationProcess.enterpriseInvoice = invoice;
            negotiationsProcess.push(newNegotiationProcess);
            relBulkNegotiations.push(relInvoiceNegotiationBulk);
            
        }
        
        await InvoiceNegotiationProcessDAO.saveInvoiceBulkNegotiation(negotiationsProcess);
        await RelationNegotiationBulkDAO.saveRelationBulkNegotiations(relBulkNegotiations);

        try {
            await EnterpriseInvoiceDAO.updateInvoicesBulkNegotiations( data, bulkInvioces, saveNewBulkNegotiation);
            const instance = await BPMService.runProcessInstance(processInstance);
            console.log('id', instance.id);
            await InvoiceNegotiationProcessDAO.updateBpmProcessInstance(saveNewNegotiation.negotiationProcess, +instance.id); 
        } catch (errors) {
            await RelationNegotiationBulkDAO.rollbackRelationNegotiationBulk(newBulkNegotiation.id);  
            await EnterpriseInvoiceDAO.rollbackInvoiceBulkNegotiations(data.invoices);
            await InvoiceNegotiationBulkDAO.deleteNegotiationBulk(saveNewBulkNegotiation);
            await InvoiceNegotiationProcessDAO.deleteNegotiationsProcess(data.invoices);
            await InvoiceNegotiationProcessDAO.deleteNegotiationProcessByNegotiationId(+saveNewNegotiation.negotiationProcess);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        const invoices = bulkInviocesTemp.map(({id, invoiceNumber, provider, expirationDate, amount, currencyCode}) => ({
            id: +id,
            invoiceNumber: invoiceNumber,
            provider: {
                id: +provider.id,
                enterpriseName: provider.enterpriseName
                },
                expirationDate,
                amount: +amount,
                currencyCode
        }));

        const result = {
            id: +saveNewBulkNegotiation.id,
            folio: saveNewBulkNegotiation.folioNumber,
            amountInvoices: +saveNewBulkNegotiation.amountInvoices,
            amount: +saveNewBulkNegotiation.amount,
            creationDate: saveNewBulkNegotiation.creationDate,
            creationUser: +saveNewBulkNegotiation.creationUser.id,
            finishDate: saveNewBulkNegotiation.finishedDate,
            status: saveNewBulkNegotiation.status,
            provider: {
                id: +saveNewBulkNegotiation.provider.id,
                enterpriseName: saveNewBulkNegotiation.provider.enterpriseName,
            },
            lender: {
                id: +saveNewBulkNegotiation.lender.id,
                enterpriseName: saveNewBulkNegotiation.lender.enterpriseName,
                availableQuota: balanceData.generalBalance
            },
            payerOffer: {
                discountValue: +data.currentAmount,
                discountType: data.discountType,
                percentage: +data.percentage,  
                discountDueDate: data.discountDueDate,
                expectedPaymentDate: data.expectedPaymentDate
            },
            providerOffer: null,
            invoices
        }
        console.log("SERVICE: Ending createNewBulkNegotiation");
        return result;
    }

    static async getInvoiceBulkNegotiation(enterpriseId: number, bulkNegotiationId: number) {
            console.log('SERVICE: Starting getInvoiceBulkNegotiations method...');
            
            const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
            if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)
                throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
   
            const bulkNegotiation: EnterpriseInvoiceBulkNegotiation =
                await InvoiceNegotiationBulkDAO.getInvoiceBulkNegotiationsById(enterpriseId, bulkNegotiationId);
            if(!bulkNegotiation) throw new ConflictException('SCF.LIBERA.248', { bulkNegotiationId, enterpriseId })
            let invoices = [];
            for (let relation of bulkNegotiation.realtionBulkNegotiation) {
                let inv;
                relation.enterpriseInvoice ? inv = {
                    id: +relation.enterpriseInvoice.id,
                    invoiceNumber: relation.enterpriseInvoice.invoiceNumber,
                    provider: {
                        id: +relation.enterpriseInvoice.provider.id,
                        enterpriseName: relation.enterpriseInvoice.provider.enterpriseName,
                        nit: relation.enterpriseInvoice.provider.nit
                    },
                    emissionDate: relation.enterpriseInvoice.emissionDate,
                    expirationDate: relation.enterpriseInvoice.expirationDate,
                    amount: +relation.enterpriseInvoice.amount,
                    currencyCode: relation.enterpriseInvoice.currencyCode.code
                } : null
                invoices.push(inv);
            }
            const enterpriseFundingLink = await EnterpriseFundingLinkDAO.getBasicByLenderIdAndPayerId(bulkNegotiation.lender.id, enterpriseId);
            if (!enterpriseFundingLink) throw new ConflictException('SCF.LIBERA.240', { lenderId: bulkNegotiation.lender.id, enterpriseId });
            const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(enterpriseFundingLink.id);

            const result = {
                id: +bulkNegotiation.id,
                folio: bulkNegotiation.folioNumber,
                amountInvoices: +bulkNegotiation.amountInvoices,
                amount: +bulkNegotiation.amount,
                currentAmount: +bulkNegotiation.currentAmount,
                creationDate: bulkNegotiation.creationDate,
                creationUser: +bulkNegotiation.creationUser.id,
                finishDate: bulkNegotiation.finishedDate ? bulkNegotiation.finishedDate : null,
                status: bulkNegotiation.status,
                provider: {
                    id: +bulkNegotiation.provider.id,
                    enterpriseName: bulkNegotiation.provider.enterpriseName,
                },
                lender: {
                    id: +bulkNegotiation.lender.id,
                    enterpriseName: bulkNegotiation.lender.enterpriseName,
                    availableQuota: +balanceData.generalBalance
                },
                negotiation: {
                    status: bulkNegotiation.invoiceNegotiationProcess.status,
                    payerOffer: bulkNegotiation.invoiceNegotiationProcess.status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED
                        && bulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage
                        && bulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate
                        && bulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate ?
                        {
                            discountValue: +bulkNegotiation.payerCurrentAmount,
                            discountType: bulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountType,
                            percentage: +bulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage,
                            discountDueDate: bulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate,
                            expectedPaymentDate: bulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate
                        } : null,
                    providerOffer: bulkNegotiation.invoiceNegotiationProcess.status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED
                        && bulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage
                        && bulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate
                        && bulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate
                        ? {
                            discountValue: +bulkNegotiation.providerCurrentAmount,
                            discountType: bulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountType,
                            percentage: +bulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage,
                            discountDueDate: bulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate,
                            expectedPaymentDate: bulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate
                        } : null
                },
                invoices
            }

            console.log('SERVICE: Ending getInvoiceBulkNegotiations method...');
            return result;
    }

    static async updateInvoiceBulkNegotiationById(enterpriseId: number, bulkNegotiationId: number, data: UpdateNegotiationById, userId:number) {
        console.log('SERVICE: Starting updateInvoiceBulkNegotiationById');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const bulkNegotiation: EnterpriseInvoiceBulkNegotiation = await InvoiceNegotiationBulkDAO.getBasicDataBulkNegotiationById(enterpriseId, bulkNegotiationId);
        if (!bulkNegotiation) throw new ConflictException('SCF.LIBERA.248', { bulkNegotiationId, enterpriseId })
        console.log('bulkNegotiation -->>', bulkNegotiation);

        const invoices = await EnterpriseInvoiceDAO.getInvoicesByBulkId(bulkNegotiationId);

        let bulkInviocesTemp = JSON.parse(JSON.stringify(invoices));
        console.log(invoices);

        const negotiationStatus = data.status == EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED ?
            EnterpriseInvoiceNegotiationProcessStatus.PROVIDER_PENDING_RESPONSE : data.status;

        const statusByUpdate: EnterpriseInvoiceNegotiationProcessStatus = EnterpriseInvoiceNegotiationProcessStatus.PAYER_PENDING_RESPONSE;
        const negotiations = await InvoiceNegotiationProcessDAO.getNegotiationsId(statusByUpdate, bulkNegotiationId);
        console.log('ids -->>', negotiations);
        let negotiationsId: number[] = [];
        for (let negotiation of negotiations) {
            negotiationsId.push(negotiation.negotiationProcess)
        }
        console.log('negotiationsIds-->> ', negotiationsId)
        let newData: UpdateNegotiationById = null;

        const newBulkNegotiation = _.clone(bulkNegotiation);

        const linkLender = await EnterpriseFundingLinkDAO.getLinkByLenderIdAndPayerId(enterpriseId, bulkNegotiation.lender.id);
        if (!linkLender) throw new ConflictException('SCF.LIBERA.240', { lenderId: bulkNegotiation.lender.id, enterpriseId });
        const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(linkLender.id);
        
        switch (data.status) {
            case EnterpriseInvoiceNegotiationProcessStatus.COUNTEROFFERED:
                if(data.newOffer.currentAmount > balanceData.generalBalance) throw new ConflictException('SCF.LIBERA.246');
                newBulkNegotiation.invoiceNegotiationProcess.discountType = data.newOffer.discountType;
                newBulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage = data.newOffer.percentage;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate = data.newOffer.discountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate = data.newOffer.expectedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage = data.newOffer.percentage;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountDueDate = data.newOffer.discountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate = data.newOffer.expectedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountType = data.newOffer.discountType;
                bulkNegotiation.currentAmount = data.newOffer.currentAmount;
                bulkNegotiation.payerCurrentAmount = data.newOffer.currentAmount;
                newData = {
                    status: data.status,
                    newOffer: data.newOffer
                }
                await EnterpriseInvoiceDAO.UpdateBulkInvoicesCurrentAmount(data, bulkInviocesTemp);
                break;
            case EnterpriseInvoiceNegotiationProcessStatus.APPROVED:
                if(bulkNegotiation.currentAmount > balanceData.generalBalance) throw new ConflictException('SCF.LIBERA.246');
                newBulkNegotiation.invoiceNegotiationProcess.payerDiscountPorcentage = newBulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountDueDate = newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedPaymentDate = newBulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage = newBulkNegotiation.invoiceNegotiationProcess.providerDiscountPorcentage;
                newBulkNegotiation.invoiceNegotiationProcess.currentDiscountDueDate = newBulkNegotiation.invoiceNegotiationProcess.providerRequestedDiscountDueDate;
                newBulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate = newBulkNegotiation.invoiceNegotiationProcess.providerRequestedPaymentDate;
                newBulkNegotiation.invoiceNegotiationProcess.payerRequestedDiscountType = newBulkNegotiation.invoiceNegotiationProcess.discountType;
                newBulkNegotiation.payerCurrentAmount = newBulkNegotiation.providerCurrentAmount;
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
            await InvoiceNegotiationBulkDAO.saveBulkNegotiation(bulkNegotiation);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        
        console.log('SERVICE: Ending updateInvoiceBulkNegotiationById');
    }

    static async cancelInvoiceBulkNegotiation(bulkNegotiationId: number, enterpriseId: number, userId: number) {
        console.log('SERVICE: Starting cancelInvoiceBulkNegotiation');
        console.log('bulkNegotiationId -->>', bulkNegotiationId);
        console.log('enterpriseId', enterpriseId);
        
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const invoiceBullkNegotitation = await InvoiceNegotiationBulkDAO.getByIdAndEnterpriseId(bulkNegotiationId, enterpriseId);
        console.log(invoiceBullkNegotitation);
        if(!invoiceBullkNegotitation) throw new ConflictException('SCF.LIBERA.248', {bulkNegotiationId, enterpriseId});
        if(invoiceBullkNegotitation.status == EnterpriseInvoiceBulkNegotiationStatusEnum.NEGOTIATION_CANCELED)
            throw new ConflictException('SCF.LIBERA.261', {bulkNegotiationId});
        const bpmProccesInstanceId = invoiceBullkNegotitation.invoiceNegotiationProcess.bpmProcessInstance;

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: bpmProccesInstanceId.toString(),
            event_id: 'PAYER_CANCEL_NEGOTIATION',
            reply: {
                reply: 'true',
                userId: userId.toString(),
            }         
        }   
        console.log('specificProcessInstance -->>', specificProcessInstance);
             
        try {
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result ', result);
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending cancelInvoiceBulkNegotiation');
    }

    /***** Bulk discount negotiation ******/

    static async getProviderBulkInvoiceNegotiations(enterpriseId: number, filter: IFilterBasic) {
        console.log("SERVICE: Starting getProviderBulkInvoiceNegotiations function...");
        console.log(`enterpriseId received >>>> ${enterpriseId}`);
        console.log(`filters received >>>> ${JSON.stringify(filter)}`);

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const bulkNegotiationRequests = await InvoiceNegotiationBulkDAO.getAllByProviderEnterpriseIdAndFilters(
            enterpriseId, filter);

        const result = bulkNegotiationRequests[0].map(item =>({
            id: +item.id,
            folio: item.folioNumber,
            payer:  {
                id: +item.provider.id,
                enterpriseName: item.provider.enterpriseName
            },
            amountInvoices: +item.amountInvoices,
            amount: +item.amount,
            creationDate: item.creationDate,
            status: item.status   
        }));

        const total = bulkNegotiationRequests[1];
        
        console.log('Result --->', result);
        console.log("SERVICE: Ending getProviderBulkInvoiceNegotiations function...");

        return {result, total};
    }

    static async getBulkNegotiationRequestById(enterpriseId: number, bulkNegotiationId: number) {
        console.log("SERVICE: Starting getBulkNegotiationRequestById function...");
        console.log(`enterpriseId received >>>> ${enterpriseId}`);
        console.log(`bulkNegotiationId received >>>> ${bulkNegotiationId}`);
        let bulkNegotiation: BulkDiscountRequestInterface;
        let availableQuota: number;

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);

        if (!enterprise || enterprise.status == EnterpriseStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const bulkNegotiationEntity: EnterpriseInvoiceBulkNegotiation = 
            await InvoiceNegotiationBulkDAO.getById(bulkNegotiationId);
        
        if(!bulkNegotiationEntity)
            throw new ConflictException('SCF.LIBERA.258', { bulkNegotiationId });

        if(bulkNegotiationEntity.provider.id != enterprise.id)
            throw new ConflictException('SCF.LIBERA.248', { bulkNegotiationId, enterpriseId });

        const enterpriseFundingLink = await EnterpriseFundingLinkDAO
            .getBasicByLenderIdAndPayerId(
                bulkNegotiationEntity.lender.id, bulkNegotiationEntity.enterprise.id);
    
        if (!enterpriseFundingLink)
            throw new ConflictException('SCF.LIBERA.240',
                { lenderId: bulkNegotiationEntity.lender.id, enterpriseId });
    
        const balanceData = await EnterpriseFundingLinkDAO.getGeneralBalance(enterpriseFundingLink.id);

        availableQuota = balanceData.generalBalance;
       
        let invoices = bulkNegotiationEntity.realtionBulkNegotiation.map(function(relationBulkNegotiation){

            let invoice = relationBulkNegotiation.enterpriseInvoice;

            let responseInvoice = {
                id: +invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                provider: {
                    id: +invoice.provider.id,
                    enterpriseName: invoice.provider.enterpriseName,
                    nit: invoice.provider.nit
                },
                emissionDate: invoice.emissionDate,
                expirationDate: invoice.expirationDate,
                amount: +invoice.amount,
                currencyCode: invoice.currencyCode.code
            }
            
            return responseInvoice;
        });

        bulkNegotiation = {
            id: +bulkNegotiationEntity.id,
            folio: bulkNegotiationEntity.folioNumber,
            amountInvoices: +bulkNegotiationEntity.amountInvoices,
            amount: +bulkNegotiationEntity.amount,
            currentAmount: +bulkNegotiationEntity.currentAmount,
            creationDate: bulkNegotiationEntity.creationDate,
            creationUser: +bulkNegotiationEntity.creationUser.id,
            finishDate: bulkNegotiationEntity.finishedDate,
            status: bulkNegotiationEntity.status,
            provider: !bulkNegotiationEntity.provider ? null : {
                id: +bulkNegotiationEntity.provider.id,
                enterpriseName: bulkNegotiationEntity.provider.enterpriseName
            },
            lender: !bulkNegotiationEntity.lender ? null : {
                id: +bulkNegotiationEntity.lender.id,
                enterpriseName: bulkNegotiationEntity.lender.enterpriseName,
                availableQuota: +availableQuota
            },
            negotiation: {
                status: bulkNegotiationEntity.invoiceNegotiationProcess.status,
                payerOffer: {
                    discountValue: +bulkNegotiationEntity.payerCurrentAmount,
                    discountType: bulkNegotiationEntity.invoiceNegotiationProcess
                        .payerRequestedDiscountType,
                    percentage: +bulkNegotiationEntity.invoiceNegotiationProcess
                        .payerDiscountPorcentage,
                    discountDueDate: bulkNegotiationEntity.invoiceNegotiationProcess
                        .payerRequestedDiscountDueDate,
                    expectedPaymentDate: bulkNegotiationEntity.invoiceNegotiationProcess
                        .payerRequestedPaymentDate
                },
                providerOffer: bulkNegotiationEntity.invoiceNegotiationProcess.status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED
                    && bulkNegotiationEntity.invoiceNegotiationProcess.providerDiscountPorcentage
                    && bulkNegotiationEntity.invoiceNegotiationProcess.providerRequestedDiscountDueDate
                    && bulkNegotiationEntity.invoiceNegotiationProcess.providerRequestedPaymentDate
                    ? {
                        discountValue: +bulkNegotiationEntity.providerCurrentAmount,
                        discountType: bulkNegotiationEntity.invoiceNegotiationProcess.providerRequestedDiscountType,
                        percentage: +bulkNegotiationEntity.invoiceNegotiationProcess.providerDiscountPorcentage,
                        discountDueDate: bulkNegotiationEntity.invoiceNegotiationProcess.providerRequestedDiscountDueDate,
                        expectedPaymentDate: bulkNegotiationEntity.invoiceNegotiationProcess.providerRequestedPaymentDate
                    } : null
            },
            invoices: invoices
        };

        console.log("SERVICE: Ending getBulkNegotiationRequestById function...");

        return bulkNegotiation;
    }
}