import moment from 'moment';
import uuid from 'uuid';
import { ISaveInvoiceNegotiationRecord } from "commons/interfaces/invoice-negotiation-process.interface";
import { UserDAO } from "dao/user.dao";
import { DiscountNegotiationsLogBookDAO } from "dao/logging/discount-negotiations-log-book.dao";
import LiberaUtils from "commons/libera.utils";
import { LogBook } from "entities/logging/log-book";
import { PayerEnterprise } from 'entities/logging/payer-enterprise';
import { ProviderEnterprise } from 'entities/logging/provider-enterprise';
import { IEnterpriseRecord } from 'commons/interfaces/enterprise-record.interface';
import { EnterpriseLogBook } from 'entities/logging/enterprise-log-book';
import { UserEnterpriseRecord } from 'entities/logging/user-enterprise';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { EnterpriseRecodLogBook } from 'entities/logging/enterprise-record-log-book';
import { EnterpriseRecordTypeEventEnum } from 'commons/enums/enterprise-record-type-event.enum';
import { EnterpriseDocumentationDAO } from 'dao/enterprise-documentation.dao';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseDocumentationStatusEnum } from 'commons/enums/enterprise-documentation-status.enum';
import { EnterpriseRecordLogBookDAO } from 'dao/logging/enterprise-record-log-book.dao';
import { EntitytoRecordEnum } from 'commons/enums/entity-to-record.enum';
import { Entity, AdvancedConsoleLogger } from 'typeorm';
import { Enterprise } from 'entities/enterprise';

export class EnterpriseRecordService {

    static async saveEnterpriseRecord(enterpriseRecord: IEnterpriseRecord){
        console.log('SERVICE: Starting saveEnterpriseRecord');
        const { eventDate, comments, typeEvent, userId, enterpriseId, entity } = enterpriseRecord;
        console.log('TYPEEVENT  ', typeEvent);
        console.log ('ENTITYE  ', entity);
        
        const user = await UserDAO.getBasicUserById(userId);
        if(!user)
            return;
        
        const enterpriseToRecod: Enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        enterpriseToRecod.type

        const enterpriseMongoExist = await EnterpriseRecordLogBookDAO.getenterpriseRecordLogBook(enterpriseId);
            
        const logUser = new UserEnterpriseRecord(user.id.toString(), user.userProperties.name, user.userProperties.firstSurname, user.userProperties.secondSurname)        
        const logBook = new EnterpriseLogBook(logUser, eventDate, typeEvent, comments);
        
        logBook.entity = entity  
        logBook.value = await EnterpriseRecordService.responseEnterpriseRecordTypeEventValue(typeEvent, +enterpriseId, entity, enterpriseToRecod);
        
        
        if (!enterpriseMongoExist){              
            const enterpriseRecodLogBook: EnterpriseRecodLogBook = new EnterpriseRecodLogBook();
            enterpriseRecodLogBook.enterpriseId = enterpriseId;
            enterpriseRecodLogBook.enterpriseName = enterpriseToRecod.enterpriseName;
            enterpriseRecodLogBook.nit = enterpriseToRecod.nit;

            const logBookArr: EnterpriseLogBook[] =[];
            logBookArr.push(logBook);
            enterpriseRecodLogBook.logBook = logBookArr;
            const discountNegotiationsLogBook = await EnterpriseRecordLogBookDAO.saveEnterpriseRecord(enterpriseRecodLogBook);
            console.log('discountNegotiationsLogBook', discountNegotiationsLogBook);
        }else{
            const logBookArr: EnterpriseLogBook[] = enterpriseMongoExist.logBook;
            logBookArr.push(logBook);
            const enterpriseRecodLogBook = await EnterpriseRecordLogBookDAO.updateEnterpriseRecordLogBook(enterpriseId, logBookArr);
            console.log('discountNegotiationsLogBook Update', enterpriseRecodLogBook);
        }

        console.log('SERVICE: Ending saveEnterpriseRecord');
    }

