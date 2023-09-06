<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
// import SpecialisedDisplay from "../display/SpecialisedDisplay.vue";
// import moment from "moment-timezone";
import {
  IColumnMetadata,
  IRecord,
  IUpviseDataMessage,
  IGridSlicingFilter,
  ISort,
  ITable,
  IGridSlicing,
} from "../../store/modules/upvise.d";
import FilterBuilder from "../../components/filter/builder.vue";
import DisplayStyle from "../../../cloudconLibrary/components/display/style.vue";
import DataTable from "primevue/datatable";
import Button from "primevue/button";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
  onMounted,
  onUnmounted,
  watchEffect,
  nextTick,
} from "vue";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import moment from "moment";
import userDetails from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import utils from "../../use/function/useUtils";
import useControllerWorkshopColour from "../../use/function/workshopColour";
import useSlicingFilter from "../../use/utils/useSlicingFilter";
import FeedbackFilter from "../../components/filter/feedbackFilter.vue";
import FilterMenuInputs from "../../components/filter/filterMenuInputs.vue";
import { ClaimsType } from "../../../cloudconLibrary/utilities/useConstants";

export const ViewGrid = /*#__PURE__*/ defineComponent({
  name: "ViewGrid",
  components: {
    DataTable,
    Button,
    Column,
    FilterBuilder,
    DisplayStyle,
    ProgressSpinner,
    FeedbackFilter,
    FilterMenuInputs,
  },
  props: {
    moduleName: {
      type: String,
      required: true,
      default: "",
    },
    disableTick: {
      type: Boolean,
      required: false,
      default: false,
    },
    title: {
      type: String,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    level: {
      type: Number,
      required: false,
      default: 0,
    },
    currentGroupLevel: {
      type: Number,
      required: false,
      default: 0,
    },
    parentId: {
      type: String,
      required: false,
    },
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    sortBy: {
      type: String,
      required: false,
    },
    sortOrder: {
      type: Number,
      required: false,
    },
    itemsPerPage: {
      type: Number,
      required: false,
      default: 20,
    },
    page: {
      type: Number,
      required: false,
      default: 1,
    },
    startExpanded: {
      type: Boolean,
      required: false,
      default: false,
    },
    idPathString: {
      type: String,
      required: false,
      default: "",
    },
    columnsFromParent: {
      type: Object as () => IColumnMetadata,
      required: false,
    },
    columnWidthsFromParent: {
      type: Array as PropType<number[]>,
      required: false,
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
      type: Object as () => Record<string, Record<string, unknown>[]>,
      required: false,
    },
    sortInformation: {
      type: Object as () => ISort[],
      required: false,
      default: () => [] as ISort[],
    },
    filtersInformation: {
      type: Object as () => Record<string, Record<string, IGridSlicingFilter>>,
      required: false,
      default: () => ({} as Record<string, Record<string, IGridSlicingFilter>>),
    },
    showTabs: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentTabProp: {
      type: String,
      required: false,
      default: "",
    },
    customRowColours: {
      type: Object as () => { using: boolean; level: string },
      required: false,
    },
    parentReflectiveName: {
      type: String,
      required: false,
      default: null,
    },
    colourTheme: {
      type: Object as () => Record<string, string>,
      required: false,
      default: function () {
        return {
          primaryBackground: "#007FFF",
          primaryText: "#FFFFFF",
        };
      },
    },
    hideChildlessParents: {
      type: Boolean,
      required: false,
      default: false,
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
  },
  setup: function (props: Record<string, any>, { emit }) {
    // const loading = ref(true);
    const level = ref(props.level);
    const colourThemePrimaryBackground = ref(
      props.colourTheme?.primaryBackground ?? "#007FFF"
    );
    const colourThemePrimaryText = ref(
      props.colourTheme?.primaryText ?? "#FFFFFF"
    );
    const currentGroupLevel = ref(props.currentGroupLevel);
    // const upviseDataMessage = ref(props.upviseDataMessage);
    const updatedIdPathString = ref(props.idPathString + props.parentId + "|");
    const checkForChildren = ref(props.hideChildlessParents);
    const rowsPerPageArray = ref([1, 20, 50, 100, 200]);
    const rowsPerPage = ref(props.itemsPerPage);
    const dataTableRef = ref();
    const colourController = useControllerWorkshopColour();
    const slicingFilterController = useSlicingFilter();
    const usedColours = ref([] as string[]);
    const useCustomRowColours = ref(false);
    const customRowColourField = ref("");

    const columnWidths = ref<number[]>();

    const expandedRows = ref<any[]>([]);
    const selectedRows = ref([]);
    const expandedChevronElements = ref<Record<string, any>>({});
    const isFirstTabSelected = ref(true);

    const globalFilter = ref<Record<string, unknown>>({});
    const multiSortArray = ref(props.sortInformation);
    const shouldStartExpanded = ref(props.startExpanded);
    const currentTab = ref(props.currentTabProp);
    const currentSlice = ref<IGridSlicing | null>(null);
    const currentFiltersWithoutSlice = ref<Record<string, IGridSlicingFilter>>(
      {}
    );

    let subTableRefs: { [index: string]: unknown } = {};
    let subTableSameGroupRefs: { [index: string]: unknown } = {};

    const filterDateOperations = [
      FilterMatchMode.DATE_IS,
      FilterMatchMode.DATE_IS_NOT,
      FilterMatchMode.DATE_BEFORE,
      FilterMatchMode.DATE_AFTER,
    ];

    const claimsAvailable = computed(() => {
      return {
        create: ClaimsType.RESTRICTED,
        read: ClaimsType.RESTRICTED,
        update: ClaimsType.RESTRICTED,
        delete: ClaimsType.RESTRICTED,
      };
    });

    onMounted(() => {
      updateEmptyFilters();
      // updateRowData();

      if (shouldStartExpanded.value) {
        expandAllRows();
      }

      if (props.customRowColours) {
        usedColours.value = colourController.activeColours();
        useCustomRowColours.value = props.customRowColours.using;
        customRowColourField.value = props.customRowColours.level;
      }

      setColumnWidths();
      window.addEventListener("resize", setColumnWidths);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", setColumnWidths);
    });

    console.log("props", claimsAvailable.value);
    const lookupsTable = computed(() => {
      const lookupTable: IRecord[] = [];
      return lookupTable ? lookupTable : null;
    });

    const grouping = computed(() => {
      return props.upviseDataMessage.definition?.Grouping || {};
    });

    const slicingGroups = computed(() => {
      return props.upviseDataMessage.definition?.Slicing || {};
    });

    const currentGroupName = computed((): string => {
      return grouping.value[currentGroupLevel.value]?.Name || "";
    });

    const currentGroupType = computed((): string => {
      return grouping.value[currentGroupLevel.value]?.Type || "";
    });

    const currentGroupLookup = computed((): string => {
      return grouping.value[currentGroupLevel.value]?.LookupKey || "";
    });

    const parentGroupType = computed((): string => {
      return props.level > 0
        ? grouping.value[currentGroupLevel.value - 1]?.Type
        : null;
    });

    const parentGroupLookup = computed((): string => {
      return props.level > 0
        ? grouping.value[currentGroupLevel.value - 1]?.LookupKey
        : null;
    });

    const childHasBaseType = computed((): boolean => {
      return !!grouping.value[currentGroupLevel.value + 1]?.BaseType;
    });

    const doRemoveDetailsButton = computed((): boolean => {
      if (props.removeDetailsButton?.[currentGroupLevel.value] === true)
        return true;
      return false;
    });

    const setNameColumnMinWidth = computed((): boolean => {
      if (props.removeNameColumnMinWidth?.[currentGroupType.value] === true)
        return false;
      return true;
    });

    const currentItems = computed(() => {
      const tableName =
        props.upviseDataMessage.persistence[currentGroupType.value]?.Location
          .Name || null;
      //console.log(tableName);
      if (tableName == null) return;

      var tableData = [] as ITable;

      //CHECK PREVIOUS GROUP LEVEL TO
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      // loading.value = false;
      let splitIdPathString: string[] = props.idPathString.split("|");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let filteredTable = tableData
        .filter((row: Record<string, any>) => {
          if (
            reflectiveName.value &&
            row[`${currentGroupLookup.value}id`] &&
            tableData.some(
              (r: Record<string, any>) =>
                r.id !== props.parentId &&
                r.id === row[`${currentGroupLookup.value}id`]
            )
          )
            return false;
          if (!row || splitIdPathString.includes(row.id)) return false;

          return parentGroupLookup.value == null
            ? props.level === props.currentGroupLevel
              ? row
              : row[`${currentGroupLookup.value}id`] === props.parentId
            : row[`${parentGroupLookup.value}id`] === props.parentId ||
                row[`${currentGroupLookup.value}id`] === props.parentId;
        })
        .filter(utils.IsActive);

      if (
        checkForChildren.value &&
        grouping.value[currentGroupLevel.value + 1]?.Type
      ) {
        const childSlicing =
          (props.slicingInformation[
            grouping.value[currentGroupLevel.value + 1]?.Type
          ].find(
            (s: IGridSlicing) => s.displayName === currentTab.value
          ) as IGridSlicing) ||
          (props.slicingInformation[
            grouping.value[currentGroupLevel.value + 1]?.Type
          ][0] as IGridSlicing) ||
          null;

        let childData = [] as IRecord[];

        if (childSlicing)
          childData = childData.filter((data) =>
            slicingFilterController.applySliceFilter(
              data,
              childSlicing.filtersToApply
            )
          );

        filteredTable = filteredTable.filter((row) =>
          hasChildren(row.id as string, childData)
        );
      }

      const userName = userDetails.getUserDetails()?.user?.name ?? "";
      console.log("filtered table", filteredTable);
      switch (claimsAvailable.value?.read) {
        case ClaimsType.LIMITED_RESTRICTION:
          if (filteredTable.length > 0 && "owner" in filteredTable[0])
            filteredTable = filteredTable.filter(
              (record) => record.owner === userName || record.owner === ""
            );
          break;
        case ClaimsType.RESTRICTED:
          filteredTable = [];
          break;
      }

      return formatTableData(filteredTable).sort((a, b) => {
        if (
          "rank" in a &&
          "rank" in b &&
          typeof a.rank === "number" &&
          typeof b.rank === "number"
        )
          return a.rank - b.rank;
        else return 0;
      });
    });

    const columns = computed(() => {
      const schema =
        props.upviseDataMessage.persistence[currentGroupType.value]?.Schema;
      return Object.values((schema as Record<string, IColumnMetadata>) || {})
        ?.filter(
          (column: IColumnMetadata) =>
            column.Label != null && !column.Hidden && column.IsVisible
        )
        .sort((a: IColumnMetadata, b: IColumnMetadata) =>
          (a?.DisplayOrderIndex || 0) > (b?.DisplayOrderIndex || 0) ? 1 : -1
        );
    });

    const reflectiveName = computed(() => {
      return grouping.value[currentGroupLevel.value]
        ? grouping.value[currentGroupLevel.value].ReflectiveName
        : null;
    });

    const hasBaseType = computed(() => {
      return !!grouping.value[currentGroupLevel.value].BaseType;
    });

    const sliceFilters = computed((): Record<string, IGridSlicingFilter> => {
      return currentSlice.value && "filtersToApply" in currentSlice.value
        ? currentSlice.value["filtersToApply"]
        : {};
    });

    // Only going to filter over the visible columns
    const globalFilterArray = computed(() => {
      if (columns.value != undefined) {
        return columns?.value.map(function (item: IColumnMetadata) {
          return getFieldName(item);
        });
      }
      return [];
    });

    const sortDisabled = computed(() => {
      let sortDisabled = false;
      if (props.sortOrder === -1) {
        sortDisabled = true;
      }
      return sortDisabled;
    });

    const sortOrderValue = computed(() => {
      let sortOrderValue = true;
      if (props.sortOrder === 0) {
        sortOrderValue = false;
      }
      return sortOrderValue;
    });

    const tableClass = computed(() => {
      return props.parentId ? "table-" + props.parentId : "table-main";
    });

    function hasChildren(id: string, childData: IRecord[]): boolean {
      return childData.some(
        (data) => data[`${currentGroupLookup.value}id`] === id
      );
    }

    function getParameterCaseInsensitive(
      object: Record<string, any>,
      key: string
    ) {
      return object[
        Object.keys(object).filter(function (k) {
          return k.toLowerCase() === key.toLowerCase();
        })[0]
      ];
    }

    function getFieldName(c: IColumnMetadata) {
      return c.IsCustom
        ? utils.getCustomFieldName(c.InternalName as string, c.Title)
        : c.InternalName || "";
    }

    function showFilterMatchModes(c: IColumnMetadata) {
      if (
        c.Style === "progressStatusCellColour" ||
        c.Style === "progressStatusText"
      )
        return false;
      else return true;
    }

    // convert all date fields into date objects
    function formatTableData(table: ITable) {
      const dateFields = (
        props.upviseDataMessage as IUpviseDataMessage
      )?.persistence[currentGroupType.value]?.Schema.filter(
        (c: IColumnMetadata) =>
          c.RawType === "date" || c.RawType === "datetime" || c.Style === "date"
      ).map((c: IColumnMetadata) => {
        return getFieldName(c);
      });

      if (dateFields)
        dateFields.forEach((f) => {
          if (f)
            table.forEach((d) => {
              if (d[f] || d[f] == 0) d[f] = utils.getDate(d[f] as string);
            });
        });

      return table;
    }

    function obtainColumnDataType(column: IColumnMetadata) {
      switch (column.RawType?.toLowerCase()) {
        case "date":
        case "datetime":
          return "date";
        case "boolean":
          return "boolean";
        case "number":
        case "integer":
        case "decimal":
          if (column.Style === "date") return "date";
          else return "numeric";
        case "string":
        case "text":
        case "textarea":
        case "user":
          if (column.Style === "date") return "date";
          else return "text";
        default:
          return "text";
      }
    }

    function applySlice(slice: IGridSlicing) {
      //Need to remove current filters
      if (currentSlice.value && currentSlice.value !== slice) {
        Object.keys(currentSlice.value.filtersToApply).forEach(
          (key: string) => {
            delete globalFilter.value[key];
          }
        );
      }
      currentSlice.value = slice;
      //console.log(globalFilter);
      //console.log(currentSlice);
    }

    function allowFiltering(column: IColumnMetadata) {
      //Preventing filtering on table with subtables
      if (notLowestGroup() || level.value > 0) return false;
      if (currentSlice.value) {
        return !(currentSlice.value?.fieldNames as string[]).includes(
          getFieldName(column)
        );
      }
      return true;
    }

    function getCurrentFiltersWithoutSlice() {
      const returnFilter = JSON.parse(JSON.stringify(globalFilter.value));
      if (currentSlice.value) {
        Object.keys(
          currentSlice.value.filtersToApply as Record<string, unknown>
        ).forEach((key: string) => {
          delete returnFilter[key];
        });
      }
      for (const key of Object.keys(returnFilter)) {
        if (
          (
            returnFilter[key as string] as IGridSlicingFilter
          ).constraints.filter(
            (entry: { value: unknown; matchMode: string | undefined }) =>
              entry.value !== null
          ).length == 0
        ) {
          delete returnFilter[key];
        }
      }
      const returnObject: Record<string, unknown> = {};
      returnObject[currentGroupType.value] = returnFilter;
      currentFiltersWithoutSlice.value = returnFilter;
      return returnObject;
    }

    function getDefaultFilter(column: IColumnMetadata) {
      switch (obtainColumnDataType(column)) {
        case "text":
          return {
            operator: FilterOperator.AND,
            constraints: [
              {
                value: null,
                matchMode: FilterMatchMode.CONTAINS,
              },
            ],
          };
        case "date":
          return {
            operator: FilterOperator.AND,
            constraints: [
              {
                value: null,
                matchMode: FilterMatchMode.DATE_IS,
              },
            ],
          };
        case "boolean":
          return {
            operator: FilterOperator.AND,
            constraints: [
              {
                value: null,
                matchMode: FilterMatchMode.EQUALS,
              },
            ],
          };
        case "numeric":
          return {
            operator: FilterOperator.AND,
            constraints: [
              {
                value: null,
                matchMode:
                  column.Style === "progressStatusCellColour" ||
                  column.Style === "progressStatusText"
                    ? FilterMatchMode.IN
                    : FilterMatchMode.EQUALS,
              },
            ],
          };
        default:
          return {
            operator: FilterOperator.AND,
            constraints: [
              {
                value: null,
                matchMode: FilterMatchMode.CONTAINS,
              },
            ],
          };
      }
    }

    function updateEmptyFilters() {
      if (Array.isArray(columns.value)) {
        columns.value.forEach((column: IColumnMetadata) => {
          let filterName = getFieldName(column);
          if (typeof filterName == "string" && filterName != "") {
            if (!globalFilter.value[filterName]) {
              globalFilter.value[filterName] = getDefaultFilter(column);
              // if (column.type === "boolean") globalFilter.value[filterName] = constraints[0]
              Object.assign(globalFilter.value, sliceFilters.value);
            }
          }
        });
      }
    }

    function resetFilters() {
      globalFilter.value = {};
      columns.value.forEach((column: IColumnMetadata) => {
        let filterName = getFieldName(column);
        if (typeof filterName == "string") {
          globalFilter.value[filterName] = getDefaultFilter(column);
          // if (column.type === "boolean") globalFilter.value[filterName] = constraints[0]
          Object.assign(globalFilter.value, sliceFilters.value);
        }
      });
    }

    function rowClass(data: IRecord) {
      return `row-${currentGroupType.value}-${data.id}`;
    }

    function getDatesTooltip(row: Record<string, any>) {
      return (
        moment(row.startdate).format("DD MMM YYYY") +
        " - " +
        moment(row.enddate).format("DD MMM YYYY")
      );
    }

    function iconClicked(_: any, row: IRecord) {
      if (props.tickIconField && props.tickIconField in row) {
        const dataToSave: IRecord = { id: row.id };

        if (row[props.tickIconField] === 0) dataToSave[props.tickIconField] = 1;
        else dataToSave[props.tickIconField] = 0;

        emit("save", currentGroupType.value, dataToSave);
      }
    }

    function tabClicked(event: any, slice: IGridSlicing, index: number) {
      const oldTabName = currentTab.value;
      const option = document.getElementsByClassName("tab");

      for (let i = 0; i < option.length; i++) {
        option[i].classList.remove("selected");
      }

      event.currentTarget.classList.add("selected");
      currentTab.value = slice.displayName;
      applySlice(slice);

      isFirstTabSelected.value = index === 0 ? true : false;

      if (props.startExpanded && oldTabName !== slice.displayName)
        nextTick(expandRecursive);
    }

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      emit("groupedItemClick", action, groupName, itemId, parentId);
    }

    function itemClick(event: any) {
      emit(
        "groupedItemClick",
        "Add",
        currentGroupType.value,
        event.data.id,
        ""
      );
    }

    function getFilteredRows(event: any) {
      emit("filteredValues", event.filteredValue);
    }
    function onSort(event: any) {
      // console.log("on sort", event.multiSortMeta)
      multiSortArray.value = event.multiSortMeta;
      emit("sortUpdated", multiSortArray.value);
    }

    function onPage(event: number) {
      if (rowsPerPage.value === event) return;
      // console.log("on rowsperpage", event)
      rowsPerPage.value = event;
      emit("itemsPerPageUpdated", rowsPerPage.value);
    }

    function onFilter() {
      // console.log("on filter", getCurrentFiltersWithoutSlice())
      emit("filtersUpdated", getCurrentFiltersWithoutSlice());
    }

    function notLowestGroup() {
      return !!grouping.value[currentGroupLevel.value + 1];
    }

    function excludeLevelChevron() {
      return props.excludedLevel ? props.excludedLevel === level.value : false;
    }

    function getRemoveAdd() {
      if (!props.removeAdd || !currentItems.value) return false;

      for (const element of props.removeAdd) {
        if (element.currentGroupType !== currentGroupType.value) continue;

        for (const item of currentItems.value) {
          if (item[element.field] === element.value) return true;
        }
      }

      return false;
    }

    function hideHeader() {
      return (
        level.value > 0 && (currentGroupLevel.value === 0 || hasBaseType.value)
      );
    }

    //Functions for expanding and collapsing tabs here
    function expandAllRows() {
      if (!currentItems.value) return;
      expandedRows.value = currentItems.value;
    }

    function collapseAllRows() {
      shouldStartExpanded.value = false;
      expandedRows.value = [];
    }

    function expandRecursive() {
      shouldStartExpanded.value = true;
      expandAllRows();
      for (let entry of Object.entries(subTableRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          (entry[1] as unknown as typeof ViewGrid).expandRecursive();
      }
      for (let entry of Object.entries(subTableSameGroupRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          (entry[1] as unknown as typeof ViewGrid).expandRecursive();
      }
    }

    function onRowCollapse() {
      shouldStartExpanded.value = false;
    }

    function addSubTableRef(el: unknown, dataId: string, level: number) {
      switch (level) {
        case 0:
          subTableSameGroupRefs[dataId] = el;
          break;
        case 1:
          subTableRefs[dataId] = el;
          break;
      }
    }

    // set column widths array (currently called when window is resized or columns change)
    function setColumnWidths() {
      if (props.columnWidthsFromParent) {
        columnWidths.value = JSON.parse(
          JSON.stringify(props.columnWidthsFromParent)
        );
      } else {
        const headers = document.getElementsByClassName(
          tableClass.value + "-header-cell"
        );

        if (headers && headers.length !== 0)
          columnWidths.value = ([...headers] as HTMLElement[]).map(
            (e) => e.offsetWidth
          );
      }
    }

    // Add "expanded" class depending on expanded rows
    function updateExpandedChevronElements() {
      const expandedRowsId = expandedRows.value.map((e) => e.id);
      Object.entries(expandedChevronElements.value).forEach(
        ([key, element]) => {
          if (
            element?.classList !== undefined &&
            element?.parentNode?.parentNode?.parentNode?.classList !== undefined
          ) {
            if (expandedRowsId.includes(key)) {
              element.classList.add("expanded");
              element.parentNode.parentNode.parentNode.classList.add(
                "expanded"
              );
            } else {
              element.classList.remove("expanded");
              element.parentNode.parentNode.parentNode.classList.remove(
                "expanded"
              );
            }
          }
        }
      );
    }

    // update expanded rows data with data in current items
    function updateExpandedRows() {
      if (currentItems.value) {
        const expandedRowsId = expandedRows.value.map((e) => e.id);
        expandedRows.value = currentItems.value.filter((r) =>
          expandedRowsId.includes(r.id)
        );
      }
    }

    function toggleRow(row: any) {
      const expandedRowsId = expandedRows.value.map((e) => e.id);
      if (!expandedRowsId.includes(row.data.id)) {
        expandedRows.value.push(row.data);
      } else {
        expandedRows.value = expandedRows.value.filter(
          (r) => r.id !== row.data.id
        );
        onRowCollapse();
      }
    }

    function clearSelectedRows() {
      selectedRows.value = [];
      for (let entry of Object.entries(subTableRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          (entry[1] as unknown as typeof ViewGrid).clearSelectedRows();
      }
      for (let entry of Object.entries(subTableSameGroupRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          (entry[1] as unknown as typeof ViewGrid).clearSelectedRows();
      }
    }

    function getSelectedRows() {
      let currentSelectedRows = selectedRows.value.map(
        (entry: Record<string, any>) => {
          return { row: entry, group: currentGroupType.value };
        }
      );
      for (let entry of Object.entries(subTableRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          currentSelectedRows = currentSelectedRows.concat(
            (entry[1] as unknown as typeof ViewGrid).getSelectedRows()
          );
      }
      for (let entry of Object.entries(subTableSameGroupRefs)) {
        if (entry && entry.length >= 1 && entry[1])
          currentSelectedRows = currentSelectedRows.concat(
            (entry[1] as unknown as typeof ViewGrid).getSelectedRows()
          );
      }
      return currentSelectedRows;
    }

    function getCurrentItems() {
      return dataTableRef;
    }

    function getLookupTable() {
      return null;
      // Old code from before cache
      //return props.upviseDataMessage.persistence[internalName] || null;
    }

    function addExpandedChevronElement(e: unknown, id: string) {
      if (expandedChevronElements.value[id] && e) {
        if (shouldStartExpanded.value) {
          ((e as Record<string, unknown>).classList as Set<string>).add(
            "expanded"
          );
        }
      }
      expandedChevronElements.value[id] = e;
    }

    // convert date strings to date objects in filters
    function formatFilters(
      filters: Record<string, Record<string, IGridSlicingFilter>>
    ) {
      const copyFilters = JSON.parse(JSON.stringify(filters)) as Record<
        string,
        Record<string, IGridSlicingFilter>
      >;

      Object.values(copyFilters).forEach((t) => {
        Object.values(t).forEach((f) => {
          f.constraints.forEach((c) => {
            if (c.matchMode != undefined)
              if (filterDateOperations.includes(c.matchMode) && c.value)
                c.value = new Date(c.value as string);
          });
        });
      });

      return copyFilters;
    }

    function getTextClass(name?: string) {
      if (name)
        return [
          "table-data-text",
          currentGroupLevel.value === 0
            ? "dark-grey bold"
            : useCustomRowColours.value && !notLowestGroup()
            ? "black"
            : "",
        ];
      return [
        "table-data-text",
        useCustomRowColours.value && !notLowestGroup() ? "black" : "",
      ];
    }
    function getSelectOptions(col: IColumnMetadata) {
      if (col.SelectOptions) {
        return Object.values(col.SelectOptions).map((o) => ({ name: o }));
      } else return [];
    }

    function updateRowColours() {
      if (currentItems.value) {
        currentItems.value.forEach((record) => {
          const rowElements = [
            ...document.getElementsByClassName(
              `row-${currentGroupType.value}-${record.id}`
            ),
          ] as HTMLElement[];
          rowElements.forEach((e) => {
            if (record["_rowColour"] && useCustomRowColours.value)
              e.style.backgroundColor = "#" + record["_rowColour"];
            else e.style.backgroundColor = "transparent";
          });
        });
      }
    }

    function onSelectedRowsChange() {
      emit("trigerSelectedRows");
    }

    watchEffect(() => {
      if (
        currentGroupType.value &&
        props.slicingInformation &&
        Array.isArray(props.slicingInformation[currentGroupType.value])
      ) {
        if (currentTab.value) {
          const newSlice = props.slicingInformation[
            currentGroupType.value
          ].find((s: IGridSlicing) => s.displayName === currentTab.value);
          if (newSlice) applySlice(newSlice);
        } else
          currentSlice.value =
            props.slicingInformation[currentGroupType.value][0];
      }
    });

    watch(columns, () => {
      updateEmptyFilters();
    });

    watch(sliceFilters, () => {
      // console.log(
      //   "SLICE FILTERS CHANGED",
      //   currentGroupType.value,
      //   sliceFilters.value
      // );
      Object.assign(globalFilter.value, sliceFilters.value);
      updateEmptyFilters();
    });

    watch(currentItems, () => {
      updateExpandedRows();
      // updateRowData();
      //console.log(currentItems);
    });

    watch(
      () => props.filtersInformation,
      (newFilterInformation) => {
        if (
          newFilterInformation &&
          newFilterInformation[currentGroupType.value]
        ) {
          globalFilter.value =
            formatFilters(newFilterInformation)[currentGroupType.value];
          updateEmptyFilters();
        }
      }
    );

    watchEffect(() => {
      rowsPerPage.value = props.itemsPerPage;
    });

    watch(
      () => props.sortInformation,
      (newSortValues) => {
        multiSortArray.value = newSortValues;
      }
    );

    watch(
      columns,
      () => {
        setColumnWidths();
      },
      { flush: "post" }
    );

    watch(
      expandedRows,
      () => {
        updateExpandedChevronElements();
      },
      { deep: true, flush: "post" }
    );

    watch(
      () => props.currentTabProp,
      (newCurrentTab) => {
        currentTab.value = newCurrentTab;
      }
    );

    // watch(
    //   () => upvise.isFetchComplete,
    //   () => {
    //     if (shouldStartExpanded.value) expandAllRows();
    //   }
    // );

    watch(
      () => dataTableRef.value?.processedData,
      () => {
        emit("rowsShown", dataTableRef.value?.processedData);
      }
    ),
      watch(
        () => dataTableRef.value?.processedData,
        async () => {
          nextTick(updateRowColours);
        },
        { deep: true, flush: "post" }
      ),
      watch(selectedRows, () => {
        emit("trigerSelectedRows");
      });

    watch(selectedRows, () => {
      onSelectedRowsChange();
    });

    function onDeleteFilter(filterName: string) {
      delete globalFilter.value[filterName];
      updateEmptyFilters();
      onFilter();
    }

    // function onClearAllFilters() {
    //   for (var key in globalFilter.value) {
    //     delete globalFilter.value[key];
    //   }
    //   updateEmptyFilters();
    //   onFilter();
    // }

    watch(globalFilter, () => {
      onFilter();
    });

    return {
      ClaimsType,
      claimsAvailable,
      props,
      colourThemePrimaryBackground,
      colourThemePrimaryText,
      // loading: ref(props.loading),
      columnWidths,
      rowsPerPage,
      tableClass,
      toggleRow,
      lookupsTable,
      grouping,
      currentItems,
      columns,
      expandedRows,
      selectedRows,
      expandedChevronElements,
      isFirstTabSelected,
      shouldStartExpanded,
      sliceFilters,
      currentSlice,
      currentTab,
      slicingGroups,
      currentGroupName,
      currentGroupType,
      childHasBaseType,
      doRemoveDetailsButton,
      setNameColumnMinWidth,
      parentGroupType,
      getFieldName,
      showFilterMatchModes,
      obtainColumnDataType,
      allowFiltering,
      resetFilters,
      applySlice,
      globalFilter,
      globalFilterArray,
      hasBaseType,
      dataTableRef,
      getParameterCaseInsensitive,

      // eslint-disable-next-line vue/no-dupe-keys
      level,
      // eslint-disable-next-line vue/no-dupe-keys
      currentGroupLevel,
      // eslint-disable-next-line vue/no-dupe-keys
      rowsPerPageArray,

      sortDisabled,
      sortOrderValue,

      rowClass,
      getDatesTooltip,
      iconClicked,
      tabClicked,
      groupedItemClick,
      itemClick,
      reflectiveName,

      expandAllRows,
      collapseAllRows,
      expandRecursive,
      addSubTableRef,
      onRowCollapse,
      updatedIdPathString,
      getFilteredRows,
      onSort,
      onPage,
      onFilter,
      multiSortArray,
      clearSelectedRows,
      getSelectedRows,
      notLowestGroup,
      excludeLevelChevron,
      // eslint-disable-next-line vue/no-dupe-keys
      getRemoveAdd,
      hideHeader,
      getCurrentItems,
      getLookupTable,
      addExpandedChevronElement,
      getSelectOptions,
      getNumFromBool: utils.getNumFromBool,
      getBoolFromNum: utils.getBoolFromNum,
      getCustomFieldName: utils.getCustomFieldName,
      utils,
      currentFiltersWithoutSlice,
      getCurrentFiltersWithoutSlice,
      getTextClass,

      currentGroupLookup,
      parentGroupLookup,
      onDeleteFilter,
      onSelectedRowsChange,
    };
  },
});

export default ViewGrid;
</script>

<template>
  <!-- {{ columnWidths }} -->
  <div v-if="currentItems && claimsAvailable.read > ClaimsType.RESTRICTED">
    <!-- Only for testing. Remove these buttons when copying code across-->
    <button v-show="false" @click="resetFilters">Reset Filters</button>
    <button v-show="false" @click="expandAllRows">Expand Rows</button>
    <button v-show="false" @click="collapseAllRows">Collapse Rows</button>
    <button v-show="false" @click="expandRecursive">Expand Recursive</button>
    <div class="grid-container">
      <div v-if="level === 0" class="tabs-group">
        <template v-if="showTabs && slicingInformation && currentGroupType">
          <div
            v-for="(slice, index) in slicingInformation[currentGroupType]"
            :key="slice.displayName"
            class="tab"
            :class="{
              selected: index === 0,
            }"
            @click="tabClicked($event, slice, index)"
          >
            <div class="tab-wrapper">
              <span class="tab-text">{{ slice.displayName }}</span>
            </div>
            <!--            <div class="tab-count">
              &lt;!&ndash; need to calculate tab count &ndash;&gt;
            </div>-->
          </div>
        </template>
      </div>

      <div
        class="data-table"
        :class="{
          'top-left-border-radius-none': showTabs && isFirstTabSelected,
        }"
      >
        <feedback-filter
          v-if="level == 0 && title != 'Planner'"
          :columns="columns"
          :filterData="currentFiltersWithoutSlice"
          @deleteFilter="onDeleteFilter"
          @clearAllFilters="resetFilters"
          class="filterbar"
        />
        <div v-if="level === -1" class="filter">
          <filter-builder></filter-builder>
        </div>

        <!-- <pre>{{ columns.map((col) => col.label) }}</pre> -->
        <data-table
          ref="dataTableRef"
          :class="{
            'table-header-hidden': hideHeader(),
            [tableClass]: true,
            'footer-border-bottom': level === 1 && currentGroupLevel === 1,
          }"
          :value="currentItems"
          :rows="rowsPerPage"
          :rowClass="rowClass"
          :rowsPerPageOptions="rowsPerPageArray"
          :reorderableColumns="false"
          responsiveLayout="scroll"
          :paginator="$props.level === 0"
          v-model:expandedRows="expandedRows"
          v-model:filters="globalFilter"
          filterDisplay="menu"
          :globalFilterFields="globalFilterArray"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          v-model:selection="selectedRows"
          @filter="getFilteredRows($event)"
          @rowCollapse="onRowCollapse"
          @sort="onSort($event)"
          @rowClick="
            notLowestGroup() || reflectiveName
              ? toggleRow($event)
              : editOnClick
              ? itemClick($event)
              : null
          "
          @update:rows="onPage($event)"
          removableSort
          sortMode="multiple"
          :multiSortMeta="multiSortArray"
        >
          <column
            selectionMode="multiple"
            columnKey="selection"
            frozen
            alignFrozen="right"
            :reorderableColumn="false"
            :headerClass="tableClass + '-header-cell'"
            :style="{
              'min-width': 75 + 'px',
              width: 75 + 'px',
              'align-self': 'flex-end',
              textAlign: 'right',
              position: 'sticky',
              'z-index': level,
            }"
          ></column>

          <column
            v-if="notLowestGroup() || columnWidthsFromParent || reflectiveName"
            :expander="true"
            columnKey="expander"
            :reorderableColumn="false"
            :headerClass="tableClass + '-header-cell'"
            :style="{
              width: '101px',
            }"
          >
            <template v-if="level === 0" #header>
              <div class="table-header-expand">
                <div
                  class="expand-button-div"
                  @click="expandRecursive"
                  v-tooltip.bottom="'Expand All Rows'"
                >
                  <font-awesome-icon
                    class="button-style-top"
                    :icon="['fa', 'chevron-up']"
                  />
                  <font-awesome-icon
                    class="button-style-bottom"
                    :icon="['fa', 'chevron-down']"
                  />
                </div>
                <div
                  class="expand-button-div"
                  @click="collapseAllRows"
                  v-tooltip.bottom="'Collapse All Rows'"
                >
                  <font-awesome-icon
                    class="button-style-top"
                    :icon="['fa', 'chevron-down']"
                  />
                  <font-awesome-icon
                    class="button-style-bottom"
                    :icon="['fa', 'chevron-up']"
                  />
                </div>
              </div>
            </template>
            <template #body="{ data }">
              <div
                v-if="
                  (notLowestGroup() || reflectiveName) && !excludeLevelChevron()
                "
                class="expander-container"
              >
                <div
                  class="expander"
                  :ref="
                    (e) => {
                      addExpandedChevronElement(e, data.id);
                    }
                  "
                >
                  <template v-for="i in level + 1" :key="i">
                    <font-awesome-icon
                      v-if="i < 5"
                      class="chevron-icon"
                      :icon="['fa', 'chevron-right']"
                    />
                  </template>
                </div>
              </div>
            </template>
          </column>

          <column
            v-for="(col, index) in columnsFromParent
              ? !reflectiveName && !hasBaseType
                ? columns
                : columnsFromParent
              : columns"
            :key="col.InternalName"
            :v-tooltip="col.TooltipValue"
            :columnKey="col.InternalName"
            :sortable="true"
            :dataType="obtainColumnDataType(col)"
            :field="getFieldName(col)"
            :showFilterMatchModes="showFilterMatchModes(col)"
            :hidden="col.Hidden"
            :headerClass="tableClass + '-header-cell'"
            :style="{
              width: columnWidthsFromParent
                ? columnWidthsFromParent[index + 1] + 'px'
                : '',
              'min-width':
                col.InternalName === 'name' && setNameColumnMinWidth
                  ? 300 + 'px'
                  : '',
            }"
            filterMenuClass="filter-menu-class"
          >
            <template #header>
              <div
                id="customHeader"
                v-tooltip.bottom="col.TooltipValue ?? col.Label"
                style="height:100%; padding-left: 30px; padding-right: 30px; text-align:center; z-index=-1;"
              >
                <span class="table-header-label">{{ col.Label }}</span>
              </div>
            </template>

            <template #body="{ data }">
              <div
                class="table-cell"
                :style="{
                  'padding-left':
                    col.InternalName === 'name' && columnWidthsFromParent
                      ? level * 12 + 6 + 'px'
                      : '',
                }"
              >
                <template
                  v-if="notLowestGroup() && col.InternalName === 'name'"
                >
                  <div
                    v-if="data[tickIconField] === -1"
                    class="check-icon-container"
                  >
                    <progress-spinner
                      class="tick-icon-spinner"
                      strokeWidth="1"
                    />
                  </div>
                  <div
                    v-else
                    class="check-icon-container"
                    @click.stop="iconClicked($event, data)"
                  >
                    <font-awesome-icon
                      v-if="!disableTick"
                      :class="{
                        'check-icon': true,
                        selected: data[tickIconField] === 1,
                      }"
                      :icon="['fa', 'check-circle']"
                    />
                  </div>
                  <display-style
                    :data="getParameterCaseInsensitive(data, col.InternalName)"
                    :type-specialisation="col.Style"
                    :class="getTextClass('name')"
                    style="text-align: start"
                  ></display-style>
                </template>

                <div
                  v-else-if="
                    col.InternalName === tickIconField &&
                    data[tickIconField] === -1
                  "
                >
                  <progress-spinner
                    class="table-cell-spinner"
                    strokeWidth="1"
                  />
                </div>

                <display-style
                  v-else-if="col.InternalName === 'duration'"
                  :data="getParameterCaseInsensitive(data, col.InternalName)"
                  :type-specialisation="col.Style"
                  :class="getTextClass()"
                  v-tooltip.top="getDatesTooltip(data)"
                ></display-style>

                <display-style
                  v-else-if="col.Style === 'currency'"
                  :data="getParameterCaseInsensitive(data, getFieldName(col))"
                  :type-specialisation="col.Style"
                  :currency="data.currency || null"
                  :class="getTextClass()"
                ></display-style>

                <display-style
                  v-else-if="col.Style === 'multiId'"
                  :data="getParameterCaseInsensitive(data, getFieldName(col))"
                  :type-specialisation="col.Style"
                  :type-options="lookupsTable"
                  :class="getTextClass()"
                ></display-style>

                <display-style
                  v-else-if="col.Style === 'processingStatusCellColour'"
                  :data="getParameterCaseInsensitive(data, getFieldName(col))"
                  :type-specialisation="col.Style"
                  :type-options="{
                    group: data.processingStatusGroup ?? 0,
                    status: data.status ?? 0,
                  }"
                  :class="getTextClass()"
                ></display-style>

                <display-style
                  v-else
                  :data="getParameterCaseInsensitive(data, getFieldName(col))"
                  :type-specialisation="col.Style"
                  :class="getTextClass()"
                ></display-style>
              </div>

              <div
                v-if="
                  col.InternalName === 'name' &&
                  data[props.tickIconField] !== -1 &&
                  !doRemoveDetailsButton &&
                  (notLowestGroup() ||
                    Object.keys(grouping).length === 1 ||
                    forceShowDetails)
                "
                class="details-button"
                @click.stop="
                  groupedItemClick(
                    'Edit',
                    currentGroupType,
                    data.id,
                    level === 0 ? '' : parentId
                  )
                "
              >
                <p class="details-text">Details</p>
              </div>
            </template>
            <template v-if="allowFiltering(col)" #filter="{ filterModel }">
              <FilterMenuInputs
                :column="col"
                :filterValue="filterModel.value"
                @filterValueChange="
                  (newValue) => (filterModel.value = newValue)
                "
              />
            </template>
            <template #filterclear="{ filterCallback }">
              <Button
                class="p-button p-component p-button-outlined p-button-sm"
                type="button"
                @click="
                  () => {
                    filterCallback();
                    onFilter();
                  }
                "
              >
                <span class="p-button-label">Clear</span>
              </Button>
            </template>
            <template #filterapply="{ filterCallback }">
              <Button
                class="p-button p-component p-button-sm"
                type="button"
                @click="
                  () => {
                    filterCallback();
                    onFilter();
                  }
                "
              >
                <span class="p-button-label">Apply</span>
              </Button>
            </template>
          </column>

          <template #expansion="{ data }">
            <template v-if="reflectiveName">
              <view-grid
                :level="level + 1"
                :current-group-level="currentGroupLevel"
                :title="title"
                :parent-id="data.id"
                :upvise-data-message="upviseDataMessage"
                :ref="(el) => addSubTableRef(el, data.id, 0)"
                :start-expanded="
                  currentGroupLevel < Object.keys(grouping).length - 1
                    ? shouldStartExpanded
                    : false
                "
                :id-path-string="updatedIdPathString"
                @groupedItemClick="groupedItemClick"
                @trigerSelectedRows="onSelectedRowsChange"
                :columnsFromParent="columns"
                :columnWidthsFromParent="columnWidths"
                :custom-row-colours="customRowColours"
                :slicing-information="slicingInformation"
                :current-tab-prop="currentTab"
                :colour-theme="colourTheme"
                :removeDetailsButton="removeDetailsButton"
                :excluded-level="excludedLevel"
                :removeNameColumnMinWidth="removeNameColumnMinWidth"
              ></view-grid>
            </template>
            <view-grid
              :level="level + 1"
              :current-group-level="currentGroupLevel + 1"
              :parent-id="data.id"
              :upvise-data-message="upviseDataMessage"
              :multi-sort-array-prop="multiSortArray"
              :ref="(el) => addSubTableRef(el, data.id, 1)"
              :start-expanded="
                currentGroupLevel + 1 < Object.keys(grouping).length - 1
                  ? shouldStartExpanded
                  : false
              "
              :id-path-string="updatedIdPathString"
              @groupedItemClick="groupedItemClick"
              @trigerSelectedRows="onSelectedRowsChange"
              :columnsFromParent="childHasBaseType ? columns : null"
              :columnWidthsFromParent="childHasBaseType ? columnWidths : null"
              :force-show-add="forceShowAdd"
              :force-show-details="forceShowDetails"
              :remove-add="removeAdd"
              :slicing-information="slicingInformation"
              :current-tab-prop="currentTab"
              :parent-reflective-name="reflectiveName"
              :custom-row-colours="customRowColours"
              :colour-theme="colourTheme"
              :removeDetailsButton="removeDetailsButton"
              :excluded-level="excludedLevel"
              :removeNameColumnMinWidth="removeNameColumnMinWidth"
            ></view-grid>
          </template>

          <template #footer>
            <div
              v-if="(forceShowAdd || notLowestGroup()) && !getRemoveAdd()"
              class="footer-container"
            >
              <div
                v-if="
                  parentReflectiveName &&
                  claimsAvailable.create > ClaimsType.RESTRICTED
                "
                class="add-button"
                :style="{
                  'padding-left':
                    level === 0 ? 12 + 'px' : 75 + 24 * (level - 1) + 'px',
                }"
              >
                <font-awesome-icon
                  class="plus-circle-icon"
                  :icon="['fa', 'plus-circle']"
                />
                <span
                  class="add-label"
                  @click="
                    groupedItemClick('Add', parentGroupType, '', parentId)
                  "
                >
                  Add {{ parentReflectiveName }}
                </span>
              </div>

              <div
                v-if="
                  (!reflectiveName || level === 0) &&
                  claimsAvailable.create > ClaimsType.RESTRICTED
                "
                class="add-button"
                :style="{
                  'padding-left':
                    level === 0 ? 12 + 'px' : 75 + 24 * (level - 1) + 'px',
                }"
              >
                <font-awesome-icon
                  class="plus-circle-icon"
                  :icon="['fa', 'plus-circle']"
                />
                <span
                  v-if="level === 0"
                  class="add-label"
                  @click="groupedItemClick('Add', currentGroupType, '', '')"
                >
                  Add {{ currentGroupName }}
                </span>

                <span
                  v-else
                  class="add-label"
                  @click="
                    groupedItemClick('Add', currentGroupType, '', parentId)
                  "
                >
                  Add {{ currentGroupName }}
                </span>
              </div>
            </div>
          </template>
        </data-table>
      </div>
    </div>
  </div>
