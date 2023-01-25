import { UserTypeEntityEnum } from 'commons/enums/entities/role-user-type-entity.enum';
import { FilterUserTypeEnum } from 'commons/enums/filter-by.enum';
import { Entity, Column, BaseEntity, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { CatPermissionSegment } from './cat-permission-segment';
import { RelRolePermission } from './rel-role-permission';

@Entity({name: 'CAT_PERMISSION'})
export class CatPermission extends BaseEntity {
    @PrimaryColumn({
        name: 'CODE',
        type: 'varchar'
    })
    code: string;

    @Column({name: 'DESCRIPTION'})
    description: string;

    @Column({name: 'ORDER'})
    order: number;

    @Column({name: 'APPLIES_TO_USER_TYPE'})
    appliesToUserType: string;

    @Column({name: 'CREATION_DATE'})
    creationDate: Date;
    
    @Column({
        name: 'ENABLED',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
    })
    enabled: boolean;

    @OneToMany(type => RelRolePermission, relRolePermission => relRolePermission.permission)
    relRolePermissions: RelRolePermission[];

    @ManyToOne(type => CatPermissionSegment, catPermissionSegment => catPermissionSegment.code)
    @JoinColumn({ name: 'SEGMENT_CODE' })
    segmentCode: CatPermissionSegment;

    static getAllPermissions(userType?: FilterUserTypeEnum): Promise<CatPermission[]> {
        const queryBuilder = this.createQueryBuilder('catPermissions');
        
        if(userType){
            queryBuilder.where('catPermissions.appliesToUserType = :userType', { userType })
            .orWhere('catPermissions.appliesToUserType = :both', { both: UserTypeEntityEnum.BOTH })
        }

        queryBuilder.leftJoinAndSelect('catPermissions.segmentCode', 'CatPermissionSegment')
        .orderBy('catPermissions.order', 'ASC')
        .addOrderBy('CatPermissionSegment.order', 'ASC');

        //console.log(`Executed query: ${ queryBuilder.getQueryAndParameters() }`);

        return queryBuilder.getMany();
    }

}

