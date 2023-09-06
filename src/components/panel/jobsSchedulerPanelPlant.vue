<script lang="ts">
// import schedulerPlantData from "../../store/mock/schedulerPlantData.json";
import { computed, defineComponent, ref } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import LargeIconButton from "../display/largeIconButton.vue";
import { IPlantDetails } from "../../use/controller/project/planner.d";

export const JobsSchedulerPanelPlant = /*#__PURE__*/ defineComponent({
  name: "JobsSchedulerPanelPlant",
  components: {
    LargeIconButton,
    TabView,
    TabPanel,
  },
  setup() {
    const activeIndex = ref(0);
    const selectedCategory = ref("");
    const selectedSubCategory = ref("");
    const selectedItems = ref<string[]>([]);
    const disabledStatus = ref<string[]>(["Assigned", "Leave", "Unavailable"]);

    const plantData = ref<IPlantDetails[]>([]);

    const getAllPlantCategories = computed(() => {
      let categories = [];
      categories = plantData.value.map((plant) => plant.category);
      categories = [...new Set(categories)]; // remove duplicates
      return categories;
    });

    const getSubCategories = computed(() => {
      let categories = [];
      categories = plantData.value.filter(
        (plant) => plant.category === selectedCategory.value
      );
      categories = categories.map((plant) => plant.subCategory);
      categories = [...new Set(categories)]; // remove duplicates
      return categories;
    });

    const getPlants = computed(() => {
      let categories = [];
      categories = plantData.value.filter(
        (plant) =>
          plant.category === selectedCategory.value &&
          plant.subCategory === selectedSubCategory.value
      );
      return categories;
    });

    const selectSubCategory = (index: any) => {
      selectedSubCategory.value = getSubCategories.value[index];
      activeIndex.value = index;
    };

    const getClassFromText = (type: string) => {
      let text = type || "";
      return text
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    };

    const selectCategory = (name: string) => {
      selectedCategory.value = name;
      selectSubCategory(0);
    };
    const selectItem = (plant: IPlantDetails) => {
      var index = selectedItems.value.indexOf(plant.id);

      if (disabledStatus.value.includes(plant.status)) return;

      if (index === -1) {
        selectedItems.value.push(plant.id);
      } else {
        selectedItems.value.splice(index, 1);
      }
    };

    return {
      getClassFromText,
      activeIndex,
      getPlants,
      getSubCategories,
      getAllPlantCategories,
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
export default JobsSchedulerPanelPlant;
</script>

<template>
  <div class="scheduler-plant-panel">
    <div class="plant-categories custom-scrollbar">
      <LargeIconButton
        :text="category"
        v-for="(category, i) in getAllPlantCategories"
        :key="i"
        :icon="getClassFromText(category)"
        :isActive="selectedCategory === category"
        @click="selectCategory(category)"
      />
    </div>
    <TabView
      v-if="selectedCategory !== ''"
      class="scheduler-panel"
      @tab-click="selectSubCategory($event.index)"
      v-model:activeIndex="activeIndex"
    >
      <TabPanel
        :header="subCategory"
        v-for="(subCategory, i) in getSubCategories"
        :key="i"
      >
        <div
          v-for="(plant, j) in getPlants"
          :key="j"
          class="tab-item"
          @click="selectItem(plant)"
          :class="{
            selected: selectedItems.includes(plant.id),
            disabled: disabledStatus.includes(plant.status),
          }"
        >
          <div class="tab-name">{{ plant.name }}</div>
          <div>{{ plant.details }}</div>
          <div class="tab-status" :class="getClassFromText(plant.status)">
            {{ plant.status }}
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<style scoped lang="scss">


.plant-categories,
.plant-categories {
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
