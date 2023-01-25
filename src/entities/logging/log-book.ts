import { Column } from 'typeorm';
import { User } from './user';
import { NegotiationRoleEnum } from 'commons/enums/negotiation-role.enum';
import { EventTypeEnum } from 'commons/enums/event-type.enum';
import { DiscountTypeEnum } from 'commons/enums/discont-type.enum';
import { NPDiscountTypeEnum } from 'commons/enums/negotiation-process-discount-type.enum';
import { EnterpriseInvoiceNegotiationtTypeEventEnum } from 'commons/enums/enterprise-invoice-negotiation-process-status.enum';

export class LogBook {

    @Column(type => User)
    user: User

    @Column({
        name: 'negotiationRole',
        type: 'enum',
        enum: NegotiationRoleEnum
    })
    negotiationRole: NegotiationRoleEnum;

    @Column({
        name: 'eventDate',
        type: 'timestamp'
    })
    eventDate: Date;

    @Column({
        name: 'eventType',
        type: 'enum',
        enum: EnterpriseInvoiceNegotiationtTypeEventEnum
    })
    eventType: EnterpriseInvoiceNegotiationtTypeEventEnum;

    @Column({
        name: 'discountType',
        type: 'enum',
        enum: NPDiscountTypeEnum
    })
    discountType: NPDiscountTypeEnum;

    @Column({
        name: 'discountPercentage'
    })
    discountPercentage: number;

    @Column({
        name: 'discountDueDate',
        type: 'timestamp'
    })
    discountDueDate: Date;

    @Column({
        name: 'expectedPaymentDate',
        type: 'timestamp'
    })
    expectedPaymentDate: Date;

    @Column({
        name: 'discountValue'
    })
    discountValue: number;

    constructor(user: User, negotiationRole: NegotiationRoleEnum, eventDate: Date, 
        eventType: EnterpriseInvoiceNegotiationtTypeEventEnum) {
        this.user = user;
        this.negotiationRole = negotiationRole;
        this.eventDate = eventDate;
        this.eventType = eventType;
    }
}