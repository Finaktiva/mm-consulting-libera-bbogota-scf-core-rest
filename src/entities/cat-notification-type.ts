import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Notification } from './notification';
import { CatNotificationTypeEnum } from 'commons/enums/cat-notification-type.enum';

@Entity({ name: 'CAT_NOTIFICATION_TYPE'})
export class CatNotificationType extends BaseEntity{

    @PrimaryColumn({
        name: 'CODE',
        type: 'enum',
        enum: CatNotificationTypeEnum
    })
    code: CatNotificationTypeEnum;

    @Column({
        name: 'DESCRIPTION'
    })
    description: string;

    @OneToMany(type => Notification, notification => notification.notificationType)
    notifications: Notification[]

    static getNotificationTypeByType(notificationType: CatNotificationTypeEnum){
        return this.createQueryBuilder('catNotificationType')
            .where('catNotificationType.code = :notificationType',{notificationType})
            .getOne();
    }
}