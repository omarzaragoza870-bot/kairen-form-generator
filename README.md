# KAIREN PDF417 Generator v0.5.1 — Ohio V10

## Ohio
- Perfil por defecto: **Ohio (OH)**.
- Versión: **10 / AAMVA 2020**, según el payload de referencia proporcionado.
- IIN configurado: **636023**.
- Encabezado base: `ANSI 636023100001DL0031LLLL`, donde `LLLL` se calcula con la longitud real del subarchivo DL.
- DAK se muestra limpio en la interfaz y se rellena a 11 caracteres únicamente al construir el payload.
- Fechas se normalizan a `MMDDYYYY`.
- Altura acepta `067 IN`, `67`, `5-07` o formatos equivalentes y se normaliza a `067 IN`.
- Demo Ohio reproduce los valores enviados: `DCA=D`, `DAQ=ID137576`, `DAJ=OH`, etc.
- `DDE/DDF/DDG` quedan manuales en Ohio para respetar exactamente el ejemplo proporcionado (`DADQ` + `DDGN`).

## Otros perfiles
Los demás estados conservan el payload interno de prueba `KAIREN_TEST_V3`.

## Salida
- PDF417 PNG: **900 x 300 px**.
- Preview en vivo.
- Endpoint: `POST /api/generate`.
- Salud: `GET /api/health`.

## Vercel
Reemplaza los archivos del repositorio con el contenido de esta carpeta y haz commit. Vercel redeployará automáticamente.
