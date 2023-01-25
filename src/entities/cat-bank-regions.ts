import { Entity,Column, BaseEntity, PrimaryColumn, OneToMany} from 'typeorm';
import { Enterprise } from './enterprise';
import { RelUserBankRegion } from './rel-user-bank-region';


@Entity({name: 'CAT_BANK_REGION'})
export class CatBankRegion extends BaseEntity {
    @PrimaryColumn({
        name: 'ID',
        type: 'bigint'
    })
    id: number;

    @Column({
        name: 'DESCRIPTION',
        type: 'varchar'
    })
    description: string;

    @OneToMany(type => Enterprise, enterprise => enterprise.bankRegion)
    enterpriseBankRegion: Enterprise[];

    @OneToMany(type => RelUserBankRegion, relUserBankRegion => relUserBankRegion.bankRegion)
    relUserBankRegion: RelUserBankRegion[];

    static getAllRegions(): Promise<CatBankRegion[]>{
        return this.createQueryBuilder('CatBankRegion')
            .getMany();
    }

    static getRegionById(id: number):Promise<CatBankRegion> {
        return this.createQueryBuilder('CatBankRegion')
            .where('CatBankRegion.id = :id', { id })
            .getOne();
    }
}