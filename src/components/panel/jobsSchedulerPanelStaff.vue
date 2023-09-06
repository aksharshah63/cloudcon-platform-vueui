<script lang="ts">
// import schedulerStaffData from "../../store/mock/schedulerStaffData.json";
import { computed, defineComponent, ref } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import LargeIconButton from "../display/largeIconButton.vue";
import AvatarBox from "../display/avatarBox.vue";
import { IStaffDetails } from "../../use/controller/project/planner.d";

export const JobsSchedulerPanelStaff = /*#__PURE__*/ defineComponent({
  name: "JobsSchedulerPanelStaff",
  components: {
    AvatarBox,
    LargeIconButton,
    TabView,
    TabPanel,
  },
  setup() {
    const activeIndex = ref(0);
    const selectedCategory = ref("");
    const selectedSubCategory = ref("");
    const selectedItems = ref<string[]>([]);
    const disabledStatus = ref<string[]>(["Leave", "Unavailable"]);

    const staffData = ref<IStaffDetails[]>([]);

    const getAllStaffRoles = computed(() => {
      let roles = [];
      roles = staffData.value.map((staff) => staff.role);
      roles = [...new Set(roles)]; // remove duplicates
      return roles;
    });

    const getSubRoles = computed(() => {
      let roles = [];
      roles = staffData.value.filter(
        (staff) => staff.role === selectedCategory.value
      );
      roles = roles.map((staff) => staff.subRole);
      roles = [...new Set(roles)]; // remove duplicates
      return roles;
    });

    const getStaffs = computed(() => {
      let roles = [];
      roles = staffData.value.filter(
        (staff) =>
          staff.role === selectedCategory.value &&
          staff.subRole === selectedSubCategory.value
      );
      return roles;
    });

    const selectSubCategory = (index: any) => {
      selectedSubCategory.value = getSubRoles.value[index];
      activeIndex.value = index;
    };

    const getClassFromText = (type: string) => {
      return type
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    };

    const selectCategory = (name: string) => {
      selectedCategory.value = name;
      selectSubCategory(0);
    };
    const selectItem = (staff: IStaffDetails) => {
      var index = selectedItems.value.indexOf(staff.id);

      if (disabledStatus.value.includes(staff.status)) return;

      if (index === -1) {
        selectedItems.value.push(staff.id);
      } else {
        selectedItems.value.splice(index, 1);
      }
    };

    return {
      getClassFromText,
      activeIndex,
      getStaffs,
      getSubRoles,
      getAllStaffRoles,
      selectCategory,
      selectSubCategory,
      selectedCategory,
      selectedSubCategory,
      selectedItems,
      disabledStatus,
      selectItem,
    };
  },
});
export default JobsSchedulerPanelStaff;
</script>

<template>
  <div class="scheduler-staff-panel">
    <div class="staff-categories custom-scrollbar">
      <LargeIconButton
        :text="role"
        v-for="(role, i) in getAllStaffRoles"
        :key="i"
        :isActive="selectedCategory === role"
        @click="selectCategory(role)"
      />
    </div>
    <TabView
      v-if="selectedCategory !== ''"
      class="scheduler-panel"
      @tab-click="selectSubCategory($event.index)"
      v-model:activeIndex="activeIndex"
    >
      <TabPanel :header="subRole" v-for="(subRole, i) in getSubRoles" :key="i">
        <div
          v-for="(staff, j) in getStaffs"
          :key="j"
          class="tab-item"
          @click="selectItem(staff)"
          :class="{
            selected: selectedItems.includes(staff.id),
            disabled: disabledStatus.includes(staff.status),
          }"
        >
          <AvatarBox
            class="tab-avatar"
            :name="staff.name"
            :image="staff.image"
          />
          <div class="tab-name">{{ staff.name }}</div>
          <div class="tab-status" :class="getClassFromText(staff.status)">
            {{ staff.status }}
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss">


.plant-categories,
.staff-categories {
  display: flex;
  padding-bottom: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
  & > div {
    margin-right: 10px;

    &:last-of-type {
      margin-right: 1px;
    }
  }
}
</style>
