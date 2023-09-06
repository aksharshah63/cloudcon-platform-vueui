<script lang="ts">
import { IBaywatchBayinfo } from "../../use/controller/baywatch/baywatch.d";
import { computed, defineComponent, watch } from "vue";
import InputText from "primevue/inputtext";
import useControllerBaywatch from "../../use/controller/baywatch/baywatch";
import { useState } from "../../store/index";

export const BaywatchWidget = /*#__PURE__*/ defineComponent({
  name: "BaywatchWidget",
  components: {
    InputText,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const upvise = useState().upvise;
    const baywatchController = useControllerBaywatch(upvise);

    const bayData = computed(() => {
      return props.data as IBaywatchBayinfo;
    });

    // function resizeTextArea(event: any) {
    //   const textarea = event.currentTarget;

    //   if (textarea) {
    //     textarea.style.height = "auto";
    //     textarea.style.height = textarea.scrollHeight + "px";
    //   }
    // }

    watch(
      () => bayData.value.notes,
      () => {
        const bay = Object.values(
          upvise.entityData(baywatchController.bayTable)
        ).find((bay) => bay.id === bayData.value.id);
        if (bay) bay.notes = bayData.value.notes;
      }
    );

    return {
      bayData,
    };
  },
});

export default BaywatchWidget;
</script>

<template>
  <div class="p-grid bay-widget-parent">
    <div class="p-col-12 p-grid header">{{ bayData.bayContactName }}</div>

    <div class="p-col-12 p-grid last-scan">
      <div class="p-col-3">Last Scan:</div>
      <div class="p-col-9">
        {{ bayData.lastscanstage }} - {{ bayData.formattedLastScanTime }}
      </div>
    </div>

    <div class="p-col-12 p-grid welder">
      <div class="p-col-3">Current Welder:</div>
      <div class="p-col-9">{{ bayData.currentContactName }}</div>
    </div>

    <div class="p-col-12 label">Current Job</div>

    <div class="p-col-12 p-grid job">
      <div class="p-col-3 bundle">{{ bayData.currentJobBundle }}</div>
      <div
        class="p-col-9"
        :style="{
          'background': bayData.releaseColour ? `#${bayData.releaseColour}` : 'transparent'
        }"
      >{{ bayData.currentJobName }}</div>
    </div>

    <div class="p-col-12 label">Notes</div>

    <div class="p-col-12 notes">
      <textarea class="input-textarea" rows="2" v-model="bayData.notes" />
    </div>
  </div>
</template>

<style scoped lang="scss">


.bay-widget-parent {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  width: 500px;
  text-align: center;

  > div {
    border-width: 1px 1px 0 1px;
    border-style: solid;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:last-child {
      border-bottom-width: 1px;
    }

    > div {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  }

  &.p-grid {
    margin: 0;
  }

  .p-grid {
    margin: 0;
  }

  .header {
    font-size: 28px;
    min-height: 59px;
    background-color: #e03a21;
    padding: 8px;
  }

  .last-scan {
    min-height: 43px;
    background-color: #e5efdb;

    > div:first-child {
      border-width: 0 1px 0 0;
      border-style: solid;
    }
  }

  .welder {
    min-height: 43px;
    background-color: #c1e989;

    > div:first-child {
      border-width: 0 1px 0 0;
      border-style: solid;
    }
  }

  .label {
    background-color: #d9d9d9;
    padding: 8px;
  }

  .job {
    min-height: 58px;

    > div:first-child {
      border-width: 0 1px 0 0;
      border-style: solid;
    }

    .bundle {
      font-size: 28px;
      font-weight: bold;
    }
  }

  .notes {
    min-height: 60px;

    .input-textarea {
      box-shadow: none;
      font-size: 18px;
    }
  }
}
</style>
