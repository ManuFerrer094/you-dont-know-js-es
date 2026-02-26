````markdown
# You Don't Know JS: Async & Performance
# Capítulo 6: Benchmarking y Afinado

Los primeros cuatro capítulos de este libro han tratado el rendimiento como un patrón de programación (asincronía y concurrencia), y el Capítulo 5 abordó el rendimiento a nivel de arquitectura del programa. Este capítulo va al detalle del rendimiento a nivel micro, centrado en expresiones y sentencias individuales.

Una de las áreas de mayor curiosidad —y donde algunos desarrolladores se obsesionan— es analizar y probar distintas formas de escribir una línea o bloque de código para ver cuál es más rápida.

Veremos algunos de esos asuntos, pero es importante entender desde el principio que este capítulo **no** pretende alimentar la obsesión por micro-optimizar hasta el extremo (por ejemplo, si `++a` es más rápido que `a++`). El objetivo más importante es saber qué tipos de rendimiento importan y cuáles no, y **cómo distinguirlos**.

Antes de eso, necesitamos explorar cómo medir rendimiento con la mayor precisión y fiabilidad posible, porque hay montones de ideas erróneas y mitos repartidos por la comunidad. Tenemos que separar ese ruido para encontrar claridad.

## Benchmarking

Para empezar a desmontar mitos: la mayoría de desarrolladores, si les pides hacer un benchmark rápido, probablemente hagan algo como esto:

```js
var start = (new Date()).getTime(); // o `Date.now()`

// realizar operación

var end = (new Date()).getTime();
console.log( "Duration:", (end - start) );
```

Si levantaste la mano, no te culpo; **todos hemos hecho eso**. Pero hay mucho de malo en ese enfoque.

¿Qué te dice realmente esa medición? Muy poco. Si el `Duration` sale `0`, podrías pensar que la operación tomó menos de un milisegundo; en realidad, el temporizador puede tener poca resolución (p. ej. 15 ms en sistemas Windows antiguos) y devolver `0` con frecuencia.

Además, esa única ejecución puede estar afectada por interferencias del sistema (GC, scheduling, interrupts) y no representa la variabilidad ni la distribución de tiempos. Un solo valor no te da confianza estadística sobre el rendimiento real.

Por tanto: una medición aislada es básicamente inútil y puede dar una falsa sensación de certeza.

### Repetición

Una mejora común es repetir la operación muchas veces en un bucle y dividir el tiempo total entre el número de iteraciones. Eso ayuda, pero no es suficiente por sí solo.

Las medias pueden estar sesgadas por outliers; por eso necesitas tomar múltiples muestras, calcular estadísticas (varianza, desviación estándar, margen de error) y entender la distribución de los resultados.

Además, el tiempo que debes ejecutar para obtener confianza depende de la precisión del temporizador. Si el temporizador tiene 15 ms de resolución, necesitas ejecutar ciclos más largos para reducir el error porcentual (p. ej. ~750 ms para tener <1% de error). Un temporizador de 1 ms necesitaría ~50 ms por ciclo para similar confianza.

Y aun así, necesitas muchas muestras para promediar y obtener intervalos de confianza fiables. En resumen: benchmarking serio necesita metodología estadística.

### Benchmark.js

