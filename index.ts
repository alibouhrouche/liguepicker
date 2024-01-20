import { fromURL } from "./src/url/DataState";
import {inflateRaw} from "pako"

function base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function normal64(base64) {
    return base64.replace(/-/g, '+').replace(/_/g, '/') + '=='.substring(0, (3 * base64.length) % 4);
}

export function decodeString(str) {
    return inflateRaw(base64ToBytes(normal64(str)), { to: "string" });
}

const old_d = "bc9RCoMwDAbg950iB_Bl4AW6UkcHlbHUA2QuTLFUqLI7eQ4vto2BtqNvf75AfnJ9HYuyKA-qFtI2CLIRZhuU0XuuBRgKgQZuu0jlGU7r4nsw7MilC0kT3R35llKveEohdxgFPBgs-SeHjSv1qeNfW1z3deR5pnknvCgE0XuQ3dgOf47k1iWyW5RttkKjFCr3UqPtGw"
console.log(base64ToBytes(normal64(old_d)).length)
const d = "VY9BDoIwEEU14RAuZ-FFalMIhrKw5QAjNtC0QVNA3blz7TU4BxeTxFja3cyb-f_nv4o8e283SdIWuhkV7PXHspJQWQmgFeHmvzCej34uCXB0Do2q2-duxTSDwzx1GriyaB_RgWKPZ4tdjbeIp6q_R8A7B1gQuCiQ2DXKeduULXHql7bEuZALNQw4rK_iyAQQ3QFtr7XpYy7QzpNZ2SnQyTBi7ZoLSljQyaurXH4B"
console.log(base64ToBytes(normal64(d)).length)
// console.log(Array.from(inflateRaw(base64ToBytes(normal64("VY9BDoIwEEU14RAuZ-FFalMIhrKw5QAjNtC0QVNA3blz7TU4BxeTxFja3cyb-f_nv4o8e283SdIWuhkV7PXHspJQWQmgFeHmvzCej34uCXB0Do2q2-duxTSDwzx1GriyaB_RgWKPZ4tdjbeIp6q_R8A7B1gQuCiQ2DXKeduULXHql7bEuZALNQw4rK_iyAQQ3QFtr7XpYy7QzpNZ2SnQyTBi7ZoLSljQyaurXH4B")))).map(x => x.toString(16).padStart(2, '0')).join(" "))