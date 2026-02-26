# You Don't Know JS: Async & Performance
# Capítulo 1: Asincronía: Ahora y Después

Una de las partes más importantes y a la vez frecuentemente malentendidas de programar en un lenguaje como JavaScript es cómo expresar y manipular el comportamiento del programa que se extiende a lo largo del tiempo.

Esto no es sólo sobre lo que ocurre desde el inicio de un `for` hasta el final de un `for`, lo cual por supuesto toma *algo de tiempo* (microsegundos a milisegundos) en completarse. Se trata de lo que ocurre cuando una parte de tu programa se ejecuta *ahora*, y otra parte de tu programa se ejecuta *después* — hay una brecha entre *ahora* y *después* en la que tu programa no está ejecutándose activamente.

Prácticamente todos los programas no triviales jamás escritos (especialmente en JS) han tenido que gestionar de alguna manera esa brecha, sea esperando la entrada del usuario, solicitando datos a una base de datos o sistema de archivos, enviando datos a través de la red y esperando una respuesta, o ejecutando una tarea repetida en intervalos de tiempo (como una animación). En todas estas variantes, tu programa debe mantener estado a través de la brecha temporal. Como se suele decir en Londres (sobre el hueco entre la puerta del metro y el andén): "mind the gap" (cuidado con la brecha).

De hecho, la relación entre las partes *ahora* y *después* de tu programa está en el corazón de la programación asíncrona.

La programación asíncrona ha existido desde el inicio de JS, sin duda. Pero la mayoría de desarrolladores JS nunca han considerado con cuidado exactamente cómo y por qué aparece en sus programas, ni han explorado varias *otras* maneras de manejarla. El enfoque "suficientemente bueno" siempre ha sido la humilde función callback. Muchos todavía insistirán que los callbacks son más que suficientes.

Pero a medida que JS sigue creciendo tanto en alcance como en complejidad, para satisfacer las demandas cada vez mayores de un lenguaje de primera clase que corre en navegadores y servidores y en todos los dispositivos imaginables, las molestias con las que gestionamos la asincronía se están volviendo cada vez más paralizantes, y claman por enfoques que sean tanto más capaces como más razonables.

Aunque esto puede parecer abstracto ahora, te aseguro que lo abordaremos de forma más completa y concreta a medida que avancemos en el libro. Exploraremos una variedad de técnicas emergentes para JavaScript asíncrono en los siguientes capítulos.

Pero antes de llegar allí, tendremos que entender mucho más profundamente qué es la asincronía y cómo opera en JS.

## Un programa en fragmentos

Puedes escribir tu programa JS en un solo archivo *.js*, pero tu programa casi con seguridad está compuesto de varios fragmentos, sólo uno de los cuales se ejecutará *ahora*, y el resto se ejecutará *después*. La unidad más común de "fragmento" es la `function`.

El problema que la mayoría de desarrolladores nuevos en JS parecen tener es que *después* no ocurre estricta ni inmediatamente después de *ahora*. En otras palabras, las tareas que no pueden completarse *ahora* son, por definición, las que se completarán de forma asíncrona, y por tanto no tendremos comportamiento bloqueante como podríamos esperar intuitivamente.

Considera:

```js
// ajax(..) es una función Ajax arbitraria dada por una biblioteca
var data = ajax( "http://some.url.1" );

console.log( data );
// ¡Ups! `data` generalmente no tendrá los resultados Ajax
```

Probablemente sabes que las peticiones Ajax estándar no se completan de forma síncrona, lo que significa que la función `ajax(..)` no tiene aún un valor que retornar para asignarlo a la variable `data`. Si `ajax(..)` *pudiera* bloquear hasta que llegue la respuesta, entonces la asignación `data = ..` funcionaría correctamente.

Pero no hacemos Ajax así. Hacemos una petición Ajax asíncrona *ahora*, y no obtendremos los resultados hasta *después*.

La forma más simple (pero definitivamente no la única, ni necesariamente la mejor) de "esperar" desde *ahora* hasta *después* es usar una función, comúnmente llamada función callback:

```js
// ajax(..) es una función Ajax arbitraria dada por una biblioteca
ajax( "http://some.url.1", function myCallbackFunction(data){

	console.log( data ); // ¡Yay, tengo algunos `data`!

} );
```

**Advertencia:** Puede que hayas oído que es posible hacer peticiones Ajax síncronas. Aunque eso es técnicamente cierto, nunca deberías, bajo ninguna circunstancia, hacerlo, porque bloquea la interfaz de usuario del navegador (botones, menús, desplazamiento, etc.) y evita cualquier interacción del usuario. Es una idea terrible y siempre debe evitarse.

