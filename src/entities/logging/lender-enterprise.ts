import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class LenderEnterprise {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'ownerName' })
    ownerName: string;

    @Column({ name: 'ownerEmail' })
    ownerEmail: string;

    constructor(id: string, name: string, ownerName: string, ownerEmail: string)
    {
        this.id = parseInt(id);
        this.name = name;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
    }
}