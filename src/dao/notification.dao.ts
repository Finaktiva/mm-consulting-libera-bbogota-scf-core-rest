import { Notification } from "entities/notification";
import { getConnection } from "commons/connection";


export class NotificationDAO{

    static async save(notification: Notification){
        console.log('DAO: Starting save');
        await getConnection();
        await notification.save();
        console.log('DAO: Ending save');
    }
}