Antes de protestar, no, tu deseo de evitar el lío de callbacks *no* justifica peticiones Ajax síncronas.

Por ejemplo, considera este código:

```js
function now() {
	return 21;
}

function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}

var answer = now();

setTimeout( later, 1000 ); // Meaning of life: 42
```

Hay dos fragmentos en este programa: lo que se ejecutará *ahora*, y lo que se ejecutará *después*. Debería ser bastante obvio cuáles son, pero seamos súper explícitos:

Ahora:
```js
function now() {
	return 21;
}

function later() { .. }

var answer = now();

setTimeout( later, 1000 );
```

Después:
```js
answer = answer * 2;
console.log( "Meaning of life:", answer );
```

El fragmento *ahora* se ejecuta de inmediato, tan pronto como ejecutes tu programa. Pero `setTimeout(..)` también configura un evento (un timeout) para que ocurra *después*, de modo que el contenido de la función `later()` se ejecutará en un momento futuro (1.000 milisegundos desde ahora).

Siempre que envuelvas una porción de código en una `function` y especifiques que debe ejecutarse en respuesta a algún evento (temporizador, clic del ratón, respuesta Ajax, etc.), estás creando un fragmento *después* de tu código, e introduciendo así asincronía en tu programa.

### Consola asíncrona

No existe una especificación ni un conjunto de requisitos sobre cómo funcionan los métodos `console.*` — no forman parte oficial de JavaScript, sino que se añaden al entorno anfitrión (hosting environment) (ver el título *Types & Grammar* de esta serie). Por lo tanto, diferentes navegadores y entornos JS hacen lo que les place, lo cual a veces puede llevar a comportamientos confusos.

En particular, hay navegadores y condiciones en las que `console.log(..)` no muestra inmediatamente lo que se le pasa. La razón principal es que la E/S es una parte muy lenta y bloqueante de muchos programas (no sólo JS). Por ello, puede ser más eficiente (desde la perspectiva de la página/UI) que el navegador maneje la E/S de la consola de forma asíncrona en segundo plano, sin que quizá sepas que ocurrió.

Un escenario no demasiado común, pero posible, donde esto podría ser observable (no desde el código mismo, sino desde el exterior):

```js
var a = {
	index: 1
};

// luego
console.log( a ); // ??

// aún más tarde
a.index++;
```

Normalmente esperaríamos que el objeto `a` se "instantanee" en el momento exacto del `console.log(..)`, imprimiendo algo como `{ index: 1 }`, de modo que en la siguiente sentencia cuando `a.index++` ocurra, esté modificando algo distinto o estrictamente posterior a la salida de `a`.

La mayor parte del tiempo, el código anterior mostrará en la consola del desarrollador la representación del objeto que esperarías. Pero es posible que ese mismo código se ejecute en una situación donde el navegador decidió diferir la E/S de la consola al fondo, en cuyo caso *es posible* que cuando el objeto se represente en la consola, `a.index++` ya haya ocurrido, y muestre `{ index: 2 }`.

Es un objetivo móvil determinar bajo qué condiciones exactamente la E/S de `console` será diferida o incluso observable. Ten en cuenta esta posible asincronía en la E/S por si te encuentras con problemas de depuración donde los objetos han sido modificados *después* de un `console.log(..)` y sin embargo ves las modificaciones inesperadas.

**Nota:** Si te encuentras con este raro escenario, la mejor opción es usar puntos de interrupción (breakpoints) en el depurador en lugar de confiar en la salida de `console`. La siguiente mejor opción sería forzar una "instantánea" del objeto serializándolo a `string`, por ejemplo con `JSON.stringify(..)`.

## Bucle de eventos

Hagamos una afirmación (quizá chocante): a pesar de permitir claramente código JS asíncrono (como el timeout que vimos), hasta hace poco (ES6), JavaScript en sí no había tenido nunca una noción directa de asincronía incorporada.

**¿Qué!?** Eso parece una afirmación loca, ¿no? En realidad es bastante cierto. El motor JS en sí nunca ha hecho más que ejecutar un único fragmento de tu programa en un momento dado, cuando se le pide.

"¿A pedido?" ¿Por quién? ¡Esa es la parte importante!

El motor JS no funciona aislado. Corre dentro de un *entorno anfitrión*, que para la mayoría de desarrolladores es el navegador web típico. En los últimos años (pero no exclusivamente), JS se ha expandido más allá del navegador a otros entornos, como servidores a través de Node.js. De hecho, JavaScript hoy se incrusta en todo tipo de dispositivos, desde robots hasta bombillas.

