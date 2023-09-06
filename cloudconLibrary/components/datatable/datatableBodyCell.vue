<script lang="ts">
import { defineComponent } from "vue";
import DisplayStyle from "../display/style.vue";

export const DatatableBodyCell = /*#__PURE__*/ defineComponent({
  name: "DatatableBodyCell",
  components: {
    DisplayStyle
  },
  props: {
    data: {
      required: true,
    },
    style: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup(_props) {

    return {
    };
  },
});
export default DatatableBodyCell;
</script>

<template>
  <div
    class="
      datatable-body-cell
      is-flex is-justify-content-center is-align-items-center
    "
  >
    <DisplayStyle
      :data="data"
      :typeSpecialisation="style"
    />
  </div>
</template>

<style scoped lang="scss">
.datatable-body-cell {
  padding: var(--datatable-body-cell-padding);
  font-size: var(--datatable-body-cell-font-size);
  height: 100%;
}
</style>