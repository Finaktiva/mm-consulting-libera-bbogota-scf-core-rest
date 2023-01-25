import { Context, Callback, CognitoUserPoolTriggerHandler, CognitoUserPoolTriggerEvent} from 'aws-lambda';
import { TemplateService } from 'services/template.service';
import { UserTypeEnum } from 'commons/enums/user-type.enum';
const host : string = process.env.HOST;
const resetPasswordPath : string = process.env.RESET_PASSWORD_PATH;

export const handler: CognitoUserPoolTriggerHandler = async (event: CognitoUserPoolTriggerEvent, _context: Context, cb: Callback) => {
    console.log(`HANDLER: Starting ${_context.functionName}`);
    _context.callbackWaitsForEmptyEventLoop = false;
    console.log(`triggerSource  ${event.triggerSource}`);
    const code = event.request.codeParameter;
    try {
        if(event.triggerSource === 'CustomMessage_ForgotPassword'){
            const email =  event.request.userAttributes['email'] || event.userName;
            event.response.smsMessage = `${host}${resetPasswordPath}?code=${code}`;
            event.response.emailSubject = 'Cambiar contraseña';
            event.response.emailMessage = `<a href="${host}${resetPasswordPath}?code=${code}&email=${email}">Da clic aqu&iacute; para cambiar tu contrase&ntilde;a </a> 
            <br> usa el siguiente código para confirmar la operaci&oacute;n: ${code} `;
        }
        if(event.triggerSource === 'CustomMessage_SignUp' || event.triggerSource === 'CustomMessage_ResendCode') {
            event.response.smsMessage = `Su código de confirmación es ${code}`;
            event.response.emailSubject = 'Confirmación de cuenta';
            event.response.emailMessage = `Su código de confirmación es ${code}`;
        }
        if(event.triggerSource === 'CustomMessage_AdminCreateUser'){
            console.log('Starting trigger customMessage_AdminCreateUser');
            const userType = event.request.userAttributes['custom:userType'];
            const url = host;
            const mergeVariable = {
                url,
                userType
            }
            const message:string = await TemplateService.getTemplateResendInvitation(mergeVariable);
            console.log('mesaje cognito: ', message);
            event.response.emailSubject = 'Bienvenido a la plataforma Factoring Banco de Occidente';
            event.response.emailMessage = message;
            event.response.smsMessage = message;
        }
        console.log(`HANDLER: Ending ${_context.functionName}`);
        return cb(null, event);
    } catch (errors) {
        console.log('HANDLER ERRORS: ', errors);
        return cb(new Error(JSON.stringify(errors)), null);
    }
};