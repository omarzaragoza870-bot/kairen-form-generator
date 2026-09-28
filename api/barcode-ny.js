const bwipjs = require("bwip-js");
const sharp = require("sharp");

function clean(v) {
  return String(v == null ? "" : v).replace(/[\r\n|]/g, " ").trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("POST only");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const raw = clean(
      body.codigoInferior ||
      body.value ||
      body.inventory ||
      (body.fields && (body.fields.CODIGO_INFERIOR || body.fields.codigoInferior))
    );

    const value = raw.replace(/[^0-9]/g, "");
    if (!/^[0-9]{16}$/.test(value)) {
      throw new Error("CODIGO INFERIOR NY debe contener 16 digitos: 5 + 9 + 2.");
    }

    const source = await bwipjs.toBuffer({
      bcid: "code128",
      text: value,
      scale: 4,
      height: 18,
      includetext: false,
      paddingwidth: 0,
      paddingheight: 0,
      backgroundcolor: "FFFFFF"
    });

    const png = await sharp(source)
      .trim({
        background: { r: 255, g: 255, b: 255 },
        threshold: 8
      })
      .resize({
        width: 900,
        height: 180,
        fit: "contain",
        kernel: "nearest",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("X-Kairen-Barcode", "CODE128");
    res.setHeader("X-Kairen-Profile", "NY");
    res.setHeader("X-Kairen-Source", "CODIGO-INFERIOR");
    res.setHeader("X-Kairen-Size", "900x180");
    return res.end(png);
  } catch (err) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end("Error generando BARCODE NY: " + err.message);
  }
};
