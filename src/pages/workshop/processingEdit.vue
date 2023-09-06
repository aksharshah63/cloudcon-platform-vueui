<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
  watch,
} from "vue";
import { ILookupRecord } from "../../use/controller/lookups/lookups.d";
import Sidebar from "primevue/sidebar";
import useControllerProcessing from "../../use/controller/workshop/processing";
import {
  IAuditLog,
  IAuditLogMapped,
  ILot,
} from "../../use/controller/workshop/workshop.d";
import useWorkshopController from "../../use/controller/workshop/workshop";

import ProgressSpinner from "primevue/progressspinner";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { useConfirm } from "primevue/useconfirm";
import Calendar from "primevue/calendar";
import ConfirmDialog from "primevue/confirmdialog";
import moment from "moment";
import Checkbox from "primevue/checkbox";
import InstallDateEdit from "./installDateEdit.vue";
import { IProcessingRecord } from "../../use/controller/workshop/processing.d";
import ProcessingEditDetails from "../../pages/workshop/processingEditDetails.vue";
import ProgressLogTable from "../../components/workshop/progressLogTable.vue";
import LotEdit from "../../pages/workshop/lotEditDetails.vue";
import { useState } from "../../store/index";
import maths from "../../use/utils/useNumberOperations";
import utils from "../../use/function/useUtils";
import { IRecordDealsProduct } from "../../use/controller/sales/deals.d";
import { IRecord } from "../../store/modules/upvise.d";
import { WorkshopSource } from "../../use/utils/useConstants";
import date from "../../use/utils/useDateOperations";

