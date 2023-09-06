<script lang="ts">
import Button from "primevue/button";
import dateOperation from "../../../cloudconLibrary/utilities/useDateOperations";
import { defineComponent, watch, ref } from "vue";
export const DateChooser = /*#__PURE__*/ defineComponent({
  name: "DateChooser",
  props: {
    startOfWeek: {
      type: Number,
      required: true,
    },
    endOfWeek: {
      type: Number,
      required: true,
    },
    disableButtons: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMonth: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    Button,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>, { emit }) {
    const startOfWeekString = ref(
      dateOperation.getCurrentDayString(props.startOfWeek)
    );
    const endOfWeekString = ref(
      dateOperation.getCurrentDayString(props.endOfWeek)
    );
    function setWeek(addWeek: string) {
      emit("setNext", addWeek);
    }
    watch(
      () => props.isMonth,
      () => {
        if (!props.isMonth) {
          startOfWeekString.value = dateOperation.getCurrentDayString(
            props.startOfWeek
          );
          endOfWeekString.value = dateOperation.getCurrentDayString(
            props.endOfWeek
          );
        } else {
          startOfWeekString.value = dateOperation.getDateString(
            props.startOfWeek,
            "MMMM YYYY"
          );
        }
      }
    );
    watch(
      () => [props.startOfWeek, props.endOfWeek],
      () => {
        if (!props.isMonth) {
          startOfWeekString.value = dateOperation.getCurrentDayString(
            props.startOfWeek
          );
          endOfWeekString.value = dateOperation.getCurrentDayString(
            props.endOfWeek
          );
        } else {
          startOfWeekString.value = dateOperation.getDateString(
            props.startOfWeek,
            "MMMM YYYY"
          );
        }
      }
    );
    return {
      startOfWeekString,
      endOfWeekString,
      setWeek,
    };
  },
});

export default DateChooser;
</script>

<template>
  <div class="dateSection custom-scrollbar">
    <Button :disabled="disableButtons" @click="setWeek('prev')">
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
    </Button>
    <p v-if="!isMonth">{{ startOfWeekString }} - {{ endOfWeekString }}</p>
    <p v-else>{{ startOfWeekString }}</p>
    <Button :disabled="disableButtons" @click="setWeek('next')">
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.dateSection {
  display: flex;
  flex-direction: row;
  p {
    text-align: center;
    min-width: 100px;
    width: 325px;
    margin: auto 8px auto 8px;
    font-size: 24px;
    font-family: Poppins, serif;
    font-style: normal;
    font-weight: 600;
  }
  .pointer {
    width: 20px;
    height: 20px;
  }
}
</style>
