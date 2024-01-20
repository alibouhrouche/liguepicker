import { deflateRaw, inflateRaw } from "pako"
import DataBuffer from "./DataBuffer"
import { base64ToBytes, bytesToBase64, normal64, webSafe64 } from "./base64"


// enum Keys {
//     Version = 0,
//     Type = 1
//     Size = 1,
//     List = 2,
//     Data = 3,
//     Header = 4,
//     Extra = 5
// }

enum MTypes {
    PositiveInt = 0,
    NegativeInt = 1,
    String = 2,
    UTF8 = 3,
    Array = 4,
    Map = 5,
    Semantic = 6,
    Special = 7
}

export type Data = {
    version: number,
    type: number,
    size: [number, number],
    list: string[],
    data: number[],
    header: string,
}

export type InputData = {
    version: number,
    type: number,
    size: [number, number],
    list: string[],
    data?: number[],
    header: string,
}


const MAGIC = [0x7f, 0x4C, 0x49, 0x47]
const POS = 0x00
const NEG = 0x20
const STR = 0x60
const ARR = 0x80
const MAP = 0xA0

function mergeBuffers(buff: Uint8Array[]) {
    let offset = 0;
    const r = new Uint8Array(buff.reduce((a, b) => a + b.length, 0));
    if (buff.length === 0) return r;
    for (let i = 0; i < buff.length; i++) {
        r.set(buff[i], offset);
        offset += buff[i].length
    }
    return r;
}

function numberToBytes(number: number) {
    let len = 0;
    if (number < 0xff) len = 1;
    else if (number < 0xffff) len = 2;
    else if (number < 0xffffffff) len = 4;
    else len = 8;
    const byteArray = new Uint8Array(len);
    for (let index = len - 1; index >= 0; index--) {
        const byte = number & 0xff;
        byteArray[index] = byte;
        number = (number - byte) / 256;
    }
    return byteArray;
}

function encodeNumber(n: number) {
    let v = n;
    if (n < 0) v = -n - 1;
    if (v < 24) {
        return new Uint8Array([(n < 0 ? NEG : POS) + v]);
    } else {
        const byteArray = numberToBytes(v);
        const c = 23 + byteArray.length;
        return new Uint8Array([(n < 0 ? NEG : POS) + c, ...byteArray]);
    }
}

function encodeString(s: string) {
    const enc = new TextEncoder();
    const buff = enc.encode(s);
    const len = buff.length;
    if (len < 24) {
        return new Uint8Array([STR + len, ...buff]);
    } else {
        const byteArray = numberToBytes(len);
        const c = 23 + byteArray.length;
        return new Uint8Array([STR + c, ...byteArray, ...buff]);
    }
}

