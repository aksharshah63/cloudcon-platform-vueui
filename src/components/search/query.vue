<script lang="ts">
import { defineComponent, ref } from "vue";
import { FilterMatchMode } from "primevue/api";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";


export const SearchQuery = /*#__PURE__*/ defineComponent({
  name: "SearchQuery",
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
  },
  setup(props: Record<string, any>) {
    const filter = ref();
    const upviseDataMessage = ref(props.upviseDataMessage);

    function clicked() {
      // console.log(filter.value);
    }

    function updateFilter() {
      upviseDataMessage.value.globalSearch = {
        global: { value: filter.value, matchMode: FilterMatchMode.CONTAINS },
      };
    }

    function clearFilter() {
      filter.value = "";
      updateFilter();
    }

    // watch(
    //   () => filter.value,
    //   (currentValue) => {
    //     // debounce(
    //       (upviseDataMessage.value.globalSearch = {
    //         global: {
    //           value: currentValue,
    //           matchMode: FilterMatchMode.CONTAINS,
    //         },}
    //       // }),
    //       // 250
    //     );
    //   }
    // );

    return { filter, clicked, updateFilter, clearFilter };
  },
});

export default SearchQuery;
</script>

<template>
  <div>
    <div class="search">
      <input
        v-model="filter"
        @keydown.enter="updateFilter()"
        @keydown.esc="clearFilter()"
        class="search-input"
        type="text"
        placeholder="Search"
      />
      <font-awesome-icon class="search-icon" :icon="['fa', 'search']" />
    </div>
  </div>
</template>

<style lang="scss" scoped>


.search {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  margin-right: -12px;

  .search-input {
    font-family: Poppins, serif;
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    color: $grey3;
    height: 24px;
    background-color: $grey;
    border-radius: 12px;
    border: none;
    outline: none;
    padding-left: 16px;
    padding-right: 40px;
  }

  .search-icon {
    position: relative;
    right: 30px;
  }
}
</style>
