import { Entity, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Enterprise } from './enterprise';
import { FilterEnterprises } from 'commons/filter';
import { UserStatus } from 'commons/enums/user-status.enum';

@Entity({ name: 'USER_ENTERPRISE' })
export class UserEnterprise extends BaseEntity {

    @ManyToOne(type => User, user => user.userEnterprises, { primary: true })
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @ManyToOne(type => Enterprise, enterprise => enterprise.userEnterprises, { primary: true })
    @JoinColumn({
        name: 'ENTERPRISE_ID'
    })
    enterprise: Enterprise;

    static getByEnterpriseId(enterpriseId: number, filter: FilterEnterprises) {
        const queryBuilder = this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .addSelect('userProperties.name, userProperties.firstSurname, userProperties.secondSurname', 'fullName')
            .where('enterprise.id = :enterpriseId', { enterpriseId });

        if(!filter.filter_by && filter.q && filter.q != undefined){
            queryBuilder.andWhere("lower(concat_ws('', userProperties.name, userProperties.firstSurname, userProperties.secondSurname)) LIKE :name", 
             { name : `%${filter.q.replace(/ /g, '').toLowerCase()}%`});
        }

        if(filter.filter_by && filter.filter_by == 'ROLE')
            queryBuilder.andWhere('(role.name = :role)', { role : filter.q });

        if(filter.filter_by && filter.filter_by == 'MODULE')
            queryBuilder.andWhere('(catModule.name = :module)', { module : filter.q });

        if(filter.filter_by && filter.filter_by == 'STATUS')
            queryBuilder.andWhere('(user.status = :status)', { status : filter.q });
        else 
            queryBuilder.andWhere('user.status != :status', { status : UserStatus.DELETED })

        return queryBuilder.skip(((filter.page-1) * filter.per_page)).take(filter.per_page)
            .orderBy('user.creationDate', 'DESC')
            .addOrderBy('fullName', 'ASC')
            .getManyAndCount();
    }

    static deleteUserEnterpriseByUserId(userId: number) {
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .delete()
            .where('user.id = :userId', { userId })
            .execute();
    }
    
    static getByUserAndEnterpriseId(userId: number, enterpriseId: number){
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('user.id = :userId', {userId})
            .getOne();
    }

    static getByEnterpriseIdAndUserId(enterpriseId: number, userId: number): Promise<UserEnterprise> {
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('user.userRoles', 'userRoles')
            .leftJoinAndSelect('userRoles.user', 'userRolesUser')
            .leftJoinAndSelect('userRoles.role', 'role')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.user', 'userModulesUser')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .leftJoinAndSelect('userProperties.user', 'userPropertiesUser')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .andWhere('user.id = :userId', { userId })
            .getOne();
    }

    static getUsersByEnterpriseId(enterpriseId: number) {
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('user.status != :status', { status : UserStatus.DELETED })
            .getMany();
    }

    static getMatchByEnterpriseIdAndUserId(enterpriseId: number, userId: number) {
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .andWhere('user.id = :userId', { userId })
            .andWhere('user.status != :status', { status : UserStatus.DELETED })
            .getOne();
    }

    static getProviderContactInformation(enterpriseId: number, page:number, per_page:number){
        return this.createQueryBuilder('userEnterprise')
            .leftJoinAndSelect('userEnterprise.enterprise', 'enterprise')
            .leftJoinAndSelect('userEnterprise.user', 'user')
            .leftJoinAndSelect('user.userProperties', 'userProperties')
            .leftJoinAndSelect('user.userModules', 'userModules')
            .leftJoinAndSelect('userModules.catModule', 'catModule')
            .where('enterprise.id = :enterpriseId', { enterpriseId })
            .skip(page == 1 ? (((page - 1) * per_page)) : ((page - 1) * per_page-1))
            .take(page === 1 ? per_page -1 : per_page)
            .getManyAndCount();
    }
}