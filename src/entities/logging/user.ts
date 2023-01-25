import { Column } from 'typeorm';

export class User {

    @Column({
        name: 'id'
    })
    id: number;

    @Column({
        name: 'name'
    })
    name: string;

    @Column({ name: 'firstSurname' })
    firstSurname: string;

    @Column({ name: 'secondSurname' })
    secondSurname: string;

    @Column({
        name: 'email'
    })
    email: string;

    constructor(id: string, name: string, email: string) {
        this.id = parseInt(id);
        this.name = name;
        this.email = email;
    }
    
}