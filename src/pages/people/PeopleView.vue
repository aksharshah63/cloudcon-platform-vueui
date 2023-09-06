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
import peopleController from "../../controllers/peopleController";
import { useRouter } from "vue-router";
/* eslint-disable */
export const PeopleView = /*#__PURE__*/ defineComponent({
  name: "PeopleView",
  components: {
    SubHeaderAction,
    Divider,
    Button,
    ProgressSpinner,
    Image,
    MenuSidebar,
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
    };
  },
  setup() {
    const controllers = peopleController();
    const toast = useToast();
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const jobTitle = ref("");
    const email = ref("");
    const email2 = ref("");
    const mobile = ref("");
    const phone = ref("");
    const phone2 = ref("");
    const name = ref("");
    const city = ref("");
    const code = ref("");
    const country = ref("");
    const custom = ref("");
    const fax = ref("");
    const notes = ref("");
    const rate = ref("");
    const salutation = ref("");
    const skypeName = ref("");
    const state = ref("");
    const street = ref("");
    const webpage = ref("");
    const weekendRate = ref("");
    const zipCode = ref("");
    const contactGroups = ref("");
    const company = ref("");
    // const owners = ref("");
    // const photoId = ref("");
    // const relatedCompanies = ref("");
    const is_loading = ref(true);
    const publicPath = ref(process.env.BASE_URL);

    onMounted(async () => {
      if (token) {
        const data = JSON.parse(
          await controllers.getpeoplebyid(
            Number(router.currentRoute.value.params.id)
          )
        );
        jobTitle.value = data.jobTitle;
        email.value = data.email;
        email2.value = data.email2;
        mobile.value = data.mobile;
        phone.value = data.phone;
        phone2.value = data.phone2;
        name.value = data.name;
        city.value = data.city;
        code.value = data.code;
        country.value = data.country;
        custom.value = data.custom;
        fax.value = data.fax;
        notes.value = data.notes;
        rate.value = data.rate;
        salutation.value = data.salutation;
        skypeName.value = data.skypeName;
        state.value = data.state;
        street.value = data.street;
        webpage.value = data.webpage;
        weekendRate.value = data.weekendRate;
        zipCode.value = data.zipCode;
        contactGroups.value = data.contactGroups
          ? data.contactGroups.map((x: any) => x.name).join(", ")
          : null;
        company.value = data.company ? data.company.name : "";
        is_loading.value = false;
      } else {
        router.push({
          path: "/login",
        });
      }
    });

    function deleteUser(id: number) {
      if (confirm("Are you sure to delete this People ?")) {
        controllers
          .deletepeople(id)
          .then(() => {
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "People Successfully Deleted",
              life: 10000,
            });
            router.push({
              path: "/people",
            });
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    }

    return {
      deleteUser,
      is_loading,
      jobTitle,
      email,
      email2,
      mobile,
      phone,
      phone2,
      name,
      city,
      code,
      country,
      custom,
      fax,
      notes,
      rate,
      salutation,
      skypeName,
      state,
      street,
      webpage,
      weekendRate,
      zipCode,
      contactGroups,
      publicPath,
      company,
    };
  },
});
export default PeopleView;
</script>

<template>
  <MenuSidebar panel="people" />

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
              :to="'/people/edit' + '/' + $route.params.id"
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
              @click="deleteUser(Number($route.params.id))"
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
              <div class="people-view-form-box">
                <h6 class="people-view-title">
                  <div>Forms</div>
                  <div class="show-more-form">
                    Less View
                    <font-awesome-icon
                      class="ml-2"
                      :icon="['fas', 'chevron-up']"
                    />
                  </div>
                </h6>
                <div class="p-grid">
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Employee Expense</span>
                      </div>
                      <span class="form-count">2</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Leave Form</span>
                      </div>
                      <span class="form-count">6</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Timesheet</span>
                      </div>
                      <span class="form-count">24</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Training Record</span>
                      </div>
                      <span class="form-count">15</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Archive Forms</span>
                      </div>
                      <span class="form-count">6</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Lorem ipsum form</span>
                      </div>
                      <span class="form-count">2</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Lorem ipsum form</span>
                      </div>
                      <span class="form-count">6</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Lorem ipsum form</span>
                      </div>
                      <span class="form-count">24</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Lorem ipsum form</span>
                      </div>
                      <span class="form-count">15</span>
                    </button>
                  </div>
                  <div class="p-col people-view-form p-1">
                    <button class="outline-icon-btn">
                      <div>
                        <span class="form-icon">
                          <font-awesome-icon :icon="['fas', 'file-alt']" />
                        </span>
                        <span>Lorem ipsum form</span>
                      </div>
                      <span class="form-count">15</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-col-12">
              <div class="people-view-box">
                <h6 class="people-view-title">Identity</h6>
                <div class="p-grid">
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Name</p>
                    <p class="people-view-field-data">{{ name }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Job Title</p>
                    <p class="people-view-field-data">
                      {{ jobTitle }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Company</p>
                    <p class="people-view-field-data">{{ company }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Email address</p>
                    <p class="people-view-field-data">{{ email }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Mobile</p>
                    <p class="people-view-field-data">
                      {{ mobile }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Phone</p>
                    <p class="people-view-field-data">{{ phone }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Website</p>
                    <p class="people-view-field-data">{{ webpage }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Skype</p>
                    <p class="people-view-field-data">
                      {{ skypeName }}
                      <font-awesome-icon
                        class="copy-icon"
                        :icon="['fa', 'copy']"
                      />
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
                    <p class="people-view-field-data">{{ zipCode }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Country</p>
                    <p class="people-view-field-data">{{ country }}</p>
                  </div>
                </div>
              </div>
            </div>
            <Divider />
            <div class="p-col-12">
              <div class="people-view-box">
                <h6 class="people-view-title">More</h6>
                <div class="people-view-fields">
                  <p class="people-view-field-name">Group</p>
                  <p class="people-view-field-data">{{ contactGroups }}</p>
                </div>
                <div class="p-grid">
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Related Companies</p>
                    <p class="people-view-field-data"></p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Salutation</p>
                    <p class="people-view-field-data">{{ salutation }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Code</p>
                    <p class="people-view-field-data">{{ code }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Custom</p>
                    <p class="people-view-field-data">{{ custom }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Rate</p>
                    <p class="people-view-field-data">{{ rate }}</p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Weekend Rate</p>
                    <p class="people-view-field-data">{{ weekendRate }}</p>
                  </div>
                </div>
                <div class="people-view-fields">
                  <p class="people-view-field-name">Note</p>
                  <p class="people-view-field-data">
                    {{ notes }}
                  </p>
                </div>
                <div class="people-view-fields">
                  <p class="people-view-field-name">Photo</p>
                  <p class="people-view-field-data">
                    <Image
                      class="mr-2"
                      :src="`${publicPath}/images/people-detail-img1.png`"
                      alt="people-detail-img1"
                    />
                    <img
                      class="mr-2"
                      :src="`${publicPath}/images/people-detail-img1.png`"
                      alt="people-detail-img1"
                    />
                  </p>
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
