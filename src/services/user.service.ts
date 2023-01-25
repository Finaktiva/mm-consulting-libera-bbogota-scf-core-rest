import moment from 'moment';
import uuid from 'uuid';
import CognitoIdentityService from '../services/cognito.identity.service';
import { ConflictException, BadRequestException, InternalServerException } from 'commons/exceptions';
import { UserDAO } from 'dao/user.dao';
import { User } from 'entities/user';
import { UserStatus } from 'commons/enums/user-status.enum';
import LiberaUtils from 'commons/libera.utils';
import { UserToken } from 'entities/user-token';
import { UserTokenTypeEnum } from 'commons/enums/user-token-type.enum';
import { UserTokenDAO } from 'dao/user-token.dao';
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { Enterprise } from 'entities/enterprise';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
import { EnterpriseDocumentationService } from './enterprise-documentation.service';
import { CatModuleDAO } from 'dao/cat-module.dao';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { UserModule } from 'entities/user-module';
import { UserModuleDAO } from 'dao/user-module.dao';
import { UserRole } from 'entities/user-role';
import { RoleDAO } from 'dao/role.dao';
import { UserRoleDAO } from 'dao/user-role.dao';
import { RoleEnum, isValidLiberaRol } from 'commons/enums/role.enum';
import { UserProperties } from 'entities/user-properties';
import { UserPropertiesDAO } from 'dao/user-properties.dao';
import { ModuleRoleEnum } from 'commons/enums/module-role.enum';
import { EnterpriseModule } from 'entities/enterprise-module';
import { EnterpriseModuleDAO } from 'dao/enterprise-module.dao';
import { CatModule } from 'entities/cat-module';
import { UserEnterpriseDAO } from 'dao/user-enterprise.dao';
import { EnterpriseModuleStatusEnum } from 'commons/enums/enterprise-module-status.enum';
import { EnterpriseBranding } from 'entities/enterprise-branding';
import { EnterpriseBrandingDAO } from 'dao/enterprise-branding.dao';
import { FilterUsers } from 'commons/filter';
import { EnterpriseRecordTypeEventEnum } from 'commons/enums/enterprise-record-type-event.enum';
import { SQSService } from './sqs.service';
import { delay } from 'lodash';
import { CatRoleStatusEnum } from 'commons/enums/cat-role.enums';
import { Role } from 'entities/role';
import { RelUserBankRegion } from 'entities/rel-user-bank-region';
import { RelUserBankRegionDAO } from 'dao/rel-user-bank-region.dao';
import { CatalogDAO } from 'dao/catalog.dao';
import { CatBankRegion } from 'entities/cat-bank-regions';
import { FilterUsersEnum } from 'commons/enums/filter-by.enum';


const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const SQS_LIBERA_ENTERPRISE_RECORD = process.env.SQS_LIBERA_ENTERPRISE_RECORD;
export class UserService {

