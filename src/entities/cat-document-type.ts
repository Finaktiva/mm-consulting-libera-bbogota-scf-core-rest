import { Entity, BaseEntity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { CatDocumentTypeEnum } from 'commons/enums/cat-document-type.enum';
import { EnterpriseDocumentation } from './enterprise-documentation';
import { CatModuleDocumentation } from './cat-module-documentation';

@Entity({name: 'CAT_DOCUMENT_TYPE'})
export class CatDocumentType extends BaseEntity {

    @PrimaryColumn({ 
        name: 'CODE', 
        type: 'enum',
        enum: CatDocumentTypeEnum
    })
    code: CatDocumentTypeEnum;

    @Column({name: 'DESCRIPTION'})
    description: string;

    @Column({name: 'TEMPLATE_URL'})
    templateUrl: string;
    
    @Column({name: 'ANNOUNCEMENT'})
    announcement: string;

    @Column({name: 'MONTHS_EFFECTIVENESS'})
    effectiveness: number;

    @Column({
        name: 'DEFAULT',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
      })
    isDefault: boolean;

    @Column({
        name: 'REQUIRED',
        type: 'bit',
        transformer: { from: (v: Buffer) => v ? !!v.readInt8(0): null, to: (v) => v }
      })
    required: boolean;

    @OneToMany(type => EnterpriseDocumentation, enterpriseDocumentation => enterpriseDocumentation.documentType)
    enterpriseDocumentations: EnterpriseDocumentation[];

    @OneToMany(type => CatModuleDocumentation, catModuleDocumentation => catModuleDocumentation.documentType)
    catModuleDocumentations: CatModuleDocumentation[];
    
    static getDocumentTypes(){
        return this.createQueryBuilder('catDocumentType')
        .getMany();
    }

    static getDocuments(isDefault: boolean) {
        let queryBuilder = this.createQueryBuilder('catDocumentType');
        if (isDefault != null) {
            queryBuilder.where('catDocumentType.isDefault = :isDefault', { isDefault });
        }
        return queryBuilder.getMany();
    }
    
    static getDocumentTypeByCode(documentType) {
        return this.createQueryBuilder('catDocumentType')
            .where('catDocumentType.code = :documentType', {documentType})
            .getOne();
    }
    
}