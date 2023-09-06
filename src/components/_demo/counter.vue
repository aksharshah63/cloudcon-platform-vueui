<script lang="ts">
import { defineComponent } from "vue";

export interface CounterData {
  counter: number;
  initCounter: number;
  message: {
    action: string | null;
    amount: number | null;
  };
}

export const DemoCounter = /*#__PURE__*/ defineComponent({
  name: "DemoCounter", // vue component name
  data(): CounterData {
    return {
      counter: 5,
      initCounter: 5,
      message: {
        action: null,
        amount: null,
      },
    };
  },
  computed: {
    changedBy() {
      const { message } = this as CounterData;
      if (!message.action) return "initialized";
      return `${message.action} ${message.amount || ""}`.trim();
    },
  },
  methods: {
    increment(arg: Event | number): void {
      const amount = typeof arg !== "number" ? 1 : arg;
      this.counter += amount;
      this.message.action = "incremented by";
      this.message.amount = amount;
    },
    decrement(arg: Event | number): void {
      const amount = typeof arg !== "number" ? 1 : arg;
      this.counter -= amount;
      this.message.action = "decremented by";
      this.message.amount = amount;
    },
    reset(): void {
      this.counter = this.initCounter;
      this.message.action = "reset";
      this.message.amount = null;
    },
  },
});
export default DemoCounter;
</script>

<template>
  <div class="cloudcon-demo">
    <p>
      The counter was {{ changedBy }} to <strong>{{ counter }}</strong
      >.
    </p>
    <button @click="increment">Click +1</button>
    <button @click="decrement">Click -1</button>
    <button @click="increment(5)">Click +5</button>
    <button @click="decrement(5)">Click -5</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<style scoped>
.cloudcon-demo {
  display: block;
  width: 400px;
  margin: 25px auto;
  border: 1px solid #ccc;
  background: #eaeaea;
  text-align: center;
  padding: 25px;
}
.cloudcon-demo p {
  margin: 0 0 1em;
}
</style>
