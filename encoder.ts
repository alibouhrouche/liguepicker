class DataBuffer {
    data: Uint8Array;
    pos: number;
    constructor(data: Uint8Array) {
        this.data = data;
        this.pos = 0;
    }
    next() {
        if (this.pos >= this.data.length) throw new Error("EOF");
        return this.data[this.pos++];
    }
    seek(pos: number) {
        this.pos = pos;
    }
    tell() {
        return this.pos;
    }
    rewind() {
        this.pos = 0;
    }
    read(len: number) {
        const ret = this.data.slice(this.pos, this.pos + len);
        this.pos += len;
        return ret;
    }
    peek(len?: number) {
        if (len === undefined) {
            return this.data[this.pos + 1];
        }
        return this.data.slice(this.pos, this.pos + len);
    }
    get curr() {
        return this.data[this.pos];
    }
    get follow() {
        return this.data[this.pos + 1];
    }
    eof() {
        return this.pos >= this.data.length
    }
}

// function createStream() {
//     const stream = new ReadableStream({

//     })
// }

class TextTuple {
    text: (string | Uint8Array)[];
    uft8: boolean;
    constructor(text: (string|Uint8Array)[], uft8: boolean) {
        this.text = text;
        this.uft8 = uft8;
    }
    add(text: string|Uint8Array) {
        this.text.push(text);
    }
    get(i: number) {
        return this.text[i];
    }
    valueOf() {
        return this.text;
    }
    toString() {
        return `(_ ${this.text.map((x) => `"${x}"`).join(", ")})`;
    }
}

type Data = {
    version: number,
    size: [number, number],
    list: string[],
    data: number[],
}

enum Keys {
    Version = 0,
    Size = 1,
    List = 2,
    Data = 3
}

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

type TYPE = {
    type: MTypes,
    value: number
}

function mergeBuffers(buff: Uint8Array[]) {
    let offset = 0;
    const r = new Uint8Array(buff.reduce((a, b) => a + b.length, 0));
    if(buff.length === 0) return r;
    for (let i = 0; i < buff.length; i++) {
        r.set(buff[i], offset);
        offset += buff[i].length
    }
    return r;
}

function decodeShortAtom(b: DataBuffer,c: number) {
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
                let ret = 0n;
                for (let i = 0; i < 8; i++) {
                    ret = ret * 256n + BigInt(b.next());
                }
                return ret;
            }
        default:
            return NaN;
    }
}

function decodeString(b: DataBuffer, c: number, utf8: boolean) {
    let len = getLength(c, b);
    const buff = b.read(len);
    if (utf8) {
        const dec = new TextDecoder("utf-8");
        // new Uint8Array(len);
        // for (let i = 0; i < len; i++) {
        //     buff[i] = b.next();
        // }
        return dec.decode(buff);
    } else {
        // let ret = "";
        // for (let i = 0; i < len; i++) {
        //     ret += String.fromCharCode(b.next());
        // }
        // return ret;
        return buff;
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

function decodeStrTuple(b: DataBuffer, utf8: boolean) {
    const tuple = new TextTuple([], utf8);
    let t;
    while((t = b.next()) !== 0xff) {
        const m = t >> 5;
        const c = t & 31;
        if (m === MTypes.String || m === MTypes.UTF8) {
            if (
                m === MTypes.String && utf8 ||
                m === MTypes.UTF8 && !utf8
            ) throw new Error("bytes/text mismatch");
            if (c === 31) throw new Error("Nested Streaming String")
            tuple.add(decodeString(b, c, utf8));
        } else {
            throw new Error("Non String in streaming string");
        }
    }
    return tuple;
}

function NegativeInt(v: number | bigint) {
    if (typeof v === "bigint") {
        return -v - 1n;
    } else {
        return -v - 1;
    }
}

// function decodeItems(b: DataBuffer, c: number) {
    // let ret = [];
    // for (let i = 0; i < c; i++) {
    //     ret.push(decodeItem(b));
    // }
    // return ret;
    
// }

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
                if (c === 31) return decodeStrTuple(b, false);
                return decodeString(b, c, false);
            }
        case MTypes.UTF8:
            {
                if (c === 31) return decodeStrTuple(b, true);
                return decodeString(b, c, true);
            }
        case MTypes.Array:
            {
                let ret: any[] = [];
                if (c === 31) return [];
                const len = getLength(c, b);
                for (let i = 0; i < len; i++) {
                    ret.push(decodeItem(b));
                }
                return ret;
            }
        case MTypes.Map:
            {
                let ret = new Map();
                if (c === 31) return ret;
                const len = getLength(c, b);
                for (let i = 0; i < len; i++) {
                    ret.set(decodeItem(b), decodeItem(b));
                }
                return ret;
            }
        default:
            break;
    }
}

