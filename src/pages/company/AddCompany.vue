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
import companyController from "../../controllers/companyController";
import {
  IRequestCompanyCreate,
  IRequestCompanyUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";

export const AddCompany = /*#__PURE__*/ defineComponent({
  name: "AddCompany",
  components: {
    MenuSidebar,
    InputText,
    Divider,
    Textarea,
    ProgressSpinner,
    Button,
  },
  setup() {
    const controllers = companyController();
    const name = ref();
    const email = ref();
    const phoneNo = ref();
    const abn = ref();
    const fax = ref();
    const website = ref();
    const street = ref();
    const state = ref();
    const postalCode = ref();
    const city = ref();
    const country = ref();
    const note = ref();
    const custom = ref("");
    const ownerid = ref();

    const toast = useToast();
    const is_loading = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const user_email = String(useCookies.get(cookieKeys.EMAIL_ADDRESS));

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
            const _requetdata: IRequestCompanyCreate = {
              city: city.value || null,
              country: country.value || null,
              custom: null,
              email: email.value || null,
              fax: fax.value || null,
              name: name.value || null,
              note: note.value || null,
              state: street.value || null,
              street: street.value || null,
              phone: phoneNo.value || null,
              abn: abn.value || null,
              webPage: website.value || null,
              zipCode: postalCode.value || null,
              ownerIds: ownerid.value || null,
            };
            controllers
              .addcompany(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Company Add Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/company",
                });
              })
              .catch((error: any) => {
                if (error.message.AlreadyExists) {
                  toast.add({
                    severity: "error",
                    summary: "Error Message",
                    detail: error.message.AlreadyExists[0],
                    life: 10000,
                  });
                }
                if (error.message.InvalidField) {
                  toast.add({
                    severity: "error",
                    summary: "Error Message",
                    detail: error.message.InvalidField[0],
                    life: 10000,
                  });
                }

                loading.value = false;
              });
          } else {
            loading.value = true;
            const _requetdata: IRequestCompanyUpdate = {
              id: Number(router.currentRoute.value.params.id),
              city: city.value || null,
              country: country.value || null,
              custom: null,
              email: email.value || null,
              fax: fax.value || null,
              name: name.value || null,
              note: note.value || null,
              state: street.value || null,
              street: street.value || null,
              phone: phoneNo.value || null,
              abn: abn.value || null,
              webPage: website.value || null,
              zipCode: postalCode.value || null,
              ownerIds: ownerid.value || null,
            };
            controllers
              .updatecompany(_requetdata)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "Comany Update Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/company",
                });
              })
              .catch((error: any) => {
                if (error.message.AlreadyExists) {
                  toast.add({
                    severity: "error",
                    summary: "Error Message",
                    detail: error.message.AlreadyExists[0],
                    life: 10000,
                  });
                }
                if (error.message.InvalidField) {
                  toast.add({
                    severity: "error",
                    summary: "Error Message",
                    detail: error.message.InvalidField[0],
                    life: 10000,
                  });
                }
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
        path: "/company",
      });
    }

    onMounted(async () => {
      if (router.currentRoute.value.params.id) {
        if (token) {
          is_loading.value = true;
          const data = JSON.parse(
            await controllers.getcompanybyid(
              Number(router.currentRoute.value.params.id)
            )
          );
          city.value = data.city;
          country.value = data.country;
          custom.value = data.custom;
          email.value = data.email;
          fax.value = data.fax;
          name.value = data.name;
          note.value = data.note;
          phoneNo.value = data.phone;
          state.value = data.state;
          street.value = data.street;
          abn.value = data.abn;
          website.value = data.webPage;
          postalCode.value = data.zipCode;
          is_loading.value = false;
        } else {
          router.push({
            path: "/login",
          });
        }
      }

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
      abn,
      fax,
      website,
      street,
      state,
      postalCode,
      city,
      country,
      note,
      add,
      cancel,
      is_loading,
      loading,
      custom,
      ownerid,
    };
  },
});
export default AddCompany;
</script>

<template>
  <MenuSidebar panel="company" />
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update Company" : "Add Company" }}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create Company"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update Company"
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
            <h5 class="my-2">Deatils</h5>
            <div class="p-grid pt-4">
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="fname" v-model="name" />
                  <label for="fname">Name</label>
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
                  <InputText class="cm-input" id="job" v-model="abn" />
                  <label for="job">ABN </label>
                </span>
              </div>
            </div>
            <div class="p-grid">
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
                <div class="p-float-label">
                  <InputText class="cm-input" id="custom" v-model="custom" />
                  <label for="selectGroup">Child Companies</label>
                </div>
              </div>
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="custom" v-model="custom" />
                  <label for="custom">Custom</label>
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
