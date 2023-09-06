<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import peopleGroupController from "../../controllers/peopleGroupController";

export const AddPeopleGroup = /*#__PURE__*/ defineComponent({
  name: "AddPeopleGroup",
  components: {
    MenuSidebar,
    InputText,
    ProgressSpinner,
    Button,
  },
  setup() {
    const controllers = peopleGroupController();
    const fname = ref();
    const toast = useToast();
    const is_loading = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);

    function add() {
      let is_error = false;
      if (fname.value == "" || fname.value == null) {
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
            controllers
              .addpeoplegroup(fname.value)
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "People Group Add Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/peopleGroup",
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
            controllers
              .updatepeoplegroup(
                Number(router.currentRoute.value.params.id),
                fname.value,
                [],
                []
              )
              .then(() => {
                toast.add({
                  severity: "success",
                  summary: "Success Message",
                  detail: "People Group Update Successfully",
                  life: 10000,
                });
                loading.value = false;
                router.push({
                  path: "/peopleGroup",
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
        path: "/peopleGroup",
      });
    }

    onMounted(async () => {
      if (router.currentRoute.value.params.id) {
        if (token) {
          is_loading.value = true;
          const data = JSON.parse(
            await controllers.getpeoplegroupbyid(
              Number(router.currentRoute.value.params.id)
            )
          );
          fname.value = data.name;
          is_loading.value = false;
        } else {
          router.push({
            path: "/peopleGroup",
          });
        }
      }
    });

    return {
      fname,
      add,
      cancel,
      is_loading,
      loading,
    };
  },
});
export default AddPeopleGroup;
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
          {{ $route.params.id ? "Update People Group" : "Add People Group" }}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create People Group"
            class="btn btn-primary mr-3"
            :loading="loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update People Group"
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
                  <InputText class="cm-input" id="fname" v-model="fname" />
                  <label for="fname">Group Name</label>
                </span>
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
  .cm-chips {
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
