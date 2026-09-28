# KAIREN Form Generator v0.8.0

## New York (NY)
- Perfil NY V10 agregado al endpoint `POST /api/generate`.
- Basado exclusivamente en el primer payload NY proporcionado para este proyecto.
- IIN: `636001`.
- Jurisdiction Version: `04`.
- Un solo subarchivo `DL` (`01`).
- Encabezado dinamico: `ANSI 636001100401DL0031LLLL`.
- Orden NY: `DCA DCB DCD DBA DCS DAC DAD DBD DBB DBC DAY DAU DAG DAI DAJ DAK DAQ DCF DCG DDE DDF DDG DDA DDB DDK DDL`.
- `DAQ` exige 9 digitos.
- Se omiten del perfil NY los campos que no aparecen en la muestra: `DCU`, `DAH`, `DAW`, `DAZ`, `DCK` y `DDD`.
- Anchuras fijas reproducidas desde la muestra: `DCA=4`, `DCB=10`, `DCS/DAC/DAD/DAG=25`, `DAI=20`, `DAK=11`.
- Con el preset NY incluido, el subarchivo mide exactamente `0331` bytes y genera el encabezado `ANSI 636001100401DL00310331`.
- `Autofill demo` carga los valores del primer ejemplo NY.
- No se incluye el segundo ejemplo con subarchivo `ZN`.

## California (CA)
- Perfil CA V10 agregado al endpoint `POST /api/generate`.
- IIN configurado: `636014`.
- Encabezado dinamico `ANSI 636014100001DL0031LLLL`.
- Orden de campos CA incluye `DCK` despues de `DCG`.
- `DDE`, `DDF` y `DDG` se calculan automaticamente: `T` solo cuando el nombre correspondiente supera 40 caracteres y se recorta para el payload; de lo contrario `N`.
- `DAK` se rellena a 11 caracteres unicamente en el payload.
- El perfil CA ya no usa `KAIREN_TEST_V3`; ahora genera payload CA V10.
- `POST /api/barcode` acepta CA y genera CODE128 usando `DCK / INVENTORY` (17 caracteres alfanumericos).
- Salida CODE128 CA: 900 x 180 px, barras verticales, sin texto.

Cambios:
- Perfil Alaska (AK) V10 / referencia 2020 agregado al generador.
- IIN configurado: 636059.
- Encabezado dinámico `ANSI 636059100001DL0031LLLL`.
- DAK se rellena a 11 caracteres únicamente en el payload.
- Autofill de Alaska reproduce el ejemplo suministrado.
- Ohio conserva su configuración anterior.
- Los demás perfiles continúan usando el payload interno de prueba.

Salida PDF417: PNG 900x300.


## Alaska - barcode 1D automatico

- Endpoint: `POST /api/barcode`
- Simbologia: Code 128.
- El valor codificado es el mismo `INVENTORY` del formulario.
- La carga manual sigue disponible en el JSX como respaldo.


## v0.5.6 Alaska UX
- DDK, DDL y DDD muestran Yes/No en la interfaz, conservando 1/0 internamente.
- DDA muestra Yes/No con etiquetas legibles y conserva F/N internamente.
- Boton global Alaska al azar y botones Al azar por campo.
- Historial local en el navegador para evitar repetir DAQ/DCF/DCK en esa PC.
- Audit Information es interno y no se incluye en el payload PDF417.

- Alaska: ISS aleatorio siempre es posterior al cumpleanos 21 y anterior a hoy.
- Alaska: EXP se calcula como 08/07 del anio de ISS + 8.

- Alaska: EXP debe quedar como minimo 1 anio despues de la fecha actual.


## Cambio v0.5.7
- El CODE128 de Alaska se genera sin texto legible debajo; solo se renderizan las barras.


## Alaska - formatos v0.5.8
- INVENTORY: exactamente 11 digitos, siempre inicia con `1000` (ej. `10001234567`).
- DD / DCF: `7 digitos + espacio + 9 digitos + VSI-0` (ej. `4744645 083845817VSI-0`).
- CODE128 sigue usando el mismo INVENTORY y se genera sin texto humano debajo.


## Alaska PDF417 tight crop
- El PDF417 de Alaska se recorta al contenido, sin margen blanco sobrante.
- Salida objetivo: 1078 x 319 px (45.64 x 13.50 mm a 600 ppp).
- El propio PDF417 llena todo el lienzo de salida.

## Alaska Barcode tight vertical
- CODE128 sin texto y sin padding exterior.
- Se recorta al contenido y se gira 90 grados.
- Salida objetivo: 236 x 499 px (9.99 x 21.12 mm a 600 ppp).
- El barcode ocupa practicamente todo el lienzo de salida.

## Alaska barcode v0.6.3
- Lienzo final: 236 x 499 px (aprox. 9.99 x 21.12 mm a 600 ppp).
- El lienzo permanece vertical.
- Solo el simbolo CODE128 se gira 90 grados para que las barras queden horizontales.
- Sin texto debajo y sin margen exterior agregado.
