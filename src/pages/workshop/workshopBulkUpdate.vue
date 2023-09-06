<script lang="ts">
import { IRecord } from "../../store/modules/upvise.d";
import ProgressSpinner from "primevue/progressspinner";
import Sidebar from "primevue/sidebar";
import { computed, defineComponent, PropType, ref, watch } from "vue";

import { useState } from "../../store/index";
import utils from "../../use/function/useUtils";
import Calendar from "primevue/calendar";
import useWorkshopController from "../../use/controller/workshop/workshop";
import { ModuleNames, useTableNames } from "../../use/utils/useConstants";

export const WorkshopBulkUpdate = /*#__PURE__*/ defineComponent({
  name: "WorkshopBulkUpdate",
  props: {
    module: {
      type: String as PropType<ModuleNames>,
      required: true,
    },
    selectedRows: {
      type: Array as PropType<{ row: Record<string, any>; group: string }[]>,
      required: true,
    },
  },
  components: {
    Calendar,
    ProgressSpinner,
    Sidebar,
  },
  setup(props, { emit }) {
    const upvise = useState().upvise;
    const workshop = useWorkshopController(upvise);
    const showWorkshopBulkUpdate = ref(true);
    const showSave = ref(false);
    const awaitingResponse = ref(false);
    const installDate = ref<number>();

    const selectedWorkshopRecords = computed(() => {
      const selectedRecords: Record<string, IRecord> = {};
      const tableName =
        props.module === ModuleNames.FABRICATION
          ? useTableNames.WORKSHOP_FABRICATION
          : props.module === ModuleNames.PROCESSING
          ? useTableNames.WORKSHOP_PROCESSING
          : null;

      if (!tableName) return selectedRecords;

      const tableData = upvise.entityData(tableName);

      props.selectedRows.forEach((selectedRow) => {
        const group = selectedRow.group;
        const row = selectedRow.row;

        if (
          group === useTableNames.WORKSHOP_PROCESSING ||
          group === useTableNames.WORKSHOP_FABRICATION
        ) {
          const workshopRow = tableData[row.id];
          if (workshopRow && !((workshopRow.id as string) in selectedRecords))
            selectedRecords[workshopRow.id as string] = workshopRow;
        } else {
          Object.values(tableData)
            .filter(
              (workshopRow) =>
                "dateallocationid" in workshopRow &&
                workshopRow.dateallocationid === row.id
            )
            .forEach((workshopRow) => {
              if (!((workshopRow.id as string) in selectedRecords))
                selectedRecords[workshopRow.id as string] = workshopRow;
            });
        }
      });

      return selectedRecords;
    });

    function saveWorkshopBulkUpdate() {
      awaitingResponse.value = true;

      const newFields = {
        installdate: installDate.value,
      };
      const updatedData = Object.values(selectedWorkshopRecords.value).map(
        (record) => {
          return Object.assign({ id: record.id }, newFields) as IRecord;
        }
      );
      const dataToSave: Record<string, IRecord[]> = {};

      if (props.module === ModuleNames.FABRICATION)
        dataToSave[useTableNames.WORKSHOP_FABRICATION] = updatedData;
      else if (props.module === ModuleNames.PROCESSING)
        dataToSave[useTableNames.WORKSHOP_PROCESSING] = updatedData;

      workshop
        .doSaveModelEntities(dataToSave)
        .then(() => {
          awaitingResponse.value = false;
          closeWorkshopBulkUpdateScreen();
          emit("clearSelected");
        })
        .catch(() => {
          awaitingResponse.value = false;
          //closeWorkshopBulkUpdateScreen();
        });
    }

    function closeWorkshopBulkUpdateScreen() {
      showWorkshopBulkUpdate.value = false;
      emit("closeWorkshopBulkUpdate");
    }

    watch(
      installDate,
      utils.debounce(() => {
        showSave.value = !!installDate.value;
      })
    );

    return {
      utils,
      props,
      showWorkshopBulkUpdate,
      showSave,
      awaitingResponse,
      installDate,
      selectedWorkshopRecords,
      saveWorkshopBulkUpdate,
      closeWorkshopBulkUpdateScreen,
    };
  },
});

export default WorkshopBulkUpdate;
</script>

<template>
  <div>
    <sidebar
      class="workshop-bulk-update-screen"
      position="right"
      :visible="showWorkshopBulkUpdate"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <span class="header-name">{{
            `Update ${props.module} Records`
          }}</span>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveWorkshopBulkUpdate()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeWorkshopBulkUpdateScreen()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-3 input-label">Work Date</div>
        <div class="p-col-9">
          <calendar
            class="input-date"
            dateFormat="yy-mm-dd"
            :model-value="installDate ? utils.getDate(installDate) : ''"
            :manualInput="false"
            @update:model-value="installDate = utils.getEpoch($event)"
          />
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-12">
          <span class="header-list-item">Selected Records</span>
          <ul>
            <li v-for="item in selectedWorkshopRecords" :key="item.id">
              {{ `${item.projectCode} - ${item.name} (${item.source})` }}
            </li>
          </ul>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped lang="scss">

</style>
