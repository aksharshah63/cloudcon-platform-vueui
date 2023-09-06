<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import InputText from "primevue/inputtext";
import Divider from "primevue/divider";
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import jobController from "../../controllers/jobController";
import peopleController from "../../controllers/peopleController";
import peopleGroupController from "../../controllers/peopleGroupController";
import companyController from "../../controllers/companyController";
import commonController from "../../controllers/commonController";
import MultiSelect from "primevue/multiselect";
import {
  IRequestJobCreate,
  IRequestJobUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import InputNumber from "primevue/inputnumber";
import ColorPicker from "primevue/colorpicker";
import Calendar from "primevue/calendar";

export const AddJob = /*#__PURE__*/ defineComponent({
  name: "AddJob",
  components: {
    MenuSidebar,
    InputText,
    Divider,
    Textarea,
    ProgressSpinner,
    Button,
    MultiSelect,
    InputNumber,
    ColorPicker,
    Calendar,
  },
  setup() {
    const controllers = jobController();
    const controllers2 = peopleController();
    const controllers3 = peopleGroupController();
    const controllers4 = companyController();
    const controllers5 = commonController();
    const name = ref();
    const breakduration = ref();
    const budget = ref();
    const city = ref();
    const code = ref("");
    const colour = ref("6466f1");
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
    const toast = useToast();
    const is_loading = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const user_email = String(useCookies.get(cookieKeys.EMAIL_ADDRESS));
    const ownerid = ref();
    const selectcontact = ref();
    const contactSelect: any = ref([]);
    const selectcompany = ref();
    const companySelect: any = ref([]);
    const selectGroup = ref();
    const GroupSelect: any = ref([]);

    function add() {
      let is_error = false;
      if (name.value == "" || name.value == null) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: "Name is Required",
          life: 10000,
        });
        if (is_error == false) {
          is_error = true;
        }
      }
      if (is_error == false) {
        if (token) {
          if (!router.currentRoute.value.params.id) {
            loading.value = true;
            const _requetdata: IRequestJobCreate = {
              name: name.value || null,
              breakDuration: breakduration.value || null,
              budget: budget.value || null,
              city: city.value || null,
              code: code.value || null,
              colour: colour.value || null,
              country: country.value || null,
              custom: null,
              endDate: new Date(end_date.value).getTime() || null,
              notes: note.value || null,
              notifMessage: notifymessage.value || null,
              percentComplete: percentagecomplete.value || null,
              startDate: new Date(start_date.value).getTime() || null,
              startHour: starthour.value || null,
              startTime: starttime.value || null,
              state: state.value || null,
              street: street.value || null,
              workDuration: workduration.value || null,
              zipCode: postalCode.value || null,
              contactIds: selectcontact.value
                ? selectcontact.value.map((x: any) => x.id)
                : null,
              companyIds: selectcompany.value
                ? selectcompany.value.map((x: any) => x.id)
                : null,
              // formGroupIds: selectGroup.value
              //   ? selectGroup.value.map((x: any) => x.id)
              //   : null,
              ownerIds: ownerid.value,
            };
            controllers
              .addjob(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Job Add Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/job",
                });
              })
              .catch((error: any) => {
                toast.add({
                  severity: "error",
                  summary: "Error Message",
                  detail: error.message,
                  life: 10000,
                });
                loading.value = false;
              });
          } else {
            loading.value = true;
            const _requetdata: IRequestJobUpdate = {
              id: Number(router.currentRoute.value.params.id),
              name: name.value || null,
              breakDuration: breakduration.value || null,
              budget: budget.value || null,
              city: city.value || null,
              code: code.value || null,
              colour: colour.value || null,
              country: country.value || null,
              custom: null,
              endDate: new Date(end_date.value).getTime() || null,
              notes: note.value || null,
              notifMessage: notifymessage.value || null,
              percentComplete: percentagecomplete.value || null,
              startDate: new Date(start_date.value).getTime() || null,
              startHour: starthour.value || null,
              startTime: starttime.value || null,
              state: state.value || null,
              street: street.value || null,
              workDuration: workduration.value || null,
              zipCode: postalCode.value || null,
              contactIds: selectcontact.value.map((x: any) => x.id) || null,
              companyIds: selectcompany.value
                ? selectcompany.value.map((x: any) => x.id)
                : null,
              // formGroupIds: selectGroup.value.map((x: any) => x.id) || null,
              ownerIds: ownerid.value,
            };
            controllers
              .updatejob(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Job Update Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/job",
                });
              })
              .catch((error: any) => {
                toast.add({
                  severity: "error",
                  summary: "Error Message",
                  detail: error.message,
                  life: 10000,
                });
                loading.value = false;
              });
          }
        } else {
          router.push({
            path: "/login",
          });
        }
      } else {
        loading.value = false;
      }
    }

    function cancel() {
      router.push({
        path: "/job",
      });
    }

    onMounted(async () => {
      if (router.currentRoute.value.params.id) {
        if (token) {
          is_loading.value = true;
          const data = JSON.parse(
            await controllers.getjobbyid(
              Number(router.currentRoute.value.params.id)
            )
          );
          name.value = data.name;
          breakduration.value = data.breakDuration;
          budget.value = data.budget;
          city.value = data.city;
          code.value = data.code;
          colour.value = data.colour;
          country.value = data.country;
          custom.value = data.custom;
          end_date.value = controllers5.formatDate(data.endDate);
          note.value = data.notes;
          notifymessage.value = data.notifMessage;
          percentagecomplete.value = data.percentComplete;
          start_date.value = controllers5.formatDate(data.startDate);
          starthour.value = data.startHour;
          starttime.value = data.startTime;
          state.value = data.state;
          street.value = data.street;
          workduration.value = data.workDuration;
          postalCode.value = data.zipCode;
          selectcontact.value = data.contacts;
          selectcompany.value = data.companies;
          // selectGroup.value = data.formGroups;
          is_loading.value = false;
        } else {
          router.push({
            path: "/login",
          });
        }
      }

      const data = JSON.parse(await controllers2.getallpeoples());
      data.forEach(function (value: any) {
        contactSelect.value.push({ id: value.id, name: value.name });
      });

      controllers
        .emaillogin(user_email)
        .then((response: any) => {
          ownerid.value = [response.user.id];
        })
        .catch((error: any) => {
          console.log(error);
        });

      const data1 = JSON.parse(await controllers3.getallpeoplegroups());
      data1.forEach(function (value: any) {
        GroupSelect.value.push({ id: value.id, name: value.name });
      });

      const data2 = JSON.parse(await controllers4.getallcompanies());
      data2.forEach(function (value: any) {
        companySelect.value.push({ id: value.id, name: value.name });
      });
    });

    return {
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
      add,
      cancel,
      is_loading,
      loading,
      selectcontact,
      contactSelect,
      selectcompany,
      companySelect,
      selectGroup,
      GroupSelect,
      ownerid,
    };
  },
});
export default AddJob;
</script>