Pero el hilo común de todos estos entornos es que tienen un mecanismo para ejecutar múltiples fragmentos de tu programa *a lo largo del tiempo*, invocando al motor JS en cada momento, llamado "event loop" (bucle de eventos).

En otras palabras, el motor JS nunca ha tenido una sensación innata del *tiempo*, sino que ha sido un entorno de ejecución bajo demanda para cualquier fragmento arbitrario de JS. Es el entorno circundante el que siempre ha *programado* los "eventos" (ejecuciones de código JS).

Por ejemplo, cuando tu programa JS hace una petición Ajax para obtener datos de un servidor, configuras el código de "respuesta" en una función (comúnmente llamada "callback"), y el motor JS le dice al entorno anfitrión: "Oye, voy a suspender la ejecución por ahora, pero cuando termines con esa petición de red y tengas datos, por favor *llama* a esta función *de vuelta* (call back)".

El navegador entonces escucha la respuesta de la red, y cuando tiene algo que entregarte, inserta tu callback en el *event loop* para ejecución.

Entonces, ¿qué es el *event loop*?

Conceptualicémoslo primero con un pseudocódigo simplificado:

```js
// `eventLoop` es un array que actúa como una cola (FIFO)
var eventLoop = [ ];
var event;

// seguir "siempre"
while (true) {
	// realizar un "tick"
	if (eventLoop.length > 0) {
		// obtener el siguiente evento en la cola
		event = eventLoop.shift();

		// ahora, ejecutar el siguiente evento
		try {
			event();
		}
		catch (err) {
			reportError(err);
		}
	}
}
```

Esto es, por supuesto, pseudocódigo simplificado para ilustrar los conceptos. Pero debería ser suficiente para ayudar a entender mejor.

Como puedes ver, hay un bucle continuo representado por el `while`, y cada iteración de ese bucle se llama un "tick". Para cada tick, si hay un evento esperando en la cola, se toma y se ejecuta. Esos eventos son tus callbacks de función.

Es importante notar que `setTimeout(..)` no coloca tu callback en la cola del event loop. Lo que hace es configurar un temporizador; cuando el temporizador expira, el entorno coloca tu callback en el event loop, de modo que algún tick futuro lo recogerá y ejecutará.

¿Qué pasa si ya hay 20 elementos en el event loop en ese momento? Tu callback espera. Entra en la fila detrás de los demás — normalmente no hay un camino para preemptar la cola y saltar delante. Esto explica por qué los temporizadores `setTimeout(..)` pueden no dispararse con exactitud temporal perfecta. Estás garantizado (en términos generales) de que tu callback no se ejecutará *antes* del intervalo que especificaste, pero puede ocurrir en o después de ese tiempo, dependiendo del estado de la cola de eventos.

En otras palabras, tu programa se divide generalmente en muchos fragmentos pequeños, que ocurren uno tras otro en la cola del event loop. Y técnicamente, otros eventos no relacionados directamente con tu programa también pueden entrelazarse en la cola.

**Nota:** Mencionamos "hasta hace poco" en relación con ES6 que cambia la naturaleza de dónde se gestiona la cola del event loop. Es mayormente una formalidad técnica, pero ES6 ahora especifica cómo funciona el event loop, lo que significa técnicamente que está dentro del ámbito del motor JS, más que sólo del entorno anfitrión. Una razón principal para este cambio es la introducción de las Promesas en ES6, que requieren la habilidad de tener control directo y fino sobre la programación de operaciones en la cola del event loop (ver la discusión sobre `setTimeout(..0)` en la sección "Cooperation").

## Hilos en paralelo

Es muy común confundir los términos "async" y "parallel", pero en realidad son bastante diferentes. Recuerda, async trata la brecha entre *ahora* y *después*. Pero paralelo trata de que las cosas puedan ocurrir simultáneamente.

Las herramientas más comunes para computación en paralelo son procesos y hilos. Procesos e hilos se ejecutan independientemente y pueden ejecutarse simultáneamente: en procesadores separados, o incluso en ordenadores separados; múltiples hilos pueden compartir la memoria de un único proceso.

Un event loop, en contraste, divide su trabajo en tareas y las ejecuta en serie, impidiendo acceso paralelo y cambios a la memoria compartida. El paralelismo y el "serialismo" pueden coexistir en forma de event loops cooperantes en hilos separados.