    static async saveUser(data : any) {
        console.log('SERVICE: Starting saveUser');
        const { email , businessName, nit } = data;
        const catModulesEnum = [CatModuleEnum.PAYER, CatModuleEnum.ADMIN];

        const user = await UserDAO.getUserByEmail(email);

        if (user) throw new ConflictException('SCF.LIBERA.04', {email});

        const enterpriseNit = await EnterpriseDAO.getEnterpriseByNit(nit);

        if(enterpriseNit) throw new ConflictException('SCF.LIBERA.10', {nit}); 

        const newUser : User = new User();
        newUser.email = email;
        newUser.creationDate = moment(moment.now(), 'x').toDate()
        newUser.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
        newUser.type = UserTypeEnum.ENTERPRISE_USER;
        newUser.modificationDate = moment(moment.now(), 'x').toDate();
        const userSaved = await UserDAO.saveUser(newUser);

        console.log('newUser', newUser);

        const userProperties = new UserProperties();
        userProperties.user = userSaved;
        userProperties.createdDate = moment(moment.now(), 'x').toDate();
        userProperties.modifiedDate = moment(moment.now(), 'x').toDate(); 
        await UserPropertiesDAO.save(userProperties);

        const enterprise = new Enterprise();
        enterprise.enterpriseName = businessName;
        enterprise.owner = newUser;
        enterprise.nit = nit;
        enterprise.creationDate = moment(moment.now(), 'x').toDate();
        enterprise.status = EnterpriseStatusEnum.INCOMPLETE_ACCOUNT; 
        enterprise.creationUser = newUser;
        const enterpriseSaved = await EnterpriseDAO.saveEnterprise(enterprise);
        console.log('newUser --->', newUser);
        console.log('enterprise --->', enterprise);

        const enterpriseBranding = new EnterpriseBranding();
        enterpriseBranding.enterprise = enterpriseSaved;
        await EnterpriseBrandingDAO.save(enterpriseBranding);
        
        const { catModules } = await this.generateUserModuleAndUserRole(userSaved, catModulesEnum);
        await this.generateUserEnterpriseRoleAndModules(enterpriseSaved, catModules);

        await EnterpriseDocumentationService.createDocumentation(enterpriseSaved, catModules);
        console.log('SERVICE: Ending saveUser');

        try {
            const sqsMetadata = {
                    sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
                    body:{
                        userId: userSaved.id,    
                        enterpriseId: +enterprise.id,                  
                        eventDate: moment(moment.now(), 'x').toDate(),
                        typeEvent: EnterpriseRecordTypeEventEnum.SING_UP, 
                        comments: null,
                        entity: null
                    }
                }
                await SQSService.sendMessage(sqsMetadata);                
        } catch (errors) {
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }

        return {newUser, enterprise};



    }

