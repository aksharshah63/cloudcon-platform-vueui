<script lang="ts">
import localforage from "localforage";
import Sidebar from "primevue/sidebar";
import { computed, defineComponent, onMounted, ref } from "vue";
import { IRecord } from "../../../store/modules/upvise.d";
import QuoteDisplay from "./quoteDisplay.vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import RadioButton from "primevue/radiobutton";
import { importQuotes } from "../../../use/function/importQuoteFunctions";

import { useState, stateSymbol } from "../../../store/index";
import { IRecordPlannerMilestone } from "../../../use/controller/project/planner.d";

export const QuoteImport = /*#__PURE__*/ defineComponent({
  name: "QuoteImport",
  inject: [stateSymbol.description!],
  props: {
    projectid: {
      type: String,
      required: true,
    },
  },
  components: {
    Sidebar,
    QuoteDisplay,
    Dropdown,
    Button,
    RadioButton,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const showImportScreen = ref(true);
    const selectedMilestone = ref();
    const importUnderSelectedMilestone = ref(null);
    const quotes = ref();
    const selectedQuotes = ref<Record<string, IRecord>>({});

    onMounted(async () => {
      quotes.value = await getQuotes();
    });

    const currentMilestones = computed(() => {
      return (
        Object.values(
          upvise.entityFilter(
            "TableSchedulerMilestones",
            "projectid",
            props.projectid
          )
        ).map((entry) => {
          return { value: entry, label: entry.name };
        }) || null
      );
    });

    async function getQuotes() {
      var localForageInstance = localforage.createInstance({
        name: "upvise",
        storeName: "tables",
      });

      return localForageInstance
        .getItem("unybiz.sales.quotes")
        .then((result: unknown) => {
          return (
            result as { name: string; items: Record<string, unknown>[] }
          ).items.filter((quote: Record<string, unknown>) => {
            let quoteCustom: Record<string, unknown> = {};

            try {
              quoteCustom = JSON.parse(quote.custom as string);
            } catch (e) {
              quoteCustom = {};
            }

            return (
              quote.status === 0 &&
              (quote.projectid === "" ||
                (quote.projectid === props.projectid &&
                  quoteCustom.F4 === undefined)) &&
              quote.totalex !== 0
            );
          });
        });
    }

    function addToRefList(quote: IRecord, id: string) {
      selectedQuotes.value[id] = quote;
      // console.log(selectedQuotes.value);
    }

    function removeFromRefList(id: string) {
      delete selectedQuotes.value[id];
      // console.log(selectedQuotes.value);
    }

    function closeImportQuoteScreen() {
      showImportScreen.value = false;
      emit("closeImportQuote");
    }

    function checkQuotesSelected() {
      if (Object.entries(selectedQuotes.value).length > 0) return true;
      else return false;
    }

    function checkQuotes() {
      if (quotes.value && quotes.value.length > 0) return true;
      else return false;
    }

    async function importSelectedQuotesUnderMilestone() {
      await importQuotes(
        Object.values(selectedQuotes.value) as IRecord[],
        JSON.parse(
          JSON.stringify(selectedMilestone.value.value)
        ) as IRecordPlannerMilestone,
        props.projectid,
        upvise
      ).then(() => {
        closeImportQuoteScreen();
      });
    }

    async function importSelectedQuotesAsMilestone() {
      await importQuotes(
        Object.values(selectedQuotes.value) as IRecord[],
        null,
        props.projectid,
        upvise
      ).then(() => closeImportQuoteScreen());
    }

    return {
      showImportScreen,
      closeImportQuoteScreen,
      quotes,
      addToRefList,
      removeFromRefList,
      currentMilestones,
      selectedMilestone,
      importUnderSelectedMilestone,
      checkQuotesSelected,
      checkQuotes,
      importSelectedQuotesUnderMilestone,
      importSelectedQuotesAsMilestone,
    };
  },
});

export default QuoteImport;
</script>

<template>
  <div>
    <sidebar
      class="import-quote-screen"
      :visible="showImportScreen"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <span class="header-name"> Import from Quote </span>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="option" @click="closeImportQuoteScreen()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-4" style="display: flex; align-items: center">
          <radio-button
            id="importQuotesOption1"
            :value="false"
            v-model="importUnderSelectedMilestone"
          />
          <label class="radio-button-label" for="importQuotesOption1"
            >Import As milestone</label
          >
        </div>
        <div class="p-col-4" style="display: flex; align-items: center">
          <radio-button
            id="importQuotesOption2"
            :value="true"
            v-model="importUnderSelectedMilestone"
          />
          <label class="radio-button-label" for="importQuotesOption2"
            >Import under Selected Milestone</label
          >
        </div>
        <div class="p-col-4" style="display: flex; align-items: center">
          <Dropdown
            class="input-dropdown-field"
            v-model="selectedMilestone"
            :options="currentMilestones"
            optionLabel="label"
            placeholder="Select Milestone"
            :disabled="!importUnderSelectedMilestone"
          />
        </div>

        <div class="p-col-12">
          <span class="header-name"> Select a quote to import </span>
        </div>

        <div v-if="!checkQuotes()" class="p-col-12">
          <span class="header-name"> No Quotes </span>
        </div>

        <div class="p-col-12" style="overflow-y: auto; overflow-x: hidden">
          <div v-for="quote of quotes" v-bind:key="quote.id">
            <QuoteDisplay
              :quote-data="quote"
              @toggleOn="addToRefList(quote, quote.id)"
              @toggleOff="removeFromRefList(quote.id)"
            />
          </div>
        </div>

        <div class="p-col-8" />
        <div class="p-col-4">
          <Button
            @click="
              importUnderSelectedMilestone
                ? importSelectedQuotesUnderMilestone()
                : importSelectedQuotesAsMilestone()
            "
            :disabled="
              importUnderSelectedMilestone === null ||
              (importUnderSelectedMilestone && !selectedMilestone) ||
              !checkQuotesSelected()
            "
            >Import</Button
          >
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped lang="scss">

</style>
