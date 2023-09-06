<script lang="ts">
import { UpviseDataMessage } from "../../store/modules/upvise";
import { IRecord, IUpviseDataMessage } from "../../store/modules/upvise.d";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { defineComponent, onMounted, ref, watchEffect } from "vue";

import useControllerNotification from "../../use/controller/notification/notification";
import { stateSymbol, useState } from "../../store/index";
import NotificationEdit from "../../../src/pages/notification/notificationEdit.vue";
import { IRecordNotification } from "../../use/controller/notification/notification.d";
import useLocalForage from "../../use/utils/useLocalForage";

export const Notification = /*#__PURE__*/ defineComponent({
  name: "Notification",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    NotificationEdit,
  },
  setup() {
    const controller = useControllerNotification(useState().upvise);
    const upviseDataMessage = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const notificationId = ref();
    const showNotification = ref(false);
    const linkedTableFields = ref();
    const upviseTableData = ref(
      {} as Record<
        string,
        { tableName: string; data: Record<string, unknown>[] }
      >
    );
    const localForageInstance = useLocalForage.getInstance("upvise", "tables");
    const defaultTimeZone = ref("Australia/Melbourne");
    const moduleCustomFields = ref([] as IRecord[]);

    onMounted(async () => {
      await controller
        .getMetadata()
        .then((data) => (upviseDataMessage.value = data));
      //console.log("upviseDataMessage:", upviseDataMessage.value);

      await controller
        .getUpviseTableData()
        .then((result) => (upviseTableData.value = result))
        .catch(() => console.log("Unable to get upvise table data"));
      //console.log("upviseTableData", upviseTableData.value);

      await getDefaultTimeZone();
      await getModuleCustomFields();

      linkedTableFields.value = controller.getLinkedTableFields(
        upviseTableData.value.metadata.data as Record<string, unknown>[]
      );
      //console.log("linkedTableFields", linkedTableFields.value);

      controller.fetch();
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (groupName === "TableEmployeedashboardNotificationrules") {
        notificationId.value = itemId;
        showNotification.value = true;
        //console.log(`action for ${action} ${groupName} ${itemId} ${parentId}`);
      } else {
        console.log(
          `No valid action for ${action} ${groupName} ${itemId} ${parentId}`
        );
      }
    }

    function save(currentGroupType: string, item: IRecord) {
      if (currentGroupType === "TableEmployeedashboardNotificationrules") {
        controller.doSaveModelEntities({
          TableEmployeedashboardNotificationrules: [
            item as unknown as IRecordNotification,
          ],
        });
      } else {
        console.log(`No valid save for ${currentGroupType}`);
      }
    }

    function closeNotification() {
      setTimeout(() => {
        showNotification.value = false;
      }, 200);
    }

    async function getDefaultTimeZone() {
      return await useLocalForage
        .getData("system.user.settings", localForageInstance)
        .then((result: unknown) => {
          if (result) {
            const settings = result as IRecord[];
            const timeZone = settings.find(
              (setting) =>
                setting["id"]?.toString().toLowerCase() === "defaulttimezone"
            );
            if (timeZone)
              defaultTimeZone.value = (timeZone["value"] as string) ?? "";
          }
        });
    }

    async function getModuleCustomFields() {
      return await useLocalForage
        .getData("uny.notes.fields", localForageInstance)
        .then((result: unknown) => {
          if (result) moduleCustomFields.value = result as IRecord[];
        });
    }

    watchEffect(() => {
      //console.log("state has changed");
      controller.setNameForRules(upviseTableData.value);
    });

    return {
      upviseDataMessage,
      notificationId,
      showNotification,
      linkedTableFields,
      upviseTableData,
      defaultTimeZone,
      moduleCustomFields,
      groupedItemClick,
      save,
      closeNotification,
    };
  },
});

export default Notification;
</script>

<template>
  <dashboard-overview
    title="Notification"
    module-name="notification"
    :upvise-data-message="upviseDataMessage"
    :show-view-toggle="false"
    :show-header-toggle="false"
    tick-icon-field="isactive"
    @groupedItemClick="groupedItemClick"
    @save="save"
  >
  </dashboard-overview>

  <notification-edit
    v-if="showNotification"
    :upvise-data-message="upviseDataMessage"
    :notification-id="notificationId"
    :upvise-table-data="upviseTableData"
    :linked-table-fields="linkedTableFields"
    :default-time-zone="defaultTimeZone"
    :module-custom-fields="moduleCustomFields"
    @closeNotification="closeNotification"
  ></notification-edit>
</template>

<style lang="scss" scoped>

</style>
