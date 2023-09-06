<script lang="ts">
import { defineComponent, PropType, ref, watch } from "vue";
import moment from "moment-timezone";
import Button from "primevue/button";
import DateChooserRedux from "../../components/date/DateChooserRedux.vue";
import DateRangePicker from "../../components/date/DateRangePicker.vue";
import PayrollRows from "./payrollRows.vue";
import PayrollGroupRow from "./payrollGroupRow.vue";
import SearchBar from "../../components/input/searchBar.vue";
import TabOptions from "../../components/input/tabOptions.vue";
import Legend from "../../components/display/legend.vue"
import { useState } from "../../store/index";
import {
  IContactTimesheets,
  IPayrollPeriod,
  IProjects,
} from "../../use/controller/payroll/payroll.d";
import useControllerPayroll from "../../use/controller/payroll/payroll";

export const PayrollCalendar = /*#__PURE__*/ defineComponent({
  name: "PayrollCalendar",
  components: {
    Button,
    PayrollRows,
    PayrollGroupRow,
    SearchBar,
    TabOptions,
    DateChooserRedux,
    DateRangePicker,
    Legend,
    // DaySelector,
    // Calendar,
  },
  props: {
    currentView: {
      type: String,
      default: "",
      required: true,
    },
    contactDataProp: {
      type: Array as PropType<IContactTimesheets[]>,
      required: true,
    },
    projectDataProp: {
      type: Array as PropType<IProjects[]>,
      required: true,
    },
    payrollPeriod: {
      type: Object as PropType<IPayrollPeriod>,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const controller = useControllerPayroll(upvise);
    const week = ref(controller.week);
    const contactData = ref<IContactTimesheets[]>(props.contactDataProp);
    const projectData = ref<IProjects[]>(props.projectDataProp);
    const dates = ref([] as number[]);
    const tabOptions = ["ALL", "SENT", "APPROVED", "WARNING", "REJECTED"];
    const currentTab = ref(tabOptions[0]);
    const hiddenRows = ref<string[]>([]);
    const headers = ref([
      {
        name: "",
        date: "",
      },
    ]);
    const slidingAction = ref(0);
    const isRightPanelOpen = ref(true);
    const currentTime = ref("-");
    const selectedDate = ref(0);
    const expandedProjectRows = ref<Set<string>>(new Set());
    const legendOptions = ref(controller.legendOptions);

    const updateTimelineHeaders = () => {
      // depending of number of headers, that is the count of the grid

      let current = selectedDate.value;

      headers.value = [];

      let currentDay = moment(current).subtract(7, "days").day();

      let daysInMonth = moment(current).subtract(7, "days").daysInMonth();

      headers.value = [];
      let date = moment(current).subtract(7, "days").date();

      for (let i = date; i < date + 21; i++) {
        let day = i;
        if (day > daysInMonth) {
          day = day - daysInMonth;
        }
        headers.value.push({
          name: week.value[currentDay % 7],
          date: day.toString(),
        });
        currentDay++;
      }
    };

    function getDateRange() {
      let currentDay = moment(selectedDate.value).subtract(7, "days");
      let dateRange: number[] = [currentDay.valueOf()];
      for (let i = 0; i < 20; i++) {
        dateRange.push(currentDay.add(1, "days").valueOf());
      }
      dates.value = dateRange;
      emit("updateDateRange", dateRange);
    }

    function prevChangeDate(event: unknown) {
      const { start } = event as Record<string, number>;
      slidingAction.value = -2;
      selectedDate.value = start;
      setTimeout(() => {
        updateTimelineHeaders();
        slidingAction.value = 0;
      }, 300);
    }

    function nextChangeDate(event: unknown) {
      const { start } = event as Record<string, number>;
      slidingAction.value = 2;
      selectedDate.value = start;
      setTimeout(() => {
        updateTimelineHeaders();
        slidingAction.value = 0;
      }, 300);
    }

    function getNewRange(event: unknown) {
      const { start } = event as Record<string, number>;
      const weekStart = controller.getWeekStart(
        props.payrollPeriod,
        start.valueOf()
      );
      selectedDate.value = weekStart;
      slidingAction.value = selectedDate.value > start.valueOf() ? -2 : 2;
      setTimeout(() => {
        updateTimelineHeaders();
        slidingAction.value = 0;
      }, 300);
    }

    function getHeaderStyle() {
      // let headerCount = headers.value.length;

      return { "grid-template-columns": `repeat(${21}, 1fr)` };
    }

    function changeTab(tab: string) {
      currentTab.value = tab;
      emit("changeTab", tab);
    }

    function onSearchInput(input: string) {
      emit("onSearchInput", input);
      //console.log("search bar input", input);
    }

    function deselectAll() {
      emit("deselectAll");
    }

    function selectAll() {
      emit("selectAll");
    }

    function toggleColumnCells(index: number) {
      if (props.currentView === "CALENDAR") toggleColumnCellsCalendar(index);
      else if (props.currentView === "PROJECTS")
        toggleColumnCellsProjects(index);
    }

    function toggleColumnCellsCalendar(index: number) {
      const cells = controller.getCurrentDayCells(
        contactData.value,
        index,
        props.currentView
      );
      if (cells) {
        // remove all selection
        if (cells.every((cell) => cell == null || cell._selected))
          controller.deselectEntireColumn(
            contactData.value,
            index,
            props.currentView
          );
        else {
          controller.deselectEntireColumn(
            contactData.value,
            index,
            props.currentView
          );
          cells.forEach((cell) => {
            if (cell) cell._selected = true;
          });
        }
      }
    }

    function toggleColumnCellsProjects(index: number) {
      const cells = projectData.value
        .map((project) => {
          return controller.getCurrentDayCells(
            project.contacts,
            index,
            props.currentView
          );
        })
        .flat();

      if (cells) {
        // remove all selection
        if (cells.every((cell) => cell == null || cell._selected))
          projectData.value.forEach((project) => {
            controller.deselectEntireColumn(
              project.contacts,
              index,
              props.currentView
            );
          });
        else {
          projectData.value.forEach((project) => {
            controller.deselectEntireColumn(
              project.contacts,
              index,
              props.currentView
            );
          });
          cells.forEach((cell) => {
            if (cell) cell._selected = true;
          });
        }
      }
    }

    function totalProject(project: IProjects) {
      return controller.combinePayrollCellShiftTimes(
        ...project.contacts
          .map((contact) =>
            project.id in contact.payrollCellsInRange
              ? controller.getCurrentWeek(
                  contact.payrollCellsInRange[project.id]
                )
              : []
          )
          .flat()
      );
    }

    function toggleProjectRow(projectId: string) {
      if (expandedProjectRows.value.has(projectId)) {
        expandedProjectRows.value.delete(projectId);
      } else expandedProjectRows.value.add(projectId);
    }

    watch(
      () => props.payrollPeriod,
      () => {
        selectedDate.value = controller.initialiseTimePeriod(
          props.payrollPeriod
        );
        if (!selectedDate.value) controller.getWeekStart(props.payrollPeriod);

        // do the initial draw of date range and grids
        updateTimelineHeaders();
        getDateRange();
      }
    );

    watch(selectedDate, () => {
      getDateRange();
    });

    watch(
      () => props.contactDataProp,
      () => {
        contactData.value = props.contactDataProp;
        //console.log("Updated Contact Data: ", contactData.value);
      }
    );

    watch(
      () => props.projectDataProp,
      () => {
        projectData.value = props.projectDataProp;
        //console.log("Updated Project Data: ", projectData.value);
      }
    );

    return {
      props,
      contactData,
      projectData,
      currentTab,
      tabOptions,
      slidingAction,
      isRightPanelOpen,
      currentTime,
      selectedDate,
      expandedProjectRows,
      legendOptions,
      getHeaderStyle,
      changeTab,
      onSearchInput,
      deselectAll,
      selectAll,
      headers,
      hiddenRows,
      getNewRange,
      nextChangeDate,
      prevChangeDate,
      toggleColumnCells,
      totalProject,
      toggleProjectRow,
    };
  },
});
export default PayrollCalendar;
</script>

<template>
  <div>
    <div class="header-container">
      <div class="header-item tabs-container">
        <TabOptions
          :tabOptions="tabOptions"
          :currentTab="currentTab"
          @tabSelected="changeTab"
        />
      </div>
      <div class="header-item">
        <SearchBar @onSearchInput="onSearchInput" />
      </div>
      <div class="header-item">
        <Button
          class="header-button"
          label="DESELECT ALL"
          @click="deselectAll()"
        />
      </div>
      <div class="header-item">
        <Button class="header-button" label="SELECT ALL" @click="selectAll()" />
      </div>
    </div>

    <div
      class="staff-time-schedule"
      :class="{
        'top-left-border-radius-none': currentTab === tabOptions[0],
      }"
    > 
      <div class="legend-container">
        <Legend
          :options="legendOptions"
        />
      </div>
      <div class="date-chooser-container p-grid">
        <div class="p-col-4"></div>
        <div class="p-col-4 calendar-months p-d-flex p-ai-center p-jc-center">
          <!-- date/month selector -->
          <DateChooserRedux
            @next-date-obj="nextChangeDate"
            @prev-date-obj="prevChangeDate"
            duration-type="day"
            :duration="7"
            :short-interval="7"
            :enable-long-interval="false"
            long-interval-type="week"
            :long-interval="4"
            :start-epoch="selectedDate"
          >
          </DateChooserRedux>

          <DateRangePicker
            @date-interval="getNewRange"
            :allow-range="true"
            :start-epoch="selectedDate"
            :range="7"
          >
          </DateRangePicker>
        </div>
        <div class="p-col-4"></div>
      </div>

      <div class="calendar-wrapper">
        <div class="calendar-header">
          <div class="p-pl-4"></div>
          <div class="grid-slider-wrapper">
            <div
              class="grid-slider-parent"
              :style="getHeaderStyle()"
              :class="{
                slidebackward: slidingAction === -1,
                slideforward: slidingAction === 1,
                slidebackward2: slidingAction === -2,
                slideforward2: slidingAction === 2,
              }"
            >
              <div
                class="header-items pointer"
                v-for="(header, h) in headers"
                :key="h"
                @click="toggleColumnCells(h)"
              >
                <div class="header-names">
                  {{ header.name }}
                </div>
                <div class="header-dates">
                  {{ header.date }}
                </div>
              </div>
            </div>
          </div>
          <div class="header-items">
            <div class="header-dates">Total</div>
            <!-- <div class="header-dates">
              {{ header.date }}
            </div> -->
          </div>
        </div>

        <div v-show="props.currentView === 'PROJECTS'">
          <div v-for="project in projectData" :key="project.id">
            <PayrollGroupRow
              :groupName="project.name"
              :isExpanded="expandedProjectRows.has(project.id)"
              :total-details="totalProject(project)"
              @click="toggleProjectRow(project.id)"
            />
            <PayrollRows
              v-show="expandedProjectRows.has(project.id)"
              :contactDataProp="project.contacts"
              :slidingAction="slidingAction"
              :shift-details-key="project.id"
            />
          </div>
        </div>

        <PayrollRows
          v-show="props.currentView === 'CALENDAR'"
          :contactDataProp="contactData"
          :slidingAction="slidingAction"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.header-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .header-item {
    padding: 0 5px;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }

    &.tabs-container {
      justify-content: start;
      flex: 1 1 0;
    }

    .header-button {
      display: flex;
      justify-content: center;
      align-items: center;
      color: $grey3;
      background-color: $white;
      border: 1px $grey5 solid;
      border-radius: 8px;
      padding: 0 12px;
      height: 24px;
      font-family: Poppins;
      font-style: normal;
      font-weight: bold;
      font-size: 10px;
      line-height: 24px;
    }
  }
}

