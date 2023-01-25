import { EnterpriseDocumentation } from 'entities/enterprise-documentation';
import { Enterprise } from 'entities/enterprise';
import { CatDocumentTypeDAO } from 'dao/cat-document-type.dao';
import moment, { Moment } from 'moment-timezone';
import { CatModule } from 'entities/cat-module';
import { CatModuleEnum } from 'commons/enums/cat-module.enum';
import { CatDocumentType } from 'entities/cat-document-type';
import { S3Metadata } from 'entities/s3-metadata';
import { S3MetadataDAO } from 'dao/s3-metadata.dao';
import { EnterpriseDocumentationDAO } from 'dao/enterprise-documentation.dao';
import { ConflictException } from 'commons/exceptions';
import { EnterpriseDocumentationStatusEnum } from 'commons/enums/enterprise-documentation-status.enum';
import { EnterpriseDAO } from 'dao/enterprise.dao';
import { CatalogDAO } from 'dao/catalog.dao';
import { SESService } from './ses.service';
import LiberaUtils from '../commons/libera.utils'
import { EnterpriseStatusEnum } from 'commons/enums/enterprise-status.enum';
import { CatDocumentTypeEnum } from 'commons/enums/cat-document-type.enum';

//PENDIENG CHANGE VARIABLES ON UPDATE DOCUMENTS SERVICE WITH FOLLOW VARIABLES
const CURRENT_DAYS_LEFT = process.env.DAYS_CURRENT
const EXPIRE_DAYS_LEFT = process.env.DAYS_EXPIRED
const SES_ABOUT_TO_EXPIRE_DOCUMENT_NOTICE = process.env.SES_ABOUT_TO_EXPIRE_DOCUMENT_NOTICE;

export class EnterpriseDocumentationService {

    static async createDocumentation(enterprise: Enterprise, catModules:CatModule[]){
        console.log('SERVICE: Starting createDocumentation method');
        const defaultDocuments: boolean = true;

        const documents:CatDocumentType[] = await CatalogDAO.getDocuments(defaultDocuments);
        let enterpriseDocumentations: EnterpriseDocumentation[] = [];

        for(const document of documents) {
            const enterpriseDocumentation = new EnterpriseDocumentation();
            enterpriseDocumentation.creationDate = moment(moment.now(), 'x').toDate();
            enterpriseDocumentation.modificationDate = moment(moment.now(), 'x').toDate();
            enterpriseDocumentation.documentType = document;
            enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.PENDING;
            enterpriseDocumentation.enterprise = enterprise;
            enterpriseDocumentation.required = null;
            const enterpriseDocumentationResult = await enterpriseDocumentation.save();
            enterpriseDocumentations.push(enterpriseDocumentationResult);
        }

        console.log('SERVICE: Ending createDocumentation method');
        return enterpriseDocumentations;
    }

    static async createEnterpriseFile(enterpriseId:number, fileId:number, s3MetadataId:number, expeditionDate:Date, explanation:string, status: EnterpriseDocumentationStatusEnum, effectivenessDate?:Date):Promise<EnterpriseDocumentation> {
        console.log('SERVICES: Starting createEnterpriseFile method');
        
        let enterprise:Enterprise = null;
        let enterpriseDocumentation:EnterpriseDocumentation = null;
        let s3Metadata:S3Metadata = null;

        enterprise =
            await EnterpriseDAO.getEnterpriseById(enterpriseId);

        if(!enterprise)
            throw new ConflictException('SCF.LIBERA.19', {enterpriseId});

        enterpriseDocumentation = 
            await EnterpriseDocumentationDAO.getEnterpriseDocumentationByIdAndEnterpriseId(enterpriseId,fileId);

        if(!enterpriseDocumentation)
            throw new ConflictException('SCF.LIBERA.21', {eDocumentationId:fileId});
            
        s3Metadata = await S3MetadataDAO.getS3MetadataById(s3MetadataId);
            
        if(!s3Metadata) throw new ConflictException('SCF.LIBERA.20', {s3MetadataId});

        const colombiaCurrentTime = moment().tz('America/Bogota').toDate();

        enterpriseDocumentation.s3Metadata = s3Metadata;        
        // enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.LOADED;
        enterpriseDocumentation.expeditionDate = expeditionDate;
        enterpriseDocumentation.comment = explanation;
        enterpriseDocumentation.effectivenessDate = effectivenessDate;
        enterpriseDocumentation.status = status;
        enterpriseDocumentation.modificationDate = colombiaCurrentTime;
        

        await EnterpriseDocumentationDAO.saveEnterpriseDocumentation(enterpriseDocumentation);
    
        console.log('SERVICES: Finished createEnterpriseFile method');
        return enterpriseDocumentation;

    }   

