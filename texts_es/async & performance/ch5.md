# You Don't Know JS: Async y Rendimiento
# Capítulo 5: Rendimiento del Programa

Este libro hasta ahora ha tratado completamente sobre cómo aprovechar los patrones de asincronía de manera más efectiva. Pero no hemos abordado directamente por qué la asincronía realmente importa para JS. La razón explícita más obvia es el **rendimiento**.

Por ejemplo, si tienes dos peticiones Ajax que hacer, y son independientes, pero necesitas esperar a que ambas terminen antes de realizar la siguiente tarea, tienes dos opciones para modelar esa interacción: en serie y concurrente.

Podrías hacer la primera petición y esperar a iniciar la segunda petición hasta que la primera termine. O, como hemos visto tanto con promises como con generators, podrías hacer ambas peticiones "en paralelo", y expresar la "compuerta" para esperar a que ambas terminen antes de continuar.

Claramente, lo último generalmente va a ser más eficiente que lo primero. Y un mejor rendimiento generalmente conduce a una mejor experiencia de usuario.

Es incluso posible que la asincronía (concurrencia intercalada) pueda mejorar solo la percepción del rendimiento, incluso si el programa en general sigue tardando la misma cantidad de tiempo en completarse. La percepción del usuario sobre el rendimiento es tan importante — ¡si no más! — como el rendimiento real medible.

Ahora queremos ir más allá de los patrones de asincronía localizados para hablar sobre algunos detalles de rendimiento más amplios a nivel de programa.

**Nota:** Puede que te estés preguntando sobre cuestiones de micro-rendimiento como si `a++` o `++a` es más rápido. Veremos ese tipo de detalles de rendimiento en el próximo capítulo sobre "Benchmarking y Ajuste de Rendimiento."

## Web Workers

Si tienes tareas de procesamiento intensivo pero no quieres que se ejecuten en el hilo principal (lo cual podría ralentizar el navegador/UI), podrías haber deseado que JavaScript pudiera operar de manera multihilo.

En el Capítulo 1, hablamos en detalle sobre cómo JavaScript es de un solo hilo. Y eso sigue siendo cierto. Pero un solo hilo no es la única forma de organizar la ejecución de tu programa.

Imagina dividir tu programa en dos partes, y ejecutar una de esas partes en el hilo principal de la UI, y ejecutar la otra parte en un hilo completamente separado.

¿Qué tipo de preocupaciones traería tal arquitectura?

Por un lado, querrías saber si ejecutar en un hilo separado significa que se ejecuta en paralelo (en sistemas con múltiples CPUs/cores) de modo que un proceso de larga duración en ese segundo hilo **no** bloquearía el hilo principal del programa. De lo contrario, el "threading virtual" no sería de mucho beneficio sobre lo que ya tenemos en JS con la concurrencia asíncrona.

Y querrías saber si estas dos partes del programa tienen acceso al mismo ámbito/recursos compartidos. Si lo tienen, entonces tienes todas las cuestiones con las que lidian los lenguajes multihilo (Java, C++, etc.), como la necesidad de bloqueo cooperativo o preventivo (mutexes, etc.). Eso es mucho trabajo extra, y no debería emprenderse a la ligera.

Alternativamente, querrías saber cómo estas dos partes podrían "comunicarse" si no pueden compartir ámbito/recursos.

Todas estas son excelentes preguntas a considerar mientras exploramos una funcionalidad añadida a la plataforma web alrededor de HTML5 llamada "Web Workers." Esta es una funcionalidad del navegador (también conocido como entorno anfitrión) y en realidad no tiene casi nada que ver con el lenguaje JS en sí mismo. Es decir, JavaScript no tiene *actualmente* ninguna funcionalidad que soporte la ejecución con hilos.

Pero un entorno como tu navegador puede fácilmente proporcionar múltiples instancias del motor de JavaScript, cada una en su propio hilo, y permitirte ejecutar un programa diferente en cada hilo. Cada una de esas piezas separadas con hilos de tu programa se llama un "(Web) Worker." Este tipo de paralelismo se llama "paralelismo de tareas," ya que el énfasis está en dividir fragmentos de tu programa para ejecutarlos en paralelo.

