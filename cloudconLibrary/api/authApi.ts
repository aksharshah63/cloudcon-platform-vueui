import useCookies from "../utilities/useCookies";
import axios, {
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
  AxiosRequestHeaders,
} from "axios";
import { cookieKeys } from "../utilities/useConstants";
import {
  IAuthApi,
  IAuthLoginData,
  IAuthRequestLoginData,
  IAuthRequestRefreshData,
  IAuthForgetPasswordData,
  IAuthUserData,
} from "./apiInterfaces";

const authApiUrl = "https://dev-test-admin-portal.au.auth0.com";
// const webApiUrl = "https://localhost:5001";

export class AuthApi implements IAuthApi {
  fetchUserInfo(): Promise<IAuthUserData> {
    return new Promise((resolve, reject) => {
      callEndpoint(
        "userinfo",
        {
          method: "get",
        },
        [],
        true
      )
        .then((response) => {
          const responseData = response.data as IAuthUserData;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  }

  loginAuth(username: string, password: string): Promise<IAuthLoginData> {
    const body: IAuthRequestLoginData = {
      client_id: process.env.VUE_APP_AUTH0_CONFIG_CLIENTID,
      grant_type: "password",
      scope: process.env.VUE_APP_AUTH0_CONFIG_SCOPE,
      username: username,
      password: password,
    };
    return new Promise((resolve, reject) => {
      callEndpoint(
        "oauth",
        {
          method: "post",
          data: body,
        },
        ["token"]
      )
        .then((response) => {
          const responseData = response.data as IAuthLoginData;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error?.data);
        });
    });
  }

  refreshSession(): Promise<IAuthLoginData> {
    const body: IAuthRequestRefreshData = {
      client_id: process.env.VUE_APP_AUTH0_CONFIG_CLIENTID,
      client_secret: process.env.VUE_APP_AUTH0_CONFIG_CLIENTSECRET,
      grant_type: "refresh_token",
      refresh_token: useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN) ?? "",
    };
    return new Promise((resolve, reject) => {
      callEndpoint(
        "oauth",
        {
          method: "post",
          data: body,
        },
        ["token"]
      )
        .then((response) => {
          const responseData = response.data as IAuthLoginData;
          return resolve(responseData);
        })
        .catch((error) => {
          //console.error(error);
          return reject(error);
        });
    });
  }

  forgetPassword(username: string):Promise<string>{
    const body: IAuthForgetPasswordData = {
      client_id: process.env.VUE_APP_AUTH0_CONFIG_CLIENTID,
      email: username,
      connection: "Username-Password-Authentication"

    };
    return new Promise((resolve, reject) => {
      callEndpoint(
        "dbconnections",
        {
          method: "post",
          data: body,
        },
        ["change_password"]
      )
        .then((response) => {
          const responseData = response.data as string;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error?.data);
        });
    });

  }
}

function callEndpoint(
  module: string,
  config?: AxiosRequestConfig,
  additionalPaths?: string[],
  useToken = false
): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const header: AxiosRequestHeaders = {};
    if (useToken) header.Authorization = `Bearer ${token}`;

    return axios({
      ...config,
      url: getUrl(module, additionalPaths),
      headers: header,
    })
      .then((response) => {
        console.log("response", response);
        resolve(response);
      })
      .catch((error: AxiosError) => {
        console.error(error);
        reject(error.response);
      });
  });
}

function getUrl(module: string, additionalPaths?: string[]): string {
  const additionalPathsString =
    additionalPaths != null ? additionalPaths.map((p) => "/" + p).join("") : "";
  return `${authApiUrl}/${module}${additionalPathsString}`;
}
