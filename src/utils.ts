import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function interpolate(t:string, c:any) {
    return t.replace(/\${([^}]+)}/g, (m, p:string) => p.split('.').reduce((a, f) => a ? a[f] : undefined, c) ?? m); 
}

export function usePrevious<T>(value:T) {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
}