export const ProcessingEditScreen = defineComponent({
  name: "ProcessingEditScreen",
  components: {
    Sidebar,
    ProgressSpinner,
    InputNumber,
    InputText,
    Accordion,
    AccordionTab,
    Calendar,
    Checkbox,
    ConfirmDialog,
    InstallDateEdit,
    ProcessingEditDetails,
    ProgressLogTable,
    LotEdit,
  },
  props: {
    processingId: {
      type: String,
      required: true,
    },
    traceabilityOptions: {
      type: Array as () => IRecordDealsProduct[],
      required: false,
      default: () => [],
    },
    stageProjects: {
      type: Array as () => IRecord[],
      required: false,
      default: () => [],
    },
    equipment: {
      type: Array as () => ILookupRecord[],
      required: false,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const upvise = useState().upvise;
    const controller = useControllerProcessing(upvise);
    const workshop = useWorkshopController(upvise);
    const copyModelProcessing = props.processingId
      ? controller.getEditProcess(props.processingId, false)
      : null;
    let originalProcess = copyModelProcessing
      ? reactive(utils.deepCopy(copyModelProcessing))
      : null;
    const teklaId = ref(originalProcess?.id);
    const noTekla = ref(originalProcess === null);
    const copyModelProcessingManual = props.processingId
      ? controller.getEditProcess(props.processingId, true)
      : null;
    let originalProcessManual = copyModelProcessingManual
      ? reactive(utils.deepCopy(copyModelProcessingManual))
      : null;
    const linkedLot =
      copyModelProcessingManual?.lotid || copyModelProcessing?.lotid
        ? workshop.getEditLinkedLot(
            copyModelProcessingManual?.lotid || copyModelProcessing?.lotid || ""
          )
        : null;
    let originalLinkedLot = linkedLot
      ? reactive(utils.deepCopy(linkedLot))
      : null;
    const title = ref("NO NAME");
    const manualId = ref(originalProcessManual?.id);
    const noManual = ref(originalProcessManual === null);
    const showProcessing = ref(true);
    const awaitingResponse = ref(false);
    const showSave = ref(false);
    const metresScheduled = ref(0);
    const metresCompleted = ref(0);
    const addNewProgress = ref(false);
    const logDate = ref(Date.now());
    const logReason = ref("");
    const accordionActiveTabs = ref(noTekla.value ? [1] : [2]);
    const combinedAuditLogs: Ref<IAuditLogMapped[]> = ref([]);
    const teklaTabTooltip = ref(noTekla.value ? "No Tekla Import" : "");
    const manualTabTooltip = ref(noManual.value ? "No Manual Entry" : "");
    const showInstallDateEdit = ref(false);
    const installDateEditSource = ref();
    const currentlyArchiving = ref(false);
    const selectedEquipment: Ref<string[]> = ref([]);
    const originalSelectedEquipment: Ref<string[]> = ref([]);
    const confirm = useConfirm();
    const awaitingArchive = ref(false);
    const archiveConfirm = (source: string) => {
      confirm.require({
        message: "Are you sure you want to archive this record?",
        header: "Archive Manual Record",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (
            source === WorkshopSource.TEKLA ||
            source === WorkshopSource.MANUAL
          )
            deleteProcessing(source);
        },
      });
    };

    onMounted(async () => {
      if (originalProcess) {
        title.value = originalProcess.name || "";
      } else if (originalProcessManual) {
        title.value = originalProcessManual.name || "";
      }

      if (!noTekla.value) {
        metresCompleted.value = copyModelProcessing?.metrescompleted || 0;
        metresScheduled.value = copyModelProcessing?.metresscheduled || 0;
      } else {
        metresCompleted.value = copyModelProcessingManual?.metrescompleted || 0;
        metresScheduled.value = copyModelProcessingManual?.metresscheduled || 0;
      }

      if (!noTekla.value) {
        //Use info from tekla
        selectedEquipment.value = originalProcess?.equipment
          ? originalProcess.equipment
              .split("|")
              .filter((entry: string) => entry != "")
          : [];
        originalSelectedEquipment.value = originalProcess?.equipment
          ? originalProcess.equipment
              .split("|")
              .filter((entry: string) => entry != "")
          : [];
      } else if (!noManual.value) {
        selectedEquipment.value = originalProcessManual?.equipment
          ? originalProcessManual.equipment
              .split("|")
              .filter((entry: string) => entry != "")
          : [];
        originalSelectedEquipment.value = originalProcess?.equipment
          ? originalProcess.equipment
              .split("|")
              .filter((entry: string) => entry != "")
          : [];
        //Use info from manual entry
      }

      let valueText = "";
      if (noManual.value) valueText = "No Manual Entry";
      else if (manualIsArchived.value) valueText = "Entry has been archived";
      manualTabTooltip.value = valueText;
    });

    const manualIsArchived = computed(() => {
      return originalProcessManual?.isactive == 0;
    });

    const teklaIsArchived = computed(() => {
      return originalProcess?.isactive == 0;
    });

    const showProgressSave = computed(() => {
      return (
        // (metresCompleted.value !==
        //   (!noTekla.value
        //     ? copyModelProcessing?.metrescompleted || 0
        //     : copyModelProcessingManual?.metrescompleted || 0) ||
        //   metresScheduled.value !==
        //     (!noTekla.value
        //       ? copyModelProcessing?.metresscheduled || 0
        //       : copyModelProcessingManual?.metresscheduled || 0)) &&
        !awaitingResponse.value
      );
    });

    const processingTime = computed(() =>
      !noTekla.value
        ? copyModelProcessing?.processingtime ?? 0
        : copyModelProcessingManual?.processingtime ?? 0
    );

    const timeCompleted = computed(() =>
      maths.multiply(processingTime.value, metresCompleted.value)
    );

    const timeScheduled = computed(() =>
      maths.multiply(processingTime.value, metresScheduled.value)
    );

    const totalMetresCompleted = computed(() => {
      const totalMetresCompletedFromLogs = (
        filteredLogs.value as unknown as IRecord[]
      )
        .map((log) => (log.value as IRecord).metrescompleted as number)
        .reduce((a, b) => maths.sum(a, b), 0);

      return maths.sum(metresCompleted.value, totalMetresCompletedFromLogs);
    });

    const totalTimeCompleted = computed(() => {
      const totalTimeCompletedFromLogs = (
        filteredLogs.value as unknown as IRecord[]
      )
        .map((log) => (log.value as IRecord).timeCompleted as number)
        .reduce((a, b) => maths.sum(a, b), 0);

      return maths.sum(timeCompleted.value, totalTimeCompletedFromLogs);
    });

    const sortedEquipment = computed(() => {
      return upvise
        .entityFilter(
          "TableEmployeedashboardLookups",
          "lookuptype",
          "Equipment"
        )
        .sort((a, b) =>
          (a?.lookupname || 0) >= (b?.lookupname || 0) ? 1 : -1
        );
    });

    const manualLogs = computed(() => {
      return copyModelProcessingManual?.id
        ? workshop.getProcessingLogs(copyModelProcessingManual?.id)
        : [];
    });

    const teklaLogs = computed(() => {
      return copyModelProcessing?.id
        ? workshop.getProcessingLogs(copyModelProcessing?.id)
        : [];
    });

    const filteredLogs = computed(() => {
      return noTekla.value
        ? workshop.filterProcessingLogsForTotalCount(manualLogs.value)
        : workshop.filterProcessingLogsForTotalCount(teklaLogs.value);
    });

    function saveProcessing() {
      const lotToSave: ILot[] = [];
      const processToSave: IProcessingRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      //Check if install date has changed
      if (
        !noTekla.value &&
        originalProcess &&
        copyModelProcessing &&
        JSON.stringify(copyModelProcessing) !==
          JSON.stringify(originalProcess) &&
        controller.validateProcessChanges(copyModelProcessing)
      ) {
        auditToSave.push(
          workshop.createProcessingLog(originalProcess, copyModelProcessing, "")
        );
        processToSave.push(copyModelProcessing);
      }

      if (
        !noManual.value &&
        copyModelProcessingManual &&
        originalProcessManual &&
        JSON.stringify(copyModelProcessingManual) !==
          JSON.stringify(originalProcessManual)
      ) {
        auditToSave.push(
          workshop.createProcessingLog(
            originalProcessManual,
            copyModelProcessingManual,
            ""
          )
        );
        processToSave.push(copyModelProcessingManual);
      }

      if (
        linkedLot &&
        originalLinkedLot &&
        JSON.stringify(linkedLot) !== JSON.stringify(originalLinkedLot)
      ) {
        lotToSave.push(linkedLot);
      }

      console.log(processToSave);

      awaitingResponse.value = true;
      const payload = {
        TableWorkshopLot: lotToSave,
        TableWorkshopProcessing: processToSave,
        TableWorkshopProcessinglogs: auditToSave,
      };

      if (workshop.getValidSave(payload))
        workshop
          .doSaveModelEntities(payload)
          .then(() => {
            originalLinkedLot = linkedLot
              ? reactive(utils.deepCopy(linkedLot))
              : null;
            originalProcess = copyModelProcessing
              ? reactive(utils.deepCopy(copyModelProcessing))
              : null;
            originalProcessManual = copyModelProcessingManual
              ? reactive(utils.deepCopy(copyModelProcessingManual))
              : null;
            awaitingResponse.value = false;
          })
          .catch(() => {
            awaitingResponse.value = false;
          });
      else awaitingResponse.value = false;
    }

    function deleteProcessing(source: string) {
      const processToSave: IProcessingRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      awaitingArchive.value = true;

      if (
        source === WorkshopSource.TEKLA &&
        copyModelProcessing &&
        originalProcess
      ) {
        copyModelProcessing.isactive = 0;
        auditToSave.push(
          workshop.createProcessingLog(originalProcess, copyModelProcessing, "")
        );
        processToSave.push(copyModelProcessing);
      } else if (
        source === WorkshopSource.MANUAL &&
        copyModelProcessingManual &&
        originalProcessManual
      ) {
        copyModelProcessingManual.isactive = 0;
        auditToSave.push(
          workshop.createProcessingLog(
            originalProcessManual,
            copyModelProcessingManual,
            ""
          )
        );
        processToSave.push(copyModelProcessingManual);
      }

      const payload = {
        TableWorkshopProcessing: processToSave,
        TableWorkshopProcessinglogs: auditToSave,
      };

      workshop
        .doSaveModelEntities(payload)
        .then(() => {
          if (originalProcess)
            Object.assign(originalProcess, copyModelProcessing);
          if (originalProcessManual)
            Object.assign(originalProcessManual, copyModelProcessingManual);
          //originalProcess = copyModelProcessing ? reactive(utils.deepCopy(copyModelProcessing)) : null;
          awaitingResponse.value = false;
          currentlyArchiving.value = false;
          awaitingArchive.value = false;
        })
        .catch((error) => {
          console.log(error);
          awaitingResponse.value = false;
          currentlyArchiving.value = false;
          awaitingArchive.value = false;
        });
    }

    function closeProcessing() {
      showProcessing.value = false;
      emit("closeEditScreen");
    }

    function handleSaveNewDate(
      newDate: string,
      reason: string,
      source: string
    ) {
      const newDateValue = moment(newDate).valueOf();
      const processingToSave: IProcessingRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      const oldProcessing = utils.deepCopy(
        source === WorkshopSource.TEKLA
          ? originalProcess
          : originalProcessManual
      );
      const newProcessing = utils.deepCopy(oldProcessing);

      if (oldProcessing && newProcessing) {
        newProcessing.installdate = newDateValue;

        auditToSave.push(
          workshop.createProcessingLog(oldProcessing, newProcessing, reason)
        );

        processingToSave.push(newProcessing);

        awaitingResponse.value = true;
        const payload = {
          TableWorkshopProcessing: processingToSave,
          TableWorkshopProcessinglogs: auditToSave,
        };

        if (workshop.getValidSave(payload))
          workshop
            .doSaveModelEntities(payload)
            .then(() => {
              if (
                source === WorkshopSource.TEKLA &&
                copyModelProcessing &&
                originalProcess
              ) {
                copyModelProcessing.installdate = newDateValue;
                originalProcess.installdate = newDateValue;
              } else if (copyModelProcessingManual && originalProcessManual) {
                copyModelProcessingManual.installdate = newDateValue;
                originalProcessManual.installdate = newDateValue;
              }
              awaitingResponse.value = false;
            })
            .catch(() => {
              awaitingResponse.value = false;
            });
        else awaitingResponse.value = false;
      }
    }

    function saveNewProcess() {
      const processToSave: IProcessingRecord[] = [];
      const auditsToSave: IAuditLog[] = [];
      const newMetresCompleted = metresCompleted.value;
      const newMetresScheduled = metresScheduled.value;
      const newTimeCompleted = timeCompleted.value;
      const newTimeScheduled = timeScheduled.value;

      if (!noTekla.value && copyModelProcessing && originalProcess) {
        const newProcessing = utils.deepCopy(originalProcess);
        newProcessing.metrescompleted = newMetresCompleted;
        newProcessing.metresscheduled = newMetresScheduled;
        newProcessing.timeCompleted = newTimeCompleted;
        newProcessing.timeScheduled = newTimeScheduled;

        processToSave.push(newProcessing);
        auditsToSave.push(
          workshop.createProcessingLog(
            originalProcess,
            newProcessing,
            logReason.value,
            logDate.value
          )
        );
      } else if (
        !noManual.value &&
        copyModelProcessingManual &&
        originalProcessManual
      ) {
        const newProcessingManual = utils.deepCopy(originalProcessManual);
        newProcessingManual.metrescompleted = newMetresCompleted;
        newProcessingManual.metresscheduled = newMetresScheduled;
        newProcessingManual.timeCompleted = newTimeCompleted;
        newProcessingManual.timeScheduled = newTimeScheduled;

        processToSave.push(newProcessingManual);
        auditsToSave.push(
          workshop.createProcessingLog(
            originalProcessManual,
            newProcessingManual,
            logReason.value,
            logDate.value
          )
        );
      }

      awaitingResponse.value = true;
      const payload = {
        TableWorkshopProcessing: processToSave,
        TableWorkshopProcessinglogs: auditsToSave,
      };

      if (workshop.getValidSave(payload))
        workshop
          .doSaveModelEntities(payload)
          .then(() => {
            if (!noTekla.value && copyModelProcessing && originalProcess) {
              copyModelProcessing.metrescompleted = newMetresCompleted;
              copyModelProcessing.metresscheduled = newMetresScheduled;
              copyModelProcessing.timeCompleted = newTimeCompleted;
              copyModelProcessing.timeScheduled = newTimeScheduled;
              originalProcess = copyModelProcessing
                ? reactive(utils.deepCopy(copyModelProcessing))
                : null;
            } else if (
              !noManual.value &&
              copyModelProcessingManual &&
              originalProcessManual
            ) {
              copyModelProcessingManual.metrescompleted = newMetresCompleted;
              copyModelProcessingManual.metresscheduled = newMetresScheduled;
              copyModelProcessingManual.timeCompleted = newTimeCompleted;
              copyModelProcessingManual.timeScheduled = newTimeScheduled;
              originalProcessManual = copyModelProcessingManual
                ? reactive(utils.deepCopy(copyModelProcessingManual))
                : null;
            }

            awaitingResponse.value = false;
          })
          .catch(() => {
            awaitingResponse.value = false;
          });
      else awaitingResponse.value = false;
    }

    function tabOpened(event: Record<string, unknown>) {
      let index = (event.index as number) ?? -1;
      switch (index) {
        case 1:
          if (noManual.value || currentlyArchiving.value) {
            accordionActiveTabs.value = accordionActiveTabs.value.filter(
              (val) => val != 1
            );
          }
          break;
        case 2:
          if (noTekla.value) {
            accordionActiveTabs.value = accordionActiveTabs.value.filter(
              (val) => val != 2
            );
          }
          break;
      }
    }

    function tabClosed(event: Record<string, unknown>) {
      let index = (event.index as number) ?? -1;
      accordionActiveTabs.value = accordionActiveTabs.value.filter(
        (val) => val != index
      );
    }

    function onShowInstallDateEdit(source: string) {
      installDateEditSource.value = source;
      showInstallDateEdit.value = true;
    }

    watch(
      () => [
        copyModelProcessing,
        originalProcess,
        copyModelProcessingManual,
        originalProcessManual,
        linkedLot,
        originalLinkedLot,
      ],
      utils.debounce(() => {
        showSave.value =
          !utils.equalObjects(copyModelProcessing, originalProcess) ||
          !utils.equalObjects(
            copyModelProcessingManual,
            originalProcessManual
          ) ||
          !utils.equalObjects(linkedLot, originalLinkedLot);
      }),
      { deep: true }
    );

    watch(
      selectedEquipment,
      () => {
        if (!noTekla.value && copyModelProcessing)
          copyModelProcessing.equipment = selectedEquipment.value.join("|");
        if (!noManual.value && copyModelProcessingManual)
          copyModelProcessingManual.equipment =
            selectedEquipment.value.join("|");
      },
      { deep: true }
    );

    return {
      WorkshopSource,
      date,
      props,
      workshop,
      showProcessing,
      awaitingResponse,
      copyModelProcessing,
      copyModelProcessingManual,
      linkedLot,
      title,
      showSave,
      saveProcessing,
      closeProcessing,
      metresCompleted,
      metresScheduled,
      logDate,
      logReason,
      showInstallDateEdit,
      installDateEditSource,
      handleSaveNewDate,
      addNewProgress,
      combinedAuditLogs,
      manualLogs,
      teklaLogs,
      filteredLogs,
      noTekla,
      noManual,
      saveNewProcess,
      showProgressSave,
      timeCompleted,
      timeScheduled,
      totalMetresCompleted,
      totalTimeCompleted,
      accordionActiveTabs,
      selectedEquipment,
      teklaId,
      manualId,
      manualIsArchived,
      teklaIsArchived,
      sortedEquipment,
      manualTabTooltip,
      teklaTabTooltip,
      archiveConfirm,
      tabOpened,
      tabClosed,
      onShowInstallDateEdit,
      utils,
      awaitingArchive,

      getDate: utils.getDate,

      originalProcess,
      originalProcessManual,
    };
  },
});
export default ProcessingEditScreen;
</script>

