<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import Sidebar from "primevue/sidebar";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Button from "primevue/button";
//import Dropdown from "primevue/dropdown";
//import RadioButton from "primevue/radiobutton";
import AutoCompleteTextBox from "../../../components/input/autoCompleteTextBox.vue";
import {
  getPurchaseOrders,
  exportPurchaseOrder,
} from "../../../use/function/exportQuoteFunctions";
import { useToast } from "primevue/usetoast";
import upvise from "../../../store/modules/upvise";
import { stateSymbol } from "../../../store";
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import utils from "../../../use/function/useUtils";
import {
  IRecordPlannerActual,
  IRecordPlannerBudget,
  IRecordPlannerMilestone,
  IRecordPlannerTask,
} from "../../../use/controller/project/planner.d";
import { useTableNames } from "../../../use/utils/useConstants";

export const purchaseOrderExport = /*#__PURE__*/ defineComponent({
  name: "purchaseOrderExport",
  inject: [stateSymbol.description!],
  components: {
    AutoCompleteTextBox,
    Accordion,
    AccordionTab,
    Sidebar,
    Button,
    //Dropdown,
    //RadioButton,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    forageData: {
      type: Object as () => Record<string, IRecord[]>,
      required: true,
    },
    selectedItemsForExport: {
      type: Array,
      required: true,
    },
    projectid: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const toast = useToast();
    const projectid = ref(props.projectid);
    const showpurchaseOrderExport = ref(true);
    const selectedPurchaseOrder = ref<string>();
    const selectedCompany = ref();
    const selectedItemsForExportProp = ref(
      props.selectedItemsForExport as [
        { row: Record<string, unknown>; group: string }
      ]
    );
    // const upviseDataMessage = ref<IUpviseDataMessage>(props.upviseDataMessage);
    const purchaseOrders = ref();
    const exportToExistingPurchaseOrder = ref(null);
    const allMilestones = ref(
      JSON.parse(
        JSON.stringify(
          Object.values(upvise.entityData("TableSchedulerMilestones"))
        )
      ) as unknown as IRecordPlannerMilestone[]
    );
    const allTasks = ref(
      JSON.parse(
        JSON.stringify(Object.values(upvise.entityData("TableSchedulerTasks")))
      ) as unknown as IRecordPlannerTask[]
    );
    const allBudgets = ref(
      JSON.parse(
        JSON.stringify(
          Object.values(upvise.entityData(useTableNames.PROJECT_PLANNER_BUDGETS))
        )
      ) as unknown as IRecordPlannerBudget[]
    );
    const allActuals = ref(
      JSON.parse(
        JSON.stringify(
          Object.values(upvise.entityData(useTableNames.PROJECT_PLANNER_ACTUALS))
        )
      ) as unknown as IRecordPlannerActual[]
    );
    const selectedMilestones = ref<Set<Record<string, unknown>>>(new Set());
    const selectedTasks = ref<Set<Record<string, unknown>>>(new Set());
    // const selectedBudgets = ref<Set<Record<string, unknown>>>(new Set());
    // const selectedActuals = ref<Set<Record<string, unknown>>>(new Set());

    onMounted(async () => {
      purchaseOrders.value = await getPurchaseOrders(props.projectid);
      selectedItemsForQuoteExport();
    });

    const grouping = computed(() => {
      return props.upviseDataMessage?.definition?.Grouping ?? {};
    });

    const showCreatePurchaseOrderFromSelectedItemsTab = computed(() => {
      return utils.getSetting(props.forageData["system.user.settings"], "PLANNER_DISABLE_CREATE_PURCHASE_ORDER_FROM_SELECTED_ITEMS") != "1";
    });

    const showCreateQuoteFromSelectedItemsTab = computed(() => {
      return utils.getSetting(props.forageData["system.user.settings"], "PLANNER_DISABLE_CREATE_QUOTE_FROM_SELECTED_ITEMS") != "1";
    });

    const showCreateBlankQuoteTab = computed(() => {
      return utils.getSetting(props.forageData["system.user.settings"], "PLANNER_DISABLE_CREATE_BLANK_QUOTE") != "1";
    });

    const numberOfTabs = computed(() => {
      return [
        showCreatePurchaseOrderFromSelectedItemsTab.value,
        showCreateQuoteFromSelectedItemsTab.value,
        showCreateBlankQuoteTab.value
      ].filter((tab) => tab === true).length;
    });

    const showItemsToExportToPurchaseOrder = computed(() => {
      const result = {
        TableSchedulerTasks: [] as IRecordPlannerTask[],
        [useTableNames.PROJECT_PLANNER_BUDGETS]: {} as Record<
          string,
          IRecordPlannerBudget[]
        >,
      };

      selectedItemsForExportProp.value.forEach((i) => {
        if (i.group === "TableSchedulerTasks") {
          result["TableSchedulerTasks"].push(
            i.row as unknown as IRecordPlannerTask
          );
        } else if (
          i.group === useTableNames.PROJECT_PLANNER_BUDGETS &&
          (i.row.resourcetype === "Subcontractor" ||
            i.row.resourcetype === "Materials")
        ) {
          if (
            !(
              (i.row.taskid as string) in
              result[useTableNames.PROJECT_PLANNER_BUDGETS]
            )
          )
            result[useTableNames.PROJECT_PLANNER_BUDGETS][
              i.row.taskid as string
            ] = [];

          result[useTableNames.PROJECT_PLANNER_BUDGETS][
            i.row.taskid as string
          ].push(i.row as unknown as IRecordPlannerBudget);
        }
      });

      return result;
    });

    const supplierOptions = computed(() => {
      const supplierIds = (
        (props.forageData["system.user.settings"]?.find(
          (r) => r.id === "PLANNER_SUPPLIER_GROUP_IDS"
        )?.value as string) ?? ""
      ).split("|");
      return (
        props.forageData["unybiz.contacts.companies"]?.filter((company) =>
          supplierIds.some((supplierId) =>
            (company.groupid as string).includes(supplierId)
          )
        ) ?? []
      );
    });

    const itemsToExportToPurchaseOrder = computed(() => {
      const result = {
        TableSchedulerTasks: [] as IRecordPlannerTask[],
        [useTableNames.PROJECT_PLANNER_BUDGETS]: {} as Record<
          string,
          IRecordPlannerBudget[]
        >,
      };

      selectedItemsForExportProp.value.forEach((i) => {
        if (i.group === "TableSchedulerTasks") {
          result["TableSchedulerTasks"].push(
            i.row as unknown as IRecordPlannerTask
          );
        } else if (
          i.group === useTableNames.PROJECT_PLANNER_BUDGETS &&
          (i.row.resourcetype === "Subcontractor" ||
            i.row.resourcetype === "Materials")
        ) {
          if (
            !(
              (i.row.taskid as string) in
              result[useTableNames.PROJECT_PLANNER_BUDGETS]
            )
          )
            result[useTableNames.PROJECT_PLANNER_BUDGETS][
              i.row.taskid as string
            ] = [];

          const budgetsFromBudget = allBudgets.value.filter(
            (b) => b._showInTableId === i.row.id
          );

          budgetsFromBudget.forEach((b) => {
            result[useTableNames.PROJECT_PLANNER_BUDGETS][
              i.row.taskid as string
            ].push(b);
          });
        }
      });

      return result;
    });

    const itemToExportToQuote = computed(() => {
      const result = {
        TableSchedulerMilestones: new Set<string>(),
        TableSchedulerTasks: new Set<string>(),
        [useTableNames.PROJECT_PLANNER_BUDGETS]: new Set<string>(),
        [useTableNames.PROJECT_PLANNER_ACTUALS]: new Set<string>(),
      };

      selectedItemsForExportProp.value.forEach((i) => {
        if (i.group === "TableSchedulerMilestones") {
          const parentMilestones = getAllParentMilestones(i.row.id as string);

          result.TableSchedulerMilestones.add(i.row.id as string);
          parentMilestones.forEach((m) => {
            result.TableSchedulerMilestones.add(m);
          });
        } else if (i.group === "TableSchedulerTasks") {
          const parentMilestones = getAllParentMilestones(
            i.row.milestoneid as string
          );

          result.TableSchedulerTasks.add(i.row.id as string);
          result.TableSchedulerMilestones.add(i.row.milestoneid as string);
          parentMilestones.forEach((m) => {
            result.TableSchedulerMilestones.add(m);
          });
        } else if (i.group === useTableNames.PROJECT_PLANNER_BUDGETS) {
          // get budgets related to budget to show
          const budgetsFromBudget = allBudgets.value
            .filter((b) => b._showInTableId === i.row.id)
            .map((b) => b.id);
          const actualsFromBudget = allActuals.value
            .filter((a) => a._showInTableId === i.row.id)
            .map((a) => a.id);
          const task = allTasks.value.find((t) => t.id === i.row.taskid);

          budgetsFromBudget.forEach((b) => {
            result[useTableNames.PROJECT_PLANNER_BUDGETS].add(b);
          });
          actualsFromBudget.forEach((a) => {
            result[useTableNames.PROJECT_PLANNER_ACTUALS].add(a);
          });

          if (task) {
            result.TableSchedulerTasks.add(task.id);
            result.TableSchedulerMilestones.add(task.milestoneid);

            const parentMilestones = getAllParentMilestones(
              i.row.milestoneid as string
            );
            parentMilestones.forEach((m) => {
              result.TableSchedulerMilestones.add(m);
            });
          }
        }
      });

      return result;
    });

    const formattedForExport: { id: string; type: string }[] =
      props.selectedItemsForExport.map((entry) => {
        let entryTyped = entry as {
          row: Record<string, unknown>;
          group: string;
        };
        return { id: entryTyped.row.id as string, type: entryTyped.group };
      });

    //console.log("EXPORT:", props.selectedItemsForExport);
    function closepurchaseOrderExport() {
      showpurchaseOrderExport.value = false;
      emit("closeExport");
    }

    const formattedSelectedItemsDisplay = computed(() => {
      return props.selectedItemsForExport.map((entry) => {
        return (entry as { row: Record<string, unknown> }).row;
      });
    });

    function isItemsSelectedForQuoteExport() {
      return selectedItemsForExportProp.value.length > 0;
    }

    function isItemsSelectedForPurchaseOrderExport() {
      return itemsToExportToPurchaseOrder.value.TableSchedulerTasks.length >
        0 ||
        Object.keys(
          itemsToExportToPurchaseOrder.value[
            useTableNames.PROJECT_PLANNER_BUDGETS
          ]
        ).length > 0
        ? true
        : false;
    }

    function showPurchaseOrderExportButton() {
      return isItemsSelectedForPurchaseOrderExport() && selectedCompany.value;
    }

    const addToPurchaseOrder = async () => {
      if (selectedPurchaseOrder.value) {
        await exportPurchaseOrder(
          itemsToExportToPurchaseOrder.value,
          selectedCompany.value || "",
          props.forageData,
          upvise
        );
        await utils.forceSync();
        closepurchaseOrderExport();
      } else {
        toast.add({
          severity: "warn",
          summary: "No purchase order selected",
          detail: "Pleae choose a purchase order to add to",
          life: 1570,
        });
      }
    };

    async function createNewPurchaseOrder() {
      const ids = await exportPurchaseOrder(
        itemsToExportToPurchaseOrder.value,
        selectedCompany.value || "",
        props.forageData,
        upvise
      ).then((response) => response);
      console.log("ids: ", ids);
      await utils.forceSync();
      closepurchaseOrderExport();
      if (ids.length == 1) {
        window.Engine.eval(`Sales.viewQuote('${ids[0]}')`, 0);
      } else {
        window.Engine.eval(
          `Projects.viewProject('${projectid.value}', 'finance')`,
          0
        );
      }
    }

    function selectedItemsForQuoteExport() {
      selectedItemsForExportProp.value.forEach((entry) => {
        if (entry.group == "TableSchedulerTasks") {
          selectedTasks.value.add(entry.row);
          const parentMilestone = allMilestones.value.find(
            (milestone) => milestone.id == entry.row.milestoneid
          );
          if (parentMilestone) selectedMilestones.value.add(parentMilestone);
        }
      });
    }

    function createQuoteFromSelectedItems() {
      const milestonesIdString = [
        ...itemToExportToQuote.value.TableSchedulerMilestones,
      ].join("|");
      const tasksIdString = [
        ...itemToExportToQuote.value.TableSchedulerTasks,
      ].join("|");
      const budgetsIdString = [
        ...itemToExportToQuote.value[useTableNames.PROJECT_PLANNER_BUDGETS],
      ].join("|");
      const actualsIdString = [
        ...itemToExportToQuote.value[useTableNames.PROJECT_PLANNER_ACTUALS],
      ].join("|");
      // Put the code to call the upvise function here
      window.Engine.eval(
        `Projects.CreateQuoteFromPlanner('${projectid.value}', '${milestonesIdString}', '${tasksIdString}', '${actualsIdString}', '${budgetsIdString}', '1')`,
        0
      );
      // Redirect to the finance tab after creation
      closepurchaseOrderExport();
      window.Engine.eval(
        `Projects.viewProject('${projectid.value}', 'finance')`,
        0
      );
    }

    function createBlankQuote() {
      window.Engine.eval(
        `Projects.CreateQuoteFromPlanner('${projectid.value}', '', '', '', '', '1')`,
        0
      );
      // Redirect to the finance tab after creation
      closepurchaseOrderExport();
      window.Engine.eval(
        `Projects.viewProject('${projectid.value}', 'finance')`,
        0
      );
    }

    // function getPipedString(records: Set<IRecord>) {
    //   const ids: string[] = [];
    //   records.forEach((record: Record<string, unknown>) =>
    //     ids.push(record.id as string)
    //   );
    //   return ids.join("|");
    // }

    function filteredTasks(id: unknown) {
      var tasks: Record<string, unknown>[] = [];
      selectedTasks.value.forEach((t) => {
        if (t.milestoneid == id) tasks.push(t);
      });
      return tasks;
    }

    // Get all parent Milestones for a given milestones
    function getAllParentMilestones(milestoneId: string): string[] {
      const result: string[] = [];
      const milestone = allMilestones.value.find((m) => m.id === milestoneId);
      const parent = allMilestones.value.find(
        (m) => m.id === milestone?.milestoneid
      );

      if (parent) {
        result.push(parent.id);
        return result.concat(getAllParentMilestones(parent.id));
      } else return result;
    }

    function getSelectedItemsForType(groupType: string) {
      return selectedItemsForExportProp.value
        .filter((i) => i.group === groupType)
        .map((i) => i.row);
    }

    function getItemName(item: IRecord, groupType: string) {
      if (groupType === useTableNames.PROJECT_PLANNER_BUDGETS) {
        return `${item?.resourcetype ?? ""} - ${item?.resourceName ?? ""}`;
      } else {
        return (item?.name ?? "") as string;
      }
    }

    function updateOptionsValue(fieldName: string, value: string) {
      switch (fieldName) {
        case "companyid":
          selectedCompany.value = value;
          break;
      }
    }

    return {
      useTableNames,
      showpurchaseOrderExport,
      selectedPurchaseOrder,
      selectedCompany,
      selectedItemsForExportProp,
      closepurchaseOrderExport,
      purchaseOrders,
      exportToExistingPurchaseOrder,
      supplierOptions,
      grouping,
      showCreatePurchaseOrderFromSelectedItemsTab,
      showCreateQuoteFromSelectedItemsTab,
      showCreateBlankQuoteTab,
      numberOfTabs,
      showItemsToExportToPurchaseOrder,
      itemsToExportToPurchaseOrder,
      itemToExportToQuote,
      isItemsSelectedForQuoteExport,
      isItemsSelectedForPurchaseOrderExport,
      showPurchaseOrderExportButton,
      addToPurchaseOrder,
      createNewPurchaseOrder,
      formattedSelectedItemsDisplay,
      formattedForExport,
      selectedItemsForQuoteExport,
      selectedMilestones,
      selectedTasks,
      createQuoteFromSelectedItems,
      createBlankQuote,
      filteredTasks,
      getSelectedItemsForType,
      getItemName,
      updateOptionsValue,
    };
  },
});