</template>

<!--suppress CssUnknownTarget -->
<style scoped lang="scss">
.grid-container {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  overflow: auto;
}

/*
Tabs
*/

.tabs-group {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  height: 44px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $grey4;
    border-radius: 8px 8px 0 0;
    //padding: 12px; While we arent using tab-count
    padding: 12px 12px 12px 12px;
    line-height: 12px;
    font-weight: 700;
    height: 100%;
    box-sizing: border-box;
    min-width: 90px;
    max-width: 140px;
    cursor: pointer;

    .tab-wrapper {
      overflow: hidden;

      .tab-text {
        white-space: nowrap;
        text-align: center;
      }
    }

    .tab-count {
      display: flex;
      align-items: center;
      background-color: $white;
      line-height: 16px;
      font-weight: 400;
      padding: 2px 8px;
      margin-left: 8px;
      border-radius: 8px;
    }

    &.selected {
      background-color: $white;

      .tab-count {
        background-color: $grey4;
        padding: 2px 8px;
      }
    }
  }
}

/*
Table (level = 0)
*/

.data-table {
  padding: 24px;
  background-color: $white;
  border-radius: 8px;

  &.top-left-border-radius-none {
    border-radius: 0 8px 8px 8px;
  }

  .filter {
    margin-bottom: 12px;
  }

  .p-card {
    width: 100%;
    margin: 23px 0;
    display: flex;
    align-items: center;
  }
}

