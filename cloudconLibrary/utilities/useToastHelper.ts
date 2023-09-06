import { ToastSeverity } from "./useConstants";

export const toastHelper = {
  successMessage(summary: string, detail: string, life = 4000): IToastMessage {
    return {
      severity: ToastSeverity.SUCCESS,
      summary: summary,
      detail: detail,
      life: life,
    };
  },

  warningMessage(summary: string, detail: string, life = 4000): IToastMessage {
    return {
      severity: ToastSeverity.WARNING,
      summary: summary,
      detail: detail,
      life: life,
    };
  },

  errorMessage(summary: string, detail: string, life = 4000): IToastMessage {
    return {
      severity: ToastSeverity.ERROR,
      summary: summary,
      detail: detail,
      life: life,
    };
  },
};

export interface IToastMessage {
  severity?: ToastSeverity;
  summary?: string;
  detail?: string;
  life?: number;
  closable?: boolean;
  group?: string;
}
