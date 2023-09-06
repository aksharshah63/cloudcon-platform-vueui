<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import Sidebar from "primevue/sidebar";
import ProgressSpinner from "primevue/progressspinner";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
import { ICustomField } from "../../../cloudconLibrary/store/modules/customFieldData/customFieldDataModule";
import customFieldDataAccess from "../../../cloudconLibrary/store/modules/customFieldData/customFieldDataAccess";
import utils from "../../use/function/useUtils";
import { customFields } from "../../controllers/customfield";
import { IRequestCustomFieldUpdate } from "cloudconLibrary/api/apiInterfaces";

export const customFieldEdit = /*#__PURE__*/ defineComponent({
  name: "customFieldEdit",
  components: {
    Sidebar,
    ProgressSpinner,
    InputText,
    Textarea,
    Checkbox,
  },
  props: {
    formTemplateFieldId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const tenants_id = useCookies.get(cookieKeys.TENANT_ID);
    const awaitingResponse = ref(false);
    const showFormTemplateFieldEdit = ref(true);
    const showSave = ref(false);
    const { customField } = customFields;
    // const fieldNeedOnchange = [
    //     "Combo Box",
    //     "MultiselectCombo Box",
    // ];

    const copyformTemplateFieldData = computed<ICustomField>(() => {
      return customFieldDataAccess.getCustomFieldById(
        props.formTemplateFieldId
      );
    });

    const originalformTemplateFieldData = utils.deepCopy(
      copyformTemplateFieldData.value
    );

    watch(copyformTemplateFieldData.value, (newValue) => {
      showSave.value = !utils.equalObjects(
        newValue,
        originalformTemplateFieldData
      );
    });

    function closeFormTemplateEdit() {
      showFormTemplateFieldEdit.value = false;
      console.log(`show edit pane: ${showFormTemplateFieldEdit.value}`);
      emit("closeFormTemplateEdit");
    }

    async function saveField() {
      const _updatedata = {
        entity: "contacts",
        id: copyformTemplateFieldData.value.id,
        // name: copyformTemplateFieldData.value.name,
        label: copyformTemplateFieldData.value.label,
        position: copyformTemplateFieldData.value.position,
        // options: copyformTemplateFieldData.value.options,
        type: copyformTemplateFieldData.value.type,
      };
      console.log("save changes");
      console.log(copyformTemplateFieldData.value);
      if (tenants_id) {
        awaitingResponse.value = true;
        await customFieldDataAccess.updateCustomField(
          parseInt(tenants_id),
          _updatedata as IRequestCustomFieldUpdate
        );
        awaitingResponse.value = false;
      }
    }

    return {
      copyformTemplateFieldData,
      customField,
      awaitingResponse,
      showFormTemplateFieldEdit,
      closeFormTemplateEdit,
      showSave,
      saveField,
    };
  },
});
export default customFieldEdit;
</script>
<template>
  <div>
    <Sidebar
      :visible="showFormTemplateFieldEdit"
      class="notification-screen"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"
                >Field: {{ copyformTemplateFieldData.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveField()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeFormTemplateEdit()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>
        <div class="p-col-12 input-label">Name</div>
        <div class="p-col-12">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyformTemplateFieldData.label"
            maxlength="225"
          />
        </div>

        <div class="p-col-12 input-label">Default Value</div>
        <div class="p-col-12">
          <Textarea
            v-model="copyformTemplateFieldData.value"
            rows="5"
            cols="30"
            class="input-text-field"
          />
        </div>
        <!-- for some fields only -->
        <div
          v-if="
            customField
              .map((x) => x.key)
              .includes(copyformTemplateFieldData.type)
          "
          class="p-col-12 input-label"
        >
          Options
        </div>
        <div class="p-col-12">
          <Textarea
            v-model="copyformTemplateFieldData.type"
            rows="5"
            cols="30"
            class="input-text-field"
          />
        </div>
        <div
          v-if="customField.includes(copyformTemplateFieldData.type)"
          class="p-col-12"
        >
          <Textarea
            v-model="copyformTemplateFieldData.options"
            rows="5"
            cols="30"
            class="input-text-field"
          />
        </div>

        <div class="p-col-12 input-label">Onchange</div>
        <div class="p-col-12">
          <Textarea
            v-model="copyformTemplateFieldData.onchange"
            rows="5"
            cols="30"
            class="input-text-field"
          />
        </div>

        <!-- for some fields only -->
        <div class="p-col-12 input-label">Script</div>
        <div class="p-col-12">
          <Textarea
            v-model="copyformTemplateFieldData.value"
            rows="5"
            cols="30"
            class="input-text-field"
          />
        </div>

        <div class="p-col-5 input-label">Mandatory</div>
        <div class="p-col-7">
          <Checkbox
            v-model="copyformTemplateFieldData.mandatory"
            :binary="true"
            class="input-checkbox"
          />
        </div>

        <div class="p-col-5 input-label">Hidden</div>
        <div class="p-col-7">
          <Checkbox
            v-model="copyformTemplateFieldData.hidden"
            :binary="true"
            class="input-checkbox"
          />
        </div>
      </div>
    </Sidebar>
  </div>
</template>
<style lang="scss" scoped>
.sidebar-grid {
  padding: 12px;
  margin: 0;
}
.header-name {
  font-weight: 600;
  font-size: 18px;
  color: #000000;
  cursor: default;
}
.sidebar-options {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 0;
}
.option {
  margin: 0 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  border: 1px solid #dddddd;
  cursor: pointer;
}
</style>
