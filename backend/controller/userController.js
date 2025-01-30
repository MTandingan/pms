const model = require('../model/response');
const json = require('../test/testAccounts.json');
const jsonDept = require('../test/testDepartments.json');
const jsonEmployees = require('../test/testAllEmployee.json');
const Constants = require('../helper/constants');
const userService = require('../service/userService');

//Login
module.exports.login = async (req, res, next) => {
    try{
        var body = {
            system_id: req.query.system_id,
            username: req.query.username,
            password: req.query.password
        };

        var result = await userService.login(body);

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully get the user's account info by username and password with system Id";
        model.response.data = result;
    } catch(err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//Logout
module.exports.logout = async (req, res, next) => {
    try{
        res.clearCookie("token");
        req.session.destroy();

        model.response.status = Constants.STATUS_CODE_SUCCESS;
        model.response.message = "Successfully log the user out";
        model.response.data = {};
    } catch(err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//Create session for the backend
module.exports.createSession = async (req, res, next) => {
    try{
        req.session.user = req.body.data;

        if(req.session.user != null && typeof req.session.user != "undefined"){
            model.response.status = Constants.STATUS_CODE_SUCCESS;
            model.response.message = "Successfully stored the session in the server";
            model.response.data = {};
        } else {
            model.response.status = Constants.STATUS_CODE_ERROR;
            model.response.message = "There is something wrong in storing the session in the server. If it persists, please call the IT department";
            model.response.data = {};
        }
    } catch (err) {
        model.response.status = Constants.STATUS_CODE_ERROR;
        model.response.message = err.message;
        model.response.data = {};
    }

    res.send(model.response);
};

//Testing and Development Purposes
module.exports.getLoginTest = async (req, res, next) => {
    try{
        var data = {
            username: req.query.username,
            password: req.query.password
        }

        var result = json.accounts; 
        var result_account = [];

        for(var i = 0; i < result.length; i++) {
            if(result[i]["user"] == data.username && result[i]["password"] == data.password){
                result_account.push(result[i]);
                break;
            } 
        };

        model.response.data = result_account;
    } catch(err) {
        console.log("Error in processing JSON account testing - " + err.message);
    }

    res.send(result_account);      
}

module.exports.getAllDepartmentsTest = async (req, res, next) => {
    try{
        var result = jsonDept.departments; 
        model.response.data = result;
    } catch(err) {
        console.log("Error in processing JSON department testing - " + err.message);
    }

    res.send(result);    
}

module.exports.getAllEmployeesTest = async (req, res, next) => {
    try{
        var result = jsonEmployees.employees; 
        model.response.data = result;
    } catch(err) {
        console.log("Error in processing JSON employees testing - " + err.message);
    }

    res.send(result);    
}