    static async responseEnterpriseRecordTypeEventValue(value: EnterpriseRecordTypeEventEnum, enterpiseId: number, entity: string, enterpriseToRecod: Enterprise) {
        
        if(!value) return null;
        let response;
      
        switch (value) {
          case EnterpriseRecordTypeEventEnum.DOCUMENT_APPROVED:
            const documenAproved = await EnterpriseDocumentationDAO.getLasDocByEnterpriseId(+enterpiseId, EnterpriseDocumentationStatusEnum.ACCEPTED);
            response = documenAproved.s3Metadata.filename;
            console.log('documentation', response);
            break;
          case EnterpriseRecordTypeEventEnum.DOCUMENT_REJECTED:
            const documentRejected = await EnterpriseDocumentationDAO.getLasDocByEnterpriseId(+enterpiseId, EnterpriseDocumentationStatusEnum.REJECTED);
            response = documentRejected.s3Metadata.filename;
            console.log('documentation', response);
            break;
          case EnterpriseRecordTypeEventEnum.DOCUMENT_REQUESTED:
            const documentRequest = await EnterpriseDocumentationDAO.getLasDocByEnterpriseId(+enterpiseId, EnterpriseDocumentationStatusEnum.RELOAD_FILE);
            response = documentRequest.s3Metadata.filename;
            console.log('documentation', response);
            break;
          case EnterpriseRecordTypeEventEnum.ENTERPRISE_APPROVED:
            response = null;
            break;
          case EnterpriseRecordTypeEventEnum.ENTERPRISE_REJECTED:
            response = null;
            break;
          case EnterpriseRecordTypeEventEnum.MODULE_APPROVED:
            const moduleAcepted = await EnterpriseRequestDAO.getEnterpriseRequestForRecodByEnterpriseId(+enterpiseId, EnterpriseRequestStatus.ACCEPTED);
            response = moduleAcepted.requestedModule; 
            console.log('ModuleAproved', response);
            break;
          case EnterpriseRecordTypeEventEnum.MODULE_REJECTED:
            const moducleRejected = await EnterpriseRequestDAO.getEnterpriseRequestForRecodByEnterpriseId(+enterpiseId, EnterpriseRequestStatus.REJECTED);
            response = moducleRejected.requestedModule;
            console.log('ModuleAproved', response);
            break;
          case EnterpriseRecordTypeEventEnum.MODULE_REQUESTED:
            const moduleRequest = await EnterpriseRequestDAO.getEnterpriseRequestForRecodByEnterpriseId(+enterpiseId, EnterpriseRequestStatus.REJECTED);
            response = moduleRequest.requestedModule;
            console.log('ModuleAproved', response);
            break;
          case EnterpriseRecordTypeEventEnum.PROFILE_UPDATED:
            if(entity == EntitytoRecordEnum.ENTERPRISE_NAME) response = enterpriseToRecod.enterpriseName;
            if(entity == EntitytoRecordEnum.ENTERPRISE_SECTOR) response = enterpriseToRecod.sector.name;
            if(entity == EntitytoRecordEnum.ENTERPRISE_TYPE) response = enterpriseToRecod.type;
            if(entity == EntitytoRecordEnum.OWNER_NAME) response = enterpriseToRecod.owner.userProperties.name;
            if(entity == EntitytoRecordEnum.OWNER_FIRST_SURNAME) response = enterpriseToRecod.owner.userProperties.firstSurname;
            if(entity == EntitytoRecordEnum.OWNER_SECOND_SURNAME) response = enterpriseToRecod.owner.userProperties.secondSurname;
            if(entity == EntitytoRecordEnum.LADA) response = enterpriseToRecod.lada.lada;
            if(entity == EntitytoRecordEnum.PHONE) response = enterpriseToRecod.phoneNumber;

            break;
            
        }
        return response;
    }

    
}