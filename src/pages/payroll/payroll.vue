<script lang="ts">
import { IUpviseDataMessage, IRecord } from "../../store/modules/upvise.d";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { UpviseDataMessage } from "../../store/modules/upvise";
import DashboardOverview from "../../controls/dashboard/dashboardOverview.vue";
import HeaderActions from "../../components/header/actions.vue";
import InformationCard from "../../components/display/informationCard.vue";
import PayrollCalendar from "./payrollCalendar.vue";
import PayrollUpdateStatusDialog from "./payrollUpdateStatusDialog.vue";
import PayrollDownload from "./payrollDownload.vue";
import ToggleOptions from "../../components/input/toggleOptions.vue";
import { useState } from "../../store/index";
import useControllerPayroll from "../../use/controller/payroll/payroll";
import {
  IContactTimesheets,
  IPayrollCell,
  IPayrollPeriod,
  IProjects,
} from "../../use/controller/payroll/payroll.d";
import { TimesheetsStatus } from "../../use/utils/useConstants";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import moment from "moment";
import utils from "../../use/function/useUtils";
//import { Icon } from "@fortawesome/fontawesome-svg-core";

export const Payroll = /*#__PURE__*/ defineComponent({
  name: "Payroll",
  components: {
    ConfirmDialog,
    DashboardOverview,
    HeaderActions,
    InformationCard,
    PayrollCalendar,
    PayrollUpdateStatusDialog,
    ToggleOptions,
    PayrollDownload,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerPayroll(upvise);
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const projects = ref<IRecord[]>([]);
    const forageData = ref();
    const contactData = ref([] as IContactTimesheets[]);
    const projectData = ref([] as IProjects[]);
    const employeeGroupId = ref("");
    const excludedContactIds = ref("");
    const shiftTypeIds = ref({} as Record<string, string>);
    const payrollPeriod = ref({} as IPayrollPeriod);
    const currentView = ref<string>("CALENDAR");
    const viewToggleOptions: string[] = ["CALENDAR", "PROJECTS"];
    const currentDateRange = ref<number[]>([]);
    const startDate = ref(0);
    const endDate = ref(0);
    const statusFilter = ref<number | null>(null);
    const searchFilter = ref("");
    const confirm = useConfirm();
    const isLoading = ref(true);
    const isSaving = ref(false);
    const searchDebounce = utils.debounce(onSearchInput, 1000);
    const statusToUpdate = ref<TimesheetsStatus>(TimesheetsStatus.NOT_SET);
    const showUpdateStatusDialog = ref(false);
    const showDownload = ref(false);

    const headerActionButtons = computed(() => {
      return [
        {
          action: "approve",
          tooltip: "Approve selected",
          icon: "check-circle",
          isSaving: isSaving.value,
        },
        {
          action: "reject",
          tooltip: "Reject selected",
          icon: "times-circle",
          isSaving: isSaving.value,
        },
        {
          action: "send",
          tooltip: "Mark selected as sent",
          icon: "paper-plane",
          isSaving: isSaving.value,
        },
        {
          action: "download",
          tooltip: "Download",
          icon: "cloud-download-alt",
        },
      ];
    });

    const infoCards = computed(() => {
      return [
        {
          count: controller
            .countTimesheetsByStatus(
              filteredContactData.value,
              filteredProjectData.value,
              TimesheetsStatus.APPROVED,
              currentView.value
            )
            .toString(),
          label: "Approved",
          icon: "check-circle",
          textColour: "#FFFFFF",
          backgroundColour: "#61E24B",
          shadowColour: "rgba(97, 226, 75, 0.3)",
        },
        {
          count: controller
            .countTimesheetsByStatus(
              filteredContactData.value,
              filteredProjectData.value,
              TimesheetsStatus.WARNING,
              currentView.value
            )
            .toString(),
          label: "Warnings",
          icon: "exclamation-triangle",
          textColour: "#FFFFFF",
          backgroundColour: "#EDBD13",
          shadowColour: "rgba(237, 189, 19, 0.3)",
        },
        {
          count: controller
            .countTimesheetsByStatus(
              filteredContactData.value,
              filteredProjectData.value,
              TimesheetsStatus.REJECTED,
              currentView.value
            )
            .toString(),
          label: "Rejected",
          icon: "ban",
          textColour: "#FFFFFF",
          backgroundColour: "#F14D29",
          shadowColour: "rgba(241, 77, 41, 0.3)",
        },
        {
          count: controller
            .countTimesheetsByStatus(
              filteredContactData.value,
              filteredProjectData.value,
              TimesheetsStatus.SENT,
              currentView.value
            )
            .toString(),
          label: "Sent",
          icon: "check-double",
          textColour: "#666666",
          backgroundColour: "#FFFFFF",
          shadowColour: "rgba(0, 0, 0, 0.05)",
        },
      ];
    });

    const filteredProjectData = computed(() => {
      const filteredProjects: IProjects[] = projectData.value
        .map((project) => {
          return {
            ...project,
            contacts: project.contacts
              .map((contact) => {
                return {
                  ...contact,
                  payrollCellsInRange: controller.filterPayrollCells(
                    contact.payrollCellsInRange[project.id],
                    statusFilter.value,
                    project.id
                  ),
                };
              })
              .filter((contact) => {
                return (
                  (project.name
                    .toLowerCase()
                    .includes(searchFilter.value.toLowerCase()) ||
                    controller.showContact(
                      contact,
                      statusFilter.value,
                      searchFilter.value,
                      project.id
                    )) &&
                  contact.payrollCellsInRange[project.id]
                    ?.slice(7, 14)
                    .filter((cell) => cell != null).length > 0
                );
              }),
          };
        })
        .filter((project) => project.contacts.length > 0);
      return filteredProjects;
    });

    const filteredContactData = computed(() => {
      const filteredContacts: IContactTimesheets[] = contactData.value.map(
        (contact) => {
          return {
            ...contact,
            payrollCellsInRange: controller.filterPayrollCells(
              contact.payrollCellsInRange._calendar,
              statusFilter.value,
              "_calendar"
            ),
          };
        }
      );

      return filteredContacts.filter((contact) => {
        return controller.showContact(
          contact,
          statusFilter.value,
          searchFilter.value
        );
      });
    });

    const selectedCells = computed(() => {
      if (currentView.value === "CALENDAR")
        return selectedPayrollCellsCalendar();
      else if (currentView.value === "PROJECTS")
        return selectedPayrollCellsProjects();
      else return [];
    });

    function changeView(view: string) {
      if (view === "CALENDAR") deselectAllProjects();
      else if (view === "PROJECTS") deselectAllCalendar();
      currentView.value = view;
    }

    function headerActionClicked(action: string) {
      if (selectedCells.value.some((cell) => cell._hasError === true)) {
        showError();
        return;
      }

      switch (action) {
        case "approve":
          if (isSaving.value === false) {
            statusToUpdate.value = TimesheetsStatus.APPROVED;
            showUpdateStatusDialog.value = true;
          }
          break;
        case "reject":
          if (isSaving.value === false) {
            statusToUpdate.value = TimesheetsStatus.REJECTED;
            showUpdateStatusDialog.value = true;
          }
          break;
        case "send":
          if (isSaving.value === false) {
            statusToUpdate.value = TimesheetsStatus.SENT;
            showUpdateStatusDialog.value = true;
          }
          break;
        case "download":
          if (isSaving.value === false) {
            showDownload.value = true;
          }
          break;
      }
    }

    async function updateDateRange(dateRange: number[]) {
      //console.log("DATE CHANGED. NEW RANGE: ", dateRange);
      currentDateRange.value = dateRange;
      startDate.value = moment(dateRange[7]).startOf("day").valueOf();
      endDate.value = moment(dateRange[13]).endOf("day").valueOf();
      await updatePayrollCellsData();
    }

    async function updatePayrollCellsData() {
      getPayrollCellsInDateRange();
      await controller
        .updateUpvisePayroll(
          startDate.value,
          endDate.value,
          contactData.value,
          shiftTypeIds.value
        )
        .then((newCell) => {
          if (newCell === 1) {
            getPayrollCellsInDateRange();
          }
        });
    }

    function getPayrollCellsInDateRange() {
      contactData.value.forEach((contact) => {
        contact.payrollCellsInRange = controller.getTimesheetsInDateRange(
          currentDateRange.value,
          contact
        );
      });
    }

    function selectAll() {
      if (currentView.value === "CALENDAR") selectAllCalendar();
      else if (currentView.value === "PROJECTS") selectAllProjects();
    }

    function deselectAll() {
      if (currentView.value === "CALENDAR") deselectAllCalendar();
      else if (currentView.value === "PROJECTS") deselectAllProjects();
    }

    function selectAllCalendar() {
      filteredContactData.value.forEach((contact) => {
        controller
          .getCurrentWeek(contact.payrollCellsInRange._calendar)
          .forEach((cell) => {
            if (cell) cell._selected = true;
          });
      });
    }

    function deselectAllCalendar() {
      filteredContactData.value.forEach((contact) => {
        controller.deselectEntireRow(contact);
      });
    }

    function selectAllProjects() {
      filteredProjectData.value.forEach((project) => {
        project.contacts.forEach((contact) => {
          if (project.id in contact.payrollCellsInRange)
            controller
              .getCurrentWeek(contact.payrollCellsInRange[project.id])
              .forEach((cell) => {
                if (cell) cell._selected = true;
              });
        });
      });
    }

    function deselectAllProjects() {
      filteredProjectData.value.forEach((project) => {
        project.contacts.forEach((contact) => {
          controller.deselectEntireRow(contact, project.id);
        });
      });
    }

    function onSearchInput(searchString: string) {
      //console.log("search string", searchString);
      searchFilter.value = searchString;
    }

    function changeTab(tab: string) {
      switch (tab) {
        case "ALL":
          statusFilter.value = null;
          break;
        case "SENT":
          statusFilter.value = TimesheetsStatus.SENT;
          break;
        case "APPROVED":
          statusFilter.value = TimesheetsStatus.APPROVED;
          break;
        case "WARNING":
          statusFilter.value = TimesheetsStatus.WARNING;
          break;
        case "REJECTED":
          statusFilter.value = TimesheetsStatus.REJECTED;
          break;
        default:
          statusFilter.value = null;
          break;
      }
    }

    function closeUpdateStatusDialog() {
      showUpdateStatusDialog.value = false;
    }

    function yesUpdateStatusDialog(status: TimesheetsStatus) {
      isSaving.value = true;

      controller
        .setSelectedStatus(contactData.value, status, currentView.value)
        .then(() => {
          deselectAll();
          isSaving.value = false;
          closeUpdateStatusDialog();
        })
        .catch(() => {
          deselectAll();
          isSaving.value = false;
          closeUpdateStatusDialog();
        });
    }

    function selectedPayrollCellsCalendar() {
      const payrollCells: IPayrollCell[] = [];

      contactData.value.forEach((contact) => {
        Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
          const payrollCell = mappedTimesheet.payrollItem._calendar;

          if (payrollCell?._selected) payrollCells.push(payrollCell);
        });
      });

      return payrollCells;
    }

    function selectedPayrollCellsProjects() {
      const payrollCells: IPayrollCell[] = [];

      contactData.value.forEach((contact) => {
        Object.values(contact.mappedTimesheets).forEach((mappedTimesheet) => {
          Object.entries(mappedTimesheet.payrollItem).forEach(
            ([string, payrollCell]) => {
              if (string !== "_calendar" && payrollCell?._selected)
                payrollCells.push(payrollCell);
            }
          );
        });
      });

      return payrollCells;
    }

    function showError() {
      confirm.require({
        message:
          "You cannot change the status of cells that contain errors. Deselect these cells before attempting again.",
        header: "Error",
        icon: "pi pi-exclamation-triangle",
      });
    }

    function closePayrollDownload() {
      setTimeout(() => {
        showDownload.value = false;
      }, 200);
    }

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      await controller.getForageData().then((f) => {
        forageData.value = f;
        employeeGroupId.value = controller.getEmployeeGroupSetting(
          f["system.user.settings"]
        );
        shiftTypeIds.value = controller.getShiftTypeSettings(
          f["system.user.settings"]
        );
        payrollPeriod.value = controller.getPayrollPeriod(
          f["system.user.settings"]
        );
        projects.value = f["unybiz.projects.projects"];
        excludedContactIds.value = controller.getExcludedContactIds(
          f["system.user.settings"]
        );
      });
      await controller.fetch();
    });

    watch(
      () => upvise.isFetchComplete,
      async () => {
        if (!upvise.isFetchComplete) return;
        if (!employeeGroupId.value) {
          console.log(
            "Cannot find the employeeGroupIds setting in System.User.Settings. Please insert it, if it does not exist."
          );
          return;
        }

        contactData.value = controller.mapTimesheets(
          forageData.value["unybiz.contacts.contacts"],
          employeeGroupId.value,
          excludedContactIds.value
        );

        projectData.value = projects.value.map((project) => {
          return {
            id: project.id,
            name: project.name,
            contacts: contactData.value,
          } as IProjects;
        });

        await updatePayrollCellsData();

        isLoading.value = false;
      }
    );

    return {
      utils,
      metadata,
      contactData,
      payrollPeriod,
      currentView,
      viewToggleOptions,
      headerActionButtons,
      infoCards,
      filteredContactData,
      filteredProjectData,
      selectedCells,
      currentDateRange,
      startDate,
      endDate,
      isLoading,
      isSaving,
      statusToUpdate,
      showUpdateStatusDialog,
      changeView,
      headerActionClicked,
      updateDateRange,
      selectAll,
      deselectAll,
      onSearchInput,
      searchDebounce,
      showDownload,
      closePayrollDownload,
      changeTab,
      closeUpdateStatusDialog,
      yesUpdateStatusDialog,
    };
  },
});
export default Payroll;
</script>

