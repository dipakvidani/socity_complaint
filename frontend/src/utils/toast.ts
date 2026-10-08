import { default as hotToast, ToastOptions } from "react-hot-toast";

/**
 * Deduplicated toast helper wrapper around react-hot-toast.
 * Automatically assigns `id: message` to prevent duplicate toast popups.
 */
export const toast = Object.assign(
  (message: any, options?: ToastOptions) => {
    const id = options?.id || (typeof message === "string" ? message : undefined);
    return hotToast(message, { id, ...options });
  },
  hotToast,
  {
    success: (message: any, options?: ToastOptions) => {
      const id = options?.id || (typeof message === "string" ? message : undefined);
      return hotToast.success(message, { id, ...options });
    },
    error: (message: any, options?: ToastOptions) => {
      const id = options?.id || (typeof message === "string" ? message : undefined);
      return hotToast.error(message, { id, ...options });
    },
    dismiss: (toastId?: string) => hotToast.dismiss(toastId),
  }
);

export default toast;
