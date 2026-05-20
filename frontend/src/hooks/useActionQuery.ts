import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/** Opens a panel/modal when the URL contains `?action=<name>` (then clears the param). */
export function useActionQuery(actionName: string, onOpen: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === actionName) {
      onOpen();
      setSearchParams({}, { replace: true });
    }
  }, [actionName, onOpen, searchParams, setSearchParams]);
}
