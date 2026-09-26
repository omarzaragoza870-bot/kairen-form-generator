const bwipjs = require("bwip-js");
const sharp = require("sharp");

function clean(v) {
  return String(v == null ? "" : v).replace(/[\r\n|]/g, " ").trim();
}

function wire(v) {
  return String(v == null ? "" : v).replace(/[\r\n]/g, " ").trim().toUpperCase();
}

function normalizeDate(v) {
  const digits = String(v == null ? "" : v).replace(/\D/g, "");
  return digits.length === 8 ? digits : wire(v);
}

function normalizeHeight(v) {
  const raw = String(v == null ? "" : v).trim().toUpperCase();
  if (/^\d{3}\s*IN$/.test(raw)) return raw.replace(/\s+/g, " ");
  if (/^\d{2,3}$/.test(raw)) return String(parseInt(raw, 10)).padStart(3, "0") + " IN";
  const m = raw.match(/^(\d)\s*(?:FT|['-])?\s*(\d{1,2})/);
  if (m) {
    const inches = parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
    return String(inches).padStart(3, "0") + " IN";
  }
  return raw;
}

function buildOhioV10Payload(body) {
  const fields = Object.assign({}, body.fields || {});
  ["DBA", "DBD", "DBB", "DDB"].forEach((k) => { fields[k] = normalizeDate(fields[k]); });
  fields.DAU = normalizeHeight(fields.DAU);
  fields.DAJ = "OH";
  // Ohio sample uses an 11-character DAK field. Keep ZIP visible in the UI, pad only on the wire.
  fields.DAK = wire(fields.DAK).padEnd(11, " ").slice(0, 11);

  const order = [
    "DCA", "DCB", "DCD", "DBA", "DCS", "DAC", "DAD", "DBD", "DBB", "DBC",
    "DAY", "DAU", "DAG", "DAI", "DAJ", "DAK", "DAQ", "DCF", "DCG", "DDE",
    "DDF", "DDG", "DAW", "DAZ", "DDA", "DDB", "DDK", "DDL"
  ];

  const lines = [];
  order.forEach((code) => {
    const value = code === "DAK" ? fields[code] : wire(fields[code]);
    if (value !== "") lines.push(code + value);
  });

  // The supplied Ohio sample is 249 bytes in the DL subfile when the final LF + CR terminators are included.
  const dlBlock = "DL" + lines.join("\n") + "\n\r";
  const length = String(dlBlock.length).padStart(4, "0");
  const header = "@\n\x1e\rANSI 636023100001DL0031" + length;
  return header + dlBlock;
}

function buildAlaskaV10Payload(body) {
  const fields = Object.assign({}, body.fields || {});
  ["DBA", "DBD", "DBB", "DDB"].forEach((k) => { fields[k] = normalizeDate(fields[k]); });
  fields.DAU = normalizeHeight(fields.DAU);
  fields.DAJ = "AK";
  fields.DAK = wire(fields.DAK).padEnd(11, " ").slice(0, 11);

  const order = [
    "DCA", "DCB", "DCD", "DBA", "DCS", "DAC", "DAD", "DBD", "DBB", "DBC",
    "DAY", "DAU", "DAG", "DAI", "DAJ", "DAK", "DAQ", "DCF", "DCG", "DDE",
    "DDF", "DDG", "DAW", "DAZ", "DDA", "DDB", "DDK", "DDL"
  ];

  const lines = [];
  order.forEach((code) => {
    const value = code === "DAK" ? fields[code] : wire(fields[code]);
    if (value !== "") lines.push(code + value);
  });

  const dlBlock = "DL" + lines.join("\n") + "\n\r";
  const length = String(dlBlock.length).padStart(4, "0");
  const header = "@\n\x1e\rANSI 636059100001DL0031" + length;
  return header + dlBlock;
}

function buildTestPayload(body) {
  const profile = clean(body.profile).toUpperCase();
  if (!/^[A-Z]{2}$/.test(profile)) throw new Error("profile debe ser un código de 2 letras.");

  const version = clean(body.version) || "10";
  const subfile = clean(body.subfile) || "DL";
  const fields = body.fields || {};
  const pairs = [
    "MODE=KAIREN_TEST_V3",
    "PROFILE=" + profile,
    "VERSION=" + version,
    "SUBFILE=" + subfile
  ];

  Object.keys(fields).sort().forEach((code) => {
    const value = clean(fields[code]);
    if (value !== "") pairs.push(clean(code).toUpperCase() + "=" + value);
  });
  return pairs.join("|");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("POST only");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const profile = clean(body.profile).toUpperCase();
    const ohio = profile === "OH";
    const alaska = profile === "AK";
    const raw = ohio ? buildOhioV10Payload(body) : (alaska ? buildAlaskaV10Payload(body) : buildTestPayload(body));

    const source = await bwipjs.toBuffer({
      bcid: "pdf417",
      text: raw,
      scale: 3,
      columns: 10,
      rowmult: 2,
      includetext: false,
      paddingwidth: 8,
      paddingheight: 8,
      backgroundcolor: "FFFFFF"
    });

    const png = await sharp(source)
      .resize({
        width: 900,
        height: 300,
        fit: "contain",
        kernel: "nearest",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Kairen-Mode", ohio ? "OH_AAMVA_V10_2020" : (alaska ? "AK_AAMVA_V10_2020" : "KAIREN_TEST_V3"));
    res.setHeader("X-Kairen-Size", "900x300");
    if (ohio) {
      res.setHeader("X-Kairen-IIN", "636023");
      res.setHeader("X-Kairen-AAMVA-Version", "10");
    }
    if (alaska) {
      res.setHeader("X-Kairen-IIN", "636059");
      res.setHeader("X-Kairen-AAMVA-Version", "10");
    }
    return res.end(png);
  } catch (err) {
    res.statusCode = 400;
    return res.end("Error generando PDF417: " + err.message);
  }
};
