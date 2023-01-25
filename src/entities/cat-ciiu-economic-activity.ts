import { Entity,Column, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import { CatEconomicSector } from './cat-ciiu-economic-sector';
import { Enterprise } from './enterprise';

@Entity({name: 'CAT_CIIU_ECONOMIC_ACTIVITY'})
export class CatEconomicActivity extends BaseEntity {
    @PrimaryColumn({
        name: 'CIIU_CODE',
        type: 'varchar'
    })
    ciiuCode: string;

    @Column({
        name: 'DESCRIPTION',
        type: 'varchar'
    })
    description: string;

    @ManyToOne(type => CatEconomicSector, catEconomicSector => catEconomicSector.economicActivities)
    @JoinColumn({ name: 'ECONOMIC_SECTOR_ID' })
    economicSector: CatEconomicSector;

    @OneToMany(type => Enterprise, enterprise => enterprise.economicActivity)
    enterprises: Enterprise[];

    static getActivityByCiiu(ciiuCode){
        return this.createQueryBuilder('CatEconomicActivity')
            .leftJoinAndSelect('CatEconomicActivity.economicSector', 'economicSector')
            .where('CatEconomicActivity.ciiuCode = :ciiuCode', {ciiuCode})
            .getOne();
    }
}