import Constants from "@/globals";
import moment from 'moment/moment'

export function generateYearDropDown(){
    var arrYear = [];
    var date = new Date();
    var starting_year = Constants.YEAR_SYSTEM_CREATED + 1;
    var year = date.getFullYear();
    var year_difference = year - (Constants.YEAR_SYSTEM_CREATED - 1);

    for (var i = 0; i < year_difference; i++) {
        arrYear.push({
            id: Number(starting_year),
            name: starting_year
        });

        starting_year++;
    }

    return arrYear.reverse();
}

export function generateArrOfPresentMonths() { 
    var arrOfMonths = Constants.arrOfMonths;
    var date = new Date();
    var currentMonth = date.getMonth();
    var presentMonths = arrOfMonths.slice(0, currentMonth + 1);

    return presentMonths;
}

export function generateQuarterlyMonthsByQuarter(quarter) {
    switch(quarter){
        case 1:
        case 4:
        case 7:
        case 10:{
            return Constants.arrOfFullNameMonthsFirstQtr;
        }break;
        case 2:
        case 5:
        case 8:
        case 11:{
            return Constants.arrOfFullNameMonthsSecondQtr;
        }break;
        case 3:
        case 6:
        case 9:
        case 12:{
            return Constants.arrOfFullNameMonthsThirdQtr;
        }break;
        default: {
            return [];
        }
    }
}

export function generateOrderGroupMonthByMonthPosition(month) {
    switch(month){
        case 1:
        case 2:
        case 3:{
            return Constants.arrOfFullNameMonthsFirstOrderGroup;
        }break;
        case 4:
        case 5:
        case 6:{
            return Constants.arrOfFullNameMonthsSecondOrderGroup;
        }break;
        case 7:
        case 8:
        case 9:{
            return Constants.arrOfFullNameMonthsThirdOrderGroup;
        }break;
        case 10:
        case 11:
        case 12:{
            return Constants.arrOfFullNameMonthsFourthOrderGroup;
        }break;
        default: {
            return [];
        }
    }
}

export function checkLetterAndSpaceOnly(e) {
    let char = String.fromCharCode(e.keyCode);

    if(/^[A-Za-z ]+$/.test(char)) {
        return true;
    }

    e.preventDefault();
}

export function checkNumbersOnly(e) {
    let char = String.fromCharCode(e.keyCode);
    
    if(/^[0-9]+$/.test(char)) {
        return true;
    }

    e.preventDefault();
}

export function checkDecimalOnly(e) {
    let char = String.fromCharCode(e.keyCode);
    
    if(/^[0-9.]+$/.test(char)) {
        return true;
    }

    e.preventDefault();
}

export function calculateAge(dateOfBirth) {
    var age = moment().diff(new Date(dateOfBirth).toISOString(), 'years');

    return age;
}

export function calculateAgeByDate(birthdate, currentDate) {
    var birth = moment(birthdate);
    var current = moment(currentDate);
  
    var age = current.diff(birth, 'years');
  
    if (current.month() < birth.month() || (current.month() === birth.month() && current.date() < birth.date())) {
      age--;
    }
  
    return age;
  }

export function getMonthNameByMonthPosition(posMonth) {
    var month = Constants.arrOfMonths.find(item => item.id === posMonth);

    if(month !== null && month !== undefined){
        return month.name;
    }

    return Constants.N_A;
}

export function getFullMonthNameByMonthPosition(posMonth) {
    var month = Constants.arrOfFullNameMonths.find(item => item.id === posMonth);

    if(month !== null && month !== undefined){
        return month.name;
    }

    return Constants.N_A;
}

export function getQuarterTextByMonthPosition(posMonth) {
    switch(posMonth){
        case 1:
        case 4:
        case 7:
        case 10:{
            return "Month 1 (1st Quarter)";
        }break;
        case 2:
        case 5:
        case 8:
        case 11:{
            return "Month 2 (2nd Quarter)";
        }break;
        case 3:
        case 6:
        case 9:
        case 12:{
            return "Month 3 (3rd Quarter)";
        }break;
        default: {
            return Constants.N_A;
        }
    }
}

