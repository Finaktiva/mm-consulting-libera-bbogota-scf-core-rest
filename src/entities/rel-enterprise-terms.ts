import { Entity, BaseEntity, ManyToOne, JoinColumn, Column} from 'typeorm';
import {User} from './user';
import { Enterprise } from './enterprise';
import { Terms } from './terms';


@Entity({name: 'REL_ENTERPRISE_TERMS_AND_CONDITIONS'})
export class RelEnterpriseTerms extends BaseEntity {
    
    @ManyToOne(type => User, user => user.relEnterpriseTerms, { primary: true })
    @JoinColumn({ name: 'USER_ID' })
    user: User;
    
    @ManyToOne(type => Enterprise, enterprise => enterprise.relEnterpriseTerms, { primary: true })
    @JoinColumn({ name: 'ENTERPRISE_ID' })
    enterprise: Enterprise;

    @ManyToOne(type => Terms, terms => terms.relEnterpriseTerms)
    @JoinColumn({ name: 'VERSION_ID' })
    terms: Terms;

    @Column({
        name: 'ACCEPTANCE_DATE',
        type: 'datetime'
    })
    acceptance: Date;

    static async getByEnterpriseId(enterpriseId: number){
        return this.createQueryBuilder('relEnterpriseTerms')
            .where('relEnterpriseTerms.enterprise = :enterpriseId', { enterpriseId })
            .leftJoinAndSelect('relEnterpriseTerms.terms', 'terms')
            .orderBy('terms.id', 'DESC')
            .getOne()
    }

}