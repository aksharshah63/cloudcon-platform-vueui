<script lang="ts">
import { defineComponent } from "vue";

export const AuditLogEntry = defineComponent({
  name: "AuditLogEntry",
  props: {
    owner: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    what: {
      type: String,
      required: true,
    },
    oldval: {
      type: String,
      required: true,
    },
    newval: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: false,
      default: "",
    },
  },
});
export default AuditLogEntry;
</script>

<template>
  <div class="p-grid">
    <div class="p-col 7">{{ owner }}</div>
    <div class="p-col-5">{{ time }}</div>
    <div class="p-col-12">
      Updated {{ what }}: {{ oldval }} ——> {{ newval }}
    </div>
    <div class="p-col-12">Reason: {{ reason }}</div>
  </div>
</template>

<style scoped lang="scss"></style>
