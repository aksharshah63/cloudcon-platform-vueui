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
import plantController from "../../controllers/plantController";
import commonController from "../../controllers/commonController";
import { useRouter } from "vue-router";
/* eslint-disable */
export const WorkOrderView = /*#__PURE__*/ defineComponent({
  name: "WorkOrderView",
  components: {
    SubHeaderAction,
    Divider,
    Button,
    ProgressSpinner,
    Image,
    MenuSidebar,
  },
  setup() {
    const controllers = plantController();
    const controllers2 = commonController();
    const toast = useToast();
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const name = ref();
    const street = ref();
    const custom = ref("");
    const geo = ref("");
    const maintenanceUsage = ref();
    const manufacturer = ref("");
    const model = ref("");
    const purchaseDate = ref();
    const purchasePrice = ref();
    const usage = ref();
    const warrantyDate = ref();
    const serialNumber = ref("");
    // const contacts = ref("");
    // const jobs = ref("");
    // const companies = ref("");
    const is_loading = ref(true);

    onMounted(async () => {
      if (token) {
        const data = JSON.parse(
          await controllers.getplantbyid(
            Number(router.currentRoute.value.params.id)
          )
        );
        name.value = data.name;
        street.value = data.address;
        custom.value = data.custom ? data.custom.po.ValueKind : null;
        geo.value = data.geo;
        maintenanceUsage.value = data.maintenanceUsage;
        manufacturer.value = data.manufacturer;
        model.value = data.model;
        purchaseDate.value = controllers2.formatDate(data.purchaseDate);
        purchasePrice.value = data.purchasePrice;
        serialNumber.value = data.serialNumber;
        usage.value = data.usage;
        warrantyDate.value = controllers2.formatDate(data.warrantyDate);
        // contacts.value = data.contact.map((x: any) => x.name).join(", ");
        // companies.value = data.company.map((x: any) => x.name).join(", ");
        // jobs.value = data.job.map((x: any) => x.name).join(", ");
        is_loading.value = false;
      } else {
        router.push({
          path: "/login",
        });
      }
    });

    function deleteplant(id: number) {
      if (confirm("Are you sure to delete this Plant ?")) {
        controllers
          .deleteplant(id)
          .then(() => {
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Plant Successfully Deleted",
              life: 10000,
            });
            router.push({
              path: "/plant",
            });
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    }

    return {
      deleteplant,
      is_loading,
      name,
      custom,
      street,
      geo,
      maintenanceUsage,
      manufacturer,
      model,
      purchaseDate,
      purchasePrice,
      serialNumber,
      usage,
      warrantyDate,
      // contacts,
      // jobs,
      // companies,
    };
  },
});
export default WorkOrderView;
</script>

<template>
  <MenuSidebar panel="plant" />

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
              :to="'/plant/edit' + '/' + $route.params.id"
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
              @click="deleteplant(Number($route.params.id))"
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
                    <p class="people-view-field-name">Geo</p>
                    <p class="people-view-field-data">
                      {{ geo }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Maintenance Usage</p>
                    <p class="people-view-field-data">
                      {{ maintenanceUsage }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Manufacturer</p>
                    <p class="people-view-field-data">
                      {{ manufacturer }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Model</p>
                    <p class="people-view-field-data">
                      {{ model }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Purchase Date</p>
                    <p class="people-view-field-data">
                      {{ purchaseDate }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Purchase Price</p>
                    <p class="people-view-field-data">
                      {{ purchasePrice }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Serial Number</p>
                    <p class="people-view-field-data">
                      {{ serialNumber }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Usage</p>
                    <p class="people-view-field-data">
                      {{ usage }}
                    </p>
                  </div>
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Warranty Date</p>
                    <p class="people-view-field-data">
                      {{ warrantyDate }}
                    </p>
                  </div>
                  <!-- <div class="p-col-12 p-lg-3 people-view-fields">
                  <p class="people-view-field-name">Contact</p>
                  <p class="people-view-field-data">{{ contacts }}</p>
                </div>
                <div class="p-col-12 p-lg-3 people-view-fields">
                  <p class="people-view-field-name">Comapny</p>
                  <p class="people-view-field-data">{{ companies }}</p>
                </div> -->
                  <div class="p-col-12 p-lg-3 people-view-fields">
                    <p class="people-view-field-name">Custom</p>
                    <p class="people-view-field-data">{{ custom }}</p>
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
