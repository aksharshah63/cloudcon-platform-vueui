import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import userDataAccess from "../../cloudconLibrary/store/modules/userData/userDataAccess";
import date from "../../cloudconLibrary/utilities/useDateOperations";

import Risks from "../pages/risks/risks.vue";
import LicenseManagement from "../pages/licenseManagement/licenseManagement.vue";
import Equipment from "../pages/equipment/equipmentList.vue";
import EquipmentDetails from "../pages/equipment/equipmentDetails.vue";
import Forms from "../pages/forms/forms.vue";
import FormTemplates from "../pages/forms/formTemplates.vue";
import FormTemplateDashboard from "../pages/forms/formTemplateDashboard.vue";
import FormTemplateView from "../pages/forms/formTemplateView.vue";
import AddFormTemplate from "../pages/forms/addFormTemplate.vue";
import FormTemplateGroupDashboard from "../pages/forms/formTemplateGroupDashboard.vue";
import FormTemplateGroupView from "../pages/forms/formTemplateGroupView.vue";
import AddFormTemplateGroup from "../pages/forms/addFormTemplateGroup.vue";

import Utilization from "../pages/reporting/utilization/utilization.vue";
import HomeView from "../pages/HomeView.vue";
import Error from "../pages/Error.vue";
import TenantSelection from "../pages/auth/tenantSelection.vue";
import Login from "../pages/Login.vue";
import userController from "../controllers/userController";
import People from "../pages/people/People.vue";
import PeopleView from "../pages/people/PeopleView.vue";
import AddPeople from "../pages/people/AddPeople.vue";
import PeopleOption from "../pages/people/PeopleOption.vue";
import AddPeopleOption from "../pages/people/AddPeopleOption.vue";
import Plant from "../pages/plant/Plant.vue";
import PlantView from "../pages/plant/PlantView.vue";
import AddPlant from "../pages/plant/AddPlant.vue";
import PlantOption from "../pages/plant/PlantOption.vue";
import Job from "../pages/job/Job.vue";
import JobView from "../pages/job/JobView.vue";
import AddJob from "../pages/job/AddJob.vue";
import JobOption from "../pages/job/JobOption.vue";
import WorkOrder from "../pages/work_order/WorkOrder.vue";
import WorkOrderView from "../pages/work_order/WorkOrderView.vue";
import AddWorkOrder from "../pages/work_order/AddWorkOrder.vue";
import WorkOrderOption from "../pages/work_order/WorkOrderOption.vue";
import Company from "../pages/company/Company.vue";
import CompanyView from "../pages/company/CompanyView.vue";
import AddCompany from "../pages/company/AddCompany.vue";
import CompanyOption from "../pages/company/CompanyOption.vue";
import PeopleGroup from "../pages/peopleGroup/PeopleGroup.vue";
import AddPeopleGroup from "../pages/peopleGroup/AddPeopleGroup.vue";
import PeopleGroupView from "../pages/peopleGroup/PeopleGroupView.vue";
import PlantGroup from "../pages/plantGroup/PlantGroup.vue";
import AddPlantGroup from "../pages/plantGroup/AddPlantGroup.vue";
import PlantGroupView from "../pages/plantGroup/PlantGroupView.vue";

const controller = userController();

export const tenantSelectionRoute: RouteRecordRaw = {
  path: "/selectTenant",
  name: "Select Tenant",
  component: TenantSelection,
};

