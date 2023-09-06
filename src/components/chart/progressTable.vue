<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import AvatarBox from "../display/avatarBox.vue";
import InputText from "primevue/inputtext";
import { IFormSubmissionDetails } from "../../use/controller/project/planner.d";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import moment from "moment-timezone";

interface IProgressTableData {
  name: string;
  email: string;
  count: number;
}

export const ProgressTable = /*#__PURE__*/ defineComponent({
  name: "ProgressTable",
  components: { AvatarBox, InputText },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
  },
  setup() {
    const formSubmissionsData = require("../../store/mock/formSubmissionsData.json");

    const tableHeaders = ref<string[]>([]);

    const selectedDate = ref(0);
    const dateRange = ref({
      start: "",
      end: "",
    });

    onMounted(() => {
      // getting the initial date range

      selectedDate.value = moment().startOf("month").unix();
      window.addEventListener("resize", windowResizeHandler);
      changeDateRange();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", windowResizeHandler);
    });

    function windowResizeHandler() {
      changeDateRange();
    }

    const formSubmissions = ref<IFormSubmissionDetails[]>(formSubmissionsData);

    const maxCount = computed(() => {
      // todo: needs to calculate the maxCount based on the largest number in tableItems
      return 50;
    });

    const tableItems = computed(() => {
      let data: IProgressTableData[] = [];

      let submissions = formSubmissions.value;

      let startRange = moment(selectedDate.value, "X").startOf("M");
      let endRange = moment(selectedDate.value, "X").endOf("M");
      submissions = submissions.filter((data) => {
        return moment(data.uploadDate, "x").isBetween(startRange, endRange);
      });

      submissions.forEach((submission) => {
        // todo: we can add filters here later unless it is processed by backend

        const index = data.findIndex(
          (user: IProgressTableData) => user.email === submission.email
        );

        // if doesn't exist, create entry
        if (index === -1) {
          data.push({
            name: submission.name,
            email: submission.email,
            count: 1,
          });
        } else {
          // add name if missing name and exist in submission
          if (!data[index].name) {
            data[index].name = submission.name;
          }
          // magic is here. increase count for the table
          data[index].count++;
        }
      });

      return data;
    });

    function changeDateRange() {
      dateRange.value.start = moment(selectedDate.value, "X")
        .startOf("month")
        .format("MMM YYYY");

      dateRange.value.end = moment(selectedDate.value, "X")
        .startOf("month")
        .add(30, "d")
        .format("MMM YYYY");

      tableHeaders.value = [];

      // todo: based on the maxCount, we determine the number of headers to show
      // and the numbers to show based on the numbers in table items

      // we calculate headers here
      for (let i = 0; i < 5; i++) {
        tableHeaders.value.push((i * 10).toString());
      }
    }

    function getBarWidth(count: number) {
      const percent = (count / maxCount.value) * 100;

      return { width: percent + "%" };
    }

    function previousRange() {
      selectedDate.value = moment(selectedDate.value, "X")
        .startOf("month")
        .subtract(1, "M")
        .unix();
      changeDateRange();
    }

    function nextRange() {
      selectedDate.value = moment(selectedDate.value, "X")
        .startOf("month")
        .add(1, "M")
        .unix();
      changeDateRange();
    }

    function getHeaderStyle() {
      let headerCount = tableHeaders.value.length;

      return { "grid-template-columns": `300px repeat(${headerCount}, 1fr)` };
    }

    return {
      tableItems,
      selectedDate,
      getHeaderStyle,
      tableHeaders,
      dateRange,
      getBarWidth,
      previousRange,
      nextRange,
    };
  },
});
export default ProgressTable;
</script>

