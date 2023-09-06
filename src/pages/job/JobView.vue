<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import SubHeaderAction from "../../components/header/SubHeaderAction.vue";
import Divider from "primevue/divider";
import Button from "primevue/button";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import { useToast } from "primevue/usetoast";
import jobController from "../../controllers/jobController";
import commonController from "../../controllers/commonController";
import { useRouter } from "vue-router";
/* eslint-disable */
export const JobView = /*#__PURE__*/ defineComponent({
  name: "JobView",
  components: {
    SubHeaderAction,
    Divider,
    Button,
    ProgressSpinner,
    Image,
    MenuSidebar,
  },
  setup() {
    const controllers = jobController();
    const controllers2 = commonController();
    const toast = useToast();
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const name = ref();
    const breakduration = ref();
    const budget = ref();
    const city = ref();
    const code = ref("");
    const colour = ref("");
    const country = ref();
    const custom = ref("");
    const start_date = ref();
    const end_date = ref();
    const note = ref();
    const notifymessage = ref();
    const percentagecomplete = ref();
    const starthour = ref();
    const starttime = ref();
    const state = ref();
    const street = ref();
    const workduration = ref();
    const postalCode = ref();
    const contacts = ref("");
    const contactGroups = ref("");
    const companies = ref("");
    const is_loading = ref(true);

    onMounted(async () => {
      if (token) {
        const data = JSON.parse(
          await controllers.getjobbyid(
            Number(router.currentRoute.value.params.id)
          )
        );
        name.value = data.name || null;
        breakduration.value = data.breakDuration || null;
        budget.value = data.budget || null;
        city.value = data.city || null;
        code.value = data.code || null;
        colour.value = data.colour || null;
        country.value = data.country || null;
        custom.value = data.custom || null;
        end_date.value = controllers2.formatDate(data.endDate) || null;
        note.value = data.notes || null;
        notifymessage.value = data.notifMessage || null;
        percentagecomplete.value = data.percentComplete || null;
        start_date.value = controllers2.formatDate(data.startDate) || null;
        starthour.value = data.startHour || null;
        starttime.value = data.startTime || null;
        state.value = data.state || null;
        street.value = data.street || null;
        workduration.value = data.workDuration || null;
        postalCode.value = data.zipCode || null;
        contacts.value =
          data.contacts.map((x: any) => x.name).join(", ") || null;
        companies.value =
          data.companies.map((x: any) => x.name).join(", ") || null;
        contactGroups.value =
          data.formGroups.map((x: any) => x.name).join(", ") || null;
        is_loading.value = false;
      } else {
        router.push({
          path: "/login",
        });
      }
    });

    function deleteJob(id: number) {
      if (confirm("Are you sure to delete this Job ?")) {
        controllers
          .deletejob(id)
          .then(() => {
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Job Successfully Deleted",
              life: 10000,
            });
            router.push({
              path: "/job",
            });
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    }

    return {
      deleteJob,
      is_loading,
      name,
      breakduration,
      budget,
      city,
      code,
      colour,
      country,
      custom,
      start_date,
      end_date,
      note,
      notifymessage,
      percentagecomplete,
      starthour,
      starttime,
      state,
      street,
      workduration,
      postalCode,
      contacts,
      contactGroups,
      companies,
    };
  },
});
export default JobView;
</script>

<template>
  <MenuSidebar panel="job" />

  <div class="dashboard-wrapper">
    <section>
      <div class="p-text-center" v-if="is_loading">
        <ProgressSpinner />
      </div>
      <div v-else>
        <SubHeaderAction>
          <template v-slot:actionsLeft>
            <div>{{ name }}</div>
            <div class="people-subtitle">Silverstrand</div>
          </template>
          <template v-slot:actionsRight>
            <router-link
              class="action"
              v-tooltip.top="'Edit'"
              :to="'/job/edit' + '/' + $route.params.id"
            >
              <font-awesome-icon
                class="action-icon"
                :class="'edit-icon'"
                :icon="['fa', 'pen']"
              />
            </router-link>
            <div
              class="action"
              v-tooltip.top="'Delete'"
              @click="deleteJob(Number($route.params.id))"
            >
              <font-awesome-icon
                class="action-icon"
                :class="'delete-icon'"
                :icon="['fa', 'trash']"
              />
            </div>
            <div class="action" v-tooltip.top="'View More'">
              <font-awesome-icon
                class="action-icon"
                :class="'more-icon'"
                :icon="['fa', 'ellipsis-v']"
              />
            </div>
          </template>
        </SubHeaderAction>
        <div class="people-view-container">
          <div class="p-grid">
            <div class="p-col-12">
              <div class="people-view-box">
                <h6 class="people-view-title">Details</h6>
                <div class="p-grid">
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Name</p>
                    <p class="people-view-field-data">{{ name }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Break Duration</p>
                    <p class="people-view-field-data">
                      {{ breakduration }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Budget</p>
                    <p class="people-view-field-data">{{ budget }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Group</p>
                    <p class="people-view-field-data">{{ contactGroups }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Contact</p>
                    <p class="people-view-field-data">{{ contacts }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Comapny</p>
                    <p class="people-view-field-data">{{ companies }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Code</p>
                    <p class="people-view-field-data">{{ code }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Colour</p>
                    <p class="people-view-field-data">
                      <span
                        class="color-box"
                        :style="{ backgroundColor: '#' + colour }"
                      ></span>
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Custom</p>
                    <p class="people-view-field-data">{{ custom }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Start Date</p>
                    <p class="people-view-field-data">
                      {{ start_date }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">End Date</p>
                    <p class="people-view-field-data">
                      {{ end_date }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Notify Message</p>
                    <p class="people-view-field-data">{{ notifymessage }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Percentage Complete</p>
                    <p class="people-view-field-data">
                      {{ percentagecomplete }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Start Hour</p>
                    <p class="people-view-field-data">{{ starthour }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Start Time</p>
                    <p class="people-view-field-data">{{ starttime }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Work Duration</p>
                    <p class="people-view-field-data">{{ workduration }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Note</p>
                    <p class="people-view-field-data">
                      {{ note }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div class="p-col-12">
              <div class="people-view-box">
                <h6 class="people-view-title">Address</h6>
                <div class="people-view-fields">
                  <p class="people-view-field-name">Street</p>
                  <p class="people-view-field-data">
                    {{ street }}
                  </p>
                </div>
                <div class="p-grid">
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">City</p>
                    <p class="people-view-field-data">{{ city }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">State</p>
                    <p class="people-view-field-data">{{ state }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Zipcode</p>
                    <p class="people-view-field-data">{{ postalCode }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Country</p>
                    <p class="people-view-field-data">{{ country }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.people-view-container {
  background: $white;
  border-radius: 15px;
  padding: 32px;
  .people-view-title {
    color: $blue;
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    margin-bottom: 26px;
    &.people-bank-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .lock-icon {
        color: $grey3;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
  .people-view-fields {
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 0;
    }
    .people-view-field-name {
      font-size: 12px;
      line-height: 16px;
      color: $grey6;
      margin-bottom: 5px;
    }
    .people-view-field-data {
      font-size: 14px;
      line-height: 20px;
      color: $grey3;
    }
    .copy-icon {
      color: $blue;
      margin-left: 10px;
      cursor: pointer;
    }
    .color-box {
      display: inline-block;
      width: 32px;
      height: 32px;
      border-radius: 3px;
    }
  }
  .p-divider {
    &.p-divider-horizontal {
      margin: 24px 0;
      &:before {
        border-color: $grey;
      }
    }
  }
  .people-view-form-box {
    .people-view-title {
      color: $grey3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .show-more-form {
        font-weight: 500;
        font-size: 12px;
        line-height: 100%;
        color: $blue;
        cursor: pointer;
      }
    }

    .people-view-form {
      flex-basis: 20%;
    }
    .outline-icon-btn {
      margin-right: 0 !important;
      padding: 12px 20px;
      justify-content: space-between;
      width: 100%;
      .form-icon {
        margin-right: 10px;
        color: $blue;
      }
      .form-count {
        font-size: 12px;
        line-height: 16px;
        color: $grey6;
      }
    }
  }
}
.actions-list {
  .people-subtitle {
    font-size: 12px;
    line-height: 16px;
    color: $blue;
  }
}
</style>
