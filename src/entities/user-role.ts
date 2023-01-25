import { Entity, BaseEntity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user';
import { Role } from './role';
import { WSAEHOSTUNREACH } from 'constants';
import { RoleEnum } from 'commons/enums/role.enum';
import { PermissionEnum } from 'commons/enums/permission.enum';

@Entity({ name: 'USER_ROLE' })
export class UserRole extends BaseEntity {

    @ManyToOne(type => User, user => user.userRoles, { primary:  true })
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @ManyToOne(type => Role, role => role.userRoles, { primary:  true })
    @JoinColumn({
        name: 'ROLE'
    })
    role: Role;

    static getRoleByUserId(id: number, role:Role): Promise<UserRole>{
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.role','role')
            .leftJoinAndSelect('userRole.user', 'user')
            .where('user.id =:id',{id})
            .andWhere('role.name =:role', {role})
            .getOne();
    }
    
    static deleteUserRoleById(userId:number){
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.user' , 'user')
            .delete()
            .where('user.id = :userId', { userId })
            .execute();
    }
    static getByUserId(id: number){
        return this.createQueryBuilder('userRole')
        .leftJoinAndSelect('userRole.role','role')
        .leftJoinAndSelect('userRole.user', 'user')
        .where('user.id =:id',{id})
        .getOne();
    }

    static getRolesByUserId(userId: number) {
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .leftJoinAndSelect('userRole.user', 'user')
            .where('user.id = :userId', {userId})
            .getMany();
    }

    static async deleteRoleByUserIdAndRole(userId: number, role: RoleEnum) {
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .leftJoinAndSelect('userRole.user', 'user')
            .delete()
            .where('user.id = :userId', {userId})
            .andWhere('role.name = :role', {role})
            .execute();
    }   

    static getByIdAndName(userId: number, role: RoleEnum) {
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.user', 'user')
            .leftJoinAndSelect('userRole.role', 'role')
            .where('role.name = :role', {role})
            .andWhere('user.id = :userId', {userId})
            .getOne();
    }

    static async getUserByIdAndPermissions(userId: number, permissions: PermissionEnum[]) {
        return this.createQueryBuilder('userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .leftJoinAndSelect('role.relRolePermissions', 'relRolePermission')
            .leftJoinAndSelect('relRolePermission.permission', 'permission')
            .where('userRole.user = :userId', {userId})
            .andWhere('permission.code IN (:...permissions)', {permissions})
            .getOne();
    }

    static getRolesPermissionsByUserId(userId: number): Promise<UserRole[]> {
        return this.createQueryBuilder('userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('role.relRolePermissions', 'relRolePermission')
        .leftJoinAndSelect('relRolePermission.permission', 'permission')
        .where('userRole.user = :userId', {userId})
        .andWhere('role.status = :status', {status: 'ENABLED'})
        .andWhere('permission.enabled = :enabled', {enabled: true})
        .getMany();
    }

    static async getUserByPermission(permission: PermissionEnum, region?: number): Promise<UserRole[]> {
        const queryB = this.createQueryBuilder('userRole')
            .leftJoin('userRole.role', 'role')
            .leftJoin('role.relRolePermissions', 'relRolePermission')
            .leftJoin('relRolePermission.permission', 'permission')
            .leftJoinAndSelect('userRole.user', 'user')
            .where('permission.code = :permission', {permission})
            .andWhere('user.type = :type', {type: 'LIBERA_USER'})
        if (region) {
            queryB.leftJoinAndSelect('user.relUserBankRegion', 'relUserBankRegion')
            queryB.andWhere('relUserBankRegion.bankRegion = :region', {region})
        }
        return queryB.getMany();
    }
}