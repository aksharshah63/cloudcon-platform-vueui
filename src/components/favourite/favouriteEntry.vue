<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import _ from "lodash";
import { IFavourite } from "../../store/modules/upvise.d";

export const FavouriteEntry = /*#__PURE__*/ defineComponent({
  name: "FavouriteEntry",
  props: {
    favouriteInformation: {
      type: Object as () => IFavourite,
      required: true,
    },
    accountEmail: {
      type: String,
      required: true,
    },
    isFavourite: {
      type: Boolean,
      required: false,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      require: false,
      default: false,
    },
  },
  setup(props, { emit }) {
    const favourite = ref(props.favouriteInformation);
    const favouriteName = ref(props.favouriteInformation.name);
    const currentAccountEmail = ref(props.accountEmail);
    const isFavourited = ref(props.isFavourite);

    const isFilterPersistent = computed(
      () => !_.isEmpty(favourite.value.filters)
    );

    function applyFilter() {
      emit("applyFavourite", favourite.value);
    }
    function deleteFavourite() {
      emit("deleteFavourite", favourite.value);
    }
    function addToFavourites() {
      emit("toggleFavourite", favourite.value, true);
    }
    function removeFromFavourite() {
      emit("toggleFavourite", favourite.value, false);
    }
    return {
      favourite,
      favouriteName,
      currentAccountEmail,
      isFavourited,
      applyFilter,
      deleteFavourite,
      addToFavourites,
      removeFromFavourite,
      isFilterPersistent,
    };
  },
});
export default FavouriteEntry;
</script>

<template>
  <div class="available-favourites-item">
    <!-- Need to loop over all favourite items -->
    <font-awesome-icon
      v-if="isFavourited"
      class="icon-class heart-icon favourite-heart"
      :icon="['fa', 'heart']"
      @click="removeFromFavourite"
    />
    <font-awesome-icon
      v-else
      class="icon-class heart-icon"
      :icon="['fa', 'heart']"
      @click="addToFavourites"
    />
    <span class="available-favourites-text" @click="applyFilter">{{
      favouriteName
    }}</span>
    <font-awesome-icon
      :style="{ visibility: favourite.isGlobal ? 'visible' : 'hidden' }"
      class="globe-icon"
      :icon="['fa', 'globe']"
    />
    <font-awesome-icon
      :style="{ visibility: isFilterPersistent ? 'visible' : 'hidden' }"
      class="filter-icon"
      :icon="['fa', 'filter']"
    />
    <font-awesome-icon
      v-if="!isAdmin && currentAccountEmail !== favourite.owner"
      class="lock-icon"
      :icon="['fa', 'lock']"
    />
    <font-awesome-icon
      v-else
      class="icon-class delete-icon"
      :icon="['fa', 'trash']"
      @click="deleteFavourite"
    />
  </div>
</template>

<style scoped lang="scss">
.available-favourites-item {
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-right: 12px;

  &:hover {
    color: #007fff;
  }
  .favourite-heart {
    color: #f1524c;
  }
  .icon-class {
    border-radius: 4px;
    &:hover {
      background: #c8c8c8;
    }
  }
  .available-favourites-text {
    cursor: pointer;
    overflow: hidden;
    margin-left: 12px;
    width: 100%;
    margin-right: 6px;
  }

  .heart-icon {
    cursor: pointer;
  }

  .lock-icon {
    margin-left: auto;
  }

  .delete-icon {
    cursor: pointer;
    margin-left: auto;
    color: #000000;
  }

  .globe-icon {
    margin-left: auto;
    margin-right: 5px;
  }

  .filter-icon {
    margin-left: auto;
    margin-right: 5px;
  }
}
</style>