export default purchaseOrderExport;
</script>

<template>
  <div>
    <sidebar
      class="export-screen"
      :visible="showpurchaseOrderExport"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Export Options</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="option" @click="closepurchaseOrderExport()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>
      <Accordion :activeIndex="numberOfTabs === 1 ? 0 : null">
        <AccordionTab
          v-if="showCreatePurchaseOrderFromSelectedItemsTab"
          header="Create Purchase Order from selected items"
        >
          <div class="p-grid sidebar-grid">
            <div class="p-col-12">
              <span class="header-name">
                Create Purchase Order from selected items
              </span>
            </div>

            <!--            <div class="p-col-4" style="display: flex; align-items: center">-->
            <!--              <radio-button-->
            <!--                id="exportItemsOption1"-->
            <!--                :value="false"-->
            <!--                v-model="exportToExistingPurchaseOrder"-->
            <!--              />-->
            <!--              <label class="radio-button-label" for="exportItemsOption1"-->
            <!--                >Create new purchase order</label-->
            <!--              >-->
            <!--            </div>-->
            <!--            <div class="p-col-4" style="display: flex; align-items: center">-->
            <!--              <radio-button-->
            <!--                id="exportItemsOption2"-->
            <!--                :value="true"-->
            <!--                v-model="exportToExistingPurchaseOrder"-->
            <!--              />-->
            <!--              <label class="radio-button-label" for="exportItemsOption2"-->
            <!--                >Add to exisiting purchase order</label-->
            <!--              >-->
            <!--            </div>-->
            <!--            <div class="p-col-4" style="display: flex; align-items: center">-->
            <!--              <Dropdown-->
            <!--                class="input-dropdown-field"-->
            <!--                v-model="selectedPurchaseOrder"-->
            <!--                :options="purchaseOrders"-->
            <!--                optionLabel="name"-->
            <!--                optionValue="id"-->
            <!--                placeholder="Select Purchase Order"-->
            <!--                :disabled="!exportToExistingPurchaseOrder"-->
            <!--              />-->
            <!--            </div>-->

            <div class="p-col-12">
              <span
                >Only selected sub-items and budgets (materials and
                subcontractors) will be considered for purchase order
                export</span
              >
            </div>

            <div
              v-if="!isItemsSelectedForPurchaseOrderExport()"
              class="p-col-12"
            >
              <span> No tasks or budgets have been selected </span>
            </div>

            <div v-else class="p-col-12">
              <div>
                <span class="header-list-item">Selected Sub-Items</span>
                <ul>
                  <li
                    v-for="(
                      item, index
                    ) of showItemsToExportToPurchaseOrder.TableSchedulerTasks"
                    :key="item.id + index"
                  >
                    {{ item.name }}
                  </li>
                </ul>
              </div>
              <div>
                <span class="header-list-item">Selected Budgets</span>
                <ul>
                  <template
                    v-for="(item, index) of Object.values(
                      showItemsToExportToPurchaseOrder[
                        useTableNames.PROJECT_PLANNER_BUDGETS
                      ]
                    )"
                    :key="item + index"
                  >
                    <li v-for="budget of item" :key="budget.id">
                      {{
                        budget.resourcetype +
                        " - " +
                        (budget.resourceName ?? "")
                      }}
                    </li>
                  </template>
                </ul>
              </div>
            </div>

            <div class="p-col-2 input-label">Supplier</div>
            <div class="p-col-6 input-container">
              <auto-complete-text-box
                style="width: 100%;"
                :options="supplierOptions"
                :selected="selectedCompany"
                :multi-select="false"
                display-field="name"
                field-name="companyid"
                @updateOptionsValue="updateOptionsValue"
              ></auto-complete-text-box>
            </div>
            <div class="p-col-4">
              <Button
                @click="createNewPurchaseOrder()"
                :disabled="!showPurchaseOrderExportButton()"
                >Create Purchase Order
              </Button>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab 
          v-if="showCreateQuoteFromSelectedItemsTab"
          header="Create Quote from selected items"
        >
          <div class="p-grid sidebar-grid">
            <div class="p-col-12">
              <span class="header-name">
                Create Quote from selected items
              </span>
            </div>

            <div v-if="!isItemsSelectedForQuoteExport()" class="p-col-12">
              <span> No items have been selected </span>
            </div>

            <div v-else class="p-col-12">
              <div
                v-for="(group, index) of Object.values(grouping)"
                :key="group.Type + index"
              >
                <span class="header-list-item">Selected {{ group.Name }}s</span>
                <ul>
                  <li
                    v-for="item of getSelectedItemsForType(group.Type)"
                    :key="item.id"
                  >
                    {{ getItemName(item, group.Type) }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="p-col-8" />
            <div class="p-col-4">
              <Button
                @click="createQuoteFromSelectedItems()"
                :disabled="!isItemsSelectedForQuoteExport()"
                >Create Quote
              </Button>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab
          v-if="showCreateBlankQuoteTab"
          header="Create Blank Quote"
        >
          <div class="p-grid sidebar-grid">
            <div class="p-col-12">
              <span class="header-name"> Create Blank Quote </span>
            </div>

            <div class="p-col-8" />
            <div class="p-col-4">
              <Button @click="createBlankQuote()">Create Quote </Button>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </sidebar>
  </div>
</template>

<style scoped></style>
