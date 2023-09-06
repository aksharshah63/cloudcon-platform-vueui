import { getCookie, setCookie, removeCookie } from "typescript-cookie";

export default {
  set(name: string, value: string | number | boolean | undefined | null): void {
    setCookie(name, value, {
      expires: 1,
    });
  },

  get(name: string): string | undefined {
    return getCookie(name);
  },

  remove(name: string): void {
    return removeCookie(name);
  },
};