El entrelazado de hilos paralelos de ejecución y el entrelazado de eventos asíncronos ocurren en niveles de granularidad muy diferentes.

Por ejemplo:

```js
function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}
```

Mientras que el contenido entero de `later()` sería considerado como una única entrada en la cola del event loop, al pensar en un hilo en el que corre ese código, en realidad hay quizás una docena de operaciones de bajo nivel. Por ejemplo, `answer = answer * 2` requiere primero cargar el valor actual de `answer`, luego poner `2` en algún lugar, luego realizar la multiplicación, y finalmente almacenar el resultado en `answer`.

En un entorno de un solo hilo, realmente no importa que los items en la cola del hilo sean operaciones de bajo nivel, porque nada puede interrumpir el hilo. Pero si tienes un sistema paralelo, en el que dos hilos distintos operan en el mismo programa, podrías tener comportamiento impredecible.

Considera:

```js
var a = 20;

function foo() {
	a = a + 1;
}

function bar() {
	a = a * 2;
}

// ajax(..) es una función Ajax arbitraria dada por una biblioteca
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

En el comportamiento single-threaded de JavaScript, si `foo()` corre antes que `bar()`, el resultado será que `a` vale `42`, pero si `bar()` corre antes que `foo()` el resultado en `a` será `41`.

Si los eventos JS que comparten los mismos datos se ejecutaran en paralelo, los problemas serían mucho más sutiles. Considera las dos listas de pseudocódigo como los hilos que podrían correr respectivamente el código en `foo()` y `bar()`, y piensa qué ocurre si corren exactamente al mismo tiempo:

Hilo 1 (`X` y `Y` son ubicaciones temporales):
```
foo():
  a. load value of `a` in `X`
  b. store `1` in `Y`
  c. add `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

Hilo 2 (`X` y `Y` son ubicaciones temporales):
```
bar():
  a. load value of `a` in `X`
  b. store `2` in `Y`
  c. multiply `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

Si los dos hilos corren en paralelo, probablemente notes el problema: usan ubicaciones de memoria compartida `X` e `Y` para sus pasos temporales.

El resultado final en `a` dependerá del intercalamiento de los pasos. El ejemplo ilustra que sin protecciones específicas, la programación con hilos es muy propensa a comportamientos no deterministas.

JavaScript nunca comparte datos entre hilos, lo que significa que ese nivel de no determinismo no es una preocupación. Pero eso no significa que JS sea siempre determinista. Recuerda antes, donde el orden relativo de `foo()` y `bar()` produce dos resultados diferentes (`41` o `42`)?

**Nota:** Puede que no sea obvio todavía, pero no todo el no determinismo es malo. A veces es irrelevante, y otras veces es intencional. Veremos más ejemplos a lo largo de este y los siguientes capítulos.

### Ejecución hasta la finalización (Run-to-Completion)

Debido al single-threading de JavaScript, el código dentro de `foo()` (y `bar()`) es atómico, lo que significa que una vez que `foo()` comienza a ejecutarse, la totalidad de su código terminará antes de que cualquier código en `bar()` pueda ejecutarse, o viceversa. Esto se llama comportamiento "run-to-completion".

De hecho, las semánticas run-to-completion son más obvias cuando `foo()` y `bar()` tienen más código, por ejemplo:

```js
var a = 1;
var b = 2;

function foo() {
	a++;
	b = b * a;
	a = b + 3;
}

function bar() {
	b--;
	a = 8 + b;
	b = a * 2;
}

// ajax(..) es una función Ajax arbitraria dada por una biblioteca
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

Porque `foo()` no puede ser interrumpida por `bar()`, y `bar()` no puede ser interrumpida por `foo()`, este programa sólo tiene dos posibles resultados dependiendo de cuál empiece a ejecutarse primero — si existieran hilos y las sentencias pudieran entrelazarse, el número de resultados posibles sería mucho mayor.

Chunk 1 es síncrono (ocurre *ahora*), pero chunks 2 y 3 son asíncronos (ocurren *después*), lo que significa que su ejecución estará separada por una brecha de tiempo.

Chunk 1:
```js
var a = 1;
var b = 2;
```

Chunk 2 (`foo()`):
```js
a++;
b = b * a;
a = b + 3;
```

Chunk 3 (`bar()`):
```js
b--;
a = 8 + b;
b = a * 2;
```

Chunks 2 y 3 pueden ocurrir en cualquiera de los dos órdenes, por lo que hay dos posibles resultados para este programa, como se ilustra:

Resultado 1:
```js
var a = 1;
var b = 2;

// foo()
a++;
b = b * a;
a = b + 3;

// bar()
b--;
a = 8 + b;
b = a * 2;

a; // 11
b; // 22
```

Resultado 2:
```js
var a = 1;
var b = 2;

// bar()
b--;
a = 8 + b;
b = a * 2;

// foo()
a++;
b = b * a;
a = b + 3;

a; // 183
b; // 180
```

Dos resultados del mismo código implica que aún hay no determinismo, pero a nivel del orden de funciones/eventos, no a nivel de sentencias. En otras palabras, es *más determinista* que si hubieran hilos.

**Nota:** Si existiera una función en JS que de algún modo no tuviera comportamiento run-to-completion, podríamos tener muchos más resultados posibles. ES6 introduce justo tal cosa (ver Capítulo 4 "Generators"), pero no te preocupes ahora — volveremos a ello.

## Concurrencia

Imaginemos un sitio que muestra una lista de actualizaciones de estado (como un feed de red social) que se carga progresivamente mientras el usuario desplaza la página. Para que tal característica funcione correctamente, al menos dos "procesos" distintos necesitarán ejecutarse *simultáneamente* (es decir, durante la misma ventana de tiempo, pero no necesariamente en el mismo instante).

El primer "proceso" responderá a eventos `onscroll` (haciendo peticiones Ajax por nuevo contenido) a medida que el usuario scrollea la página. El segundo "proceso" recibirá las respuestas Ajax (para renderizar contenido en la página).

Obviamente, si el usuario scrollea lo suficientemente rápido, podrías ver dos o más eventos `onscroll` disparados durante el tiempo que toma obtener la primera respuesta y procesarla, y por tanto tendrás eventos `onscroll` y eventos de respuesta Ajax que se disparan rápidamente, entrelazándose.

La concurrencia ocurre cuando dos o más "procesos" están ejecutándose concurrentemente sobre el mismo periodo, independientemente de si sus operaciones se ejecutan *en paralelo* (en el mismo instante) o no. Puedes pensar en concurrencia como paralelismo a nivel de "proceso" (o tarea), en contraste con el paralelismo a nivel de operación (hilos en procesadores separados).

Para una ventana de tiempo dada (unos segundos de desplazamiento del usuario), visualicemos cada proceso como una serie de eventos/operaciones:

"Proceso" 1 (`onscroll` events):
```
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```

"Proceso" 2 (eventos de respuesta Ajax):
```
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```

Es bastante posible que un evento `onscroll` y un evento de respuesta Ajax estén listos para ser procesados exactamente al mismo *momento*. Por ejemplo, visualicemos estas secuencias en una línea de tiempo (timeline):

```
onscroll, request 1
onscroll, request 2          response 1
onscroll, request 3          response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6          response 4
onscroll, request 7
response 6
response 5
response 7
```

Pero, volviendo al bucle de eventos, JS sólo podrá manejar un evento a la vez, así que o `onscroll, request 2` ocurrirá primero, o `response 1` ocurrirá primero, pero no pueden ocurrir literalmente al mismo momento. Como niños en la cafetería de la escuela, sin importar la multitud que formen fuera de las puertas, tendrán que entrar en una sola fila para almorzar.

Visualicemos el entrelazado de todos estos eventos en la cola del event loop.

Cola del Event Loop:
```
onscroll, request 1   <--- Proceso 1 inicia
onscroll, request 2
response 1            <--- Proceso 2 inicia
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Proceso 1 termina
response 6
response 5
response 7            <--- Proceso 2 termina
```

"Proceso 1" y "Proceso 2" corren concurrentemente (a nivel de tareas), pero sus eventos individuales se ejecutan secuencialmente en la cola del event loop.

Por cierto, nota cómo `response 6` y `response 5` regresaron fuera del orden esperado.

El event loop single-threaded es una expresión de concurrencia (hay otras), y veremos más.

### No interacción

Mientras dos o más "procesos" entrelazan sus pasos/eventos concurrentemente dentro del mismo programa, no necesariamente necesitan interactuar entre sí si las tareas son no relacionadas. **Si no interactúan, el no determinismo es perfectamente aceptable.**

Por ejemplo:

```js
var res = {};

function foo(results) {
	res.foo = results;
}

function bar(results) {
	res.bar = results;
}

// ajax(..) es una función Ajax arbitraria dada por una biblioteca
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

En este caso, la orden relativa de las respuestas no importa, porque `res.foo` y `res.bar` son campos distintos y no dependen uno del otro.
