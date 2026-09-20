const bwipjs = require("bwip-js");

const PROFILE_IIN = {
  CO: "636020",
  AZ: "636026"
};

const FIELD_ORDER = [
  "DCA","DCB","DCD","DBA","DCS","DAC","DAD","DBD","DBB","DBC",
  "DAY","DAU","DAG","DAI","DAJ","DAK","DAQ","DCF","DCG","DDE",
  "DDF","DDG","DAW","DAZ","DDA","DDB","DDK","DDL"
];

function clean(v) {
  return String(v == null ? "" : v).replace(/[\r\n]/g, " ").trim();
}

function pad4(n) {
  let s = String(n);
  while (s.length < 4) s = "0" + s;
  return s;
}

function normalizePostal(v) {
  let s = clean(v).replace(/-/g, "");
  if (s.length > 11) s = s.slice(0, 11);
  while (s.length < 11) s += " ";
  return s;
}

function buildRaw(profile, version, fields) {
  const iin = PROFILE_IIN[profile];
  if (!iin) throw new Error("Perfil AAMVA no configurado todavía: " + profile);

  const f = Object.assign({}, fields || {});
  f.DAJ = profile;
  f.DAK = normalizePostal(f.DAK);
  f.DCG = clean(f.DCG) || "USA";
  f.DDE = clean(f.DDE) || "N";
  f.DDF = clean(f.DDF) || "N";
  f.DDG = clean(f.DDG) || "N";
  f.DCB = clean(f.DCB) || "NONE";
  f.DCD = clean(f.DCD) || "NONE";
  f.DCA = clean(f.DCA) || (profile === "AZ" ? "D" : "R");

  const lines = [];
  FIELD_ORDER.forEach(code => {
    const value = code === "DAK" ? f.DAK : clean(f[code]);
    if (value !== "") lines.push(code + value);
  });

  // Data element separator = LF; segment terminator = CR.
  // With the Colorado/Arizona reference samples this reproduces DL00310250.
  const subfile = "DL" + lines.join("\n") + "\n\r";
  const offset = "0031";
  const length = pad4(subfile.length);
  const header = "@\n\x1e\rANSI " + iin + version + "00" + "01" + "DL" + offset + length;
  return header + subfile;
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
    const version = (clean(body.version) || "10").padStart(2, "0");
    const fields = body.fields || {};

    if (!PROFILE_IIN[profile]) {
      res.statusCode = 400;
      return res.end("Por ahora el payload exacto está configurado para CO y AZ.");
    }

    const raw = buildRaw(profile, version, fields);

    const png = await bwipjs.toBuffer({
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

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Kairen-Profile", profile);
    res.setHeader("X-Kairen-Raw-Length", String(raw.length));
    return res.end(png);

  } catch (err) {
    res.statusCode = 500;
    return res.end("Error generando PDF417: " + err.message);
  }
};
