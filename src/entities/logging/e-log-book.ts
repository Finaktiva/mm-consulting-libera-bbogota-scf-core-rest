import { Column } from 'typeorm';
import { User } from './user';
import { ELogBookEventTypeEnum } from 'commons/enums/e-log-book-event-type.enum';
import { ELogBookEntityEnum } from 'commons/enums/e-log-book-entity.enum';

export class ELogBook {
    @Column(type => User)
    user: User;

    @Column({ name: 'eventDate' })
    eventDate: Date;

    @Column({ name: 'eventType', type: 'enum', enum: ELogBookEventTypeEnum })
    eventType: ELogBookEventTypeEnum;

    @Column({ name: 'entity', type: 'enum', enum: ELogBookEntityEnum })
    entity: ELogBookEntityEnum;

    @Column({ name: 'comments' })
    comments: string;
}