import { useEffect, useMemo, useState } from "react";
import Hero from "../../components/Hero"
import { useGlobalContext } from "../GlobalContext";
import items from "../home.json"
import { useLocation, useNavigate } from "react-router-dom";
import { css } from '@emotion/css'
import Shuffle from "../../components/Shuffle";
import Delete from "../../components/Delete";
import TrendingDown from "../../components/TrendingDown";
// import { encodeString } from "../../url/encode";
// import { decodeString } from "../../url/decode";
// import Chooser from "./Chooser.tsx.old";
import { m } from "framer-motion";
import { shuffle } from "./shuffle";
import { fromURL, toURL } from "../../url/DataState";

// Reflect.set(window, "encodeString", encodeString)
// Reflect.set(window, "decodeString", decodeString)

// let oldHash = location.hash

export function Component() {
    const ctx = useGlobalContext();
    const [rows, setRows] = useState(1)
    const [columns, setColumns] = useState(1)
    const [names, setNames] = useState<string>("")
    const { hash } = useLocation();
    const [ lastHash, setHash ] = useState("")
    const navigate = useNavigate();
    const [header, setHeader] = useState("Ligue $i")
    // const data = useMemo(() => {
    //     return Array.from({ length: rows * columns }, () => -1);
    // }, [rows, columns])
    const newHash = useMemo(() => `#!${toURL({
        version: 1,
        type: 0,
        size: [columns, rows],
        list: names.split("\n"),
        // data: data,
        header: header,
        // type: "poll",
        // leagues: columns,
        // places: rows,
        // header,
        // list: names.split("\n")
    })}`, [columns, rows, names, header])
    useEffect(() => {
        ctx.setTitle("Ligue Picker");
    })
    useEffect(() => {
        if (newHash === hash) {
            setHash(newHash)
            return
        }
        if (lastHash !== hash && hash.startsWith("#!")) {
            console.log("hash changed")
            // if(hash.startsWith("#!")) {
                try {
                    const data = fromURL(hash.substring(2))
                    setHeader(data.header ?? "")
                    setNames(data.list.join("\n"))
                    setColumns(data.size[0])
                    setRows(data.size[1])
                } catch (error) {
                    console.log(error)
                }
                // if(data?.type == "poll") {
                //     setColumns(data.leagues)
                //     setRows(data.places)
                //     setNames(data.list.join("\n"))
                // }
            // }
            setHash(hash)
        } else {
            console.log("input changed")
            setHash(newHash)
            navigate(newHash, {
                replace: true
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash, newHash])
    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <Hero 
                background={""}
                title={items[3].title}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div className="input-grid">
                    <label htmlFor="leagues-number">Leagues:</label>
                    <input className="input" min={1} value={columns} onChange={(e) => {
                        const n = parseInt(e.target.value)
                        if(n > 0) {
                            setColumns(n)
                        }
                    }} id="leagues-number" type="number" placeholder="0" />
                    <label htmlFor="places-number">Places:</label>
                    <input className="input" min={1} value={rows} onChange={(e) => {
                        const n = parseInt(e.target.value)
                        if(n > 0) {
                            setRows(n)
                        }
                    }} id="places-number" type="number" placeholder="0" />
                    <label htmlFor="headers">Headers</label>
                    <input className="input" value={header} onChange={(e) => setHeader(e.target.value)} id="headers" type="text" />
                </div>
            <div
                className={css`
                    display: flex;
                    width: 100%;
                `}
            >
                <textarea value={names} onChange={(e) => setNames(e.target.value)} className="input" style={{width: "100%"}} name="" id="" cols={30} rows={10}></textarea>
                <div
                    className={css`
                        display: flex;
                        flex-direction: column;
                    `}
                >
                    <button title="Delete" onClick={() => setNames("")}><Delete /></button>
                    <button title="Shuffle" onClick={()=> {
                        setNames((names) => shuffle(names.split("\n")).join("\n"))
                    }}><Shuffle /></button>
                    <button title="Sort" onClick={() => {
                        setNames((names) => names.split("\n").sort().join("\n"))
                    }}><TrendingDown /></button>
                </div>
            </div>
            <button className="button contained" onClick={() => {
                navigate(`./edit${newHash}`)
            }}>Start</button>
            </Hero>
            {/* <div style={{
                overflow: "auto",
            }}>
                <table className="dataTable">
                    <thead>
                        <tr style={{
                            
                        }}>
                        {Array(rows).fill(0).map((_, i) => (
                                <th>League {i + 1}</th>
                        ))}
                        </tr>  
                    </thead>
                    <tbody>
                        {Array(lines).fill(0).map(() => (
                            <tr>
                                {Array(rows).fill(0).map(() => (
                                    <td>{" "}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}
        </m.div>
    )
}

// export function Component() {
//     // const [urlsearch] = useSearchParams();
//     const { hash } = useLocation();
//     const selected = hash.startsWith("#!P")
//     return (
//     selected
//     ? <Chooser />
//     : <Start />
//     )
// }

export default Component