Un benchmark válido debe apoyarse en prácticas estadísticas sólidas. No vamos a impartir un curso de estadística aquí, así que recurre a la gente que ya lo hizo bien: John-David Dalton y Mathias Bynens crearon Benchmark.js (http://benchmarkjs.com/), una herramienta pensada justamente para ejecutar benchmarks con rigor.

Benchmark.js gestiona los ciclos, la recolección de muestras y te ofrece métricas útiles (`hz` operaciones por segundo, `stats.moe` margen de error, `stats.variance`, etc.). Para comparar alternativas conviene usar una `Suite` y ejecutar tests en competencia.

Además, Benchmark.js puede ejecutarse tanto en el navegador como en entornos no navegadores (Node.js), por lo que es útil reproducir pruebas en distintos entornos.

Un aspecto importante son las opciones `setup` y `teardown`, que permiten preparar y limpiar el entorno entre ciclos de pruebas. Ojo: `setup` y `teardown` se ejecutan al inicio y final de *cada ciclo exterior*, no en cada iteración interna; eso es crucial porque puede inducir efectos secundarios no deseados si no lo entiendes.

Por ejemplo, si en `setup` inicializas `var a = "x";` y en la prueba haces `a = a + "w";`, `a` crecerá durante todo el ciclo y cada iteración verá una cadena más larga, lo que sesgará los resultados.

### Reglas prácticas

* Usa bibliotecas probadas (Benchmark.js) en vez de escribir tu propia lógica estadística.
* Ejecuta suficientes muestras y ciclos para obtener márgenes de error aceptables.
* Asegura que `setup`/`teardown` no introduzcan efectos secundarios inadvertidos en las iteraciones.

Si tu enfoque ha sido menos riguroso hasta ahora, es probable que tus "benchmarks" sean poco fiables.

## El contexto manda

No olvides evaluar el contexto de un benchmark. Que X sea más rápido que Y en una prueba aislada no implica que la conclusión sea relevante.

Si X hace 10.000.000 operaciones por segundo (100 ns por operación) y Y hace 8.000.000 ops/s (125 ns por operación), la diferencia por operación es 25 ns. A menos que esa operación se repita millones de veces en un camino crítico, esa diferencia es irrelevante para la experiencia humana o para la mayoría de aplicaciones.

Así que antes de optimizar por una pequeñísima ventaja micro, pregúntate: ¿estoy en un camino crítico que se ejecuta cientos de miles o millones de veces seguidas? Si no, probablemente no vale la pena.

### Optimización de motor

Los motores JS modernos realizan muchas optimizaciones (inlining, eliminación de código muerto, reescritura de bucles, optimizaciones basadas en perfiles, etc.). Por eso, un microbenchmark puede activar optimizaciones locales que no ocurren en tu aplicación real, o viceversa.

Un ejemplo hipotético: comparar `parseInt(..)` vs `Number(..)` podría arrojar resultados inesperados debido a que el motor decide inlining o simplificaciones según los inputs fijos del benchmark.

La lección: prueba sobre código real y en condiciones reales tanto como sea posible.

## jsPerf.com

Benchmark.js es excelente para ejecutar pruebas locales, pero si quieres conclusiones útiles necesitas resultados de múltiples entornos (navegadores de escritorio, móviles, diferentes generaciones de CPU). jsPerf (http://jsperf.com) sirve precisamente para eso: alojar pruebas que cualquier persona puede ejecutar desde su navegador y acumular resultados.

Cuando diseñes un test en jsPerf, documenta claramente la intención, usa `setup`/`teardown` con cuidado y añade casos comparables.

### Sanity check

Hay muchos tests publicados en jsPerf que son defectuosos por asuntos como:

* Repetir bucles dentro de la prueba cuando Benchmark.js ya repite por ti.
* Inicializar variables en la prueba cuando deberían ir en `setup` (lo que provoca crecimiento no deseado entre iteraciones).
* Comparar casos que no realizan exactamente la misma tarea (diferente resultado), lo que invalida la comparativa.

Ejemplo clásico donde las diferencias son irrelevantes o engañosas:

```js
// Caso 1
var x = [];
for (var i=0; i<10; i++) {
    x[i] = "x";
}

// Caso 2
var x = [];
for (var i=0; i<10; i++) {
    x[x.length] = "x";
}

// Caso 3
var x = [];
for (var i=0; i<10; i++) {
    x.push( "x" );
}
```

En muchos benchmarks la diferencia entre estos enfoques es trivial o viene de detalles no relacionados con la intención.

Otro ejemplo clásico es comparar `x.sort()` frente a `x.sort(mySort)` donde `mySort` se declara inline en la prueba: estás midiendo además la creación de la función en cada iteración, lo cual sesga el resultado. Declara `mySort` en `setup` para aislar la diferencia real.

Y lo más importante: si los dos casos no producen el mismo resultado semántico (por ejemplo, orden lexicográfico vs numérico), la prueba es inválida.

## Escribir buenas pruebas

Lo esencial: piensa analíticamente sobre las diferencias entre los casos. Las diferencias no intencionales producen sesgos.

*Documenta la intención* de la prueba (Descripción en jsPerf, comentarios). Aclara qué comparas y por qué.
*Aísla* lo irrelevante en `setup` para sacar el ruido fuera del cronometraje.
*Prueba en contexto*: los microbenchmarks sobre fragmentos mínimos suelen ser menos relevantes que tests que incluyan un contexto realista.

## Microperformance

Habiendo criticado ya la obsesión por microoptimizar, conviene recordar que el código que escribes no siempre es el código que el motor ejecuta: los compiladores y motores pueden reescribir o sustituir tu código internamente.

Por ejemplo, referencias a variables en scopes anidados pueden ser inlineadas si el motor detecta que el valor es constante y no muta en otro lugar. El motor puede decidir sustituir `foo` por `41` en tiempo de compilación si detecta que `foo` solo vale eso en ese contexto.

Otro ejemplo: una función recursiva como `factorial(n)` podría ser optimizada por el motor para reemplazar `factorial(5)` por `120` si detecta el patrón o incluso convertir la recursión en un bucle interno (unrolling, tail-call transformations), por lo que reclamar que una forma sintáctica concreta es más rápida que otra puede ser irrelevante.

Comportamientos como `i++` vs `++i` o cachear `x.length` en bucles suelen ser irrelevantes o contraproducentes en motores modernos. Algunos motores incluso detectan y optimizan patrones comunes como `x.length` sin que tengas que cachearlo manualmente.

### No todos los motores son iguales

Los distintos motores (v8, SpiderMonkey, JavaScriptCore, Chakra) son libres de implementar optimizaciones diferentes. Algunas optimizaciones observadas en un motor pueden no existir en otro, o incluso ser contraproducentes.

Algunas comunidades han optado por codificar para un motor concreto (p. ej. v8) y han obtenido grandes beneficios, pero esa estrategia tiene riesgos: otro motor o una futura versión del mismo motor puede cambiar sus heurísticas.

Históricamente hubo patrones como usar `[].join("")` para concatenar en lugar de `+` que cambiaron de ser recomendación a ser obsoletos cuando los motores optimizaron el `+`.

Por eso, evita hacks permanentes que trabajen alrededor de implementaciones concretas salvo que sea un caso extremo y crítico, y siempre documenta y revisa esas decisiones.

## Panorama general

En vez de obsesionarte con micro-detalles, céntrate en optimizaciones de alto nivel y en identificar los *caminos críticos* de tu aplicación. Si un fragmento está en el camino crítico (se ejecuta muchas veces o afecta directamente la UX), optimízalo; si no, no merece la pena.

Knuth decía que la optimización prematura es la raíz de todos los males, pero su aviso incluía una precisión: optimizar partes **no críticas** es lo que suele ser inútil. Si tu código está en el camino crítico, la optimización no es prematura.

Si optimizas, mide con herramientas robustas y prueba en entornos reales.

## Tail Call Optimization (TCO)

ES6 introdujo una garantía importante relacionada con rendimiento: la optimización de llamadas en cola (Tail Call Optimization, TCO).

Una llamada en cola (tail call) es una llamada a función que ocurre al final de otra función, de modo que una vez que la llamada termina no queda trabajo por hacer salvo devolver su resultado.

Ejemplo:

```js
function foo(x) { return x; }
function bar(y) { return foo( y + 1 ); } // tail call
function baz() { return 1 + bar( 40 ); } // no es tail call
```

Si una llamada está en posición de cola, un motor con TCO puede reutilizar el frame de pila existente en lugar de crear uno nuevo, reduciendo memoria y evitando crecimiento de stack en recursión profunda.

Esto es crítico para algoritmos recursivos: con TCO puedes escribir recursión de cola y no preocuparte por desbordamientos de pila. Por eso ES6 exige soporte para TCO: hace prácticas recursivas factibles y portables en JS.

Ejemplo factorial reescrito para TCO:

```js
function factorial(n) {
    function fact(n,res) {
        if (n < 2) return res;
        return fact( n - 1, n * res );
    }
    return fact( n, 1 );
}

factorial( 5 ); // 120
```

Si la llamada recursiva está en posición de cola, los motores compatibles con ES6 pueden optimizarla para usar O(1) espacio de pila.

## Revisión

Medir correctamente el rendimiento y comparar alternativas requiere metodología rigurosa. Usa herramientas como Benchmark.js y compila resultados en múltiples entornos (jsPerf) para evitar sesgos.

Evita obsesionarte con micro-optimización irrelevante; céntrate en caminos críticos y en pruebas en contexto real. Aprovecha TCO en ES6 para escribir algoritmos recursivos seguros y eficientes cuando corresponda.

````
