import { useCallback } from "react";
import { Toast } from "@/components/ui/toast";

export const useToast = () => {
  const toast = useCallback((props: { title: string; description?: string; variant?: "default" | "destructive" }) => {
    console.log("Toast:", props); // Replace with real toast logic later
  }, []);
  return { toast };
};
