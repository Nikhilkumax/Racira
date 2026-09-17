"use strict";
/**
 * Pure ID3v2.3/2.4 reading and writing — the core of ID3 Tag Editor, Audio
 * Metadata Editor and Podcast Chapter Marker Tool. No browser APIs,
 * deterministic, verified in Node against hand-built byte fixtures.
 *
 * Scope (deliberate): v2.3/2.4, ASCII/Latin-1 + UTF-16 text frames, TXXX,
 * and the CHAP/CHTO2 chapter frames used by podcasts. ID3v1 and encrypted/
 * compressed frames are skipped on read, not misparsed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ID3_TEXT_MAP = void 0;
exports.readId3 = readId3;
exports.buildId3Tag = buildId3Tag;
exports.replaceId3Tag = replaceId3Tag;
exports.stripId3Tag = stripId3Tag;
const ENC_LATIN1 = 0x00;
const ENC_UTF16 = 0x01;
function decodeString(bytes, enc) {
    if (enc === ENC_UTF16) {
        if (bytes.length < 2)
            return "";
        const bomLe = bytes[0] === 0xff && bytes[1] === 0xfe;
        let s = "";
        for (let i = 2; i + 1 < bytes.length; i += 2) {
            const code = bomLe ? bytes[i] | (bytes[i + 1] << 8) : (bytes[i] << 8) | bytes[i + 1];
            if (code === 0)
                break;
            s += String.fromCharCode(code);
        }
        return s;
    }
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0)
            break;
        s += String.fromCharCode(bytes[i]);
    }
    return s;
}
function encodeUtf16Le(s) {
    const out = new Uint8Array(2 + s.length * 2 + 2);
    out[0] = 0xff;
    out[1] = 0xfe; // LE BOM
    for (let i = 0; i < s.length; i++) {
        out[2 + i * 2] = s.charCodeAt(i) & 0xff;
        out[3 + i * 2] = s.charCodeAt(i) >> 8;
    }
    out[2 + s.length * 2] = 0;
    out[3 + s.length * 2] = 0;
    return out;
}
function encodeLatin1(s) {
    const out = new Uint8Array(s.length + 1);
    for (let i = 0; i < s.length; i++)
        out[i] = s.charCodeAt(i) & 0xff;
    out[s.length] = 0;
    return out;
}
exports.ID3_TEXT_MAP = {
    TIT2: "title",
    TPE1: "artist",
    TALB: "album",
    TYER: "year",
    TDRC: "year",
    TCON: "genre",
};
/** Read ID3v2 tags from file bytes. Returns null when there is no v2 tag. */
function readId3(b) {
    if (b.length < 10)
        return null;
    if (!(b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33))
        return null; // "ID3"
    const major = b[3];
    if (major < 3 || major > 4)
        return null;
    const flags = b[5];
    const size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
    const tags = {
        version: [major, b[4]],
        title: null, artist: null, album: null, year: null, comment: null, genre: null,
        tracks: [],
        chapters: [],
    };
    let off = 10;
    const end = Math.min(10 + size, b.length);
    // Skip extended header if present (v2.3/2.4 differ; neither appears in practice — bail out).
    if (flags & 0x40) {
        if (major === 3)
            off += 4 + ((b[off] << 24) | (b[off + 1] << 16) | (b[off + 2] << 8) | b[off + 3]);
        else
            off += 4 + (((b[off] & 0x7f) << 21) | ((b[off + 1] & 0x7f) << 14) | ((b[off + 2] & 0x7f) << 7) | (b[off + 3] & 0x7f));
    }
    while (off + 10 <= end) {
        const id = String.fromCharCode(b[off], b[off + 1], b[off + 2], b[off + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id))
            break;
        let frameSize;
        if (major === 4) {
            frameSize = ((b[off + 4] & 0x7f) << 21) | ((b[off + 5] & 0x7f) << 14) | ((b[off + 6] & 0x7f) << 7) | (b[off + 7] & 0x7f);
        }
        else {
            frameSize = (b[off + 4] << 24) | (b[off + 5] << 16) | (b[off + 6] << 8) | b[off + 7];
        }
        const frameFlags = (b[off + 8] << 8) | b[off + 9];
        if (frameSize <= 0 || off + 10 + frameSize > end)
            break;
        const body = b.subarray(off + 10, off + 10 + frameSize);
        // Compressed/encrypted frames are out of scope.
        const compressed = major === 3 ? frameFlags & 0x0080 : frameFlags & 0x0008;
        const encrypted = major === 3 ? frameFlags & 0x0040 : frameFlags & 0x0004;
        if (!compressed && !encrypted) {
            if (id.startsWith("T") && id !== "TXXX" && body.length >= 1) {
                const value = decodeString(body.subarray(1), body[0]);
                tags.tracks.push({ id, value });
                const key = exports.ID3_TEXT_MAP[id];
                if (key && !tags[key])
                    tags[key] = value;
            }
            else if (id === "TXXX" && body.length >= 1) {
                const enc = body[0];
                const rest = body.subarray(1);
                // description NUL, then value
                let z = rest.indexOf(enc === ENC_UTF16 ? 0 : 0);
                // For UTF-16 the terminator is a 2-byte 00 00; find an even-aligned zero pair.
                if (enc === ENC_UTF16) {
                    z = -1;
                    for (let i = 0; i + 1 < rest.length; i += 2) {
                        if (rest[i] === 0 && rest[i + 1] === 0) {
                            z = i;
                            break;
                        }
                    }
                }
                const desc = z >= 0 ? decodeString(rest.subarray(0, z), enc) : "";
                const valStart = z >= 0 ? z + (enc === ENC_UTF16 ? 2 : 1) : rest.length;
                const value = decodeString(rest.subarray(valStart), enc);
                tags.tracks.push({ id: `TXXX:${desc}`, value });
            }
            else if (id === "COMM" && body.length >= 4) {
                const value = decodeString(body.subarray(4), body[0]);
                tags.comment = value;
                tags.tracks.push({ id: "COMM", value });
            }
            else if (id === "CHAP" && body.length >= 20) {
                // CHAP: element id (NUL-term) + start(4) end(4) startOffset(4) endOffset(4) + subframes
                let z = 0;
                while (z < body.length && body[z] !== 0)
                    z++;
                const chapterId = decodeString(body.subarray(0, z), 0);
                const dv = new DataView(body.buffer, body.byteOffset + z + 1, 16);
                const startMs = dv.getUint32(0);
                const endMs = dv.getUint32(4);
                // subframes: look for TIT2
                let title = "";
                let sf = z + 17;
                while (sf + 10 <= body.length) {
                    const sid = String.fromCharCode(body[sf], body[sf + 1], body[sf + 2], body[sf + 3]);
                    if (!/^[A-Z0-9]{4}$/.test(sid))
                        break;
                    const ssz = (body[sf + 4] << 24) | (body[sf + 5] << 16) | (body[sf + 6] << 8) | body[sf + 7];
                    if (ssz <= 0 || sf + 10 + ssz > body.length)
                        break;
                    if (sid === "TIT2" && body[sf + 10 + ssz - 1] !== undefined) {
                        title = decodeString(body.subarray(sf + 11, sf + 10 + ssz), body[sf + 10]);
                        break;
                    }
                    sf += 10 + ssz;
                }
                tags.chapters.push({ id: chapterId, title, startMs, endMs });
            }
        }
        off += 10 + frameSize;
    }
    return tags;
}
function textFrame(id, value, version) {
    // Latin-1 covers ASCII names; UTF-16 for anything wider.
    const ascii = /^[\x20-\x7e]*$/.test(value);
    const enc = ascii ? ENC_LATIN1 : ENC_UTF16;
    const body = new Uint8Array(1 + (ascii ? encodeLatin1(value).length : encodeUtf16Le(value).length));
    body[0] = enc;
    body.set(ascii ? encodeLatin1(value) : encodeUtf16Le(value), 1);
    return { id, body };
}
function chapFrame(ch, version) {
    // encodeLatin1 appends a NUL; CHAP wants the raw ID plus exactly one.
    const idBytes = encodeLatin1(ch.id).subarray(0, ch.id.length);
    const titleFrame = textFrame("TIT2", ch.title, version);
    const body = new Uint8Array(idBytes.length + 1 + 16 + 10 + titleFrame.body.length);
    body.set(idBytes, 0);
    body[idBytes.length] = 0;
    const dv = new DataView(body.buffer);
    const dvOff = idBytes.length + 1;
    dv.setUint32(dvOff, ch.startMs);
    dv.setUint32(dvOff + 4, ch.endMs);
    dv.setUint32(dvOff + 8, 0xffffffff); // no byte offsets
    dv.setUint32(dvOff + 12, 0xffffffff);
    // nested TIT2 frame: [id(4)][size(4)][flags(2)][body]
    body.set(new Uint8Array([0x54, 0x49, 0x54, 0x32]), dvOff + 16);
    const tsz = titleFrame.body.length;
    const dv2 = new DataView(body.buffer);
    dv2.setUint32(dvOff + 20, tsz);
    body.set(titleFrame.body, dvOff + 26); // nested body starts after its 10-byte header
    return { id: "CHAP", body };
}
function frameHeaderSize(version) {
    return 10;
}
function writeFrame(f, version) {
    const out = new Uint8Array(10 + f.body.length);
    for (let i = 0; i < 4; i++)
        out[i] = f.id.charCodeAt(i);
    const dv = new DataView(out.buffer);
    if (version === 4) {
        dv.setUint32(4, f.body.length);
    }
    else {
        dv.setUint32(4, f.body.length);
    }
    out.set(f.body, 10); // frame body follows the 10-byte header
    return out;
}
/**
 * Serialize a full ID3v2 tag with the given text frames and chapters. Pure:
 * returns the tag bytes only — callers prepend them to the audio payload.
 */
