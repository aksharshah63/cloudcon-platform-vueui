<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    Title: {
      type: String,
      required: false,
    },
    Amount: {
      type: Number,
      required: false,
    },
  },
  setup() {},
});
</script>
<template>
  <div class="linked-button">
    <div class="linked-header" style="text-align: left">{{ Title }}</div>
    <div class="linked-amount" style="float: right">
      {{ Amount }}
    </div>
  </div>
</template>
<style scoped>
.linked-button {
  /* Info */
  width: 100%;
  height: 48px;

  /* Primary / Dark Green */
  background: #007fff;
  box-shadow: 10px 10px 20px rgba(0, 127, 255, 0.3);
  border-radius: 8px;

  /* Inside auto layout */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  order: 2;
  flex-grow: 1;
  padding: 10px;
}

.linked-header {
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.linked-amount {
  font-size: 1rem;
  font-style: bold;
  color: white;
}
</style>
