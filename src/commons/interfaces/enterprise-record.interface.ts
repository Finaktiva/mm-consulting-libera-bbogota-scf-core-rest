import { EnterpriseRecordTypeEventEnum } from "commons/enums/enterprise-record-type-event.enum";



export interface IEnterpriseRecord {
  userId: number,
  eventDate: Date,
  typeEvent: EnterpriseRecordTypeEventEnum,
  enterpriseId: number,
  comments?: string,
  entity?: string
}