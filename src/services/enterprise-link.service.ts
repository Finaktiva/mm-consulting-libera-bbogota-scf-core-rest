import moment from 'moment';
import { IEnterpriseLinks } from 'commons/interfaces/enterprise-link.interface';
import { EnterpriseRequestBulkDAO } from 'dao/enterprise-request-bulk.dao';
import { EnterpriseLinks } from 'entities/enterprise-links';
import { EnterpriseLinkTypeEnum } from 'commons/enums/enterprise-link-type.enum';
import { EnterpriseLinkStatus } from 'commons/enums/enterprise-link-status.enum';
import { EnterpriseRequest } from 'entities/enterprise-request';
import { EnterpriseRequestStatus } from 'commons/enums/enterprise-request-status.enum';
import { EnterpriseRequestTypeEnum } from 'commons/enums/enterprise-request-type.enum';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { EnterpriseLinkDAO } from 'dao/enterprise-link.dao';
import { EnterpriseRequestDAO } from 'dao/enterprise-request.dao';
import { IProcessInstance, ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { BPMService } from './bpm.service';
import { InternalServerException, ConflictException, BadRequestException } from 'commons/exceptions';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { TemporalTokensDAO } from 'dao/temporal-token.dao';
import { TemporalTokenStatusEnum } from 'commons/enums/temporal-token-status.enum';
import LiberaUtils from 'commons/libera.utils';
import { User } from 'entities/user';
import { Enterprise } from 'entities/enterprise';
import { UserProperties } from 'entities/user-properties';
import { EnterpriseModule } from 'entities/enterprise-module';
import { UserModule } from 'entities/user-module';
import { UserStatus } from 'commons/enums/user-status.enum';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import { EnterpriseModuleStatusEnum } from 'commons/enums/enterprise-module-status.enum';
import { CatModuleDAO } from 'dao/cat-module.dao';
import { RoleDAO } from 'dao/role.dao';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserDAO } from 'dao/user.dao';
import { UserPropertiesDAO } from 'dao/user-properties.dao';
import { EnterpriseModuleDAO } from 'dao/enterprise-module.dao';
import { UserModuleDAO } from 'dao/user-module.dao';
import { UserRoleDAO } from 'dao/user-role.dao';
import { UserRole } from 'entities/user-role';
import _ from 'lodash';
import { CatalogDAO } from 'dao/catalog.dao';
import { CitiesDepartments } from 'entities/cities-departments';

export class EnterpriseLinkService {

