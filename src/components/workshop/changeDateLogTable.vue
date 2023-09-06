<script lang="ts">
import { computed, defineComponent } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import moment from "moment";

import { IAuditLogMapped } from "../../use/controller/workshop/workshop.d";
import { orderBy } from "lodash";
import date from "../../use/utils/useDateOperations";

export const ChangeDateLogTable = defineComponent({
  name: "ChangeDateLogTable",
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
      return orderBy(
        props.data
          .filter(
            (entry) =>
              date.getStartOfDay(entry.oldvalue.installdate) !==
              date.getStartOfDay(entry.value.installdate)
          )
          .map((entry: IAuditLogMapped) => {
            return {
              datecreated: entry.datecreated,
              mappedDate: moment(entry.datecreated).format("YYYY-MM-DD"),
              oldDate: entry.oldvalue.installdate,
              mappedOldDate: moment(entry.oldvalue.installdate).format(
                "YYYY-MM-DD"
              ),
              newDate: entry.value.installdate,
              mappedNewDate: moment(entry.value.installdate).format(
                "YYYY-MM-DD"
              ),
              owner: entry.owner,
              reason: entry.reason,
            };
          }),
        ["datecreated"],
        ["desc"]
      );
    });

    const hasLogs = computed(() => mappedData.value.length > 0);
    return {
      mappedData,
      hasLogs,
    };
  },
});

export default ChangeDateLogTable;
</script>

<template>
  <div>
    <DataTable v-if="hasLogs" :value="mappedData" class="table-main">
      <Column field="mappedDate" header="Date Changed"></Column>
      <Column field="mappedOldDate" header="Previous Install Date"></Column>
      <Column field="mappedNewDate" header="New Install Date"> </Column>
      <Column field="owner" header="Changed By">
        <template #body="{ data }">
          <div class="hide-text">
            {{ data.owner }}
          </div>
        </template>
      </Column>
      <Column field="reason" header="Reason"></Column>
    </DataTable>
    <span v-else>The install date has not been changed before</span>
  </div>
</template>
<style scoped lang="scss">


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

        .p-column-header-content {
          margin-left: 47px;
        }
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

.hide-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.hide-text:hover {
  overflow: visible;
  word-wrap: break-word;
}
</style>
