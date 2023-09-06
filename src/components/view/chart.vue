<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import moment from "moment-timezone";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import ProgressBarItem from "../../components/chart/progressBarItem.vue";
import { useState } from "../../store/index";
import utils from "../../use/function/useUtils";

export const ViewChart = /*#__PURE__*/ defineComponent({
  name: "ViewChart",
  components: {
    ProgressBarItem,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    parentId: {
      type: String,
      required: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const state = useState().upvise;
    const upviseDataMessage = ref(props.upviseDataMessage);
    const hiddenRows = ref<string[]>([]);

    const selectedParents = ref<string[]>([]);
    const selectedChildren = ref<string[]>([]);
    // TODO: Maybe should make this dynamic to work with column picker
    const chartHeaders = ref([
      {
        name: "Description",
        key: "description",
      },
      // {
      //   name: "Output",
      //   key: "output",
      // },
      {
        name: "Code",
        key: "wbscode",
      },
      {
        name: "Duration",
        key: "duration",
      },
      {
        name: "Budget / Actual / Forecast",
        key: "budget",
      },
      {
        name: "Progress",
        key: "progress",
      },
    ]);

    const grouping = computed(() => {
      return upviseDataMessage.value.definition?.Grouping || {};
    });

    function getParentName(level: number) {
      return grouping.value[level - 1].LookupKey + "id";
    }

    function groupType(level: number) {
      return grouping.value[level]?.Type;
    }

    function groupName(level: number) {
      return grouping.value[level]?.Name;
    }

    function notLowestGroup(level: number) {
      return !!grouping.value[level + 1];
    }

    function groupExists(level: number) {
      return !!grouping.value[level];
    }

    function getData(level: number, parentId?: string) {
      const tableName =
        props.upviseDataMessage.persistence[groupType(level)]?.Location.Name ||
        null;
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

    function toggleRow(itemId: string) {
      console.log("toggleRow", itemId);

      if (!hiddenRows.value.includes(itemId)) {
        hiddenRows.value.push(itemId);
      } else {
        hiddenRows.value = hiddenRows.value.filter((row) => row !== itemId);
      }
    }

    function selectItem(level: number, id: string) {
      if (level > 0) {
        if (!selectedChildren.value.includes(id)) {
          selectedChildren.value.push(id);
        } else {
          selectedChildren.value = selectedChildren.value.filter(
            (row) => row !== id
          );
        }
      }

      if (level === 0) {
        if (!selectedParents.value.includes(id)) {
          selectedParents.value.push(id);
        } else {
          selectedParents.value = selectedParents.value.filter(
            (row) => row !== id
          );
        }
      }
    }

    function getGridColumnStyle() {
      let headerCount = chartHeaders.value.length;

      return { "grid-template-columns": `240px repeat(${headerCount}, 1fr)` };
    }

    function formatDate(timestamp: string, format = "YYYY-MMM-DD") {
      return moment(timestamp, "x").format(format);
    }
    function getDayDifference(timestamp: string, timestampEnd: string) {
      let final = 0;

      const start = moment(timestamp, "x"); //now
      const end = moment(timestampEnd, "x");

      final = end.diff(start, "days") + 1;

      return final === 1 ? final + " day" : final + " days";
    }

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      emit("groupedItemClick", action, groupName, itemId, parentId);
    }

    return {
      selectItem,
      getData,
      selectedParents: selectedParents,
      selectedChildren: selectedChildren,
      groupedItemClick,
      getDayDifference,
      formatDate,
      getGridColumnStyle,
      chartHeaders,
      toggleRow,
      hiddenRows,
      groupType,
      groupName,
      notLowestGroup,
      groupExists,
    };
  },
});
export default ViewChart;
</script>

<template>
  <!-- {{ selectedChildren }}
  {{ selectedParents }} -->
  <div>
    <div class="chart-view">
      <div class="chart-wrapper">
        <div class="chart-header" :style="getGridColumnStyle()">
          <div class="p-pl-4">Task Name</div>
          <div
            class="header-items"
            v-for="(header, h) in chartHeaders"
            :key="h"
          >
            <div class="header-names">
              {{ header.name }}
            </div>
          </div>
        </div>
        <div class="chart-content">
          <div
            class="chart-content-item"
            v-for="(item, i) in getData(0)"
            :key="i"
          >
            <div
              class="chart-content-milestone pointer"
              @click="notLowestGroup(0) ? toggleRow(item.id) : null"
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
                  :class="{ selected: selectedParents.includes(item.id) }"
                  class="p-ml-2 p-mr-2 select-item"
                  :icon="['fa', 'check-circle']"
                  @click.stop="selectItem(0, item.id)"
                />
                {{ item.name }}
              </div>
              <div class="chart-item-wrapper">
                <div
                  class="chart-item-grid"
                  :style="{
                    'grid-template-columns': `repeat(${chartHeaders.length}, 1fr)`,
                  }"
                >
                  <div v-for="(header, k) in chartHeaders" :key="k">
                    <template v-if="header.key === 'budget'">
                      <ProgressBarItem
                        :actualsApproved="item.approvedActualsTotal"
                        :actualsNotApproved="item.unapprovedActualsTotal"
                        :forecast="item.forecast"
                        :target="item.budget"
                        :budget="item.pruchaseTotal"
                        :width="'100%'"
                        :showTooltipDate="true"
                        :startDate="formatDate(item.startdate)"
                        :endDate="formatDate(item.enddate)"
                        :showLabels="false"
                        style="height: 24px"
                      />
                    </template>
                    <template v-else-if="header.key === 'progress'">
                      <!-- <ProgressBarItem
                        :progressPercent="item.progress"
                        :isProgressBar="true"
                        :width="'100%'"
                        style="height: 24px"
                      /> -->
                    </template>
                    <template v-else-if="header.key === 'duration'">
                      <template v-if="item.startdate && item.enddate">
                        <div class="duration-dates">
                          <div>
                            {{ formatDate(item.startdate, "D MMM, YY") }} -
                            {{ formatDate(item.enddate, "D MMM, YY") }}
                          </div>
                          <div class="duration-diff">
                            {{ getDayDifference(item.startdate, item.enddate) }}
                          </div>
                        </div>
                      </template>
                      <template v-else> - </template>
                    </template>
                    <span v-else> {{ item[header.key] || "-" }}</span>
                  </div>
                </div>
              </div>
            </div>
            <!--TODO: Make this be able to be infinitely expandable -->
            <span v-if="groupExists(1)">
              <div
                class="chart-content-task"
                :class="{ 'p-d-none': hiddenRows.includes(item.id) }"
                v-for="(childItem, j) in getData(1, item.id)"
                :key="j"
              >
                <div>
                  <font-awesome-icon
                    :class="{
                      selected: selectedChildren.includes(childItem.id),
                    }"
                    class="p-ml-6 p-mr-2 select-item"
                    :icon="['fa', 'check-circle']"
                    @click.stop="selectItem(1, childItem.id)"
                  />

                  {{ childItem.name }}
                </div>
                <div class="chart-item-wrapper">
                  <div
                    class="chart-item-grid"
                    :style="{
                      'grid-template-columns': `repeat(${chartHeaders.length}, 1fr)`,
                    }"
                  >
                    <div v-for="(header, k) in chartHeaders" :key="k">
                      <template v-if="header.key === 'budget'">
                        <ProgressBarItem
                          :actualsApproved="childItem.approvedActualsTotal"
                          :actualsNotApproved="childItem.unapprovedActualsTotal"
                          :forecast="childItem.forecast"
                          :target="childItem.budget"
                          :budget="childItem.purchaseTotal"
                          :width="'100%'"
                          :showTooltipDate="true"
                          :startDate="formatDate(childItem.startdate)"
                          :endDate="formatDate(childItem.enddate)"
                          :showLabels="false"
                          style="height: 24px"
                        />
                      </template>
                      <template v-else-if="header.key === 'duration'">
                        <template
                          v-if="childItem.startdate && childItem.enddate"
                        >
                          <div class="duration-dates">
                            <div>
                              {{ formatDate(childItem.startdate, "D MMM, YY") }}
                              -
                              {{ formatDate(childItem.enddate, "D MMM, YY") }}
                            </div>
                            <div class="duration-diff">
                              {{
                                getDayDifference(
                                  childItem.startdate,
                                  childItem.enddate
                                )
                              }}
                            </div>
                          </div>
                        </template>
                        <template v-else> - </template>
                      </template>
                      <!-- TODO: Make progress bar know difference between percentage and not -->
                      <template v-else-if="header.key === 'progress'">
                        <ProgressBarItem
                          :progress="childItem.progressUnitValue"
                          :required="childItem.outputamount"
                          :isProgressBar="true"
                          :width="'100%'"
                          style="height: 24px"
                        />
                      </template>
                      <span v-else> {{ childItem[header.key] || "-" }}</span>
                    </div>
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.chart-view {
  font-family: "Poppins", serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  padding: 24px;
  margin-top: 44px;
  background-color: $white;

  .duration-dates {
    font-weight: 600;
    font-size: 12px;
    line-height: 120%;
    color: $grey3;
    // text-align: left;

    .duration-diff {
      font-weight: normal;
      font-size: 12px;
      line-height: 16px;
      color: $grey9;
    }
  }

  .chart-wrapper {
    position: relative;
    overflow: hidden;
    margin-top: 13px;

    .chart-header {
      height: 40px;
      display: grid;
      grid-template-columns: 400px 1fr 1fr 1fr;
      background: $grey4;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 8px solid transparent;

      & > div {
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
          text-align: center;

          &.header-day-name {
            font-style: normal;
            font-weight: normal;
            font-size: 10px;
            line-height: 140%;
            text-align: center;
            color: $grey9;
          }
        }
        .header-dates {
          order: 0;
        }
      }
    }

    .chart-content {
      .chart-content-milestone {
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
      .chart-content-task {
        border-bottom: 1px solid $grey;
        border-left: 8px solid transparent;
        font-size: 12px;
        line-height: 16px;
        color: $grey9;

        &:last-of-type {
          border-bottom: none;
        }
      }

      .chart-content-milestone,
      .chart-content-task {
        display: grid;

        grid-template-columns: 240px auto;
        border-radius: 8px;

        border-radius: 8px;
        min-height: 64px;

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
          color: $grey6;
          font-size: 16px;
          cursor: pointer;

          &.selected {
            color: $blue;
          }
        }
      }

      .chart-item-wrapper {
        position: relative;
        .chart-container {
          position: absolute;
          left: 10px;
          height: 40px;
          border-radius: 4px;
          display: block;
          // min-width: 180px;
          background-color: rgba(51, 51, 51, 0.15);
          z-index: 2;
        }

        .chart-item-grid {
          width: 100%;
          height: 100%;
          display: grid !important;
          & > div {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            border-right: 1px solid $grey;
            padding: 12px 12px;
            text-align: center;

            &:last-child {
              border: none;
            }
          }
          z-index: 1;
        }
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
