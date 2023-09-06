// import { IUserObject } from "../store/userObject";
import userDataAccess from "../../cloudconLibrary/store/modules/userData/userDataAccess";
import { cookieKeys } from "../../cloudconLibrary/utilities/useConstants";
import useCookies from "../../cloudconLibrary/utilities/useCookies";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";

import { IRole } from "cloudconLibrary/store/modules/userData/userDataModule";

interface IRoleIdByNameMap {
  [key: string]: number | null;
}

export default function userController() {
  const usersApi = new UsersApi();

  const resetCookies = () => {
    useCookies.remove(cookieKeys.AUTH0_ACCESS_TOKEN);
    useCookies.remove(cookieKeys.AUTH0_REFRESH_TOKEN);
    useCookies.remove(cookieKeys.TENANT_ID);
  };

  const setTenantIdCookie = (id: number) => {
    useCookies.set(cookieKeys.TENANT_ID, id);
  };
  const customEmbeddedLogin = (
    username: string,
    password: string
  ): Promise<void | IUserDetails> => {
    return new Promise<void | IUserDetails>((resolve, reject) => {
      userDataAccess
        .customLogin(username, password)
        .then(async (value) => {
          if (value && value.access_token && value.refresh_token) {
            useCookies.set(cookieKeys.AUTH0_ACCESS_TOKEN, value.access_token);
            useCookies.set(cookieKeys.AUTH0_REFRESH_TOKEN, value.refresh_token);
            useCookies.set(cookieKeys.EMAIL_ADDRESS, username.toLowerCase());
            const expiresAt = Date.now() + value.expires_in * 1000;
            // const id = userInfo?.sub.split("|")[1] as string;
            usersApi
              .loginWithEmail(username) // TODO need to pass tenantId - currently hardcoded to 1
              .then((response) => {
                const userDetails: IUserDetails = {
                  user_id: response.data?.id ?? -1,
                  access_token: value.access_token,
                  refresh_token: value.refresh_token ?? "",
                  id_token: value.id_token,
                  expires_at: expiresAt,
                  user: response.data ?? undefined,
                };
                userDataAccess.setUserAsLoggedIn(userDetails);
                return resolve(userDetails);
              })
              .catch(() => {
                resetCookies();
                return reject({
                  main: "Error: Server Issue",
                  message: "Could not communicate with the backend",
                });
              });
          } else {
            resetCookies();
            return reject({
              main: "Error: User Issue",
              message: "Could not find the user details",
            });
          }
        })
        .catch((e) => {
          resetCookies();
          return reject({
            main: "Error: Access Denied",
            message: e.error_description,
          });
        });
    });
  };

  const resetPassword = (username: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      userDataAccess
        .forgetPassword(username)
        .then(async () => {
          return resolve(true);
        })
        .catch(() => {
          return reject(false);
        });
    });
  };

  const silentLogin = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      userDataAccess
        .refreshTokens()
        .then(async (value) => {
          if (value && value.access_token && value.refresh_token) {
            useCookies.set(cookieKeys.AUTH0_ACCESS_TOKEN, value.access_token);
            useCookies.set(cookieKeys.AUTH0_REFRESH_TOKEN, value.refresh_token);
            const expiresAt = Date.now() + value.expires_in * 1000;
            const emailAddress = useCookies.get(cookieKeys.EMAIL_ADDRESS);
            if (emailAddress) {
              usersApi
                .loginWithEmail(emailAddress) // TODO need to pass tenantId - currently hardcoded to 1
                .then((response) => {
                  const userDetails: IUserDetails = {
                    user_id: response.data?.id ?? -1,
                    access_token: value.access_token,
                    refresh_token: value.refresh_token ?? "",
                    id_token: value.id_token,
                    expires_at: expiresAt,
                    user: response.data ?? undefined,
                  };
                  userDataAccess.setUserAsLoggedIn(userDetails);
                  return resolve();
                })
                .catch(() => {
                  return reject({
                    main: "Error: Server Issue",
                    message: "Could not communicate with the backend",
                  });
                });
            } else {
              return reject({
                main: "Error: User Issue",
                message: "Could not find the user details",
              });
            }
          }
        })
        .catch((e) => {
          return reject({
            main: "Error: Access Denied",
            message: e.error_description,
          });
        });
    });
  };

  function getRoleIdByNameMap(rolesData: IRole[]): IRoleIdByNameMap {
    const map: IRoleIdByNameMap = {};

    rolesData.forEach((role) => {
      // Skip if role has no name
      if (role.name == "") return;

      const formattedName = role.name.trim().toLowerCase();

      // If name already exists in map, set id as null
      if (formattedName in map) map[formattedName] = null;
      // Add role to map
      else map[formattedName] = role.id;
    });

    return map;
  }

  return {
    resetPassword,
    setTenantIdCookie,
    getRoleIdByNameMap,
    customEmbeddedLogin,
    silentLogin,
  };
}
