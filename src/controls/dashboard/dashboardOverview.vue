<script lang="ts">
import { defineComponent } from "vue";
import CustomSpinner from "../../components/progressSpinner/customSpinner.vue";
import HeaderActions from "../../components/header/actions.vue";

export const DashboardOverview = /*#__PURE__*/ defineComponent({
  name: "DashboardOverview",
  components: {
    CustomSpinner,
    HeaderActions,
  },
  props: {
    isLoading: {
      type: Boolean,
      default: false,
      required: false,
    },
    headerActionButtons: {
      type: [Object],
      required: false,
    },
  },
  setup(props, { emit }) {
    const hasHeaderActions = props.headerActionButtons?.length > 0;
    // This is the new dashboard overview. At the moment only used for Payroll

    const onHeaderActionClicked = function (value: string) {
      emit("headerActionClicked", value);
    };

    return {
      props,
      hasHeaderActions,
      onHeaderActionClicked,
    };
  },
});

export default DashboardOverview;
</script>

<template>
  <div class="dashboard-overview">
    <CustomSpinner v-if="props.isLoading"></CustomSpinner>
    <div class="title-actions columns">
      <div class="column">
        <slot name="header-title"></slot>
      </div>
      <div v-if="hasHeaderActions" class="column">
        <HeaderActions
          :actionButtons="headerActionButtons"
          :useColumnPicker="false"
          :useFavouriteManager="false"
          @actionClicked="onHeaderActionClicked"
        />
      </div>
    </div>

    <div class="header-cell">
      <slot name="header-row-1"></slot>
      <div class="header-cell">
        <slot name="header-row-1-col-1"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-1-col-2"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-1-col-3"></slot>
      </div>
    </div>

    <div class="header-cell">
      <slot name="header-row-2"></slot>
      <div class="header-cell">
        <slot name="header-row-2-col-1"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-2-col-2"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-2-col-3"></slot>
      </div>
    </div>

    <div class="header-cell">
      <slot name="header-row-3"></slot>
      <div class="header-cell">
        <slot name="header-row-3-col-1"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-3-col-2"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-3-col-3"></slot>
      </div>
    </div>

    <div class="header-cell">
      <slot name="header-row-4"></slot>
      <div class="header-cell">
        <slot name="header-row-4-col-1"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-4-col-2"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-4-col-3"></slot>
      </div>
    </div>

    <div class="header-cell">
      <slot name="header-row-5"></slot>
      <div class="header-cell">
        <slot name="header-row-5-col-1"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-5-col-2"></slot>
      </div>
      <div class="header-cell">
        <slot name="header-row-5-col-3"></slot>
      </div>
    </div>

    <div class="header-cell">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.dashboard-overview {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  background-color: $grey4;
  min-width: 900px;
  padding: 12px;
  height: 100vh;

  .title-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 0;
    padding: 15px;

    &:empty {
      display: none;
    }
  }

  .header-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 0;
    padding: 15px;

    &:empty {
      display: none;
    }
  }
}

.header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  padding: 15px;

  .header-cell:only-child {
    justify-content: start;
  }

  .header-cell:last-child {
    justify-content: end;
  }

  .header-cell:first-child {
    justify-content: start;
  }

  .header-cell:only-child {
    justify-content: start;
  }

  .header-cell:last-child {
    justify-content: end;
  }

  .body-container {
    padding: 12px;
  }
}
</style>
