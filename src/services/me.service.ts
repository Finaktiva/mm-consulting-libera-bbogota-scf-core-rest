import { MeDAO } from "dao/me.dao";
import { UserStatus } from "commons/enums/user-status.enum";
import { ConflictException, BadRequestException } from "commons/exceptions";
import { UserPropertiesDAO } from "dao/user-properties.dao";
import { UserDAO } from "dao/user.dao";
import { UserEnterpriseDAO } from "dao/user-enterprise.dao";
import { MeSaveLanguage } from "commons/interfaces/me-interfaces/save-language.interface";
import { CatLanguageDAO } from "dao/cat-language.dao";
import { CatLanguageEnum } from "commons/enums/cat-language.enum";
import { UserRoleDAO } from "dao/user-role.dao";
import { CatRoleStatusEnum } from 'commons/enums/cat-role.enums';
import { UserRole } from "entities/user-role";
import { UserTypeEnum } from "commons/enums/user-type.enum";

export class MeService {

    static async getUserDetail(userId: number) {
        console.log('SERVICE: Starting getUserDetail method');

        const user = await MeDAO.getUserDetail(userId);
        const {type} = user;

        console.log('user >>>>>>>>>', user);

        if(user && user.status == UserStatus.DISABLED || user.status == UserStatus.DELETED) throw new ConflictException('SCF.LIBERA.94');
        if(user && user.status == UserStatus.PENDING_ACCOUNT_CONFIRMATION) throw new ConflictException('SCF.LIBERA.93');
        
        const data = {
            id: user.id,
            name: user.userProperties ? user.userProperties.name : null,
            firstSurname: user.userProperties ? user.userProperties.firstSurname : null,
            secondSurname: user.userProperties ? user.userProperties.secondSurname : null,
            email: user.email,
            modules: type === UserTypeEnum.ENTERPRISE_USER ? user.userModules.map(userModule => userModule.catModule.name) : null,
            roles: null,
            status: user.status,
            bankRegions: user.relUserBankRegion ? user.relUserBankRegion.map(relUserBankRegion => relUserBankRegion.bankRegion ? {
                id: relUserBankRegion.bankRegion.id,
                description: relUserBankRegion.bankRegion.description
            } : null) : []
        }

        if(type === UserTypeEnum.LIBERA_USER){
            const userRole = await UserRoleDAO.getRolesByUserId(user.id);

            const roles = userRole.map(userRole => {
                return {
                    code: userRole.role.name,
                    description: userRole.role.description,
                    acronym: userRole.role.acronym
                }
            });
            
            data['roles'] = roles;
        }
            

        console.log('SERVICE: Ending getUserDetail method');
        return data;
    }

    static async updateUserDetail(userId: number, data: any) {
        console.log('SERVICE: Starting updateUserDetail');
        const { name, firstSurname, secondSurname } = data;
        const user =  await MeDAO.getMeById(userId);
        if(user && user.status == UserStatus.DISABLED || user.status == UserStatus.DELETED) 
            throw new ConflictException('SCF.LIBERA.94');
        if(user && user.status == UserStatus.PENDING_ACCOUNT_CONFIRMATION) 
            throw new ConflictException('SCF.LIBERA.93');

        const props = await MeDAO.getMyPropertiesById(userId);

        props.name = name ? name : props.name;
        props.firstSurname = firstSurname ?  firstSurname : props.firstSurname;
        props.secondSurname = secondSurname ? secondSurname : props.secondSurname;

        await UserPropertiesDAO.save(props);
        console.log('SERVICE: Endng updateUserDetail');
    }

    static async saveLanguage(userId: number, data: MeSaveLanguage) {
        console.log('SERVICE: Starting saveLanguage');

        const user = await UserDAO.getBasicUserById(userId);

        if(user && user.status == UserStatus.DISABLED || user.status == UserStatus.DELETED) 
            throw new ConflictException('SCF.LIBERA.94');
        if(user && user.status == UserStatus.PENDING_ACCOUNT_CONFIRMATION) 
            throw new ConflictException('SCF.LIBERA.93');
        
        user.preferredLanguage = await CatLanguageDAO.getLanguageByCode(data.code);
        await UserDAO.saveUser(user);
        console.log('SERVICE: Ending saveLanguage');
    }

    static async getLanguage(userId: number) {
        console.log('SERVICE: Starting getLanguage');
        const user = await UserDAO.getBasicUserAndLanguage(userId);
       
        if(user && user.status == UserStatus.DISABLED || user.status == UserStatus.DELETED) 
            throw new ConflictException('SCF.LIBERA.94');
       
        if(user && user.status == UserStatus.PENDING_ACCOUNT_CONFIRMATION) 
            throw new ConflictException('SCF.LIBERA.93');
    
        console.log('SERVICE: Ending getLanguage');
        return user.preferredLanguage ? { code: user.preferredLanguage.code, description: user.preferredLanguage.description } : {code: CatLanguageEnum.ES, description: "Español"};
    }

    static async getRolesPermissionsByUserId(userId: number): Promise<UserRole[]> {
        console.log('SERVICE: Starting getRolesPermissionsbyUserId');
        
        const roles: UserRole[] = await UserRoleDAO.getRolesPermissionsByUserId(userId);
        
        console.log('SERVICE: Ending getRolesPermissionsbyUserId');

        return roles;

    }

}