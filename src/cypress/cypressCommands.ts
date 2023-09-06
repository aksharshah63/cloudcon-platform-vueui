import { importIcons } from "../../src/fontAwesomeIcons/fontAwesomeIcons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Tooltip from "primevue/tooltip";
import { mount } from 'cypress/vue';
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import { store } from "../../src/store/store";
import router from "../../src/router/router";

export function cypressMount() {
  importIcons();

  Cypress.Commands.add('mount', (component, options = {}) => {
    // Setup options object
    options.global = options.global || {};
  
    // Register global components
    options.global.components = { FontAwesomeIcon };

    // Register global directives
    options.global.directives = { Tooltip };

    // Install plugins
    options.global.plugins = [
      PrimeVue,
      ToastService,
      ConfirmationService,
      store,
      router
    ];
  
    return mount(component, options);
  })
}