    static async documentationCount(enterprises: any[]) {
        console.log('SERVICE: Starting documentationCount');
        for(const enterprise of enterprises) {
            const accepted = await EnterpriseDocumentationDAO
                .getEnterpriseDocumentationCountByEnterpriseId(enterprise.id);
            const total = await EnterpriseDocumentationDAO
                .getTotalDocumentationCount(enterprise.id);
            

            const docCount = `${accepted}/${total}`;

            enterprise.documentationCount = docCount;
        }
        console.log('SERVICE: Ending documentationCount');
        return enterprises;
    }

    static async updateDocumentStatus() {
        console.log('SERVICE: Starting updateDocumentStatus');
        let rightNow = moment(moment.now(), 'x');
        let _16DaysAhead = rightNow.add(16, 'days');
        let enterpriseDocumentation: EnterpriseDocumentation = null;
        const colectionDB: EnterpriseDocumentation[] = await EnterpriseDocumentationDAO.getDocumentsAboutToExpire(_16DaysAhead.toDate());
        
        const aboutToExpire = colectionDB.filter((obj) => {
            let end = moment(obj.effectivenessDate).format('YYYY-MM-DD');
            
            if(LiberaUtils.getNumberOfDays(moment(moment.now(), 'x').format('YYYY-MM-DD'), end) > 0 && LiberaUtils.getNumberOfDays(moment(moment.now(), 'x').format('YYYY-MM-DD'), end) <= 15){
                return obj;
            }
        });
        
        const expired = colectionDB.filter((obj) => {
            let end = moment(obj.effectivenessDate).format('YYYY-MM-DD');
            
            if(LiberaUtils.getNumberOfDays(moment(moment.now(), 'x').format('YYYY-MM-DD'), end) < 1){
                return obj;
            }
        });
    
        // FUNTIONALITY TO CHANGE STATUS TO EXPIRED
        if (expired.length > 0){
            for(let i = 0 ; i < expired.length ; i++){
                
                enterpriseDocumentation = 
                await EnterpriseDocumentationDAO.getEnterpriseDocumentationById(expired[i].id)
                enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.EXPIRED
                
                await EnterpriseDocumentationDAO.saveEnterpriseDocumentation(enterpriseDocumentation);
            }
        } else {
            console.log("---> There aren't documents expired");
        }
        
        // FUNTIONALITY TO CHANGE STATUS TO ABOUT TO EXPIRE
        if (aboutToExpire.length > 0){
            for(let i = 0 ; i < aboutToExpire.length ; i++){
                
                enterpriseDocumentation = 
                await EnterpriseDocumentationDAO.getEnterpriseDocumentationById(aboutToExpire[i].id)
                enterpriseDocumentation.status = EnterpriseDocumentationStatusEnum.ABOUT_TO_EXPIRE
                
                await EnterpriseDocumentationDAO.saveEnterpriseDocumentation(enterpriseDocumentation);
            }
        } else {
            console.log(" ---> There aren't documents about to expire");
        }
        
        console.log('SERVICE: Ending updateDocumentStatus');
        return colectionDB;
        
    }
    
