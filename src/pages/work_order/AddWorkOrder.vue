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
import Dropdown from "primevue/dropdown";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import workOrderController from "../../controllers/workOrderController";
import peopleController from "../../controllers/peopleController";
import jobController from "../../controllers/jobController";
import companyController from "../../controllers/companyController";
import commonController from "../../controllers/commonController";
import {
  IRequestWorkOrderCreate,
  IRequestWorkOrderUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";

export const AddWorkOrder = /*#__PURE__*/ defineComponent({
  name: "AddWorkOrder",
  components: {
    MenuSidebar,
    InputText,
    Divider,
    Textarea,
    ProgressSpinner,
    Button,
    InputNumber,
    Calendar,
    Dropdown,
  },
  setup() {
    const controllers = workOrderController();
    const controllers2 = peopleController();
    const controllers3 = jobController();
    const controllers4 = companyController();
    const controllers5 = commonController();
    const name = ref();
    const duration = ref();
    const city = ref();
    const country = ref();
    const custom = ref("");
    const due_date = ref();
    const end_date = ref();
    const note = ref();
    const state = ref();
    const street = ref();
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
    const selectjob = ref();
    const jobSelect: any = ref([]);

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
            const _requetdata: IRequestWorkOrderCreate = {
              name: name.value || null,
              notes: note.value || null,
              city: city.value || null,
              country: country.value || null,
              custom: null,
              dueDate: new Date(due_date.value).getTime() || null,
              duration: duration.value || null,
              endDate: new Date(end_date.value).getTime() || null,
              state: state.value || null,
              street: street.value || null,
              zipCode: postalCode.value || null,
              companyId: selectcompany.value ? selectcompany.value["id"] : null,
              contactId: selectcontact.value ? selectcontact.value["id"] : null,
              jobId: selectjob.value ? selectjob.value["id"] : null,
              ownerIds: ownerid.value,
            };
            controllers
              .addworkorder(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Work Order Add Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/workOrder",
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
            const _requetdata: IRequestWorkOrderUpdate = {
              id: Number(router.currentRoute.value.params.id),
              name: name.value || null,
              notes: note.value || null,
              city: city.value || null,
              country: country.value || null,
              custom: null,
              dueDate: new Date(due_date.value).getTime() || null,
              duration: duration.value || null,
              endDate: new Date(end_date.value).getTime() || null,
              state: state.value || null,
              street: street.value || null,
              zipCode: postalCode.value || null,
              companyId: selectcompany.value ? selectcompany.value["id"] : null,
              contactId: selectcontact.value ? selectcontact.value["id"] : null,
              jobId: selectjob.value ? selectjob.value["id"] : null,
              ownerIds: ownerid.value,
            };
            controllers
              .updateworkorder(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Work Order Update Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/WorkOrder",
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
        path: "/workOrder",
      });
    }

    onMounted(async () => {
      if (router.currentRoute.value.params.id) {
        if (token) {
          is_loading.value = true;
          const data = JSON.parse(
            await controllers.getworkorderbyid(
              Number(router.currentRoute.value.params.id)
            )
          );
          name.value = data.name;
          duration.value = data.duration;
          city.value = data.city;
          country.value = data.country;
          custom.value = data.custom;
          end_date.value = controllers5.formatDate(data.endDate);
          note.value = data.notes;
          due_date.value = controllers5.formatDate(data.dueDate);
          state.value = data.state;
          street.value = data.street;
          postalCode.value = data.zipCode;
          selectcontact.value = data.contact;
          selectcompany.value = data.company;
          selectjob.value = data.job;
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

      const data1 = JSON.parse(await controllers3.getalljobs());
      data1.forEach(function (value: any) {
        jobSelect.value.push({ id: value.id, name: value.name });
      });

      const data2 = JSON.parse(await controllers4.getallcompanies());
      data2.forEach(function (value: any) {
        companySelect.value.push({ id: value.id, name: value.name });
      });
    });

    return {
      name,
      duration,
      city,
      country,
      custom,
      due_date,
      end_date,
      note,
      state,
      street,
      postalCode,
      add,
      cancel,
      is_loading,
      loading,
      selectcontact,
      contactSelect,
      selectcompany,
      companySelect,
      selectjob,
      jobSelect,
      ownerid,
    };
  },
});
export default AddWorkOrder;
</script>

<template>
  <MenuSidebar panel="work_order" />
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update Work Order" : "Add Work Order" }}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create Work Order"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update Work Order"
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
                    inputId="duration"
                    id="duration"
                    :minFractionDigits="2"
                    :maxFractionDigits="5"
                    v-model="duration"
                  />
                  <label for="duration">Duration</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <Dropdown
                    v-model="selectcontact"
                    inputId="contact"
                    :options="contactSelect"
                    optionLabel="name"
                    placeholder="Select Contact"
                    class="cm-dropdown"
                  />
                  <label for="selectcontact">Select Contact</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <Dropdown
                    v-model="selectcompany"
                    inputId="company"
                    :options="companySelect"
                    optionLabel="name"
                    placeholder="Select Company"
                    class="cm-dropdown"
                  />
                  <label for="selectcompany">Select Company</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <div class="p-float-label">
                  <Dropdown
                    v-model="selectjob"
                    inputId="job"
                    :options="jobSelect"
                    optionLabel="name"
                    placeholder="Select Job"
                    class="cm-dropdown"
                  />
                  <label for="job">Select Job</label>
                </div>
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
                    v-model="due_date"
                    dateFormat="dd M, yy"
                    id="due_date"
                  />
                  <label for="due_date">Due Date</label>
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
