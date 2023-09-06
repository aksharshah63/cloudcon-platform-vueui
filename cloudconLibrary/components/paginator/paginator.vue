<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import Dropdown from "primevue/dropdown";

export const Paginator = /*#__PURE__*/ defineComponent({
  name: "Paginator",
  components: {
    Dropdown,
  },
  emits: ["update:itemsPerPage", "changePage"],
  props: {
    currentPageNumber: {
      type: Number,
      required: true,
    },
    numberOfItems: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
    itemsPerPageOptions: {
      type: Array as PropType<number[]>,
      required: false,
      default: () => [1, 5, 10, 20, 50, 200],
    },
  },
  setup(props, { emit }) {
    const numberOfPagesToShowInNavigation = ref(5);

    const itemPerPageOptionsForDropdown = computed<{ value: number }[]>(() => {
      return props.itemsPerPageOptions.map((e) => {
        return { value: e };
      });
    });

    const currentItemsLabel = computed<string>(() => {
      const startNumber =
        props.numberOfItems == 0
          ? 0
          : 1 + (props.currentPageNumber - 1) * props.itemsPerPage;
      const endNumber =
        startNumber + props.itemsPerPage - 1 > props.numberOfItems
          ? props.numberOfItems
          : startNumber + props.itemsPerPage - 1;

      return `${startNumber}-${endNumber} of ${props.numberOfItems}`;
    });

    const numberOfPages = computed<number>(() => {
      return Math.max(Math.ceil(props.numberOfItems / props.itemsPerPage), 1);
    });

    const pagesToShow = computed<number[]>(() => {
      const pages: number[] = [];
      const offset = Math.floor(numberOfPagesToShowInNavigation.value / 2);

      // Add page numbers to show
      for (var i = 0; i < numberOfPagesToShowInNavigation.value; i++) {
        const pageNumber = Math.max(
          i + 1,
          props.currentPageNumber - offset + i
        );

        if (pageNumber > numberOfPages.value) {
          // if we can't add more pages to the end, try adding another page to the start instead
          if (pages[0] > 1) pages.unshift(pages[0] - 1);
          else break;
        } else pages.push(pageNumber);
      }

      return pages;
    });

    const isFirstPageSelected = computed<boolean>(
      () => props.currentPageNumber == 1
    );

    const isLastPageSelected = computed<boolean>(
      () => props.currentPageNumber == numberOfPages.value
    );

    function updateItemsPerPage(newitemsPerPage: number): void {
      emit("update:itemsPerPage", newitemsPerPage);
      changePage(1);
    }

    function changePage(newPageNumber: number): void {
      emit("changePage", newPageNumber);
    }

    return {
      itemPerPageOptionsForDropdown,
      currentItemsLabel,
      numberOfPages,
      pagesToShow,
      isFirstPageSelected,
      isLastPageSelected,
      updateItemsPerPage,
      changePage,
    };
  },
});
export default Paginator;
</script>

