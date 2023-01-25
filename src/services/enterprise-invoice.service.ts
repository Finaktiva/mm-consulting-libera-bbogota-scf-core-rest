import { EnterpriseInvoice } from "entities/enterprise-invoice";
import { EnterpriseDAO } from "dao/enterprise.dao";
import { EnterpriseStatusEnum } from "commons/enums/enterprise-status.enum";
import { ConflictException, BadRequestException } from "commons/exceptions";
import moment = require("moment");
import { EnterpriseInvoiceStatusEnum } from "commons/enums/enterprise-invoice-status.enum";
import { EnterpriseInvoiceDAO } from "dao/enterprise-invoice.dao";
import { EnterpriseInvoiceCustomAttributes } from "entities/enterprise-invoice-custom-attributes";
import { EnterpriseInvoiceCustomAttributesDAO } from "dao/enterprise-invoice-custom-attributes.dao";
import { InvoiceNegotiationProcessDAO } from "dao/invoice-negotiation-process.dao";
import LiberaUtils from "commons/libera.utils";
import { FilterLastInvoiceNegotiationEnum } from "commons/enums/filter-by.enum";
import { UserDAO } from "dao/user.dao";
import { EnterpriseInvoiceNegotiationProcessStatus } from "commons/enums/enterprise-invoice-negotiation-process-status.enum";
import { InvoiceNegotiationProcess } from "entities/enterprise-invoice-negotiation-process";
import { SimpleFilter } from "commons/filter";
import { EInvoiceBulk } from "commons/interfaces/invoice.interface";
import { EnterpriseInvoiceBulkDAO } from "dao/enterprise-invoice-bulk.dao";
import { CatCurrencyDAO } from "dao/cat-currency.dao";
import { CatCurrency } from "entities/cat-currency";
import { CatCustomAttributesDAO } from "dao/cat-custom-attributes.dao";
import { IEnterpriseInvoice } from "commons/interfaces/enterprise-invoice.interface";
import { EnterpriseInvoiceBulk } from "entities/enterprise-invoice-bulk";
import { Enterprise } from 'entities/enterprise';
import { EnterpriseInvoiceBulkStatus } from "commons/enums/enterprise-invoice-bulk-status.enum";

