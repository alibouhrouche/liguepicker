import { useEffect, useMemo } from "react";
import { useGlobalContext } from "../GlobalContext"
import HeaderCell from "./HeaderCell";
import { decodeString } from "../../url/decode";
import { useLocation } from "react-router-dom";
import { DataCell } from "./Cell";

function parseHash(hash: string) {
    if (!hash || hash.length === 0 || !hash.startsWith("#!")) return {
        headers: [],
        data: []
    }
    const decoded = decodeString(hash.substring(2));
    const arr = decoded.split("\n").map((x) => x.split("\t"));
    return {
        headers: arr.shift() ?? [],
        data: arr
    }
}

type Props = {
    columns: number,
    rows: number,
    headers: string[],
    list: string[][],
}

function Table({ columns, headers, list}:Props) {
    return <div
            style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                textAlign: 'center',
                border: '1px solid var(--text1)',
            }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <HeaderCell key={i}>
                        {headers[i] ?? (i + 1)}
                    </HeaderCell>
                ))}
                {list.flatMap((r, y) => (
                    r.map((v, x) => (
                        <DataCell key={y * columns + x} value={v} />
                    ))
                ))}
            </div>
}

export function Component() {
    const ctx = useGlobalContext();
    const { hash } = useLocation();
    const parsed = useMemo(() => parseHash(hash), [hash])
    const columns = parsed.headers.length;
    const rows = parsed.data.length;
    useEffect(() => {
        ctx.setTitle("Result")
        // const arr:((() => void) | undefined)[] = []
        // arr.push(ctx.fullWidth(true));
        // if('obsstudio' in window){
        //     return ctx.hideHeader(true);
        // }
        // return () => {
        //     arr.forEach((f) => f && f())
        // }
    })
    // const squares = [];
    return (
        <>
            {hash.length > 0 ? 
                <Table
                    columns={columns}
                    rows={rows}
                    headers={parsed.headers}
                    list={parsed.data}
                />
            : null}
        </>
    )
    // for (let i = 0; i < columns * rows; i++) {
    //     squares.push(renderCell(i, list, data));
    // }
    // return (
    //     <>
    //     <div
    //         style={{
    //             width: '100%',
    //             height: '100%',
    //             display: 'grid',
    //             gridTemplateColumns: `repeat(${columns}, 1fr)`,
    //             textAlign: 'center',
    //             border: '1px solid var(--text1)',
    //         }}
    //     >
    //             {Array.from({ length: columns }).map((_, i) => (
    //                 <HeaderCell key={i}>
    //                     {/* {headers[i] ?? (i + 1)} */}
    //                 </HeaderCell>
    //             ))}
    //             {squares}
    //     </div>
    //     </>
    // )
}
