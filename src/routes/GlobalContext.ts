import { createContext, useContext } from "react";

const emptyFN = () => { };

type GlobalContextType = {
  setTitle: (title: string) => void;
  fullWidth: (fullWidth: boolean) => ((() => void) | undefined);
  hideHeader: (hide: boolean) => ((() => void) | undefined);
  extra: React.MutableRefObject<HTMLDivElement | null>;
};
const defaultContext: GlobalContextType = {
  setTitle: () => { },
  fullWidth: () => emptyFN,
  hideHeader: () => emptyFN,
  extra: { current: null },
};

export const GlobalContext = createContext(defaultContext);

export const useGlobalContext = () => useContext(GlobalContext);
