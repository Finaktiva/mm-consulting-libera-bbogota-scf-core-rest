import { Entity,Column,PrimaryGeneratedColumn, BaseEntity, OneToOne} from 'typeorm';
import { Enterprise } from './enterprise';

@Entity({name: 'CAT_LADA'})
export class CatLada extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'ID',
        type: 'bigint'
    })
    id: number;

    @Column({
        name: 'COUNTRY',
        type: 'varchar'
    })
    country: string;

    @Column({
        name: 'LADA',
        type: 'varchar'
    })
    lada: string;

    @OneToOne(type => Enterprise, enterprise => enterprise.lada)
    enterprise: Enterprise;

    static getLadaById(ladaId: number) {
        return this.createQueryBuilder('lada')
            .where('lada.id = :ladaId', {ladaId})
            .getOne();
    }
    
    static getLadas(){
        return this.createQueryBuilder('catLadas')
            .getMany();
    }

    static getLadaByLada(lada: number) {
        return this.createQueryBuilder('catLada')
            .where('catLada.lada = :lada', {lada})
            .getOne();
    }
}