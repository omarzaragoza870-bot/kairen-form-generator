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
    const profile = clean(body.profile).toUpperCase();
    if (profile !== "AK" && profile !== "CA" && profile !== "NY") {
      throw new Error("El barcode automatico esta habilitado para Alaska (AK), California (CA) y New York (NY).");
    }

    const inventory = clean(
      profile === "NY"
        ? (body.codigoInferior || body.value || body.inventory || (body.fields && body.fields.CODIGO_INFERIOR))
        : (body.inventory || (body.fields && body.fields.DCK))
    )
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!inventory) throw new Error(profile === "NY" ? "Falta CODIGO INFERIOR." : "Falta INVENTORY / DCK.");
    if (profile === "AK" && !/^1000\d{7}$/.test(inventory)) {
      throw new Error("INVENTORY AK debe tener 11 digitos y comenzar con 1000. Ejemplo: 10001234567");
    }
    if (profile === "CA" && !/^[A-Z0-9]{17}$/.test(inventory)) {
      throw new Error("DCK / INVENTORY CA debe tener 17 caracteres alfanumericos.");
    }
    if (profile === "NY" && !/^[0-9]{16}$/.test(inventory)) {
      throw new Error("CODIGO INFERIOR NY debe contener 16 digitos: 5 + 9 + 2.");
    }

    // 1) CODE128 normal: imagen apaisada con barras VERTICALES.
    const source = await bwipjs.toBuffer({
      bcid: "code128",
      text: inventory,
      scale: 4,
      height: 18,
      includetext: false,
      paddingwidth: 0,
      paddingheight: 0,
      backgroundcolor: "FFFFFF"
    });

    let pipeline = sharp(source).trim({
      background: { r: 255, g: 255, b: 255 },
      threshold: 8
    });

    if (profile === "AK") {
      // Alaska conserva el formato estable vertical con barras horizontales.
      pipeline = pipeline
        .rotate(90, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .resize({ width: 236, height: 499, fit: "fill", kernel: "nearest" });
    } else {
      // California y New York usan CODE128 apaisado con barras verticales.
      pipeline = pipeline.resize({
        width: 900,
        height: 180,
        fit: "contain",
        kernel: "nearest",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });
    }

    const png = await pipeline.png().toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("X-Kairen-Barcode", "CODE128");
    res.setHeader("X-Kairen-Profile", profile);
    res.setHeader("X-Kairen-Orientation", profile === "AK" ? "PORTRAIT-CANVAS-HORIZONTAL-BARS" : "LANDSCAPE-CANVAS-VERTICAL-BARS");
    res.setHeader("X-Kairen-Size", profile === "AK" ? "236x499" : "900x180");
    return res.end(png);
  } catch (err) {
    res.statusCode = 400;
    return res.end("Error generando BARCODE: " + err.message);
  }
};