export function getEquipmentStatusTextByStatusId(status) {
    switch(status){
        case Constants.EQUIPMENT_STATUS_OK:{
            return Constants.EQUIPMENT_STATUS_OK_TEXT;
        }break;
        case Constants.EQUIPMENT_STATUS_DEFECTIVE:{
            return Constants.EQUIPMENT_STATUS_DEFECTIVE_TEXT;
        }break;
        case Constants.EQUIPMENT_STATUS_NA:{
            return Constants.EQUIPMENT_STATUS_NA_TEXT;
        }break;
        default: {
            return Constants.N_A;
        }
    }
}

export function getWsqStatusTextByStatusId(status) {
    switch(status){
        case Constants.WSQ_STATUS_PENDING:{
            return Constants.WSQ_STATUS_PENDING_TEXT;
        }break;
        case Constants.WSQ_STATUS_FOR_APPROVAL:{
            return Constants.WSQ_STATUS_FOR_APPROVAL_TEXT;
        }break;
        case Constants.WSQ_STATUS_COMPLETE:{
            return Constants.WSQ_STATUS_COMPLETE_TEXT;
        }break;
        case Constants.WSQ_STATUS_DISAPPROVE:{
            return Constants.WSQ_STATUS_DISAPPROVE_TEXT;
        }break;
        default: {
            return Constants.N_A;
        }
    }
}

export function getIpTypeTextByIpType(ipType) {
    switch(ipType){
        case Constants.IP_TYPE_STATIC:{
            return Constants.IP_TYPE_STATIC_TEXT;
        }break;
        case Constants.IP_TYPE_DYNAMIC:{
            return Constants.IP_TYPE_DYNAMIC_TEXT;
        }break;
        default: {
            return Constants.N_A;
        }
    }
}

export function getWsqResolutionTextByResolutionId(status) {
    switch(status){
        case Constants.WSQ_RESOLUTION_COMPLETE:{
            return Constants.WSQ_RESOLUTION_COMPLETE_TEXT;
        }break;
        case Constants.WSQ_RESOLUTION_CONDEMNED:{
            return Constants.WSQ_RESOLUTION_CONDEMNED_TEXT;
        }break;
        case Constants.WSQ_RESOLUTION_TRANSFERRED:{
            return Constants.WSQ_RESOLUTION_TRANSFERRED_TEXT;
        }break;
        case Constants.WSQ_RESOLUTION_DEFERRED:{
            return Constants.WSQ_RESOLUTION_DEFERRED_TEXT;
        }break;
        case Constants.WSQ_RESOLUTION_DROPPED:{
            return Constants.WSQ_RESOLUTION_DROPPED_TEXT;
        }break;
        default: {
            return Constants.N_A;
        }
    }
}

export function checkObjectIsNull(obj){
    if(obj === null){
        return true;
    }

    return false;
}

export function checkValidDecimalNumber(_value){
    if(typeof _value === "undefined"){
        return true;
    }

    var arrayOfDecimals = _value.toString().split('.');
    var arrayOfDecimalsLength = arrayOfDecimals.length;

    if(arrayOfDecimalsLength > 2){
        return false;
    } else {
        if(arrayOfDecimalsLength != 1){
            let numOfDecimals = arrayOfDecimals[1].length;

            if(numOfDecimals > 2){
                return false;
            }
        }
    }

    return true;
}

export function getCurrentDateAndTime(){
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

export function getPropertyByPosition(obj, position, isToSort) {
    const keys = Object.keys(obj);
    
    if(isToSort == true){
        keys.sort();
    }
    
    if (position >= 0 && position < keys.length) {
      const key = keys[position];
      return obj[key];
    }
    
    return undefined;
  }
