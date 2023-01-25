import _ from 'lodash'
import { S3Service } from './s3.service';
import { InternalServerException } from 'commons/exceptions';
import LiberaUtils from 'commons/libera.utils';
import { UserTypeEnum } from 'commons/enums/user-type.enum';

export class TemplateService {

  static async getTemplateResendInvitation(mergeVaribles: {url:string, userType: string}) {
    console.log('SERVICE: Starting interpolacion');

    if(mergeVaribles.userType && mergeVaribles.userType == UserTypeEnum.LIBERA_USER){
      console.log('creation Libera User');
      const object = await S3Service.getObjectFile({bucket:process.env.BUCKET, filekey:process.env.FILEKEY_CREATE_LIBERA_USER});
      const template = LiberaUtils.parseBufferToString(object.Body as Buffer);
      const compiled = _.template(template);
      
      if(!template || template === undefined) throw new InternalServerException('SCF.LIBERA.COMMONS.500');
      const templateResult = compiled(mergeVaribles);
      console.log(templateResult); 
      return templateResult;  
    }

    console.log('resend Invitation');
    const object = await S3Service.getObjectFile({bucket:process.env.BUCKET, filekey:process.env.FILEKEY_CREATE_USER});
    const template = LiberaUtils.parseBufferToString(object.Body as Buffer);
    const compiled = _.template(template);
    
    if(!template || template === undefined) throw new InternalServerException('SCF.LIBERA.COMMONS.500');
    const templateResult = compiled(mergeVaribles);
    console.log(templateResult); 
    return templateResult;        
  }

}