# KAIREN Form Generator v0.4.4 — Live Preview

Cambio principal:
- El PDF417 del panel Preview se actualiza automáticamente al cambiar cualquier dato.
- Usa debounce de 450 ms al escribir para no saturar la API.
- Botones, selectores y autofill actualizan casi inmediatamente.
- Si Strict está activo y falta un campo requerido, se oculta el código viejo hasta completar los requeridos.
- Si Strict está desactivado, el preview puede actualizarse con datos parciales.
- Se agregó indicador LIVE / UPDATING en el panel Preview.

Conserva Colorado, Arizona y el resto de perfiles de la v0.4.3.
