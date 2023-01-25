import { Entity,Column,PrimaryGeneratedColumn, BaseEntity} from 'typeorm';

@Entity({name : 'PING'})
export class Ping extends BaseEntity {
    
    @PrimaryGeneratedColumn({name : 'ID'})
    id:Number;

    @Column({name : 'UUID'})
    uuid:String;

    @Column({name: 'CREATION_DATE', type : 'datetime'})
    creationDate:Date;
}