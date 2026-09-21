import { useMemo } from "react";

export function useFormDirty<T>(initialValues: T, currentValues: T): boolean {
  return useMemo(() => {
    return JSON.stringify(initialValues) !== JSON.stringify(currentValues);
  }, [initialValues, currentValues]);
}
