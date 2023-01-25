import { Entity, Column, BaseEntity, PrimaryColumn, OneToMany } from 'typeorm';
import { CatPermission } from './cat-permissions';

@Entity({name: 'CAT_PERMISSION_SEGMENT'})
export class CatPermissionSegment extends BaseEntity {
    @PrimaryColumn({
        name: 'CODE',
        type: 'varchar'
    })
    code: string;

    @Column({name: 'DESCRIPTION'})
    description: string;

    @Column({name: 'ORDER'})
    order: number;

    @Column({name: 'CREATION_DATE'})
    creationDate: Date;

    @OneToMany(type => CatPermission, catPermission => catPermission.segmentCode)
    catPermission: CatPermission[];
}