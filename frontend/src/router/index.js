import { createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useUtilStore } from '../stores/util';
import { decryptData } from '../helpers/encryptUtil'
import Constants from "@/globals";
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import ComputerList from '../views/ComputerList.vue'
import HardwareList from '../views/HardwareList.vue'
import SoftwareList from '../views/SoftwareList.vue'
import BrandList from '../views/BrandList.vue'
import LocationList from '../views/LocationList.vue'
import UserDeviceList from '../views/UserDeviceList.vue'
import Settings from '../views/Settings.vue'
import Reports from '../views/Reports.vue'
import PmsCreate from '../views/PmsCreate.vue'
import PmsSummary from '../views/PmsSummary.vue'
import WorkstationEdit from '../views/WorkstationEdit.vue'
import WorkstationDetails from '../views/WorkstationDetails.vue'
import WorkstationList from '../views/WorkstationList.vue'
import WorkstationOthersList from '../views/WorkstationOthersList.vue'
import CheckList from '../views/CheckList.vue'
import NotFound from '../views/NotFound.vue'
import axios from 'axios';

const authUserRoleGuard = (to, from, next) => {
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const userData = decryptData(user.value, Constants.USER_SECRET_KEY);
  const allowedRoles = to.meta.allowedRoles;

  if (allowedRoles && allowedRoles.includes(Number(userData.access_right))) {
    next();
  } else {
    next('/unauthorized'); //Will eventually fall back to 404 page
  }
}

const authDataAccessToWorkstationEdit = async(to, from, next) => {
  var data = {
      wsq_id: to.params.id
  };

  const params = new URLSearchParams(data);
  var result = await axios.get(`/getQuarterlyWorkstationOnly?${params}`);

  if(result.data.data.length !== 0){
    let data = result.data.data[0];

    if(data.wsq_status != Constants.WSQ_STATUS_PENDING && data.wsq_status != Constants.WSQ_STATUS_DISAPPROVE){
      next(`/WorkstationDetails/${data.wsq_id}`);
      return;
    }
  }

  next();
}

const authUserAccessToWorkstationEdit = async(to, from, next) => {
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const userData = decryptData(user.value, Constants.USER_SECRET_KEY);
  var hasAccess = true;

  var data = {
      wsq_id: to.params.id
  };

  const params = new URLSearchParams(data);
  var result = await axios.get(`/getQuarterlyWorkstationAndWsOnly?${params}`);

  if(result.data.data.length !== 0){
    let data = result.data.data[0];

    if(data.ws_userId != Number(userData.id) && Number(userData.access_right) != Constants.ROLE_IT){
      hasAccess = false;   
    }
  }

  if(hasAccess == false){
    let params1 = {
      wsqRights_wsqId: to.params.id,
      wsqRights_userId: Number(userData.id),
      can_approve_request: 1
    }

    let result = await axios.get(`/getUserWorkstationRightsByWsqIdAndUserIdWithAccess`, {params: params1})

    if(result.data.data.length !== 0){
      hasAccess = true;
    }
  }

  if(hasAccess == false){
    next(`/WorkstationList`);
  }

  next();
}

const setPageLoaderToTrue = (to, from, next) => {
  const utilStore = useUtilStore();
  utilStore.setPageLoading({pIsPageLoading: true});

  next();
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/PmsCreate',
      name: 'PmsCreate',
      component: PmsCreate,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/PmsSummary/:id',
      name: 'PmsSummary',
      component: PmsSummary,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/WorkstationEdit/:id',
      name: 'WorkstationEdit',
      component: WorkstationEdit,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, authDataAccessToWorkstationEdit, setPageLoaderToTrue]
    },
    {
      path: '/WorkstationDetails/:id',
      name: 'WorkstationDetails',
      component: WorkstationDetails,
      meta: {
        allowedRoles: [Constants.ROLE_COMMON_USER, Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, authUserAccessToWorkstationEdit, setPageLoaderToTrue]
    },
    {
      path: '/WorkstationList',
      name: 'WorkstationList',
      component: WorkstationList,
      meta: {
        allowedRoles: [Constants.ROLE_COMMON_USER, Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/WorkstationOthersList',
      name: 'WorkstationOthersList',
      component: WorkstationOthersList,
      meta: {
        allowedRoles: [Constants.ROLE_COMMON_USER]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/ComputerList',
      name: 'ComputerList',
      component: ComputerList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/HardwareList',
      name: 'HardwareList',
      component: HardwareList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/SoftwareList',
      name: 'SoftwareList',
      component: SoftwareList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/BrandList',
      name: 'BrandList',
      component: BrandList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/LocationList',
      name: 'LocationList',
      component: LocationList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/UserDeviceList',
      name: 'UserDeviceList',
      component: UserDeviceList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/Settings',
      name: 'Settings',
      component: Settings,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/Reports',
      name: 'Reports',
      component: Reports,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: '/CheckList',
      name: 'CheckList',
      component: CheckList,
      meta: {
        allowedRoles: [Constants.ROLE_IT]
      },
      beforeEnter: [authUserRoleGuard, setPageLoaderToTrue]
    },
    {
      path: "/:catchAll(.*)*",
      name: "404",
      component: NotFound,
      beforeEnter: setPageLoaderToTrue
    }
    
  ]
})

export default router
