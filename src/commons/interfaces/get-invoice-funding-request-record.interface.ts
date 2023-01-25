import { FundingLogBookRoleEnum } from "commons/enums/funding-log-book-role.enum";
import { FundingLogBookEventTypeStatusEnum } from "commons/enums/funding-log-book-event-type.enum";

export interface IGetInvoiceFundingRequestRecordResponse {
    enterpriseName: string,
    fundingRole: FundingLogBookRoleEnum,
    eventDate: Date,
    eventType: FundingLogBookEventTypeStatusEnum
}