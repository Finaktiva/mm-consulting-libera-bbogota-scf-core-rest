import { Entity,Column, BaseEntity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import { CatBaseRateType } from './cat-base-rate-type';
import { CatRatePeriodicityType } from './cat_rate_periodicity_type';


@Entity({name: 'REL_BASE_RATE_PERIODICITY'})
export class RelBaseRatePeriodicity extends BaseEntity {
    @ManyToOne(type => CatBaseRateType, catBaseRateType => catBaseRateType.relRatePeriodicity, {primary: true})
    @JoinColumn({ name: 'BASE_RATE_CODE' })
    baseRateType: CatBaseRateType;

    @ManyToOne(type => CatRatePeriodicityType, catBaseRateType => catBaseRateType.relRatePeriodicity, {primary: true})
    @JoinColumn({ name: 'RATE_PERIODICITY_CODE' })
    basePeriodicityType: CatRatePeriodicityType;

    static getAllRatePeriodicityRelations(): Promise<RelBaseRatePeriodicity[]>{
        const queryB = this.createQueryBuilder('RelRatePeriodicity')
            .leftJoinAndSelect('RelRatePeriodicity.baseRateType', 'rateType')
            .leftJoinAndSelect('RelRatePeriodicity.basePeriodicityType', 'periodicityType]')
        return queryB.getMany();
    }

    static getRateAndPeriodicityRelation(rateType: string, periodicityTypeType: string): Promise<RelBaseRatePeriodicity> {
        const queryB = this.createQueryBuilder('RelRatePeriodicity')
            .leftJoinAndSelect('RelRatePeriodicity.baseRateType', 'rateType')
            .leftJoinAndSelect('RelRatePeriodicity.basePeriodicityType', 'periodicityType]')
            .where('RelRatePeriodicity.baseRateType = :rateType', {rateType})
            .andWhere('RelRatePeriodicity.basePeriodicityType = :periodicityTypeType', {periodicityTypeType})
        return queryB.getOne();
    }
}