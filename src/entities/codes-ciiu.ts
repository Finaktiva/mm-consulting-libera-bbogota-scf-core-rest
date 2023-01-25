import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'CODES_CIIU' })
export class CodesCiiu extends BaseEntity {

    @PrimaryColumn()
    CIIU: string;

    @Column()
    ACTIVIDAD_ECONOMICA: string;

    @Column()
    SECTOR_ECONOMICO: string;

    static getByCiiu(ciiu: string) {
        return this.createQueryBuilder('codesCiiu')
            .where('codesCiiu.ciiu = :ciiu', { ciiu })
            .getOne();
    }
}