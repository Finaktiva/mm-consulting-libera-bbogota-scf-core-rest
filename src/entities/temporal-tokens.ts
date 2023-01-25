import { Entity, BaseEntity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { EnterpriseRequest } from './enterprise-request';
import { TemporalTokenTypeEnum } from 'commons/enums/temporal-token-type.enum';
import { TemporalTokenStatusEnum } from 'commons/enums/temporal-token-status.enum';
import { EnterpriseRequestTypeEnum } from 'commons/enums/enterprise-request-type.enum';


@Entity({name: 'TEMPORAL_TOKENS'})
export class TemporalTokens extends BaseEntity {

    @PrimaryColumn({
        name: 'TOKEN',
        type: 'varchar'
    })
    token: string;

    @OneToOne(type => EnterpriseRequest, enterpriseRequest => enterpriseRequest.temporalToken)
    @JoinColumn({
        name: 'REQUEST_ID'
    })
    enterpriseRequest: EnterpriseRequest;

    @Column({
        name: 'EXPIRATION_DATE'
    })
    expirationDate: Date;

    @Column({ 
        name: 'CREATION_DATE' 
    })
    creationDate: Date;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: TemporalTokenStatusEnum
    })
    status: TemporalTokenStatusEnum;

    @Column({
        name: 'TYPE',
        type: 'enum',
        enum: TemporalTokenTypeEnum
    })
    type: TemporalTokenTypeEnum

    @Column({ 
        name: 'EVENT_ID' 
    })
    eventId: string;

    static getByTokenAndEnterpriseId(token: string, enterpriseId: number) {
        return this.createQueryBuilder('temporalTokens')
            .leftJoinAndSelect('temporalTokens.enterpriseRequest', 'enterpriseRequest')
            .leftJoinAndSelect('enterpriseRequest.enterpriseLink', 'enterpriseLink')
            .leftJoinAndSelect('enterpriseLink.enterpriseLink', 'enterpriseLinked')
            .leftJoinAndSelect('enterpriseRequest.enterprise', 'enterprise')
            .andWhere('temporalTokens.token = :token', { token })
            .andWhere('enterpriseRequest.requestType = :type', { type: EnterpriseRequestTypeEnum.ENTERPRISE_LINKING })
            .andWhere('enterpriseLinked.id = :enterpriseId', { enterpriseId })
            .getOne();
    }

    static getTemporalTokenByRequestId(requestId: number) {
        return this.createQueryBuilder('temporalTokens')
            .leftJoinAndSelect('temporalTokens.enterpriseRequest', 'enterpriseRequest')
            .andWhere('enterpriseRequest.id = :requestId', { requestId })
            .getOne();
    }
}