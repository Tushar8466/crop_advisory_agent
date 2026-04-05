import { toast } from "sonner"

export function useToast() {
  return {
    toastSuccess: (msg: string) =>
      toast.success("Success", {
        description: msg,
      }),
    toastError: (msg: string) =>
      toast.error("Error", {
        description: msg,
      }),
    toastInfo: (msg: string) =>
      toast("Info", {
        description: msg,
      }),
  }
}