<template>
  <MenuSidebar panel="job" />
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update Job" : "Add Job" }}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create Job"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update Job"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add()"
            v-else
          />
          <button class="btn btn-primary-outline" @click="cancel()">
            Cancel
          </button>
        </div>
      </section>
      <section class="people-form-wrapper">
        <form>
          <div>
            <h5 class="my-2">Details</h5>
            <div class="p-grid pt-4">
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="name" v-model="name" />
                  <label for="name">Name</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="breakduration"
                    id="breakDuration"
                    :minFractionDigits="2"
                    :maxFractionDigits="5"
                    v-model="breakduration"
                  />
                  <label for="breakDuration">Break Duration</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="minmaxfraction"
                    :minFractionDigits="2"
                    :maxFractionDigits="5"
                    v-model="budget"
                    id="budget"
                  />
                  <label for="budget">Budget</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <ColorPicker
                    class="cm-input-color-picker"
                    inputId="cp-hex"
                    format="hex"
                    v-model="colour"
                    id="code"
                  />
                  <label for="code"
                    >#<span>{{ colour }}</span></label
                  >
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <MultiSelect
                    v-model="selectcontact"
                    display="chip"
                    :options="contactSelect"
                    filter
                    optionLabel="name"
                    placeholder="Select Contact"
                    :maxSelectedLabels="10"
                    class="cm-dropdown"
                    id="selectGroup"
                  />
                  <label for="selectGroup">Select Contact</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <MultiSelect
                    v-model="selectcompany"
                    display="chip"
                    :options="companySelect"
                    filter
                    optionLabel="name"
                    placeholder="Select Company"
                    :maxSelectedLabels="10"
                    class="cm-dropdown"
                  />
                  <label for="selectGroup">Select Company</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <MultiSelect
                    v-model="selectGroup"
                    display="chip"
                    :options="GroupSelect"
                    filter
                    optionLabel="name"
                    placeholder="Select Group"
                    :maxSelectedLabels="10"
                    class="cm-dropdown"
                  />
                  <label for="selectGroup">Select Group</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="code" v-model="code" />
                  <label for="code">Code</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="custom" v-model="custom" />
                  <label for="custom">Custom</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <Calendar
                    class="cm-input-number"
                    v-model="start_date"
                    dateFormat="dd M, yy"
                    id="start_date"
                  />
                  <label for="start_date">Start Date</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <Calendar
                    class="cm-input-number"
                    v-model="end_date"
                    dateFormat="dd M, yy"
                    id="end_date"
                  />
                  <label for="end_date">End Date</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="percentagecomplete"
                    id="percentageComplete"
                  />
                  <label for="percentagecomplete">Percentage Complete</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="starthour"
                    id="starthour"
                  />
                  <label for="starthour">Start Hour</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="starttime"
                    id="starttime"
                  />
                  <label for="starttime">Start Time</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="workduration"
                    id="workduration"
                  />
                  <label for="workduration">Work Duration</label>
                </span>
              </div>
              <div class="p-col-12">
                <span class="p-float-label">
                  <InputText
                    class="cm-input"
                    id="notifymessage"
                    v-model="notifymessage"
                  />
                  <label for="notifymessage">Notify Message</label>
                </span>
              </div>
              <div class="p-col-12">
                <span class="p-float-label">
                  <Textarea class="cm-textarea" v-model="note" rows="3" />
                  <label>Note</label>
                </span>
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <h5 class="my-2">Address</h5>
            <div class="p-grid pt-4">
              <div class="p-col-12">
                <span class="p-float-label">
                  <InputText class="cm-input" id="street" v-model="street" />
                  <label for="street">Street address</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="city" v-model="city" />
                  <label for="city">City</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="state" v-model="state" />
                  <label for="state">State</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText
                    class="cm-input"
                    id="postalCode"
                    v-model="postalCode"
                  />
                  <label for="postalCode">Postal Code</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <InputText class="cm-input" id="country" v-model="country" />
                  <label for="country">Country</label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-header {
  max-width: 750px;
}
.people-form-wrapper {
  padding: 40px;
  background-color: $white;
  border-radius: 15px;
  max-width: 750px;
  .cm-input,
  .cm-textarea,
  .cm-dropdown,
  .cm-chips,
  .cm-input-number,
  .cm-input-color-picker {
    width: 100%;
  }
  .cm-label {
    font-size: 12px;
    line-height: 16px;
    color: $grey3;
    margin-bottom: 5px;
    display: inline-block;
  }
  .check-label {
    font-size: 12px;
    line-height: 16px;
    color: $grey3;
  }

  .radio-label {
    font-size: 14px;
    line-height: 20px;
    color: $grey9;
    display: inline-block;
  }
  .p-divider {
    &.p-divider-horizontal {
      margin: 40px 0;
    }
  }
  .lock-icon {
    color: $grey3;
    font-size: 14px;
    cursor: pointer;
  }
  .people-add-social {
    .p-col {
      flex-grow: 0;
    }
    .outline-icon-btn {
      padding: 12px;
      .p-inputtext {
        border: none;
        flex-grow: 1;
        padding: 0;
        &:focus {
          box-shadow: none;
        }
      }
    }
  }
  ::v-deep(.p-checkbox) {
    width: 14px;
    height: 14px;
    .p-checkbox-box {
      width: 14px;
      height: 14px;
      border-color: $grey6;
      .p-checkbox-icon {
        font-size: 9px;
      }
    }
  }
}
</style>