Desde tu programa JS principal (u otro Worker), instancias un Worker de esta manera:

```js
var w1 = new Worker( "http://some.url.1/mycoolworker.js" );
```

La URL debe apuntar a la ubicación de un archivo JS (¡no una página HTML!) que está destinado a ser cargado en un Worker. El navegador entonces levantará un hilo separado y dejará que ese archivo se ejecute como un programa independiente en ese hilo.

**Nota:** El tipo de Worker creado con tal URL se llama un "Dedicated Worker." Pero en lugar de proporcionar una URL a un archivo externo, también puedes crear un "Inline Worker" proporcionando una URL Blob (otra funcionalidad de HTML5); esencialmente es un archivo en línea almacenado en un único valor (binario). Sin embargo, los Blobs están fuera del alcance de lo que discutiremos aquí.

Los Workers no comparten ningún ámbito o recurso entre sí o con el programa principal — eso traería todas las pesadillas de la programación con hilos al primer plano — pero en su lugar tienen un mecanismo básico de mensajería de eventos que los conecta.

El objeto Worker `w1` es un escuchador y disparador de eventos, que te permite suscribirte a eventos enviados por el Worker así como enviar eventos al Worker.

Así es como se escuchan los eventos (en realidad, el evento fijo `"message"`):

```js
w1.addEventListener( "message", function(evt){
	// evt.data
} );
```

Y puedes enviar el evento `"message"` al Worker:

```js
w1.postMessage( "something cool to say" );
```

Dentro del Worker, la mensajería es totalmente simétrica:

```js
// "mycoolworker.js"

addEventListener( "message", function(evt){
	// evt.data
} );

postMessage( "a really cool reply" );
```

Observa que un Worker dedicado está en una relación uno a uno con el programa que lo creó. Es decir, el evento `"message"` no necesita ninguna desambiguación aquí, porque estamos seguros de que solo puede haber venido de esta relación uno a uno — o vino del Worker o de la página principal.

Usualmente la aplicación de la página principal crea los Workers, pero un Worker puede instanciar sus propios Worker(s) hijos — conocidos como subworkers — según sea necesario. A veces esto es útil para delegar tales detalles a una especie de Worker "maestro" que genera otros Workers para procesar partes de una tarea. Desafortunadamente, al momento de escribir esto, Chrome aún no soporta subworkers, mientras que Firefox sí.

Para matar un Worker inmediatamente desde el programa que lo creó, llama a `terminate()` en el objeto Worker (como `w1` en los fragmentos anteriores). Terminar abruptamente un hilo de Worker no le da ninguna oportunidad de finalizar su trabajo o limpiar cualquier recurso. Es similar a cerrar una pestaña del navegador para matar una página.

Si tienes dos o más páginas (¡o múltiples pestañas con la misma página!) en el navegador que intentan crear un Worker desde la misma URL de archivo, esos terminarán siendo Workers completamente separados. En breve, discutiremos una forma de "compartir" un Worker.

**Nota:** Podría parecer que un programa JS malicioso o ignorante podría fácilmente realizar un ataque de denegación de servicio en un sistema generando cientos de Workers, aparentemente cada uno con su propio hilo. Aunque es cierto que hay cierta garantía de que un Worker terminará en un hilo separado, esta garantía no es ilimitada. El sistema es libre de decidir cuántos hilos/CPUs/cores realmente quiere crear. No hay forma de predecir o garantizar cuántos tendrás disponibles, aunque muchas personas asumen que son al menos tantos como el número de CPUs/cores disponibles. Creo que la suposición más segura es que hay al menos otro hilo además del hilo principal de la UI, pero eso es todo.

### Entorno del Worker

Dentro del Worker, no tienes acceso a ninguno de los recursos del programa principal. Eso significa que no puedes acceder a ninguna de sus variables globales, ni puedes acceder al DOM de la página u otros recursos. Recuerda: es un hilo totalmente separado.

Sin embargo, puedes realizar operaciones de red (Ajax, WebSockets) y establecer temporizadores. Además, el Worker tiene acceso a su propia copia de varias variables/funcionalidades globales importantes, incluyendo `navigator`, `location`, `JSON`, y `applicationCache`.

También puedes cargar scripts JS adicionales en tu Worker, usando `importScripts(..)`:

