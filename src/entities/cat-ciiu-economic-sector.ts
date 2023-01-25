import { Entity,Column, BaseEntity, PrimaryColumn, OneToMany} from 'typeorm';
import { CatEconomicActivity } from './cat-ciiu-economic-activity';


@Entity({name: 'CAT_CIIU_ECONOMIC_SECTOR'})
export class CatEconomicSector extends BaseEntity {
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


    @OneToMany(type => CatEconomicActivity, catEconomicActivity => catEconomicActivity.economicSector)
    economicActivities: CatEconomicActivity[];
}