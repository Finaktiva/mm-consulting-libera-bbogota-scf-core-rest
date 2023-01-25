import { Column } from "typeorm";
import { EnterpriseRecordTypeEventEnum } from "commons/enums/enterprise-record-type-event.enum";
import { UserEnterpriseRecord } from "./user-enterprise";


export class EnterpriseLogBook {

  @Column(type => UserEnterpriseRecord)
  user: UserEnterpriseRecord;

  @Column({
    name: 'eventDate',
    type: 'timestamp'
  })
  eventDate: Date;

  @Column({
    name: 'eventType',
    type: 'enum',
    enum: EnterpriseRecordTypeEventEnum
  })
  eventType: EnterpriseRecordTypeEventEnum;

  @Column({
    name: 'entity'
  })
  entity: string;

  @Column({
    name: 'comments'
  })
  comments: string;

  @Column({
    name: 'value'
  })
  value: string;

  constructor(user: UserEnterpriseRecord, eventDate: Date, eventType: EnterpriseRecordTypeEventEnum, comments: string) {
    this.user = user;
    this.eventDate = eventDate;
    this.eventType = eventType;
    this.comments = comments;
  }
}