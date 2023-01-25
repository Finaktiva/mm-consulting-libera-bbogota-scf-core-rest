import { Column } from 'typeorm';
import { User } from './user';
import { FundingLogBookRoleEnum } from 'commons/enums/funding-log-book-role.enum';
import { FundingLogBookEventTypeEnum } from 'commons/enums/funding-log-book-event-type.enum';

export class FundingLogBook {
    @Column(type => User)
    user: User;

    @Column({ name: 'fundingRole', type: 'enum', enum: FundingLogBookRoleEnum })
    fundingRole: FundingLogBookRoleEnum;

    @Column({ name: 'eventDate' })
    eventDate: Date;

    @Column({ name: 'eventType', type: 'enum', enum: FundingLogBookEventTypeEnum })
    eventType: FundingLogBookEventTypeEnum;

    @Column({ name: 'effectivePaymentDate' })
    effectivePaymentDate: Date;

    @Column({ name: 'effectivePaymentAmount' })
    effectivePaymentAmount: number;

    @Column({ name: 'discountValue' })
    discountValue: number;
}