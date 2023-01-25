import { Entity, BaseEntity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { RoleEnum } from 'commons/enums/role.enum';
import { UserRole } from './user-role';
import { FilterRoleUserTypeEnum } from 'commons/enums/filter-by.enum';
import { RelRolePermission } from './rel-role-permission';
import { User } from './user';
import { UserStatus } from 'commons/enums/user-status.enum';

@Entity({name: 'ROLE'})
export class Role extends BaseEntity {

    @PrimaryColumn({name: 'NAME'})
    name: String;

    @Column({name: 'DESCRIPTION'})
    description: String;

    @Column({name: 'APPLIES_TO_USER_TYPE'})
    appliesTo: String;

    @Column({name: 'ACRONYM'})
    acronym: String;

    @Column({ name: 'CREATION_DATE' })
    creationDate: Date;

    @Column({
        name: 'MODIFICATION_DATE'
    })
    modificationDate: Date;

    @ManyToOne(type => User, user => user.creationUserRoles)
    @JoinColumn({ name: 'CREATION_USER_ID' })
    creationUser: User;
    
    @ManyToOne(type => User, user => user.modificationUserRoles)
    @JoinColumn({ name: 'MODIFICATION_USER_ID' })
    modificationUser: User;

    @Column({name: 'STATUS'})
    status: String;

    @Column({
        name: 'VISIBLE',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
      })
    isVisible: boolean;

    @OneToMany(type => UserRole, userRole => userRole.role)
    userRoles: UserRole[];

    @OneToMany(type => RelRolePermission, relRolePermission => relRolePermission.role)
    relRolePermissions: RelRolePermission[];

    static getRoles(){
        return this.createQueryBuilder('role')
        .getMany();
    }
    
    static getByName(roleName: RoleEnum) {
        return this.createQueryBuilder('role')
            .where('role.name = :roleName', { roleName })
            .getOne();
    }

    static getAllRoles(userType: string, fliter_by:string, q: string, proximity_search: boolean, page:string, per_page:string): Promise<[Role[],number]> {
        console.log('----------------> filterby', fliter_by);
        console.log('----------------> q', q);
        const queryB = this.createQueryBuilder('role')
            .where('role.isVisible = :isVisible', { isVisible: true })
            .orderBy('role.creationDate', 'DESC')
            if(userType)
                queryB.andWhere('role.appliesTo = :userType', { userType })
            if(fliter_by && q){
                if(fliter_by == 'modificationDate' || fliter_by == 'creationDate')
                    queryB.andWhere(`DATE_FORMAT(role.${fliter_by}, '%y-%M-%d') =  DATE_FORMAT(:q, '%y-%M-%d')`, { q })
                else{
                    if(proximity_search)
                        queryB.andWhere(`role.${fliter_by} = :q`, { q })
                    else
                        queryB.andWhere(`role.${fliter_by} LIKE :q`, { q: `%${q}%` })
                }
            }
            if(page && per_page)
                queryB.skip((Number(page) - 1) * Number(per_page)).take(Number(per_page))
            // console.log('---> QUERY B: ', queryB);
        
        return queryB.getManyAndCount();
    }

    static getLiberaUserRoles(): Promise<Role[]> {
        const queryB = this.createQueryBuilder('role')
            .where('role.appliesTo = :appliesTo', { appliesTo: FilterRoleUserTypeEnum.LIBERA_USER})

        // console.log('---> QUERY B: ', queryB.getQueryAndParameters());
        return queryB.getMany();
    }

    static getByCode(code: string): Promise<Role> {
        return this.createQueryBuilder('role')
            .where('role.name = :code', { code })
            .getOne();
    }

    static getRoleByAcronym(acronym: string): Promise<Role> {
        return this.createQueryBuilder('role')
            .where('role.acronym = :acronym', { acronym })
            .getOne();
    }

    static countUsersByRole(name: String): Promise<number> {
        return this.createQueryBuilder('role')
            .innerJoin('role.userRoles', 'userRole')
            .innerJoin('userRole.user', 'user')
            .where('role.name = :name', { name })
            .andWhere('user.status != :status', { status: 'DELETED' })
            .getCount();
    }

    static getAllEnabledRoles(){
        return this.createQueryBuilder('role')
            .select('role.name')
            .where('role.status = :status', { status: UserStatus.ENABLED })
            .getMany();
    }

}