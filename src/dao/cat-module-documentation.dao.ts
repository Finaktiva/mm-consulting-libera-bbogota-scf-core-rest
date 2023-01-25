import { getConnection } from 'commons/connection';
import { CatModuleDocumentation } from 'entities/cat-module-documentation';

export class CatModuleDocumentationDAO {

  static async  getAll() {
    await getConnection();
    const catModulesDocumentation = await CatModuleDocumentation.getAll();
    return catModulesDocumentation;
  }

}