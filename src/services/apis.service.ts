import fetch from 'node-fetch';
import ApisParser from "commons/parsers/apis.parser";
import { ConflictException, NotFoundException } from 'commons/exceptions';
import moment from 'moment';

const API_BOCC_HOST = process.env.API_BOCC_HOST;
const API_BOCC_USERNAME = process.env.API_BOCC_USERNAME;
const API_BOCC_PASSWORD = process.env.API_BOCC_PASSWORD;

export class ApisService {

  static async getDailyRates(type?: string) {
    console.log('SERVICE: Starting getDailyRates');
    // const token = await ApisService.dailyRatesGenerateToken();
    // console.log('token ==> ', token);

    let lastValitydDay = moment().utc().subtract(1, 'days');

    if(lastValitydDay.weekday() === 0) lastValitydDay.subtract(2, 'days');

    if(lastValitydDay.weekday() === 6) lastValitydDay.subtract(1, 'days');

    let dailyRates = null;

    try {
      console.log('Starting connection with API RATES');

      dailyRates = await this.fetchDailyRates(lastValitydDay);
     
      console.log('dailyRates first fetch ==> ', dailyRates)

      if(!dailyRates.data.some( dailyRate => dailyRate.TypeRate.includes('IBR')) || !dailyRates.data.some( dailyRate => dailyRate.TypeRate.includes('DTF'))){
        lastValitydDay = lastValitydDay.subtract(1, 'days');
        dailyRates = await this.fetchDailyRates(lastValitydDay);
        console.log('dailyRates second fetch ==> ', dailyRates)
      }

      if(!dailyRates.data.some( dailyRate => dailyRate.TypeRate.includes('IBR')) || !dailyRates.data.some( dailyRate => dailyRate.TypeRate.includes('DTF')))
        throw new NotFoundException('SCF.LIBERA.402');
        
      if(dailyRates.header && dailyRates.header.code === 500)
        throw new ConflictException('SCF.LIBERA.341');

    } catch (errors) {
      console.error('API CONNECTION EXCEPTION DETECTED!: ', errors);
      throw new ConflictException('SCF.LIBERA.341');
    }

    const parsedDailyRates = ApisParser.parseDailyRates(dailyRates, type)
    console.log('SERVICE: Ending getDailyRates');
    return parsedDailyRates
  }

  static async fetchDailyRates(lastValidityDay: moment.Moment){
      return  await fetch(`${API_BOCC_HOST}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          "ProcessDate": lastValidityDay.format('YYYY-MM-DD'),
        })
      }).then(res => res.json());
  }

  static async dailyRatesGenerateToken() {
    console.log('SERVICE: Starting dailyRatesGenerateToken');

    let token = null;
    try {
      console.log('Starting login with API RATES');
      token = await fetch(`${API_BOCC_HOST}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: API_BOCC_USERNAME,
          password: API_BOCC_PASSWORD
        })
      }).then(res => res.json());
      console.log('Token ==> ', token);
    } catch (errors) {
      console.error('API LOGIN EXCEPTION DETECTED!: ', errors);
      throw new ConflictException('SCF.LIBERA.341');
    }

    console.log('SERVICE: Ending dailyRatesGenerateToken');
    return token;
  }

}