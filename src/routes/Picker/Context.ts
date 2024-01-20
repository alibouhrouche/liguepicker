import { createContext, useContext } from "react";

type AppContextType = {
    list: string[];
    swap: (a: number, b: number) => void;
    add: (i: number, v: number, id?: number) => void;
    del: (i: number) => void;
    isEmpty: (i: number) => boolean;
    currText: string;
    setCurrText: React.Dispatch<React.SetStateAction<string>>;
    rolling: boolean;
    index: number;
    disabled: boolean;
}

export const AppContext = createContext<AppContextType | null>({
    list: [],
    swap: () => { },
    add: () => {},
    del: () => {},
    isEmpty: () => true,
    currText: "",
    setCurrText: () => {},
    rolling: false,
    index: NaN,
    disabled: false,
});

export const useAppContext = () => useContext(AppContext);
