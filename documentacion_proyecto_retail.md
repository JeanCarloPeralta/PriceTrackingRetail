# Documentación del Proyecto: Plataforma de Inteligencia Competitiva Retailer

## 1. Explicación del Proyecto
El proyecto de **Inteligencia Competitiva (Retailer Dashboard)** nació bajo la necesidad de mantener un seguimiento y control de precios estricto en la industria del retail costarricense. El objetivo principal es ofrecer una solución de inteligencia de negocios que le permita a la compañía monitorear los datos de productos comerciales de supermercados masivos de manera ágil, limpia y altamente visual. 

El sistema consolida el catálogo de tres competidores clave: **Walmart, Masxmenos y Auto Mercado**. Al comparar los productos utilizando su Código Universal (UPC), la plataforma permite revelar automáticamente márgenes de diferencia (gaps) porcentuales y absolutos, graficar tendencias de precio históricas, e identificar rápidamente productos huérfanos o exclusivos por cada cadena de supermercado. Todo esto dentro de una interfaz extremadamente rápida, minimalista y libre de fricciones.

---

## 2. Lo que Desarrollamos (Desarrollo del Proyecto)
Partiendo de un modelo conceptual estático, se migró y elevó la aplicación hacia una arquitectura moderna, escalable y alojada en la nube:
1. **Migración a Base de Datos en Tiempo Real**: Integramos las listas y registros pasados a Google Firebase Firestore, permitiendo que la web lea datos dinámicos 100% en la nube.
2. **Panel Interactivo (Dashboard)**: Desarrollamos una vista principal (Study View) donde los artículos se agrupan matemáticamente por UPC para presentarse hombro a hombro, calculando automáticamente su brecha de competitividad frente al precio base (Masxmenos).
3. **Auditoría de UPC**: Se introdujo una herramienta de "Modo de Auditoría" en vista de lista para identificar productos que fallaban en la coincidencia o no tenían un origen claro.
4. **Buscador Inteligente Combinado ("Fuzzy Search")**: Implementamos una barra de filtrado capaz de detectar coincidencias compuestas (ej. *"arroz 500g"*) ignorando el orden de las palabras, o realizando la búsqueda cruzando identificadores exactos de códigos de barra (UPC) instantáneamente.
5. **Generador de Historial Multi-Tabla**: Al abrir los historiales, en lugar de mostrar filas aisladas, se diseñó un "Modal Popup" expansivo que reconstruye las tablas comparativas de fluctuación temporal de cada supermercado.

---

## 3. Pila Tecnológica (Herramientas y Tecnologías)

*   **Frontend Framework**: React.js con Vite (Garantiza una compilación y Hot-Module-Replacement ultrarrápido).
*   **Estilos y UI**: Tailwind CSS (Utilizado para construir la estructura de Modo Claro Minimalista, grids automatizados y comportamientos "responsive").
*   **Base de Datos NoSQL**: Firebase Firestore (Almacenamiento de matrices masivas con los objetos json).
*   **Hosting y Despliegue**: Firebase Hosting. La página pública `pulperia-m-9137d.web.app` se reconstruye y despliega con simples comandos remotos.
*   **Visualización de Datos**: `recharts` (Utilizado para dibujar la métrica lineal del gap histórico porcentual).
*   **Automatización de Servidores**: GitHub Actions (Para ejecutar scripts silenciosos y gratuitos semanalmente sin tener un servidor alquilado).

---

## 4. Estrategia y Pipeline de Scraping de Productos

Para alimentar de manera automatizada esta plataforma, el mecanismo de Scrapping (Extracción de Datos) opera como el motor oculto capaz de nutrir a nuestra base:

1. **Automatización de Ejecuciones**: En el actual diseño, se integró un pipeline (flujo) usando **GitHub Actions**. Todos los lunes a primera hora (6:00 AM), el motor de GitHub enciende contenedores Linux desechables de manera gratuita y ejecuta los motores de rescate de datos.
2. **Normalización y Limpieza de Atributos**: Un problema central del Scraping masivo es la "basura" de texto crudo (`raw text`). Modificamos la ingesta para que los textos detecten guiones (`-`) y remuevan las basuras lógicas, extrayendo las presentaciones (Ej. "500g", "1L") de los títulos de forma nativa para estandarizar los tableros.
3. **Envío Bidireccional**: Después de extraer y recolectar las matrices de Supermercados, el script se comunica vía llaves de autenticación de seguridad remota con Firebase, empujando la recopilación en vivo y generando `TimeStamps` (`scrapedAt`) en cada línea de producto.