```js
// inside the Worker
importScripts( "foo.js", "bar.js" );
```

Estos scripts se cargan de forma síncrona, lo que significa que la llamada a `importScripts(..)` bloqueará el resto de la ejecución del Worker hasta que el/los archivo(s) hayan terminado de cargarse y ejecutarse.

**Nota:** También ha habido algunas discusiones sobre exponer la API `<canvas>` a los Workers, lo cual combinado con que los canvas sean Transferables (ver la sección "Transferencia de Datos"), permitiría a los Workers realizar procesamiento gráfico off-thread más sofisticado, lo cual puede ser útil para juegos de alto rendimiento (WebGL) y otras aplicaciones similares. Aunque esto aún no existe en ningún navegador, es probable que suceda en un futuro cercano.

¿Cuáles son algunos usos comunes para los Web Workers?

* Cálculos matemáticos de procesamiento intensivo
* Ordenamiento de grandes conjuntos de datos
* Operaciones de datos (compresión, análisis de audio, manipulaciones de píxeles de imagen, etc.)
* Comunicaciones de red de alto tráfico

### Transferencia de Datos

Puedes notar una característica común de la mayoría de esos usos, que es que requieren una gran cantidad de información para ser transferida a través de la barrera entre hilos usando el mecanismo de eventos, quizás en ambas direcciones.

En los primeros días de los Workers, serializar todos los datos a un valor de cadena era la única opción. Además de la penalización de velocidad de las serializaciones bidireccionales, la otra desventaja importante era que los datos se estaban copiando, lo que significaba una duplicación del uso de memoria (y la subsecuente rotación de recolección de basura).

Afortunadamente, ahora tenemos algunas mejores opciones.

Si pasas un objeto, un llamado "Structured Cloning Algorithm" (https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm) se usa para copiar/duplicar el objeto en el otro lado. Este algoritmo es bastante sofisticado y puede incluso manejar la duplicación de objetos con referencias circulares. La penalización de rendimiento de convertir-a-cadena/desde-cadena no se paga, pero aún tenemos duplicación de memoria usando este enfoque. Hay soporte para esto en IE10 y superior, así como en todos los otros navegadores principales.

