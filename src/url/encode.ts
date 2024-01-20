import { deflateRaw } from "pako"
import { bytesToBase64, webSafe64 } from "./base64";

// async function bytesToBase64DataUrl(bytes: Uint8Array, type = "application/octet-stream") {
//     const str = await new Promise<string>((resolve, reject) => {
//       const reader = Object.assign(new FileReader(), {
//         onload: () => resolve(reader.result as string),
//         onerror: () => reject(reader.error),
//       });
//       reader.readAsDataURL(new File([bytes], "", { type }));
//     });
//     return str.split(",")[1];
// }

export function encodeString(str: string) {
    return webSafe64(bytesToBase64(deflateRaw(str)))
}
