<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import InputText from "primevue/inputtext";
import Divider from "primevue/divider";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import fileUpload from "../../components/input/fileUpload.vue";
import { useToast } from "primevue/usetoast";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import peopleController from "../../controllers/peopleController";
import peopleGroupController from "../../controllers/peopleGroupController";
import companyController from "../../controllers/companyController";
import MultiSelect from "primevue/multiselect";
import {
  IRequestContactCreate,
  IRequestContactUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import InputNumber from "primevue/inputnumber";

export const AddPeople = /*#__PURE__*/ defineComponent({
  name: "AddPeople",
  components: {
    MenuSidebar,
    InputText,
    Divider,
    Textarea,
    Dropdown,
    fileUpload,
    ProgressSpinner,
    Button,
    MultiSelect,
    InputNumber,
  },
  setup() {
    const controllers = peopleController();
    const controllers2 = peopleGroupController();
    const controllers3 = companyController();
    const name = ref();
    const email = ref();
    const phoneNo = ref();
    const job = ref();
    const companyselect: any = ref([]);
    const selectcompany = ref();
    const email2 = ref();
    const mobile = ref();
    const phone = ref();
    const fax = ref();
    const website = ref();
    const skype = ref();
    const street = ref();
    const state = ref();
    const postalCode = ref();
    const city = ref();
    const country = ref();
    const selectGroup = ref();
    const relatedCompanies = ref();
    const salutation = ref();
    const note = ref();
    const rate = ref();
    const custom = ref("");
    const code = ref("");
    const weekendrate = ref();
    const GroupSelect: any = ref([]);

    const toast = useToast();
    const is_loading = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const user_email = String(useCookies.get(cookieKeys.EMAIL_ADDRESS));
    const ownerid = ref();

    function add() {
      let is_error = false;
      if (name.value == "" || name.value == null) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: "First Name is Required",
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
            const _requetdata: IRequestContactCreate = {
              jobTitle: job.value || null,
              email: email.value || null,
              email2: email2.value || null,
              mobile: mobile.value || null,
              phone: phoneNo.value || null,
              phone2: phone.value || null,
              name: name.value || null,
              city: city.value || null,
              code: code.value || null,
              country: country.value || null,
              custom: null,
              fax: fax.value || null,
              notes: note.value || null,
              rate: rate.value || null,
              salutation: salutation.value || null,
              skypeName: skype.value || null,
              state: street.value || null,
              street: street.value || null,
              webpage: website.value || null,
              weekendRate: weekendrate.value,
              zipCode: postalCode.value || null,
              contactGroupIds: selectGroup.value
                ? selectGroup.value.map((x: any) => x.id)
                : null,
              companyId: selectcompany.value ? selectcompany.value["id"] : null,
              ownerIds: ownerid.value || null,
              photoId: null,
            };
            controllers
              .addpeople(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "People Add Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/people",
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
            const _requetdata: IRequestContactUpdate = {
              id: Number(router.currentRoute.value.params.id),
              jobTitle: job.value || null,
              email: email.value || null,
              email2: email2.value || null,
              mobile: mobile.value || null,
              phone: phoneNo.value || null,
              phone2: phone.value || null,
              name: name.value || null,
              city: city.value || null,
              code: code.value || null,
              country: country.value || null,
              custom: null,
              fax: fax.value || null,
              notes: note.value || null,
              rate: rate.value || null,
              salutation: salutation.value || null,
              skypeName: skype.value || null,
              state: street.value || null,
              street: street.value || null,
              webpage: website.value || null,
              weekendRate: weekendrate.value,
              zipCode: postalCode.value || null,
              contactGroupIds: selectGroup.value
                ? selectGroup.value.map((x: any) => x.id)
                : null,
              companyId: selectcompany.value ? selectcompany.value["id"] : null,
              ownerIds: ownerid.value || null,
              photoId: null,
            };
            controllers
              .updatepeople(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "People Update Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/people",
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
        path: "/people",
      });
    }

    onMounted(async () => {
      if (router.currentRoute.value.params.id) {
        if (token) {
          is_loading.value = true;
          const data = JSON.parse(
            await controllers.getpeoplebyid(
              Number(router.currentRoute.value.params.id)
            )
          );
          job.value = data.jobTitle;
          email.value = data.email;
          email2.value = data.email2;
          mobile.value = data.mobile;
          phoneNo.value = data.phone;
          phone.value = data.phone2;
          name.value = data.name;
          city.value = data.city;
          code.value = data.code;
          country.value = data.country;
          custom.value = data.custom;
          fax.value = data.fax;
          note.value = data.notes;
          rate.value = data.rate;
          salutation.value = data.salutation;
          skype.value = data.skypeName;
          state.value = data.state;
          street.value = data.street;
          website.value = data.webpage;
          weekendrate.value = data.weekendRate;
          postalCode.value = data.zipCode;
          selectGroup.value = data.contactGroups;
          selectcompany.value = data.company;
          is_loading.value = false;
        } else {
          router.push({
            path: "/login",
          });
        }
      }

      const data = JSON.parse(await controllers2.getallpeoplegroups());
      data.forEach(function (value: any) {
        GroupSelect.value.push({ id: value.id, name: value.name });
      });

      const data1 = JSON.parse(await controllers3.getallcompanies());
      data1.forEach(function (value: any) {
        companyselect.value.push({ id: value.id, name: value.name });
      });

      controllers
        .emaillogin(user_email)
        .then((response: any) => {
          ownerid.value = [response.user.id];
        })
        .catch((error: any) => {
          console.log(error);
        });
    });

    return {
      name,
      email,
      phoneNo,
      job,
      companyselect,
      email2,
      mobile,
      phone,
      fax,
      website,
      skype,
      street,
      state,
      postalCode,
      city,
      country,
      selectGroup,
      relatedCompanies,
      salutation,
      note,
      add,
      cancel,
      is_loading,
      loading,
      rate,
      custom,
      code,
      weekendrate,
      GroupSelect,
      ownerid,
      selectcompany,
    };
  },
});
export default AddPeople;
</script>

<template>
  <MenuSidebar panel="people" />
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update People" : "Add People" }}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create People"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update People"
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
            <h5 class="my-2">Identity</h5>
            <div class="p-grid pt-4">
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="name" v-model="name" />
                  <label for="name">Name</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="email" v-model="email" />
                  <label for="email">Email address</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="phoneNo" v-model="phoneNo" />
                  <label for="phoneNo">Phone number</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="job" v-model="job" />
                  <label for="job">Job Title </label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <Dropdown
                    v-model="selectcompany"
                    inputId="company"
                    :options="companyselect"
                    optionLabel="name"
                    placeholder="Select Company"
                    class="cm-dropdown"
                  />
                  <label for="company">Company</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="email2" v-model="email2" />
                  <label for="email2">Email 2</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="mobile" v-model="mobile" />
                  <label for="mobile">Mobile</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="phone" v-model="phone" />
                  <label for="phone">Phone</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="fax" v-model="fax" />
                  <label for="fax">Fax</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="website" v-model="website" />
                  <label for="website">Website</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="skype" v-model="skype" />
                  <label for="skype">Skype</label>
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
          <Divider />
          <div>
            <h5 class="my-2">More</h5>
            <div class="p-grid pt-4">
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
                  <InputText
                    class="cm-input"
                    id="relatedCompanies"
                    v-model="relatedCompanies"
                  />
                  <label for="relatedCompanies">Related Companies</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText
                    class="cm-input"
                    id="salutation"
                    v-model="salutation"
                  />
                  <label for="salutation">Salutation</label>
                </span>
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
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="rate"
                    id="rate"
                  />
                  <label for="rate">Rate</label>
                </span>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputNumber
                    class="cm-input-number"
                    inputId="integeronly"
                    v-model="weekendrate"
                    id="weekendrate"
                  />
                  <label for="weekendrate">Weekend Rate</label>
                </span>
              </div>
              <div class="p-col-12">
                <span class="p-float-label">
                  <Textarea class="cm-textarea" v-model="note" rows="3" />
                  <label>Note</label>
                </span>
              </div>
              <div class="p-col-12">
                <label class="cm-label" for="photo">Photo</label>
                <fileUpload id="photo" />
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
  .cm-input-number {
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