    static async sendEmailofAboutToExpireDocuments() {
        console.log('SERVICE: Starting sendEmailofAboutToExpireDocuments');
        
        let rightNow = moment(moment.now(), 'x');
        let _16DaysAhead = rightNow.add(16, 'days');
        let enterpriseDocumentation: EnterpriseDocumentation = null;
        const colectionDB: EnterpriseDocumentation[] = await EnterpriseDocumentationDAO.getDocumentsAboutToExpire(_16DaysAhead.toDate());

        const aboutToExpire = colectionDB.filter((obj) => {
            let end = moment(obj.effectivenessDate).format('YYYY-MM-DD');
            
            if(LiberaUtils.getNumberOfDays(moment(moment.now(), 'x').format('YYYY-MM-DD'), end) > 0 && LiberaUtils.getNumberOfDays(moment(moment.now(), 'x').format('YYYY-MM-DD'), end) <= 15){
                return obj;
            }
        });
        
        //ARR USERS
        let arrEnterpriseId: number[] = []
        for(let i = 0 ; i < aboutToExpire.length ; i++){
            arrEnterpriseId.push(+aboutToExpire[i].enterprise.id)
        }
        //ARR ENTERPRISES ID NON DUPLICATED
        const enteprisesIdNotRepeated = Array.from(new Set(arrEnterpriseId));
        console.log(`---> Enterprise id's not repeated: `, enteprisesIdNotRepeated);
        
        for(let i = 0 ; i < enteprisesIdNotRepeated.length ; i++){
            let arrBeforeEmail = aboutToExpire.filter((obj)=>{
                if(enteprisesIdNotRepeated[i] === +obj.enterprise.id){
                    return obj;
                }
            });
            
            let arrForEmail = arrBeforeEmail.map((x) => {
                let todayDate = moment().startOf('day');
                return {
                    nameDocument:  LiberaUtils.checkOtherDocuments(x.documentType.description) ? x.documentTypeDescription : x.documentType.description,
                    daysLeft: LiberaUtils.getNumberOfDays(todayDate, x.effectivenessDate),
                    effectivenessDate: moment(x.effectivenessDate).format('YYYY-MM-DD')
                };
            });
            
            console.log('===> array per enterprise id to send Email: ', arrForEmail);
            
            console.log('===> EMAIL direction: ', arrBeforeEmail[0].enterprise.owner.email);
            
            await SESService.sendTemplatedEmail({
                template: SES_ABOUT_TO_EXPIRE_DOCUMENT_NOTICE,
                destinationEmail: arrBeforeEmail[0].enterprise.owner.email, 
                mergeVariables: {
                    documents: arrForEmail,
                }
            });
        }
        
        console.log('SERVICE: Ending sendEmailofAboutToExpireDocuments');
    }

