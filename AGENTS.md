# Instrucciones para los Agentes Codex

-   Ejecuta los tests usando `npm run testCodex --silent` cuando trabajes en la nube (Codex Cloud).
-   Si estás trabajando localmente, ejecuta `npm run test --silent`.
-   Siempre que el usuario pida agregar o modificar código también crea los tests unitarios que chequeen ese código.
-   Cuando se te pida que agregues o mejores los tests, intenta siempre cubrir al menos el 80%, chequeando la salida del resumen de cobertura..
-   Presta especial atención al porcentaje `Branches` del reporte de cobertura e intenta que el mismo esté al menos en el 80%.
-   Analiza siempre el código para detectar componentes que no tenga cobertura y genérale tests para cubrir al menos el 80% de los mismos.
-   Tras cada ejecución de pruebas, revisa la carpeta `coverage/gp-frontend` y, dentro de `lcov-report/index.html`, ordena la tabla por la columna de `Branches` para detectar los archivos con peor porcentaje. Prioriza crear pruebas adicionales para esos archivos hasta que todos superen el 80% de cobertura de ramas y el total del proyecto alcance también ese valor.

## Reglas de estilo

-   Las descripciones de las pruebas (los textos dentro de cada `it`) deben estar escritas en español.
-   Los mensajes de los commits y la descripción del Pull Request también deben estar en español.

## Notas frente a TotalValidator

-   Para validar accesibilidad usa la instalación local de Windows: `C:/Users/pdamo/AppData/Local/TotalValidatorPro/app/CommandLine.bat`.
-   Ejecuta TotalValidator apuntando a `https://gp-frontend-pac-beta.192.168.180.190.nip.io/contratos/<ruta>` para evitar problemas de conexión desde WSL.
-   Guarda los reportes en `total_validator/reports`, copiando `Results/TotalValidator.html` a un archivo por ruta validada.
-   Si TotalValidator falla, revisa el log generado y vuelve a correr la validación tras corregir la causa.

## Notas captura HTML

-   Usa el script `scripts/run-full-cycle.sh` para limpiar capturas previas, generar nuevos HTML, ejecutar Total Validator y crear el resumen automáticamente. Define `GC_BASE_URL` / `GC_LOGIN_USER` / `GC_LOGIN_PASS` si necesitás apuntar a otro entorno.
-   `scripts/capture-html.js` recorre la app en modo headless y guarda los HTML válidos en `total_validator/html_ok` (descartados en `total_validator/html_error`).
-   `scripts/generate-tv-summary.js` construye `total_validator/summary.md` a partir de los reportes estáticos.
-   En PAC Beta (`https://gp-frontend-pac-beta.192.168.180.190.nip.io/contratos`) las credenciales `keycloak/keycloak` funcionan mientras el usuario tenga permisos. Si redirige a otro SSO (`mi-testing.iduruguay.gub.uy`), usa credenciales válidas de ese proveedor.