::v-deep(.p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
  color: $grey3;

  .p-datatable-tbody {
    tr.p-datatable-row-expansion > td {
      border: none;
    }

    & > tr {
      &:first-of-type {
        td {
          // border-bottom: none;
        }
      }

      & > td {
        // width: 2%;
        padding: 0;
        // border-left: none;
        // border-right: 1px solid #c8c8c8;
        border: none;

        &:last-of-type {
          border-right: none;
        }
        // border-top: 1px solid #c8c8c8;
      }
    }
  }
}

/*
Table (level > 0)
*/
.p-datatable-row-expansion {
  > td {
    .data-table {
      padding: 0;

      .filter {
        margin-bottom: 12px;
      }
    }
  }
}

::v-deep(.p-datatable-row-expansion .p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 0;
  color: $grey3;
}

/*
Table header (level = 0)
*/
::v-deep(.p-column-filter-menu) {
  margin-left: 0;
}
::v-deep(.p-datatable .p-datatable-thead) {
  > tr {
    background-color: $grey4;
    color: $grey3;
    height: 56px;

    > th {
      font-family: Poppins, serif;
      font-style: normal;
      font-size: 12px;
      font-weight: 600;
      background-color: $grey4;
      border: none;

      &.p-sortable-column {
        box-shadow: none;

        &:hover:not(.p-highlight) {
          background-color: $grey8;
        }

        &.p-highlight {
          color: v-bind(colourThemePrimaryText);
          background-color: v-bind(colourThemePrimaryBackground);

          > .p-column-header-content {
            > .p-sortable-column-icon {
              color: v-bind(colourThemePrimaryText);
            }

            > .p-sortable-column-badge {
              color: v-bind(colourThemePrimaryText);
            }
          }
        }
      }

      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }

      &:first-child:last-child {
        border-radius: 8px 8px 8px 8px;
      }

      > .p-column-header-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;

        .table-header-label {
          pointer-events: none;
        }

        .p-sortable-column-icon {
          font-size: 12px;
        }

        .p-sortable-column-badge {
          background: transparent;
          pointer-events: none;
        }
        .table-header-expand {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          height: 32px;
          width: 40px;

          .expand-button-div {
            margin-right: 2px;
            padding: 6px 6px 6px 6px;
            width: 52px;
            height: 32px;
            line-height: 3px;
            background-color: $grey4;
            border-radius: 6px;
            &:hover {
              background-color: $grey8;
            }
            .button-style-top {
              color: $grey3;
              width: 10px;
              height: 10px;
            }

            .button-style-bottom {
              margin-top: -10px;
              color: $grey3;
              width: 10px;
              height: 10px;
            }
          }
        }
      }
    }
  }
}

