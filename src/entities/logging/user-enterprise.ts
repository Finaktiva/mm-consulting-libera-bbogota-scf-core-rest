import { Column } from 'typeorm';

export class UserEnterpriseRecord {

    @Column({
        name: 'id'
    })
    id: number;

    @Column({
        name: 'name'
    })
    name: string;

    @Column({
        name: 'firstSurname'
    })
    firstSurname: string;

    @Column({
        name: 'secondSurname'
    })
    secondSurname: string;

    constructor(id: string, name: string, firstSurname: string, secondSurname: string) {
        this.id = parseInt(id);
        this.name = name;
        this.firstSurname = firstSurname;
        this.secondSurname = secondSurname;
    }
    
}