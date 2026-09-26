# KAIREN Form Generator v0.5.2

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


## v0.5.4 Alaska UX
- DDK, DDL y DDD muestran Yes/No en la interfaz, conservando 1/0 internamente.
- DDA muestra Yes/No con etiquetas legibles y conserva F/N internamente.
- Boton global Alaska al azar y botones Al azar por campo.
- Historial local en el navegador para evitar repetir DAQ/DCF/DCK en esa PC.
- Audit Information es interno y no se incluye en el payload PDF417.
