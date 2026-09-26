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
    if (profile !== "AK") throw new Error("El barcode automatico esta habilitado para Alaska (AK).");

    // Alaska: el dato codificado es el mismo INVENTORY visible en Photoshop.
    const inventory = clean(body.inventory || (body.fields && body.fields.DCK))
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!inventory) throw new Error("Falta INVENTORY.");
    if (!/^1000\d{7}$/.test(inventory)) {
      throw new Error("INVENTORY debe tener 11 digitos y comenzar con 1000. Ejemplo: 10001234567");
    }

    // Generar CODE128 SIN texto y SIN padding exterior.
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

    // Alaska: queremos un lienzo VERTICAL, pero con las barras en sentido
    // HORIZONTAL (como la referencia de Photoshop). Para evitar que el
    // redimensionado vuelva a dejar barras verticales, primero formamos el
    // barcode en LANDSCAPE y SOLO AL FINAL lo giramos 90 grados.
    // Objetivo final: 9.99 x 21.12 mm a 600 ppp ~= 236 x 499 px.
    const landscape = await sharp(source)
      .trim({
        background: { r: 255, g: 255, b: 255 },
        threshold: 8
      })
      .resize({
        width: 495,
        height: 232,
        fit: "fill",
        kernel: "nearest"
      })
      .png()
      .toBuffer();

    const png = await sharp(landscape)
      .rotate(90, { background: { r: 255, g: 255, b: 255, alpha: 1 } })
      // Margen minimo de 2 px por lado, sin el lienzo blanco enorme.
      .extend({
        top: 2,
        bottom: 2,
        left: 2,
        right: 2,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .resize({
        width: 236,
        height: 499,
        fit: "fill",
        kernel: "nearest"
      })
      .png()
      .toBuffer();

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Kairen-Barcode", "CODE128");
    res.setHeader("X-Kairen-Profile", "AK");
    res.setHeader("X-Kairen-Size", "236x499-HORIZONTAL-BARS");
    return res.end(png);
  } catch (err) {
    res.statusCode = 400;
    return res.end("Error generando BARCODE: " + err.message);
  }
};
