import axios from "axios";
		
window.axios = axios
axios.defaults.withCredentials = true
// axios.defaults.baseURL = "http://localhost:8081/api"
let backendUrl = "http://" + window.location.hostname.toString() + ":5006/api"
axios.defaults.baseURL = backendUrl