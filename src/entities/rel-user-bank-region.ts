import { Entity, BaseEntity, ManyToOne, JoinColumn} from 'typeorm';
import { User } from './user';
import { CatBankRegion } from './cat-bank-regions';


@Entity({name: 'REL_USER_BANK_REGION'})
export class RelUserBankRegion extends BaseEntity {
    @ManyToOne(type => User, user => user.relUserBankRegion, {primary: true})
    @JoinColumn({ name: 'USER_ID' })
    user: User;

    @ManyToOne(type => CatBankRegion, catBankRegion => catBankRegion.relUserBankRegion, {primary: true})
    @JoinColumn({ name: 'BANK_REGION_ID' })
    bankRegion: CatBankRegion;

    static async deleteByUserId(id: number): Promise<void> {
        this.createQueryBuilder('relUserBankRegion')
            .leftJoinAndSelect('relUserBankRegion.user' , 'user')
            .delete()
            .where('user.id = :id', { id })
            .execute();
    }

    static async getRelUserBankRegionByBankRegionId(id: number): Promise<RelUserBankRegion[]> {
        return this.createQueryBuilder('relUserBankRegion')
            .leftJoinAndSelect('relUserBankRegion.bankRegion' , 'bankRegion')
            .where('bankRegion.id = :id', { id })
            .getMany();
    }
}