<template>
  <div>
    <sidebar
      class="processing-screen"
      :visible="showProcessing"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"> Processing </span>
            </div>
          </div>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveProcessing()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeProcessing()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12">
          <span class="sub-header-name">
            {{ title }}
          </span>
        </div>

        <Accordion
          class="p-col-12"
          :multiple="true"
          :activeIndex="accordionActiveTabs"
          @tabOpen="tabOpened"
          @tabClose="tabClosed"
        >
          <AccordionTab>
            <template #header>
              <div v-bind:style="{ width: '100%', height: '18px' }">
                <div v-bind:style="{ width: '100%', height: '100%' }">
                  <div
                    class="p-grid"
                    v-bind:style="{ width: '100%', height: '100%' }"
                  >
                    <div class="p-col-12" style="margin: 0 8px 0 0">Lot</div>
                  </div>
                </div>
              </div>
            </template>
            <div class="p-grid sidebar-grid">
              <div class="p-col-12">
                <lot-edit
                  v-if="linkedLot"
                  :lot-copy="linkedLot"
                  :stage-projects="stageProjects"
                  :archived="false"
                  :isNewLot="false"
                />
              </div>
            </div>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <div
                v-bind:style="{ width: '100%', height: '18px' }"
                v-tooltip.bottom="manualTabTooltip"
              >
                <div
                  :class="noManual ? 'p-disabled' : ''"
                  v-bind:style="{ width: '100%', height: '100%' }"
                >
                  <div
                    class="p-grid"
                    v-bind:style="{ width: '100%', height: '100%' }"
                  >
                    <div class="p-col-12" style="margin: 0 8px 0 0">Manual</div>
                  </div>
                </div>
              </div>
            </template>
            <div class="p-grid sidebar-grid">
              <div class="p-col-10" />
              <div class="p-col-2 sidebar-options">
                <div class="loading-spinner" v-if="awaitingArchive">
                  <ProgressSpinner class="spinner"></ProgressSpinner>
                </div>
                <div
                  v-if="!noManual && !manualIsArchived && !awaitingArchive"
                  class="option"
                  :style="{ textAlign: 'right' }"
                  @click="archiveConfirm(WorkshopSource.MANUAL)"
                >
                  <font-awesome-icon
                    class="archive-icon"
                    :icon="['fa', 'archive']"
                  />
                </div>
              </div>

              <div class="p-col-12">
                <processing-edit-details
                  v-if="!noManual && copyModelProcessingManual"
                  :is-manual="true"
                  :process-record="copyModelProcessingManual"
                  :isArchived="manualIsArchived"
                  :traceability-options="traceabilityOptions"
                  @showInstallDateEdit="
                    onShowInstallDateEdit(WorkshopSource.MANUAL)
                  "
                />
              </div>
            </div>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <div
                v-bind:style="{ width: '100%', height: '18px' }"
                v-tooltip.bottom="teklaTabTooltip"
              >
                <div
                  :class="noTekla ? ' p-disabled' : ''"
                  v-bind:style="{ width: '100%', height: '100%' }"
                >
                  <div
                    class="p-grid"
                    v-bind:style="{ width: '100%', height: '100%' }"
                  >
                    <div class="p-col-12" style="margin: 0 8px 0 0">Tekla</div>
                  </div>
                </div>
              </div>
            </template>
            <div class="p-grid sidebar-grid">
              <div class="p-col-10" />
              <div class="p-col-2 sidebar-options">
                <div class="loading-spinner" v-if="awaitingArchive">
                  <ProgressSpinner class="spinner"></ProgressSpinner>
                </div>
                <div
                  v-if="!noTekla && !teklaIsArchived && !awaitingArchive"
                  class="option"
                  v-bind:style="{ textAlign: 'right' }"
                  @click="archiveConfirm(WorkshopSource.TEKLA)"
                >
                  <font-awesome-icon
                    class="archive-icon"
                    :icon="['fa', 'archive']"
                  />
                </div>
              </div>

              <div class="p-col-12">
                <processing-edit-details
                  v-if="!noTekla && copyModelProcessing"
                  :is-manual="false"
                  :process-record="copyModelProcessing"
                  :isArchived="teklaIsArchived"
                  :traceability-options="traceabilityOptions"
                  @showInstallDateEdit="
                    onShowInstallDateEdit(WorkshopSource.TEKLA)
                  "
                />
              </div>
            </div>
          </AccordionTab>
          <AccordionTab>
            <template #header>
              <span>Planned Work</span>
            </template>
            <div class="p-grid">
              <div
                class="p-col-6 p-grid"
                v-for="equip of sortedEquipment"
                :key="equip.id"
              >
                <div
                  class="p-col-2"
                  v-bind:style="{
                    display: 'flex',
                    alignItems: 'center',
                    justifyItems: 'center',
                  }"
                >
                  <Checkbox
                    :id="equip.id"
                    :name="equip.lookupname"
                    :value="equip.id"
                    v-model="selectedEquipment"
                  />
                </div>

                <div class="p-col-10 input-label">{{ equip.lookupname }}</div>
              </div>
            </div>
          </AccordionTab>

          <AccordionTab header="Progress Log">
            <div>
              <div class="p-grid sidebar-grid">
                <div class="p-col-10">
                  <div class="p-grid">
                    <div class="p-col-3 input-label">Log Date</div>
                    <div class="p-col-9">
                      <calendar
                        class="input-date"
                        date-format="yy-mm-dd"
                        :model-value="
                          logDate ? utils.getDate(logDate.toString()) : ''
                        "
                        :manual-input="false"
                        @update:model-value="logDate = utils.getEpoch($event)"
                      />
                    </div>

                    <div class="p-col-3 input-label">Metres Scheduled</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        mode="decimal"
                        v-model="metresScheduled"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        suffix=" metres"
                        :disabled="awaitingResponse"
                        :allowEmpty="false"
                      />
                    </div>

                    <div class="p-col-3 input-label">Time Scheduled</div>
                    <div class="p-col-9">
                      <input-text
                        class="input-text-field"
                        :model-value="
                          date.getDuration(timeScheduled, 'minutes')
                        "
                        disabled
                      />
                    </div>

                    <div class="p-col-3 input-label">Metres Completed</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        mode="decimal"
                        v-model="metresCompleted"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        suffix=" metres"
                        :disabled="awaitingResponse"
                        :allowEmpty="false"
                      />
                    </div>

                    <div class="p-col-3 input-label">Time Completed</div>
                    <div class="p-col-9">
                      <input-text
                        class="input-text-field"
                        :model-value="
                          date.getDuration(timeCompleted, 'minutes')
                        "
                        disabled
                      />
                    </div>

                    <div class="p-col-3 input-label">
                      Total Metres Completed
                    </div>
                    <div class="p-col-9">
                      <input-text
                        class="input-text-field total-metres-completed"
                        :class="{
                          'over-total-metres':
                            totalMetresCompleted > linkedLot.totalmeters,
                        }"
                        :model-value="`${totalMetresCompleted} metres / ${linkedLot.totalmeters} metres`"
                        disabled
                      />
                    </div>

                    <div class="p-col-3 input-label">Total Time Completed</div>
                    <div class="p-col-9">
                      <input-text
                        class="input-text-field"
                        :model-value="
                          date.getDuration(totalTimeCompleted, 'minutes')
                        "
                        disabled
                      />
                    </div>

                    <div class="p-col-3 input-label">Reason</div>
                    <div class="p-col-9">
                      <textarea
                        class="input-textarea"
                        rows="2"
                        v-model="logReason"
                      />
                    </div>
                  </div>
                </div>

                <div class="p-col-2 sidebar-options">
                  <div
                    :style="{ display: showProgressSave ? '' : 'none' }"
                    class="option"
                    @click="saveNewProcess()"
                  >
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'plus-circle']"
                    />
                  </div>
                </div>
              </div>
              <ProgressLogTable :data="filteredLogs"></ProgressLogTable>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </sidebar>
    <InstallDateEdit
      v-if="showInstallDateEdit"
      :details="
        installDateEditSource === workshop.tekla
          ? copyModelProcessing
          : copyModelProcessingManual
      "
      :awaiting-response="awaitingResponse"
      :audit-logs="
        installDateEditSource === workshop.tekla ? teklaLogs : manualLogs
      "
      :isArchived="
        installDateEditSource === workshop.tekla
          ? teklaIsArchived
          : manualIsArchived
      "
      @closePopup="showInstallDateEdit = false"
      @saveNewDate="handleSaveNewDate"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<style lang="scss" scoped></style>
