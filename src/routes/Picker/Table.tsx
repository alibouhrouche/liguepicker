import { useEffect, useMemo, useReducer, useState } from "react";
import HeaderCell from "./HeaderCell";
import { AppContext } from "./Context";
import { DndProvider } from 'react-dnd'
import { MultiBackend } from 'react-dnd-multi-backend'
import { HTML5toTouch } from 'rdndmb-html5-to-touch'
import TableCell from "./TableCell";
import Shuffle from "../../components/Shuffle";
import { m } from "framer-motion";
import { encodeString } from "../../url/encode";
import ShareIcon from "../../components/ShareIcon";
import tableReducer, { State } from "./State";
import RollingDrop from "./RollingDrop";
import { useGlobalContext } from "../GlobalContext";
import { Portal } from "../../components/Portal";
import CopyIcon from "../../components/CopyIcon";
import CheckCircle from "../../components/CheckCircle";
import Slash from "../../components/Slach";
import { RemCells } from "./Cell";
import DropCell from "./DropCell";
import { useLocation, useNavigate } from "react-router-dom";
import { fromURL, toURL } from "../../url/DataState";

// type Props = {
//     columns: number,
//     rows: number,
//     headers: string[],
//     list: string[],
// }

function renderCell(i: number, list: string[], data: number[]) {
    const state = data[i] === undefined || Number.isNaN(data[i]) || data[i] < 0;
    return (
        <TableCell key={i} id={i} state={state ? "empty" : "filled"} value={state ? "" : list[data[i]]} list={list} data={data} />
    )
}

type toArrayParams = {
    columns: number,
    rows: number,
    headers: string[],
    list: string[],
    data: number[],
}

