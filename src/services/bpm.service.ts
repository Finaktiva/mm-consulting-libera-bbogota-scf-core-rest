import fetch from 'node-fetch';
import { IProcessInstance, ISpecificProcessInstance } from 'commons/interfaces/process-instance.interface';
import { HttpStatus } from 'commons/http.status';
const BPM_HOST = process.env.BPM_HOST;
const BPM_PROCESS_INSTANCES = process.env.BPM_PROCESS_INSTANCES;
const BPM_SPECIFIC_PROCESS_INSTANCE = process.env.BPM_SPECIFIC_PROCESS_INSTANCE;

export class BPMService {

    static async runProcessInstance(processInstance: IProcessInstance) {
        console.log('SERVICE: Starting runProcessInstance method');

        const result = await fetch(`${BPM_HOST}/${BPM_PROCESS_INSTANCES}`, {
                method: 'POST',
                body: JSON.stringify(processInstance),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json());
        
        console.log('result', result);
        if(!result.id) {
          console.log('exception ' + result.exception);
          throw new Error(result.exception);
        }
        
        console.log('SERVICE: Ending runProcessInstance method');
        return result;
    }

    static async runSpecificProcessInstance(specificProcessInstance : ISpecificProcessInstance) {
        console.log('SERVICE: Starting runSpecificProcessInstance method');
        const { processInstanceId, event_id} = specificProcessInstance;

        const URI = BPM_SPECIFIC_PROCESS_INSTANCE
            .replace('{processInstanceId}', processInstanceId.toString())
            .replace('{eventId}', event_id.toString());
            console.log(`URI: ${URI}`);
        if(specificProcessInstance.reply){
        console.log(`${BPM_HOST}/${URI}`);
        console.log(specificProcessInstance.reply);
        const result = await fetch(`${BPM_HOST}/${URI}`, {
            method: 'POST',
            body: JSON.stringify(specificProcessInstance.reply),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        
        .then(res => res.json());

        console.log(result);
        if(!result.statusCode || result.statusCode != HttpStatus.OK)
            throw new Error(`BPM Failed statusCode ${result.message} ${result.exception}`);
    
        console.log('SERVICE: Ending runSpecificProcessInstance method');
        return result;
        }

        if(!specificProcessInstance.reply){
            console.log(`${BPM_HOST}/${URI}`);
            console.log('<<<<<<<<<<<<<<<<<<<<<',specificProcessInstance.reply);
            const result = await fetch(`${BPM_HOST}/${URI}`, {
                method: 'POST',
                body: 'true',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json());
            
            console.log(result);
            if(!result.statusCode || result.statusCode != HttpStatus.OK)
                throw new Error(`BPM Failed statusCode ${result.message}`);
        
            console.log('SERVICE: Ending runSpecificProcessInstance method');
            return result;
            }

    }

}