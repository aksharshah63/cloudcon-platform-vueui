<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import {
  ITenant,
  IUser,
} from "../../../cloudconLibrary/store/modules/userData/userDataModule";
import userDataAccess from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import { useRouter } from "vue-router";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
export const TenantSelection = /*#__PURE__*/ defineComponent({
  name: "TenantSelection",
  components: {
    Button,
    Dropdown,
  },
  emits: [],
  props: {},
  setup() {
    const router = useRouter();
    const selectedTenantId = ref<number>();

    const userDetails = computed<IUser | undefined>(
      () => userDataAccess.getUserDetails().user
    );
    const tenantOptions = computed<ITenant[]>(() => {
      const tenants = userDataAccess.getTenants();

      return (
        (userDetails.value?.tenantIds
          ?.map((t) => tenants.find((e) => e.id == t))
          ?.filter((t) => t != null) as ITenant[]) ?? []
      );
    });

    onMounted(async () => {
      await userDataAccess.fetchTenants();
      if (userDetails.value?.id != null)
        await userDataAccess.fetchTenantIdsForUser(userDetails.value?.id);
    });

    async function loginForTenant(): Promise<void> {
      const userDetails = userDataAccess.getUserDetails();
      const userId = userDetails.user?.id;
      const currentTenantId = userDetails.currentTenantId;

      if (userId && selectedTenantId.value) {
        if (currentTenantId != selectedTenantId.value) {
          await userDataAccess.fetchClaimsForUser(
            userId,
            selectedTenantId.value
          );
        }
        useCookies.set(cookieKeys.TENANT_ID, selectedTenantId.value);
        router.push({
          path: "/",
        });
      }
    }

    return {
      selectedTenantId,
      tenantOptions,
      loginForTenant,
    };
  },
});
export default TenantSelection;
</script>

<template>
  <div class="tenant-selection container is-flex is-flex-direction-column">
    <span>Select a tenant</span>
    <Dropdown
      :options="tenantOptions"
      optionLabel="name"
      optionValue="id"
      v-model="selectedTenantId"
    />
    <Button
      :disabled="selectedTenantId == null"
      label="Enter"
      @click="loginForTenant"
    />
  </div>
</template>

<style scoped lang="scss"></style>