function buildId3Tag(opts) {
    const version = opts.version ?? 3;
    const frames = [];
    const set = (id, v) => {
        if (v !== undefined && v !== null && v !== "")
            frames.push(textFrame(id, v, version));
    };
    set("TIT2", opts.title);
    set("TPE1", opts.artist);
    set("TALB", opts.album);
    set(version === 3 ? "TYER" : "TDRC", opts.year);
    set("TCON", opts.genre);
    if (opts.comment) {
        const body = new Uint8Array(4 + 1 + encodeLatin1(opts.comment).length);
        body[0] = ENC_LATIN1;
        body.set(encodeLatin1("eng"), 1);
        body.set(encodeLatin1(opts.comment), 4);
        frames.push({ id: "COMM", body });
    }
    for (const ch of opts.chapters ?? []) {
        frames.push(chapFrame(ch, version));
    }
    const framesBytes = frames.map((f) => writeFrame(f, version));
    const framesLen = framesBytes.reduce((a, f) => a + f.length, 0);
    const padding = opts.padding ?? 512;
    const total = 10 + framesLen + padding;
    const tag = new Uint8Array(total);
    tag[0] = 0x49;
    tag[1] = 0x44;
    tag[2] = 0x33;
    tag[3] = version;
    tag[4] = 0;
    tag[5] = 0;
    // syncsafe size
    const sz = total - 10;
    tag[6] = (sz >> 21) & 0x7f;
    tag[7] = (sz >> 14) & 0x7f;
    tag[8] = (sz >> 7) & 0x7f;
    tag[9] = sz & 0x7f;
    let off = 10;
    for (const f of framesBytes) {
        tag.set(f, off);
        off += f.length;
    }
    return tag;
}
/**
 * Produce full file bytes: existing audio payload (everything after any
 * existing ID3v2 tag) with a freshly built tag in front. Pure.
 */