    static async getDocumentStatusAndEffectivenessDateCalculation(enterpriseId: number, documentationId: number, expeditionDate: Date) {
        console.log('SERVICE: Starting getDocumentStatusAndEffectivenessDateCalculation');
        let effectivenessDateToService: Moment = null;

        //Flow if is consulting from LIBERA_ADMIN
        const enterpriseDocumentation = await EnterpriseDocumentationDAO.getEnterpriseDocumentation(+enterpriseId, +documentationId);
        let today = moment().format('YYYY-MM-DD');
        let documentType: string = enterpriseDocumentation.documentType.code;
        let status: EnterpriseDocumentationStatusEnum;
        const colombiaCurrentTime = moment().tz('America/Bogota');
        const limitTime = moment('10:00 am', "HH:mm a");

        const catDocumentType = await CatDocumentTypeDAO.getDocumentTypeByCode(documentType);
        let effectivenessCatDocument: number = catDocumentType.effectiveness;
        
        if(enterpriseDocumentation.effectiveness !== null){
            console.log(">> ENTERPRISE DOCUMENTAION has effectiveness months: ", enterpriseDocumentation.effectiveness);
            
            //Calculation of effectiveness date and days left
            effectivenessDateToService  = LiberaUtils.effectivenessDateGenerator(expeditionDate, enterpriseDocumentation.effectiveness);                
            let subtractDateResult = effectivenessDateToService.diff(today, 'days');
            
            //Set new status to service
            switch(true){
                case (subtractDateResult < 1):
                    status = EnterpriseDocumentationStatusEnum.EXPIRED;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult == 1 && colombiaCurrentTime.isAfter(limitTime)):
                    status = EnterpriseDocumentationStatusEnum.EXPIRED;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult >= 1 && subtractDateResult <= 15):
                    status = EnterpriseDocumentationStatusEnum.ABOUT_TO_EXPIRE;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult > 15):
                    status = EnterpriseDocumentationStatusEnum.CURRENT;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
            }
            
        } else if(documentType !== CatDocumentTypeEnum.OTHER_DOCUMENTS && documentType !== CatDocumentTypeEnum.ENTAILMENT_FORM){ 
            console.log(">> ENTERPRISE DOCUMENTAION dons't have effectiveness but CAT_DOCUMENT_TYPE has it: ", effectivenessCatDocument);
            
            //Calculation of effectiveness date and days left
            effectivenessDateToService = LiberaUtils.effectivenessDateGenerator(expeditionDate, effectivenessCatDocument);
            
            let subtractDateResult = effectivenessDateToService?.diff(today, 'days');
            
            //Set new status to service
            switch(true){
                case (subtractDateResult < 1):
                    status = EnterpriseDocumentationStatusEnum.EXPIRED;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult == 1 && colombiaCurrentTime.isAfter(limitTime)):
                    status = EnterpriseDocumentationStatusEnum.EXPIRED;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult >= 1 && subtractDateResult <= 15):
                    status = EnterpriseDocumentationStatusEnum.ABOUT_TO_EXPIRE;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
                case (subtractDateResult > 15):
                    status = EnterpriseDocumentationStatusEnum.CURRENT;
                    console.log(`effectiveness date ==> ${subtractDateResult}, status ==> ${status}`);
                break;
            }
            
        } else {
            console.log(">> ENTERPRISE DOCUMENTAION and CAT_DOCUMENT_TYPE dons't have effectiveness: ", effectivenessCatDocument);
            effectivenessDateToService = null
            status = EnterpriseDocumentationStatusEnum.CURRENT;                
        }
        
        let dateToService: Date;
        if(effectivenessDateToService !== null){
            dateToService = effectivenessDateToService.toDate();
            console.log('===> dateToServiceDate', dateToService);
        } else {
            dateToService = null
        }


        console.log('SERVICE: Ending getDocumentStatusAndEffectivenessDateCalculation');
        return {
            statusFromService: status,
            dateToService: dateToService  
        };
    }

    static async getDocumentStatusByEnterpriseStatus(enterpriseId: number, documentationId: number, expeditionDate: Date) {
        console.log('SERVICE: Starting getDocumentStatusByEnterpriseStatus');
        let enterprise: Enterprise = await EnterpriseDAO.getEnterpriseById(enterpriseId);
        let statusFromService: EnterpriseDocumentationStatusEnum;

        if(enterprise.status == EnterpriseStatusEnum.INCOMPLETE_ACCOUNT){
            console.log('ENTERPRISE in INCOMPLETE ACCOUNT STATUS');
            statusFromService = EnterpriseDocumentationStatusEnum.LOADED;
        }  else {
            statusFromService = EnterpriseDocumentationStatusEnum.EVALUATION_PENDING;
        }

        let effectivenessDateToService: Moment = null;
        const enterpriseDocumentation = await EnterpriseDocumentationDAO.getEnterpriseDocumentation(+enterpriseId, +documentationId);
        let documentType: string = enterpriseDocumentation.documentType.code;
        const catDocumentType = await CatDocumentTypeDAO.getDocumentTypeByCode(documentType);
        let effectivenessCatDocument: number = catDocumentType.effectiveness;
        
        if(enterpriseDocumentation.effectiveness !== null){
            console.log(`--> ENTERPRISE DOCUMENTAION has effectiveness months: ${enterpriseDocumentation.effectiveness}`);
            //Calculation of effectiveness date and days left
            effectivenessDateToService  = LiberaUtils.effectivenessDateGenerator(expeditionDate, enterpriseDocumentation.effectiveness);                
            
        } else if(documentType !== CatDocumentTypeEnum.OTHER_DOCUMENTS){ 
            console.log(`--> ENTERPRISE DOCUMENTAION dons't have effectiveness but CAT_DOCUMENT_TYPE has it: ${effectivenessCatDocument}`);
            //Calculation of effectiveness date and days left
            effectivenessDateToService = LiberaUtils.effectivenessDateGenerator(expeditionDate, effectivenessCatDocument);
            
        } else {
            console.log(`--> ENTERPRISE DOCUMENTAION and CAT_DOCUMENT_TYPE dons't have effectiveness: ${effectivenessCatDocument}`);
            effectivenessDateToService = null              
        }

        let dateToService: Date;
        effectivenessDateToService !== null ? dateToService = effectivenessDateToService.toDate() : dateToService = null;
        console.log(`--> dateToServiceDate: ${dateToService}`);
        
        console.log('SERVICE: Ending getDocumentStatusByEnterpriseStatus');
        return {
            statusFromService: statusFromService,
            dateToService: dateToService  
        };
    }
}