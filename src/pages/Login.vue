<template>
  <div class="mainContainer">
    <div
      class="loginContainer"
      v-if="!chooseTenant && !isLoading && !forgotPassword"
    >
      <div class="logoSection">
        <img src="../../public/img/icons/prestartr.svg" alt="PrestartrLogo" />
      </div>
      <div class="loginTextSection">
        <span>Login</span>
      </div>
      <form class="detailsSection" v-on:submit.prevent="login()">
        <input
          v-model="username"
          class="inputs"
          type="text"
          placeholder="Name"
        />
        <input
          v-model="password"
          class="inputs"
          type="password"
          placeholder="Password"
        />
        <div class="fpContainer">
          <span @click="triggerForgotPassword()">Forgot Password</span>
        </div>
        <button class="loginButton">LOGIN</button>
      </form>
    </div>
    <div
      class="loginContainer"
      v-else-if="chooseTenant && !isLoading && !forgotPassword"
    >
      <div class="logoSection">
        <img src="../../public/img/icons/prestartr.svg" alt="PrestartrLogo" />
      </div>
      <div class="loginTextSection">
        <span>Select Tenant</span>
      </div>
      <div class="detailsSection">
        <Dropdown
          class="inputs"
          v-model="selectedTenant"
          editable
          :options="tenantOptions"
          optionLabel="name"
          placeholder="Select a Tenant"
        />
        <button @click="loginTenant()" class="loginButton">
          Login to Tenant
        </button>
      </div>
    </div>
    <div
      class="loginContainer"
      v-else-if="
        !chooseTenant && !isLoading && forgotPassword && !sentForgetPassword
      "
    >
      <div class="logoSection"></div>
      <div class="loginTextSection">
        <span>Forgot Password</span>
      </div>
      <div class="forgetSection">
        <span> We will send you an email to reset your password.</span>
        <input
          v-model="username"
          class="inputs"
          type="text"
          placeholder="Email"
        />
        <div class="buttonSection">
          <button @click="resetPassword()" class="loginButton">
            RESET PASSWORD
          </button>
          <button @click="triggerForgotPassword()" class="backButton">
            BACK TO LOGIN
          </button>
        </div>
      </div>
    </div>
    <div
      class="loginContainer"
      v-else-if="
        !chooseTenant && !isLoading && forgotPassword && sentForgetPassword
      "
    >
      <div class="logoSection">
        <img src="../../public/img/icons/email.png" alt="PrestartrLogo" />
      </div>
      <div class="loginTextSection">
        <span>Check Your Email</span>
      </div>
      <div class="forgetSection">
        <span>
          We sent a password reset link to<br />
          {{ username }}</span
        >
        <button @click="navigateToLogin()" class="loginBackButton">
          Back to Login
        </button>
        <div class="fpContainer">
          <span
            >Didn't receive the email?
            <span class="resendText" @click="resetPassword()"
              >Click To Resend</span
            >
          </span>
        </div>
      </div>
    </div>

    <div class="loginContainer" v-else>
      <ProgressSpinner></ProgressSpinner>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import userController from "../controllers/userController";
import ProgressSpinner from "primevue/progressspinner";
import { toastHelper } from "../../cloudconLibrary/utilities/useToastHelper";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";
import {
  IUser,
  IUserTenantData,
} from "cloudconLibrary/store/modules/userData/userDataModule";
import router from "../router/router";
import moduleManagementAccess from "../../cloudconLibrary/store/modules/moduleManagementData/moduleManagementAccess";
// import router from "../router";
/* eslint-disable */
export default defineComponent({
  name: "Login",
  components: {
    Dropdown,
    ProgressSpinner,
  },
  setup() {
    const isLoading = ref<boolean>(false);
    const chooseTenant = ref<boolean>(false);
    const forgotPassword = ref<boolean>(false);
    const sentForgetPassword = ref<boolean>(false);
    const username = ref<string>("");
    const password = ref<string>("");
    const tenantOptions = ref<IUserTenantData[]>([]);
    const selectedTenant = ref<IUserTenantData | null>(null);
    const toast = useToast();
    const controllers = userController();
    // const toast = useToast();
    // const controllers = userController();

    function resetLogin() {
      username.value = "";
      password.value = "";
    }

    function triggerForgotPassword() {
      forgotPassword.value = !forgotPassword.value;
    }

    function triggerSentForgetPassword() {
      sentForgetPassword.value = !sentForgetPassword.value;
    }
    const login = () => {
      isLoading.value = true;
      controllers
        .customEmbeddedLogin(username.value, password.value)
        .then((response) => {
          if (response) {
            console.log("Success!");
            resetLogin();
            console.log("response", response);
            const userDetails: IUser = response.user as IUser;
            if (userDetails.tenants.length > 1) {
              isLoading.value = false;
              chooseTenant.value = true;
              tenantOptions.value = userDetails.tenants;
            } else {
              moduleManagementAccess.setSelectedTenant(
                userDetails.tenants[0].id
              );
              controllers.setTenantIdCookie(userDetails.tenants[0].id);
              router.push("/");
            }
          }
        })
        .catch((err) => {
          toast.add(toastHelper.errorMessage(err.main, err.message));
          isLoading.value = false;
          //resetLogin();
        });
    };

    const resetPassword = () => {
      isLoading.value = true;
      controllers
        .resetPassword(username.value)
        .then((response) => {
          if (response) {
            //resetLogin();
            isLoading.value = false;
            sentForgetPassword.value = true;
          }
        })
        .catch((err) => {
          toast.add(toastHelper.errorMessage(err.main, err.message));
          isLoading.value = false;
          //resetLogin();
        });
    };

    const loginTenant = () => {
      isLoading.value = true;
      if (selectedTenant.value == null) {
        toast.add(
          toastHelper.errorMessage(
            "Tenant Selection Error",
            "Please Select a Tenant before clicking on the button"
          )
        );
        isLoading.value = false;
        return;
      }
      moduleManagementAccess.setSelectedTenant(selectedTenant.value.id);
      controllers.setTenantIdCookie(selectedTenant.value.id);
      router.push("/");
    };

    const navigateToLogin = () => {
      resetLogin();
      sentForgetPassword.value = false;
      forgotPassword.value = false;
    };
    return {
      isLoading,
      forgotPassword,
      username,
      password,
      login,
      loginTenant,
      resetPassword,
      triggerForgotPassword,
      triggerSentForgetPassword,
      navigateToLogin,
      chooseTenant,
      tenantOptions,
      selectedTenant,
      sentForgetPassword,
    };
  },
});
</script>

