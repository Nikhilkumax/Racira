// Minimal EXIF parser for JPEG (APP1 / TIFF IFD0 + Exif IFD).
// Returns a flat object of human-readable tag names.

const TAGS: Record<number, string> = {
  0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x011a: "XResolution",
  0x011b: "YResolution", 0x0128: "ResolutionUnit", 0x0131: "Software",
  0x0132: "DateTime", 0x013b: "Artist", 0x8298: "Copyright",
  0x829a: "ExposureTime", 0x829d: "FNumber", 0x8822: "ExposureProgram",
  0x8827: "ISO", 0x9000: "ExifVersion", 0x9003: "DateTimeOriginal",
  0x9004: "DateTimeDigitized", 0x9201: "ShutterSpeedValue", 0x9202: "ApertureValue",
  0x9203: "BrightnessValue", 0x9204: "ExposureBiasValue", 0x9205: "MaxApertureValue",
  0x9206: "SubjectDistance", 0x9207: "MeteringMode", 0x9208: "LightSource",
  0x9209: "Flash", 0x920a: "FocalLength", 0xa402: "ExposureMode",
  0xa403: "WhiteBalance", 0xa405: "FocalLengthIn35mm", 0xa406: "SceneCaptureType",
  0xa432: "LensInfo", 0xa433: "LensMake", 0xa434: "LensModel",
};

function readStr(view: DataView, off: number, len: number) {
  let s = "";
  for (let i = 0; i < len; i++) {
    const c = view.getUint8(off + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

export function parseExif(buf: ArrayBuffer): Record<string, string | number> {
  const v = new DataView(buf);
  if (v.getUint16(0) !== 0xffd8) throw new Error("Not a JPEG file");
  let off = 2;
  while (off < v.byteLength) {
    const marker = v.getUint16(off);
    const size = v.getUint16(off + 2);
    if (marker === 0xffe1) {
      const start = off + 4;
      if (readStr(v, start, 4) !== "Exif") return {};
      const tiff = start + 6;
      const little = v.getUint16(tiff) === 0x4949;
      const get16 = (o: number) => v.getUint16(o, little);
      const get32 = (o: number) => v.getUint32(o, little);
      if (get16(tiff + 2) !== 0x002a) return {};
      const ifd0 = tiff + get32(tiff + 4);
      const out: Record<string, string | number> = {};
      const readIFD = (base: number) => {
        const n = get16(base);
        let exifPtr = 0;
        for (let i = 0; i < n; i++) {
          const e = base + 2 + i * 12;
          const tag = get16(e);
          const type = get16(e + 2);
          const count = get32(e + 4);
          const valOff = e + 8;
          const types = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
          const tsize = (types[type] ?? 1) * count;
          const dataOff = tsize <= 4 ? valOff : tiff + get32(valOff);
          let val: any;
          if (type === 2) val = readStr(v, dataOff, count).trim();
          else if (type === 3) val = get16(dataOff);
          else if (type === 4) val = get32(dataOff);
          else if (type === 5) {
            const num = get32(dataOff);
            const den = get32(dataOff + 4);
            val = den === 0 ? 0 : num / den;
          } else if (type === 10) {
            const num = v.getInt32(dataOff, little);
            const den = v.getInt32(dataOff + 4, little);
            val = den === 0 ? 0 : num / den;
          } else val = "[binary]";
          if (tag === 0x8769) exifPtr = tiff + (val as number);
          const name = TAGS[tag];
          if (name) {
            if (name === "ExposureTime" && typeof val === "number") val = val < 1 ? `1/${Math.round(1 / val)} s` : `${val} s`;
            if (name === "FNumber" && typeof val === "number") val = `f/${val}`;
            if (name === "FocalLength" && typeof val === "number") val = `${val} mm`;
            out[name] = val;
          }
        }
        return exifPtr;
      };
      const exifIfd = readIFD(ifd0);
      if (exifIfd) readIFD(exifIfd);
      return out;
    }
    off += 2 + size;
  }
  return {};
}
