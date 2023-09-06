<script lang="ts">
import { computed, defineComponent, ref, Ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import moment from "moment";

import { IAuditLogMapped } from "../../use/controller/workshop/workshop.d";
import utils from "../../use/function/useUtils";
import { IFabricationRecord } from "../../use/controller/workshop/fabrication.d";
export const FabricationLogTable = defineComponent({
  name: "FabricationLogTable",
  components: {
    DataTable,
    Column,
  },
  props: {
    data: {
      type: Object as () => IAuditLogMapped[],
      required: true,
    },
  },
  setup(props) {
    const mappedData = computed(() => {
      return props.data
        .map((entry: IAuditLogMapped) => {
          const locallisedDate = moment.utc(entry.date).local();
          const locallisedDateCreated = moment.utc(entry.datecreated).local();
          const value = entry.value as IFabricationRecord;
          const oldValue = entry.oldvalue as IFabricationRecord;
          return {
            id: utils.generateId(),
            date: entry.date,
            datecreated: entry.datecreated,
            mappedDate: locallisedDate.format("YYYY-MM-DD"),
            mappedDateCreated: locallisedDateCreated.format("YYYY-MM-DD H:mm"),
            toFabOld: value.toFab,
            toFabNew: value.toFab,
            totalFabTimeOld: oldValue.totalFabTime,
            totalFabTimeNew: value.totalFabTime,
            completedTodayOld: oldValue.completedToday,
            completedTodayNew: value.completedToday,
            fabTimeOld: oldValue.fabTime,
            fabTimeNew: value.fabTime,
            total: value.totalCompleted,
            owner: entry.owner,
            reason: entry.reason,
          };
        })
        .sort((a, b) => (a.date > b.date ? -1 : 1));
    });

    const extraDailyLogs: Ref<Record<string, Record<string, unknown>[]>> = ref(
      {}
    );
    // const sortedExtraDailyLogs = computed(() => {
    //   return Object.values(extraDailyLogs.value).map((data) =>
    //     data.sort((a, b) => (a.datecreated > b.datecreated ? -1 : 1))
    //   );
    // });
    const filteredMappedData = computed(() => {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      extraDailyLogs.value = {};
      const result = mappedData.value.reduce(
        (acc: Record<string, Record<string, unknown>>, val) => {
          if (Array.isArray(extraDailyLogs.value[val.mappedDate as string])) {
            extraDailyLogs.value[val.mappedDate as string].push(val);
          } else {
            extraDailyLogs.value[val.mappedDate as string] = [val];
          }
          if (acc[val.mappedDate]) {
            if ((acc[val.mappedDate].datecreated as number) < val.datecreated) {
              acc[val.mappedDate] = val;
            }
          } else {
            acc[val.mappedDate] = val;
          }
          return acc;
        },
        {}
      );
      console.log(
        "Mapped data: ",
        Object.values(result).sort((a, b) =>
          (a.date as number) > (b.date as number) ? -1 : 1
        )
      );
      return Object.values(result).sort((a, b) =>
        (a.date as number) > (b.date as number) ? -1 : 1
      );
    });
    const expandedRows: Ref<Record<string, unknown>[]> = ref([]);

    function hasExtraDailyLogs(data: Record<string, unknown>) {
      return (
        extraDailyLogs.value[data.mappedDate as string] !== undefined &&
        extraDailyLogs.value[data.mappedDate as string].length > 1
      );
    }

    const expandedChevronElements = ref<Record<string, any>>({});
    function toggleRow(row: Record<string, Record<string, unknown>>) {
      // console.log("toggleRow", row);
      if (hasExtraDailyLogs(row.data)) {
        if (!expandedRows.value.includes(row.data)) {
          expandedRows.value.push(row.data);
          expandedChevronElements.value[row.data.id as string].classList.add(
            "expanded"
          );
          expandedChevronElements.value[
            row.data.id as string
          ].parentNode.parentNode.classList.add("expanded");
        } else {
          // console.log("remove item", row, expandedRows.value);
          expandedRows.value = expandedRows.value.filter(
            (r) => r.id !== row.data.id
          );
          expandedChevronElements.value[row.data.id as string].classList.remove(
            "expanded"
          );
          expandedChevronElements.value[
            row.data.id as string
          ].parentNode.parentNode.classList.remove("expanded");
        }
      }
    }
    function addExpandedChevronElement(e: unknown, id: string) {
      expandedChevronElements.value[id] = e;
    }
    console.log(filteredMappedData);

    return {
      mappedData,
      filteredMappedData,
      extraDailyLogs,
      expandedRows,
      toggleRow,
      hasExtraDailyLogs,
      addExpandedChevronElement,
    };
  },
});

export default FabricationLogTable;
</script>

<template>
  <div>
    <DataTable
      :value="filteredMappedData"
      class="table-main"
      v-model:expandedRows="expandedRows"
      @rowClick="toggleRow($event)"
    >
      <Column :expander="true" headerStyle="width: 3rem">
        <template #body="{ data }">
          <div
            v-if="hasExtraDailyLogs(data)"
            class="expander"
            :ref="
              (e) => {
                addExpandedChevronElement(e, data.id);
              }
            "
          >
            <template v-for="i in 1" :key="i">
              <font-awesome-icon
                class="chevron-icon"
                :icon="['fa', 'chevron-right']"
              />
            </template>
          </div>
        </template>
      </Column>
      <Column field="date" header="Date">
        <template #body="slotProps">
          {{ slotProps.data.mappedDate }}
        </template>
      </Column>
      <Column field="toFabNew" header="% to Fab">
        <template #body="slotProps"> {{ slotProps.data.toFabNew }}% </template>
      </Column>
      <Column field="totalFabTimeNew" header="Total Fab Time"> </Column>
      <Column field="completedTodayNew" header="Completed Today %">
        <template #body="slotProps">
          {{ slotProps.data.completedTodayNew }}%
        </template>
      </Column>
      <Column field="fabTimeNew" header="Fab Time"></Column>
      <Column field="total" header="Total Completed">
        <template #body="slotProps"> {{ slotProps.data.total }}% </template>
      </Column>
      <template #expansion="slotProps" class="expansion-background-colour">
        <DataTable
          v-if="hasExtraDailyLogs(slotProps.data)"
          :value="extraDailyLogs[slotProps.data.mappedDate]"
          class="table-main"
          sortField="datecreated"
          :sortOrder="-1"
        >
          <Column headerStyle="width: 3rem" />
          <Column field="mappedDateCreated" header="Date Created"></Column>
          <Column field="toFabNew" header="% to Fab">
            <template #body="slotProps">
              {{ slotProps.data.toFabNew }}%
            </template>
          </Column>
          <Column field="totalFabTimeNew" header="Total Fab Time"> </Column>
          <Column field="completedTodayNew" header="Completed Today %">
            <template #body="slotProps">
              {{ slotProps.data.completedTodayNew }}%
            </template>
          </Column>
          <Column field="fabTimeNew" header="Fab Time"></Column>
          <Column field="total" header="Total Completed">
            <template #body="slotProps"> {{ slotProps.data.total }}% </template>
          </Column>
        </DataTable>
      </template>
    </DataTable>
  </div>
</template>
<style scoped lang="scss">


.expansion-text {
  margin: 10px 5px 10px 10px;
  font-family: Poppins, serif;
  font-style: normal;
  font-size: 12px;
  font-weight: 600;
  background-color: $grey2;
  width: 100%;
  height: 100%;
}

.expansion-background-colour {
  background-color: $grey2;
}

.data-table {
  padding: 24px;
  background-color: $white;

  .filter {
    margin-bottom: 12px;
  }
}

::v-deep(.p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
  color: $grey3;

  .p-datatable-tbody {
    tr.p-datatable-row-expansion > td {
      border: none;
    }

    & > tr {
      &:first-of-type {
        td {
          // border-bottom: none;
        }
      }

      & > td {
        // width: 2%;
        padding: 0;
        // border-left: none;
        // border-right: 1px solid #c8c8c8;
        border: none;

        &:last-of-type {
          border-right: none;
        }
        // border-top: 1px solid #c8c8c8;
      }
    }
  }
}

/*
Table (level > 0)
*/
.p-datatable-row-expansion {
  > td {
    .data-table {
      padding: 0;

      .filter {
        margin-bottom: 12px;
      }
    }
  }
}

::v-deep(.p-datatable-row-expansion .p-datatable-table) {
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 0;
  color: $grey3;
}

/*
Table header (level = 0)
*/
::v-deep(.p-column-filter-menu) {
  margin-left: 0;
}
::v-deep(.p-datatable .p-datatable-thead) {
  > tr {
    background-color: $grey4;
    color: $grey3;
    height: 56px;

    > th {
      font-family: Poppins, serif;
      font-style: normal;
      font-size: 12px;
      font-weight: 600;
      background-color: $grey4;
      border: none;

      &.p-sortable-column {
        box-shadow: none;

        &:hover:not(.p-highlight) {
          background-color: $grey8;
        }

        &.p-highlight {
          background-color: $blue;
        }
      }

      &:first-child {
        border-radius: 8px 0 0 8px;
      }

      &:last-child {
        border-radius: 0 8px 8px 0;
      }

      &:first-child:last-child {
        border-radius: 8px 8px 8px 8px;
      }

      > .p-column-header-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;

        .table-header-label {
          pointer-events: none;
        }

        .p-sortable-column-icon {
          font-size: 12px;
        }

        .p-sortable-column-badge {
          background: transparent;
          pointer-events: none;
        }
        .table-header-expand {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          height: 32px;
          width: 40px;
          margin-left: -47px;

          .expand-button-div {
            margin-right: 2px;
            padding: 6px 6px 6px 6px;
            width: 52px;
            height: 32px;
            line-height: 3px;
            background-color: $grey4;
            border-radius: 6px;
            &:hover {
              background-color: $grey8;
            }
            .button-style-top {
              color: $grey3;
              width: 10px;
              height: 10px;
            }

            .button-style-bottom {
              margin-top: -10px;
              color: $grey3;
              width: 10px;
              height: 10px;
            }
          }
        }
      }
    }
  }
}