    static async save(enterpriseLinks: IEnterpriseLinks) {
        const { request, enterpriseRequestBulkId } = enterpriseLinks;
        console.log('SERVICE: Starting save method');
        console.log('enterpriseRequestBulkId: ' + enterpriseLinks.enterpriseRequestBulkId);
        let enterpriseRequestBulk = await EnterpriseRequestBulkDAO.getById(enterpriseRequestBulkId);
        const enterpriseNIT = await EnterpriseDAO.getEnterpriseByNIT(enterpriseLinks.request.nit);
        let eOwner: User;
        let nEnterprise: Enterprise;
        let link: EnterpriseLinks;
        let eRequest: EnterpriseRequest;
        let eOwnerProps: UserProperties;
        let eModules: EnterpriseModule[] = [];
        let uModules: UserModule[] = [];
        let uRoles: UserRole[] = [];
        
        if(!enterpriseNIT){
            console.log('Case: null');
            eOwner = new User();
            eOwner.status = UserStatus.PENDING_ACCOUNT_CREATION
            eOwner.type = UserTypeEnum.ENTERPRISE_USER;
            eOwner.email = request.owner.email;
            eOwner.creationDate = moment(moment.now(), 'x').toDate();
            eOwner.modificationDate = moment(moment.now(), 'x').toDate();
            console.log('creating user...')
            nEnterprise = new Enterprise();
            nEnterprise.owner = eOwner;
            nEnterprise.enterpriseName = request.enterpriseName;
            nEnterprise.creationUser = enterpriseRequestBulk.enterprise.owner;
            nEnterprise.creationDate = moment(moment.now(), 'x').toDate();
            nEnterprise.nit = request.nit;
            nEnterprise.status = EnterpriseStatusEnum.PENDING_ACCOUNT_CREATION;
            nEnterprise.phoneNumber = request.phone && request.phone.number ? request.phone.number : null;
            console.log('creating enterprise');
            if (request.owner.name) {
                eOwnerProps = new UserProperties();
                eOwnerProps.user = eOwner;
                eOwnerProps.name = request.owner.name;
                eOwnerProps.firstSurname = request.owner.firstSurname ? request.owner.firstSurname : null;
                eOwnerProps.secondSurname = request.owner.secondSurname ? request.owner.secondSurname : null;
                eOwnerProps.createdDate = moment(moment.now(), 'x').toDate();
                console.log('creating userProps');
            }
            const eModuleAdmin = new EnterpriseModule();
            eModuleAdmin.enterprise = nEnterprise;
            eModuleAdmin.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            eModuleAdmin.catModule = await CatModuleDAO.getModule(CatModuleEnum.ADMIN);
            eModules.push(eModuleAdmin);
            const eModuleProvider = new EnterpriseModule();
            eModuleProvider.enterprise = nEnterprise;
            eModuleProvider.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            eModuleProvider.catModule = await CatModuleDAO.getModule(CatModuleEnum.PROVIDER);
            eModules.push(eModuleProvider);
            console.log('creating eModules');
            const uModuleAdmin = new UserModule();
            uModuleAdmin.user = eOwner;
            uModuleAdmin.catModule = await CatModuleDAO.getModule(CatModuleEnum.ADMIN);
            uModules.push(uModuleAdmin);
            const uModuleProvider = new UserModule();
            uModuleProvider.user = eOwner;
            uModuleProvider.catModule = await CatModuleDAO.getModule(CatModuleEnum.PROVIDER);
            uModules.push(uModuleProvider);
            console.log('creating uModules');
            const uRoleAdmin = new UserRole();
            uRoleAdmin.user = eOwner;
            uRoleAdmin.role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_CONSOLE_ADMIN);
            uRoles.push(uRoleAdmin);
            const uRoleProvider = new UserRole();
            uRoleProvider.user = eOwner;
            uRoleProvider.role = await RoleDAO.getRole(RoleEnum.ENTERPRISE_PROVIDER_ADMIN);
            uRoles.push(uRoleProvider);
            console.log('creating uRoles');
            eOwner.ownerEnterprise = nEnterprise;

            await UserDAO.saveUser(eOwner);
            await EnterpriseDAO.saveEnterprise(nEnterprise);
            await UserPropertiesDAO.save(eOwnerProps);
            for(let eModule of eModules){
                await EnterpriseModuleDAO.saveEnterpriseModule(eModule);
            }
            for(let uModule of uModules) {
                await UserModuleDAO.save(uModule);
            }
            for(let uRole of uRoles) {
                await UserRoleDAO.save(uRole);
            }
            link = new EnterpriseLinks();
            link.linkType = EnterpriseLinkTypeEnum.PROVIDER;
            link.linkDate = moment(moment.now(), 'x').toDate();
            link.enterprise = enterpriseRequestBulk.enterprise;
            link.status = EnterpriseLinkStatus.PENDING_LINK_CREATION;
            link.enterpriseLink = nEnterprise;
        }
        else {
            link = new EnterpriseLinks();
            link.linkType = EnterpriseLinkTypeEnum.PROVIDER;
            link.linkDate = moment(moment.now(), 'x').toDate();
            link.enterprise = enterpriseRequestBulk.enterprise;
            link.status = EnterpriseLinkStatus.PENDING_LINK_CREATION;
            link.enterpriseLink = enterpriseNIT;
        }

        let enterpriseLinkCreated = await EnterpriseLinkDAO.save(link);
        console.log('enterpriseLinkCreated', enterpriseLinkCreated.id);
        console.log(enterpriseRequestBulk.enterprise);
        eRequest = new EnterpriseRequest();
        eRequest.enterpriseLink = enterpriseLinkCreated;
        eRequest.comments = enterpriseLinks.request.comments;
        eRequest.status = EnterpriseRequestStatus.EVALUATION_PENDING;
        eRequest.requestType = EnterpriseRequestTypeEnum.ENTERPRISE_LINKING;
        eRequest.requestedModule = CatModuleEnum.PROVIDER;
        eRequest.creationDate = moment(moment.now(), 'x').toDate();
        eRequest.enterprise = enterpriseRequestBulk.enterprise;
        eRequest.enterpriseRequestBulk = enterpriseRequestBulk;
        eRequest.creationUser = enterpriseRequestBulk.enterprise.owner;
        let enterpriseRequestCreated = await EnterpriseRequestDAO.saveEnterpriseRequest(eRequest);

        console.log('enterpriseRequestCreated', enterpriseRequestCreated.id);

