import { Entity, BaseEntity, OneToOne, JoinColumn, Column} from 'typeorm';
import { User } from './user';

@Entity({ name: 'USER_PROPERTIES' })
export class UserProperties extends BaseEntity {
    
    @OneToOne(type => User, user => user.userProperties, { primary: true})
    @JoinColumn({
        name: 'USER_ID'
    })
    user: User;

    @Column({
        name: 'NAME'
    })    
    name: string;

    @Column({
        name: 'FIRST_SURNAME'
    })
    firstSurname: string;

    @Column({
        name: 'SECOND_SURNAME'
    })
    secondSurname: string;

    @Column({
        name: 'CREATED_DATE'
    })
    createdDate: Date;

    @Column({
        name: 'MODIFIED_DATE'
    })
    modifiedDate: Date;

    @Column({ name: 'DOCUMENT_TYPE' })
    documentType: string;

    @Column({ name: 'DOCUMENT_NUMBER' })
    documentNumber: string;

    @Column({ name: 'PHONE_EXT' })
    phoneExt: string;

    @Column({ name: 'PHONE_NUMBER' })
    phoneNumber: string;

    static deleteUserPropertiesById(userId: number) {
        return this.createQueryBuilder('userProperties')
            .leftJoinAndSelect('userProperties.user', 'user')
            .delete()
            .where('user.id = :userId', { userId })
            .execute();
    }

    static getUserPropertiesById(userId: number) {
        return this.createQueryBuilder('userProperties')
        .leftJoinAndSelect('userProperties.user', 'user')
        .where('user.id = :userId', { userId })
        .getOne();
    }
    
}