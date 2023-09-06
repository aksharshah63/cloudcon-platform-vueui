<script lang="ts">
import { computed, defineComponent, ref, watch, watchEffect } from "vue";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import RadioButton from "primevue/radiobutton";
import Overlay from "../loading/overlay.vue";
import { FavouriteEntry } from "./favouriteEntry.vue";
import {
  IColumnMetadata,
  IUpviseDataMessage,
  IFavourite,
  IGroupDetail,
  ISort,
  IGridSlicingFilter,
} from "../../store/modules/upvise.d";
import { favouriteManager } from "../../use/controller/favouriteManager/favouriteManager";
import { IFavouriteRecord } from "../../use/controller/favouriteManager/favouriteManager.d";
import utils from "../../use/function/useUtils";
import _ from "lodash";
import { useState } from "../../store";

//BEFORE SAVING, OR DELETING ANY DATA NEED TO REFRESH DATA FROM
export const FavouriteManager = /*#__PURE__*/ defineComponent({
  name: "FavouriteManager",
  components: {
    Sidebar,
    FavouriteEntry,
    Overlay,
    ProgressSpinner,
    InputText,
    Checkbox,
    Button,
    RadioButton,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    filtersArray: {
      type: Object as () => Record<string, Record<string, IGridSlicingFilter>>,
      required: true,
    },
    awaitingResponse: {
      type: Boolean,
      required: true,
    },
    showScreen: {
      type: Boolean,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
    enabled: {
      type: Boolean,
      required: true,
    },
    sortArray: {
      type: Object as () => ISort[],
      required: true,
    },
    moduleName: {
      type: String,
      required: false,
      default: "",
    },
    columnLayout: {
      type: Object as () => Record<string, Record<string, number>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const upvise = useState().upvise;
    const upviseDataMessage = ref(props.upviseDataMessage);
    const favouriteController = favouriteManager(upvise);
    const newFavouriteName = ref("");
    const isGlobal = ref(false);
    const statusText = ref("");
    const saveFilters = ref(false);
    const saveLayout = ref(false);
    const saveAsFavourite = ref(false);
    const searchString = ref("");
    const newFavouriteScreen = ref(false);
    const internalFilter = ref(false);
    const loadLastUsedFavourite = ref(true);
    const isSavingLastUsed = ref(false);
    const saveLastUsed = ref(false);
    const overlay = ref(false);

    const favourites = computed(() => {
      return Object.values(
        upvise.entityData("TableEmployeedashboardFavouriteslist")
      ).filter(() => utils.IsActive) as unknown as IFavouriteRecord[];
    });

    const availableFavouriteRecords = computed(() =>
      favourites.value.filter(
        (r) =>
          (r.isglobal === "_global" || r.user === upvise.upviseUser) &&
          r.module === props.moduleName &&
          !r.name.startsWith("_")
      )
    );

    const availableFavourites = computed(() =>
      availableFavouriteRecords.value.map((r) => recordToFavourite(r))
    );

    const lastUsedFavourite = computed(() => {
      let lastUsedRecords = favourites.value.filter(
        (r) =>
          r.user === upvise.upviseUser &&
          r.module === props.moduleName &&
          r.name === "_last_use"
      );

      if (lastUsedRecords.length > 1)
        lastUsedRecords.slice(1).forEach((r) => deleteFavouriteRecord(r));

      return lastUsedRecords.length > 0
        ? recordToFavourite(lastUsedRecords[0])
        : undefined;
    });

    const favouritedFavourites = computed(() => {
      return availableFavourites.value
        .filter((f) => f.whoFavourited.includes(upvise.upviseUser))
        .sort(nameSort);
    });

    const notFavouritedFavourites = computed(() => {
      return availableFavourites.value
        .filter(
          (f) =>
            !f.whoFavourited.includes(upvise.upviseUser) &&
            f.name.includes(searchString.value)
        )
        .sort(nameSort);
    });

    async function deleteFavouriteRecord(favouriteRecord: IFavouriteRecord) {
      const newFavouriteRecord = {
        ...favouriteRecord,
        _type: "DELETE",
      };
      await favouriteController.updateFavourite(newFavouriteRecord);
    }

    function nameSort(f1: IFavourite, f2: IFavourite) {
      let name1 = f1.name.toUpperCase();
      let name2 = f2.name.toUpperCase();
      return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
    }

    function recordToFavourite(r: IFavouriteRecord) {
      let parsedFaveInfo = JSON.parse(r.favourite);
      parsedFaveInfo.owner = r.user;
      parsedFaveInfo.isGlobal = r.isglobal === "_global";
      parsedFaveInfo.name = r.name;
      parsedFaveInfo.recordid = r.id;
      return parsedFaveInfo as IFavourite;
    }

    function validateFavourite() {
      if (newFavouriteName.value === "")
        return "Unable to create favourite as the name is empty";
      if (
        !internalFilter.value &&
        availableFavourites.value.some(
          (entry: IFavourite) => entry.name === newFavouriteName.value
        )
      )
        return "Unable to create favourite as a favourite with that name already exists!";
      if (newFavouriteName.value.startsWith("_") && !internalFilter.value)
        return "Unable to create favourite as the name of the favourite starts with an _";
      if (isGlobal.value && newFavouriteName.value == "Last Used")
        return "Unable to create a global filter with this name!";
      if (!saveFilters.value && !saveLayout.value)
        return "Unable to create favourite as neither layout or filters will be saved";

      return null;
    }

    function getExistingFavouriteRecord(favourite: IFavourite) {
      return favourite.recordid
        ? favourites.value.find((r) => r.id === favourite.recordid)
        : undefined;
    }

    function saveLastUse() {
      if (props.enabled) {
        loadLastUsedFavourite.value = false;
        internalFilter.value = true;

        saveFavourite(true).then(() => {
          console.log("last used favourite saved");
          isSavingLastUsed.value = false;
          if (saveLastUsed.value) {
            isSavingLastUsed.value = true;
            saveLastUsed.value = false;
            saveLastUse();
          }
        });

        internalFilter.value = false;
      } else {
        isSavingLastUsed.value = false;
      }
    }

    function loadFavourite(favouriteToLoad: IFavourite) {
      if (props.enabled) {
        const grouping = upviseDataMessage.value.definition?.Grouping;
        if (grouping) {
          Object.values(grouping).forEach((groupDetail: IGroupDetail) => {
            const groupType = groupDetail.Type;
            if (
              groupType &&
              favouriteToLoad.columnLayout[groupType] &&
              favouriteToLoad.columnLayout[groupType].length != 0
            ) {
              const groupColumnLayout = favouriteToLoad.columnLayout[groupType];
              const schema =
                upviseDataMessage.value.persistence[groupType]?.Schema;
              if (schema)
                schema.forEach((c: IColumnMetadata) => {
                  if (c.InternalName && c.InternalName in groupColumnLayout) {
                    c.Hidden = false;
                    c.DisplayOrderIndex = groupColumnLayout[c.InternalName];
                  } else {
                    c.Hidden = true;
                    c.DisplayOrderIndex = -1;
                  }
                });
            }
          });
        }

        // currentFilters.value = favouriteToLoad.filters;
        if (!_.isEmpty(favouriteToLoad.filters))
          emit("updateFiltersArray", favouriteToLoad.filters);
        if (favouriteToLoad.itemsPerPage && favouriteToLoad.itemsPerPage != 0)
          emit("updateItemsPerPage", favouriteToLoad.itemsPerPage);
        if (favouriteToLoad.sort.length != 0)
          emit("updateSortArray", favouriteToLoad.sort);

        console.log("LOADED FAVOURITE", favouriteToLoad);
      }

      closeFavouriteScreen();
    }

    async function saveFavourite(isLastUsed = false) {
      if (props.enabled) {
        // email will give the email of the user if preferred
        // displayName will give the name if preferred (eg. Cloudcon Pty Ltd)
        //We need to get filters from upvise data message!

        const errorText = validateFavourite();
        if (!isLastUsed && errorText !== null) {
          statusText.value = errorText;
          return;
        }

        const columnsToSaveCopy = JSON.parse(
          JSON.stringify(props.columnLayout)
        );
        let filtersToSave = JSON.parse(
          JSON.stringify(props.filtersArray)
        ) as Record<string, Record<string, IGridSlicingFilter>>;
        let favouriteToSave: IFavourite = {
          owner: upvise.upviseUser,
          isGlobal: isGlobal.value,
          name: newFavouriteName.value,
          columnLayout: saveLayout.value
            ? (columnsToSaveCopy as Record<string, Record<string, number>>)
            : {},
          filters: saveFilters.value ? filtersToSave : {},
          sort: saveFilters.value ? props.sortArray : [],
          itemsPerPage: props.itemsPerPage,
          whoFavourited: saveAsFavourite.value ? [upvise.upviseUser] : [],
        };

        if (isLastUsed) {
          const lastUsedProperties = {
            name: "_last_use",
            isGlobal: false,
            columnLayout: columnsToSaveCopy as Record<
              string,
              Record<string, number>
            >,
            filters: filtersToSave,
            sort: props.sortArray,
            whoFavourited: [],
          };

          favouriteToSave = { ...favouriteToSave, ...lastUsedProperties };
        }

        const {
          owner,
          isGlobal: isglobal,
          name,
          ...favouriteValue
        } = favouriteToSave;

        const newFaveId =
          name === "_last_use" && lastUsedFavourite.value?.recordid
            ? lastUsedFavourite.value.recordid
            : availableFavouriteRecords.value.find((r) => r.name === name)
                ?.id ?? null;

        const favouriteRecord: IFavouriteRecord =
          favouriteController.getNewFavourite(
            JSON.stringify(favouriteValue),
            props.moduleName,
            upvise.upviseUser,
            name,
            isglobal,
            newFaveId
          );

        if (!favouriteRecord.name.startsWith("_")) overlay.value = true;

        return await favouriteController
          .updateFavourite(favouriteRecord)
          .then(() => {
            if (!favouriteToSave.name.startsWith("_")) {
              overlay.value = false;
              newFavouriteScreen.value = false;
            }
          });
      }
    }

    async function deleteFavourite(favourite: IFavourite) {
      if (window.confirm("Delete the favourite " + favourite.name + "?")) {
        const existingFavouriteRecord = getExistingFavouriteRecord(favourite);

        if (existingFavouriteRecord) {
          const favouriteRecord = {
            ...existingFavouriteRecord,
            _type: "DELETE",
          };

          overlay.value = true;

          await favouriteController
            .updateFavourite(favouriteRecord)
            .then(() => {
              overlay.value = false;
            })
            .catch(() => {
              overlay.value = false;
            });
        }
      }
    }

    async function toggleFavourite(favourite: IFavourite, pinned: boolean) {
      const existingFavouriteRecord = getExistingFavouriteRecord(favourite);
      if (existingFavouriteRecord) {
        let favouriteOption = JSON.parse(existingFavouriteRecord.favourite);

        favouriteOption.whoFavourited = favouriteOption.whoFavourited.filter(
          (f: string) => f !== upvise.upviseUser
        );

        if (pinned) {
          favouriteOption.whoFavourited.push(upvise.upviseUser);
        }

        const favouriteRecord = {
          ...existingFavouriteRecord,
          favourite: JSON.stringify(favouriteOption),
        };

        overlay.value = true;

        await favouriteController
          .updateFavourite(favouriteRecord)
          .then(() => {
            overlay.value = false;
          })
          .catch(() => {
            overlay.value = false;
          });
      }
    }

    function showNewFavouriteScreen() {
      isGlobal.value = false;
      saveLayout.value = false;
      newFavouriteName.value = "";
      saveAsFavourite.value = false;
      saveFilters.value = false;
      newFavouriteScreen.value = true;
      statusText.value = "";
    }

    function hideNewFavouriteScreen() {
      newFavouriteScreen.value = false;
    }

    function closeFavouriteScreen() {
      emit("closeFavouriteManager");
    }

    watch(
      () => [
        props.filtersArray,
        props.itemsPerPage,
        props.sortArray,
        props.columnLayout,
      ],
      () => {
        if (!isSavingLastUsed.value) {
          isSavingLastUsed.value = true;
          saveLastUsed.value = false;
          saveLastUse();
        } else saveLastUsed.value = true;
      }
    );

    watchEffect(() => {
      if (saveFilters.value) saveLayout.value = true;
    });

    watchEffect(() => {
      upviseDataMessage.value = props.upviseDataMessage;
    });

    watchEffect(() => {
      if (
        props.enabled &&
        loadLastUsedFavourite.value &&
        lastUsedFavourite.value &&
        Object.keys(upviseDataMessage.value?.definition?.Grouping).length > 0
      ) {
        loadFavourite(
          JSON.parse(JSON.stringify(lastUsedFavourite.value)) as IFavourite
        );
        loadLastUsedFavourite.value = false;
        console.log("loaded last used favourite", lastUsedFavourite.value);
      }
    });

    return {
      upvise,
      favouritedFavourites,
      notFavouritedFavourites,
      newFavouriteName,
      availableFavourites,
      isGlobal,
      saveFilters,
      saveLayout,
      saveAsFavourite,
      statusText,
      favourites,
      lastUsedFavourite,
      searchString,
      newFavouriteScreen,
      loadLastUsedFavourite,
      overlay,
      saveLastUse,
      closeFavouriteScreen,
      saveFavourite,
      loadFavourite,
      deleteFavourite,
      toggleFavourite,
      showNewFavouriteScreen,
      hideNewFavouriteScreen,

      // eslint-disable-next-line vue/no-dupe-keys
      upviseDataMessage,
    };
  },
});

export default FavouriteManager;
</script>

<template>
  <div>
    <sidebar
      class="favourites-manager-screen"
      :visible="showScreen"
      position="right"
    >
      <overlay v-if="overlay" />
      <div class="p-grid sidebar-grid">
        <div class="p-col-7 header-name">Favourites</div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div
            v-if="newFavouriteScreen"
            class="option"
            @click="hideNewFavouriteScreen"
          >
            <font-awesome-icon
              class="times-icon"
              :icon="['fa', 'arrow-left']"
            />
          </div>
          <div
            v-if="!newFavouriteScreen"
            class="option"
            @click="showNewFavouriteScreen"
          >
            <font-awesome-icon
              class="plus-circle-icon"
              :icon="['fa', 'plus-circle']"
            />
          </div>
          <div class="option" @click="closeFavouriteScreen">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>
      <div v-if="newFavouriteScreen">
        <div class="p-grid">
          <div class="p-col-12 input-label">Name</div>
          <div class="p-col-12">
            <InputText
              class="input-textarea"
              v-model="newFavouriteName"
            ></InputText>
          </div>
          <div class="p-col-12 header-text">Type</div>
          <div class="p-col-1">
            <RadioButton v-model="isGlobal" :value="true"></RadioButton>
          </div>
          <div class="p-col-5 input-label">Global</div>
          <div class="p-col-1">
            <RadioButton v-model="isGlobal" :value="false"></RadioButton>
          </div>
          <div class="p-col-5 input-label">Mine</div>
          <div class="p-col-12 header-text">Content</div>
          <div class="p-col-1">
            <Checkbox v-model="saveFilters" :binary="true"></Checkbox>
          </div>
          <div class="p-col-5 input-label">Current Filter</div>
          <div class="p-col-1">
            <Checkbox
              v-model="saveLayout"
              :binary="true"
              :disabled="saveFilters"
            ></Checkbox>
          </div>
          <div class="p-col-5 input-label">Current Layout</div>
          <div class="p-col-12 header-text">Pinned Favourites</div>
          <div class="p-col-3">
            <Checkbox v-model="saveAsFavourite" :binary="true"></Checkbox>
          </div>
          <div class="p-col-9 input-label">Add To Pinned Favourites</div>
          <Button style="margin-top: 16px" @click="saveFavourite()"
            >SAVE</Button
          >
          <div style="margin-top: 13px">{{ statusText }}</div>
        </div>
      </div>
      <div v-if="!newFavouriteScreen">
        <div class="my-favourites">
          <!--        <button @click="loadFavourite(testFavourite)">TEST FAVOURITE</button>-->
          <!--        <button @click="closeFavouriteScreen">CLOSE</button>-->

          <div class="my-favourites-header">
            <span class="my-favourites-label">Pinned Favourites</span>
          </div>

          <div class="my-favourites-list">
            <favourite-entry
              v-for="entry of favouritedFavourites"
              :favouriteInformation="entry"
              :account-email="upvise.upviseUser"
              :is-admin="upvise.upviseUserIsAdmin"
              :is-favourite="true"
              @applyFavourite="loadFavourite"
              @deleteFavourite="deleteFavourite"
              @toggleFavourite="toggleFavourite"
              :key="entry.name"
            />
          </div>
        </div>

        <div class="available-favourites">
          <span class="available-favourites-label">Available Favourites</span>

          <div class="available-favourites-search">
            <InputText
              class="available-favourites-search-input"
              type="text"
              placeholder="Search"
              v-model="searchString"
            />
            <font-awesome-icon class="search-icon" :icon="['fa', 'search']" />
          </div>

          <div class="available-favourites-list">
            <favourite-entry
              v-for="entry of notFavouritedFavourites"
              :favouriteInformation="entry"
              :account-email="upvise.upviseUser"
              :is-admin="upvise.upviseUserIsAdmin"
              :is-favourite="false"
              @applyFavourite="loadFavourite"
              @deleteFavourite="deleteFavourite"
              @toggleFavourite="toggleFavourite"
              :key="entry.name"
            ></favourite-entry>
          </div>
        </div>
      </div>
    </sidebar>
    <sidebar position="top"></sidebar>
  </div>
</template>

<style lang="scss" scoped>
.header-text {
  font-weight: 600;
  font-family: Poppins, serif;
  color: #333333;
}
.favourites-manager-screen {
  background-color: $white;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100px;
  right: 100px;
  height: 100%;
  width: 400px;
  padding: 24px;
  z-index: 10;
  box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%),
    0 9px 28px 8px rgb(0 0 0 / 5%);

  .my-favourites {
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;
    border-bottom: 1px solid $grey;
    height: 50%;

    .my-favourites-header {
      display: flex;
      margin-top: 12px;
      .my-favourites-label {
        margin-right: 12px;
      }

      .add-favourite {
        margin-left: 12px;

        .plus-circle-icon {
          color: $blue;
          margin-right: 4px;
        }
      }
    }

    .my-favourites-list {
      display: flex;
      flex-direction: column;
      margin: 12px 12px 0 12px;
      overflow-y: auto;

      .my-favourites-item {
        display: flex;
        align-items: center;
        margin-top: 12px;
        margin-right: 12px;

        .my-favourites-text {
          overflow: hidden;
          margin-left: 12px;
        }

        .trash-icon {
          margin-left: auto;
        }
      }
    }
  }

  .available-favourites {
    display: flex;
    flex-direction: column;
    height: 50%;
    padding-top: 24px;

    .available-favourites-search {
      display: flex;
      align-items: center;
      margin-top: 12px;
      margin-left: 12px;

      .available-favourites-search-input {
        font-family: Poppins, serif;
        font-style: normal;
        font-weight: normal;
        font-size: 10px;
        color: $grey3;
        height: 24px;
        width: 100%;
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

    .available-favourites-list {
      display: flex;
      flex-direction: column;
      margin: 12px 12px 0 12px;
      overflow-y: auto;

      .available-favourites-item {
        display: flex;
        align-items: center;
        margin-top: 12px;
        margin-right: 12px;

        .available-favourites-text {
          overflow: hidden;
          margin-left: 12px;
        }

        .lock-icon {
          margin-left: auto;
        }
      }
    }
  }
}
</style>
