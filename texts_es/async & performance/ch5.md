````markdown
# You Don't Know JS: Async & Performance
# Capítulo 5: Rendimiento del Programa

Hasta ahora este libro se ha centrado en cómo aprovechar patrones de asincronía de forma más efectiva. Pero no hemos abordado directamente por qué la asincronía importa realmente en JS. La razón más obvia y explícita es el **rendimiento**.

Por ejemplo, si tienes dos peticiones Ajax independientes y necesitas esperar a que ambas terminen antes de continuar, tienes dos opciones de modelado: serial y concurrente.

Puedes hacer la primera petición y esperar a que termine para iniciar la segunda. O, como hemos visto con Promesas y generadores, puedes lanzar ambas peticiones "en paralelo" y usar una "compuerta" (gate) para esperar a ambas antes de seguir.

Evidentemente, la segunda opción suele ser más eficiente. Y mejor rendimiento generalmente conduce a una mejor experiencia de usuario.

Incluso es posible que la asincronía (concurrencia entrelazada) mejore únicamente la percepción del rendimiento, aunque el programa tarde igual en completarse. La percepción del usuario es tan importante —o más— que el tiempo medible real.

Ahora pasaremos de patrones locales de asincronía a tratar detalles de rendimiento a nivel de programa.

**Nota:** Puede que te preguntes por micro-optimizaciones como si `a++` o `++a` es más rápido. Esas cuestiones las veremos en el siguiente capítulo sobre "Benchmarking y Afinado".

## Web Workers

Si tienes tareas intensivas en CPU que no quieres ejecutar en el hilo principal (porque ralentizarían la UI), habrás deseado poder ejecutar JavaScript en múltiples hilos.

En el Capítulo 1 explicamos que JavaScript es (en esencia) de un solo hilo. Eso sigue siendo cierto. Pero una única hebra no es la única forma de organizar la ejecución.

Imagina dividir tu programa en dos partes, ejecutar una en el hilo principal y la otra en un hilo completamente separado.

¿Qué implicaciones tendría esa arquitectura?

Primero, querrías saber si el código en el hilo separado corre en paralelo (en máquinas con múltiples núcleos) y, por tanto, un proceso largo en el segundo hilo **no** bloquearía el hilo principal. Si no fuera así, la "hila virtual" no aportaría beneficio frente a la concurrencia asincrónica habitual.

También querrías saber si ambos trozos de programa comparten el mismo scope/recursos. Si compartieran, tendrías que lidiar con problemas típicos de lenguajes multihilo (bloqueos, mutexes, condiciones de carrera), lo cual complica mucho las cosas.

Alternativamente, si no comparten, te interesa cómo se comunican entre sí.

Todas estas preguntas son relevantes para la característica añadida al navegador (HTML5) llamada "Web Workers". Es una característica del entorno anfitrión (el navegador), más que del lenguaje JS en sí: JavaScript no incorpora por sí mismo primitivas de threading.

Un entorno como el navegador puede crear múltiples instancias del motor JS, cada una en su propio hilo, y ejecutar un programa distinto en cada hilo. Cada una de esas piezas es un "(Web) Worker". Este paralelismo se denomina "task parallelism" (paralelismo por tareas), porque dividimos el programa en tareas que pueden correr en paralelo.

Desde el programa principal (o desde otro Worker) se instancia un Worker así:

```js
var w1 = new Worker( "http://some.url.1/mycoolworker.js" );
```

La URL apunta a un archivo JS (no a una página HTML) que será cargado en el Worker. El navegador levantará un hilo separado y ejecutará ese archivo como un programa independiente.

**Nota:** Este tipo de Worker se llama "Dedicated Worker". También puedes crear un "Inline Worker" usando un Blob URL, pero los Blobs quedan fuera del alcance de esta discusión.

Los Workers no comparten scope ni recursos con la página o con otros Workers; eso evitaría los problemas clásicos de programación multihilo. En su lugar existe un mecanismo básico de mensajería por eventos.

El objeto `w1` permite escuchar eventos enviados desde el Worker y enviarle mensajes:

