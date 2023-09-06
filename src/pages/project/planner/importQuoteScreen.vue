<script lang="ts">
import localforage from "localforage";
import Sidebar from "primevue/sidebar";
import { computed, defineComponent, onMounted, ref } from "vue";
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import QuoteDisplay from "./quoteDisplay.vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { importQuotes } from "../../../use/function/importQuoteFunctions";
import { useToast } from "primevue/usetoast";
import { useState } from "../../../store/index";
import { stateSymbol } from "../../../store";
import { IRecordPlannerMilestone } from "../../../use/controller/project/planner.d";

export const ImportQuoteScreen = /*#__PURE__*/ defineComponent({
  name: "importQuoteScreen.vue",
  inject: [stateSymbol.description!],
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
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
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setup(props: Record<string, any>, { emit }) {
    /*const plantId = "7163B2C6A81B19BFFC686B58AC6696";
    const labourId = "A3D4998BB226B5659BA7EA68EF3A1E";
    const materialId = "69A1A34922F2311A0090A373610ACA";
    const subcontractorId = "A9C3082BC44FC44B3EA357B07D46C2";
    */
    const upvise = useState().upvise;
    const toast = useToast();
    const showImportScreen = ref(true);
    const upviseDataMessage = ref(props.upviseDataMessage);
    const selectedMilestone = ref();
    const quotes = ref();
    const selectedQuotes = ref<Record<string, IRecord>>({});

    onMounted(async () => {
      quotes.value = await getQuotes();
    });

    const currentMilestones = computed(() => {
      return (
        upvise
          .entityFilter(
            "TableSchedulerMilestones",
            "projectid",
            props.projectid
          )
          .map((entry: Record<string, unknown>) => {
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
            return quote.projectid === "";
          });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function addToRefList(quote: IRecord, id: string) {
      selectedQuotes.value[id] = quote;
      console.log(selectedQuotes.value);
    }

    function removeFromRefList(id: string) {
      delete selectedQuotes.value[id];
      console.log(selectedQuotes.value);
    }

    function closeImportQuoteScreen() {
      showImportScreen.value = false;
      emit("closeImportQuote");
    }

    function checkQuotesSelected() {
      if (Object.entries(selectedQuotes.value).length > 0) return true;
      else {
        toast.add({
          severity: "warn",
          summary: "No Quotes Selected",
          life: 1000,
        });
        return false;
      }
    }
    async function importSelectedQuotesUnderMilestone() {
      //Creating the local forages
      if (!checkQuotesSelected()) return;
      //let milestoneCheck = null;
      console.log("Starting import");
      console.log(selectedQuotes.value);
      console.log(selectedMilestone.value);
      if (
        selectedMilestone.value != undefined &&
        selectedMilestone.value.value != undefined
      )
        await importQuotes(
          Object.values(selectedQuotes.value) as IRecord[],
          JSON.parse(
            JSON.stringify(selectedMilestone.value.value)
          ) as IRecordPlannerMilestone,
          props.projectid,
          upvise
        );
      else {
        toast.add({
          severity: "warn",
          summary: "No Milestone Selected",
          life: 1000,
        });
        return;
      }
      closeImportQuoteScreen();
    }

    async function importSelectedQuotesAsMilestone() {
      if (!checkQuotesSelected()) return;
      await importQuotes(
        Object.values(selectedQuotes.value) as IRecord[],
        null,
        props.projectid,
        upvise
      );
      closeImportQuoteScreen();
    }

    return {
      showImportScreen,
      // eslint-disable-next-line vue/no-dupe-keys
      upviseDataMessage,
      closeImportQuoteScreen,
      quotes,
      addToRefList,
      removeFromRefList,
      currentMilestones,
      selectedMilestone,
      importSelectedQuotesUnderMilestone,
      importSelectedQuotesAsMilestone,
    };
  },
});

export default ImportQuoteScreen;
</script>

<template>
  <div>
    <sidebar
      class="task-screen"
      style="overflow: hidden; max-height: 100%; height: 100%; z-index: 100"
      :visible="showImportScreen"
      position="right"
    >
      <div class="p-grid task-grid" style="height: 10%">
        <div class="p-col-7">
          <span class="header-name"> Import Quote </span>
        </div>
        <div class="p-col-5 task-options">
          <div class="option" @click="closeImportQuoteScreen()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>
      <div style="max-height: 70%; overflow-y: scroll; overflow-x: hidden">
        <div v-for="quote of quotes" v-bind:key="quote.id">
          <QuoteDisplay
            :quote-data="quote"
            @toggleOn="addToRefList(quote, quote.id)"
            @toggleOff="removeFromRefList(quote.id)"
          />
        </div>
      </div>
      <div style="max-height: 20%; height: 20%">
        <div class="p-grid task-grid">
          <div class="p-col-4">
            <Button @click="importSelectedQuotesUnderMilestone()"
              >Import under Selected Milestone</Button
            >
          </div>
          <div class="p-col-8">
            <Dropdown
              class="input-dropdown-field"
              v-model="selectedMilestone"
              :options="currentMilestones"
              optionLabel="label"
            />
          </div>
          <div class="p-col-4">
            <Button class="p-col-12" @click="importSelectedQuotesAsMilestone"
              >Import As milestone</Button
            >
          </div>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped lang="scss">
:global(.p-sidebar-content) {
  overflow: hidden;
}
</style>
