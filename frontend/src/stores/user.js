import { ref } from 'vue'
import { defineStore } from 'pinia'
import { encryptData } from '../helpers/encryptUtil'
import Constants from "@/globals";

export const useUserStore = defineStore('user', () => {
    const user = ref(null);

    const login = async (params) => {
        // TESTING 1
        let data = new URLSearchParams(params);
        let result = await axios.get(`/getLoginTest?${data}`);

        // TESTING 2
        // let result = await axios.get(`/get_system_login?system_id=${Constants.SYSTEM_ID}&username=${params.username}&password=${params.password}`,{
        //     baseURL: 'http://172.16.1.39:3010/api',
        //     withCredentials: false
        // });

        //OFFICIAL Code
        // let body = {
        //     system_id: Constants.SYSTEM_ID,
        //     username: params.username,
        //     password: params.password
        // };
        // let params1 = new URLSearchParams(body);
        // let { data } = await axios.get(`/login?${params1}`);
        // let result = data;
        
        if(Object.keys(result.data).length !== 0){
            let data_session = {
                data: result.data[0]
            };

            await axios.post("/createSession", data_session);

            let result_accRights = await getAccessRights(result.data[0].access_right);

            if(result_accRights.length != 0){
                let data = {
                    access_right: result.data[0].access_right,
                    acc_name: result_accRights[0].acc_name,
                    dept_id: result.data[0].dept_id,
                    dept_name: result.data[0].dept_name,
                    dept_section: result.data[0].dept_section,
                    ext_name: result.data[0].ext_name,
                    fname: result.data[0].fname,
                    id: result.data[0].id,
                    lname: result.data[0].lname,
                    mname: result.data[0].mname
                }

                user.value = encryptData(data, Constants.USER_SECRET_KEY);
            } else {
                let commonUserAccRights = await getAccessRights(Constants.ROLE_COMMON_USER);
                let data = {
                    access_right: Constants.ROLE_COMMON_USER,
                    acc_name: commonUserAccRights[0].acc_name,
                    dept_id: result.data[0].dept_id,
                    dept_name: result.data[0].dept_name,
                    dept_section: result.data[0].dept_section,
                    ext_name: result.data[0].ext_name,
                    fname: result.data[0].fname,
                    id: result.data[0].id,
                    lname: result.data[0].lname,
                    mname: result.data[0].mname
                }

                user.value = encryptData(data, Constants.USER_SECRET_KEY);
            }
           
        }
    }

    const getAccessRights = async (acc_id) => {
        var data = {
            acc_id: acc_id
        };

        const params = new URLSearchParams(data);

        let result = await axios.get(`/getAccessRights?${params}`);

        return result.data.data;
    }; 

    const logout = async () => {
        await axios.get('/logout');
        user.value = null;
        localStorage.removeItem("user");
        localStorage.clear();
    };

    return {
        user,
        login,
        logout
    };
}, {
    persist: true
})