function replaceId3Tag(fileBytes, opts) {
    let audioStart = 0;
    if (fileBytes.length >= 10 && fileBytes[0] === 0x49 && fileBytes[1] === 0x44 && fileBytes[2] === 0x33) {
        audioStart = 10 + (((fileBytes[6] & 0x7f) << 21) | ((fileBytes[7] & 0x7f) << 14) | ((fileBytes[8] & 0x7f) << 7) | (fileBytes[9] & 0x7f));
    }
    const tag = buildId3Tag(opts);
    const out = new Uint8Array(tag.length + (fileBytes.length - audioStart));
    out.set(tag, 0);
    out.set(fileBytes.subarray(audioStart), tag.length);
    return out;
}
/**
 * Remove any ID3v2 tag entirely, keeping only the audio payload (copy, not a
 * view — the result must be safe to hand to Blob). Files without a tag come
 * back unchanged. Pure.
 */
function stripId3Tag(fileBytes) {
    if (fileBytes.length >= 10 && fileBytes[0] === 0x49 && fileBytes[1] === 0x44 && fileBytes[2] === 0x33) {
        const audioStart = 10 + (((fileBytes[6] & 0x7f) << 21) | ((fileBytes[7] & 0x7f) << 14) | ((fileBytes[8] & 0x7f) << 7) | (fileBytes[9] & 0x7f));
        return fileBytes.slice(audioStart);
    }
    return fileBytes.slice();
}