// function encode(params:type) {
    
// }

function numberToBytes(number: number) {
    // you can use constant number of bytes by using 8 or 4
    // const len = Math.ceil(Math.log2(number) / 8);
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

function encodeString(s: string) {
    const enc = new TextEncoder();
    const buff = enc.encode(s);
    const len = buff.length;
    if (len < 24) {
        return new Uint8Array([0x60 + len, ...buff]);
    } else {
        const byteArray = numberToBytes(len);
        const c = 23 + byteArray.length;
        return new Uint8Array([0x60 + c, ...byteArray, ...buff]);
    }
}

function encodeUint8Array(a: Uint8Array) {
    const len = a.length;
    if (len < 24) {
        return new Uint8Array([0x40 + len, ...a]);
    } else {
        const byteArray = numberToBytes(len);
        const c = 23 + byteArray.length;
        return new Uint8Array([0x40 + c, ...byteArray, ...a]);
    }
}

function encodeNumber(n: number) {
    let v = n;
    if (n < 0) v = -n - 1;
    console.log(v);
    if (v < 24) {
        return new Uint8Array([(n < 0 ? 0x20 : 0x00) + v]);
    } else {
        const byteArray = numberToBytes(v);
        const c = 23 + byteArray.length;
        return new Uint8Array([(n < 0 ? 0x20 : 0x00) + c, ...byteArray]);
    }
}

function encodeMap(a: any) {
    const ret: Uint8Array[] = [];
    for (let [k, v] of Object.entries(a)) {
        ret.push(encodeItem(k), encodeItem(v));
        encodeItem(k);
        encodeItem(v);
    }
    const len = (ret.length / 2)
    if (len < 24) {
        ret.unshift(new Uint8Array([0xA0 + len]));
    } else {
        const h = numberToBytes(len);
        const c = 23 + h.length;
        if (c > 27) throw new Error("Map too large");
        ret.unshift(new Uint8Array([0xA0 + c, ...h]));
    }
    return mergeBuffers(ret);
}

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

function encodeArray(a: any[]): Uint8Array {
    const ret = a.map(x => {
        return encodeItem(x);
    })
    const len = ret.length
    if (len < 24) {
        ret.unshift(new Uint8Array([0xA0 + len]));
    } else {
        const h = numberToBytes(len);
        const c = 23 + h.length;
        if (c > 27) throw new Error("Array too large");
        ret.unshift(new Uint8Array([0xA0 + c, ...h]));
    }
    return mergeBuffers(ret);
}

function encodeData(data: Data) {
    if (data.size[1] !== (data.data.length / data.size[0])) {
        throw new Error("Data size mismatch");
    }
    const h = new Uint8Array([0xA4, 0x00, 0x01, 0x01])
    // data.data.map(x => (Number.isNaN(x) ? -1 : x));
    // const d = [h, encodeNumber(data.size[0]), 0x02, encodeArray(data.list), 0x03, encodeArray()];
}

// function decodeCBOR(data: Uint8Array) {
//     const b = new DataBuffer(data);
//     const ret: Data = {
//         version: NaN,
//         size: [0,0],
//     }
//     if (data[0] !== 0xA4) return
//     while (!b.eof()) {
        
//     }   
// }


console.log(Array.from(encodeNumber(-12345)).map(x => x.toString(16).padStart(2, "0")).join(" "))
// console.log(Array.from(numberToBytes(123456)).map(x => x.toString(16).padStart(2, "0")).join(" "))
// console.log(decodeItem(new DataBuffer(new Uint8Array([0x7f,0x65,0x48,0x65,0x6C,0x6C,0x6F,0x65,0x48,0x65,0x6C,0x6C,0x6F,0xff]))))
// console.log(decodeItem(new DataBuffer(new Uint8Array([0xA4,0x00,0x01,0x01,0x82,0x01,0x02,0x02,0x81,0x65,0x48,0x65,0x6C,0x6C,0x6F,0x03,0x83,0x00,0x01,0x02]))))