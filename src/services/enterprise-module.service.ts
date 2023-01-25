import moment from 'moment';
import { EnterpriseModule } from 'entities/enterprise-module';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { ConflictException, InternalServerException } from 'commons/exceptions';
import { EnterpriseModuleDAO } from 'dao/enterprise-module.dao';
import { EnterpriseModuleStatusEnum } from 'commons/enums/enterprise-module-status.enum';
import { SESService } from './ses.service';
import { EnterpriseDocumentationDAO } from 'dao/enterprise-documentation.dao';
import { EnterpriseDocumentationStatusEnum } from 'commons/enums/enterprise-documentation-status.enum';;
import { NotificationDAO } from 'dao/notification.dao';
import { Notification } from 'entities/notification';
import { CatNotificationTypeEnum } from 'commons/enums/cat-notification-type.enum';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { CatModuleDAO } from 'dao/cat-module.dao';
import { NotificationTypeDAO } from 'dao/notificationType.dao';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserDAO } from 'dao/user.dao';
import { EnterpriseRequest } from 'entities/enterprise-request';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseRequestTypeEnum } from 'commons/enums/enterprise-request-type.enum';
import { UserModule } from 'entities/user-module';
import { UserModuleDAO } from 'dao/user-module.dao';
import CognitoIdentityService from './cognito.identity.service';
import { UserRole } from 'entities/user-role';
import { RoleDAO } from 'dao/role.dao';
import { UserRoleDAO } from 'dao/user-role.dao';
import { EnterpriseLinkStatus } from 'commons/enums/enterprise-link-status.enum';
import { BPMService } from './bpm.service';
import { ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { TemporalTokensDAO } from 'dao/temporal-token.dao';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { EnterpriseRecordTypeEventEnum } from 'commons/enums/enterprise-record-type-event.enum';
import { SQSService } from './sqs.service';
import { Enterprise } from 'entities/enterprise';

const BPM_MODULE_RESOLUTION_EVENT = process.env.BPM_MODULE_RESOLUTION_EVENT;
const notificationSubject = process.env.NOTIFICATION_SUBJECT;
const SES_MODULE_REQUEST_DECLINED_TEMPLATE = process.env.SES_MODULE_REQUEST_DECLINED_TEMPLATE;
const SES_LINKING_RESOLUTION_EMAIL_REJECTED_TEMPLATE = process.env.SES_LINKING_RESOLUTION_EMAIL_REJECTED_TEMPLATE;
const SQS_LIBERA_ENTERPRISE_RECORD = process.env.SQS_LIBERA_ENTERPRISE_RECORD;

export class EnterpriseModuleService {

    static async setModuleToEnterprise(enterprise, modules){
        console.log('SERVICE: Starting setModuleToEnterprise');

        let enterpriseModules: EnterpriseModule[] = [];
        for(const iModule of modules){
            const enterpriseModule = new EnterpriseModule();
            enterpriseModule.enterprise = enterprise;
            enterpriseModule.catModule = iModule;
            enterpriseModule.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            enterpriseModules.push(enterpriseModule);
            await enterpriseModule.save();
        }
        
        console.log('SERVICE: Ending setModuleToEnterprise');
        return enterpriseModules;
    }

    static async updateEnterpriseRequestStatus(requestId: number, status: EnterpriseRequestStatus, explanation: string, sendEmail: boolean, userId:number) {
        console.log('SERVICE: Starting updateEnterpriseRequestStatus...');
        const request = await EnterpriseRequestDAO.getBasicEnterpriseRequest(requestId);
        if (!request) throw new ConflictException('SCF.LIBERA.82', { requestId });
        const owner = await UserDAO.getUserByIdAndModules(request.enterprise.owner.id);
        const enterpriseModule = await EnterpriseModule.getByEnterpriseIdAndModuleName(request.enterprise.id, request.requestedModule);
        
        if(request.requestParent){
            const { bpmProccesInstanceId } = request.requestParent;
            const specificProcessInstance: ISpecificProcessInstance = {
                processInstanceId: bpmProccesInstanceId.toString(),
                event_id: BPM_MODULE_RESOLUTION_EVENT,
                reply: {reply: status}                
            }
            try {
                const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
                console.log('result ', result);
            } catch (errors) {
                console.log('SERVICE ERROR: ', errors);
                throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
            }
        }
        if(status == EnterpriseRequestStatus.ACCEPTED) {
            if(request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION && !sendEmail){
                if(!enterpriseModule) throw new ConflictException('SCF.LIBERA.63', { enterpriseId: request.enterprise.id, moduleName: request.requestedModule });
                if(enterpriseModule.status !== EnterpriseModuleStatusEnum.VALIDATING_REQUEST) throw new ConflictException('SCF.LIBERA.66');

                enterpriseModule.activationDate = moment(moment.now(), 'x').toDate();
                enterpriseModule.status = EnterpriseModuleStatusEnum.ENABLED;
                request.status = EnterpriseRequestStatus.ACCEPTED;
                await EnterpriseModuleDAO.saveEnterpriseModule(enterpriseModule);

                const cModule = await CatModuleDAO.getModule(request.requestedModule);
                console.log('Module: ', cModule);
                let role;
                let userRole;
                let userModule;

                switch (cModule.name) {
                    case CatModuleEnum.PROVIDER:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PROVIDER_ADMIN);
                        userRole.user = owner;
                        userRole.role = role;
                        owner.userRoles.push(userRole);
                        break;
                
                    case CatModuleEnum.PAYER:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PAYER_ADMIN);
                        userRole.user = owner;
                        userRole.role = role;
                        owner.userRoles.push(userRole);
                        break;

                    case CatModuleEnum.FUNDING:
                        userRole = new UserRole();
                        role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_FUNDING_ADMIN);
                        userRole.user = owner;
                        userRole.role = role;
                        owner.userRoles.push(userRole);
                        break;
                }

                const findUserRole = await UserRoleDAO.getRolesByUserId(owner.id);

                if (findUserRole.includes(userRole))
                    throw new ConflictException('SCF.LIBERA.111', { userRole });

                userModule = new UserModule();
                userModule.catModule = cModule;
                userModule.user = owner;
                owner.userModules.push(userModule);

                await UserModuleDAO.save(userModule);
                await UserRoleDAO.save(userRole);

                const roles = owner.userRoles.map(userRole => userRole.role.name);
                const modules = owner.userModules.map(userModule => userModule.catModule.name);

                const params: any = {
                    UserPoolId: process.env.COGNITO_USER_POOL_ID,
                    Username: owner.email,
                    UserAttributes: [
                        {
                            Name: 'custom:roles',
                            Value: JSON.stringify(roles)
                        },
                        {
                            Name: 'custom:modules',
                            Value: JSON.stringify(modules)
                        }
                    ]
                }
                console.log(JSON.stringify(params));  

                try {
                    console.log('CognitoService');
                    const result = await await CognitoIdentityService.adminUpdateUserAttributes(params).promise()
                    console.log(result);
                } catch (errors) {
                    await UserModuleDAO.deleteUserModuleByNameAndUserId(owner.id, userModule.catModule.name);
                    await UserRoleDAO.deleteUserRoleByUserIdAndRole(owner.id, userRole.role.name);
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors})
                }

                try {
                    const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body:{
                            userId: +userId,    
                            enterpriseId: +request.enterprise.id,                  
                            eventDate: moment(moment.now(), 'x').toDate(),
                            typeEvent: EnterpriseRecordTypeEventEnum.MODULE_APPROVED.toString(),
                            comments: 'null',
                            entity: 'null'
                        }
                    }
                    await SQSService.sendMessage(sqsMetadata);                
                } catch (errors) {
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                }
            }
        }

        if(status == EnterpriseRequestStatus.REJECTED && sendEmail == false){
            request.status = EnterpriseRequestStatus.REJECTED;
            if (request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION) {
                if (!enterpriseModule) throw new ConflictException('SCF.LIBERA.63', { enterpriseId: request.enterprise.id, moduleName: request.requestedModule });
                if (enterpriseModule.status !== EnterpriseModuleStatusEnum.VALIDATING_REQUEST) throw new ConflictException('SCF.LIBERA.66');
                enterpriseModule.status = EnterpriseModuleStatusEnum.REJECTED;
                enterpriseModule.comment = explanation;

                await EnterpriseModuleDAO.saveEnterpriseModule(enterpriseModule);
                try {
                    const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body:{
                            userId: userId,    
                            enterpriseId: +request.enterprise.id,                  
                            eventDate: moment(moment.now(), 'x').toDate(),
                            typeEvent: EnterpriseRecordTypeEventEnum.MODULE_REJECTED.toString(),
                            comments: 'null',
                            entity: request.requestedModule.toString()                            
                        }
                    }
                    await SQSService.sendMessage(sqsMetadata);                
                } catch (errors) {
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                }

                
            }

            if (request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_LINKING){
                if(request.enterpriseLink.enterpriseLink.status == EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION){
                    request.enterpriseLink.enterpriseLink.status =  EnterpriseStatusEnum.REJECTED
                }

                request.enterpriseLink.status = EnterpriseLinkStatus.DISABLED;
            }
        }

        if(status == EnterpriseRequestStatus.REJECTED && sendEmail == true) {
            request.status = EnterpriseRequestStatus.REJECTED;
            if(request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION){
                if (!enterpriseModule) throw new ConflictException('SCF.LIBERA.63', { enterpriseId: request.enterprise.id, moduleName: request.requestedModule });
                if (enterpriseModule.status !== EnterpriseModuleStatusEnum.VALIDATING_REQUEST) throw new ConflictException('SCF.LIBERA.66');
                
                enterpriseModule.status = EnterpriseModuleStatusEnum.REJECTED;

                await SESService.sendTemplatedEmail({
                    template: SES_MODULE_REQUEST_DECLINED_TEMPLATE,
                    destinationEmail: request.enterprise.owner.email, 
                    mergeVariables: {
                        explanation, 
                        enterpriseName: request.enterprise.enterpriseName,
                        moduleRequested: request.requestedModule
                    }
                });  

                await EnterpriseModuleDAO.saveEnterpriseModule(enterpriseModule);   
                
                try {
                    const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body:{
                            userId: userId,    
                            enterpriseId: +request.enterprise.id,                  
                            eventDate: moment(moment.now(), 'x').toDate(),
                            typeEvent: EnterpriseRecordTypeEventEnum.MODULE_REJECTED.toString(),
                            entity: request.requestedModule.toString(),
                            comments: explanation.toString()
                        }
                    }
                    await SQSService.sendMessage(sqsMetadata);                
                } catch (errors) {
                    throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
                }
            }

            if(request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_LINKING){
                if(request.enterpriseLink.enterpriseLink.status == EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION){
                    request.enterpriseLink.enterpriseLink.status =  EnterpriseStatusEnum.REJECTED
                }

                request.enterpriseLink.status = EnterpriseLinkStatus.DISABLED;
                
                await SESService.sendTemplatedEmail({
                    template: SES_LINKING_RESOLUTION_EMAIL_REJECTED_TEMPLATE,
                    destinationEmail: request.enterprise.owner.email, 
                    mergeVariables: {
                        enterpriseRequestedName: request.enterpriseLink.enterpriseLink.enterpriseName,
                        requestType: request.requestType
                    }
                });               
            }        
        }
        await EnterpriseRequestDAO.updateEnterpriseRequestAndEnterpriseLink(request);
        console.log('SERVICE: Ending updateEnterpriseRequestStatus...');
    }
    
    static async sendModuleRequest(enterpriseId: number, catModule: CatModuleEnum, documentationId: number){
        console.log('SERVICE: Starting sendModuleRequest method...');
          
        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if(!enterprise) throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const documentation = await EnterpriseDocumentationDAO.getEnterpriseDocumentationById(documentationId);
        if(!documentation) throw new ConflictException('SCF.LIBERA.25', {documentationId});

        const request = await EnterpriseRequestDAO.getEnterpriseRequest(enterpriseId);
        if(request && request.status == EnterpriseRequestStatus.EVALUATION_PENDING && request.requestType == EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION ) throw new ConflictException('SCF.LIBERA.73', { enterpriseId });
        
        const enterpriseRequest = new EnterpriseRequest();
        enterpriseRequest.status = EnterpriseRequestStatus.EVALUATION_PENDING;
        enterpriseRequest.requestType = EnterpriseRequestTypeEnum.ENTERPRISE_MODULE_ACTIVATION;
        enterpriseRequest.enterprise = enterprise;
        enterpriseRequest.requestParent = null;
        enterpriseRequest.creationUser = enterprise.creationUser;
        enterpriseRequest.enterpriseLink = null;
        enterpriseRequest.requestedModule = catModule;
        enterpriseRequest.creationDate = moment(moment.now(), 'x').toDate();
        await EnterpriseRequestDAO.saveEnterpriseRequest(enterpriseRequest);

        documentation.status = EnterpriseDocumentationStatusEnum.EVALUATION_PENDING;
        await EnterpriseDocumentationDAO.save(documentation);
        
        const moduleEnterprise = new EnterpriseModule();
        moduleEnterprise.enterprise = enterprise;
        moduleEnterprise.status = EnterpriseModuleStatusEnum.VALIDATING_REQUEST;
        moduleEnterprise.catModule = await CatModuleDAO.getModule(catModule);
        await EnterpriseModuleDAO.saveEnterpriseModule(moduleEnterprise);

        const adminUsers = await UserDAO.getUsersByRole(RoleEnum.LIBERA_ADMIN);

        const notificationType = await NotificationTypeDAO.getNotificationType(CatNotificationTypeEnum.MODULE_REQUEST);

        for(const user of adminUsers){
            const notification = new Notification();
            notification.subject = notificationSubject;
            notification.creationDate = moment(moment.now(), 'x').toDate();
            notification.seen = false;
            notification.notificationType = notificationType;
            notification.user = user;
            notification.metadata = JSON.stringify({enterpriseId: enterprise.id});
            await NotificationDAO.save(notification);
        }
        console.log('SERVICE: Ending sendModuleRequest method...');
    }

    static async updateModuleToEnterprise(enterprise: Enterprise, modules: [], statusModule: EnterpriseModuleStatusEnum){
        const enterpriseModulesResult = [];

        for(let iModule of modules) {
            const catModule = await CatModuleDAO.getModule(iModule);

            const enterpriseModule = new EnterpriseModule();
            enterpriseModule.enterprise = enterprise;
            enterpriseModule.catModule = catModule;
            enterpriseModule.status = statusModule;
            enterpriseModule.activationDate = moment(moment.now(), 'x').toDate();
            const enterpriseModuleResult = await EnterpriseModuleDAO.save(enterpriseModule);
            enterpriseModulesResult.push(enterpriseModuleResult);
        }
        return { enterpriseModulesResult };
    }

}