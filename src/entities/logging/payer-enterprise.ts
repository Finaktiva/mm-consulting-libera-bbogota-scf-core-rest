import { Column } from 'typeorm';

export class PayerEnterprise {

    @Column({
        name: 'id',
        type: 'int'
    })
    id: number;


    @Column({
        name: 'name'
    })
    name: string;

    @Column({
        name: 'ownerName'
    })
    ownerName: string;

    @Column({
        name: 'ownerEmail'
    })
    ownerEmail: string;

    constructor(id: string, name: string, ownerName: string, ownerEmail: string)
    {
        this.id = parseInt(id);
        this.name = name;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
    }
}