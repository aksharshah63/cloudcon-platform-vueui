// //import { createLogger } from "vuex";
// import { USER_DETAIL, LOGGED_IN } from "./auth0Mutations";
// import { Store } from "vuex";

// const localStoragePlugin = (store: Store<any>) => {
//   console.log("this is the store", store)
//   store.subscribe((_mutation, { userIsAuthorized, user }) => {
//     console.log("saving to local forage")
//     window.localStorage.setItem(USER_DETAIL, JSON.stringify(user));
//     window.localStorage.setItem(LOGGED_IN, JSON.stringify(userIsAuthorized));
//   });
// };

// export default [localStoragePlugin]