// function encodeArrayHeader(len: number) {
//     if (len < 24) {
//         return new Uint8Array([ARR + len]);
//     } else {
//         const byteArray = numberToBytes(len);
//         const c = 23 + byteArray.length;
//         return new Uint8Array([ARR + c, ...byteArray]);
//     }
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encodeMap(a: Map<any, any>) {
    const ret: Uint8Array[] = [];
    for (const [k, v] of Object.entries(a)) {
        ret.push(encodeItem(k), encodeItem(v));
        encodeItem(k);
        encodeItem(v);
    }
    const len = (ret.length / 2)
    if (len < 24) {
        ret.unshift(new Uint8Array([MAP + len]));
    } else {
        const h = numberToBytes(len);
        const c = 23 + h.length;
        if (c > 27) throw new Error("Map too large");
        ret.unshift(new Uint8Array([MAP + c, ...h]));
    }
    return mergeBuffers(ret);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encodeItem(a: any) {
    switch (typeof a) {
        case "string":
            return encodeString(a);
        case "number":
            return encodeNumber(a);
        default:
            if (Array.isArray(a)) {
                return encodeArray(a);
            } else {
                return encodeMap(new Map(a));
            }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encodeArray(a: any[]): Uint8Array {
    const ret = a.map(x => {
        return encodeItem(x);
    })
    const len = ret.length
    if (len < 24) {
        ret.unshift(new Uint8Array([ARR + len]));
    } else {
        const h = numberToBytes(len);
        const c = 23 + h.length;
        if (c > 27) throw new Error("Array too large");
        ret.unshift(new Uint8Array([ARR + c, ...h]));
    }
    return mergeBuffers(ret);
}

function isEmpty(n?: number) {
    return n === undefined || n === null || Number.isNaN(n);
}

function NegativeInt(v: number) {
    // if (typeof v === "bigint") {
    //     return -v - 1n;
    // } else {
    return -v - 1;
    // }
}
function decodeShortAtom(b: DataBuffer, c: number) {
    switch (c) {
        case 0:
            return b.next();
        case 1:
            return b.next() * 256 + b.next();
        case 2:
            {
                let ret = 0;
                for (let i = 0; i < 4; i++) {
                    ret = ret * 256 + b.next();
                }
                return ret;
            }
        case 3:
            {
                // let ret = 0n;
                // for (let i = 0; i < 8; i++) {
                //     ret = ret * 256n + BigInt(b.next());
                // }
                // return ret;
                let ret = 0;
                for (let i = 0; i < 8; i++) {
                    ret = ret * 256 + b.next();
                }
                return ret;
            }
        default:
            return NaN;
    }
}

function getLength(c: number, b: DataBuffer) {
    let len = 0;
    if (c < 24) {
        len = c;
    } else if (c < 28) {
        len = Number(decodeShortAtom(b, c - 24));
    } else {
        throw new Error("Unknown additional information");
    }
    return len;
}

function decodeString(b: DataBuffer, c: number, utf8: boolean) {
    const len = getLength(c, b);
    const buff = b.read(len);
    if (utf8) {
        const dec = new TextDecoder("utf-8");
        return dec.decode(buff);
    } else {
        return buff;
    }
}

function decodeItem(b: DataBuffer) {
    const t = b.next();
    const m = t >> 5;
    const c = t & 31;
    switch (m) {
        case MTypes.PositiveInt:
            if (c < 24) {
                return c;
            } else {
                return decodeShortAtom(b, c - 24);
            }
        case MTypes.NegativeInt:
            if (c < 24) {
                return - (c + 1);
            } else {
                return NegativeInt(decodeShortAtom(b, c - 24));
            }
        case MTypes.String:
            {
                // if (c === 31) return decodeStrTuple(b, false);
                if (c === 31) throw new Error("Unexpected Element")
                return decodeString(b, c, false);
            }
        case MTypes.UTF8:
            {
                if (c === 31) throw new Error("Unexpected Element")
                return decodeString(b, c, true);
            }
        case MTypes.Array:
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ret: any[] = [];
                if (c === 31) throw new Error("Unexpected Element");
                const len = getLength(c, b);
                for (let i = 0; i < len; i++) {
                    ret.push(decodeItem(b));
                }
                return ret;
            }
        case MTypes.Map:
            {
                const ret = new Map();
                if (c === 31) throw new Error("Unexpected Element");
                const len = getLength(c, b);
                for (let i = 0; i < len; i++) {
                    ret.set(decodeItem(b), decodeItem(b));
                }
                return ret;
            }
        case MTypes.Semantic:
            if (c < 24) {
                decodeItem(b);
                return
            } else if (c < 28) {
                getLength(c, b);
                decodeItem(b);
                return
            } else {
                throw new Error("Unknown additional information");
            }
        case MTypes.Special:
            {
                if (c < 20) return;
                if (c === 20) return false;
                if (c === 21) return true;
                if (c === 22) return null;
                if (c === 23) return undefined;
                if (c === 24) {
                    b.next(); /// extended count
                    return
                }
                if (c === 25) {
                    const h = b.next() * 256 + b.next();
                    const s = (h & 0x8000) >> 15;
                    const e = (h & 0x7C00) >> 10;
                    const f = h & 0x03FF;
                    if (e == 0) {
                        return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
                    } else if (e == 0x1F) {
                        return f ? NaN : ((s ? -1 : 1) * Infinity);
                    }

                    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + (f / Math.pow(2, 10)));
                }
                if (c === 26) {
                    const buff = b.read(4)
                    const view = new DataView(buff.buffer);
                    return view.getFloat32(0);
                }
                if (c === 27) {
                    const buff = b.read(8)
                    const view = new DataView(buff.buffer);
                    return view.getFloat64(0);
                }
                return
            }
    }
}

// function skip(b: DataBuffer, m: number, c: number) {
//     if (m === 0 || m === 1 || m === 7) {
//         if (c < 24) {
//             return
//         }
//         if (c < 28) {
//             let len = 0;
//             if (c === 24) len = 1
//             else if (c === 25) len = 2
//             else if (c === 26) len = 4
//             else if (c === 27) len = 8
//             else throw new Error("Unknown additional information")
//             b.read(len);
//         }
//     }
// }

function decode(data: Uint8Array) {
    const dataBuffer = new DataBuffer(data)
    if (data.length < 5 ||
        dataBuffer.data[0] !== MAGIC[0] ||
        dataBuffer.data[1] !== MAGIC[1] ||
        dataBuffer.data[2] !== MAGIC[2] ||
        dataBuffer.data[3] !== MAGIC[3]) throw new Error("Invalid data")
    dataBuffer.pos = 4;
    const ret: Data = {
        version: NaN,
        type: NaN,
        size: [NaN, NaN],
        list: [],
        data: [],
        header: "",
    }
    const d = decodeItem(dataBuffer);
    if (!Array.isArray(d)) throw new Error("Invalid data")
    if (d.length !== 6) throw new Error("Invalid data")
    ret.version = d[0]
    ret.type = d[1]
    if (ret.version !== 1 || ret.type !== 0) throw new Error("Invalid data")
    ret.size[0] = d[2]
    if (typeof d[3] === "number") {
        ret.size[1] = d[3]
        ret.data = Array.from({ length: ret.size[0] * ret.size[1] }, () => -1);
    } else if (Array.isArray(d[3])) {
        ret.data = d[3]
        ret.size[1] = ret.data.length / ret.size[0];
        if (ret.data.length % ret.size[0] !== 0) throw new Error("Incomplete table")
    } else {
        throw new Error("Invalid data")
    }
    if (typeof d[4] !== "string") throw new Error("Invalid data")
    ret.header = d[4]
    if (!Array.isArray(d[5])) throw new Error("Invalid data")
    ret.list = d[5]

    // if (!(d instanceof Map)) throw new Error("Invalid data")
    // if (!d.has(Keys.Version) || !d.has(Keys.Size) || !d.has(Keys.List) || !d.has(Keys.Data)) throw new Error("Invalid data")
    // const ver = d.get(Keys.Version)
    // if (!Number.isFinite(ver)) throw new Error("Invalid data")
    // ret.version = ver
    // if (ver !== 1) throw new Error("Invalid data")
    // const col = d.get(Keys.Size)
    // if (!Number.isFinite(col)) throw new Error("Invalid data")
    // ret.size[0] = col
    // const l = d.get(Keys.List)
    // if (!Array.isArray(l)) throw new Error("Invalid data")
    // ret.list = l
    // const table_data = d.get(Keys.Data)
    // if (!Array.isArray(table_data)) throw new Error("Invalid data")
    // ret.data = d.get(Keys.Data)
    // if (d.has(Keys.Header)) {
    //     const h = d.get(Keys.Header)
    //     if (typeof h !== "string") throw new Error("Invalid data")
    //     ret.header = h
    // }
    // if (d.has(Keys.Extra)) {
    //     const e = d.get(Keys.Extra)
    //     if (!Array.isArray(e)) throw new Error("Invalid data")
    //     ret.extra = e
    // }
    // ret.size[1] = ret.data.length / ret.size[0];
    // ret.size = d.get(Keys.Size)
    // ret.list = d.get(Keys.List)
    // ret.data = d.get(Keys.Data)
    // const t = dataBuffer.next();
    // const m = t >> 5;
    // const c = t & 31;
    // console.log(m, c)
    // if (m !== MTypes.Map || c < 4 || c > 23) throw new Error("Invalid data")
    // let p = 0
    // for (let index = 0; index < c; index++) {
    //     if (dataBuffer.EOF()) throw new Error("EOF")
    //     const key = decodeItem(dataBuffer);
    //     const value = decodeItem(dataBuffer);
    //     if (typeof key !== "number") throw new Error("Invalid key")
    //     switch (key) {
    //         case Keys.Version:
    //             if (typeof value !== "number") throw new Error("Invalid value")
    //             ret.version = value
    //             p |= 1
    //             break;
    //         case Keys.Size:
    //             if (typeof value !== "number") throw new Error("Invalid value")
    //             ret.size = [value, NaN]
    //             p |= 2
    //             break;
    //         case Keys.List:
    //             if (!Array.isArray(value)) throw new Error("Invalid value")
    //             ret.list = value
    //             p |= 4
    //             break;
    //         case Keys.Data:
    //             if (!Array.isArray(value)) throw new Error("Invalid value")
    //             ret.data = value
    //             p |= 8
    //             break;
    //         case Keys.Header:
    //             if (typeof value !== "string") throw new Error("Invalid value")
    //             ret.header = value
    //             break;
    //         case Keys.Extra:
    //             if (!Array.isArray(value)) throw new Error("Invalid value")
    //             ret.extra = value
    //             break;
    //         // default:
    //         //     throw new Error("Invalid key");
    //     }
    // }
    // if (p !== 15) throw new Error("Invalid data")
    return ret
}

// function mapHeader(len: number) {
//     if (len < 24) {
//         return [MAP + len];
//     } else {
//         const byteArray = numberToBytes(len);
//         const c = 23 + byteArray.length;
//         return [MAP + c, ...byteArray];
//     }
// }

const DataKeys: Array<keyof Data> = ["version", "type", "size", "list", "header"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIsData(data: Data|any): data is Data {
    const keys = Object.keys(data)
    if (keys.filter(x => (DataKeys as string[]).includes(x)).length !== DataKeys.length) return false
    if (data.version !== 1) return false
    if (data.type !== 0) return false
    return true
}

type EncTuple = [
    number,
    number,
    number,
    number | number[],
    string,
    string[]
]

function encode(data: InputData) {
    // const ret: Uint8Array[] = [
    //     new Uint8Array([
    //         ...MAGIC, // magic number
    //     ])
    // ]
    if (!checkIsData(data)) throw new Error("Invalid data")
    const d: EncTuple = [
        data.version,
        data.type,
        data.size[0],
        [],
        data.header ?? "",
        [],
    ]
    if (!Array.isArray(data.data)) {
        d[3] = data.size[1]
    } else {
        const i = data.data.findIndex(x => !isEmpty(x) && x >= 0)
        if (i === -1) {
            d[3] = data.size[1]
        } else {
            d[3] = data.data
        }
    }
    if (!Array.isArray(data.list)) throw new Error("Invalid data")
    d[5] = data.list
    // const len = Object.keys(data).length
    // if (len < 4 || len > 6) throw new Error("Invalid data")
    //     ret.push(new Uint8Array([
    //         ...MAGIC, // magic number
    //         ...mapHeader(len), // map(l)
    //         Keys.Version, // version:
    //         0x01, // 1
    //         Keys.Size // columns:
    //     ]),
    //         encodeNumber(data.size[0]) // columns value
    //     )
    //     ret.push(
    //         new Uint8Array([
    //             Keys.List, // list:
    //         ]),
    //         encodeArrayHeader(data.list.length), // array(length)
    //         ...data.list.map(x => encodeString(x)) // array
    //     )
    //     ret.push(
    //         new Uint8Array([
    //             Keys.Data, // data:
    //         ]),
    //         encodeArrayHeader(data.data.length), // array(length)
    //         ...data.data.map(x => encodeNumber((isEmpty(x) ? -1 : x)))
    //     )
    //     if (data.header) ret.push(new Uint8Array([
    //         Keys.Header // header:
    //     ]),encodeString(data.header))
    //     if (Array.isArray(data.extra)) {
    //         ret.push(
    //             new Uint8Array([
    //                 Keys.Extra, // extra:
    //             ]),
    //             encodeArrayHeader(data.extra.length), // array(length)
    //             ...data.extra.map(x => {
    //                 if (typeof x === "string") return encodeString(x)
    //                 if (typeof x === "number") return encodeNumber((isEmpty(x) ? -1 : x))
    //                 throw new Error("Invalid value")
    //             })
    //         )
    //     }
    return mergeBuffers([
        new Uint8Array([
            ...MAGIC, // magic number
        ]),
        encodeArray(d)
    ])
}

export function fromURL(data: string) {
    return decode(inflateRaw(base64ToBytes(normal64(data))))
}

export function toURL(data: InputData) {
    // if (data.data.length === 0) {
    //     data.data = Array.from({ length: data.size[0] * data.size[1] }, () => -1)
    // }
    const enc = encode(data)
    const cmp = deflateRaw(enc)
    return webSafe64(bytesToBase64(cmp))
}

// export default class DataState {
//     data: Data
//     constructor(data: Data) {
//         this.data = data
//         if (this.data.data.length / this.data.size[0] !== this.data.size[1]) throw new Error("Invalid data")
//     }
//     encode() {
//         const ret: Uint8Array[] = []
//         ret.push(new Uint8Array([
//             ...MAGIC, // magic number
//             0xA4, // map(4)
//             Keys.Version, // version:
//             0x01, // 1
//             Keys.Size // columns:
//         ]),
//             encodeNumber(this.data.size[0]) // columns value
//         )
//         ret.push(
//             new Uint8Array([
//                 Keys.List, // list:
//             ]),
//             encodeArrayHeader(this.data.list.length), // array(length)
//             ...this.data.list.map(x => encodeString(x)) // array
//         )
//         ret.push(
//             new Uint8Array([
//                 Keys.Data, // data:
//             ]),
//             encodeArrayHeader(this.data.data.length), // array(length)
//             ...this.data.data.map(x => encodeNumber((isEmpty(x) ? -1 : x)))
//         )
//         return mergeBuffers(ret)
//     }
//     toURL() {
//         return webSafe64(bytesToBase64(deflateRaw(this.encode())))
//     }
//     static decode(data: Uint8Array) {
//         const dataBuffer = new DataBuffer(data)
//         if (data.length < 5 ||
//             dataBuffer.data[0] !== MAGIC[0] ||
//             dataBuffer.data[1] !== MAGIC[1] ||
//             dataBuffer.data[2] !== MAGIC[2] ||
//             dataBuffer.data[3] !== MAGIC[3] ||
//             dataBuffer.data[4] !== 0xA4 ||
//             dataBuffer.data[5] !== Keys.Version ||
//             dataBuffer.data[6] !== 0x01) throw new Error("Invalid data")
//         dataBuffer.pos = 4;
//         const ret: Data = {
//             version: NaN,
//             size: [NaN, NaN],
//             list: [],
//             data: [],
//         }
//         const t = dataBuffer.next();
//         const m = t >> 5;
//         const c = t & 31;
//         if (m !== MTypes.Map || c < 4 || c > 23) throw new Error("Invalid data")
//         let p = 0
//         for (let index = 0; index < c; index++) {
//             if (dataBuffer.EOF()) throw new Error("EOF")
//             const key = decodeItem(dataBuffer);
//             const value = decodeItem(dataBuffer);
//             if (typeof key !== "number") throw new Error("Invalid key")
//             switch (key) {
//                 case Keys.Version:
//                     if (typeof value !== "number") throw new Error("Invalid value")
//                     ret.version = value
//                     p |= 1
//                     break;
//                 case Keys.Size:
//                     if (typeof value !== "number") throw new Error("Invalid value")
//                     ret.size = [value, NaN]
//                     p |= 2
//                     break;
//                 case Keys.List:
//                     if (!Array.isArray(value)) throw new Error("Invalid value")
//                     ret.list = value
//                     p |= 4
//                     break;
//                 case Keys.Data:
//                     if (!Array.isArray(value)) throw new Error("Invalid value")
//                     ret.data = value
//                     p |= 8
//                     break;
//                 // default:
//                 //     throw new Error("Invalid key");
//             }
//         }
//         if (p !== 15) throw new Error("Invalid data")
//         ret.size[1] = ret.data.length / ret.size[0];
//         if (ret.data.length % ret.size[0] !== 0) throw new Error("Incomplete table")
//         return new DataState(ret)
//     }
// }

// const b = new DataState({
//     version: 1,
//     size: [4, 4],
//     list: ["Hello There", "Hello World", "This is a example text to test compresion"],
//     data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
// }).encode()

// const d = DataState.decode(b)

// console.log(d)

// const f = deflateRaw(b)

// console.log(Array.from(b).map(x => x.toString(16).padStart(2, "0")).join(" "))
// console.log(Array.from(f).map(x => x.toString(16).padStart(2, "0")).join(" "))

// console.log(b.length, f.length)



// console.log(decodeItem(new DataBuffer(new Uint8Array([0xF9, 0x7E, 0x00]))))
