import { useEffect } from "react";
import Table from "./Table";
import { useGlobalContext } from "../GlobalContext";
// import { useLocation } from "react-router-dom";
import { m } from "framer-motion";
// import { fromURL } from "../../url/DataState";

// function strToArr(str: string, count: number) {
//     return Array.from({ length: count }, (_, i) => {
//         return str.replace(/(\\)?(\$i)/g, function (matcher,p1,p2) {
//             if (p1 === '\\') return p2;
//             if (p2 === '$i') return i + 1;
//             return matcher
//         })
//     });
// }


export function Component() {
    const ctx = useGlobalContext();
    // const { hash } = useLocation();
    // const parsed = useMemo(() => {
    //     if (!hash || hash.length === 0 || !hash.startsWith("#!")) return undefined
    //     return fromURL(hash.substring(2))
    // }, [hash])
    useEffect(() => {
        ctx.setTitle("Picker")
        // const arr:((() => void) | undefined)[] = []
        // arr.push(ctx.fullWidth(true));
        // if('obsstudio' in window){
        //     arr.push(ctx.hideHeader(true));
        // }
        // return ctx.fullWidth(true)
    })
    // const [data, setData] = useState<number[]>([]);
    // const headers = useMemo(() => {
    //     return parsed !== undefined ? strToArr(parsed.header ?? "", parsed?.size[0] ?? 0) : []
    // }, [parsed])
    // if (parsed?.type !== "poll") return null
    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
        <Table
            // columns={parsed?.size[0] ?? 0}
            // rows={parsed?.size[1] ?? 0}
            // headers={headers}
            // list={parsed?.list ?? []}
        />
        </m.div>
    )
}