<style lang="scss" scoped>
.mainContainer {
  font-family: "Poppins";
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("../../public/img/backgrounds/login.svg") no-repeat center
    center fixed;
  background-size: cover;
  width: 100%;

  .logoSection {
    margin-top: 3.5rem;
  }
  .loginContainer {
    min-height: 15rem;
    width: 30rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: #ffffff;
    box-shadow: 20px 20px 40px rgba(0, 0, 0, 0.06);
    border-radius: 15px;
    gap: 2rem;
    .loginTextSection {
      font-style: normal;
      font-weight: 600;
      font-size: 32px;
      line-height: 120%;
      color: #22455b;
    }
    .detailsSection {
      display: flex;
      flex-direction: column;
      width: 60%;
      margin-bottom: 3.5rem;
      .inputs {
        height: 2.5rem;
        font-family: "Poppins" !important;
        border: 1px solid #cccccc;
        border-radius: 8px;
        text-indent: 8px;

        &:last-of-type {
          margin-top: 1rem;
        }
      }

      .fpContainer {
        display: flex;
        justify-content: flex-end;
        color: #f18900;
        span {
          font-size: 12px;
          cursor: pointer;
        }
        margin-bottom: 1rem;
      }
      .loginButton {
        cursor: pointer;
        height: 2.5rem;
        background: #f18900;
        border: 1px solid #cccccc;
        border-radius: 8px;
        font-family: "Poppins";
        font-style: normal;
        font-weight: 700;
        font-size: 10px;
        line-height: 10px;
        text-align: center;
        text-transform: uppercase;

        /* White */

        color: #ffffff;
      }
    }

    .forgetSection {
      display: flex;
      flex-direction: column;
      width: 70%;
      gap: 1rem;
      margin-bottom: 3.5rem;
      color: #22455b;
      span {
        font-size: 12px;
        text-align: center;
      }
      .inputs {
        height: 2.5rem;
        font-family: "Poppins" !important;
        border: 1px solid #cccccc;
        border-radius: 8px;
        text-indent: 8px;

        &:last-of-type {
          margin: 1rem 0;
        }
      }
      .loginBackButton {
        margin-top: 1rem;
        cursor: pointer;
        height: 2.5rem;
        background: #f18900;
        border: 1px solid #cccccc;
        border-radius: 8px;
        font-family: "Poppins";
        font-style: normal;
        font-weight: 700;
        font-size: 10px;
        line-height: 10px;
        text-align: center;
        text-transform: uppercase;

        /* White */

        color: #ffffff;
      }
      .fpContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        span {
          font-size: 12px;
          cursor: pointer;
          .resendText {
            color: #f18900;
            cursor: pointer;
          }
        }
        margin-bottom: 1rem;
      }
      .buttonSection {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        .loginButton {
          flex: 1;
          cursor: pointer;
          height: 2.5rem;
          background: #f18900;
          border: 1px solid #cccccc;
          border-radius: 8px;
          font-family: "Poppins";
          font-style: normal;
          font-weight: 700;
          font-size: 10px;
          line-height: 10px;
          text-align: center;
          text-transform: uppercase;

          /* White */

          color: #ffffff;
        }
        .backButton {
          flex: 1;
          cursor: pointer;
          height: 2.5rem;
          color: #f18900;
          background: #ffffff;
          border: 1px solid #f18900;
          border-radius: 8px;
          font-family: "Poppins";
          font-style: normal;
          font-weight: 700;
          font-size: 10px;
          line-height: 10px;
          text-align: center;
          text-transform: uppercase;
        }
      }
    }
  }
}
</style>