        let processInstance: IProcessInstance = {
            processDefinitionKey: 'providerLinkingProcess',
            variables: [
                {
                    name: 'requestId',
                    value: enterpriseRequestCreated.id.toString() || null
                },
                {
                    name: 'enterpriseRequesterId',
                    value: eRequest.enterprise.id.toString() || null
                },
                {
                    name: 'enterpriseRequestedId',
                    value: link.enterpriseLink.id.toString() || null
                }
            ]
        };
        console.log('processInstance:' + JSON.stringify(processInstance));
        try {
            const result = await BPMService.runProcessInstance(processInstance);
            eRequest.bpmProccesInstanceId = result.id;
            await EnterpriseRequestDAO.updateEnterpriseRequest(eRequest);
        }
        catch(errors) {
            console.log('SERVICE ERRORS: '+ errors);
            await EnterpriseLinkDAO.rollbackCreateLinkRequest(link.id, eRequest.id);
            if(!enterpriseNIT) {
                await EnterpriseDAO.rollbackCreateLinkRequestNewEnterprise(nEnterprise.id, eOwner.id, eModules, uModules, uRoles);
            }
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors:errors.message});
        }

        console.log('SERVICE: Ending save method');
    }  

    static async setLinkingConfirm(enterpriseId: number, reply: EnterpriseRequestStatus, token: string) {
        console.log('SERVICE: Starting setLinkingConfirm method...');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if (!enterprise || enterprise && enterprise.status === EnterpriseStatusEnum.DELETED) throw new ConflictException('SCF.LIBERA.19', {enterpriseId});

        const tempToken = await TemporalTokensDAO.getByTokenAndEnterpriseId(token, enterpriseId);
        if (!tempToken) throw new ConflictException('SCF.LIBERA.104');
        console.log('tempToken', tempToken);
        
        if (tempToken && tempToken.status == TemporalTokenStatusEnum.EXPIRED) throw new ConflictException('SCF.LIBERA.103', { token });

        if (LiberaUtils.confirmExpirationDate(tempToken.expirationDate)) throw new ConflictException('SCF.LIBERA.103', { token });
        
        let tempTokenStatus = tempToken.status;
        let tokenRequestStatus = tempToken.enterpriseRequest.status;
        let tokenLinkStatus = tempToken.enterpriseRequest.enterpriseLink.status;

        tempToken.status = TemporalTokenStatusEnum.APPLIED;
        tempToken.enterpriseRequest.status = reply;
        switch (reply) {
            case EnterpriseRequestStatus.ACCEPTED:
                tempToken.enterpriseRequest.status = EnterpriseRequestStatus.ACCEPTED;
                tempToken.enterpriseRequest.enterpriseLink.status = EnterpriseLinkStatus.PENDING_VALIDATION;
                break;
            case EnterpriseRequestStatus.REJECTED:
                tempToken.enterpriseRequest.status = EnterpriseRequestStatus.REJECTED;
                tempToken.enterpriseRequest.enterpriseLink.status = EnterpriseLinkStatus.REJECTED;
                break;
            default:
                break;
        }
        await EnterpriseRequestDAO.saveEnterpriseRequest(tempToken.enterpriseRequest);
        await EnterpriseLinkDAO.save(tempToken.enterpriseRequest.enterpriseLink);
        await TemporalTokensDAO.saveTemporalToken(tempToken);

        const bpmProccesInstanceId = tempToken.enterpriseRequest.bpmProccesInstanceId;

        const specificProcessInstance: ISpecificProcessInstance = {
            processInstanceId: bpmProccesInstanceId.toString(),
            event_id: tempToken.eventId.toString(),
            reply: {reply}                
        }
        console.log('specificProcessInstance >>>> ', specificProcessInstance);
        
        try {
            const result = await BPMService.runSpecificProcessInstance(specificProcessInstance);
            console.log('result ', result);
        } catch (errors) {
            tempToken.status = tempTokenStatus;
            tempToken.enterpriseRequest.status = tokenRequestStatus;
            tempToken.enterpriseRequest.enterpriseLink.status = tokenLinkStatus;
            await EnterpriseRequestDAO.rollbackEnterpriseRequest(tempToken.enterpriseRequest, tempToken, tempToken.enterpriseRequest.enterpriseLink);
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending setLinkingConfirm method...');
    }

    static async verify(enterprisesLinks: IEnterpriseLinks[]) {
        console.log('SERVICE: Starting verify method');
        
        const enterpriseRequestBulkId = enterprisesLinks[0].enterpriseRequestBulkId;
        console.log(`enterpriseRequestBulkId ${enterpriseRequestBulkId}`);
        const enterprise = await EnterpriseRequestBulkDAO.getById(enterpriseRequestBulkId);
        console.log(`enterprise ${JSON.stringify(enterprise)}`);
        const providers = await EnterpriseLinkDAO.getProvidersByEnterpriseId(enterprise.enterprise.id);

        for (const prov of providers) {
            _.remove(
                enterprisesLinks, 
                req => 
                    req.request.nit === prov.enterpriseLink.nit || 
                    !req.request.enterpriseName || 
                    !req.request.owner.email || 
                    !req.request.nit);
        }

        console.log('SERVICE: Ending verify method');
        return enterprisesLinks;
    }

    static async departmenAndCityValidation(city: string, department: string) {
        console.log('SERVICE: Starting departmenAndCityValidation method');
        const deptoCiudRelationRecord: CitiesDepartments = await CatalogDAO.getDptoCiudRelation(city, department);
        if (!deptoCiudRelationRecord || deptoCiudRelationRecord === undefined) {
            console.log('SERVICE: Ending departmenAndCityValidation method throwing an exception.');
            throw new ConflictException("SCF.LIBERA.303");
        }
        console.log('SERVICE: Ending departmenAndCityValidation method with out conflicts.');
        return deptoCiudRelationRecord;
    }

}