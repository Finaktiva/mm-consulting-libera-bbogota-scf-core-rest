import { CatDocumentType } from 'entities/cat-document-type';
import { getConnection } from 'commons/connection';

export class CatDocumentTypeDAO {

    static async getDocuments(){
        console.log('DAO: Starting getDocuments');
        await getConnection();
        const documentTypes = await CatDocumentType.getDocumentTypes();
        console.log('DAO: Ending getDocuments');
        return documentTypes;
    }

    static async getDocumentTypeByCode(documentType: string){
        console.log('DAO: Starting getDocumentTypeByCode');
        await getConnection();
        const DocumentType = await CatDocumentType.getDocumentTypeByCode(documentType);
        console.log('DAO: Ending getDocumentTypeByCode');
        return DocumentType;
    }
}