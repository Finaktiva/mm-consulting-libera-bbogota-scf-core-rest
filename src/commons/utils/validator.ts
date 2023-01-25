import { UserTypeEnum } from "commons/enums/user-type.enum";
import { User } from "entities/user";
import { UserEnterprise } from "entities/user-enterprise";

export default class ValidatorUtilities {
	static createEnterpriseRequestBodyValidator(reqBody: any): boolean {
			console.log('VALIDATOR: Starting createEnterpriseRequestBodyValidator function...');

			if(reqBody.referenceRequestId) {
					if(typeof reqBody.referenceRequestId !== 'number') {
							return false;
					} else {
							return true;
					}
			} else {
					if(reqBody.bankRegion) {
							return false ? (!reqBody.bankRegion.id || typeof reqBody.bankRegion.id !== 'number' || reqBody.bankRegion.id < 0) : true; 
					} else {
							return false;
					}
			}
	}

	static updateEnterpriseRequestBodyValidator(reqBody: any): boolean {
		console.log('VALIDATOR: Starting updateEnterpriseRequestBodyValidator function...');
		if(!reqBody.bankRegion || !reqBody.bankRegion.id || typeof reqBody.bankRegion.id !== 'number' || reqBody.bankRegion.id < 0)
			return false;

		return true;
	}

	static async enterpriseFinancingPlanValidator(enterpriseId: number, userId: number) {
		console.log('VALIDATOR: Starting enterpriseFinancingPlanValidator');
		const { ownerEnterprise, type: userType } = await User.getUserById(userId);
		console.log('userType --> ', userType);
		console.log('ownerEnterprise --> ', ownerEnterprise);

		console.log('enterpriseId from path --> ', enterpriseId);
		console.log('userId from token --> ', userId);
		const match = await UserEnterprise.getMatchByEnterpriseIdAndUserId(enterpriseId, userId);
		console.log('Match --> ', match);

		if (userType === UserTypeEnum.ENTERPRISE_USER) {
			if (ownerEnterprise) {
				// si existe un ownerEnterprise significa que quizá quién está consumiendo el servicio es el owner
				// por lo tanto el idFromToken (owner_id) y el enterpriseId (el que viaja en el path) deberían ser el mismo.
				const idFromToken = ownerEnterprise.id;
				console.log('idFromToken --> ', idFromToken);
				console.log('enterpriseId --> ', enterpriseId);

				if (+idFromToken != +enterpriseId) 
					return false;
			} else {
				// si no existe un ownerEnterprise probablemente quien está consumiendo el servicio es un usuario
				// de alguna empresa, por lo tanto se valida que ese userId tenga relación con el enterpriseId.
				if (!match) 
					return false;
			}
		}
		console.log('VALIDATOR: Ending enterpriseFinancingPlanValidator');
		return true;
	}

	static validateDateFormat(date: string) {
		console.log('VALIDATOR: Starting validateDateFormat...');
		/**
		 * Validación de fecha en formato: AAAA-MM-DD, esta expresión regular no permite fechas erróneas 
		 * como 30 y 31 de febrero o 29 de Febrero en un año que no fue o será bisiesto.
		 */
		let dateFormatRegex = /^(19|20)(((([02468][048])|([13579][26]))-02-29)|(\d{2})-((02-((0[1-9])|1\d|2[0-8]))|((((0[13456789])|1[012]))-((0[1-9])|((1|2)\d)|30))|(((0[13578])|(1[02]))-31)))$/
		if (!date.match(dateFormatRegex)) {
			console.log('--> Failed validation');
			return false;
		}
		console.log('--> Validation success!')
		console.log('VALIDATOR: Ending validateDateFormat...');
		return true;
	}

}