const formTemplateRoutes: RouteRecordRaw[] = [
  {
    path: "/formTemplates",
    name: "FormTemplates",
    component: FormTemplates,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        name: "FormTemplateDashboard",
        component: FormTemplateDashboard,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "view/:id",
        name: "FormTemplateView",
        component: FormTemplateView,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "edit/:id",
        name: "UpdateFormTemplate",
        component: AddFormTemplate,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "add",
        name: "AddFormTemplate",
        component: AddFormTemplate,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "groups",
        name: "FormTemplateGroupDashboard",
        component: FormTemplateGroupDashboard,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "groups/view/:id",
        name: "FormTemplateGroupView",
        component: FormTemplateGroupView,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "groups/add",
        name: "AddFormTemplateGroup",
        component: AddFormTemplateGroup,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "groups/edit/:id",
        name: "UpdateFormTemplateGroup",
        component: AddFormTemplateGroup,
        meta: {
          requiresAuth: true,
        },
      },
    ],
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    //redirect: "/risks",
    name: "Home",
    component: HomeView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/risks",
    name: "Risks",
    component: Risks,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/licenseManagement",
    name: "License Management",
    component: LicenseManagement,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/equipment",
    name: "Equipment",
    component: Equipment,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/equipment/cmmis",
    name: "CMMIS",
    component: Equipment,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/equipement/compliance",
    name: "Compliance",
    component: Equipment,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/equipment/forms",
    name: "Forms",
    component: Forms,
    meta: {
      baseModule: "Equipment",
      requiresAuth: true,
    },
  },
  {
    path: "/equipment/prestart",
    name: "Prestarts",
    component: Equipment,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/equipment/utilization",
    name: "Utilization",
    component: Utilization,
    meta: {
      baseModule: "Equipment",
      requiresAuth: true,
    },
  },
  {
    path: "/equipment/maintanance",
    name: "Maintanance",
    component: EquipmentDetails,
    meta: {
      baseModule: "Equipment",
      requiresAuth: true,
    },
  },

  {
    path: "/error",
    name: "Error",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Error,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/people",
    name: "People",
    component: People,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/people/view/:id",
    name: "PeopleView",
    component: PeopleView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/people/edit/:id",
    name: "PeopleEdit",
    component: AddPeople,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/people/add",
    name: "AddPeople",
    component: AddPeople,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleOption",
    name: "PeopleOption",
    component: PeopleOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleOption/edit",
    name: "PeopleOptionEdit",
    component: AddPeopleOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plant",
    name: "Plant",
    component: Plant,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plant/view/:id",
    name: "PlantView",
    component: PlantView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plant/edit/:id",
    name: "PlantEdit",
    component: AddPlant,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plant/add",
    name: "AddPlant",
    component: AddPlant,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plantOption",
    name: "PlantOption",
    component: PlantOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/job",
    name: "Job",
    component: Job,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/job/view/:id",
    name: "JobView",
    component: JobView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/job/edit/:id",
    name: "JobEdit",
    component: AddJob,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/job/add",
    name: "AddJob",
    component: AddJob,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/jobOption",
    name: "JobOption",
    component: JobOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workOrder",
    name: "WorkOrder",
    component: WorkOrder,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workOrder/view/:id",
    name: "WorkOrderView",
    component: WorkOrderView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workOrder/edit/:id",
    name: "WorkOrderEdit",
    component: AddWorkOrder,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workOrder/add",
    name: "AddWorkOrder",
    component: AddWorkOrder,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workOrderOption",
    name: "WorkOrderOption",
    component: WorkOrderOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/company",
    name: "Company",
    component: Company,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/company/view/:id",
    name: "CompanyView",
    component: CompanyView,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/company/edit/:id",
    name: "CompanyEdit",
    component: AddCompany,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/company/add",
    name: "AddCompany",
    component: AddCompany,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/companyOption",
    name: "CompanyOption",
    component: CompanyOption,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleGroup",
    name: "PeopleGroup",
    component: PeopleGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleGroup/add",
    name: "AddPeopleGroup",
    component: AddPeopleGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleGroup/edit/:id",
    name: "PeopleGroupEdit",
    component: AddPeopleGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/peopleGroup/view/:id",
    name: "PeopleGroupView",
    component: PeopleGroupView,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/plantGroup",
    name: "PlantGroup",
    component: PlantGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plantGroup/add",
    name: "AddPlantGroup",
    component: AddPlantGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plantGroup/edit/:id",
    name: "PlantGroupEdit",
    component: AddPlantGroup,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/plantGroup/view/:id",
    name: "PlantGroupView",
    component: PlantGroupView,
    meta: {
      requiresAuth: true,
    },
  },
  ...formTemplateRoutes,
  tenantSelectionRoute,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((x) => x.meta.requiresAuth);
  let routerAuthCheck = null;

  const userDetails = userDataAccess.getUserDetails();
  const userId = userDetails.user?.id;
  if (userId) {
    //Check to see if this is a refresh or not if it is a refresh we get new data
    const claims = userDataAccess.getUserClaims();
    if (!claims.length) await userDataAccess.fetchClaimsForUser(userId, 1);
  }

  if (userId)
    await syncClaims(userId, userDataAccess.getUserLastClaimsSyncDate());

  if (
    userDetails.access_token &&
    userDetails.id_token &&
    userDetails.expires_at
  ) {
    routerAuthCheck = new Date().getTime() < userDetails.expires_at;
  }

  if (requiresAuth) {
    if (routerAuthCheck) {
      next();
      return;
    } else if (routerAuthCheck == null) return next({ name: "Login" });
  }

  //This is for the offchance that we did find a user but they timed out
  //We have to request a new refresh token here
  if (routerAuthCheck !== null && !routerAuthCheck) {
    return await controller
      .silentLogin()
      .then(() => {
        return next();
      })
      .catch(() => {
        userDataAccess.customLogout();
        return next({ name: "Login" });
      });
  }

  next();
});

async function syncClaims(
  userId: number,
  lastClaimsSyncDate: number
): Promise<void> {
  if (
    date.getDurationBetweenDates(lastClaimsSyncDate, Date.now()) >
    Number(process.env.VUE_APP_USER_CLAIMS_SYNC_INTERVAL)
  )
    await userDataAccess.fetchClaimsForUser(userId, 1);
}

export default router;
