<script lang="ts">
import {
  IRecord,
  // IFavouriteOption,
  IUpviseDataMessage,
  ISort,
  IGridSlicingFilter,
  IGroupDetail,
  IColumnMetadata,
} from "../../store/modules/upvise.d";
import HeaderActions from "../../components/header/actions.vue";
import HeaderSummary from "../../components/header/summary.vue";
import SearchQuery from "../../components/search/query.vue";
import ViewGrid from "../../components/view/grid.vue";
import ViewChart from "../../components/view/chart.vue";
import ViewTimeline from "../../components/view/timeline.vue";
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  watchEffect,
  watch,
  PropType,
} from "vue";
import FavouriteManager from "../../components/favourite/manager.vue";
import "../../assets/styles/global.scss";
import { favouriteManager } from "../../use/controller/favouriteManager/favouriteManager";
import { IFavouriteRecord } from "../../use/controller/favouriteManager/favouriteManager.d";
import CustomSpinner from "../../components/progressSpinner/customSpinner.vue";
import InformationCard from "../../components/display/informationCard.vue";
import utils from "../../use/function/useUtils";
import { useState } from "../../store";

export const DashboardOverview = /*#__PURE__*/ defineComponent({
  name: "DashboardOverview",
  components: {
    HeaderActions,
    FavouriteManager,
    HeaderSummary,
    SearchQuery,
    ViewGrid,
    ViewTimeline,
    ViewChart,
    CustomSpinner,
    InformationCard,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    disableTick: {
      type: Boolean,
      required: false,
      default: false,
    },
    moduleName: {
      type: String,
      required: true,
    },
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    parentId: {
      type: String,
      required: false,
    },
    headerActionButtons: {
      type: [Object],
      required: false,
    },
    showViewToggle: {
      type: Boolean,
      required: false,
      default: true,
    },
    viewToggleOptions: {
      type: Object as () => string[],
      required: false,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: ["data"],
    },
    hideCenterHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
    showHeaderToggle: {
      type: Boolean,
      required: false,
      default: true,
    },
    forceShowAdd: {
      type: Boolean,
      required: false,
      default: false,
    },
    forceShowDetails: {
      type: Boolean,
      required: false,
      default: false,
    },
    editOnClick: {
      type: Boolean,
      required: false,
      default: false,
    },
    tickIconField: {
      type: String,
      required: false,
    },
    removeAdd: {
      type: Object as () => {
        currentGroupType: string;
        field: string;
        value: string;
      }[],
      required: false,
    },
    slicingInformation: {
      type: Object as () => Record<string, unknown>[],
      required: false,
    },
    useColumnPicker: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableHeaderSummaryBackground: {
      type: Boolean,
      required: false,
      default: true,
    },
    showFileExport: {
      type: Boolean,
      required: false,
      default: false,
    },
    showFileImport: {
      type: Boolean,
      required: false,
      default: false,
    },
    uploadSuccessful: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    initialSortArray: {
      type: Object as () => ISort[],
      required: false,
    },
    exportFilter: {
      type: Object as () => IRecord,
      required: false,
    },
    customRowColours: {
      type: Object as () => { using: boolean; level: string },
      required: false,
    },
    showTabs: {
      type: Boolean,
      required: false,
      default: true,
    },
    showLeftRightHeader: {
      type: Boolean,
      required: false,
      default: true,
    },
    isProjectsTimeline: {
      type: Boolean,
      required: false,
      default: false,
    },
    customImportMessage: {
      type: String,
      required: false,
    },
    colourTheme: {
      type: Object as () => Record<string, string>,
      required: false,
    },
    startExpanded: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideChildlessParents: {
      type: Boolean,
      required: false,
    },
    removeDetailsButton: {
      type: Object as () => PropType<Record<string, boolean>>,
      required: false,
      default: () => ({} as Record<string, boolean>),
    },
    excludedLevel: {
      type: Number,
      required: false,
    },
    removeNameColumnMinWidth: {
      type: Object as () => PropType<Record<string, boolean>>,
      required: false,
      default: () => ({} as Record<string, boolean>),
    },
    informationCards: {
      type: [Object],
      required: false,
    },
    fixedTableWidth: {
      type: Boolean,
      required: false,
      default: false,
    },
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const currentView = ref("data");
    const favManagerRef = ref();
    const gridFilters = ref<Record<string, Record<string, IGridSlicingFilter>>>(
      {}
    );
    const gridItemsPerPage = ref<number>(20);
    const gridSort = ref<ISort[]>([]);
    const managerFilters = ref<
      Record<string, Record<string, IGridSlicingFilter>>
    >({});
    const managerItemsPerPage = ref(20);
    const managerSort = ref<ISort[]>([]);
    const hasFavourites = ref(false);
    const showFavouriteScreen = ref(false);
    const favouriteController = favouriteManager(upvise);

    const gridColumnLayout = computed(() => getColumnsLayout());
    const fieldNameMap = computed(() => getFieldNameMap());
    const filtersForPresentColumns = computed(() =>
      Object.fromEntries(
        Object.entries(managerFilters.value).map(([group, values]) => [
          group,
          Object.fromEntries(
            Object.entries(values).filter(([f, _]) => fieldNameMap.value?.[f])
          ),
        ])
      )
    );

    onMounted(() => {
      favouriteController.fetch().then(() => {
        // TODO only set to true once all favourites have been fetched
        hasFavourites.value = true;
      });
    });

    const awaitingFavouriteResult = computed(() => {
      return !hasFavourites.value;
    });

    const currentRows = computed(() => {
      return gridRef.value?.dataTableRef?.processedData ?? [];
    });

    async function updateFavourite(favourite: IFavouriteRecord) {
      // currentFavouriteOperations.value++;
      await favouriteController.updateFavourite(favourite);
      // .then((result) => {
      //   favourites.value = result;
      //   currentFavouriteOperations.value--;
      // });
    }

    async function toggleFavourite() {
      console.log("x");
    }
    // favouriteController
    //   .toggleFavourite(toggleInfo.fav, toggleInfo.toggle)
    //   .then((result) => {
    //     favourites.value = result;
    //     currentFavouriteOperations.value--;
    //   );

    function closeFavouriteScreen() {
      showFavouriteScreen.value = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function gridOptionClicked(event: any, view: string) {
      currentView.value = view;
      const option = document.getElementsByClassName("grid-toggle-option");
      for (let i = 0; i < option.length; i++) {
        option[i].classList.remove("selected");
      }

      event.currentTarget.classList.add("selected");
    }

    function getfilteredRows(event: unknown) {
      emit("filteredValue", event);
    }

    function groupedItemClick(
      action: string,
      groupName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemId: string,
      parentId: string
    ) {
      emit("groupedItemClick", action, groupName, itemId, parentId);
    }

    function save(currentGroupType: string, item: IRecord) {
      emit("save", currentGroupType, item);
    }

    function itemClick(event: unknown) {
      emit("itemClick", event);
    }

    function updateFiltersArray(
      filters: Record<string, Record<string, IGridSlicingFilter>>
    ) {
      if (JSON.stringify(managerFilters.value) != JSON.stringify(filters))
        managerFilters.value = filters;
    }

    function updateItemsPerPage(itemsPerPage: number) {
      if (managerItemsPerPage.value != itemsPerPage)
        managerItemsPerPage.value = itemsPerPage;
    }

    function updateSortArray(sort: ISort[]) {
      if (JSON.stringify(managerSort.value) != JSON.stringify(sort))
        managerSort.value = sort;
    }

    function headerActionClicked(action: string) {
      if (action == "favouriteScreen") {
        showFavouriteScreen.value = true;
      }
      emit("headerActionClicked", action);
    }

    function saveToUpvise(data: IRecord[]) {
      emit("saveToUpvise", data);
    }

    function getRowsShown(event: any) {
      //console.log(event);
      emit("rowsShown", event as Record<string, any>);
    }

    const gridRef = ref();
    const rowsSelected = ref();
    //Returns all rows in the grid in the format {row: Record<string,any>, group: string}
    function getAllSelectedRows() {
      rowsSelected.value =
        gridRef.value === null ? [] : gridRef.value.getSelectedRows();
      return gridRef.value === null ? [] : gridRef.value.getSelectedRows();
    }

    function clearSelectedRows() {
      if (gridRef.value) {
        gridRef.value.clearSelectedRows();
      }
    }

    watch(rowsSelected, () => {
      emit("rowsSelected", rowsSelected.value);
    });

    function getCurrentItems() {
      return gridRef.value === null ? [] : gridRef.value.getCurrentItems();
    }

    function getColumnsLayout() {
      const columns = {} as Record<string, Record<string, number>>;
      const upviseDataMessage = JSON.parse(
        JSON.stringify(props.upviseDataMessage)
      ) as IUpviseDataMessage;
      const grouping = upviseDataMessage.definition?.Grouping;
      if (grouping) {
        Object.values(grouping).forEach((groupDetail: IGroupDetail) => {
          let newEntry: Record<string, number> = {};
          const schema =
            upviseDataMessage.persistence[groupDetail.Type]?.Schema;
          schema
            .filter((column: IColumnMetadata) => !column.Hidden)
            .forEach((column: IColumnMetadata) => {
              newEntry[column.InternalName as string] =
                column.DisplayOrderIndex ?? 0;
            });

          columns[groupDetail.Type] = newEntry;
        });
      }

      return columns;
    }

    function getFieldNameMap() {
      const map = {} as Record<string, string>;
      const upviseDataMessage = JSON.parse(
        JSON.stringify(props.upviseDataMessage)
      ) as IUpviseDataMessage;
      const grouping = upviseDataMessage.definition?.Grouping;
      if (grouping) {
        Object.values(grouping).forEach((groupDetail: IGroupDetail) => {
          const schema =
            upviseDataMessage.persistence[groupDetail.Type]?.Schema;
          schema
            .filter((column: IColumnMetadata) => !column.Hidden)
            .forEach((column: IColumnMetadata) => {
              map[utils.getFieldName(column)] = column.InternalName as string;
            });
        });
      }

      return map;
    }

    watchEffect(() => {
      emit("currentRowsChanged", currentRows.value);
    });

    return {
      currentView,
      gridColumnLayout,
      gridFilters,
      gridItemsPerPage,
      gridSort,
      managerFilters,
      filtersForPresentColumns,
      managerItemsPerPage,
      managerSort,
      props,
      favManagerRef,
      gridOptionClicked,
      getfilteredRows,
      groupedItemClick,
      save,
      itemClick,
      headerActionClicked,
      saveToUpvise,
      gridRef,
      rowsSelected,
      getAllSelectedRows,
      clearSelectedRows,
      getCurrentItems,
      getRowsShown,
      hasFavourites,
      showFavouriteScreen,
      awaitingFavouriteResult,
      updateFavourite,
      toggleFavourite,
      closeFavouriteScreen,
      updateItemsPerPage,
      updateFiltersArray,
      updateSortArray,

      currentRows,
    };
  },
});

export default DashboardOverview;
</script>

<template>
  <div class="overview">
    <!--    <div class="row-spacer"></div>-->

    <custom-spinner v-if="isLoading"></custom-spinner>

    <div class="header-row">
      <header-actions
        class="header-actions"
        :upvise-data-message="upviseDataMessage"
        :action-buttons="headerActionButtons"
        :use-favourite-manager="hasFavourites"
        :use-column-picker="useColumnPicker"
        :show-file-export="showFileExport"
        :show-file-import="showFileImport"
        :upload-successful="uploadSuccessful"
        :show-favourite-manager-loading="awaitingFavouriteResult"
        :export-filter="exportFilter"
        :custom-import-message="customImportMessage"
        @actionClicked="headerActionClicked"
        @saveToUpvise="saveToUpvise"
      >
        <template #actionsLeft
          ><slot name="header-actions-left"></slot
        ></template>
        <template #actionsMiddle
          ><slot name="header-actions-middle"></slot
        ></template>
      </header-actions>
    </div>

    <header-summary
      v-if="showHeaderToggle"
      class="header-summary"
      :hideMiddleGroup="hideCenterHeader"
      :enable-left-and-right="showLeftRightHeader"
      :enable-white-background="enableHeaderSummaryBackground"
    >
      <template #top><slot name="header-top"></slot></template>
      <template #left><slot name="header-left"></slot></template>
      <template #middle><slot name="header-middle"></slot></template>
      <template #right><slot name="header-right"></slot></template>
      <template #bottom><slot name="header-bottom"></slot></template>
    </header-summary>

    <div v-if="informationCards" style="display: flex">
      <div
        v-for="(infoCard, index) in informationCards"
        :key="index"
        class="info-card-container"
      >
        <InformationCard
          :valueText="infoCard.count"
          :description="infoCard.label"
          :icon="infoCard.icon"
          :textColour="infoCard.textColour"
          :backgroundColour="infoCard.backgroundColour"
          :shadowColour="infoCard.shadowColour"
        />
      </div>
    </div>

    <div class="grid-options">
      <search-query
        v-if="false"
        class="search-query"
        :upviseDataMessage="upviseDataMessage"
      ></search-query>

      <div v-if="showViewToggle" class="grid-toggle">
        <template
          v-for="(option, index) of viewToggleOptions"
          :key="option + index"
        >
          <div
            :class="{ selected: currentView === option }"
            class="grid-toggle-option"
            @click="currentView = option"
          >
            {{ option.toUpperCase() }}
          </div>
        </template>
      </div>
    </div>

    <view-grid
      ref="gridRef"
      class="view-grid"
      :title="title"
      v-if="currentView === 'data'"
      :upviseDataMessage="upviseDataMessage"
      :items-per-page="managerItemsPerPage"
      :slicing-information="slicingInformation"
      :parent-id="parentId"
      :force-show-add="forceShowAdd"
      :force-show-details="forceShowDetails"
      :edit-on-click="editOnClick"
      :tick-icon-field="tickIconField"
      :remove-add="removeAdd"
      :sort-information="managerSort"
      :filters-information="filtersForPresentColumns"
      :show-tabs="showTabs"
      :disable-tick="disableTick"
      :custom-row-colours="customRowColours"
      :colour-theme="colourTheme"
      :start-expanded="startExpanded"
      :hide-childless-parents="hideChildlessParents"
      :removeDetailsButton="removeDetailsButton"
      :excluded-level="excludedLevel"
      :removeNameColumnMinWidth="removeNameColumnMinWidth"
      :fixedTableWidth="fixedTableWidth"
      :module-name="moduleName"
      @rowsShown="getRowsShown"
      @filteredValues="getfilteredRows"
      @groupedItemClick="groupedItemClick"
      @save="save"
      @filtersUpdated="updateFiltersArray"
      @itemsPerPageUpdated="updateItemsPerPage"
      @sortUpdated="updateSortArray"
      @trigerSelectedRows="getAllSelectedRows"
      ><template #gridActionsMiddle
        ><slot name="grid-actions-middle"></slot></template
    ></view-grid>

    <view-chart
      class="view-chart"
      v-if="currentView === 'chart'"
      :upviseDataMessage="upviseDataMessage"
      :parent-id="parentId"
      @groupedItemClick="groupedItemClick"
    ></view-chart>

    <view-timeline
      class="view-timeline"
      v-if="currentView === 'timeline'"
      :upviseDataMessage="upviseDataMessage"
      :parent-id="parentId"
      :is-projects-timeline="isProjectsTimeline"
      @groupedItemClick="groupedItemClick"
    ></view-timeline>

    <div class="row-spacer"></div>
    <favourite-manager
      ref="favManagerRef"
      :show-screen="showFavouriteScreen"
      :awaiting-response="awaitingFavouriteResult"
      :upvise-data-message="upviseDataMessage"
      :column-layout="gridColumnLayout"
      :filters-array="filtersForPresentColumns"
      :itemsPerPage="managerItemsPerPage"
      :sort-array="managerSort"
      :enabled="hasFavourites"
      :module-name="moduleName"
      @updateItemsPerPage="updateItemsPerPage"
      @updateFiltersArray="updateFiltersArray"
      @updateSortArray="updateSortArray"
      @closeFavouriteManager="closeFavouriteScreen"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.overview {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  background-color: $grey4;
  min-width: 900px;
  padding-top: 24px;

  .header-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1 1 auto;
    flex-wrap: wrap;
    padding: 0 24px 24px 24px;

    .header-title {
      font-weight: 600;
      font-size: 32px;
    }

    .header-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex: 1 1 auto;
    }
  }

  .header-summary {
    margin: 0 24px 24px 24px;
  }

  .grid-options {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1 1 auto;
    margin: 0 24px -44px 24px;
    padding-top: 10px;
    padding-bottom: 10px;
    height: 44px;

    .search-query {
      margin-right: 12px;
    }

    .grid-toggle {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 24px;
      box-shadow: 0 0 0 1px $grey8 inset;
      border-radius: 8px;
      margin-left: 24px;

      .grid-toggle-option {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1 1 auto;
        height: 100%;
        width: 50px;
        font-size: 8px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;

        &.selected {
          color: $white;
          background-color: $blue;
        }
      }
    }
  }

  .view-grid,
  .view-timeline,
  .view-chart {
    margin: 0 24px 24px 24px;
  }

  .row-spacer {
    display: flex;
    flex: 1 1 auto;
    height: 0;
  }

  .info-card-container {
    box-sizing: content-box;
    width: 160px;
    height: 80px;
    padding: 0 8px;

    &:first-child {
      padding-left: 24px;
    }

    &:last-child {
      padding-right: 0;
    }
  }
}
</style>
