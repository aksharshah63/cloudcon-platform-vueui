<script lang="ts">
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";
import ProgressSpinner from "primevue/progressspinner";
import Sidebar from "primevue/sidebar";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import moment from "moment";
import { computed, defineComponent, onMounted, reactive, Ref, ref } from "vue";
import {
  IAuditLog,
  IAuditLogMapped,
  ILot,
} from "../../use/controller/workshop/workshop.d";
import { IFabricationRecord } from "../../use/controller/workshop/fabrication.d";
import { IRecord } from "../../store/modules/upvise.d";
import useControllerFabrication from "../../use/controller/workshop/fabrication";
import useWorkshopController from "../../use/controller/workshop/workshop";
import InstallDateEdit from "./installDateEdit.vue";
import FabricationLogTable from "../../components/workshop/fabricationLogTable.vue";
import FabricationEditDetails from "../../pages/workshop/fabricationEditDetails.vue";
import LotEdit from "../../pages/workshop/lotEditDetails.vue";
import { useState } from "../../store/index";
import maths from "../../use/utils/useNumberOperations";
import utils from "../../use/function/useUtils";
import { WorkshopSource } from "../../use/utils/useConstants";

export const fabricationEdit = defineComponent({
  name: "FabricationEdit",
  components: {
    FabricationEditDetails,
    Accordion,
    AccordionTab,
    Calendar,
    ConfirmDialog,
    InputNumber,
    ProgressSpinner,
    Sidebar,
    InstallDateEdit,
    FabricationLogTable,
    LotEdit,
  },
  props: {
    fabricationId: {
      type: String,
      required: true,
    },
    qualifiedWelders: {
      type: Array as () => IRecord[],
      required: true,
    },
    allPaintTypes: {
      type: Array as () => IRecord[],
      required: true,
    },
    stageProjects: {
      type: Array as () => IRecord[],
      required: false,
      default: () => [],
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const controller = useControllerFabrication(upvise);
    const workshop = useWorkshopController(upvise);
    const id = ref(props.lotId);
    const title = ref("NO NAME");
    const showLot = ref(true);
    //const showSave = ref(false);

    const fabManual = props.fabricationId
      ? controller.getEditFabrication(props.fabricationId, true)
      : null;
    const fabTekla = props.fabricationId
      ? controller.getEditFabrication(props.fabricationId, false)
      : null;
    let originalFabManual = fabManual
      ? reactive(utils.deepCopy(fabManual))
      : null;
    let originalFabTekla = fabTekla ? reactive(utils.deepCopy(fabTekla)) : null;
    const linkedLot =
      fabManual?.lotid || fabTekla?.lotid
        ? workshop.getEditLinkedLot(fabManual?.lotid || fabTekla?.lotid || "")
        : null;
    let originalLinkedLot = linkedLot ? utils.deepCopy(linkedLot) : null;

    const toFab = ref(0);
    const completedToday = ref(0);
    const estimatedTime = ref(0);
    const memberCount = ref(0);
    const totalCompleted = ref(0);
    const logDate = ref(Date.now());
    const logReason = ref("");
    const combinedAuditLogs: Ref<IAuditLogMapped[]> = ref([]);
    const showInstallDateEdit = ref(false);
    const installDateEditSource = ref();
    const awaitingResponse = ref(false);
    const allWelders = ref(props.qualifiedWelders);
    const paintTypes = ref(props.allPaintTypes);
    const hasTekla = ref(fabTekla !== null);
    const hasManual = ref(fabManual !== null);
    const accordionActiveTabs = ref(hasTekla.value ? [2] : [1]);
    //const totalFabTime = ref(0);
    const teklaTabTooltip = ref("");
    const manualTabTooltip = ref("");
    const currentlyArchiving = ref(false);
    const confirm = useConfirm();
    const awaitingArchive = ref(false);
    const archiveConfirm = (source: string) => {
      confirm.require({
        message: "Are you sure you want to archive this record?",
        header: "Archive Fabrication Record",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          if (
            source === WorkshopSource.TEKLA ||
            source === WorkshopSource.MANUAL
          )
            deleteFabrication(source);
        },
      });
    };

    onMounted(() => {
      initialiseValues();

      if (originalFabTekla) {
        title.value = originalFabTekla.name || "";
      } else if (originalFabManual) {
        title.value = originalFabManual.name || "";
      }

      if (!hasManual.value) manualTabTooltip.value = "No Manual Entry";
      else if (manualIsArchived.value)
        manualTabTooltip.value = "Entry has been archived";
      if (!hasTekla.value) teklaTabTooltip.value = "No Tekla Entry";
    });

    const manualIsArchived = computed(() => {
      return originalFabManual?.isactive == 0;
    });

    const teklaIsArchived = computed(() => {
      return originalFabTekla?.isactive == 0;
    });

    const totalFabTime = computed(() =>
      maths.round((estimatedTime.value * memberCount.value * toFab.value) / 100)
    );

    const fabTime = computed(() =>
      maths.round(
        (estimatedTime.value * memberCount.value * completedToday.value) / 100
      )
    );

    const total = computed(() =>
      maths.sum(totalCompleted.value, completedToday.value)
    );

    const showSave = computed(
      () => checkManualUpdate() || checkTeklaUpdate() || checkLotUpdate()
    );

    const showProgressSave = computed(() => {
      return (
        // (toFab.value !==
        //   (hasTekla.value
        //     ? originalFabTekla?.toFab
        //     : originalFabManual.value?.toFab) ||
        // totalFabTime.value !==
        //   (hasTekla.value
        //     ? originalFabTekla?.totalFabTime
        //     : originalLotManual.value?.totalFabTime) ||
        // completedToday.value !==
        //   (hasTekla.value
        //     ? originalFabTekla?.completedToday
        //     : originalLotManual.value?.completedToday) ||
        // fabTime.value !==
        //   (hasTekla.value
        //     ? originalFabTekla?.fabTime
        //     : originalLotManual.value?.fabTime)) &&
        !awaitingResponse.value
      );
    });

    const manualLogs = computed(() => {
      return fabManual?.id ? workshop.getFabricationLogs(fabManual?.id) : [];
    });

    const teklaLogs = computed(() => {
      return fabTekla?.id ? workshop.getFabricationLogs(fabTekla?.id) : [];
    });

    const filteredLogs = computed(() => {
      return hasTekla.value
        ? workshop.filterFabricationLogsForTotalCount(teklaLogs.value)
        : workshop.filterFabricationLogsForTotalCount(manualLogs.value);
    });

    // function assignData(fabrication: IFabricationRecord, lot: ILot) {
    //   if (fabrication.source === workshop.manual)
    //     assignManual(fabrication, lot);
    //   else assignTekla(fabrication, lot);
    // }

    // function assignTekla(teklaFab: IFabricationRecord, teklaLot: ILot) {
    //   copyLotTekla.value = teklaLot;
    //   originalLotTekla.value = JSON.parse(JSON.stringify(teklaLot));
    //   copyFabTekla.value = teklaFab;
    //   originalFabTekla.value = JSON.parse(JSON.stringify(teklaFab));
    //   hasTekla.value = true;
    //   accordionActiveTabs.value = [1];
    // }

    // function assignManual(manualFab: IFabricationRecord, manualLot: ILot) {
    //   copyLotManual.value = manualLot;
    //   originalLotManual.value = JSON.parse(JSON.stringify(manualLot));
    //   copyFabManual.value = manualFab;
    //   originalFabManual.value = JSON.parse(JSON.stringify(manualFab));
    //   manualIsArchived.value = manualFab.isactive == 0;
    //   hasManual.value = true;
    //   manualId.value = manualFab.id;
    // }

    function checkTeklaUpdate() {
      return JSON.stringify(fabTekla) !== JSON.stringify(originalFabTekla);
    }

    function checkManualUpdate() {
      return JSON.stringify(fabManual) !== JSON.stringify(originalFabManual);
    }

    function checkLotUpdate() {
      return JSON.stringify(linkedLot) !== JSON.stringify(originalLinkedLot);
    }

    function initialiseValues() {
      if (hasTekla.value) {
        //toFab.value = fabTekla?.toFab || 0;
        //completedToday.value = fabTekla?.completedToday || 0;
        estimatedTime.value = fabTekla?.estimatedtime || 0;
        memberCount.value = fabTekla?.memberCount || 0;
        totalCompleted.value = fabTekla?.totalCompleted || 0;
      } else {
        //toFab.value = fabManual?.toFab || 0;
        //completedToday.value = fabManual?.completedToday || 0;
        estimatedTime.value = fabManual?.estimatedtime || 0;
        memberCount.value = fabManual?.memberCount || 0;
        totalCompleted.value = fabManual?.totalCompleted || 0;
      }
    }

    function saveFabrication() {
      const lotToSave: ILot[] = [];
      const fabToSave: IFabricationRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      const isTeklaUpdate = checkTeklaUpdate();
      const isManualUpdate = checkManualUpdate();
      const isLotUpdate = checkLotUpdate();

      if (fabTekla && originalFabTekla && isTeklaUpdate) {
        auditToSave.push(
          workshop.createFabricationLog(originalFabTekla, fabTekla, "")
        );
        fabToSave.push(fabTekla);
      } else if (fabManual && originalFabManual && isManualUpdate) {
        auditToSave.push(
          workshop.createFabricationLog(originalFabManual, fabManual, "")
        );
        fabToSave.push(fabManual);
      } else if (linkedLot && originalLinkedLot && isLotUpdate) {
        lotToSave.push(linkedLot);
      }

      awaitingResponse.value = true;
      const payload = {
        TableWorkshopLot: lotToSave,
        TableWorkshopFabrication: fabToSave,
        TableWorkshopFabricationlogs: auditToSave,
      };

      if (workshop.getValidSave(payload))
        workshop
          .doSaveModelEntities(payload)
          .then(() => {
            originalLinkedLot = utils.deepCopy(linkedLot);
            originalFabTekla = utils.deepCopy(fabTekla);
            originalFabManual = utils.deepCopy(fabManual);
            awaitingResponse.value = false;
          })
          .catch((error) => {
            console.log(error);
            awaitingResponse.value = false;
          });
      else awaitingResponse.value = false;
    }

    function deleteFabrication(source: string) {
      const fabToSave: IFabricationRecord[] = [];
      const auditToSave: IAuditLog[] = [];

      awaitingArchive.value = true;
      awaitingResponse.value = true;
      currentlyArchiving.value = true;

      if (source === WorkshopSource.TEKLA && fabTekla && originalFabTekla) {
        fabTekla.isactive = 0;
        auditToSave.push(
          workshop.createFabricationLog(originalFabTekla, fabTekla, "")
        );
        fabToSave.push(fabTekla);
      } else if (
        source === WorkshopSource.MANUAL &&
        fabManual &&
        originalFabManual
      ) {
        fabManual.isactive = 0;
        auditToSave.push(
          workshop.createFabricationLog(originalFabManual, fabManual, "")
        );
        fabToSave.push(fabManual);
      }

      const payload = {
        TableWorkshopFabrication: fabToSave,
        TableWorkshopFabricationlogs: auditToSave,
      };

      workshop
        .doSaveModelEntities(payload)
        .then(() => {
          if (originalFabTekla) Object.assign(originalFabTekla, fabTekla);
          if (originalFabManual) Object.assign(originalFabManual, fabManual);
          awaitingResponse.value = false;
          awaitingArchive.value = false;
          currentlyArchiving.value = false;
        })
        .catch((error) => {
          console.log(error);
          awaitingResponse.value = false;
          awaitingArchive.value = false;
          currentlyArchiving.value = false;
        });
    }

    function closeFabrication() {
      showLot.value = false;
      emit("closeFabrication");
    }

    function saveNewLog() {
      const fabToSave: IFabricationRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      const newToFab = toFab.value;
      const newCompletedToday = completedToday.value;
      const newTotalFabTime = totalFabTime.value;
      const newFabTime = fabTime.value;
      const newTotalCompleted = total.value;

      if (hasTekla.value && fabTekla && originalFabTekla) {
        const newFab = utils.deepCopy(originalFabTekla);
        newFab.toFab = newToFab;
        newFab.completedToday = newCompletedToday;
        newFab.totalFabTime = newTotalFabTime;
        newFab.fabTime = newFabTime;
        newFab.totalCompleted = newTotalCompleted;

        fabToSave.push(newFab);
        auditToSave.push(
          workshop.createFabricationLog(
            originalFabTekla,
            newFab,
            logReason.value,
            logDate.value
          )
        );
      } else if (!hasTekla.value && fabManual && originalFabManual) {
        const newFabManual = utils.deepCopy(originalFabManual);
        newFabManual.toFab = newToFab;
        newFabManual.completedToday = newCompletedToday;
        newFabManual.totalFabTime = newTotalFabTime;
        newFabManual.fabTime = newFabTime;
        newFabManual.totalCompleted = newTotalCompleted;

        fabToSave.push(newFabManual);
        auditToSave.push(
          workshop.createFabricationLog(
            originalFabManual,
            newFabManual,
            logReason.value,
            logDate.value
          )
        );
      }

      awaitingResponse.value = true;
      const payload = {
        TableWorkshopFabrication: fabToSave,
        TableWorkshopFabricationlogs: auditToSave,
      };

      if (workshop.getValidSave(payload))
        workshop
          .doSaveModelEntities(payload)
          .then(() => {
            if (hasTekla.value && fabTekla && originalFabTekla) {
              fabTekla.toFab = newToFab;
              fabTekla.completedToday = newCompletedToday;
              fabTekla.totalFabTime = newTotalFabTime;
              fabTekla.fabTime = newFabTime;
              fabTekla.totalCompleted = newTotalCompleted;
              totalCompleted.value = newTotalCompleted;
              originalFabTekla = utils.deepCopy(fabTekla);
            } else if (!hasTekla.value && fabManual && originalFabManual) {
              fabManual.toFab = newToFab;
              fabManual.completedToday = newCompletedToday;
              fabManual.totalFabTime = newTotalFabTime;
              fabManual.fabTime = newFabTime;
              fabManual.totalCompleted = newTotalCompleted;
              totalCompleted.value = newTotalCompleted;
              originalFabManual = utils.deepCopy(fabManual);
            }
            awaitingResponse.value = false;
          })
          .catch((error) => {
            console.log(error);
            awaitingResponse.value = false;
          });
      else awaitingResponse.value = false;
    }

    function handleSaveNewDate(
      newDate: string,
      reason: string,
      source: string
    ) {
      const newDateValue = moment(newDate).valueOf();
      const fabToSave: IFabricationRecord[] = [];
      const auditToSave: IAuditLog[] = [];
      const oldFab = utils.deepCopy(
        source === WorkshopSource.TEKLA ? originalFabTekla : originalFabManual
      );
      const newFab = utils.deepCopy(oldFab);

      if (oldFab && newFab) {
        newFab.installdate = newDateValue;

        auditToSave.push(workshop.createFabricationLog(oldFab, newFab, reason));

        fabToSave.push(newFab);

        awaitingResponse.value = true;
        const payload = {
          TableWorkshopFabrication: fabToSave,
          TableWorkshopFabricationlogs: auditToSave,
        };

        if (workshop.getValidSave(payload))
          workshop
            .doSaveModelEntities(payload)
            .then(() => {
              if (
                source === WorkshopSource.TEKLA &&
                fabTekla &&
                originalFabTekla
              ) {
                fabTekla.installdate = newDateValue;
                originalFabTekla.installdate = newDateValue;
              } else if (fabManual && originalFabManual) {
                fabManual.installdate = newDateValue;
                originalFabManual.installdate = newDateValue;
              }
              awaitingResponse.value = false;
            })
            .catch(() => {
              awaitingResponse.value = false;
            });
        else awaitingResponse.value = false;
      }
    }

    function showInstallDateEditScreen(source: string) {
      installDateEditSource.value = source;
      showInstallDateEdit.value = true;
    }

    function tabOpened(event: Record<string, unknown>) {
      let index = (event.index as number) ?? -1;
      switch (index) {
        case 1:
          if (!hasManual.value || currentlyArchiving.value) {
            accordionActiveTabs.value = accordionActiveTabs.value.filter(
              (val) => val != 1
            );
          }
          break;
        case 2:
          if (!hasTekla.value) {
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
    return {
      utils,
      workshop,
      id,
      title,
      showLot,
      fabManual,
      fabTekla,
      originalFabManual,
      originalFabTekla,
      linkedLot,
      showSave,
      toFab,
      totalFabTime,
      completedToday,
      fabTime,
      total,
      logReason,
      logDate,
      combinedAuditLogs,
      showInstallDateEdit,
      installDateEditSource,
      allWelders,
      hasTekla,
      hasManual,
      paintTypes,
      accordionActiveTabs,
      //installDateFormatted,
      showProgressSave,
      manualLogs,
      teklaLogs,
      filteredLogs,
      awaitingResponse,
      saveFabrication,
      closeFabrication,
      saveNewLog,
      handleSaveNewDate,
      showInstallDateEditScreen,
      manualIsArchived,
      teklaIsArchived,
      manualTabTooltip,
      teklaTabTooltip,
      archiveConfirm,
      awaitingArchive,
      WorkshopSource,
      //updateOptionsValue,
      tabOpened,
      tabClosed,
    };
  },
});
export default fabricationEdit;
</script>

<template>
  <div>
    <sidebar class="fabrication-screen" :visible="showLot" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"> Fabrication </span>
            </div>
          </div>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveFabrication()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeFabrication()">
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
                  :class="!hasManual ? ' p-disabled' : ''"
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
                  v-if="hasManual && !manualIsArchived && !awaitingArchive"
                  class="option"
                  v-bind:style="{ textAlign: 'right' }"
                  @click="archiveConfirm(WorkshopSource.MANUAL)"
                >
                  <font-awesome-icon
                    class="archive-icon"
                    :icon="['fa', 'archive']"
                  />
                </div>
              </div>

              <div class="p-col-12">
                <fabrication-edit-details
                  v-if="hasManual"
                  :fabrication-record="fabManual"
                  :manual="true"
                  :archived="manualIsArchived"
                  :qualified-welders="allWelders"
                  :all-paint-types="paintTypes"
                  @showInstallDateEdit="
                    showInstallDateEditScreen(WorkshopSource.MANUAL)
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
                  :class="!hasTekla ? ' p-disabled' : ''"
                  v-bind:style="{ width: '100%', height: '100%' }"
                >
                  <div
                    class="p-grid"
                    v-bind:style="{ width: '100%', height: '100%' }"
                  >
                    <div class="p-col-12">Tekla</div>
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
                  v-if="hasTekla && !teklaIsArchived && !awaitingArchive"
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
                <fabrication-edit-details
                  v-if="hasTekla"
                  :fabrication-record="fabTekla"
                  :manual="false"
                  :archived="teklaIsArchived"
                  :qualified-welders="allWelders"
                  :all-paint-types="paintTypes"
                  @showInstallDateEdit="
                    showInstallDateEditScreen(WorkshopSource.TEKLA)
                  "
                />
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

                    <div class="p-col-3 input-label">% to Fab</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        suffix="%"
                        v-model="toFab"
                        :disabled="awaitingResponse"
                      />
                    </div>
                    <div class="p-col-3 input-label">Total Fab Time</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        mode="decimal"
                        :minFractionDigits="1"
                        :maxFractionDigits="2"
                        v-model="totalFabTime"
                        disabled
                      />
                    </div>
                    <div class="p-col-3 input-label">% Completed Today</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        suffix="%"
                        v-model="completedToday"
                        :disabled="awaitingResponse"
                      />
                    </div>
                    <div class="p-col-3 input-label">Fab Time</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        mode="decimal"
                        :minFractionDigits="1"
                        :maxFractionDigits="2"
                        v-model="fabTime"
                        disabled
                      />
                    </div>
                    <div class="p-col-3 input-label">Total</div>
                    <div class="p-col-9">
                      <input-number
                        class="input-number-field"
                        mode="decimal"
                        suffix="%"
                        v-model="total"
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
                    v-if="showProgressSave"
                    class="option"
                    @click="saveNewLog()"
                  >
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'plus-circle']"
                    />
                  </div>
                </div>
              </div>
              <FabricationLogTable :data="filteredLogs"></FabricationLogTable>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </sidebar>
    <InstallDateEdit
      v-if="showInstallDateEdit"
      :details="
        installDateEditSource === WorkshopSource.TEKLA ? fabTekla : fabManual
      "
      :awaiting-response="awaitingResponse"
      :audit-logs="
        installDateEditSource === WorkshopSource.TEKLA ? teklaLogs : manualLogs
      "
      :isArchived="
        installDateEditSource === WorkshopSource.TEKLA
          ? teklaIsArchived
          : manualIsArchived
      "
      @closePopup="showInstallDateEdit = false"
      @saveNewDate="handleSaveNewDate"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<style scoped></style>
