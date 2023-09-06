<script lang="ts">
import useControllerDynamicEdit from "../../use/controller/dynamic/dynamicEdit";
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
  watchEffect,
} from "vue";
import EditSidebar from "./editSidebar.vue";
import utils from "../../use/function/useUtils";
import { ITableRecord } from "cloudconLibrary/store/modules/tableData/tableDataModule";
import { useTableNames } from "cloudconLibrary/utilities/useConstants";
import EditSidebarDynamicBody from "./editSidebarDynamicBody.vue";

export const EditSidebarDynamic = /*#__PURE__*/ defineComponent({
  name: "EditSidebarDynamic",
  emits: ["closeSidebar"],
  components: {
    EditSidebar,
    EditSidebarDynamicBody,
  },
  props: {
    moduleName: {
      type: String,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      required: true,
    },
    titlePropertyKey: {
      type: String as PropType<string>,
      required: false,
    },
    showSidebar: {
      type: Boolean,
      required: true,
    },
    width: {
      type: String,
      required: false,
      default: "500px",
    },
    isNew: {
      type: Boolean,
      required: true,
    },
    itemId: {
      type: String,
      required: false,
    },
    metadata: {
      type: Object as PropType<any>,
      required: true,
    },
    entityLookup: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const controller = useControllerDynamicEdit(
      props.entityLookup as useTableNames
    );
    const currentItem = ref<ITableRecord>({});
    const showSave = ref(false);
    const awaitingResponse = ref(false);

    const displayTitle = computed(() => {
      if (
        props.isNew &&
        currentItem.value[
          props.titlePropertyKey as keyof typeof currentItem.value
        ] == null
      )
        return "Add " + props.title;
      else if (
        !props.isNew &&
        currentItem.value[
          props.titlePropertyKey as keyof typeof currentItem.value
        ] == null
      )
        return "Edit " + props.title;
      else if (
        props.isNew &&
        currentItem.value[
          props.titlePropertyKey as keyof typeof currentItem.value
        ] != null
      )
        return (
          "Adding - " +
          currentItem.value[
            props.titlePropertyKey as keyof typeof currentItem.value
          ]
        );
      else if (
        !props.isNew &&
        currentItem.value[
          props.titlePropertyKey as keyof typeof currentItem.value
        ] != null
      )
        return (
          "Editing - " +
          currentItem.value[
            props.titlePropertyKey as keyof typeof currentItem.value
          ]
        );
      else return "";
    });

    const filteredColumns = computed(() => {
      let filteredValue = props.metadata.filter(
        (c: any) => c.Label != null && c.Visible
      );
      filteredValue.forEach((c: any) => {
        c.CurrentObjectKey = getObjectKey(c);
      });
      return filteredValue;
    });

    function getObjectKey(column: any) {
      if (column.IsCustom) {
        return utils.getCustomFieldName(column.InternalName, column.Title);
      } else {
        return column.InternalName;
      }
    }

    function getCurrentItem(isNew: boolean, itemId: string): ITableRecord {
      if (isNew) {
        return {};
      } else {
        return utils.deepCopy(controller.getItem(itemId));
      }
    }

    function requiredFieldsFilled(currentItem: ITableRecord) {
      let requiredFields = filteredColumns.value.filter(
        (c: any) => c.IsRequired == true
      );
      return (
        requiredFields.filter((c: any) =>
          currentItem.value
            ? ([c.CurrentObjectKey] as unknown as string) !== "" &&
              currentItem.value
              ? [c.CurrentObjectKey] != null
              : true
            : true
        ).length == requiredFields.length
      );
    }

    async function deleteItem() {
      awaitingResponse.value = true;
      controller
        .deleteItem(
          props.entityLookup as useTableNames,
          currentItem.value as ITableRecord
        )
        .then(() => {
          awaitingResponse.value = false;
          closeSidebar();
        })
        .catch(() => {
          awaitingResponse.value = false;
        });
    }

    async function saveItem() {
      awaitingResponse.value = true;
      controller
        .saveItem(
          props.entityLookup as useTableNames,
          currentItem.value as ITableRecord
        )
        .then(() => {
          awaitingResponse.value = false;
          closeSidebar();
        })
        .catch(() => {
          awaitingResponse.value = false;
        });
    }

    function closeSidebar() {
      emit("closeSidebar");
    }

    watch(
      currentItem,
      utils.debounce(() => {
        showSave.value = requiredFieldsFilled(
          currentItem.value as ITableRecord
        );
      }, 500),
      { deep: true }
    );

    watchEffect(() => {
      currentItem.value = getCurrentItem(props.isNew, props.itemId!);
    });

    return {
      currentItem,
      showSave,
      awaitingResponse,
      displayTitle,
      deleteItem,
      saveItem,
      closeSidebar,
    };
  },
});
export default EditSidebarDynamic;
</script>

<template>
  <EditSidebar
    :moduleName="moduleName"
    :showSidebar="showSidebar"
    :width="width"
    :title="displayTitle"
    :description="'(*) Required fields'"
    :saveButton="showSave"
    :isUpdating="awaitingResponse"
    @save="saveItem()"
    @delete="deleteItem()"
    @closeSidebar="closeSidebar"
  >
    <template v-slot:body>
      <EditSidebarDynamicBody
        :currentItem="currentItem"
        :metadata="metadata"
        :entityLookup="entityLookup"
      />
    </template>
  </EditSidebar>
</template>

<style lang="scss" scoped></style>