<template>
  <!-- <pre>{{ tableItems }}</pre> -->
  <div class="table-view">
    <div class="p-grid">
      <div class="p-col-4"></div>
      <div class="p-col-4 date-selector p-d-flex p-ai-center p-jc-center">
        <span v-tooltip.top="'Go back a month'">
          <font-awesome-icon
            class="pointer"
            @click="previousRange()"
            :icon="['fa', 'chevron-left']"
          />
        </span>
        <span class="p-mx-4">
          {{ dateRange.start }}
        </span>
        <span v-tooltip.top="'Go forward a month'">
          <font-awesome-icon
            class="pointer"
            @click="nextRange()"
            :icon="['fa', 'chevron-right']"
          />
        </span>
      </div>
      <div class="p-col-4 p-d-flex p-jc-end p-ai-center">
        <!-- job item search -->
        <span class="p-input-icon-right p-mr-3">
          <i class="pi pi-search" />
          <InputText type="text" placeholder="Search" />
        </span>
      </div>
    </div>
    <div class="table-wrapper">
      <div class="table-header" :style="getHeaderStyle()">
        <div class="p-pl-4">Name</div>
        <div class="header-items" v-for="(header, h) in tableHeaders" :key="h">
          {{ header }}
        </div>
      </div>
      <div class="table-content">
        <div class="table-content-item">
          <div
            class="table-content-task"
            v-for="(item, i) in tableItems"
            :key="i"
          >
            <div class="p-pl-3">
              <AvatarBox
                :name="item.name.length > 0 ? item.name : item.email"
                small
                class="p-mr-2"
              />
              {{ item.name.length > 0 ? item.name : item.email }}
            </div>
            <div class="table-item-wrapper">
              <div
                class="table-item-container"
                :style="getBarWidth(item.count)"
              >
                {{ item.count }}
              </div>

              <div
                class="table-item-grid"
                :style="{
                  'grid-template-columns': `repeat(${tableHeaders.length}, 1fr)`,
                }"
              >
                <div v-for="(header, k) in tableHeaders" :key="k"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- end table content -->
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.table-view {
  font-family: "Poppins", serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  padding: 24px;
  background-color: $white;
  width: 100%;

  .date-selector {
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    text-align: center;
    user-select: none;
  }

  .table-wrapper {
    position: relative;
    overflow: hidden;
    margin-top: 13px;

    .table-header {
      height: 40px;
      display: grid;
      // grid-template-columns: 400px 1fr 1fr 1fr;
      background: $grey;
      border-radius: 8px;

      div {
        // border: 1px solid green;
        order: 2;
        border-right: 1px solid $grey5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        text-transform: uppercase;
        color: $grey3;

        &:first-of-type {
          justify-content: start;
        }

        &:last-of-type {
          border-right: none;
        }
      }

      .header-items {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        font-style: normal;
        font-weight: normal;
        font-size: 8px;
        line-height: 140%;
        color: #999999;
        padding-left: 4px;
        padding-bottom: 4px;
        .header-names {
          order: 1;
        }
        .header-dates {
          order: 0;
        }
      }
    }

    .table-content {
      .table-content-task {
        border-bottom: 1px solid $grey;
        font-size: 12px;
        line-height: 16px;
        color: $grey9;

        &:last-of-type {
          border-bottom: none;
        }
      }

      .table-content-task {
        display: grid;

        grid-template-columns: 300px auto;
        border-radius: 8px;

        border-radius: 8px;
        height: 48px;

        // all divs inside
        & > div {
          border-right: 1px solid $grey5;
          display: flex;
          align-items: center;
          justify-content: center;
          &:last-of-type {
            border-right: none;
          }
        }

        // direct children divs
        & > div:first-of-type {
          justify-content: start;

          &:last-of-type {
            border-right: none;
          }
        }

        .select-item {
          color: $grey5;
          cursor: pointer;

          &.selected {
            color: $blue;
          }
        }
      }
    }

    .table-item-wrapper {
      position: relative;
      .table-item-container {
        position: absolute;
        left: 0px;
        height: 24px;
        background: #007fff;
        border-radius: 4px;
        width: 0%;
        border-radius: 4px;
        display: block;
        z-index: 2;
        font-size: 12px;
        line-height: 16px;
        color: #ffffff;
        padding-right: 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        transition: width 0.5s;
      }

      .table-item-grid {
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid !important;
        div {
          height: 100%;
          border-right: 1px solid $grey;
        }
        z-index: 1;
      }
    }
  }
  .p-input-icon-right i {
    padding-right: 8px;
  }

  .p-inputtext {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 32px;
    padding-left: 20px;
    height: 24px;
    // padding-right: 10px;
  }
}
</style>