```js
w1.addEventListener( "message", function(evt){
    // evt.data
} );

w1.postMessage( "algo interesante" );
```

Dentro del Worker la mensajería es simétrica:

```js
// mycoolworker.js

addEventListener( "message", function(evt){
    // evt.data
} );

postMessage( "una respuesta genial" );
```

Un Dedicated Worker mantiene una relación uno-a-uno con quien lo creó, por lo que los mensajes no requieren desambiguación adicional. Un Worker puede incluso crear sus propios subworkers (Workers hijos), aunque el soporte de navegadores varía.

Para terminar un Worker abruptamente desde el programa que lo creó, llama a `terminate()` sobre el objeto Worker. Eso no da oportunidad al Worker de limpiar recursos: es equivalente a cerrar una pestaña del navegador.

**Nota:** Aunque parece que un programa malicioso podría crear cientos de Workers y saturar el sistema, el navegador no está obligado a crear un hilo real por cada Worker. El sistema decide cuántos hilos asignar; lo seguro es no asumir más que un hilo adicional garantizado.

### Entorno del Worker

Dentro del Worker no tienes acceso a los recursos del programa principal: ni a sus variables globales ni al DOM. Es un contexto totalmente separado.

Sin embargo, puedes realizar operaciones de red (Ajax, WebSockets) y temporizadores. Además dispones de globals como `navigator`, `location`, `JSON` y `applicationCache` en tu propio contexto.

Puedes cargar scripts adicionales dentro del Worker con `importScripts(..)`, que se ejecuta de forma síncrona y bloquea la ejecución del Worker hasta que los scripts se carguen y ejecuten:

```js
importScripts( "foo.js", "bar.js" );
```

**Nota:** Hay propuestas y discusiones sobre exponer `<canvas>` y Transferables a Workers para permitir procesamiento gráfico fuera del hilo UI. Aunque no está ampliamente disponible todavía, es un posible camino a futuro.

Usos habituales de los Web Workers:

* Cálculos matemáticos intensivos
* Ordenación de grandes conjuntos de datos
* Operaciones con datos (compresión, análisis de audio, manipulación de píxeles)
* Comunicaciones de red de alto tráfico

### Transferencia de datos

Muchas de esas tareas implican mover grandes cantidades de datos entre hilos. Al principio sólo existía la serialización a string, lo que era lento y duplicaba memoria.

Hoy existen mejores opciones:

* Clonado estructurado (Structured Cloning): copia compleja y robusta (soporta referencias cíclicas). Reduce el coste de convertir a string, pero sigue duplicando memoria.
* Objetos transferibles (Transferable Objects): transfieren la "propiedad" del buffer sin copiar los datos. El objeto transferido queda inaccesible en el origen.

Typed arrays como `Uint8Array` son transferibles. Ejemplo de envío con `postMessage`:

```js
// `foo` es un Uint8Array
postMessage( foo.buffer, [ foo.buffer ] );
```

El primer parámetro es el valor y el segundo es la lista de objetos a transferir. Navegadores sin soporte degradan a clonado estructurado.

### Shared Workers

Si tu app abre múltiples pestañas de la misma página, puede interesarte evitar duplicar Workers. Un `SharedWorker` permite a varias instancias de página compartir un único Worker:

```js
var w1 = new SharedWorker( "http://some.url.1/mycoolworker.js" );
```

La comunicación usa un `port` para identificar la conexión:

```js
w1.port.addEventListener( "message", handleMessages );
w1.port.postMessage( "algo" );
w1.port.start();
```

En el Worker compartido se atiende el evento `connect`, que entrega el `port` para esa conexión:

```js
addEventListener( "connect", function(evt){
    var port = evt.ports[0];

    port.addEventListener( "message", function(evt){
        // ..
        port.postMessage( .. );
    } );

    port.start();
} );
```

Los Shared Workers sobreviven al cierre de un `port` si hay otras conexiones vivas; los Dedicated Workers terminan cuando se cierra su conexión.

### Polyfill de Web Workers

