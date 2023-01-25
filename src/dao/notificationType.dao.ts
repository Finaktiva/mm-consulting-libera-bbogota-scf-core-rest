import { getConnection } from "commons/connection";
import { CatNotificationType } from "entities/cat-notification-type";
import { CatNotificationTypeEnum } from "commons/enums/cat-notification-type.enum";


export class NotificationTypeDAO {
    
    static async getNotificationType(type: CatNotificationTypeEnum){
        console.log('DAO: Starting getNotificationType');
        await getConnection();
        const notificationType = await CatNotificationType.getNotificationTypeByType(type);
        console.log('DAO: Ending getNotificationType');
        return notificationType;
    }
}