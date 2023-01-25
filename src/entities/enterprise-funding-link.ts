import { EnterpriseFundingLinkRateType } from 'commons/enums/enterprise-funding-link-rate-type.enum';
import { EnterpriseFundingLinkStatusEnum } from 'commons/enums/enterprise-funding-link-status.enum';
import { BasicFilter, EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy, LenderPayersFilterBy } from 'commons/filter';
import { BaseEntity, Brackets, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enterprise } from './enterprise';
import { EnterpriseFundingTransactions } from './enterprise-funding-transaccions';
import { EnterpriseQuotaRequest } from './enterprise-quota-request';
import { LenderCustomAttributesLink } from './lender-custom-attributes-link';
import { User } from './user';

@Entity({ name: 'ENTERPRISE_FUNDING_LINK' })
export class EnterpriseFundingLink extends BaseEntity {

    @PrimaryGeneratedColumn({ name: 'ID' })
    id: number;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseFundingLinkPayer)
    @JoinColumn({
        name: 'PAYER_ENTERPRISE_ID'
    })
    payer: Enterprise;

    @ManyToOne(type => Enterprise, enterprise => enterprise.enterpriseFundingLinkLender)
    @JoinColumn({
        name: 'LENDER_ENTERPRISE_ID'
    })
    lender: Enterprise;

    @Column({
        name: 'CREATION_DATE'
    })
    creationDate: Date;

    @ManyToOne(type => User, user => user.enterpriseFundingLink)
    @JoinColumn({
        name: 'CREATION_USER'
    })
    creationUser: User;

    @Column({
        name: 'UPDATE_DATE'
    })
    updateDate: Date;

    @ManyToOne(type => User, user => user.fundingLinkUpdateUser)
    @JoinColumn({
        name: 'UPDATE_USER'
    })
    updateUser: User;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: EnterpriseFundingLinkStatusEnum
    })
    status: EnterpriseFundingLinkStatusEnum;

    @Column({
        name: 'LINK_DATE',
        nullable: true
    })
    linkDate: Date;

    @Column({
        name: 'RATE_TYPE',
        type: 'enum',
        enum: EnterpriseFundingLinkRateType
    })
    rateType: EnterpriseFundingLinkRateType;

    @Column({
        name: 'RATE_PERCENTAGE',
    })
    ratePercentage: number;

    @Column({
        name: 'TOTAL_FUNDING_AMOUNT',
    })
    totalFundingAmount: number;

    @OneToMany(type => EnterpriseFundingTransactions, enterpriseFundingTransactions => enterpriseFundingTransactions.enterpriseFundingLink)
    enterpriseFundingTransactions: EnterpriseFundingTransactions[];

    @OneToMany(type => LenderCustomAttributesLink, lenderCustomAttributeLink => lenderCustomAttributeLink.enterpriseFundingLink)
    lenderCustomAttributesLink: LenderCustomAttributesLink[];

    @OneToOne(type => EnterpriseQuotaRequest, enterpriseQuotaRequest => enterpriseQuotaRequest.enterpriseFundingTransaction)
    enterpriseQuotaRequest: EnterpriseQuotaRequest;

    static getLinkByPayerAndLenderId(payerId: number, lenderId: number) {
        return this.createQueryBuilder('fundingLink')
            .leftJoinAndSelect('fundingLink.payer', 'payer')
            .leftJoinAndSelect('fundingLink.lender', 'lender')
            .leftJoinAndSelect('fundingLink.enterpriseFundingTransactions', 'enterpriseFundingTransactions')
            .andWhere('fundingLink.status = :status', { status: EnterpriseFundingLinkStatusEnum.ENABLED })
            .andWhere('payer.id = :payerId', { payerId })
            .andWhere('lender.id = :lenderId', { lenderId })
            .getOne();
    }

    static getEnterprisePayersByLender(lenderId: number, filter: BasicFilter<LenderPayersFilterBy, string>) {
        const queryBuilder = this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('payer.sector', 'sector')
            .leftJoinAndSelect('payer.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .leftJoinAndSelect('enterpriseFundingLink.lenderCustomAttributesLink', 'lenderCustomAttributesLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.catCustomAttribute', 'customAttribute')
            .leftJoinAndSelect('customAttribute.optionsCustomAttributes', 'optionsCustomAttributes')
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('enterpriseFundingLink.status = :status', { status: EnterpriseFundingLinkStatusEnum.ENABLED });


        if (filter.filterBy == 'ENTERPRISE_NAME' && filter.q)
            queryBuilder.andWhere('lower(payer.enterpriseName) LIKE :q', { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` });

        if (filter.filterBy == 'NIT' && filter.q)
            queryBuilder.andWhere('payer.nit = :q', { q: filter.q });

        if (filter.filterBy == 'ENTERPRISE_TYPE' && filter.q)
            queryBuilder.andWhere('payer.type = :q', { q: filter.q })

        if (filter.filterBy == 'SECTOR')
            queryBuilder.andWhere('lower(sector.name) LIKE :q', { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` })

        return queryBuilder
            .skip(((filter.page - 1) * filter.perPage))
            .take(filter.perPage)
            .getManyAndCount();
    }

    static getBasicByLenderIdAndPayerId(lenderId: number, payerId: number) {
        return this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('payer.id = :payerId', { payerId })
            .getOne();
    }

    static getByLenderIdAndPayerId(lenderId: number, payerId: number) {
        return this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('payer.sector', 'sector')
            .leftJoinAndSelect('payer.owner', 'owner')
            .leftJoinAndSelect('owner.userProperties', 'userProperties')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .leftJoinAndSelect('enterpriseFundingLink.lenderCustomAttributesLink', 'lenderCustomAttributesLink')
            .leftJoinAndSelect('lenderCustomAttributesLink.catCustomAttribute', 'customAttribute')
            .leftJoinAndSelect('customAttribute.optionsCustomAttributes', 'optionsCustomAttributes')
            .where('lender.id = :lenderId', { lenderId })
            .andWhere('payer.id = :payerId', { payerId })
            .getOne();
    }

    static getGeneralBalanceData(enterpriseFundingLinkId: number) {
        const statusApproved = 'APPROVED';
        const statusPending = 'PENDING_APPROVAL';
        const PAYMENT = 'PAYMENT';
        const WITHDRAW = 'WITHDRAW';
        return this.createQueryBuilder('enterpriseFundingLink')
            .select('enterpriseFundingLink.totalFundingAmount', 'totalFundingAmount')
            .addSelect(sQ => {
                return sQ.select('SUM(enterpriseFundingTransaction.amount)', 'paymentA')
                    .from(EnterpriseFundingTransactions, 'enterpriseFundingTransaction')
                    .leftJoin('enterpriseFundingTransaction.enterpriseFundingLink', 'enterpriseFundingLink')
                    .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
                    .andWhere('enterpriseFundingTransaction.status = :statusApproved', { statusApproved })
                    .andWhere('enterpriseFundingTransaction.transactionType = :PAYMENT', { PAYMENT })
            }, 'paymentA')
            .addSelect(sQ => {
                return sQ.select('SUM(enterpriseFundingTransaction.amount)', 'withdrawlPA')
                    .from('EnterpriseFundingTransactions', 'enterpriseFundingTransaction')
                    .leftJoin('enterpriseFundingTransaction.enterpriseFundingLink', 'enterpriseFundingLink')
                    .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
                    .andWhere('enterpriseFundingTransaction.status = :statusPending', { statusPending })
                    .andWhere('enterpriseFundingTransaction.transactionType = :WITHDRAW', { WITHDRAW })
            }, 'withdrawlPA')
            .addSelect(sQ => {
                return sQ.select('SUM(enterpriseFundingTransaction.amount)', 'withdrawlA')
                    .from('EnterpriseFundingTransactions', 'enterpriseFundingTransaction')
                    .leftJoin('enterpriseFundingTransaction.enterpriseFundingLink', 'enterpriseFundingLink')
                    .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
                    .andWhere('enterpriseFundingTransaction.status = :statusApproved', { statusApproved })
                    .andWhere('enterpriseFundingTransaction.transactionType = :WITHDRAW', { WITHDRAW })
            }, 'withdrawlA')
            .where('enterpriseFundingLink.id = :enterpriseFundingLinkId', { enterpriseFundingLinkId })
            .getRawOne();
    }

    static getEnterpriseLendersByPayer(payerId: number,
        filter: BasicFilter<EnterpriseQuotaRequestFilterBy, EnterpriseQuotaRequestOrderBy>) {
        const queryBuilder = this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .leftJoinAndSelect('enterpriseFundingLink.enterpriseFundingTransactions', 'fundingTransactions')
            .leftJoinAndSelect('fundingTransactions.enterpriseQuotaRequest', 'enterpriseQuotaRequest')
            .andWhere('enterpriseFundingLink.status = :status', { status: EnterpriseFundingLinkStatusEnum.ENABLED })
            .andWhere('payer.id = :payerId', { payerId })

        if (filter.filterBy == 'ENTERPRISE_NAME' && filter.q)
            queryBuilder.andWhere('lower(lender.enterpriseName) LIKE :q', { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` });

        if (filter.filterBy == 'NIT' && filter.q)
            queryBuilder.andWhere('lender.nit LIKE :q', { q: `%${filter.q.replace(/ /g, '').toLowerCase()}%` });

        if (filter.orderBy == 'AVAILABLE_QUOTA')
            queryBuilder.orderBy('enterpriseQuotaRequest.payerRequestAmount', 'ASC');
        if (filter.orderBy == 'GRANTED_QUOTA')
            queryBuilder.orderBy('enterpriseQuotaRequest.lenderGrantedAmount', 'ASC');
        if (filter.orderBy == 'RATE')
            queryBuilder.orderBy('enterpriseQuotaRequest.ratePercentage', 'ASC');

        return queryBuilder
            .skip(((filter.page - 1) * filter.perPage))
            .take(filter.perPage)
            .getManyAndCount();
    }

    static getLinkByPayerAndLenderIdexist(payerId: number, lenderId: number) {
        return this.createQueryBuilder('fundingLink')
            .leftJoinAndSelect('fundingLink.payer', 'payer')
            .leftJoinAndSelect('fundingLink.lender', 'lender')
            .leftJoinAndSelect('fundingLink.enterpriseFundingTransactions', 'enterpriseFundingTransactions')
            .andWhere('fundingLink.status = :status', { status: EnterpriseFundingLinkStatusEnum.PENDING_PAYER_APPROVAL })
            .andWhere('payer.id = :payerId', { payerId })
            .andWhere('lender.id = :lenderId', { lenderId })
            .getOne();
    }
    static getEnterpriseLendersByHint(enterpriseId: number, hint: string) {
        const queryBuilder = this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .where('payer.id = :enterpriseId', { enterpriseId })
            .andWhere('enterpriseFundingLink.status = :status', { status: EnterpriseFundingLinkStatusEnum.ENABLED });

        if (hint)
            queryBuilder
                .andWhere(new Brackets(qb => {
                    qb.where('lender.enterpriseName LIKE :enterpriseName', { enterpriseName: `%${hint}%` })
                        .orWhere('lender.nit LIKE :nit', { nit: `%${hint}%` })
                })).orderBy('lender.enterpriseName', 'ASC');

        return queryBuilder
            .getMany();
    }

    static getLenderByEnterpriseAndLinkId(enterpriseId: number, enterpriseLinkedId: number) {
        return this.createQueryBuilder('enterpriseFundingLink')
            .leftJoinAndSelect('enterpriseFundingLink.payer', 'payer')
            .leftJoinAndSelect('enterpriseFundingLink.lender', 'lender')
            .andWhere('payer.id = :enterpriseId', { enterpriseId })
            .andWhere('lender.id = :enterpriseLinkedId', { enterpriseLinkedId })
            .getOne();
    }

    static updateByIdFundingLinkPayer(id, rateType, ratePercentage, totalFundingAmount) {
        return this.createQueryBuilder('enterpriseFundingLink')
            .update(EnterpriseFundingLink)
            .set({ rateType, ratePercentage, totalFundingAmount })
            .where('id = :id', { id })
            .execute();
    }

}