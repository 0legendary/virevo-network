import { useState } from "react";

// ✅ Generic Type for Dynamic State
type GlobalState<T = Record<string, any>> = T;

export const useGlobalState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState<GlobalState<T>>(initialState);

  // ✅ Update a specific key
  const updateState = <K extends keyof T>(key: K, value: Partial<T[K]>) => {
    setState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...value },
    }));
  };

  // ✅ Remove a key from state
  const removeKey = <K extends keyof T>(key: K) => {
    setState((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  return { state, updateState, removeKey };
};


// ✅ Update a single key
// updateState("uiState", { isLoading: true });

// ✅ Add a new key dynamically
// updateState("newFeature", { isEnabled: true });

// ✅ Remove a key
// removeKey("newFeature");