/*
Table header (level > 0)
*/

::v-deep(.p-datatable-row-expansion .p-datatable .p-datatable-thead) {
  > tr {
    > th {
      &:first-child {
        border-radius: 0;
        border-left: 8px solid v-bind(colourThemePrimaryBackground);
      }
    }
  }
}

::v-deep(.table-header-hidden) {
  > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead {
    display: none;
  }
}

/*
Table data (level = 0)
*/
::v-deep(.p-datatable-tbody) {
  tr {
    cursor: pointer;
  }

  tr:not(.p-datatable-row-expansion) {
    background-color: $grey2;

    &.p-highlight {
      background-color: $blue2;
    }

    &:hover {
      .details-button {
        display: flex;
      }
    }

    &.expanded {
      td {
        &:first-child {
          border-radius: 8px 0 0 0;
        }
      }
    }

    &.p-datatable-emptymessage {
      td {
        height: 0;
      }
    }

    td {
      position: relative;
      text-align: start;
      vertical-align: top;
      height: 64px;

      &:first-child {
        border-radius: 8px 0 0 8px;
        border-left: 8px solid v-bind(colourThemePrimaryBackground);
      }

      &.p-selection-column {
        padding: 22px 0;
      }

      .expander-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;

        .expander {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          width: 30px;
          border-radius: 15px;
          background-color: v-bind(colourThemePrimaryBackground);
          transition: all 0.1s linear;

          &.expanded {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
}

.table-cell {
  display: flex;
  position: relative;
  align-items: start;
  justify-content: center;
  height: 100%;

  > ::v-deep(.display-style) {
    padding: 23px 12px;
  }
}

/*
Table data (level > 0)
*/

::v-deep(.p-datatable-row-expansion .p-datatable-tbody) {
  > tr:not(.p-datatable-row-expansion) {
    background-color: $grey10;
    border-left: 8px solid v-bind(colourThemePrimaryBackground);

    &:last-child {
      td {
        box-shadow: none;
      }
    }

    &.p-datatable-emptymessage {
      height: 0;
      border: none;

      > td {
        padding: 0;
      }
    }

    &.milestone-row {
      background-color: $grey2;
      border: none;

      td {
        &:first-child {
          border-left: 8px solid v-bind(colourThemePrimaryBackground);
        }
      }
    }

    &.budget-row {
      background-color: $grey2;
    }

    &.p-highlight {
      background-color: $blue2;
    }

    &.expanded {
      td {
        box-shadow: none;
      }
    }

    td {
      position: relative;
      text-align: center;
      overflow: hidden;
      box-shadow: 0 -1px inset $grey;

      &:first-child {
        border-radius: 0;
      }

      &.p-selection-column {
        padding: 22px 0;
      }
    }
  }
}

/*
Details button
*/

.details-button {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: 22px 6px;
  padding: 0 5px;
  height: 20px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: v-bind(colourThemePrimaryText);
  z-index: 1000;
  display: none;
  gap: 4px;
  border-radius: 10px;
  background-color: v-bind(colourThemePrimaryBackground);

  .details-text {
    margin: 0;
    font-family: Poppins, serif;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
  }
}

// For details button for different levels
// ::v-deep(.p-datatable-tbody) {
//   >tr {

//     &.milestone-row {
//       td {
//         .details-button {
//           background-color: $grey2;
//         }
//       }
//     }

//     &.task-row {
//       td {
//         .details-button {
//           background-color: $white;
//         }
//       }
//     }

//     &.p-highlight {
//       td {
//         .details-button {
//           background-color: $blue2;
//         }
//       }
//     }
//   }
// }

/*
Table footer (level = 0)
*/

::v-deep(.p-datatable .p-datatable-footer) {
  margin-top: -20px;
  background: none;
  border: none;
  cursor: default;
}

/*
Table footer (level > 0)
*/

::v-deep(.p-datatable-row-expansion .p-datatable .p-datatable-footer) {
  margin-top: 0;
  padding: 0;
  background-color: $grey10;
  border-left: 8px solid v-bind(colourThemePrimaryBackground);
}

::v-deep(.footer-border-bottom > .p-datatable-footer) {
  margin-bottom: 20px;
  border-radius: 0 0 0 8px;
  min-height: 8px;
}

/*
Add milestone, task, etc. button
*/

.footer-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;

  .add-button {
    width: 100%;
    padding: 12px 24px;

    .add-label {
      color: v-bind(colourThemePrimaryBackground);
      font-weight: 700;
      cursor: pointer;
    }
  }
}

/*
Checkbox
*/
::v-deep(.p-checkbox) {
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto;

  &:not(.p-checkbox-disabled) {
    .p-checkbox-box {
      &:hover {
        border-color: v-bind(colourThemePrimaryBackground);
      }
    }
  }

  .p-checkbox-box {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 2px solid $grey3;
    background-color: $white;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s,
      box-shadow 0.2s;

    &.p-highlight {
      background: v-bind(colourThemePrimaryBackground);
      border-color: v-bind(colourThemePrimaryBackground);
    }

    .p-checkbox-icon {
      transition-duration: 0.2s;
      color: v-bind(colourThemePrimaryText);
      font-size: 14px;
      pointer-events: none;
    }
  }
}

/*
Icons
*/

.first-cell-icons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-sort-icon {
  color: $grey6;
  font-size: 12px;
  margin-left: 5px;
}

.check-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  padding: 0 4px;
  min-width: 24px;

  .check-icon {
    color: $grey6;
    font-size: 16px;

    &.selected {
      color: v-bind(colourThemePrimaryBackground);
    }
  }
}

.chevron-icon {
  color: v-bind(colourThemePrimaryText);
  font-size: 10px;
  margin: 0 -1px;
}

.plus-circle-icon {
  color: v-bind(colourThemePrimaryBackground);
  font-size: 16px;
  margin-right: 4px;
}

.tick-icon-spinner {
  width: 16px;
  height: 16px;
}

.table-cell-spinner {
  width: 30px;
  height: 30px;
}
/*
Paginator
*/

::v-deep(.p-paginator) {
  height: 40px;
  justify-content: flex-end;
  background: none;
  border: none;

  .p-paginator-current {
    margin-left: 2px;
    margin-right: 2px;
    line-height: 16px;
    cursor: default;
  }

  .p-paginator-first,
  .p-paginator-prev,
  .p-paginator-next,
  .p-paginator-last {
    width: 34px;
    height: 28px;
    margin-left: 2px;
    margin-right: 2px;
    background: none;
    border: none;
    border-radius: 8px;

    &:hover:not(.p-disabled) {
      background: $grey4;
    }
  }

  .p-paginator-pages {
    .p-paginator-page {
      width: 34px;
      height: 34px;
      margin-left: 2px;
      margin-right: 2px;
      background: none;
      border: none;
      border-radius: 8px;

      &:hover:not(.p-highlight) {
        background: $grey4;
      }

      &.p-highlight {
        color: v-bind(colourThemePrimaryText);
        background: v-bind(colourThemePrimaryBackground);
      }
    }
  }

  .p-dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 2px;
    margin-right: 2px;
    border-radius: 8px;
    border: none;

    &.p-focus {
      box-shadow: none;
    }

    .p-hidden-accessible {
      height: 0;
      width: 0;

      input {
        height: 0;
        width: 0;
        padding: 0;
        background: none;
        border: none;
      }
    }

    .p-dropdown-label {
      margin-left: 4px;
      margin-right: 2px;
    }

    .p-dropdown-trigger {
      margin-left: 2px;
      margin-right: 2px;
      width: 20px;
    }
  }
}

.filterbar {
  height: 72px;
  padding: 0 1rem;
}
</style>
