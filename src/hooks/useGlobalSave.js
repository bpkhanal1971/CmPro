import { useEffect, useRef } from "react";
import { saveJson } from "../utils/storage";

/**
 * Registers a listener for the global "conpro:save" event and
 * persists the latest value to localStorage.
 */
export function useGlobalSave(storageKey, value) {
  const ref = useRef(value);
  ref.current = value;

  useEffect(() => {
    function onSave() {
      saveJson(storageKey, ref.current);
    }

    window.addEventListener("conpro:save", onSave);
    return () => window.removeEventListener("conpro:save", onSave);
  }, [storageKey]);
}

