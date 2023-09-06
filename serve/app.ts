/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApp } from "vue";
import { store } from "../src/store";
// import { store as auth0Store } from "../src/store/modules/auth0";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import router from "../src/router/router";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { importIcons } from "../src/fontAwesomeIcons/fontAwesomeIcons";

importIcons();

const app = createApp(App);
app.use(store);
app.config.globalProperties.$store = store;
app.use(PrimeVue);
app.use(ToastService);
app.use(ConfirmationService);
app.use(router);
app.directive("tooltip", Tooltip);
app.directive("click-outside", {
  beforeMount: (el, binding) => {
    el.clickOutsideEvent = (event: PointerEvent) => {
      // here I check that click was outside the el and his children
      if (
        !(
          el == event.target ||
          el.contains(event.target) ||
          event.composedPath().includes(el)
        )
      ) {
        // and if it did, call method provided in attribute value
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted: (el) => {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
});
app.component("FontAwesomeIcon", FontAwesomeIcon);

// @ts-ignore
String.prototype.format = function (...args: string[]): string {
  return this.replace(/{(\d+)}/g, (match, number) =>
    typeof args[number] !== "undefined" ? args[number] : match
  );
};

export default app;