export class EnterpriseInvoiceService {
    static async createInvoice(data: IEnterpriseInvoice, enterpriseId?: number, userId?: number) {
        console.log('SERVICE: Starting createInvoice method');
        console.log('data', data);
        const invoiceNumber = data.invoiceNumber;
        let savedInvoiceId: number;
        let enterpriseInvoiceBulk: EnterpriseInvoiceBulk;
        let enterprise: Enterprise;
        let creationUser: any;
        const enterpriseInvoiceExist = await EnterpriseInvoiceDAO.getByInvoiceNumber(enterpriseId ? enterpriseId : data.enterpriseId , invoiceNumber);
        if (enterpriseInvoiceExist) throw new BadRequestException('SCF.LIBERA.180',{ invoiceNumber });


        try {



            if (data.enterpriseInvoiceBulkId) {
                enterpriseInvoiceBulk = await EnterpriseInvoiceBulkDAO.getById(data.enterpriseInvoiceBulkId);
                console.log('enterpriseInvoiceBulk --->>', enterpriseInvoiceBulk);
            }

            if (!data.enterpriseInvoiceBulkId) {
                creationUser = await UserDAO.getUserById(userId);
                enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
                if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)
                    throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
            }
            let nInvoice: EnterpriseInvoice = new EnterpriseInvoice();
            let customAttributes: EnterpriseInvoiceCustomAttributes;

            console.log('data.payment', data.payment);
            nInvoice.enterprise = enterpriseInvoiceBulk ? enterpriseInvoiceBulk.enterprise : enterprise;
            nInvoice.enterpriseInvoiceBulk = enterpriseInvoiceBulk ? enterpriseInvoiceBulk : null;
            nInvoice.creationDate = moment(moment.now(), 'x').toDate();
            nInvoice.creationUser = enterpriseInvoiceBulk ? enterpriseInvoiceBulk.creationUser : creationUser;
            nInvoice.status = EnterpriseInvoiceStatusEnum.LOADED;
            nInvoice.emissionDate = data.emissionDate ? data.emissionDate : moment(moment.now(), 'x').toDate();
            nInvoice.documentType = data.documentType;
            nInvoice.invoiceNumber = data.invoiceNumber;
            nInvoice.expirationDate = data.expirationDate;
            nInvoice.alternativeInvoiceNumber = data.alternativeInvoiceId;
            nInvoice.paymentDate = null;
            nInvoice.paymentType = data.paymentType;
            nInvoice.amount = data.payment.amount;
            nInvoice.currentExpectedPaymentDate = data.expirationDate;
            if (data.currencyCode) {
                const catCurrency = await CatCurrencyDAO.getByCode(data.currencyCode);
                nInvoice.currencyCode = catCurrency;
            }
            nInvoice.vat = data.payment.vat;
            nInvoice.advancePayment = data.payment.inAdvance;
            nInvoice.retentions = data.payment.retentions;
            nInvoice.creditNotesValue = data.payment.creditNotesValue;
            if (data.provider) {
                const enterpriseProvider = await EnterpriseDAO.getEnterpriseByNIT(data.provider.nit);
                nInvoice.provider = enterpriseProvider;
            }
            if (data.lenderId) {
                const enterpriseLender = await EnterpriseDAO.getEnterpriseById(data.lenderId);
                nInvoice.lender = enterpriseLender;
            }
            const savedInvoice = await EnterpriseInvoiceDAO.saveInvoice(nInvoice);
            console.log('savedInvoice --->>',savedInvoice);

            if (enterpriseInvoiceBulk) {
                console.log('before enterpriseInvoiceBulk.successfulLoadedCount -->>', enterpriseInvoiceBulk.successfulLoadedCount)
                enterpriseInvoiceBulk.successfulLoadedCount += 1;
                console.log('after enterpriseInvoiceBulk.successfulLoadedCount -->>', enterpriseInvoiceBulk.successfulLoadedCount)
                await EnterpriseInvoiceBulkDAO.saveInvoiceBulk(enterpriseInvoiceBulk);
                if ((enterpriseInvoiceBulk.successfulLoadedCount + enterpriseInvoiceBulk.errorLoadedCount) === enterpriseInvoiceBulk.initialLoadCount)
                    await EnterpriseInvoiceBulkDAO.updateInvoiceBulkStatus(data.enterpriseInvoiceBulkId, EnterpriseInvoiceBulkStatus.COMPLETED);
            }

            let eInvoiceCustomAttributes = [];
            let findAttributes = [];
            if(data.customAttributes) {
                for(let i=0; i<data.customAttributes.length; i++) {               
                    customAttributes = new EnterpriseInvoiceCustomAttributes();
                    customAttributes.enterpriseInvoice = savedInvoice;
                    const catCustomAttribute = await CatCustomAttributesDAO.getById(data.customAttributes[i].id);
                    customAttributes.catCustomAttributes = catCustomAttribute;
                    customAttributes.value = data.customAttributes[i].value;
                    const saveCustomAttributes = await EnterpriseInvoiceCustomAttributesDAO.saveCustomAttributes(customAttributes);
                    eInvoiceCustomAttributes.push(saveCustomAttributes);

                    const cAttributes = await EnterpriseInvoiceCustomAttributesDAO.getCustomAttributesById(data.customAttributes[i].id);
                    findAttributes.push(cAttributes);
                }
            }
            savedInvoiceId = +savedInvoice.id;
            console.log('savedInvoice', savedInvoice);
            const result = {
                id: +savedInvoice.id,
                invoiceNumber: savedInvoice.invoiceNumber,
                alternativeInvoiceId: savedInvoice.alternativeInvoiceNumber ? savedInvoice.alternativeInvoiceNumber : null,
                documentType: savedInvoice.documentType,
                creationDate: savedInvoice.creationDate,
                emissionDate: savedInvoice.emissionDate ? savedInvoice.emissionDate : null,
                expirationDate: savedInvoice.expirationDate,
                effectivePaymentDate: savedInvoice.effectivePaymentDate,
                status: savedInvoice.status,
                currencyCode: savedInvoice.currencyCode.code,
                payment: {
                    inAdvance: +savedInvoice.advancePayment,
                    creditNotesValue: +savedInvoice.creditNotesValue,
                    retentions: +savedInvoice.retentions,
                    paymentType: savedInvoice.paymentType,
                    vat: +savedInvoice.vat,
                    amount: +savedInvoice.amount
                },
                provider: savedInvoice && savedInvoice.provider ? {
                    id: +savedInvoice.provider.id,
                    enterpriseName: savedInvoice.provider.enterpriseName,
                    nit: savedInvoice.provider.nit,
                    owner: savedInvoice.provider && savedInvoice.provider.owner ? {
                        id: +savedInvoice.provider.id,
                        name: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.name : null,
                        firstSurname: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.firstSurname : null,
                        secondSurname: savedInvoice.provider.owner && savedInvoice.provider.owner.userProperties ? savedInvoice.provider.owner.userProperties.secondSurname : null,
                        email: savedInvoice.provider.owner.email,
                    } : null
                } : null,
                lender: savedInvoice && savedInvoice.lender ? {
                    id: +savedInvoice.lender.id,
                    enterpriseName: savedInvoice.lender.enterpriseName,
                    nit: savedInvoice.lender.nit,
                    owner: savedInvoice.lender && savedInvoice.lender.owner ? {
                        id: +savedInvoice.lender.id,
                        name: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.name : null,
                        firstSurname: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.firstSurname : null,
                        secondSurname: savedInvoice.lender.owner && savedInvoice.lender.owner.userProperties ? savedInvoice.lender.owner.userProperties.secondSurname : null,
                        email: savedInvoice.lender.owner.email,
                    } : null
                } : null,
                negotiation: savedInvoice.invoiceNegotiationProcess && savedInvoice.invoiceNegotiationProcess.length != 0 ? {
                    discountValue: savedInvoice.invoiceNegotiationProcess 
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                        savedInvoice.invoiceNegotiationProcess[savedInvoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, 
                        savedInvoice.amount, 
                        savedInvoice.invoiceNegotiationProcess[savedInvoice.invoiceNegotiationProcess.length - 1].discountType, 
                        savedInvoice.expirationDate, 
                        savedInvoice.emissionDate
                    ) : null,
                    expectedPaymentDate: data.expirationDate,
                    percentage: savedInvoice.invoiceNegotiationProcess ? savedInvoice.invoiceNegotiationProcess[savedInvoice.invoiceNegotiationProcess.length-1].currentDiscountPercentage : null,
                    discountDays: +LiberaUtils.getDiffDates(savedInvoice.invoiceNegotiationProcess[savedInvoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate),
                    paymentDueDays: savedInvoice.invoiceNegotiationProcess
                    ? LiberaUtils.getDiffDates(savedInvoice.invoiceNegotiationProcess[savedInvoice.invoiceNegotiationProcess.length-1].currentExpectedPaymentDate)
                    : null
                } : null,
                customAttributes: findAttributes && findAttributes.length != 0 ? findAttributes.map(cAttribute => cAttribute && cAttribute.catCustomAttributes ? { 
                    id: +cAttribute.catCustomAttributes.id,
                    name: cAttribute.name,
                    value: cAttribute.value 
                } : null).filter(item => item) : []
            }
            console.log('SERVICE: Ending createInvoice method');
            return result;
        }
        catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            if (enterpriseInvoiceBulk) {
                enterpriseInvoiceBulk.errorLoadedCount += 1;
                enterpriseInvoiceBulk.successfulLoadedCount -= 1;
                await EnterpriseInvoiceBulkDAO.saveInvoiceBulk(enterpriseInvoiceBulk);
            }
            if (savedInvoiceId)
                await EnterpriseInvoiceDAO.rollbackInvoiceBulk(savedInvoiceId);
        }
    }

    static async getInvoiceById(enterpriseId: number, invoiceId: number) {
        console.log('SERVICE: Starting getInvoiceById method');

        const eInvoice = await EnterpriseInvoiceDAO.getInvoiceById(enterpriseId, invoiceId);

        if (!eInvoice || eInvoice.status === EnterpriseInvoiceStatusEnum.DELETED)
            throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId }) 
                  
        const result = {
            id: +eInvoice.id,
            currentExpectedPaymentDate: eInvoice.currentExpectedPaymentDate,
            invoiceNumber: eInvoice.invoiceNumber,
            alternativeInvoiceId: eInvoice.alternativeInvoiceNumber ? eInvoice.alternativeInvoiceNumber : null,
            documentType: eInvoice.documentType,
            creationDate: eInvoice.creationDate,
            emissionDate: eInvoice.emissionDate,
            expirationDate: eInvoice.expirationDate,
            effectivePaymentDate: eInvoice.paymentDate ? eInvoice.paymentDate : null,
            status: eInvoice.status,
            bulkNegotiationId: eInvoice.bulkNegotiation? +eInvoice.bulkNegotiation.id : null,
            currencyCode: eInvoice.currencyCode.code,
            payment: {
                inAdvance: +eInvoice.advancePayment,
                creditNotesValue: +eInvoice.creditNotesValue,
                retentions: +eInvoice.retentions,
                vat: +eInvoice.vat,
                amount: +eInvoice.amount,
                paymentType: eInvoice.paymentType
            },
            provider: eInvoice.provider && eInvoice.provider != undefined ? {
                id: +eInvoice.provider.id,
                enterpriseName: eInvoice.provider && eInvoice.provider.enterpriseName ? eInvoice.provider.enterpriseName : null,
                nit: eInvoice.provider && eInvoice.provider.nit ? eInvoice.provider.nit : null,
                owner: eInvoice.provider.owner ? {
                    id: +eInvoice.provider.owner.id,
                    name: eInvoice.provider.owner.userProperties ? eInvoice.provider.owner.userProperties.name : null,
                    firstSurname: eInvoice.provider.owner.userProperties ? eInvoice.provider.owner.userProperties.firstSurname : null,
                    secondSurname: eInvoice.provider.owner.userProperties ? eInvoice.provider.owner.userProperties.secondSurname : null,
                    email: eInvoice.provider.owner.email ? eInvoice.provider.owner.email : null
                } : null
            } : null,
            lender: eInvoice.lender && eInvoice.lender != undefined ? {
                id: eInvoice.lender ? +eInvoice.lender.id : null,
                enterpriseName: eInvoice.lender ? eInvoice.lender.enterpriseName : null,
                nit: eInvoice.lender ? eInvoice.lender.nit : null,
                owner: eInvoice.lender.owner ? {
                    id: eInvoice.lender.owner.id ? +eInvoice.lender.owner.id : null,
                    name: eInvoice.lender.owner.userProperties.name ? eInvoice.lender.owner.userProperties.name : null,
                    firstSurname: eInvoice.lender.owner.userProperties.firstSurname ? eInvoice.lender.owner.userProperties.firstSurname : null,
                    secondSurname: eInvoice.lender.owner.userProperties.secondSurname ? eInvoice.lender.owner.userProperties.secondSurname : null,
                    email: eInvoice.lender.owner.email ? eInvoice.lender.owner.email : null
                } : null
            } : null,
            negotiation: (eInvoice.invoiceNegotiationProcess && eInvoice.invoiceNegotiationProcess.length != 0) ? {
                discountValue: eInvoice.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                        eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, 
                        eInvoice.amount, 
                        eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].discountType, 
                        eInvoice.expirationDate, eInvoice.emissionDate)
                    : null,
                expectedPaymentDate: eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate,
                percentage: eInvoice.invoiceNegotiationProcess ? eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage : null,
                discountDays: +LiberaUtils.getDiffDates(
                    eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate
                    ),
                paymentDueDays: eInvoice.invoiceNegotiationProcess
                    ? LiberaUtils.getDiffDates(
                        eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate
                        )
                    : null
            } : (eInvoice.bulkNegotiation) ? {
                discountValue: eInvoice.bulkNegotiation.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(
                        eInvoice.bulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage, 
                        eInvoice.amount, 
                        eInvoice.bulkNegotiation.invoiceNegotiationProcess.discountType, 
                        eInvoice.expirationDate, 
                        eInvoice.emissionDate)
                    : null,
                expectedPaymentDate: eInvoice.bulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate,
                percentage: eInvoice.bulkNegotiation.invoiceNegotiationProcess ? eInvoice.bulkNegotiation.invoiceNegotiationProcess.currentDiscountPercentage : null,
                discountDays: +LiberaUtils.getDiffDates(
                    eInvoice.bulkNegotiation.invoiceNegotiationProcess.currentDiscountDueDate
                    ),
                paymentDueDays: eInvoice.bulkNegotiation.invoiceNegotiationProcess
                    ? LiberaUtils.getDiffDates(
                        eInvoice.bulkNegotiation.invoiceNegotiationProcess.currentExpectedPaymentDate
                        )
                    : null  
            } 
            : null,
            customAttributes:
                eInvoice.enterpriseInvoiceCustomAttributes && eInvoice.enterpriseInvoiceCustomAttributes.length != 0 ? eInvoice.enterpriseInvoiceCustomAttributes.map(cAttribute => cAttribute && cAttribute.catCustomAttributes ? {
                    id: +cAttribute.catCustomAttributes.id,
                    name: cAttribute.catCustomAttributes.name,
                    value: cAttribute.value,
                    type: cAttribute.catCustomAttributes.type
                } : null).filter(item => item) : null
        };

        console.log('SERVICE: Ending getInvoiceById method');
        return result;
    }

    static async getInvoiceNegotiations(enterpriseId: number, invoiceId: number, params: any) {
        console.log('SERVICE: Starting getInvoiceNegotiations method...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const eInvoice = await EnterpriseInvoiceDAO.getBasicEnterpriseInvoice(enterpriseId, invoiceId);
        if (!eInvoice || eInvoice.status === EnterpriseInvoiceStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.130', { invoiceId, enterpriseId });

        if (params.size && +params.size == 0) return [];
        const invoiceNegotiations: InvoiceNegotiationProcess[] = await InvoiceNegotiationProcessDAO.getInvoiceNegotiationsAndOrderBy(enterpriseId, invoiceId, params);

        const result = invoiceNegotiations.map(({ negotiationProcess, enterpriseInvoice, creationDate, finishedDate, providerRequestedDiscountDueDate, providerRequestedPaymentDate, discountType, payerDiscountPorcentage, status, payerRequestedDiscountDueDate, payerRequestedPaymentDate, providerDiscountPorcentage, payerRequestedDiscountType, providerRequestedDiscountType }) => ({
            id: negotiationProcess,
            invoiceNumber: enterpriseInvoice.invoiceNumber,
            amount: enterpriseInvoice.amount,
            creationDate,
            finishedDate,
            status,
            payerOffer: status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED && payerDiscountPorcentage && payerRequestedDiscountDueDate && payerRequestedPaymentDate ? {
                discountType: payerRequestedDiscountType,
                percentage: payerDiscountPorcentage,
                discountDueDate: payerRequestedDiscountDueDate,
                expectedPaymentDate: payerRequestedPaymentDate,
                discountValue: eInvoice.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].payerDiscountPorcentage, eInvoice.amount, eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].payerRequestedDiscountType, eInvoice.expirationDate, eInvoice.emissionDate)
                    : null,
            } : null,
            providerOffer: status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED && providerDiscountPorcentage && providerRequestedDiscountDueDate && providerRequestedPaymentDate ? {
                discountType: providerRequestedDiscountType,
                percentage: providerDiscountPorcentage,
                discountDueDate: providerRequestedDiscountDueDate,
                expectedPaymentDate: providerRequestedPaymentDate,
                discountValue: eInvoice.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].providerDiscountPorcentage, eInvoice.amount, eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].providerRequestedDiscountType, eInvoice.expirationDate, eInvoice.emissionDate)
                    : null,
            } : null
        }))

        console.log('SERVICE: Ending getInvoiceNegotiations method...');
        return result;
    }

    static async getAllProviderNegotiations(enterpriseId: number, params: any) {
        console.log('SERVICE: Starting getAllProviderNegotiations method...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        let result = await EnterpriseInvoiceDAO.getProviderInvoicesByEnterpriseId(enterpriseId, params);

        if (params.filterBy && params.filterBy == FilterLastInvoiceNegotiationEnum.discountValue) {
            result[0] = result[0].filter(invoice => {
                const discountValue = invoice.invoiceNegotiationProcess.length ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, invoice.amount, invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].discountType, invoice.expirationDate, invoice.emissionDate) : 0;
                if (discountValue == +params.q) return invoice;
            })
        }

        const invoiceNegotiations = result[0].map(invoice => ({
            id: +invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            alternativeInvoiceId: invoice.alternativeInvoiceNumber,
            documentType: invoice.documentType,
            creationDate: invoice.creationDate,
            creationUser: +invoice.creationUser.id,
            emissionDate: invoice.emissionDate,
            expirationDate: invoice.expirationDate,
            effectivePaymentDate: invoice.currentExpectedPaymentDate,
            status: invoice.status,
            currencyCode: invoice.currencyCode.code,
            payment: {
                inAdvance: +invoice.advancePayment,
                creditNotesValue: +invoice.creditNotesValue,
                retentions: +invoice.retentions,
                vat: +invoice.vat,
                amount: +invoice.amount,
                paymentType: invoice.paymentType
            },
            payer: invoice.enterprise && invoice.enterprise != undefined ? {
                id: invoice.enterprise ? +invoice.enterprise.id : null,
                enterpriseName: invoice.enterprise ? invoice.enterprise.enterpriseName : null,
                nit: invoice.enterprise ? invoice.enterprise.nit : null,
                owner: invoice.enterprise && invoice.enterprise.owner ? {
                    id: invoice.enterprise.owner.id ? +invoice.enterprise.owner.id : null,
                    name: invoice.enterprise.owner.userProperties.name ? invoice.enterprise.owner.userProperties.name : null,
                    firstSurname: invoice.enterprise.owner.userProperties.firstSurname ? invoice.enterprise.owner.userProperties.firstSurname : null,
                    secondSurname: invoice.enterprise.owner.userProperties ? invoice.enterprise.owner.userProperties.secondSurname : null,
                    email: invoice.enterprise.owner.email ? invoice.enterprise.owner.email : null
                } : null
            } : null,
            lender: invoice.lender && invoice.lender != undefined ? {
                id: invoice.lender ? +invoice.lender.id : null,
                enterpriseName: invoice.lender ? invoice.lender.enterpriseName : null,
                nit: invoice.lender ? invoice.lender.nit : null,
                owner: invoice.lender && invoice.lender.owner ? {
                    id: invoice.lender.owner.id ? +invoice.lender.owner.id : null,
                    name: invoice.lender.owner.userProperties.name ? invoice.lender.owner.userProperties.name : null,
                    firstSurname: invoice.lender.owner.userProperties.firstSurname ? invoice.lender.owner.userProperties.firstSurname : null,
                    secondSurname: invoice.lender.owner.userProperties.secondSurname ? invoice.lender.owner.userProperties.secondSurname : null,
                    email: invoice.lender.owner.email ? invoice.lender.owner.email : null
                } : null
            } : null,
            negotiation: invoice.invoiceNegotiationProcess.length ? {
                amount: +invoice.amount,
                discountType: invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].discountType,
                percentage: +invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage,
                discountDueDate: invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountDueDate,
                expectedPaymentDate: invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentExpectedPaymentDate,
                discountValue: +LiberaUtils.calculateDiscountValueByTypeOfDiscount(invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].currentDiscountPercentage, invoice.amount, invoice.invoiceNegotiationProcess[invoice.invoiceNegotiationProcess.length - 1].discountType, invoice.expirationDate, invoice.emissionDate)
            } : null
        }));

        console.log('SERVICE: Ending getAllProviderNegotiations method...');
        return { invoiceNegotiations, total: result[1] };
    }

    static async getProviderInvoiceNegotiations(enterpriseId: number, invoiceId: number, params: any) {
        console.log('SERVICE: Starting getProviderInvoiceNegotiations method...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });
        const eInvoice = await EnterpriseInvoice.getBasicEnterpriseInvoiceByIdAndProviderId(enterpriseId, invoiceId);
        if (!eInvoice || eInvoice.status === EnterpriseInvoiceStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.158', { invoiceId, enterpriseId });

        if (params.size && +params.size == 0) return [];
        const invoiceNegotiations = await InvoiceNegotiationProcessDAO.getProviderInvoiceNegotiationsAndOrderBy(enterpriseId, invoiceId, params);

        const result = invoiceNegotiations.map(item => ({
            id: +item.negotiationProcess,
            invoiceNumber: item.enterpriseInvoice.invoiceNumber,
            amount: +item.enterpriseInvoice.amount,
            creationDate: item.creationDate,
            finishDate: item.finishedDate,
            status: item.status,
            payerOffer: item.status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED && item.payerDiscountPorcentage && item.payerRequestedDiscountDueDate && item.payerRequestedPaymentDate ? {
                discountType: item.payerRequestedDiscountType,
                percentage: +item.payerDiscountPorcentage,
                discountDueDate: item.payerRequestedDiscountDueDate,
                expectedPaymentDate: item.payerRequestedPaymentDate,
                discountValue: eInvoice.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].payerDiscountPorcentage, eInvoice.amount, eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].payerRequestedDiscountType, eInvoice.expirationDate, eInvoice.emissionDate)
                    : null,
            } : null,
            providerOffer: item.status != EnterpriseInvoiceNegotiationProcessStatus.CANCELLED && item.providerDiscountPorcentage && item.providerRequestedDiscountDueDate && item.providerRequestedPaymentDate ? {
                discountType: item.providerRequestedDiscountType,
                percentage: +item.providerDiscountPorcentage,
                discountDueDate: item.providerRequestedDiscountDueDate,
                expectedPaymentDate: item.providerRequestedPaymentDate,
                discountValue: eInvoice.invoiceNegotiationProcess
                    ? +LiberaUtils.calculateDiscountValueByTypeOfDiscount(eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].providerDiscountPorcentage, eInvoice.amount, eInvoice.invoiceNegotiationProcess[eInvoice.invoiceNegotiationProcess.length - 1].providerRequestedDiscountType, eInvoice.expirationDate, eInvoice.emissionDate)
                    : null,
            } : null
        }));

        console.log('SERVICE: Ending getProviderInvoiceNegotiations method...');
        return result;
    }

    static async getEnterpriseInvoiceBulk(enterpriseId: number, filter: SimpleFilter) {
        console.log('SERVICE: Starting getEnterpriseInvoiceBulk method');
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const invoiceBulksResult = await EnterpriseInvoiceBulkDAO.getAllByEnterpriseIdAndFilter(enterpriseId, filter);
        console.log('invoiceBulksResult', invoiceBulksResult);
        const invoiceBulksPage = {
            items: [],
            total: 0
        };
        invoiceBulksPage.total = invoiceBulksResult[1];
        for (let invoiceBulk of invoiceBulksResult[0]) {
            let item = {
                id: +invoiceBulk.id,
                filename: invoiceBulk.s3Metadata ? invoiceBulk.s3Metadata.filename : null,
                status: invoiceBulk.status,
                folio: invoiceBulk.folioNumber,
                creationDate: invoiceBulk.creationDate,
                creationUser: invoiceBulk.creationUser ? +invoiceBulk.creationUser.id : null,
                totalCount: invoiceBulk.initialLoadCount ? invoiceBulk.initialLoadCount : +0,
                successCount: invoiceBulk.successfulLoadedCount != null ? invoiceBulk.successfulLoadedCount : +0,
                errorCount: invoiceBulk.errorLoadedCount ? invoiceBulk.errorLoadedCount : +0
            };
            invoiceBulksPage.items.push(item);
        }

        console.log('SERVICE: Ending getEnterpriseInvoiceBulk method');
        return invoiceBulksPage;
    }

    static async createInvoiceOfBulk(bulk: EInvoiceBulk) {
        console.log('SERVICE: StartingcreateInvoiceOfBulk');
        const { invoice, paymentType, currencyCode, documentType, enterpriseInvoiceBulkId, customAttribute } = bulk;
        const invoiceBulk: EnterpriseInvoiceBulk = await EnterpriseInvoiceBulkDAO.getById(enterpriseInvoiceBulkId);
        if (!invoiceBulk)
            return;

        let inv: EnterpriseInvoice;
        let currency: CatCurrency = await CatCurrencyDAO.getByCode(currencyCode);
        let cAttribute: EnterpriseInvoiceCustomAttributes;
        try {
            inv = new EnterpriseInvoice();
            inv.enterpriseInvoiceBulk = invoiceBulk;
            inv.creationDate = moment(moment.now(), 'x').toDate();
            inv.currencyCode = currency;
            inv.amount = invoice.payment.amount;
            inv.enterprise = invoiceBulk.enterprise;
            inv.invoiceNumber = invoice.invoiceNumber;
            inv.paymentType = paymentType;
            inv.provider = await EnterpriseDAO.getEnterpriseByNIT(invoice.providerNIT);
            inv.retentions = invoice.payment.retentions;
            inv.status = EnterpriseInvoiceStatusEnum.LOADED;
            inv.vat = invoice.payment.vat;
            inv.advancePayment = invoice.payment.inAdvance;
            inv.creationUser = invoiceBulk.creationUser;
            inv.currentAmount = invoice.payment.amount;
            inv.creditNotesValue = invoice.payment.creditNotesValue;
            inv.expirationDate = invoice.expirationDate;
            inv.emissionDate = invoice.emissionDate;
            inv.alternativeInvoiceNumber = invoice.alternativeInvoiceNumber;
            inv.documentType = documentType;
            invoiceBulk.successfulLoadedCount += 1;
            cAttribute = new EnterpriseInvoiceCustomAttributes();
            cAttribute.enterpriseInvoice = inv;
            cAttribute.catCustomAttributes = await CatCustomAttributesDAO.getById(customAttribute.id);
            cAttribute.value = customAttribute.value;

            await EnterpriseInvoiceDAO.saveInvoice(inv);
            await EnterpriseInvoiceCustomAttributesDAO.saveCustomAttributes(cAttribute);
            await EnterpriseInvoiceBulkDAO.saveInvoiceBulk(invoiceBulk);
        } catch (errors) {
            console.log('SERVICE ERRORS: ', errors);
            invoiceBulk.errorLoadedCount += 1;
            await EnterpriseInvoiceBulkDAO.saveInvoiceBulk(invoiceBulk);
            await EnterpriseInvoiceDAO.rollbackInvoiceBulk(inv.id);
        }

        console.log('SERVICE: Ending createInvoiceOfBulk');
    }
    
}