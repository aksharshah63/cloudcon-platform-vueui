<script lang="ts">
import { IUpviseDataMessage, IRecord } from "../../store/modules/upvise.d";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import moment from "moment-timezone";
import ProgressBarItem from "../../components/chart/progressBarItem.vue";
import { useState } from "../../store/index";
import utils from "../../use/function/useUtils";

export const ViewTimeline = /*#__PURE__*/ defineComponent({
  name: "ViewTimeline",
  components: {
    ProgressBarItem,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    isProjectsTimeline: {
      type: Boolean,
      required: false,
      default: false,
    },
    parentId: {
      type: String,
      required: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const state = useState().upvise;
    const hiddenRows = ref<string[]>([]);
    const timelineHeaders = ref([
      {
        name: "",
        date: 0,
        width: 1,
      },
    ]);
    const isMonthlyView = ref(false);
    const startTimestamp = ref(0);
    const endTimestamp = ref(0);
    const currentDate = ref(0);
    const currentDatePosition = ref(400);
    const currentMonth = ref(0);
    const selectedDate = ref(0);
    const dateRange = ref({
      start: "",
      end: "",
    });

    const grouping = computed(() => {
      return props.upviseDataMessage?.definition?.Grouping || {};
    });

    function getParentName(level: number) {
      return grouping.value[level - 1]?.LookupKey + "id";
    }

    function groupType(level: number) {
      return grouping.value[level]?.Type;
    }

    function groupName(level: number) {
      return grouping.value[level]?.Name;
    }

    function groupLookupKey(level: number) {
      return grouping.value[level]?.LookupKey;
    }

    function notLowestGroup(level: number) {
      return !!grouping.value[level + 1];
    }

    function groupExists(level: number) {
      return !!grouping.value[level];
    }

    onMounted(() => {
      // getting the initial date range
      currentDate.value = moment().unix();
      currentMonth.value = moment().unix();
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

    function changeDateRange() {
      startTimestamp.value = moment(selectedDate.value, "X").unix();

      // the 75day addition from startof month of current date
      // is just to something i came up with to make sure
      // we always have 3 months of range
      endTimestamp.value = moment(selectedDate.value, "X")
        .add(isMonthlyView.value ? 30 : 90, "d")
        .unix();

      dateRange.value.start = moment(selectedDate.value, "X")
        .startOf("month")
        .format("MMM YYYY");

      dateRange.value.end = moment(selectedDate.value, "X")
        .startOf("month")
        .add(isMonthlyView.value ? 30 : 90, "d")
        .format("MMM YYYY");

      timelineHeaders.value = [];

      if (isMonthlyView.value) {
        let week: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let currentDay = moment(selectedDate.value, "X").day();

        let daysInMonth = moment(selectedDate.value, "X").daysInMonth();

        timelineHeaders.value = [];
        let date = moment(selectedDate.value, "X").date();

        for (let i = date; i < date + 30; i++) {
          let day = i;
          if (day > daysInMonth) {
            day = day - daysInMonth;
          }
          timelineHeaders.value.push({
            name: week[currentDay % 7],
            date: day,
            width: 1,
          });
          currentDay++;
          // console.log(week[i % 7]);
        }
      } else {
        timelineHeaders.value = getQuarterlyHeaders();
      }

      let box = document.querySelector(".timeline-wrapper");
      let width = box?.clientWidth || 0;

      const startDiff = currentDate.value - startTimestamp.value;
      const rangeDiff = endTimestamp.value - startTimestamp.value;
      // const t = endTimestamp.value - start;

      // startVal comes from the fix width of tasks name column + the border-left value
      let startVal = 308;
      const left = (startDiff / rangeDiff) * (width - startVal);

      currentDatePosition.value = startVal + left;
    }

    function getData(level: number, parentId?: string) {
      const tableName = groupType(level);
      if (tableName == null) return;

      const data = Object.values(state.entityData(tableName));

      if (parentId) {
        return data.filter(
          (item) =>
            item[getParentName(level)] === parentId && utils.IsActive(item)
        );
      } else if (props.parentId) {
        return data.filter(
          (item) => item.projectid === props.parentId && utils.IsActive(item)
        );
      } else return data;
    }

    function getTimelinePosition(item: IRecord) {
      // do not show the item if no startdate
      if (!item.startdate || !item.enddate) return { display: "none" };

      const start = parseInt(item.startdate.toString()) / 1000;
      const end = parseInt(item.enddate.toString()) / 1000;

      // todo: this should be filtered out instead of just hiding
      // -- unless we only show tasks/timelines that have overlapping dates with range
      // check if dates are outside of current range
      if (start > endTimestamp.value) return { display: "none" };
      if (end < startTimestamp.value) return { display: "none" };

      // calculate the size of the item in timeline
      const dateWidth = endTimestamp.value - startTimestamp.value;
      const itemWidth = end - start;
      const percent = (itemWidth / dateWidth) * 100;

      const startDiff = start - startTimestamp.value;
      const rangeDiff = endTimestamp.value - startTimestamp.value;
      // const t = endTimestamp.value - start;

      const left = (startDiff / rangeDiff) * 100;

      return { left: left + "%", width: percent + "%" };
    }

    function previousRange(days: number) {
      selectedDate.value = moment(selectedDate.value, "X")
        .subtract(days, "d")
        // .startOf("month")
        .unix();
      changeDateRange();
    }

    function nextRange(days: number) {
      selectedDate.value = moment(selectedDate.value, "X")
        .add(days, "d")
        // .startOf("month")
        .unix();
      changeDateRange();
    }

    function toggleRow(itemId: string) {
      console.log("toggleRow", itemId);

      if (!hiddenRows.value.includes(itemId)) {
        hiddenRows.value.push(itemId);
      } else {
        hiddenRows.value = hiddenRows.value.filter((row) => row !== itemId);
      }
    }

    // get timeline headers for each month in quarterly view
    function getQuarterlyHeaders() {
      const start = moment(startTimestamp.value, "X").startOf("day");
      const end = moment(endTimestamp.value, "X").endOf("day");
      const numberOfMonths =
        end
          .clone()
          .endOf("month")
          .diff(start.clone().startOf("month"), "months") + 1;
      const headersArray = new Array(numberOfMonths).fill(0);

      headersArray.forEach((_, index) => {
        let width;
        // if first element get days from start timestamp to end of the month
        if (index === 0)
          width = start.clone().endOf("month").diff(start, "days") + 1;
        // else if last element get days from start of month to end timestamp
        else if (index === headersArray.length - 1)
          width = end.diff(end.clone().startOf("month"), "days");
        // else get days in month
        else
          width = start.clone().startOf("month").add(index, "M").daysInMonth();

        headersArray[index] = {
          name: moment(selectedDate.value, "X")
            .add(index, "M")
            .endOf("month")
            .format("MMM"),
          date: 0,
          width: width,
        };
      });

      return headersArray.filter((h) => h.width > 0);
    }

    function getHeaderStyle() {
      return {
        "grid-template-columns": `300px ${timelineHeaders.value
          .map((h) => h.width + "fr")
          .join(" ")}`,
      };
    }

    function formatDate(timestamp: string) {
      return moment(timestamp, "x").format("YYYY-MMM-DD");
    }

    watch(isMonthlyView, () => {
      changeDateRange();
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      emit("groupedItemClick", action, groupName, itemId, parentId);
    }

    return {
      groupedItemClick,
      formatDate,
      selectedDate,
      getHeaderStyle,
      isMonthlyView,
      currentDatePosition,
      timelineHeaders,
      toggleRow,
      dateRange,
      currentDate,
      startTimestamp,
      endTimestamp,
      getTimelinePosition,
      getData,
      previousRange,
      nextRange,
      hiddenRows,
      groupType,
      groupName,
      groupLookupKey,
      notLowestGroup,
      groupExists,
    };
  },
});
export default ViewTimeline;
</script>

<template>
  <div>
    <div class="timeline">
      <div class="p-grid">
        <div class="p-col-4"></div>
        <div class="p-col-4 timeline-months p-d-flex p-ai-center p-jc-center">
          <div
            @click="previousRange(30)"
            class="pointer p-mr-3"
            v-tooltip.top="'Go back 30 days'"
          >
            <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
            <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
          </div>
          <span v-tooltip.top="'Go back 7 days'">
            <font-awesome-icon
              class="pointer"
              @click="previousRange(7)"
              :icon="['fa', 'chevron-left']"
            />
          </span>
          <span class="p-mx-4">
            {{ dateRange.start }}
            <span v-if="!isMonthlyView"> - {{ dateRange.end }}</span>
          </span>
          <span v-tooltip.top="'Go forward 7 days'">
            <font-awesome-icon
              class="pointer"
              @click="nextRange(7)"
              :icon="['fa', 'chevron-right']"
            />
          </span>
          <div
            @click="nextRange(30)"
            class="pointer p-ml-3"
            v-tooltip.top="'Go forward 30 days'"
          >
            <font-awesome-icon
              class="pointer"
              :icon="['fa', 'chevron-right']"
            />
            <font-awesome-icon
              class="pointer"
              :icon="['fa', 'chevron-right']"
            />
          </div>
        </div>
        <div class="p-col-4 p-d-flex p-jc-end">
          <div class="timeline-toggle">
            <div
              class="timeline-toggle-option"
              :class="{ selected: isMonthlyView }"
              @click="isMonthlyView = true"
            >
              MONTH
            </div>
            <div
              class="timeline-toggle-option"
              :class="{ selected: !isMonthlyView }"
              @click="isMonthlyView = false"
            >
              QUARTER
            </div>
          </div>
        </div>
      </div>

      <div class="p-d-flex p-jc-between">
        <div></div>
        <div class="timeline-months"></div>
      </div>

      <div class="timeline-wrapper">
        <div class="timeline-header" :style="getHeaderStyle()">
          <div class="p-pl-4">Task Name</div>
          <div
            class="header-items"
            v-for="(header, h) in timelineHeaders"
            :key="h"
          >
            <div
              class="header-names"
              :class="{ 'header-day-name': isMonthlyView }"
            >
              {{ isMonthlyView || header.width > 2 ? header.name : "" }}
            </div>
            <div v-if="isMonthlyView" class="header-dates">
              {{ header.date }}
            </div>
          </div>
        </div>
        <div class="timeline-content">
          <div
            class="timeline-content-item"
            v-for="(item, i) in getData(0)"
            :key="i"
          >
            <div
              :class="`timeline-content-${groupLookupKey(0)} pointer`"
              @click="
                notLowestGroup(0)
                  ? toggleRow(item.id)
                  : isProjectsTimeline
                  ? groupedItemClick('Edit', groupType(0), item.id, '')
                  : null
              "
            >
              <div>
                <font-awesome-icon
                  v-if="notLowestGroup(0)"
                  class="p-ml-3 pointer"
                  :class="{
                    'row-inactive': !hiddenRows.includes(item.id),
                  }"
                  size="lg"
                  :icon="['fa', 'caret-right']"
                />

                <font-awesome-icon
                  class="p-ml-2 p-mr-2 select-item pointer"
                  :icon="['fa', 'check-circle']"
                />
                {{ item.name }}
              </div>
              <div class="timeline-item-wrapper">
                <div
                  v-if="isProjectsTimeline"
                  class="timeline-container"
                  :style="getTimelinePosition(item)"
                >
                  <ProgressBarItem
                    :actualsApproved="item?.approvedActualsTotal || 0"
                    :actualsNotApproved="item?.unapprovedActualsTotal || 0"
                    :forecast="item?.forecast || 0"
                    :target="item?.budget || 0"
                    :budget="item?.purchaseTotal || 0"
                    :width="'160px'"
                    :showTooltipDate="true"
                    :showLabels="true"
                    :showBudgetLabel="false"
                    :startDate="formatDate(item?.startdate || 0)"
                    :endDate="formatDate(item?.enddate || 0)"
                  />
                </div>
                <div
                  class="timeline-item-grid"
                  :style="{
                    'grid-template-columns': timelineHeaders
                      .map((h) => h.width + 'fr')
                      .join(' '),
                  }"
                >
                  <div v-for="k in timelineHeaders.length" :key="k"></div>
                </div>
              </div>
            </div>
            <!-- Does this need to be able to have infinite levels like chart and grid? -->
            <span v-if="groupExists(1)">
              <div
                class="timeline-content-task"
                :class="{ 'p-d-none': hiddenRows.includes(item.id) }"
                v-for="(childItem, j) in getData(1, item.id)"
                :key="j"
              >
                <div>
                  <font-awesome-icon
                    class="p-ml-6 p-mr-2 select-item pointer"
                    :icon="['fa', 'check-circle']"
                  />
                  {{ childItem.name }}
                </div>
                <div class="timeline-item-wrapper">
                  <div
                    class="timeline-container"
                    :style="getTimelinePosition(childItem)"
                  >
                    <ProgressBarItem
                      :actualsApproved="childItem.approvedActualsTotal"
                      :actualsNotApproved="childItem.unapprovedActualsTotal"
                      :forecast="childItem.forecast"
                      :target="childItem.budget"
                      :budget="childItem.purchaseTotal"
                      :width="'160px'"
                      :showTooltipDate="true"
                      :showLabels="true"
                      :showBudgetLabel="false"
                      :startDate="formatDate(childItem.startdate)"
                      :endDate="formatDate(childItem.enddate)"
                    />
                  </div>

                  <div
                    class="timeline-item-grid"
                    :style="{
                      'grid-template-columns': timelineHeaders
                        .map((h) => h.width + 'fr')
                        .join(' '),
                    }"
                  >
                    <div v-for="k in timelineHeaders.length" :key="k"></div>
                  </div>
                </div>
              </div>
              <div
                class="add-button p-ml-6"
                :class="{ 'p-d-none': hiddenRows.includes(item.id) }"
                @click="groupedItemClick('Add', groupType(1), '', item.id)"
              >
                <font-awesome-icon
                  class="plus-circle-icon"
                  :icon="['fa', 'plus-circle']"
                />
                <span class="add-label"> Add {{ groupName(1) }} </span>
              </div>
            </span>
          </div>
        </div>

        <div
          class="timeline-today"
          v-if="currentDatePosition > 308"
          :style="{ left: currentDatePosition + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.timeline {
  font-family: "Poppins", serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  padding: 24px;
  margin-top: 44px;
  background-color: $white;

  .timeline-months {
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    text-align: center;
    user-select: none;
  }

  .timeline-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    box-shadow: 0 0 0 1px $grey8 inset;
    border-radius: 8px;
    margin-left: 12px;
    width: 100px;

    .timeline-toggle-option {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1 1 auto;
      height: 100%;
      width: 50px;
      font-size: 8px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;

      &.selected {
        color: $white;
        background-color: $blue;
      }
    }
  }

  .timeline-wrapper {
    position: relative;
    overflow: hidden;
    margin-top: 13px;

    .timeline-header {
      height: 40px;
      display: grid;
      // grid-template-columns: 400px 1fr 1fr 1fr;
      background: $grey4;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 8px solid transparent;

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
        justify-content: center;

        .header-names {
          order: 1;

          &.header-day-name {
            font-style: normal;
            font-weight: normal;
            font-size: 10px;
            line-height: 140%;
            text-align: center;
            color: $grey9;
            border: none;
          }
        }
        .header-dates {
          order: 0;
        }
      }
    }

    .timeline-content {
      .timeline-content-project,
      .timeline-content-milestone {
        background: $grey2;
        margin-top: 16px;

        font-weight: 600;
        font-size: 12px;
        line-height: 120%;
        color: $grey3;
        border-left: 8px solid $blue;
        border-radius: 8px;

        .row-inactive {
          transform: rotate(90deg);
        }
      }
      .timeline-content-task {
        border-bottom: 1px solid $grey;
        border-left: 8px solid transparent;
        font-size: 12px;
        line-height: 16px;
        color: $grey9;

        &:last-of-type {
          border-bottom: none;
        }
      }

      .timeline-content-project,
      .timeline-content-milestone,
      .timeline-content-task {
        display: grid;

        grid-template-columns: 300px auto;
        border-radius: 8px;

        border-radius: 8px;
        height: 64px;

        div {
          border-right: 1px solid $grey5;

          &:first-of-type {
            display: flex;
            align-items: center;
          }

          &:nth-of-type(2) {
            display: flex;
            align-items: center;
            overflow: hidden;
          }

          &:last-of-type {
            border-right: none;
          }

          .select-item {
            color: $grey6;
            font-size: 16px;
            cursor: pointer;

            &.selected {
              color: $blue;
            }
          }
        }
      }
    }

    .timeline-item-wrapper {
      position: relative;
      .timeline-container {
        position: absolute;
        left: 10px;
        height: 40px;
        border-radius: 4px;
        display: block;
        // min-width: 180px;
        background-color: rgba(51, 51, 51, 0.15);
        z-index: 2;
      }

      .timeline-item-grid {
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

    .timeline-today {
      height: 100000px;
      width: 3px;
      background-color: $blue;
      position: absolute;
      display: block;
      // right: calc(100% - (400px + 8px));
      top: 0px;
      z-index: 10;

      &::after {
        content: "Today";
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 47px;
        height: 18px;
        left: calc(50% - 47px / 2 + 1px);
        top: 0px;
        background: $blue;
        border-radius: 8px;
        font-size: 10px;
        line-height: 140%;
        color: $white;
      }
    }
  }
  .add-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 8px;
    color: $blue;

    .add-label {
      margin-left: 5px;
      font-weight: 700;
    }
  }
}
</style>
