<script lang="ts">
import { defineComponent,ref } from "vue";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OverlayPanel from 'primevue/overlaypanel';

export const SearchBar = /*#__PURE__*/ defineComponent({
  name: "SearchBar",
  components: {
    Accordion,
    AccordionTab,
    OverlayPanel,
  },
  // setup(_, context) {
  //   function onInput(event: any) {
  //     context.emit("onSearchInput", event.target.value);
  //   }

  //   return {
  //     onInput,
  //   };
  // },
  data() {
    return {
      Equipment:[
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
      ],
      Categories:[
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
      ],
      Inbox:[
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
      ],
      Maintenance:[
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
            { name: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'},
      ],
      isShow: false
    };
  },
  setup() {
    const op = ref();

    function toggleSearchResult(event: Event) {
      op.value.toggle(event);
    }

    return {
      toggleSearchResult,
      op
    };
  },
});

export default SearchBar;
</script>

<template>
  <div class="search-bar-container">
    <!-- <input
      class="search-bar-input"
      type="text"
      placeholder="Search"
      @input="onInput($event)"
    /> -->
    <input
      class="search-bar-input"
      type="text"
      placeholder="Global Search"
      v-on:keyup.enter="toggleSearchResult($event)"
    />
    <div class="search-icon-container">
      <font-awesome-icon class="search-icon" :icon="['fa', 'search']" />
    </div>
    <OverlayPanel ref="op" class="overpanel">
    <Accordion
      :multiple="true"
      :activeIndex="[0, 1, 2]"
      class="search-autocomplete"
    >
      <AccordionTab>
        <template #header>
          <div class="search-accordian-title">
            <span>Equipment</span>
            <span class="search-title-count"> ({{ Equipment.length }})</span>
          </div>
        </template>
        <ul class="search-list-wrapper">
          <li v-for="item in Equipment" :key="item">
            <div class="search-list-item">
              <span
                >{{ item.name }}</span
              >
              <font-awesome-icon
                class="search-right-icon"
                :icon="['fa', 'arrow-right']"
              />
            </div>
          </li>
        </ul>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="search-accordian-title">
            <span>Categories</span>
            <span class="search-title-count"> ({{ Categories.length }})</span>
          </div>
        </template>
        <ul class="search-list-wrapper">
          <li v-for="item in Categories" :key="item">
            <div class="search-list-item">
              <span
                >{{ item.name }}</span
              >
              <font-awesome-icon
                class="search-right-icon"
                :icon="['fa', 'arrow-right']"
              />
            </div>
          </li>
        </ul>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="search-accordian-title">
            <span>Inbox</span>
            <span class="search-title-count"> ({{ Inbox.length }})</span>
          </div>
        </template>
        <ul class="search-list-wrapper">
          <li v-for="item in Inbox" :key="item">
            <div class="search-list-item">
              <span
                >{{ item.name }}</span
              >
              <font-awesome-icon
                class="search-right-icon"
                :icon="['fa', 'arrow-right']"
              />
            </div>
          </li>
        </ul>
      </AccordionTab>
      <AccordionTab>
        <template #header>
          <div class="search-accordian-title">
            <span>Maintenance</span>
            <span class="search-title-count"> ({{ Maintenance.length }})</span>
          </div>
        </template>
        <ul class="search-list-wrapper">
          <li v-for="item in Maintenance" :key="item">
            <div class="search-list-item">
              <span
                >{{ item.name }}</span
              >
              <font-awesome-icon
                class="search-right-icon"
                :icon="['fa', 'arrow-right']"
              />
            </div>
          </li>
        </ul>
      </AccordionTab>
    </Accordion>
  </OverlayPanel>
  </div>
</template>

<style lang="scss">
.search-bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $grey;
  border-radius: 12px;
  border: none;
  outline: none;
  height: 24px;
  width: 100%;
  position: relative;

  .search-bar-input {
    font-family: Poppins, serif;
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    color: $grey3;
    border: none;
    background: none;
    outline: none;
    flex: 1 1 0;
    line-height: 14px;
    padding: 1px 16px;
    min-width: 0;
  }

  .search-icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex: 0 0 25px;
    margin-right: 8px;

    .search-icon {
      color: $grey3;
      font-size: 12px;
    }
  }
}
</style>