<template>
  <div
    class="paginator is-flex is-justify-content-center is-align-items-center"
  >
    <div
      class="paginator-items-per-page-container is-flex is-justify-content-center is-align-items-center"
    >
      <span class="paginator-items-per-page-label">Items per page</span>
      <Dropdown
        class="paginator-dropdown-field paginator-items-per-page"
        :modelValue="itemsPerPage"
        :options="itemPerPageOptionsForDropdown"
        optionLabel="value"
        optionValue="value"
        @update:modelValue="updateItemsPerPage($event)"
      />
    </div>

    <span class="paginator-current-items-label">{{ currentItemsLabel }}</span>

    <div
      class="paginator-navigation-container is-flex is-justify-content-center is-align-items-stretch"
    >
      <button
        class="paginator-navigation-first"
        :class="{
          pointer: !isFirstPageSelected,
        }"
        :disabled="isFirstPageSelected"
        @click="changePage(1)"
      >
        <font-awesome-icon
          class="paginator-navigation-icon paginator-navigation-first-icon"
          :icon="['fa', 'angle-double-left']"
        />
      </button>

      <button
        class="paginator-navigation-previous"
        :class="{
          pointer: !isFirstPageSelected,
        }"
        :disabled="isFirstPageSelected"
        @click="changePage(currentPageNumber - 1)"
      >
        <font-awesome-icon
          class="paginator-navigation-icon paginator-navigation-previous-icon"
          :icon="['fa', 'angle-left']"
        />
      </button>

      <button
        v-for="pageNumber in pagesToShow"
        :key="pageNumber"
        class="paginator-navigation-page pointer"
        :class="{
          'selected-page': pageNumber == currentPageNumber,
        }"
        :disabled="pageNumber == currentPageNumber"
        @click="changePage(pageNumber)"
      >
        <span class="paginator-navigation-page-label">{{ pageNumber }}</span>
      </button>

      <button
        class="paginator-navigation-next"
        :class="{
          pointer: !isLastPageSelected,
        }"
        :disabled="isLastPageSelected"
        @click="changePage(currentPageNumber + 1)"
      >
        <font-awesome-icon
          class="paginator-navigation-icon paginator-navigation-next-icon"
          :icon="['fa', 'angle-right']"
        />
      </button>

      <button
        class="paginator-navigation-last"
        :class="{
          pointer: !isLastPageSelected,
        }"
        :disabled="isLastPageSelected"
        @click="changePage(numberOfPages)"
      >
        <font-awesome-icon
          class="paginator-navigation-icon paginator-navigation-last-icon"
          :icon="['fa', 'angle-double-right']"
        />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.paginator {
  gap: var(--paginator-gap);

  > .paginator-items-per-page-container {
    gap: var(--paginator-items-per-page-container-gap);

    > .paginator-items-per-page-label {
      font-size: var(--paginator-items-per-page-label-font-size);
    }

    > .paginator-items-per-page {
    }
  }

  > .paginator-current-items-label {
    font-size: var(--paginator-current-items-label-font-size);
    min-width: var(--paginator-current-items-label-min-width);
    text-align: center;
  }

  > .paginator-navigation-container {
    gap: var(--paginator-navigation-container-gap);

    > .paginator-navigation-first,
    > .paginator-navigation-next,
    > .paginator-navigation-previous,
    > .paginator-navigation-last,
    > .paginator-navigation-page {
      background: var(--paginator-navigation-button-background-colour);
      border: var(--paginator-navigation-button-border);
      border-radius: var(--paginator-navigation-button-border-radius);
      min-height: var(--paginator-navigation-button-min-height);
      min-width: var(--paginator-navigation-button-min-width);
      padding: var(--paginator-navigation-button-padding);

      &:disabled {
        > .paginator-navigation-icon {
          color: var(--paginator-navigation-icon-disabled-colour);
        }
      }

      &:hover:not(:disabled):not(.selected-page) {
        background: var(--paginator-navigation-button-hover-background-colour);
      }

      &.selected-page {
        background: var(
          --paginator-navigation-button-selected-page-background-colour
        );
        color: var(--paginator-navigation-button-selected-page-font-colour);
      }

      > .paginator-navigation-icon {
        font-size: var(--paginator-navigation-icon-font-size);
        color: var(--paginator-navigation-icon-colour);
      }
    }
  }

  // Style for all dropdowns in paginator
  ::v-deep(.paginator-dropdown-field) {
    border-radius: var(--paginator-field-border-radius);
    border: var(--paginator-field-border);

    &.p-focus {
      box-shadow: none;
    }

    .p-inputtext {
      font-family: Poppins, serif;
      font-style: normal;
      font-weight: normal;
      font-size: var(--paginator-field-text-font-size);
      color: var(--paginator-field-text-font-colour);
    }
  }
}
</style>
