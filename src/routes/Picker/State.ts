import { Data } from "../../url/DataState";

export type State = {
    data: number[];
    list: string[];
    rand: string[];
    index: number;
    lastIndex: number;
    rolling: boolean;
};
type Action = {
    type: "shuffle";
} | {
    type: "rolling_stopped";
} | {
    type: "add";
    i: number;
    v: number;
} | {
    type: "swap";
    a: number;
    b: number;
} | {
    type: "set";
    i: number;
    v: number;
} | {
    type: "remove";
    i: number;
} | {
    type: "from_url";
    v: Data;
};
export default function tableReducer(state: State, action: Action) {
    switch (action.type) {
        case "shuffle":
            {
                let remIndexes = Array.from({ length: state.list.length }, (_, i) => i);
                remIndexes = remIndexes.filter((i) => !state.data.includes(i))
                    .sort(() => Math.random() - 0.5);
                const l = remIndexes.map((i) => state.list[i]);
                return {
                    ...state,
                    rand: l,
                    index: remIndexes[0],
                    rolling: true
                };
            }
        case "rolling_stopped":
            {
                return {
                    ...state,
                    rolling: false
                };
            }
        case "add":
            {
                const d = [...state.data]
                d[action.i] = action.v
                const lastIndex = (state.index >= 0) ? state.index : state.lastIndex
                let remIndexes = Array.from({ length: state.list.length }, (_, i) => i);
                remIndexes = remIndexes.filter((i) => !d.includes(i))
                if (remIndexes.length === 0) {
                    return {
                        ...state,
                        data: d,
                        index: -1,
                        lastIndex,
                        rand: [],
                    }
                }
                return {
                    ...state,
                    data: d,
                    index: -1,
                    lastIndex,
                }
            }
        case "swap":
            {
                const d = [...state.data];
                const tmp = d[action.a];
                d[action.a] = d[action.b];
                d[action.b] = tmp;
                return {
                    ...state,
                    data: d
                };
            }
        case "set":
            {
                const d = [...state.data]
                d[action.i] = action.v
                return {
                    ...state,
                    data: d
                }
            }
        case "remove":
            {
                const d = [...state.data]
                const tmp = d[action.i];
                d[action.i] = NaN
                const lastIndex = (state.index >= 0) ? state.index : state.lastIndex
                if(tmp === undefined || Number.isNaN(tmp) || tmp < 0) {
                    return {
                        ...state,
                        data: d,
                    }
                }
                let remIndexes = Array.from({ length: state.list.length }, (_, i) => i);
                remIndexes = remIndexes.filter((i) => !d.includes(i))
                            .sort(() => Math.random() - 0.5);
                const l = remIndexes.map((i) => state.list[i]);
                if(state.rand.length === 0) {
                    return {
                        ...state,
                        data: d,
                        index: tmp === lastIndex ? tmp : -1,
                        rand: l,
                    }
                }
                if(state.index < 0 && lastIndex === tmp) {
                    return {
                        ...state,
                        data: d,
                        index: tmp,
                        rand: l
                    }
                }
                return {
                    ...state,
                    data: d
                }
            }
        case "from_url":
            {
                const ret = action.v
                return {
                    ...state,
                    data: ret.data,
                    list: ret.list,
                    rand: [],
                }
            }
    }
}
