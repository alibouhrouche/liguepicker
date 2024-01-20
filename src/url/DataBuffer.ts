export default class DataBuffer {
    data: Uint8Array;
    pos: number;
    constructor(data: Uint8Array) {
        this.data = data;
        this.pos = 0;
    }
    next() {
        if (this.pos >= this.data.length) {
            console.log(this.data)
            throw new Error("EOF: "+this.pos);
        }
        return this.data[this.pos++];
    }
    read(len: number) {
        const ret = this.data.slice(this.pos, this.pos + len);
        this.pos += len;
        return ret;
    }
    EOF() {
        return this.pos >= this.data.length
    }
}

// export function newWriteStream() {
//     const ret = [];
//     const stream = new WritableStream(
//     {
//         start(controller) {

//         },
//         write(chunk, controller) {

//         },
//         close(controller) {},
//         abort(reason) {},
//     },
//     {
//         highWaterMark: 3,
//         size: () => 1,
//     },
//     );
// }