Una opción aún mejor, especialmente para conjuntos de datos más grandes, es "Transferable Objects" (http://updates.html5rocks.com/2011/12/Transferable-Objects-Lightning-Fast). Lo que sucede es que la "propiedad" del objeto se transfiere, pero los datos en sí no se mueven. Una vez que transfieres un objeto a un Worker, queda vacío o inaccesible en la ubicación de origen — eso elimina los peligros de la programación con hilos sobre un ámbito compartido. Por supuesto, la transferencia de propiedad puede ir en ambas direcciones.

Realmente no hay mucho que necesites hacer para optar por un Transferable Object; cualquier estructura de datos que implemente la interfaz Transferable (https://developer.mozilla.org/en-US/docs/Web/API/Transferable) será automáticamente transferida de esta manera (soportado en Firefox y Chrome).

Por ejemplo, los arreglos tipados como `Uint8Array` (consulta el título *ES6 & Beyond* de esta serie) son "Transferables." Así es como enviarías un Transferable Object usando `postMessage(..)`:

```js
// `foo` is a `Uint8Array` for instance

postMessage( foo.buffer, [ foo.buffer ] );
```

El primer parámetro es el buffer sin procesar y el segundo parámetro es una lista de lo que se va a transferir.

Los navegadores que no soportan Transferable Objects simplemente degradan a clonación estructurada, lo que significa una reducción del rendimiento en lugar de una ruptura absoluta de la funcionalidad.

### Shared Workers

Si tu sitio o aplicación permite cargar múltiples pestañas de la misma página (una funcionalidad común), es muy posible que desees reducir el uso de recursos de su sistema previniendo Workers dedicados duplicados; el recurso limitado más común en este sentido es una conexión de socket de red, ya que los navegadores limitan el número de conexiones simultáneas a un solo host. Por supuesto, limitar múltiples conexiones desde un cliente también alivia los requerimientos de recursos de tu servidor.

En este caso, crear un único Worker centralizado que todas las instancias de página de tu sitio o aplicación puedan *compartir* es bastante útil.

Eso se llama un `SharedWorker`, que se crea de la siguiente manera (el soporte para esto está limitado a Firefox y Chrome):

```js
var w1 = new SharedWorker( "http://some.url.1/mycoolworker.js" );
```

Debido a que un shared Worker puede estar conectado a o desde más de una instancia de programa o página en tu sitio, el Worker necesita una forma de saber de qué programa proviene un mensaje. Esta identificación única se llama un "port" — piensa en los puertos de sockets de red. Así que el programa que llama debe usar el objeto `port` del Worker para la comunicación:

```js
w1.port.addEventListener( "message", handleMessages );

// ..

w1.port.postMessage( "something cool" );
```

Además, la conexión del puerto debe ser inicializada, así:

```js
w1.port.start();
```

Dentro del shared Worker, se debe manejar un evento adicional: `"connect"`. Este evento proporciona el `object` port para esa conexión particular. La forma más conveniente de mantener múltiples conexiones separadas es usar closure (consulta el título *Scope & Closures* de esta serie) sobre el `port`, como se muestra a continuación, con la escucha y transmisión de eventos para esa conexión definidas dentro del manejador del evento `"connect"`:

```js
// inside the shared Worker
addEventListener( "connect", function(evt){
	// the assigned port for this connection
	var port = evt.ports[0];

	port.addEventListener( "message", function(evt){
		// ..

		port.postMessage( .. );

		// ..
	} );

	// initialize the port connection
	port.start();
} );
```

Aparte de esa diferencia, los shared y dedicated Workers tienen las mismas capacidades y semántica.

**Nota:** Los Shared Workers sobreviven la terminación de una conexión de puerto si otras conexiones de puerto siguen vivas, mientras que los dedicated Workers se terminan cuando la conexión con su programa iniciador se termina.

### Polyfilling de Web Workers

Los Web Workers son muy atractivos desde el punto de vista del rendimiento para ejecutar programas JS en paralelo. Sin embargo, podrías estar en una posición donde tu código necesita ejecutarse en navegadores más antiguos que carecen de soporte. Debido a que los Workers son una API y no una sintaxis, pueden recibir polyfill, hasta cierto punto.

Si un navegador no soporta Workers, simplemente no hay forma de simular multithreading desde la perspectiva del rendimiento. Los Iframes son comúnmente considerados como una forma de proporcionar un entorno paralelo, pero en todos los navegadores modernos en realidad se ejecutan en el mismo hilo que la página principal, así que no son suficientes para simular paralelismo.

Como detallamos en el Capítulo 1, la asincronicidad de JS (no el paralelismo) viene de la cola del bucle de eventos, así que puedes forzar Workers simulados a ser asíncronos usando temporizadores (`setTimeout(..)`, etc.). Entonces solo necesitas proporcionar un polyfill para la API de Worker. Hay algunos listados aquí (https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#web-workers), pero francamente ninguno de ellos se ve muy bien.

He escrito un boceto de un polyfill para `Worker` aquí (https://gist.github.com/getify/1b26accb1a09aa53ad25). Es básico, pero debería hacer el trabajo para soporte simple de `Worker`, dado que la mensajería bidireccional funciona correctamente así como el manejo de `"onerror"`. Probablemente también podrías extenderlo con más funcionalidades, como `terminate()` o Shared Workers simulados, como lo consideres apropiado.

**Nota:** No puedes simular el bloqueo síncrono, así que este polyfill simplemente no permite el uso de `importScripts(..)`. Otra opción podría haber sido analizar y transformar el código del Worker (una vez cargado por Ajax) para manejar la reescritura a alguna forma asíncrona de un polyfill de `importScripts(..)`, quizás con una interfaz consciente de promises.

## SIMD

Single instruction, multiple data (SIMD) es una forma de "paralelismo de datos," en contraste con el "paralelismo de tareas" con Web Workers, porque el énfasis no está realmente en que fragmentos de lógica del programa se paralelicen, sino más bien en que múltiples bits de datos se procesen en paralelo.

Con SIMD, los hilos no proporcionan el paralelismo. En su lugar, las CPUs modernas proporcionan capacidad SIMD con "vectores" de números — piensa: arreglos especializados por tipo — así como instrucciones que pueden operar en paralelo a través de todos los números; estas son operaciones de bajo nivel que aprovechan el paralelismo a nivel de instrucción.

El esfuerzo por exponer la capacidad SIMD a JavaScript es liderado principalmente por Intel (https://01.org/node/1495), específicamente por Mohammad Haghighat (al momento de escribir esto), en cooperación con los equipos de Firefox y Chrome. SIMD está en una fase temprana del proceso de estandarización con buenas posibilidades de incorporarse en una futura revisión de JavaScript, probablemente en el marco temporal de ES7.

SIMD JavaScript propone exponer tipos de vectores cortos y APIs al código JS, que en aquellos sistemas habilitados para SIMD mapearían las operaciones directamente a los equivalentes de la CPU, con degradación a "shims" de operación no paralelizada en sistemas sin SIMD.

Los beneficios de rendimiento para aplicaciones intensivas en datos (análisis de señales, operaciones de matrices en gráficos, etc.) con tal procesamiento matemático paralelo son bastante obvios.

Las formas tempranas de la propuesta de la API SIMD al momento de escribir esto lucen así:

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

var v3 = SIMD.int32x4( 10, 101, 1001, 10001 );
var v4 = SIMD.int32x4( 10, 20, 30, 40 );

SIMD.float32x4.mul( v1, v2 );	// [ 6.597339, 67.2, 138.89, 299.97 ]
SIMD.int32x4.add( v3, v4 );		// [ 20, 121, 1031, 10041 ]
```

Se muestran aquí dos tipos diferentes de datos vectoriales, números de punto flotante de 32 bits y números enteros de 32 bits. Puedes ver que estos vectores tienen un tamaño exacto de cuatro elementos de 32 bits, ya que esto coincide con los tamaños de vectores SIMD (128 bits) disponibles en la mayoría de las CPUs modernas. También es posible que en el futuro veamos una versión `x8` (¡o más grande!) de estas APIs.

Además de `mul()` y `add()`, es probable que se incluyan muchas otras operaciones, como `sub()`, `div()`, `abs()`, `neg()`, `sqrt()`, `reciprocal()`, `reciprocalSqrt()` (aritméticas), `shuffle()` (reorganizar elementos del vector), `and()`, `or()`, `xor()`, `not()` (lógicas), `equal()`, `greaterThan()`, `lessThan()` (comparación), `shiftLeft()`, `shiftRightLogical()`, `shiftRightArithmetic()` (desplazamientos), `fromFloat32x4()`, y `fromInt32x4()` (conversiones).

**Nota:** Hay un "prollyfill" oficial (polyfill esperanzado, expectante, orientado al futuro) para la funcionalidad SIMD disponible (https://github.com/johnmccutchan/ecmascript_simd), que ilustra mucha más de la capacidad SIMD planeada de lo que hemos ilustrado en esta sección.

## asm.js

"asm.js" (http://asmjs.org/) es una etiqueta para un subconjunto altamente optimizable del lenguaje JavaScript. Al evitar cuidadosamente ciertos mecanismos y patrones que son *difíciles* de optimizar (recolección de basura, coerción, etc.), el código estilo asm.js puede ser reconocido por el motor JS y recibir atención especial con optimizaciones agresivas de bajo nivel.

A diferencia de otros mecanismos de rendimiento de programas discutidos en este capítulo, asm.js no es necesariamente algo que necesite ser adoptado en la especificación del lenguaje JS. *Hay* una especificación de asm.js (http://asmjs.org/spec/latest/), pero es principalmente para rastrear un conjunto acordado de inferencias candidatas para optimización en lugar de un conjunto de requerimientos para los motores JS.

Actualmente no se está proponiendo ninguna sintaxis nueva. En su lugar, asm.js sugiere formas de reconocer la sintaxis JS estándar existente que se conforma a las reglas de asm.js y dejar que los motores implementen sus propias optimizaciones en consecuencia.

Ha habido cierto desacuerdo entre los proveedores de navegadores sobre exactamente cómo asm.js debería activarse en un programa. Las primeras versiones del experimento asm.js requerían un pragma `"use asm";` (similar al `"use strict";` del modo estricto) para dar una pista al motor JS de buscar oportunidades y sugerencias de optimización asm.js. Otros han afirmado que asm.js debería ser simplemente un conjunto de heurísticas que los motores reconocen automáticamente sin que el autor tenga que hacer nada extra, lo que significa que los programas existentes podrían teóricamente beneficiarse de las optimizaciones estilo asm.js sin hacer nada especial.

### Cómo Optimizar con asm.js

Lo primero que hay que entender sobre las optimizaciones de asm.js es acerca de los tipos y la coerción (consulta el título *Types & Grammar* de esta serie). Si el motor JS tiene que rastrear múltiples tipos diferentes de valores en una variable a través de varias operaciones, para poder manejar las coerciones entre tipos según sea necesario, eso es mucho trabajo extra que mantiene la optimización del programa en un nivel subóptimo.

**Nota:** Vamos a usar código estilo asm.js aquí con fines ilustrativos, pero ten en cuenta que no se espera comúnmente que escribas tal código a mano. asm.js está más pensado como un objetivo de compilación desde otras herramientas, como Emscripten (https://github.com/kripken/emscripten/wiki). Por supuesto, es posible escribir tu propio código asm.js, pero generalmente es una mala idea porque el código es de muy bajo nivel y gestionarlo puede consumir mucho tiempo y ser propenso a errores. Sin embargo, puede haber casos donde quieras ajustar manualmente tu código para propósitos de optimización asm.js.

Hay algunos "trucos" que puedes usar para dar pistas a un motor JS compatible con asm.js sobre cuál es el tipo previsto para variables/operaciones, para que pueda omitir estos pasos de rastreo de coerción.

Por ejemplo:

```js
var a = 42;

// ..

var b = a;
```

En ese programa, la asignación `b = a` deja la puerta abierta para divergencia de tipos en las variables. Sin embargo, podría escribirse en su lugar como:

```js
var a = 42;

// ..

var b = a | 0;
```

Aquí, hemos usado el `|` ("OR binario") con el valor `0`, que no tiene ningún efecto en el valor más que asegurar que sea un entero de 32 bits. Ese código ejecutado en un motor JS normal funciona perfectamente bien, pero cuando se ejecuta en un motor JS compatible con asm.js *puede* señalar que `b` siempre debería ser tratado como un entero de 32 bits, por lo que el rastreo de coerción se puede omitir.

De manera similar, la operación de suma entre dos variables se puede restringir a una suma de enteros más eficiente (en lugar de punto flotante):

```js
(a + b) | 0
```

Una vez más, el motor JS compatible con asm.js puede ver esa pista e inferir que la operación `+` debería ser una suma de enteros de 32 bits porque el resultado final de toda la expresión sería automáticamente conformado a entero de 32 bits de todas formas.

### Módulos asm.js

Uno de los mayores detractores del rendimiento en JS está alrededor de la asignación de memoria, la recolección de basura y el acceso al ámbito. asm.js sugiere que una de las formas de sortear estos problemas es declarar un "módulo" asm.js más formalizado — no confundas estos con los módulos ES6; consulta el título *ES6 & Beyond* de esta serie.

Para un módulo asm.js, necesitas pasar explícitamente un namespace estrictamente conformado — esto se denomina en la especificación como `stdlib`, ya que debería representar las bibliotecas estándar necesarias — para importar los símbolos necesarios, en lugar de simplemente usar globales mediante el ámbito léxico. En el caso base, el objeto `window` es un objeto `stdlib` aceptable para propósitos de módulo asm.js, pero podrías y quizás deberías construir uno aún más restringido.

También debes declarar un "heap" — que es solo un término elegante para un punto reservado en memoria donde las variables ya pueden ser usadas sin pedir más memoria o liberar memoria previamente usada — y pasarlo, para que el módulo asm.js no necesite hacer nada que cause rotación de memoria; puede simplemente usar el espacio pre-reservado.

Un "heap" es probablemente un `ArrayBuffer` tipado, como:

```js
var heap = new ArrayBuffer( 0x10000 );	// 64k heap
```

Usando ese espacio binario de 64k pre-reservado, un módulo asm.js puede almacenar y recuperar valores en ese buffer sin ninguna penalización de asignación de memoria o recolección de basura. Por ejemplo, el buffer `heap` podría usarse dentro del módulo para respaldar un arreglo de valores de punto flotante de 64 bits así:

```js
var arr = new Float64Array( heap );
```

OK, hagamos un ejemplo rápido y sencillo de un módulo estilo asm.js para ilustrar cómo estas piezas encajan entre sí. Definiremos un `foo(..)` que toma un inicio (`x`) y un fin (`y`) como enteros para un rango, y calcula todas las multiplicaciones adyacentes internas de los valores en el rango, y luego finalmente promedia esos valores:

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

		// calculate all the inner adjacent multiplications
		for (i = x | 0;
			(i | 0) < (y | 0);
			p = (p + 8) | 0, i = (i + 1) | 0
		) {
			// store result
			arr[ p >> 3 ] = (i * (i + 1)) | 0;
		}

		// calculate average of all intermediate values
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

foo( 10, 20 );		// 233
```

**Nota:** Este ejemplo de asm.js fue escrito a mano con fines ilustrativos, así que no representa el mismo código que sería producido por una herramienta de compilación que apunta a asm.js. Pero sí muestra la naturaleza típica del código asm.js, especialmente las pistas de tipos y el uso del buffer `heap` para almacenamiento temporal de variables.

La primera llamada a `fooASM(..)` es lo que configura nuestro módulo asm.js con su asignación de `heap`. El resultado es una función `foo(..)` que podemos llamar tantas veces como sea necesario. Esas llamadas a `foo(..)` deberían ser especialmente optimizadas por un motor JS compatible con asm.js. Es importante notar que el código anterior es JS completamente estándar y funcionaría perfectamente bien (sin optimización especial) en un motor no compatible con asm.js.

Obviamente, la naturaleza de las restricciones que hacen que el código asm.js sea tan optimizable reduce significativamente los usos posibles para tal código. asm.js no será necesariamente un conjunto de optimización general para cualquier programa JS dado. En su lugar, está pensado para proporcionar una forma optimizada de manejar tareas especializadas como operaciones matemáticas intensivas (por ejemplo, las utilizadas en el procesamiento gráfico para juegos).

## Repaso

Los primeros cuatro capítulos de este libro se basan en la premisa de que los patrones de codificación asíncrona te dan la capacidad de escribir código más eficiente, lo cual es generalmente una mejora muy importante. Pero el comportamiento asíncrono solo te lleva hasta cierto punto, porque fundamentalmente sigue estando ligado a un solo hilo de bucle de eventos.

Así que en este capítulo hemos cubierto varios mecanismos a nivel de programa para mejorar el rendimiento aún más.

Los Web Workers te permiten ejecutar un archivo JS (también conocido como programa) en un hilo separado usando eventos asíncronos para enviar mensajes entre los hilos. Son maravillosos para descargar tareas de larga duración o intensivas en recursos a un hilo diferente, dejando el hilo principal de la UI más receptivo.

SIMD propone mapear operaciones matemáticas paralelas a nivel de CPU a APIs de JavaScript para operaciones de datos en paralelo de alto rendimiento, como el procesamiento numérico en grandes conjuntos de datos.

Finalmente, asm.js describe un pequeño subconjunto de JavaScript que evita las partes de JS difíciles de optimizar (como la recolección de basura y la coerción) y permite al motor JS reconocer y ejecutar tal código a través de optimizaciones agresivas. asm.js podría ser escrito a mano, pero eso es extremadamente tedioso y propenso a errores, similar a escribir lenguaje ensamblador a mano (de ahí el nombre). En su lugar, la intención principal es que asm.js sería un buen objetivo para compilación cruzada desde otros lenguajes de programación altamente optimizados — por ejemplo, Emscripten (https://github.com/kripken/emscripten/wiki) transpilando C/C++ a JavaScript.

Aunque no se cubrió explícitamente en este capítulo, hay ideas aún más radicales en discusión muy temprana para JavaScript, incluyendo aproximaciones de funcionalidad directa con hilos (no solo oculta detrás de APIs de estructuras de datos). Ya sea que eso suceda explícitamente, o simplemente veamos más paralelismo filtrarse en JS detrás de escena, el futuro de un rendimiento más optimizado a nivel de programa en JS se ve realmente *prometedor*.