const escapeHtml = (unsafe:string) => {
    return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function toArray({ columns, rows, headers, list, data }: toArrayParams) {
    const h = Array.from({ length: columns }, (_, i) => headers[i] ?? (i + 1));
    const d = Array.from({ length: rows }, (_, i) => {
        return Array.from({ length: columns }, (_, j) => {
            const x = data[i * columns + j];
            return x === undefined || Number.isNaN(x) || x < 0 ? "" : list[x];
        });
    });
    return [h, ...d];
}

const headerStyle = "background-color: #006a7c;color: #ffffff;height: 5rem;padding: 20px 10px;border: 1px solid #000;"
const cellStyle = "height: 5rem;padding: 0.5rem;border: 1px solid #000;font-weight: 700;text-align: center;"
const tableStyle = `border-collapse: collapse;font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;`

function toHtml({ columns, rows, headers, list, data }: toArrayParams) {
    const [h, ...d] = toArray({ columns, rows, headers, list, data });
    const top = `<thead><tr>${h.map((x) => `<th style="${headerStyle}">${escapeHtml(x)}</th>`).join("")}</tr></thead>`;
    const body = `<tbody>${d.map((x) => {
        return `<tr>${x.map((y) => `<td style="${cellStyle}">${escapeHtml(y)}</td>`).join("")}</tr>`
    }).join("")}</tbody>`;
    return `<table style='${tableStyle}'>${top}${body}</table>`
}

function strToArr(str: string, count: number) {
    if (str === "") Array.from({ length: count }, (_, i) => i+1)
    return Array.from({ length: count }, (_, i) => {
        return str.replace(/(\\)?(\$i)/g, function (matcher,p1,p2) {
            if (p1 === '\\') return p2;
            if (p2 === '$i') return i + 1;
            return matcher
        })
    });
}

export default function Table() {
    const ctx = useGlobalContext();
    const { hash } = useLocation();
    // const parsed = useMemo(() => {
    //     if (!hash || hash.length === 0 || !hash.startsWith("#!")) return undefined
    //     return fromURL(hash.substring(2))
    // }, [hash])
    // const headers = useMemo(() => {
    //     return parsed !== undefined ? strToArr(parsed.header ?? "", parsed?.size[0] ?? 0) : []
    // }, [parsed])
    const [rows, setRows] = useState(1)
    const [columns, setColumns] = useState(1)
    const [header, setHeader] = useState<string>("")
    const headers = useMemo(() => {
        return strToArr(header ?? "", columns)
    }, [header, columns])
    // const [list, setList] = useState<string[]>([])
    // const columns = parsed?.size[0] ?? 0;
    // const rows = parsed?.size[1] ?? 0;
    // const list = useMemo(() => {
    //     return parsed?.list ?? [];
    // }, [parsed])
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<boolean | undefined>(undefined);
    const [currText, setCurrText] = useState("");
    const [ lastHash, setLastHash ] = useState("")
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(tableReducer, {
        list: [],
        data: [],
        rand: [],
        index: -1,
        rolling: false,
        lastIndex: -1
    }, function (init: State) {
        // let remIndexes = Array.from({ length: list.length }, (_, i) => i);
        // remIndexes = remIndexes.sort(() => Math.random() - 0.5)
        // let l = remIndexes.map((i) => list[i]);
        // l = l.sort(() => Math.random() - 0.5);
        return {
            ...init,
            rand: [],
            data: Array.from({ length: columns * rows }, () => -1),
            index: -1
        }
    });
    const newHash = useMemo(() => `#!${toURL({
        version: 1,
        type: 0,
        size: [columns, rows],
        list: state.list,
        data: state.data,
        header,
    })}`, [columns, rows, state.list, state.data, header])
    useEffect(() => {
        if (newHash === hash) {
            setLastHash(newHash)
            return
        }
        if (lastHash !== hash && hash.startsWith("#!")) {
            console.log("hash changed")
            const data = fromURL(hash.substring(2))
            dispatch({
                type: "from_url",
                v: data
            })
            setHeader(data.header ?? "")
            setColumns(data.size[0])
            setRows(data.size[1])
            // (data.list.join("\n"))
            // if(data?.type == "poll") {
            //     setColumns(data.leagues)
            //     setRows(data.places)
            //     setNames(data.list.join("\n"))
            // }
            setLastHash(hash)
        } else {
            console.log("input changed")
            setLastHash(newHash)
            navigate(newHash, {
                replace: true
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, newHash])
    const list = state.list
    const squares = [];
    for (let i = 0; i < columns * rows; i++) {
        squares.push(renderCell(i, list, state.data));
    }
    const remaining = useMemo(() => {
        let remIndexes = Array.from({ length: list.length }, (_, i) => i);
        remIndexes = remIndexes.filter((i) => !state.data.includes(i) && (i !== state.index))
        return remIndexes
    }, [state, list])
    const encoded = useMemo(() => {
        const h = Array.from({ length: columns }, (_, i) => headers[i] ?? (i + 1));
        const d = Array.from({ length: rows }, (_, i) => {
            return Array.from({ length: columns }, (_, j) => {
                const x = state.data[i * columns + j];
                return x === undefined || Number.isNaN(x) || x < 0 ? "" : list[x];
            }).join("\t");
        });
        return h.join("\t") + "\n" + d.join("\n");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.data, headers])
    // useEffect(() => {
    //     function copy(e:ClipboardEvent){
    //         console.log(e)
    //     }
    //     window.addEventListener("copy", copy)
    //     return () => {
    //         window.removeEventListener("copy", copy)
    //     }
    // }, [])
    return <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <AppContext.Provider
            value={{
                list,
                currText,
                setCurrText,
                add(i, v, index) {
                    if(index === -2){
                        dispatch({
                            type: "set",
                            i,
                            v,
                        })
                    } else {
                        dispatch({
                            type: "add",
                            i,
                            v,
                        })
                    }
                },
                swap(a, b) {
                    dispatch({
                        type: "swap",
                        a,
                        b
                    })
                },
                del(i) {
                    dispatch({
                        type: "remove",
                        i
                    })
                },
                rolling: state.rolling,
                isEmpty(i) {
                    return state.data[i] === undefined || Number.isNaN(state.data[i]) || state.data[i] < 0;
                },
                disabled: state.index < 0 || state.rolling || loading,
                index: state.index,
            }}
        ><>
                <div>
                    {
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: ".5rem",
                                width: `${1 / columns * 100}%`,
                                margin: ".5rem auto",
                            }}>
                            <RollingDrop
                                id={state.index}
                                disabled={state.index < 0}
                                list={state.rand}
                                rolling={state.rolling}
                                onFinish={() => dispatch({ type: "rolling_stopped" })}
                                loading={loading}
                                setLoading={setLoading} />
                            <m.button className="contained" style={{
                                display: "flex",
                                gap: "1rem",
                                justifyContent: "center",
                                opacity: state.rolling || remaining.length === 0 ? .5 : 1
                            }}
                                disabled={state.rolling || remaining.length === 0}
                                onClick={() => dispatch({ type: "shuffle" })}>Pick Another Name <Shuffle size={16} /></m.button>
                        </div>
                    }
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        textAlign: 'center',
                        border: '1px solid var(--text1)',
                    }}
                >
                    {Array.from({ length: columns }).map((_, i) => (
                        <HeaderCell key={i}>
                            {headers[i] ?? (i + 1)}
                        </HeaderCell>
                    ))}
                    {squares}
                </div>
                <DropCell>
                <div 
                    style={{
                        display: "flex",
                        overflowY: "hidden",
                        overflowX: "scroll",
                        gap: ".5rem",
                        marginTop: "1rem",
                        width: "100%",
                        pointerEvents: state.rolling ? "none" : "unset",
                        opacity: state.rolling ? 0 : 1
                    }}>
                    {remaining.map((i) => <RemCells
                        key={i}
                        style={{
                            flexBasis: `${1 / columns * 100}%`,
                            flexGrow: 0,
                            flexShrink: 0,
                        }}
                    index={i} value={list[i]} />)}
                </div>
                </DropCell>
                <Portal node={ctx.extra.current}>
                    <div
                        style={{
                            display: "flex",
                            gap: ".5rem",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <m.div
                            title="Copy Table To Clipboard"
                            style={{
                                cursor: "pointer",
                                color: copied == true ? "var(--green1)" : copied == false ? "var(--red1)" : "unset",
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => {
                                const html = toHtml({
                                    columns,
                                    rows,
                                    headers,
                                    list,
                                    data: state.data
                                })
                                const htmlBlob = new Blob([html], { type: "text/html" });
                                if (navigator.clipboard) {
                                    const clip = new ClipboardItem({
                                        ["text/html"]: htmlBlob,
                                        ["text/plain"]: new Blob([encoded], { type: "text/plain" }),
                                    })
                                    navigator.clipboard
                                    .write([clip])
                                    .then(() => {
                                        setCopied(true)
                                    }).catch((e) => {
                                        console.error(e)
                                        setCopied(false)
                                    })
                                    setTimeout(() => {
                                        setCopied(undefined)
                                    }, 3000)
                                } else {
                                    window.open(URL.createObjectURL(htmlBlob), '_blank', 'noopener,noreferrer')
                                }
                            }}
                        >
                            {
                                copied === true ?
                                    <CheckCircle />
                                    : copied === false ?
                                        <Slash color="red" />
                                        : <CopyIcon />
                            }
                        </m.div>
                        <m.div 
                            title="Share Result URL"
                            style={{
                                cursor: "pointer",
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => {
                                const url = `${location.protocol}//${location.host}/result#!${encodeString(encoded)}`
                                navigator.share({
                                    title: "Results",
                                    text: "Draw results",
                                    url
                                }).catch(() => {
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(url).then(() => {
                                            alert("Copied to clipboard");
                                        }).catch(() => {
                                            prompt("Copy this link to share result", url)
                                        })
                                    } else {
                                        prompt("Copy this link to share result", url)
                                    }
                                })
                            }}
                        >
                            <ShareIcon />
                        </m.div>
                    </div>
                </Portal>
            </>
        </AppContext.Provider>
    </DndProvider>;
}
