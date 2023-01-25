import { Entity,Column, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import { CatPermission } from './cat-permissions';
import { Role } from './role';


@Entity({name: 'REL_ROLE_PERMISSION'})
export class RelRolePermission extends BaseEntity {

    @ManyToOne(type => Role, role => role.relRolePermissions, {primary: true})
    @JoinColumn({ name: 'ROLE' })
    role: Role;

    @ManyToOne(type => CatPermission, catPermission => catPermission.relRolePermissions, {primary: true})
    @JoinColumn({ name: 'PERMISSION' })
    permission: CatPermission;

    @Column({name: 'CREATION_DATE'})
    creationDate: Date;

    static async deleteByRole(role: String): Promise<void> {
        await this.createQueryBuilder('relRolePermission')
            .delete()
            .where({ role})
            .execute();
    }

    static async getPermissionsByRole(role: String): Promise<RelRolePermission[]> {
        const query = this.createQueryBuilder('relRolePermission')
            .leftJoinAndSelect('relRolePermission.permission', 'permission')
            .leftJoin('relRolePermission.role','role')
            .where('role.name = :role', { role })
        
        // console.log(query.getQueryAndParameters());
        
        return query.getMany()


    }
}