---

## 5. Retos Encontrados y Soluciones Clave

Durante el desarrollo intenso enfrentamos desafíos técnicos y de negocio sumamente estrictos que se resolvieron mediante reestructuración arquitectónica algorítmica:

*   **🔴 Congelamiento de Rendimiento (Bloqueo de DOM)**:
    *   *El Problema*: La interfaz se congelaba al escribir en el buscador o realizar un clic, debido a que el sistema React intentaba dibujar 5,000 nodos (imágenes, textos, recuadros SVG) de forma simultánea instantáneamente en una sola ejecución nativa.
    *   *La Solución*: Introducimos **Debouncing** (Pausador de ejecuciones lógicas en 300 milisegundos tras teclear) y **Paginación Infinita** en los tableros (Solo dibujamos componentes web de 60 en 60 o de 100 en 100), eliminando todo el lag y salvando la Memoria RAM del explorador.
*   **🔴 Cruces de UPC Huérfanos y de Estructura**:
    *   *El Problema*: Si un producto existía únicamente en Auto Mercado, la tarjeta de comparación gigante fallaba, provocando huecos asimétricos gigantes en el tablero. 
    *   *La Solución*: Reemplazamos los "CSS Flexboxes" estrictos por un modelo de Grillas automáticas híbridas (`grid grid-cols-2`), de esa manera las comparaciones respetan si tienen un elemento, dos o tres alineados.
*   **🔴 Componentes Intrusivos y Errores Multi-Clic**:
    *   *El Problema*: Intentar seleccionar el código numérico para "copiar y pegar" causaba que se activaran ventanas superpuestas (Modales Históricos) destruyendo la experiencia.
    *   *La Solución*: Interceptamos la propagación de eventos sobre los pequeños bloques grises (`e.stopPropagation()`). Esto separó limpiamente el evento estético "click-to-copy" del evento madre del modal general.

---

## 6. Explicación Técnica y Arquitectónica Detallada

La espina dorsal de esta herramienta se encuentra principalmente alojada en el `Dashboard.jsx` y su enrutador al `ProductGrid.jsx`. 

La arquitectura transcurre de la siguiente manera:
1. **Fetch & Data Payload (Obtención de Datos)**: Al abrir la aplicación, Firebase envía al `useState` de React una matriz de objetos gigantesca (el `array` de productos). Contamos por ende con un archivo de respaldo asíncrono (`products.json` fallback) en el que la aplicación aterriza en caso extremo de que exista una denegación de red o Firestore caiga, logrando una app tolerante a fallos.
2. **Pipeline de Filtros En Cascada**: Los productos obtenidos (`products`) fluyen internamente a través de un `useMemo` dinámico. El `useMemo` evalúa por orden jerárquico el supermercado (Store Filter) -> Categoria (Category Filter) -> y Terminos de búsqueda divididos. Solo se recalcula matemáticamente este proceso al oprimir botones superficiales, evitando el derroche de memoria excesivo en cada simple cambio.
3. **Generador de Comparaciones Estocásticas**: Una vez filtrados los productos autorizados, el paquete se envía al `ProductGrid`. La herramienta pasa estos datos sueltos por un mapa asociativo dinámico que evalúa las coincidencias de código de barras. Si dos o más tiendas (Walmart, Auto Mercado, MxM) chocan en la misma huella de UPC para la recolección, el sistema virtualmente los fusiona, despachando un envoltorio "ComparisonCard" en vez de las tarjetas pasivas aisladas ("SingleCard"). Enlaza internamente a "Masxmenos" matemáticamente y usa su flotante nativo de Precio como prop (`baselinePrice`) para instruir a la tarjeta paritaria que extraiga sus métricas porcentuales al vuelo con relación a esta base.

En resumen, la convergencia exitosa de herramientas (React + Firebase + Tailwind) permite un costo de mantenimiento **$0 (Servidor Local/Cloud Function Gratuita Integrada)** con una elasticidad y disponibilidad global de primera línea altamente ejecutiva para tomar decisiones críticas e inmediatas sobre el entorno del retail.
