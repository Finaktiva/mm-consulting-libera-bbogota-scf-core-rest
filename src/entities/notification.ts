import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { CatNotificationType } from './cat-notification-type';
import { User } from './user';

@Entity({ name : 'NOTIFICATION'})
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn({name : 'ID'})
    id : number;


    @Column({ name: 'SUBJECT' })
    subject: string;


    @Column({ name: 'MESSAGE' })
    message: string;


    @Column({ 
        name: 'CREATION_DATE'
    })
    creationDate: Date;

    @Column({ 
        name: 'SEEN',
        type: 'boolean'
    })
    seen: boolean;

    @ManyToOne(type => CatNotificationType, catNotificationType => catNotificationType.notifications)
    @JoinColumn({
        name: 'NOTIFICATION_TYPE'
    })
    notificationType : CatNotificationType;

    @ManyToOne(type => User, user => user.notifications)
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @Column({ name: 'METADATA' })
    metadata: string;
}