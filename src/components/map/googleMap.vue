<script lang="ts">
/* eslint-disable no-undef, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires */
import { defineComponent, onMounted, ref, watch } from "vue";
import MarkerClusterer from "@googlemaps/markerclustererplus";
import {
  stateSymbol, //useState
} from "../../store/index";

// import {
//   Loader,
//   //LoaderOptions
// } from "google-maps";

import { Loader } from "@googlemaps/js-api-loader";
// import { google } from "google-maps";
import useControllerGoogleMap from "../../use/controller/map/googleMap";
export const GoogleMap = /*#__PURE__*/ defineComponent({
  name: "GoogleMap",
  inject: [stateSymbol.description!],
  props: {
    googleApiKey: {
      type: String,
      required: true,
    },
    mapData: {
      type: Array,
      required: true,
    },
  },

  setup(props: Record<string, any>, { emit }) {
    const center = ref({ lat: -33.780391, lng: 151.191076 });
    const keyRef = ref(0);
    const mapDiv = ref();
    const loader = new Loader({ apiKey: props.googleApiKey });
    const dataArray = ref<Record<string, any>[]>([]);
    const markers = ref<google.maps.Marker[]>([]);
    const markerCluster = ref<MarkerClusterer>();
    const google = ref();
    const map = ref<google.maps.Map>();
    const prevMapData = ref("");
    const currentlyMarking = ref(false);
    const inQueue = ref(false);
    //const deletedArray = ref([]);
    //const markers = ref<[]>([]);
    onMounted(async () => {
      google.value = await loader.load();
      map.value = new google.value.maps.Map(mapDiv.value, {
        center: center.value,
        zoom: 9,
      });
      if (map.value != undefined) {
        markerCluster.value = new MarkerClusterer(map.value, [], {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });
      }
    });

    function enableDateRange(bool: boolean) {
      emit("enableDate", bool);
    }

    async function showMarkers() {
      await new Promise((resolve) => {
        enableDateRange(false);
        prevMapData.value = JSON.stringify(props.mapData);
        //markerCluster.value?.clearMarkers();
        for (let i of markers.value) {
          i.setVisible(false);
          i.setPosition(null);
          i.setMap(null);
        }
        markers.value = [];
        if (markers.value.length == 0) resolve(markers.value);
      })
        .then(async () => {
          map.value?.setZoom(map.value?.getZoom() as number);
          return (dataArray.value =
            await useControllerGoogleMap().jobToGoogleMapData(props.mapData));
        })
        .then(async () => {
          if (props.mapData.length > 0) {
            const coord = await useControllerGoogleMap().getCentre(
              props.mapData
            );
            if (coord.lat != 0 && coord.lng != 0) {
              return map.value?.setCenter({ lat: coord.lat, lng: coord.lng });
            }
          }
        })
        .then(async () => {
          markers.value = dataArray.value.map((record) => {
            const contentString =
              useControllerGoogleMap().writeJobContentString(record);
            const infowindow = new google.value.maps.InfoWindow({
              content: contentString,
            });

            const marker = new google.value.maps.Marker({
              label: record.label,
              position: record.location,
              map: map.value,
              icon: {
                path: google.value.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#0066cc",
                fillOpacity: 0.9,
                strokeWeight: 0.4,
              },
            });
            marker.addListener("click", () => {
              map.value?.panTo(marker.position);
              map.value?.setZoom(12);
              infowindow.open(map.value, marker);
            });
            return marker;
          });
        })
        .then(() => {
          currentlyMarking.value = false;
          if (inQueue.value) {
            enableDateRange(false);
            currentlyMarking.value = true;
            inQueue.value = false;
            showMarkers();
          } else enableDateRange(true);
        });
    }

    watch(
      () => props.mapData,
      async () => {
        if (
          JSON.stringify(props.mapData) != JSON.stringify(prevMapData.value)
        ) {
          if (!currentlyMarking.value) {
            currentlyMarking.value = true;
            inQueue.value = false;
            await showMarkers();
          } else {
            inQueue.value = true;
          }
        }
      }
    );

    return {
      center,
      mapDiv,
      keyRef,
    };
  },
});

export default GoogleMap;
</script>
<template>
  <div ref="mapDiv" id="map" style="width: 100%; height: 40vh"></div>
</template>

<style lang="scss" scoped>

</style>
