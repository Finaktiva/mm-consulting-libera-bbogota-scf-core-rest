import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({name: 'CITIES_DEPARTMENTS'})
export class CitiesDepartments extends BaseEntity {

  @Column()
  COD_DEP: string;

  @Column()
  DPTO: string;

  @PrimaryColumn()
  COD_CIU: string;

  @Column()
  CIUD: string;

  static getAllCitiesDepartments(){
      return this.createQueryBuilder('citiesDepartments')
          .getManyAndCount();
  }

  static getDptoCiudRelation(city: string, department: string) {
      const queryB = this.createQueryBuilder('citiesDepartments')
          .where('citiesDepartments.DPTO = :department', { department })
          .andWhere('citiesDepartments.CIUD = :city', { city })

          // console.log('=====>>> Query: ', queryB.getQueryAndParameters());
      return queryB.getOne();
  }
}