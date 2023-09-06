<script lang="ts">
import { defineComponent, ref } from "vue";
export const DatatableActionHeader = /*#__PURE__*/ defineComponent({
  name: "DatatableActionHeader",
  components: { },
  setup() {
    const checked = ref(false);
    return {
      checked,
    };
  },
});
export default DatatableActionHeader;
</script>

<template>
  <div class="datatable-action-wrapper">
    <div class="datable-view-search">
      <div class="search-bar-container">
        <input class="search-bar-input" type="text" placeholder="Search" />
        <div class="search-icon-container">
          <font-awesome-icon class="search-icon" :icon="['fa', 'search']" />
        </div>
      </div>
    </div>
    <div class="datatable-view-filter-button-container">
      <div
        class="
          datatable-view-filter-button
          is-flex is-justify-content-center is-align-items-center
          pointer
        "
      >
        <font-awesome-icon
          class="datatable-view-filter-button-icon"
          :icon="['fa', 'filter']"
        />
        <span class="datatable-view-filter-button-label">FILTER</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.datatable-action-wrapper {
  display: inline-flex;
  justify-content: flex-end;
  width: 30%;
  margin-left: auto;
  position: relative;
  bottom: -40px;
  right: -70%;
  z-index: 3;

  .datable-view-search {
    margin-right: 10px;
  }

  .datatable-view-filter-button {
    gap: var(--datatable-filer-button-gap);
    border-radius: var(--datatable-filer-button-border-radius);
    border: var(--datatable-filer-button-border);
    padding: var(--datatable-filer-button-padding);
    height: fit-content;
    background: var(--datatable-filer-button-background-colour);

    > .datatable-view-filter-button-icon {
      color: var(--datatable-filter-button-icon-colour);
      font-size: var(--datatable-filter-button-icon-font-size);
    }

    > .datatable-view-filter-button-label {
      font-weight: var(--datatable-filter-button-label-font-weight);
      font-size: var(--datatable-filter-button-label-font-size);
      line-height: var(--datatable-filter-button-label-font-size);
      color: var(--datatable-filter-button-label-font-colour);
    }
  }
}
</style>