/*
Table header (level > 0)
*/

::v-deep(.p-datatable-row-expansion .p-datatable .p-datatable-thead) {
  > tr {
    > th {
      &:first-child {
        border-radius: 0;
        border-left: 8px solid $blue;
      }
    }
  }
}

::v-deep(.table-header-hidden) {
  > .p-datatable-wrapper > .p-datatable-table > .p-datatable-thead {
    display: none;
  }
}

/*
Table data (level = 0)
*/
::v-deep(.p-datatable-tbody) {
  tr:not(.p-datatable-row-expansion) {
    background-color: $grey2;
    height: 64px;

    &.p-highlight {
      background-color: $blue2;
    }

    &:hover {
      .details-button {
        display: flex;
      }
    }

    &.expanded {
      td {
        &:first-child {
          border-radius: 8px 0 0 0;
        }
      }
    }

    td {
      position: relative;
      text-align: center;
      padding: 12px 6px;

      &:first-child {
        border-radius: 8px 0 0 8px;
        border-left: 8px solid $blue;
      }

      .expander {
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        width: 30px;
        border-radius: 15px;
        background-color: $blue;
        transition: all 0.1s linear;

        &.expanded {
          transform: rotate(90deg);
        }
      }
    }
  }
}

.table-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*
Table data (level > 0)
*/

::v-deep(.p-datatable-row-expansion .p-datatable-tbody) {
  > tr:not(.p-datatable-row-expansion) {
    background-color: $grey10;
    height: 64px;
    border-left: 8px solid $blue;

    &:last-child {
      td {
        box-shadow: none;
      }
    }

    &.p-datatable-emptymessage {
      height: 0;
      border: none;

      > td {
        padding: 0;
      }
    }

    &.milestone-row {
      background-color: $grey2;
      border: none;

      td {
        &:first-child {
          border-left: 8px solid $blue;
        }
      }
    }

    &.budget-row {
      background-color: $grey2;
    }

    &.p-highlight {
      background-color: $blue2;
    }

    &.expanded {
      td {
        box-shadow: none;
      }
    }

    td {
      position: relative;
      text-align: center;
      padding: 12px 6px;
      overflow: hidden;
      box-shadow: 0 -1px inset $grey;

      &:first-child {
        border-radius: 0;
      }
    }
  }
}
.chevron-icon {
  color: $white;
  font-size: 10px;
  margin: 0 -1px;
}
</style>