Si necesitas soportar navegadores antiguos sin Workers, puedes simularlos parcialmente, pero no replicarás el paralelismo real. Iframes no son suficiente porque suelen correr en el mismo hilo.

Puedes usar timers (`setTimeout(..)`) para asíncronizar y proveer una API similar a Workers. Hay polyfills y bocetos, pero no hay una solución perfecta para emular threading real.

## SIMD

SIMD (Single Instruction, Multiple Data) es una forma de "paralelismo de datos": en vez de paralelizar tareas, se procesan muchos elementos de datos en paralelo mediante operaciones vectoriales a nivel de CPU.

La iniciativa de exponer SIMD a JS ha sido impulsada por Intel y equipos de navegador. SIMD propone tipos vectoriales (por ejemplo `float32x4`) y operaciones que, en hardware compatible, se traducen a instrucciones CPU vectoriales.

Ejemplo de uso preliminar:

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

SIMD.float32x4.mul( v1, v2 );
```

Los beneficios son evidentes para aplicaciones intensivas en datos (análisis de señales, matrices para gráficos, etc.). Existen "prollyfills" que ilustran la API propuesta.

## asm.js

"asm.js" (http://asmjs.org/) es un subconjunto de JavaScript altamente optimizable. Evitando patrones difíciles de optimizar (coerciones, gestión dinámica de memoria), el motor JS puede detectar código asm.js y aplicarle optimizaciones agresivas.

asm.js no requiere nueva sintaxis; la idea es que sea un objetivo de compilación desde lenguajes como C/C++ (p. ej. mediante Emscripten).

### Cómo optimizar con asm.js

La optimización gira en torno al manejo de tipos y coerciones. Si el motor entiende que una variable es siempre un entero de 32 bits, puede omitir seguimientos de coerción y optimizar mejor.

Un truco común es forzar coerciones bitwise para indicar tipos, por ejemplo:

```js
var b = a | 0;     // fuerza 32-bit int
(a + b) | 0;       // suma como entero de 32-bit
```

### Módulos asm.js

Para evitar costes de asignación y GC se adopta un patrón de módulo asm.js: pasar un `stdlib` limitado y un "heap" prereservado (un `ArrayBuffer`) para almacenamiento sin asignaciones dinámicas.

Ejemplo simplificado de módulo asm.js (ilustrativo):

```js
function fooASM(stdlib,foreign,heap) {
    "use asm";

    var arr = new stdlib.Int32Array( heap );

    function foo(x,y) {
        x = x | 0;
        y = y | 0;
        var i = 0;
        var p = 0;
        var sum = 0;
        var count = ((y|0) - (x|0)) | 0;

        for (i = x | 0;
            (i | 0) < (y | 0);
            p = (p + 8) | 0, i = (i + 1) | 0
        ) {
            arr[ p >> 3 ] = (i * (i + 1)) | 0;
        }

        for (i = 0, p = 0;
            (i | 0) < (count | 0);
            p = (p + 8) | 0, i = (i + 1) | 0
        ) {
            sum = (sum + arr[ p >> 3 ]) | 0;
        }

        return +(sum / count);
    }

    return {
        foo: foo
    };
}

var heap = new ArrayBuffer( 0x1000 );
var foo = fooASM( window, null, heap ).foo;
```

El código asm.js suele ser generado por compiladores; escribirlo a mano es tedioso y propenso a errores.

## Revisión

Los cuatro primeros capítulos parten de la idea de que los patrones asincrónicos permiten escribir código más eficiente. Pero la asincronía sola está limitada por funcionar sobre un único event loop.

En este capítulo hemos visto mecanismos a nivel de programa para mejorar el rendimiento:

* Web Workers: ejecutar ficheros JS en hilos separados y comunicar mediante mensajes.
* SIMD: operaciones vectoriales a nivel CPU para paralelismo de datos.
* asm.js: subconjunto JS altamente optimizable para cargas de trabajo numéricas intensivas.

Existen otras propuestas experimentales que buscan introducir más paralelismo en JavaScript. Sea mediante APIs o soporte interno, el futuro del rendimiento a nivel de programa en JS es prometedor.

````
