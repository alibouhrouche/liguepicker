import { inflateRaw } from "pako";
import { base64ToBytes, normal64 } from "./base64";

// async function dataUrlToBytes(dataUrl: string) {
//     const res = await fetch(`data:application/octet-stream;base64,${dataUrl}`);
//     return new Uint8Array(await res.arrayBuffer());
// }

export function decodeString(str: string) {
    return inflateRaw(base64ToBytes(normal64(str)), { to: "string" });
}
