<script lang="ts">
import upvise, { UpviseDataMessage } from "../../store/modules/upvise";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { computed, defineComponent, onMounted, ref } from "vue";

import useControllerLookups from "../../use/controller/lookups/lookups";
import { ILookupRecord } from "../../use/controller/lookups/lookups.d";
import LookupsEdit from "./lookupsEdit.vue";
import { stateSymbol, useState } from "../../store/index";
import { useToast } from "primevue/usetoast";
import { IUpviseDataMessage, IGridSlicing } from "../../store/modules/upvise.d";

export const Lookups = /*#__PURE__*/ defineComponent({
  name: "Lookups",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    LookupsEdit,
  },
  setup() {
    const controller = useControllerLookups(useState().upvise);
    const upviseDataMessage = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const lookupId = ref();
    const showLookup = ref(false);
    const uploadSuccessful = ref();
    const headerActionButtons = [
      {
        action: "activeUpdate",
        tooltip: "Update to Active",
        icon: "check",
      },
      {
        action: "inactiveUpdate",
        tooltip: "Update to Inactive",
        icon: "ban",
      },
    ];

    onMounted(async () => {
      await controller.getMetadata().then((m) => (upviseDataMessage.value = m));
      console.log("upviseDataMessage:", upviseDataMessage.value);
      controller.fetch();
    });

    const typeOptions = computed(() => {
      const options = new Set();
      Object.values(
        useState().upvise.entityData("TableEmployeedashboardLookups")
      ).forEach((lookup) => options.add(lookup.lookuptype));
      const optionsArray: { lookuptype: string }[] = [];
      options.forEach((option) =>
        optionsArray.push({ lookuptype: option as string })
      );
      return optionsArray;
    });
    const slicingInformation = computed(() => {
      //JSON Object, for each tab send filter that needs to be applied!
      //{[fieldNames], displayName, filterToApply}
      const returnArray: Record<string, IGridSlicing[]> = {
        TableEmployeedashboardLookups: [],
      };
      returnArray["TableEmployeedashboardLookups"].push({
        fieldNames: [""],
        displayName: "All",
        filtersToApply: {
          none: {
            operator: "and",
            constraints: [
              {
                value: null,
                matchMode: "equals",
              },
            ],
          },
        },
      });
      const typesCreated: string[] = [];
      const lookupsData = Object.values(
        upvise.entityData("TableEmployeedashboardLookups")
      );
      lookupsData.forEach((entry: Record<string, unknown>) => {
        if (!typesCreated.includes(entry.lookuptype as string)) {
          returnArray["TableEmployeedashboardLookups"].push({
            fieldNames: ["lookuptype"],
            displayName: entry.lookuptype as string,
            filtersToApply: {
              lookuptype: {
                operator: "and",
                constraints: [
                  {
                    value: entry.lookuptype as string,
                    matchMode: "equals",
                  },
                ],
              },
            },
          });
          typesCreated.push(entry.lookuptype as string);
        }
      });
      return returnArray;
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (groupName === "TableEmployeedashboardLookups") {
        lookupId.value = itemId;
        showLookup.value = true;
      } else {
        console.log(
          `No valid action for ${action} ${groupName} ${itemId} ${parentId}`
        );
      }
    }

    function closeLookup() {
      setTimeout(() => {
        showLookup.value = false;
      }, 200);
      uploadSuccessful.value = true;
    }

    async function saveLookup(data: ILookupRecord[]) {
      uploadSuccessful.value = undefined;
      if (data.every((d) => controller.doValidateLookup(d)))
        await controller
          .doSaveLookup(data)
          .then(() => closeLookup())
          .catch(() => {
            useToast().add({
              severity: "error",
              summary: "Operation Unsuccessful",
              detail: "Could not save the lookup",
              life: 1500,
            });
            uploadSuccessful.value = false;
          });
      else uploadSuccessful.value = false;
    }

    const rowsSelected = ref();
    function gridRowsSelected(rows: Record<string, string | ILookupRecord>[]) {
      var lookupRecordRows = rows.map((r) => r.row);
      rowsSelected.value = lookupRecordRows;
    }

    function onHeaderActionClicked(action: string) {
      switch (action) {
        case "activeUpdate":
          updateActiveStatus(rowsSelected.value, 1);
          break;
        case "inactiveUpdate":
          updateActiveStatus(rowsSelected.value, 0);
      }
    }

    function updateActiveStatus(rowsToUpdate: ILookupRecord[], status: number) {
      rowsToUpdate.forEach((lookupRecord) => {
        // convert start date and end date to millionseconds
        lookupRecord.startdate = new Date(lookupRecord.startdate).getTime();
        lookupRecord.enddate = new Date(lookupRecord.enddate).getTime();

        //update isActive status
        lookupRecord.isactive = status;
      });

      //save updated rows
      saveLookup(rowsToUpdate);
    }

    return {
      upviseDataMessage,
      lookupId,
      showLookup,
      typeOptions,
      uploadSuccessful,
      groupedItemClick,
      closeLookup,
      slicingInformation,
      saveLookup,
      headerActionButtons,
      gridRowsSelected,
      onHeaderActionClicked,
    };
  },
});

export default Lookups;
</script>

<template>
  <dashboard-overview
    title="Lookups"
    module-name="lookups"
    :upvise-data-message="upviseDataMessage"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :force-show-add="true"
    :edit-on-click="true"
    :slicing-information="slicingInformation"
    :upload-successful="uploadSuccessful"
    :header-action-buttons="headerActionButtons"
    :show-file-export="true"
    :show-file-import="true"
    @groupedItemClick="groupedItemClick"
    @closeLookup="closeLookup"
    @saveToUpvise="saveLookup"
    @headerActionClicked="onHeaderActionClicked"
    @rowsSelected="gridRowsSelected"
  >
  </dashboard-overview>

  <lookups-edit
    v-if="showLookup"
    :lookup-id="lookupId"
    :type-options="typeOptions"
    @closeLookup="closeLookup"
    @saveLookup="saveLookup"
  ></lookups-edit>
</template>

<style lang="scss" scoped>

</style>
