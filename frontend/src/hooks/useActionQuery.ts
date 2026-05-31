import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useWriteAccess } from "@/context/SubscriptionContext";

/** Opens a panel/modal when the URL contains `?action=<name>` (then clears the param). */
export function useActionQuery(actionName: string, onOpen: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const canWrite = useWriteAccess();

  useEffect(() => {
    if (searchParams.get("action") === actionName) {
      if (canWrite) {
        onOpen();
      }
      setSearchParams({}, { replace: true });
    }
  }, [actionName, canWrite, onOpen, searchParams, setSearchParams]);
}
