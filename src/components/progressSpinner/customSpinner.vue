<script lang="ts">
import { defineComponent } from "vue";
import ProgressSpinner from "primevue/progressspinner";
export const CustomSpinner = /*#__PURE__*/ defineComponent({
  name: "CustomSpinner",
  components: { ProgressSpinner },
});
export default CustomSpinner;
</script>
<template>
  <div>
    <label>Loading Data...</label>
    <ProgressSpinner class="spinner-1"></ProgressSpinner>
  </div>
</template>
<style scoped lang="scss">

div {
  display: flex;
  align-items: center;
}

label {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: bold;
  font-size: 12px;
  color: black;
  margin-left: 30px;
  margin-right: 20px;
}

.spinner-1 {
  width: 30px;
  height: 30px;
  margin: 2px 2px 2px 2px;
}
</style>
