import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { resolveActionRoute } from "@/lib/actionRoutes";

export function useAppAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const runAction = useCallback(
    (label: string, customHandler?: () => void) => {
      if (customHandler) {
        customHandler();
        return;
      }

      const route = resolveActionRoute(label, location.pathname);
      if (route) {
        navigate(route);
        return;
      }

      toast.info(label, "This action is not mapped to a screen yet.");
    },
    [location.pathname, navigate, toast],
  );

  return { runAction, navigate };
}