<template>
  <DashboardOverview :isLoading="isLoading">
    <template v-slot:header-row-1-col-1>
      <span class="title">Approvals</span>
    </template>

    <template v-slot:header-row-1-col-2>
      <ToggleOptions
        class="view-toggle"
        :toggleOptions="viewToggleOptions"
        :currentOption="currentView"
        @option-selected="changeView"
      />
    </template>

    <template v-slot:header-row-1-col-3>
      <HeaderActions
        :upvise-data-message="metadata"
        :actionButtons="headerActionButtons"
        :useColumnPicker="false"
        :useFavouriteManager="false"
        @actionClicked="headerActionClicked"
      />
    </template>

    <template v-slot:header-row-2-col-1>
      <div
        v-for="(infoCard, index) in infoCards"
        :key="index"
        class="info-card-container"
      >
        <InformationCard
          :valueText="infoCard.count"
          :description="infoCard.label"
          :icon="infoCard.icon"
          :textColour="infoCard.textColour"
          :backgroundColour="infoCard.backgroundColour"
          :shadowColour="infoCard.shadowColour"
        />
      </div>
    </template>

    <template v-slot:body>
      <PayrollCalendar
        :currentView="currentView"
        :contact-data-prop="filteredContactData"
        :project-data-prop="filteredProjectData"
        :payroll-period="payrollPeriod"
        @updateDateRange="updateDateRange"
        @selectAll="selectAll"
        @deselectAll="deselectAll"
        @changeTab="changeTab"
        @onSearchInput="searchDebounce"
      />
    </template>
  </DashboardOverview>
  <ConfirmDialog></ConfirmDialog>
  <PayrollUpdateStatusDialog
    :showDialog="showUpdateStatusDialog"
    :status="statusToUpdate"
    :isSaving="isSaving"
    :selectedCells="selectedCells"
    @closeDialog="closeUpdateStatusDialog"
    @yes="yesUpdateStatusDialog"
  />

  <payroll-download
    v-if="showDownload"
    @closePayrollDownload="closePayrollDownload"
  >
  </payroll-download>
</template>

<style lang="scss" scoped>


.title {
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 32px;
  color: $grey3;
}

::v-deep(.view-toggle.grid-toggle) {
  height: 40px;
  font-weight: bold;
  font-size: 10px;

  .grid-toggle-option {
    width: 100px;
  }
}

.info-card-container {
  box-sizing: content-box;
  width: 140px;
  height: 67px;
  padding: 0 8px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
}
</style>