.staff-time-schedule {
  font-family: "Poppins", serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  padding: 24px;
  background-color: $white;
  flex-grow: 1;
  border-radius: 8px;

  &.top-left-border-radius-none {
    border-radius: 0 8px 8px 8px;
  }

  .date-chooser-container {
    margin: 0;
  }

  .calendar-months {
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    text-align: center;
    user-select: none;
  }

  .date-range-text {
    white-space: nowrap;
  }

  .calendar-wrapper {
    position: relative;
    overflow: hidden;
    margin-top: 13px;

    .calendar-header {
      height: 50px;
      display: grid;
      max-width: 100%;
      grid-template-columns: 150px auto 260px;
      background: $grey;
      border-radius: 8px;
      border: 2px solid transparent;
      // margin-bottom: 16px;

      & > div {
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
        overflow: hidden;

        &:first-of-type {
          justify-content: flex-start;
        }

        &:last-of-type {
          border-right: none;
        }
      }

      .header-items {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .header-names {
          order: 1;
          font-style: normal;
          font-weight: normal;
          font-size: 12px;
          line-height: 140%;
          text-align: center;
          color: #666666;

          &.header-day-name {
            font-style: normal;
            font-weight: normal;
            font-size: 10px;
            line-height: 140%;
            text-align: center;
            margin-top: 24px;
            color: $grey9;
          }
        }
        .header-dates {
          order: 0;
          font-weight: 600;
          font-size: 18px;
          line-height: 120%;
        }
      }
    }
  }

  ::v-deep(.grid-slider-wrapper) {
    display: block !important;
    overflow: hidden;

    // $visible_cells: 7;
    // $screens: 3;
    // $total_cells: $visible_cells * $screens; // 21
    // $total_cell_width: calc($visible_cells / $screens * 100%);

    .grid-slider-parent {
      width: calc(21 / 7 * 100%);
      transition: none;
      transform: translateX(calc(-100% / (21 / 7)));
      display: grid !important;
      overflow: hidden;
      height: 100%;

      &.slideforward {
        transform: translateX(calc((-100% / 21) * 8)) !important;
        transition: 0.3s;
      }
      &.slidebackward {
        transform: translateX(calc((-100% / 21) * 6)) !important;
        transition: 0.3s;
      }
      &.slideforward2 {
        transform: translateX(calc((-100% / 3) * 2)) !important;
        transition: 0.3s;
      }
      &.slidebackward2 {
        transform: translateX(0) !important; // correct
        transition: 0.3s;
      }
    }
  }
}

.pointer {
  cursor: pointer;
}
</style>
