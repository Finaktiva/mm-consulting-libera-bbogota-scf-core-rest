import { BaseEntity, Entity, ManyToOne, JoinColumn } from "typeorm";
import { CatModule } from "./cat-module";
import { CatDocumentType } from "./cat-document-type";

@Entity({ name: 'CAT_MODULE_DOCUMENTATION' })
export class CatModuleDocumentation extends BaseEntity {

    @ManyToOne(type => CatModule, catModule => catModule.catModuleDocumentations, { primary: true })
    @JoinColumn({
        name: 'NAME'
    })
    catModule: CatModule;

    @ManyToOne(type => CatDocumentType, catDocumentType => catDocumentType.catModuleDocumentations, { primary: true })
    @JoinColumn({
        name: 'CODE'
    })
    documentType: CatDocumentType;

    static getAll() {
        return this.createQueryBuilder('catModuleDocumentation')
            .leftJoinAndSelect('catModuleDocumentation.catModule', 'catModule')
            .leftJoinAndSelect('catModuleDocumentation.documentType', 'documentType')
            .getMany();
    }
}