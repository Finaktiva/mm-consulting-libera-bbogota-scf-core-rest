import { BaseEntity } from "typeorm";
import { getConnection } from "./connection";
import { InternalServerException } from "./exceptions";
export default class CoreTransacctionManager {

  /**
   * @description Stores in transaction mode all operations against db
   * @param {BaseEntity[]} entities Array of entities to store on DB
   * @return {Promise<void>}
   * @author festrada
   */
  static async performTransacctions(entities: BaseEntity[]): Promise<void> {
    console.log("TRANSACCTION MANAGER: Begin Transacction");
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      for (const entity of entities) {
        if (entity)
          await queryRunner.manager.save(entity);
      }
      await queryRunner.commitTransaction();
    } catch (errors) {
      console.log(errors)
      await queryRunner.rollbackTransaction();
      throw new InternalServerException("SCF.LIBERA.COMMON.500", { errors: errors });
    }
    console.log("TRANSACCTION MANAGER: End Transacction");
  }
}