    static async confirmationAccount(email: string) {
        console.log('SERVICE: Starting confirmationAccount');
        if(!LiberaUtils.validationEmailFormat(email)) throw new BadRequestException('SCF.LIBERA.02', {email});

        const user = await UserDAO.getUserByEmail(email);

        if(!user) throw new ConflictException('SCF.LIBERA.03', {email});
        
        console.log('current user', user);

        const roles = user.userRoles.map(userRole => userRole.role.name);
        const catModules = user.userModules.map(userModule => userModule.catModule.name);
        delete user.userRoles;
        delete user.userModules;

        user.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
        
        if (user.status == UserStatus.PENDING_ACCOUNT_CONFIRMATION){
            user.status = UserStatus.ENABLED;
        }
        user.affiliationAcceptanceDate = moment(moment.now(), 'x').toDate();
        await UserDAO.saveUser(user);

        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: 'custom:status',
                    Value: user.status.toString()
                },
                {
                    Name: 'custom:business_name',
                    Value: user.ownerEnterprise.enterpriseName
                },
                {
                    Name: 'custom:nit',
                    Value: user.ownerEnterprise.nit
                },
                {
                    Name: 'custom:enterpriseId',
                    Value: user.ownerEnterprise.id
                },
                {
                    Name: 'custom:userType',
                    Value: user.type.toString()
                },
                {
                    Name: 'custom:status',
                    Value: user.status.toString()
                },
                {
                    Name: 'custom:modules',
                    Value: JSON.stringify(catModules)
                },
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(roles)
                }
            ]
        };
        try {
            await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending confirmationAccount');
    }

    static async saveTemporalToken(email : string) {
        console.log('SERVICE: Starting saveTemporalToken');

        const token = uuid();
        const user = await UserDAO.getUserByEmail(email);
        if (!user) throw new ConflictException('SCF.LIBERA.03', email);

        const type = await UserTokenDAO.getTokenType(UserTokenTypeEnum.UPDATE_PASSWORD_CHALLENGE);

        const userToken = new UserToken();
        userToken.value = token;
        userToken.expirationDate = moment(moment.now(), 'x').add(1, 'h').toDate()
        userToken.tokenType = type;

        await UserDAO.saveTemporalToken(userToken);
        console.log('SERVICE: Ending saveTemporalToken');
        return {token: userToken.value};
    }

    static async preTokenGeneration(email: string) {
        console.log('SERVICE: Starting preTokenGeneration');
        if(!LiberaUtils.validationEmailFormat(email)) throw new BadRequestException('SFC.LIBERA.02', {email});

        const user = await UserDAO.getBasicUserByEmail(email);
        if(!user) throw new ConflictException('SFC.LIBERA.03', {email});        
        console.log('User', user);

        user.status = UserStatus.ENABLED;
        user.affiliationAcceptanceDate = moment(moment.now(), 'x').toDate();
        await UserDAO.saveUser(user);

        const enterprise = await EnterpriseDAO.getEnterpriseByUserId(user.id);

        if(enterprise) {
            console.log(`enterprise ${enterprise}`);
            enterprise.status = EnterpriseStatusEnum.INCOMPLETE_ACCOUNT;
            await EnterpriseDAO.saveEnterprise(enterprise);
        }
        
        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: 'custom:status',
                    Value: user.status.toString()
                }
            ]
        };
        try {
            await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SFC.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending preTokenGeneration');
    }

    static async generateUserModuleAndUserRole(user: User, catModulesEnum: CatModuleEnum[]) {
        const catModules = [];
        const userRolesResult = [];
        const userModulesResult = [];
        for(let catModuleEnum of catModulesEnum) {
            const catModule = await CatModuleDAO.getModule(catModuleEnum);
            catModules.push(catModule);
            
            const userModule = new UserModule();
            userModule.user = user;
            userModule.catModule = catModule
            const userModuleResult = await UserModuleDAO.save(userModule);
            userModulesResult.push(userModuleResult);

            const userRole = new UserRole();
            const role = await RoleDAO.getRole(RoleEnum[ModuleRoleEnum[catModule.name].valueOf()]);
            userRole.role = role;
            userRole.user = user;
            const userRoleResult = await UserRoleDAO.save(userRole);
            userRolesResult.push(userRoleResult);
        }
        return { userRolesResult, userModulesResult, catModules };
    }

    static async generateUserEnterpriseRoleAndModules(enterprise: Enterprise, catModules: CatModule[]) {
        console.log('SERVICE: Starting generateUserEnterpriseRoleAndModules...');
        const enterpriseModulesResult = [];
        for(let catModule of catModules) {
            const enterpriseModule = new EnterpriseModule();
            enterpriseModule.enterprise = enterprise;
            enterpriseModule.catModule = catModule;
            enterpriseModule.status = EnterpriseModuleStatusEnum.REQUESTED_MODULE;
            const enterpriseModuleResult = await EnterpriseModuleDAO.saveEnterpriseModule(enterpriseModule);
            enterpriseModulesResult.push(enterpriseModuleResult);
        }
    
        console.log('SERVICE: Ending generateUserEnterpriseRoleAndModules...');
        return {enterpriseModulesResult};
    }

    static async updateUserStatusById(enterpriseId: number, userId: number, status: UserStatus){
        console.log('SERVICE: Starting updateUserStatusById method...');
        console.log("status >>>>", status);

        const user = await UserDAO.getUserById(userId);
        if(!user || user.status === UserStatus.DELETED) throw new ConflictException('SCF.LIBERA.56', {userId});
        console.log("old user status >>>>>> ", user.status);

        const enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        if(!enterprise) throw new ConflictException('SCF.LIBERA.19', {enterpriseId});


        const enterpriseUser = await UserEnterpriseDAO.getByEnterpriseIdAndUserId(enterpriseId, userId);
        if(!enterpriseUser) throw new ConflictException('SCF.LIBERA.35', {ownerId: userId, enterpriseId});

        await UserDAO.updateUserStatusById(userId, status);

        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: user.email
        };

        let result: any;
        try {
            if (status == UserStatus.ENABLED) 
                result = await await CognitoIdentityService.adminEnableUser(params).promise();
                console.log(result);
            if (status == UserStatus.DISABLED) 
                result = await await CognitoIdentityService.adminDisableUser(params).promise();
                console.log(result);
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            await UserDAO.updateUserStatusById(userId, user.status);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending updateUserStatusById');
    }
    
    static async resendInvitation(enterpriseId: number, userId: number, principalId: number) {
        console.log('SERVICE: Starting resendInvitation');

        const enterprise = await EnterpriseDAO.getBasicEnterpriseById(enterpriseId);
        if(!enterprise || enterprise.status === EnterpriseStatusEnum.DELETED)  throw new ConflictException('SCF.LIBERA.19', { enterpriseId });

        const user = await UserDAO.getFullInformationByUserId(userId);
        if(!user || (user && user.status == UserStatus.DELETED)) throw new ConflictException('SCF.LIBERA.55', { userId });

        const userEnterprise = await UserEnterpriseDAO.getByEnterpriseIdAndUserId(enterpriseId, userId);
        if(!userEnterprise) throw new ConflictException('SCF.LIBERA.35', { ownerId: userId, enterpriseId });

        const TemporaryPassword = LiberaUtils.generatePassword();
        const params: any = {
            MessageAction: 'RESEND',
            TemporaryPassword,
            Username: user.email,
            UserPoolId: process.env.COGNITO_USER_POOL_ID            
        }        
        try {
            await await CognitoIdentityService.adminCreateUser(params).promise();
            } 
            catch (errors) {           
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        try {
            const sqsMetadata = {
            sqsUrl: SQS_LIBERA_ENTERPRISE_RECORD,
            body:{
                    userId: principalId,    
                    enterpriseId: +enterpriseId,                  
                    eventDate: moment(moment.now(), 'x').toDate(),
                    typeEvent: EnterpriseRecordTypeEventEnum.RESEND_INVITE.toString(),
                    comments: 'null'
                }
            }
            await SQSService.sendMessage(sqsMetadata);                
        } catch (errors) {
            throw new InternalServerException('SCF.LIBERA.COMMON.500', { errors });
        }
        console.log('SERVICE: Ending resendInvitation');
    }

    static async createLiberaUser(data: any){
        console.log('SERVICE: Starting createLiberaUser method...');
        const { email, name, firstSurname, secondSurname, roles } = data;
         if(!LiberaUtils.validationEmailFormat(email)) throw new BadRequestException('SCF.LIBERA.02', { email });

        const rolesDB = await RoleDAO.getLiberaUserRoles();

        for(let role of roles) {
            const existsRole = rolesDB.find(roleDB => roleDB.name === role);
            console.log(existsRole);
            if(!existsRole){
                throw new ConflictException('SCF.LIBERA.370',{role});
            }
            if(existsRole.status === CatRoleStatusEnum.DISABLED){
                throw new ConflictException('SFC.LIBERA.374',{role});
            }
        }

        const user = await UserDAO.getBasicUserByEmail(email);
        if(user && user.status !== UserStatus.DELETED) throw new ConflictException('SCF.LIBERA.04', { email });

        const newUser : User = new User();
        newUser.email = email;
        newUser.status = UserStatus.PENDING_ACCOUNT_CONFIRMATION;
        newUser.creationDate = moment(moment.now(), 'x').toDate()
        newUser.modificationDate = moment(moment.now(), 'x').toDate();
        newUser.affiliationAcceptanceDate = null;
        newUser.type = UserTypeEnum.LIBERA_USER;
        const userSaved = await UserDAO.saveUser(newUser);

        const userProperties : UserProperties = new UserProperties();
        userProperties.user = userSaved;
        userProperties.name = name ? name : null;
        userProperties.firstSurname = firstSurname ? firstSurname : null;
        userProperties.secondSurname = secondSurname ? secondSurname : null;
        userProperties.createdDate = moment(moment.now(), 'x').toDate();
        userProperties.modifiedDate = moment(moment.now(), 'x').toDate(); 
        await UserPropertiesDAO.save(userProperties);

        const newUserRoles: UserRole[] = [];
        for(let role of roles) {
            const userRole : UserRole = new UserRole();
            userRole.user = userSaved;
            userRole.role =  await RoleDAO.getRole(role);
            await UserRoleDAO.save(userRole);
            newUserRoles.push(userRole);
        }

        const result = {
            id: userSaved.id,
            name: userProperties.name,
            firstSurname: userProperties.firstSurname,
            secondSurname: userProperties.secondSurname,
            email: userSaved.email,
            vinculationDate: userSaved.affiliationAcceptanceDate,
            status: userSaved.status,
            roles: newUserRoles.map(newUserRoles => newUserRoles.role.name)
        }

        const TemporaryPassword = LiberaUtils.generatePassword();
        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            TemporaryPassword,
            Username: userSaved.email, 
            UserAttributes: [
                {
                    Name: 'custom:status',
                    Value: userSaved.status.toString()
                },
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(newUserRoles.map(newUserRoles => newUserRoles.role.name))
                },
                {
                    Name: 'custom:userType',
                    Value: userSaved.type
                }
            ]
        };

        try {
            await await CognitoIdentityService.adminCreateUser(params).promise();
        } 
        catch (errors) {          
            console.log('SERVICE ERROR: ', errors);
            await UserDAO.rollbackLiberaUser(userSaved.id);
            await await CognitoIdentityService.adminDeleteUser(params).promise();
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending createLiberaUser method...');
        return result;
    }

    static async getUserByEmail(email: string) {
        console.log('SERVICE: Starting getUserByEmail');

        const user = await UserDAO.getUserByEmail(email);

        if(!user) throw new ConflictException('SCF.LIBERA.03', { email });
        console.log('SERVICE: Ending getUserByEmail');
        return user;
    }

    static async confirmSignUpLiberaUser(user: User, event) {
        console.log('SERVICE: Starting confirmSignUpLiberaUser');

        if(user.status !== UserStatus.PENDING_ACCOUNT_CONFIRMATION && user.status !== UserStatus.PENDING_FEDERAL_ACCOUNT)
            throw new ConflictException('SCF.LIBERA.83');

        const roles = user.userRoles.map(userRole => userRole.role.name);
        delete user.userRoles;
        delete user.userModules;

        user.status = UserStatus.ENABLED;
        user.affiliationAcceptanceDate = moment(moment.now(), 'x').toDate();
        await UserDAO.saveUser(user);

        const userName = event.request.userAttributes?.['cognito:user_status'] === 'EXTERNAL_PROVIDER' ? event.userName : user.email

        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: userName,
            UserAttributes: [
                {
                    Name: 'custom:status',
                    Value: user.status.toString()
                },
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(roles)
                },
                {
                    Name: 'email_verified',
                    Value: 'true'
                },
                {
                    Name: 'custom:userType',
                    Value: user.type
                }
            ]
        };
        try {
            await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending confirmSignUpLiberaUser');
    }

    static async  updateLiberaUserById(userId: number, data: any){
        console.log('SERVICE: Starting updateLiberaUserById');
        const { name, firstSurname, secondSurname, roles, bankRegions } = data;
        const userFound = await UserDAO.getUserById(userId);
        if(!userFound) throw new ConflictException('SCF.LIBERA.55', {userId});

        const properties = await UserPropertiesDAO.getUserPropertiesById(userFound.id);
        if(name) properties.name = name;
        if(firstSurname) properties.firstSurname = firstSurname;
        if(secondSurname) properties.secondSurname = secondSurname;
        properties.modifiedDate = moment(moment.now(), 'x').toDate();
        await UserPropertiesDAO.save(properties);

        // const userRole = await UserRoleDAO.getByUserId(userFound.id);
        const liberaUserRoles = await RoleDAO.getLiberaUserRoles();
        const rolesList = liberaUserRoles.map(role => role.name);

        let finalArr = []
        for (const entryRol of roles) { //iteration to validate entered roles
            const validRole = rolesList.find(roleOfList => roleOfList === entryRol);
            if(validRole) {
                finalArr.push(validRole);
            } else {
                throw new ConflictException('SCF.LIBERA.344');
            }
        }

        const bankRegionsToSave = [];

        for(const br of bankRegions) {
            const existsBankRegion: CatBankRegion = await CatalogDAO.getRegionById(br.id);
            if(!existsBankRegion)
                throw new ConflictException('SCF.LIBERA.397', {id: br.id});
                bankRegionsToSave.push(existsBankRegion);
        }

        console.log('bankRegionsToSave ===========>', bankRegionsToSave);
        
        await UserRoleDAO.deleteUserRoleById(+userId);
        for (const roleToSave of finalArr) { //iteration to save roles
            console.log('validROLE: ', roleToSave);
            const newRole = new UserRole();
            const validRoleEntitu = await RoleDAO.getRole(roleToSave);
            newRole.role = validRoleEntitu;
            newRole.user = userFound;
            await UserRoleDAO.save(newRole);
        }

        await RelUserBankRegionDAO.deleteByUserId(+userId);
        for(const br of bankRegionsToSave) {
            const relUserBankRegion = new RelUserBankRegion();
            relUserBankRegion.user = userFound;
            relUserBankRegion.bankRegion = br;

            console.log('RelUserBankRegion ===========>', relUserBankRegion);

            await RelUserBankRegionDAO.save(relUserBankRegion);    
        }
        
        const params: any = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: userFound.email,
            UserAttributes: [
                {
                    Name: 'custom:roles',
                    Value: JSON.stringify(finalArr)
                }
            ]
        };

        try {
            await await CognitoIdentityService.adminUpdateUserAttributes(params).promise();
        } catch (errors) {
            console.log('SERVICE ERROR: ', errors);
            const userProperties = userFound.userProperties;
            const userRoles = userFound.userRoles;
            await UserDAO.rollbackUpdateLiberaUser(userProperties, userRoles);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending updateLiberaUserById');
    }

    static async deleteLiberaUserById(userId: number){
        console.log('SERVICE: Starting deleteLiberaUserById');
        const userFound = await UserDAO.getUserById(userId);
        console.log('userFound >>>>>>>>>>>>> ', userFound);
        if(!userFound || (userFound && userFound.status == UserStatus.DELETED)) throw new ConflictException('SCF.LIBERA.56', { userId });

        const oldStatus = userFound.status;
        console.log('old Status ', oldStatus);

        const newstatus = UserStatus.DELETED;
        await UserDAO.updateUserStatusById(userFound.id, newstatus);

        const params = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: userFound.email
        }
        
        try {
            const cognito = await await CognitoIdentityService.adminDeleteUser(params).promise();
            console.log(cognito);
        } 
        catch (errors) {
            console.log(errors);
            userFound.status = oldStatus;
            await UserDAO.saveUser(userFound);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending deleteLiberaUserById');
    }

    static async getLiberaUsers(filter: FilterUsers) {
        console.log('SERVICE: Starting getLiberaUsers');

        if(filter.filter_by === FilterUsersEnum.REGION){
            const bankRegions = await RelUserBankRegionDAO.getRelUserBankRegionByBankRegionId(+filter.q);
            if(!bankRegions.length) throw new ConflictException('SCF.LIBERA.400', {q: filter.q});
        }

        const users = await UserDAO.getLiberaUsers(filter);

        console.log('users', users[0]);
        console.log('total', users[1]);

        const usersResponse = users[0].map(({ id, email, status, userProperties, userRoles, affiliationAcceptanceDate, relUserBankRegion }) => ({
            id: +id,
            name: userProperties && userProperties.name ? userProperties.name : null,
            firstSurname: userProperties && userProperties.firstSurname ? userProperties.firstSurname : null,
            secondSurname: userProperties && userProperties.secondSurname ? userProperties.secondSurname : null,
            email,
            vinculationDate: affiliationAcceptanceDate ? affiliationAcceptanceDate : null,
            status,
            roles: userRoles ? userRoles.map(userRoles => userRoles.role ? {
                code: userRoles.role.name,
                description: userRoles.role.description,
                acronym: userRoles.role.acronym,
            } : null) : [],
            bankRegions: relUserBankRegion ? relUserBankRegion.map(relUserBankRegion => relUserBankRegion.bankRegion ? {
                id: relUserBankRegion.bankRegion.id,
                description: relUserBankRegion.bankRegion.description
            } : null) : []
        }))

        const total = users[1];
        console.log('SERVICE: Ending getLiberaUsers');
        return { usersResponse, total };
    }

    static async liberaResendInvitation( userId: number, userFirmed?: User , firstTime?: boolean) {
        console.log('SERVICE: Starting resendInvitation');

        if(firstTime && userFirmed !== undefined) {
            console.log('---> first time detected.');
            const enterprise: Enterprise = await EnterpriseDAO.getEnterpriseByUserId(userId)
            enterprise.invitationUser = userFirmed;

            await EnterpriseDAO.saveEnterprise(enterprise)
        }

        const user = await UserDAO.getFullInformationByUserId(userId);
        if(!user || (user && user.status == UserStatus.DELETED)) throw new ConflictException('SCF.LIBERA.56', { userId });
        const status = user.status;
        if((user && user.status == UserStatus.ENABLED)) throw new ConflictException('SCF.LIBERA.85', { userId });
        if(status !== UserStatus.PENDING_ACCOUNT_CONFIRMATION) throw new ConflictException('SCF.LIBERA.86', { status });
        const TemporaryPassword = LiberaUtils.generatePassword();
        const params: any = {
            MessageAction: 'RESEND',
            TemporaryPassword,
            Username: user.email,
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            UserAttributes: [
                {
                    Name: 'custom:userType',
                    Value: user.type
                }
            ]           
        }        
        try {
            await await CognitoIdentityService.adminCreateUser(params).promise();
        } 
        catch (errors) {           
            console.log('SERVICE ERROR: ', errors);
            throw new InternalServerException('SCF.LIBERA.COMMON.500', {errors});
        }
        console.log('SERVICE: Ending resendInvitation');
    }

    static async liberaUserUpdateStatus(userId: number, status: UserStatus) {
        console.log('SERVICE: Starting liberaUserUpdateStatus');

        const user = await UserDAO.getById(userId);
        if(!user || user && user.status == UserStatus.DELETED)
            throw new ConflictException('SCF.LIBERA.56', { userId });
        let userStatus = user.status;
        const params : any = {
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: user.email
        }
        try {    
            switch (status) {
                case UserStatus.ENABLED:
                    await await CognitoIdentityService.adminEnableUser(params).promise();
                    break;
                case UserStatus.DISABLED:
                    await await CognitoIdentityService.adminDisableUser(params).promise();
                    break;
            }
        } catch (error) {
            user.status = userStatus;
            await UserDAO.saveUser(user);
            throw new BadRequestException('SCF.LIBERA.106');
        }
        user.status = status;   
        await UserDAO.saveUser(user);
    }

    static async createFederalLiberaUser(email: any, userCognitoName){
        console.log('SERVICE: Starting createFederalLiberaUser method...');
        if(!LiberaUtils.validationEmailFormat(email)) throw new BadRequestException('SCF.LIBERA.02', { email });

        const user = await UserDAO.getBasicUserByEmail(email);
        if(user && user.status !== UserStatus.DELETED) {
            console.log('user already exist in DB');
            return null;
        }
        const newUser : User = new User();
        newUser.email = email;
        newUser.status = UserStatus.PENDING_FEDERAL_ACCOUNT;
        newUser.creationDate = moment(moment.now(), 'x').toDate()
        newUser.modificationDate = moment(moment.now(), 'x').toDate();
        newUser.affiliationAcceptanceDate = null;
        newUser.type = UserTypeEnum.LIBERA_USER;
        const userSaved = await UserDAO.saveUser(newUser);

        const userProperties : UserProperties = new UserProperties();
        userProperties.user = userSaved;
        userProperties.name = 'Name';
        userProperties.firstSurname = 'firstSurname';
        userProperties.secondSurname = null;
        userProperties.createdDate = moment(moment.now(), 'x').toDate();
        userProperties.modifiedDate = moment(moment.now(), 'x').toDate(); 
        await UserPropertiesDAO.save(userProperties);

        const newUserRoles: UserRole[] = [];
        const userRole : UserRole = new UserRole();
        userRole.user = userSaved;
        userRole.role =  await RoleDAO.getRole(RoleEnum.BOOC_VIEWER);
        await UserRoleDAO.save(userRole);
        newUserRoles.push(userRole);

        const result = {
            id: userSaved.id,
            name: userProperties.name,
            firstSurname: userProperties.firstSurname,
            secondSurname: userProperties.secondSurname,
            email: userSaved.email,
            vinculationDate: userSaved.affiliationAcceptanceDate,
            status: userSaved.status,
            roles: newUserRoles.map(newUserRoles => newUserRoles.role.name)
        }
        console.log('federal user Saved in DB', result);
        this.delay(100);
        console.log('SERVICE: Ending createFederalLiberaUser method...');
        return result;
    }

    static async delay(milliseconds: number) {
        return new Promise<void>(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    static async returnRolUser(userId: number): Promise<string> {
        const userFirmed = await UserDAO.getUserById(userId);
        return userFirmed.type;
    }

    static async userEnabledRoles() {
        const roles = await Role.getAllEnabledRoles();
        let enabledRoles = roles.map(role => { return role.name })
        console.log('enabledRoles ===> ', enabledRoles)
        return enabledRoles;
    }

}