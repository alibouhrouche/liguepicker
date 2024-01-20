// import { decodeString } from "../../url/decode";
// import { encodeString } from "../../url/encode";

// export type poll_data = {
//     type: "poll",
//     leagues: number,
//     places: number,
//     header: string,
//     list: string[],
// } | {
//     type: "result",
//     leagues: number,
//     places: number,
//     curr: number,
//     header: string,
//     list: string[],
//     data: number[],
// }

// function toArr(names: string) {
//     return names.split(",").map((x) => parseInt(x, 36));
// }

// function fromArr(arr: number[]) {
//     return arr.map((x) => isNaN(x) ? "" : x.toString(36)).join(",")
// }

// export function fromURL(data: string): poll_data | undefined {
//     const decoded = decodeString(data);
//     const arr = decoded.split("\n");
//     const head = arr.shift()?.split(",") ?? [];
//     if(head[0] == "Pv1") {
//         const header = arr.shift() ?? "";
//         return {
//             type: "poll",
//             leagues: parseInt(head[1]),
//             places: parseInt(head[2]),
//             header,
//             list: arr
//         }
//     } else if(head[0] == "Rv1") {
//         return {
//             type: "result",
//             leagues: parseInt(head[1]),
//             places: parseInt(head[2]),
//             curr: parseInt(head[3]),
//             header
//             data: toArr(arr.pop() ?? ""),
//             list: arr,
//         }
//     }
// }

// export function toURL(data: poll_data):string|undefined {
//     if (data.type == "poll") {
//         return encodeString(`Pv1,${data.leagues},${data.places}\n${data.header}\n${data.list.join("\n")}`);
//     } else if (data.type == "result") {
//         return encodeString(`Rv1,${data.leagues},${data.places},${data.curr}\n${data.header}\n${data.list.join("\n")}\n${fromArr(data.data)}`);
//     }
// }
