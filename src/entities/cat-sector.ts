import { Entity,Column,PrimaryGeneratedColumn, BaseEntity, OneToOne} from 'typeorm';
import { Enterprise } from './enterprise';

@Entity({name: 'CAT_SECTOR'})
export class CatSector extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'ID',
        type: 'bigint'
    })
    id: number;

    @Column({
        name: 'NAME',
        type: 'varchar'
    })
    name: string;

    @OneToOne(type => Enterprise, enterprise => enterprise.sector)
    enterprise: Enterprise;

    static getSectorByEnterpriseId(enterpriseId: number){
        return this.createQueryBuilder('sector')
            .leftJoinAndSelect('sector.enterprise', 'enterprise')
            .where('enterprise.id = :enterpriseId', {enterpriseId})
            .getOne();
    }

    static getSectorById(sectorId: number) {
        return this.createQueryBuilder('sector')
            .where('sector.id = :sectorId', {sectorId})
            .getOne();
    }
    
    static getSectors(){
        return this.createQueryBuilder('catSectors')
            .getMany();
    }
}