<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  toRefs,
  onMounted,
  onUnmounted,
  watchEffect,
} from "vue";
import Card from "primevue/card";
import BarChart from "../../../charts/BarChart.vue";
import HorizontalBarChart from "../../../charts/HorizontalBarChart.vue";
import LineChart from "../../../charts/LineChart.vue";
import useControllerDashboard from "../../../use/controller/dashboard/dashboard";
import DashletConfig from "./dashletConfig.vue";
import MultiBarChart from "../../../charts/MultiBarChart.vue";
import ProgressSpinner from "primevue/progressspinner";
import { stateSymbol, useState } from "../../../store";
import axios from "axios";
import BaywatchWidget from "../../../pages/baywatch/baywatchWidget.vue";
import { IBaywatchBayinfo } from "../../../use/controller/baywatch/baywatch.d";
import useControllerBaywatch from "../../../use/controller/baywatch/baywatch";
import BulletChart from "../../../charts/BulletChart.vue";
import DashletsPieChart from "../../../charts/DashletsPieChart.vue";

// export interface IDashlet {
//   id: string;
//   component: any;
// }

export const Dashlet = /*#__PURE__*/ defineComponent({
  name: "Dashlet",
  inject: [stateSymbol.description!],
  components: {
    Card,
    DashletConfig,
    ProgressSpinner,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const dashletMap = {
      "bar-chart": BarChart,
      "horizontal-bar-chart": HorizontalBarChart,
      "line-chart": LineChart,
      "multi-bar-chart": MultiBarChart,
      "baywatch-widget": BaywatchWidget,
      "bullet-chart": BulletChart,
      "pie-chart": DashletsPieChart,
    };

    const upvise = useState().upvise;
    const isDraggable = ref(false);
    const dragCounter = ref(0);
    const editing = ref(false);
    const showIndicator = computed(() => dragCounter.value > 0);
    const isDeleting = ref(false);
    const controller = useControllerDashboard(upvise);
    const dashletProperties = computed(() => controller.getDashlet(props.id));
    const { type, config, dataconfig } = toRefs(dashletProperties.value);
    const data = ref({});
    const categories = ref();
    const options = computed(() => ({
      data: data.value,
      config: JSON.parse(config.value),
      categories: categories.value,
    }));
    const dataConfig = computed(() => JSON.parse(dataconfig.value));
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const baywatchController = useControllerBaywatch(upvise);

    function setDraggable(val: boolean) {
      isDraggable.value = val;
    }
    const awaitingResponse = ref(false);
    function dropHandler(event: DragEvent) {
      event.preventDefault();
      context.emit("dropped");
      dragCounter.value = 0;
    }

    function dragHandler() {
      context.emit("dragged");
    }

    function dragoverHandler(event: DragEvent) {
      event.preventDefault();
    }

    function dragenterHandler(event: DragEvent) {
      event.preventDefault();
      dragCounter.value += 1;
    }

    function dragleaveHandler() {
      dragCounter.value -= 1;
    }

    function handleDelete() {
      isDeleting.value = true;
      controller.deleteDashlet(props.id);
    }

    function handleEdit() {
      editing.value = !editing.value;
    }

    onMounted(async () => {
      // TODO Data fetching for a dashlet should be extracted out of here and passed into component instead
      if (type.value === "baywatch-widget") {
        const bayWidgetsData = Object.values(
          upvise.entityData(baywatchController.bayTable)
        ) as unknown as IBaywatchBayinfo[];
        const bayWidgetRecord = bayWidgetsData.find(
          (bayWidget) => bayWidget.id === dataConfig.value.sourceid
        );

        if (bayWidgetRecord) data.value = bayWidgetRecord;
        else data.value = {};
      } else {
        awaitingResponse.value = true;
        controller
          .getChartDataFiltered(
            dataConfig.value.source,
            JSON.stringify(dataConfig.value.selector),
            {
              ...(dataConfig.value.options ?? {
                chartName: "",
                xField: "",
                yField: "",
              }),
              timeZone:
                Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Etc/UTC",
            },
            source
          )
          .then((value) => {
            console.log("DASHLET DATA", value);
            awaitingResponse.value = false;
            data.value =
              dataConfig.value.type === "series" ? value.series : value.data;
            categories.value = value.categories ?? [];
          })
          .catch((_) => {
            awaitingResponse.value = false;
          });
      }
    });

    onUnmounted(() => {
      source.cancel("data request cancelled");
    });

    watchEffect(() => {
      if (type.value === "baywatch-widget") {
        const bayWidgetsData = Object.values(
          upvise.entityData(baywatchController.bayTable)
        ) as unknown as IBaywatchBayinfo[];
        const bayWidgetRecord = bayWidgetsData.find(
          (bayWidget) => bayWidget.id === dataConfig.value.sourceid
        );

        if (bayWidgetRecord) data.value = bayWidgetRecord;
        else data.value = {};
      }
    });

    return {
      setDraggable,
      isDraggable,
      isDeleting,
      dropHandler,
      dragHandler,
      dragoverHandler,
      dragenterHandler,
      dragleaveHandler,
      showIndicator,
      dashletMap,
      type,
      options,
      handleDelete,
      handleEdit,
      editing,
      awaitingResponse,
    };
  },
});
export default Dashlet;
</script>

<template>
  <div
    :draggable="isDraggable"
    @dragend="setDraggable(false)"
    @drop="dropHandler($event)"
    @dragover="dragoverHandler($event)"
    @dragstart="dragHandler()"
    @dragenter="dragenterHandler($event)"
    @dragleave="dragleaveHandler()"
  >
    <div v-if="showIndicator" class="insertIndicator" />
    <Card class="dashletCard">
      <template #title>
        <div
          class="dashlet-header p-d-flex p-jc-between"
          @mousedown="setDraggable(true)"
        >
          <div>
            <i class="pi pi-bars"></i>
          </div>

          <div>
            <!-- <i @click="handleEdit()" class="pi pi-pencil"></i> -->
            <i v-if="isDeleting">
              <ProgressSpinner
                :style="{ height: '16px', width: '16px' }"
              ></ProgressSpinner>
            </i>
            <i v-else @click="handleDelete()" class="pi pi-times"></i>
          </div>
        </div>
      </template>
      <template #content>
        <ProgressSpinner
          v-if="awaitingResponse"
          :style="{ height: '500px', width: '100%' }"
        ></ProgressSpinner>
        <dashlet-config
          v-else-if="editing"
          :id="id"
          :style="{ height: '500px', width: '100%' }"
        />
        <component
          v-else
          :is="dashletMap[type]"
          v-bind="options"
          :style="{
            height: type === 'baywatch-widget' ? '100%' : '500px',
            width: '100%',
          }"
        />
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>


.insertIndicator {
  margin-bottom: 1px;
  background: $blue;
  border-radius: 5px;
  height: 10px;
  width: 100%;
}

.pi {
  cursor: pointer;
}

.dashletCard {
  border-radius: 15px;
}
</style>
