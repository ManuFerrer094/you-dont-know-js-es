# You Don't Know JS: Async y Rendimiento
# Capítulo 1: Asincronía: Ahora y Después

Una de las partes más importantes y, sin embargo, frecuentemente malentendidas de la programación en un lenguaje como JavaScript es cómo expresar y manipular el comportamiento del programa distribuido a lo largo de un período de tiempo.

Esto no se trata solo de lo que sucede desde el inicio de un bucle `for` hasta el final de un bucle `for`, que por supuesto toma *algo de tiempo* (microsegundos a milisegundos) en completarse. Se trata de lo que sucede cuando parte de tu programa se ejecuta *ahora*, y otra parte de tu programa se ejecuta *después* -- hay una brecha entre *ahora* y *después* donde tu programa no se está ejecutando activamente.

Prácticamente todos los programas no triviales jamás escritos (especialmente en JS) han tenido que gestionar esta brecha de alguna manera u otra, ya sea esperando la entrada del usuario, solicitando datos de una base de datos o sistema de archivos, enviando datos a través de la red y esperando una respuesta, o realizando una tarea repetida en un intervalo fijo de tiempo (como una animación). En todas estas diversas formas, tu programa tiene que gestionar el estado a través de la brecha en el tiempo. Como dicen famosamente en Londres (del abismo entre la puerta del metro y la plataforma): "mind the gap."

De hecho, la relación entre las partes *ahora* y *después* de tu programa está en el corazón de la programación asíncrona.

La programación asíncrona ha existido desde el inicio de JS, sin duda. Pero la mayoría de los desarrolladores de JS nunca han considerado cuidadosamente exactamente cómo y por qué aparece en sus programas, ni han explorado varias *otras* formas de manejarla. El enfoque de *suficientemente bueno* siempre ha sido la humilde función callback. Muchos hasta el día de hoy insistirán en que los callbacks son más que suficientes.

Pero a medida que JS continúa creciendo tanto en alcance como en complejidad, para satisfacer las demandas cada vez más amplias de un lenguaje de programación de primera clase que se ejecuta en navegadores y servidores y en todo dispositivo concebible entre ambos, las dificultades con las que gestionamos la asincronía son cada vez más paralizantes, y claman por enfoques que sean tanto más capaces como más razonables.

Aunque todo esto pueda parecer bastante abstracto en este momento, te aseguro que lo abordaremos de manera más completa y concreta a medida que avancemos en este libro. Exploraremos una variedad de técnicas emergentes para la programación asíncrona en JavaScript a lo largo de los próximos capítulos.

Pero antes de llegar allí, vamos a tener que entender mucho más profundamente qué es la asincronía y cómo opera en JS.

## Un Programa en Fragmentos

Puedes escribir tu programa JS en un solo archivo *.js*, pero tu programa casi con certeza está compuesto por varios fragmentos, de los cuales solo uno se va a ejecutar *ahora*, y el resto se ejecutará *después*. La unidad más común de *fragmento* es la `function`.

El problema que la mayoría de los desarrolladores nuevos en JS parecen tener es que *después* no sucede estricta e inmediatamente después de *ahora*. En otras palabras, las tareas que no pueden completarse *ahora* van, por definición, a completarse de forma asíncrona, y por lo tanto no tendremos un comportamiento bloqueante como podrías esperar o desear intuitivamente.

Considera:

```js
// ajax(..) is some arbitrary Ajax function given by a library
var data = ajax( "http://some.url.1" );

console.log( data );
// Oops! `data` generally won't have the Ajax results
```

Probablemente seas consciente de que las solicitudes Ajax estándar no se completan de forma síncrona, lo que significa que la función `ajax(..)` aún no tiene ningún valor para devolver y ser asignado a la variable `data`. Si `ajax(..)` *pudiera* bloquear hasta que la respuesta regresara, entonces la asignación `data = ..` funcionaría bien.

Pero no es así como hacemos Ajax. Hacemos una solicitud Ajax asíncrona *ahora*, y no obtendremos los resultados de vuelta hasta *después*.

La forma más simple (¡pero definitivamente no la única, ni necesariamente la mejor!) de "esperar" desde *ahora* hasta *después* es usar una función, comúnmente llamada función callback:

```js
// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", function myCallbackFunction(data){

	console.log( data ); // Yay, I gots me some `data`!

} );
```

**Advertencia:** Puede que hayas oído que es posible hacer solicitudes Ajax síncronas. Aunque eso es técnicamente cierto, nunca jamás deberías hacerlo, bajo ninguna circunstancia, porque bloquea la interfaz del navegador (botones, menús, desplazamiento, etc.) e impide cualquier interacción del usuario. Esta es una idea terrible, y siempre debe evitarse.

Antes de que protestes en desacuerdo, no, tu deseo de evitar el desorden de los callbacks *no* es justificación para Ajax síncrono y bloqueante.

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

Hay dos fragmentos en este programa: lo que se ejecutará *ahora* y lo que se ejecutará *después*. Debería ser bastante obvio cuáles son esos dos fragmentos, pero seamos súper explícitos:

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

El fragmento *ahora* se ejecuta de inmediato, tan pronto como ejecutas tu programa. Pero `setTimeout(..)` también configura un evento (un timeout) para que ocurra *después*, así que el contenido de la función `later()` se ejecutará en un momento posterior (1.000 milisegundos a partir de ahora).

Cada vez que envuelves una porción de código en una `function` y especificas que debe ejecutarse en respuesta a algún evento (temporizador, clic del ratón, respuesta Ajax, etc.), estás creando un fragmento *posterior* de tu código, y por lo tanto introduciendo asincronía en tu programa.

### Console Asíncrona

No existe una especificación ni un conjunto de requisitos sobre cómo funcionan los métodos `console.*` -- no son oficialmente parte de JavaScript, sino que son añadidos a JS por el *entorno anfitrión* (consulta el título *Types & Grammar* de esta serie de libros).

Así que, diferentes navegadores y entornos JS hacen lo que les parece, lo cual a veces puede llevar a un comportamiento confuso.

En particular, hay algunos navegadores y algunas condiciones en las que `console.log(..)` no emite inmediatamente lo que se le pasa. La razón principal por la que esto puede ocurrir es que la E/S es una parte muy lenta y bloqueante de muchos programas (no solo JS). Por lo tanto, puede ser mejor (desde la perspectiva de la página/UI) que un navegador maneje la E/S de `console` de forma asíncrona en segundo plano, sin que tú tal vez sepas siquiera que ocurrió.

Un escenario no muy común, pero posible, donde esto podría ser *observable* (no desde el código mismo sino desde el exterior):

```js
var a = {
	index: 1
};

// later
console.log( a ); // ??

// even later
a.index++;
```

Normalmente esperaríamos que el objeto `a` se capture en el momento exacto de la sentencia `console.log(..)`, imprimiendo algo como `{ index: 1 }`, de manera que en la siguiente sentencia cuando ocurre `a.index++`, esté modificando algo diferente de, o estrictamente después de, la salida de `a`.

La mayoría de las veces, el código anterior probablemente producirá una representación del objeto en la consola de las herramientas de desarrollo que es lo que esperarías. Pero es posible que este mismo código se ejecute en una situación donde el navegador sintió que necesitaba diferir la E/S de la consola al segundo plano, en cuyo caso es *posible* que para cuando el objeto se represente en la consola del navegador, `a.index++` ya haya ocurrido, y muestre `{ index: 2 }`.

Es un objetivo móvil bajo qué condiciones exactamente la E/S de `console` será diferida, o incluso si será observable. Solo ten en cuenta esta posible asincronicidad en la E/S en caso de que alguna vez te encuentres con problemas en la depuración donde los objetos han sido modificados *después* de una sentencia `console.log(..)` y sin embargo ves las modificaciones inesperadas aparecer.

**Nota:** Si te encuentras con este escenario poco común, la mejor opción es usar puntos de interrupción en tu depurador de JS en lugar de depender de la salida de `console`. La siguiente mejor opción sería forzar una "instantánea" del objeto en cuestión serializándolo a un `string`, como con `JSON.stringify(..)`.

## Event Loop

Hagamos una afirmación (quizás impactante): a pesar de permitir claramente código JS asíncrono (como el timeout que acabamos de ver), hasta hace poco (ES6), JavaScript en sí mismo nunca ha tenido realmente ninguna noción directa de asincronía incorporada.

**¡¿Qué?!** Eso parece una afirmación descabellada, ¿verdad? De hecho, es bastante cierta. El motor de JS en sí mismo nunca ha hecho más que ejecutar un solo fragmento de tu programa en cualquier momento dado, cuando se le pidió.

"Se le pidió." ¿Por quién? ¡Esa es la parte importante!

El motor de JS no se ejecuta de forma aislada. Se ejecuta dentro de un *entorno anfitrión*, que para la mayoría de los desarrolladores es el típico navegador web. A lo largo de los últimos años (pero de ninguna manera exclusivamente), JS se ha expandido más allá del navegador hacia otros entornos, como servidores, a través de cosas como Node.js. De hecho, JavaScript se incorpora en todo tipo de dispositivos hoy en día, desde robots hasta bombillas.

Pero el "hilo" común (ese es un chiste asíncrono no tan sutil, por si acaso) de todos estos entornos es que tienen un mecanismo que maneja la ejecución de múltiples fragmentos de tu programa *a lo largo del tiempo*, invocando en cada momento al motor de JS, llamado el "event loop."

En otras palabras, el motor de JS no ha tenido un sentido innato del *tiempo*, sino que ha sido un entorno de ejecución bajo demanda para cualquier fragmento arbitrario de JS. Es el entorno circundante el que siempre ha *programado* "eventos" (ejecuciones de código JS).

Entonces, por ejemplo, cuando tu programa JS hace una solicitud Ajax para obtener algunos datos de un servidor, configuras el código de "respuesta" en una función (comúnmente llamada un "callback"), y el motor de JS le dice al entorno anfitrión, "Oye, voy a suspender la ejecución por ahora, pero cuando termines con esa solicitud de red, y tengas algunos datos, por favor *llama* a esta función *de vuelta*."

El navegador entonces se configura para escuchar la respuesta de la red, y cuando tiene algo que darte, programa la función callback para que se ejecute insertándola en el *event loop*.

Entonces, ¿qué es el *event loop*?

Conceptualicémoslo primero a través de algo de pseudocódigo:

```js
// `eventLoop` is an array that acts as a queue (first-in, first-out)
var eventLoop = [ ];
var event;

// keep going "forever"
while (true) {
	// perform a "tick"
	if (eventLoop.length > 0) {
		// get the next event in the queue
		event = eventLoop.shift();

		// now, execute the next event
		try {
			event();
		}
		catch (err) {
			reportError(err);
		}
	}
}
```

Esto es, por supuesto, pseudocódigo enormemente simplificado para ilustrar los conceptos. Pero debería ser suficiente para ayudar a obtener una mejor comprensión.

Como puedes ver, hay un bucle que se ejecuta continuamente representado por el bucle `while`, y cada iteración de este bucle se llama un "tick." Para cada tick, si un evento está esperando en la cola, se toma y se ejecuta. Estos eventos son tus funciones callback.

Es importante notar que `setTimeout(..)` no coloca tu callback en la cola del event loop. Lo que hace es configurar un temporizador; cuando el temporizador expira, el entorno coloca tu callback en el event loop, de manera que algún tick futuro lo recoja y lo ejecute.

¿Qué pasa si ya hay 20 elementos en el event loop en ese momento? Tu callback espera. Se pone en la fila detrás de los demás -- normalmente no hay una vía para adelantarse en la cola y saltarse la fila. Esto explica por qué los temporizadores de `setTimeout(..)` pueden no dispararse con perfecta precisión temporal. Se te garantiza (hablando aproximadamente) que tu callback no se disparará *antes* del intervalo de tiempo que especifiques, pero puede ocurrir en o después de ese tiempo, dependiendo del estado de la cola de eventos.

Entonces, en otras palabras, tu programa generalmente se divide en muchos fragmentos pequeños, que ocurren uno tras otro en la cola del event loop. Y técnicamente, otros eventos no relacionados directamente con tu programa también pueden intercalarse dentro de la cola.

**Nota:** Mencionamos "hasta hace poco" en relación con ES6 cambiando la naturaleza de dónde se gestiona la cola del event loop. Es mayormente una tecnicidad formal, pero ES6 ahora especifica cómo funciona el event loop, lo que significa que técnicamente está dentro del ámbito del motor de JS, en lugar de solo del *entorno anfitrión*. Una razón principal de este cambio es la introducción de las Promises de ES6, que discutiremos en el Capítulo 3, porque requieren la capacidad de tener control directo y detallado sobre la programación de operaciones en la cola del event loop (consulta la discusión de `setTimeout(..0)` en la sección "Cooperación").

## Hilos Paralelos

Es muy común confundir los términos "async" y "paralelo", pero en realidad son bastante diferentes. Recuerda, async se trata de la brecha entre *ahora* y *después*. Pero paralelo se trata de cosas que pueden ocurrir simultáneamente.

Las herramientas más comunes para la computación paralela son los procesos y los hilos. Los procesos y los hilos se ejecutan de forma independiente y pueden ejecutarse simultáneamente: en procesadores separados, o incluso en computadoras separadas, pero múltiples hilos pueden compartir la memoria de un solo proceso.

Un event loop, por el contrario, divide su trabajo en tareas y las ejecuta en serie, impidiendo el acceso paralelo y los cambios a la memoria compartida. El paralelismo y el "serialismo" pueden coexistir en la forma de event loops cooperantes en hilos separados.

El intercalado de hilos paralelos de ejecución y el intercalado de eventos asíncronos ocurren a niveles de granularidad muy diferentes.

Por ejemplo:

```js
function later() {
	answer = answer * 2;
	console.log( "Meaning of life:", answer );
}
```

Mientras que el contenido completo de `later()` se consideraría como una sola entrada en la cola del event loop, al pensar en un hilo en el que este código se ejecutaría, en realidad hay quizás una docena de operaciones de bajo nivel diferentes. Por ejemplo, `answer = answer * 2` requiere primero cargar el valor actual de `answer`, luego poner `2` en algún lugar, después realizar la multiplicación, y finalmente tomar el resultado y almacenarlo de nuevo en `answer`.

En un entorno de un solo hilo, realmente no importa que los elementos en la cola del hilo sean operaciones de bajo nivel, porque nada puede interrumpir el hilo. Pero si tienes un sistema paralelo, donde dos hilos diferentes están operando en el mismo programa, podrías muy probablemente tener un comportamiento impredecible.

Considera:

```js
var a = 20;

function foo() {
	a = a + 1;
}

function bar() {
	a = a * 2;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

En el comportamiento de un solo hilo de JavaScript, si `foo()` se ejecuta antes que `bar()`, el resultado es que `a` tiene `42`, pero si `bar()` se ejecuta antes que `foo()` el resultado en `a` será `41`.

Si los eventos de JS que comparten los mismos datos se ejecutaran en paralelo, los problemas serían mucho más sutiles. Considera estas dos listas de pseudocódigo de tareas como los hilos que podrían respectivamente ejecutar el código en `foo()` y `bar()`, y considera qué sucede si se ejecutan exactamente al mismo tiempo:

Hilo 1 (`X` e `Y` son ubicaciones de memoria temporales):
```
foo():
  a. load value of `a` in `X`
  b. store `1` in `Y`
  c. add `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

Hilo 2 (`X` e `Y` son ubicaciones de memoria temporales):
```
bar():
  a. load value of `a` in `X`
  b. store `2` in `Y`
  c. multiply `X` and `Y`, store result in `X`
  d. store value of `X` in `a`
```

Ahora, digamos que los dos hilos se están ejecutando verdaderamente en paralelo. Probablemente puedas detectar el problema, ¿verdad? Usan ubicaciones de memoria compartidas `X` e `Y` para sus pasos temporales.

¿Cuál es el resultado final en `a` si los pasos ocurren así?

```
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
1b  (store `1` in `Y`   ==> `1`)
2b  (store `2` in `Y`   ==> `2`)
1c  (add `X` and `Y`, store result in `X`   ==> `22`)
1d  (store value of `X` in `a`   ==> `22`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `44`)
2d  (store value of `X` in `a`   ==> `44`)
```

El resultado en `a` será `44`. ¿Pero qué pasa con este ordenamiento?

```
1a  (load value of `a` in `X`   ==> `20`)
2a  (load value of `a` in `X`   ==> `20`)
2b  (store `2` in `Y`   ==> `2`)
1b  (store `1` in `Y`   ==> `1`)
2c  (multiply `X` and `Y`, store result in `X`   ==> `20`)
1c  (add `X` and `Y`, store result in `X`   ==> `21`)
1d  (store value of `X` in `a`   ==> `21`)
2d  (store value of `X` in `a`   ==> `21`)
```

El resultado en `a` será `21`.

Así que, la programación con hilos es muy complicada, porque si no tomas medidas especiales para prevenir este tipo de interrupciones/intercalados, puedes obtener un comportamiento muy sorprendente y no determinístico que frecuentemente produce dolores de cabeza.

JavaScript nunca comparte datos entre hilos, lo que significa que *ese* nivel de no determinismo no es una preocupación. Pero eso no significa que JS sea siempre determinístico. Recuerda antes, donde el ordenamiento relativo de `foo()` y `bar()` produce dos resultados diferentes (`41` o `42`)?

**Nota:** Puede que aún no sea obvio, pero no todo el no determinismo es malo. A veces es irrelevante, y a veces es intencional. Veremos más ejemplos de eso a lo largo de este y los próximos capítulos.

### Ejecución Hasta Completar

Debido al modelo de un solo hilo de JavaScript, el código dentro de `foo()` (y `bar()`) es atómico, lo que significa que una vez que `foo()` comienza a ejecutarse, la totalidad de su código terminará antes de que cualquier código en `bar()` pueda ejecutarse, o viceversa. Esto se llama comportamiento de "ejecución hasta completar" (run-to-completion).

De hecho, la semántica de ejecución hasta completar es más obvia cuando `foo()` y `bar()` tienen más código en ellos, como:

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

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

Debido a que `foo()` no puede ser interrumpida por `bar()`, y `bar()` no puede ser interrumpida por `foo()`, este programa solo tiene dos resultados posibles dependiendo de cuál comienza a ejecutarse primero -- si hubiera hilos presentes, y las sentencias individuales en `foo()` y `bar()` pudieran intercalarse, ¡el número de resultados posibles aumentaría enormemente!

El Fragmento 1 es síncrono (sucede *ahora*), pero los fragmentos 2 y 3 son asíncronos (suceden *después*), lo que significa que su ejecución estará separada por una brecha de tiempo.

Fragmento 1:
```js
var a = 1;
var b = 2;
```

Fragmento 2 (`foo()`):
```js
a++;
b = b * a;
a = b + 3;
```

Fragmento 3 (`bar()`):
```js
b--;
a = 8 + b;
b = a * 2;
```

Los Fragmentos 2 y 3 pueden ocurrir en cualquier orden, así que hay dos resultados posibles para este programa, como se ilustra aquí:

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

Dos resultados del mismo código significan que todavía tenemos no determinismo. Pero está al nivel del ordenamiento de funciones (eventos), en lugar del nivel de ordenamiento de sentencias (o, de hecho, al nivel de ordenamiento de operaciones de expresiones) como ocurre con los hilos. En otras palabras, es *más determinístico* de lo que habrían sido los hilos.

Aplicado al comportamiento de JavaScript, este no determinismo en el ordenamiento de funciones es lo que comúnmente se denomina "condición de carrera" (race condition), ya que `foo()` y `bar()` están compitiendo entre sí para ver cuál se ejecuta primero. Específicamente, es una "condición de carrera" porque no puedes predecir de manera confiable cómo resultarán `a` y `b`.

**Nota:** Si hubiera una función en JS que de alguna manera no tuviera comportamiento de ejecución hasta completar, podríamos tener muchos más resultados posibles, ¿verdad? Resulta que ES6 introduce precisamente algo así (ver Capítulo 4 "Generators"), ¡pero no te preocupes ahora, volveremos a eso!

## Concurrencia

Imaginemos un sitio que muestra una lista de actualizaciones de estado (como un feed de noticias de una red social) que se carga progresivamente a medida que el usuario se desplaza hacia abajo en la lista. Para que esta característica funcione correctamente, (al menos) dos "procesos" separados necesitarán estar ejecutándose *simultáneamente* (es decir, durante la misma ventana de tiempo, pero no necesariamente en el mismo instante).

**Nota:** Estamos usando "proceso" entre comillas aquí porque no son verdaderos procesos a nivel de sistema operativo en el sentido de la ciencia de la computación. Son procesos virtuales, o tareas, que representan una serie de operaciones lógicamente conectadas y secuenciales. Simplemente preferiremos "proceso" sobre "tarea" porque, en términos de terminología, coincidirá con las definiciones de los conceptos que estamos explorando.

El primer "proceso" responderá a los eventos `onscroll` (haciendo solicitudes Ajax para nuevo contenido) a medida que se disparen cuando el usuario se haya desplazado más abajo en la página. El segundo "proceso" recibirá las respuestas Ajax de vuelta (para renderizar contenido en la página).

Obviamente, si un usuario se desplaza lo suficientemente rápido, podrías ver dos o más eventos `onscroll` disparados durante el tiempo que toma obtener la primera respuesta de vuelta y procesarla, y por lo tanto vas a tener eventos `onscroll` y eventos de respuesta Ajax disparándose rápidamente, intercalados entre sí.

La concurrencia es cuando dos o más "procesos" se ejecutan simultáneamente durante el mismo período, independientemente de si sus operaciones constituyentes individuales ocurren *en paralelo* (en el mismo instante en procesadores o núcleos separados) o no. Puedes pensar en la concurrencia entonces como paralelismo a nivel de "proceso" (o a nivel de tarea), en oposición al paralelismo a nivel de operación (hilos en procesadores separados).

**Nota:** La concurrencia también introduce una noción opcional de que estos "procesos" interactúen entre sí. Volveremos a eso más adelante.

Para una ventana de tiempo dada (unos pocos segundos de un usuario desplazándose), visualicemos cada "proceso" independiente como una serie de eventos/operaciones:

"Proceso" 1 (eventos `onscroll`):
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

Es bastante posible que un evento `onscroll` y un evento de respuesta Ajax pudieran estar listos para ser procesados exactamente en el mismo *momento*. Por ejemplo, visualicemos estos eventos en una línea de tiempo:

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

Pero, volviendo a nuestra noción del event loop de antes en el capítulo, JS solo va a poder manejar un evento a la vez, así que o bien `onscroll, request 2` va a suceder primero o `response 1` va a suceder primero, pero no pueden suceder literalmente al mismo instante. Igual que los niños en una cafetería escolar, sin importar qué multitud formen fuera de las puertas, ¡tendrán que fusionarse en una sola fila para obtener su almuerzo!

Visualicemos el intercalado de todos estos eventos en la cola del event loop.

Cola del Event Loop:
```
onscroll, request 1   <--- Process 1 starts
onscroll, request 2
response 1            <--- Process 2 starts
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Process 1 finishes
response 6
response 5
response 7            <--- Process 2 finishes
```

El "Proceso 1" y el "Proceso 2" se ejecutan concurrentemente (en paralelo a nivel de tarea), pero sus eventos individuales se ejecutan secuencialmente en la cola del event loop.

Por cierto, ¿notas cómo `response 6` y `response 5` llegaron fuera del orden esperado?

El event loop de un solo hilo es una expresión de la concurrencia (ciertamente hay otras, a las que volveremos más adelante).

### Sin Interacción

Cuando dos o más "procesos" están intercalando sus pasos/eventos concurrentemente dentro del mismo programa, no necesariamente necesitan interactuar entre sí si las tareas no están relacionadas. **Si no interactúan, el no determinismo es perfectamente aceptable.**

Por ejemplo:

```js
var res = {};

function foo(results) {
	res.foo = results;
}

function bar(results) {
	res.bar = results;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

`foo()` y `bar()` son dos "procesos" concurrentes, y es no determinístico en qué orden se dispararán. Pero hemos construido el programa de manera que no importa en qué orden se disparen, porque actúan de forma independiente y, como tal, no necesitan interactuar.

Esto no es un bug de "condición de carrera", ya que el código siempre funcionará correctamente, independientemente del ordenamiento.

### Interacción

Más comúnmente, los "procesos" concurrentes por necesidad interactuarán, indirectamente a través del ámbito (scope) y/o el DOM. Cuando tal interacción ocurra, necesitas coordinar estas interacciones para prevenir "condiciones de carrera", como se describió anteriormente.

Aquí hay un ejemplo simple de dos "procesos" concurrentes que interactúan debido a un ordenamiento implícito, que solo se rompe *a veces*:

```js
var res = [];

function response(data) {
	res.push( data );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

Los "procesos" concurrentes son las dos llamadas a `response()` que se harán para manejar las respuestas Ajax. Pueden ocurrir en cualquier orden.

Asumamos que el comportamiento esperado es que `res[0]` tenga los resultados de la llamada a `"http://some.url.1"`, y `res[1]` tenga los resultados de la llamada a `"http://some.url.2"`. A veces ese será el caso, pero a veces estarán invertidos, dependiendo de cuál llamada termine primero. Hay una probabilidad bastante alta de que este no determinismo sea un bug de "condición de carrera".

**Nota:** Sé extremadamente cauteloso con las suposiciones que podrías tender a hacer en estas situaciones. Por ejemplo, no es poco común que un desarrollador observe que `"http://some.url.2"` "siempre" es mucho más lenta en responder que `"http://some.url.1"`, quizás por la naturaleza de las tareas que realizan (por ejemplo, una realizando una tarea de base de datos y la otra simplemente obteniendo un archivo estático), así que el ordenamiento observado parece ser siempre el esperado. Incluso si ambas solicitudes van al mismo servidor, y *este* intencionalmente responde en un cierto orden, no hay *ninguna* garantía real de en qué orden llegarán las respuestas al navegador.

Entonces, para abordar tal condición de carrera, puedes coordinar la interacción de ordenamiento:

```js
var res = [];

function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

Sin importar cuál respuesta Ajax llegue primero, inspeccionamos `data.url` (¡asumiendo que una es devuelta por el servidor, por supuesto!) para determinar qué posición deben ocupar los datos de respuesta en el array `res`. `res[0]` siempre contendrá los resultados de `"http://some.url.1"` y `res[1]` siempre contendrá los resultados de `"http://some.url.2"`. A través de una simple coordinación, eliminamos el no determinismo de la "condición de carrera".

El mismo razonamiento de este escenario se aplicaría si múltiples llamadas a funciones concurrentes estuvieran interactuando entre sí a través del DOM compartido, como una actualizando el contenido de un `<div>` y la otra actualizando el estilo o los atributos del `<div>` (por ejemplo, para hacer visible el elemento DOM una vez que tenga contenido). Probablemente no querrías mostrar el elemento DOM antes de que tuviera contenido, así que la coordinación debe asegurar una interacción de ordenamiento adecuada.

Algunos escenarios de concurrencia están *siempre rotos* (no solo *a veces*) sin interacción coordinada. Considera:

```js
var a, b;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(y) {
	b = y * 2;
	baz();
}

function baz() {
	console.log(a + b);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

En este ejemplo, ya sea que `foo()` o `bar()` se dispare primero, siempre causará que `baz()` se ejecute demasiado pronto (ya sea `a` o `b` todavía será `undefined`), pero la segunda invocación de `baz()` funcionará, ya que tanto `a` como `b` estarán disponibles.

Hay diferentes formas de abordar tal condición. Aquí hay una forma simple:

```js
var a, b;

function foo(x) {
	a = x * 2;
	if (a && b) {
		baz();
	}
}

function bar(y) {
	b = y * 2;
	if (a && b) {
		baz();
	}
}

function baz() {
	console.log( a + b );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

El condicional `if (a && b)` alrededor de la llamada a `baz()` se llama tradicionalmente una "compuerta" (gate), porque no estamos seguros en qué orden llegarán `a` y `b`, pero esperamos a que ambos estén ahí antes de proceder a abrir la compuerta (llamar a `baz()`).

Otra condición de interacción de concurrencia que podrías encontrar a veces se llama una "carrera" (race), pero más correctamente se denomina un "cerrojo" (latch). Se caracteriza por el comportamiento de "solo el primero gana". Aquí, el no determinismo es aceptable, en el sentido de que estás diciendo explícitamente que está bien que la "carrera" hacia la línea de meta tenga solo un ganador.

Considera este código roto:

```js
var a;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(x) {
	a = x / 2;
	baz();
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

Cualquiera que se dispare último (`foo()` o `bar()`) no solo sobrescribirá el valor asignado de `a` por el otro, sino que también duplicará la llamada a `baz()` (probablemente no deseado).

Entonces, podemos coordinar la interacción con un simple cerrojo, para dejar pasar solo al primero:

```js
var a;

function foo(x) {
	if (a == undefined) {
		a = x * 2;
		baz();
	}
}

function bar(x) {
	if (a == undefined) {
		a = x / 2;
		baz();
	}
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

El condicional `if (a == undefined)` solo permite pasar al primero de `foo()` o `bar()`, y el segundo (y de hecho cualquier subsiguiente) simplemente sería ignorado. ¡No hay ninguna virtud en llegar en segundo lugar!

**Nota:** En todos estos escenarios, hemos estado usando variables globales con propósitos de ilustración simplista, pero no hay nada en nuestro razonamiento aquí que lo requiera. Siempre que las funciones en cuestión puedan acceder a las variables (a través del scope), funcionarán como se pretende. Depender de variables con ámbito léxico (consulta el título *Scope & Closures* de esta serie de libros), y de hecho variables globales como en estos ejemplos, es una desventaja obvia de estas formas de coordinación de concurrencia. A medida que avancemos en los próximos capítulos, veremos otras formas de coordinación que son mucho más limpias en ese aspecto.

### Cooperación

Otra expresión de la coordinación de concurrencia se llama "concurrencia cooperativa." Aquí, el enfoque no está tanto en interactuar mediante el intercambio de valores en ámbitos (¡aunque eso obviamente sigue permitido!). El objetivo es tomar un "proceso" de larga duración y dividirlo en pasos o lotes para que otros "procesos" concurrentes tengan la oportunidad de intercalar sus operaciones en la cola del event loop.

Por ejemplo, considera un manejador de respuesta Ajax que necesita recorrer una larga lista de resultados para transformar los valores. Usaremos `Array#map(..)` para mantener el código más corto:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `data` values doubled
		data.map( function(val){
			return val * 2;
		} )
	);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

Si `"http://some.url.1"` obtiene sus resultados primero, la lista completa se mapeará en `res` de una sola vez. Si son unos pocos miles de registros o menos, esto generalmente no es un gran problema. Pero si son, digamos, 10 millones de registros, eso puede tomar un tiempo en ejecutarse (varios segundos en un portátil potente, mucho más en un dispositivo móvil, etc.).

Mientras tal "proceso" se ejecuta, nada más en la página puede ocurrir, incluyendo ninguna otra llamada a `response(..)`, ninguna actualización de la UI, ni siquiera eventos del usuario como desplazamiento, escritura, clics de botones, y similares. Eso es bastante doloroso.

Entonces, para hacer un sistema más cooperativamente concurrente, uno que sea más amigable y no acapare la cola del event loop, puedes procesar estos resultados en lotes asíncronos, después de cada uno "cediendo" de vuelta al event loop para dejar que otros eventos en espera ocurran.

Aquí hay un enfoque muy simple:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// let's just do 1000 at a time
	var chunk = data.splice( 0, 1000 );

	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `chunk` values doubled
		chunk.map( function(val){
			return val * 2;
		} )
	);

	// anything left to process?
	if (data.length > 0) {
		// async schedule next batch
		setTimeout( function(){
			response( data );
		}, 0 );
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

Procesamos el conjunto de datos en fragmentos de tamaño máximo de 1.000 elementos. Al hacerlo, aseguramos un "proceso" de corta duración, incluso si eso significa muchos más "procesos" subsiguientes, ya que el intercalado en la cola del event loop nos dará un sitio/aplicación mucho más receptivo (con mejor rendimiento).

Por supuesto, no estamos coordinando la interacción del ordenamiento de ninguno de estos "procesos", así que el orden de los resultados en `res` no será predecible. Si se requiriera ordenamiento, necesitarías usar técnicas de interacción como las que discutimos antes, o las que cubriremos en capítulos posteriores de este libro.

Usamos el `setTimeout(..0)` (hack) para la programación asíncrona, que básicamente solo significa "coloca esta función al final de la cola actual del event loop."

**Nota:** `setTimeout(..0)` no está técnicamente insertando un elemento directamente en la cola del event loop. El temporizador insertará el evento en su próxima oportunidad. Por ejemplo, dos llamadas consecutivas a `setTimeout(..0)` no estarían estrictamente garantizadas de procesarse en el orden de llamada, así que *es* posible ver varias condiciones como desviación del temporizador donde el ordenamiento de tales eventos no es predecible. En Node.js, un enfoque similar es `process.nextTick(..)`. A pesar de lo conveniente (y generalmente más eficiente) que sería, no hay una forma directa única (al menos aún) en todos los entornos para garantizar el ordenamiento de eventos asíncronos. Cubriremos este tema con más detalle en la siguiente sección.

## Jobs

A partir de ES6, hay un nuevo concepto superpuesto sobre la cola del event loop, llamada la "cola de Jobs" (Job queue). La exposición más probable que tendrás a ella es con el comportamiento asíncrono de las Promises (ver Capítulo 3).

Desafortunadamente, en este momento es un mecanismo sin una API expuesta, y por lo tanto demostrarlo es un poco más complicado. Así que vamos a tener que simplemente describirlo conceptualmente, de manera que cuando discutamos el comportamiento asíncrono con Promises en el Capítulo 3, entiendas cómo esas acciones están siendo programadas y procesadas.

Entonces, la mejor manera de pensar en esto que he encontrado es que la "cola de Jobs" es una cola que cuelga al final de cada tick en la cola del event loop. Ciertas acciones implícitas asíncronas que pueden ocurrir durante un tick del event loop no causarán que un evento completamente nuevo se añada a la cola del event loop, sino que en su lugar añadirán un elemento (también conocido como Job) al final de la cola de Jobs del tick actual.

Es como decir, "oh, aquí hay esta otra cosa que necesito hacer *después*, pero asegúrate de que suceda de inmediato antes de que cualquier otra cosa pueda ocurrir."

O, para usar una metáfora: la cola del event loop es como una atracción de un parque de diversiones, donde una vez que terminas el recorrido, tienes que ir al final de la fila para subirte de nuevo. Pero la cola de Jobs es como terminar el recorrido, pero luego colarte en la fila y subirte de nuevo de inmediato.

Un Job también puede causar que más Jobs se añadan al final de la misma cola. Por lo tanto, es teóricamente posible que un "bucle" de Jobs (un Job que sigue añadiendo otro Job, etc.) pueda girar indefinidamente, privando así al programa de la capacidad de avanzar al siguiente tick del event loop. Esto sería conceptualmente casi lo mismo que simplemente expresar un bucle de larga duración o infinito (como `while (true) ..`) en tu código.

Los Jobs son algo así como el espíritu del hack `setTimeout(..0)`, pero implementados de tal manera que tienen un ordenamiento mucho más definido y garantizado: **después, pero tan pronto como sea posible**.

Imaginemos una API para programar Jobs (directamente, sin hacks), y llamémosla `schedule(..)`. Considera:

```js
console.log( "A" );

setTimeout( function(){
	console.log( "B" );
}, 0 );

// theoretical "Job API"
schedule( function(){
	console.log( "C" );

	schedule( function(){
		console.log( "D" );
	} );
} );
```

Podrías esperar que esto imprima `A B C D`, pero en su lugar imprimiría `A C D B`, porque los Jobs ocurren al final del tick actual del event loop, y el temporizador se dispara para programar en el *siguiente* tick del event loop (¡si está disponible!).

En el Capítulo 3, veremos que el comportamiento asíncrono de las Promises está basado en Jobs, así que es importante tener claro cómo eso se relaciona con el comportamiento del event loop.

## Ordenamiento de Sentencias

El orden en que expresamos las sentencias en nuestro código no es necesariamente el mismo orden en que el motor de JS las ejecutará. Eso puede parecer una afirmación bastante extraña, así que simplemente lo exploraremos brevemente.

Pero antes de hacerlo, deberíamos tener absolutamente claro algo: las reglas/gramática del lenguaje (consulta el título *Types & Grammar* de esta serie de libros) dictan un comportamiento muy predecible y confiable para el ordenamiento de sentencias desde el punto de vista del programa. Así que lo que estamos a punto de discutir son **cosas que nunca deberías poder observar** en tu programa JS.

**Advertencia:** Si alguna vez pudieras *observar* la reordenación de sentencias del compilador como estamos a punto de ilustrar, eso sería una clara violación de la especificación, y sin duda sería debido a un bug en el motor de JS en cuestión -- uno que debería ser reportado y corregido de inmediato. Pero es muchísimo más común que *sospeches* que algo extraño está pasando en el motor de JS, cuando de hecho es solo un bug (¡probablemente una "condición de carrera"!) en tu propio código -- así que busca ahí primero, una y otra vez. El depurador de JS, usando puntos de interrupción y avanzando paso a paso por el código línea por línea, será tu herramienta más poderosa para detectar tales bugs en *tu código*.

Considera:

```js
var a, b;

a = 10;
b = 30;

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

Este código no tiene asincronía expresada (¡aparte de la rara E/S asíncrona de `console` discutida antes!), así que la suposición más probable es que se procesaría línea por línea de arriba hacia abajo.

Pero es *posible* que el motor de JS, después de compilar este código (sí, JS se compila -- ¡consulta el título *Scope & Closures* de esta serie de libros!) pudiera encontrar oportunidades de ejecutar tu código más rápido reordenando (de forma segura) el orden de estas sentencias. Esencialmente, siempre y cuando no puedas observar la reordenación, todo vale.

Por ejemplo, el motor podría encontrar que es más rápido ejecutar el código así:

```js
var a, b;

a = 10;
a++;

b = 30;
b++;

console.log( a + b ); // 42
```

O así:

```js
var a, b;

a = 11;
b = 31;

console.log( a + b ); // 42
```

O incluso:

```js
// because `a` and `b` aren't used anymore, we can
// inline and don't even need them!
console.log( 42 ); // 42
```

En todos estos casos, el motor de JS está realizando optimizaciones seguras durante su compilación, ya que el resultado *observable* final será el mismo.

Pero aquí hay un escenario donde estas optimizaciones específicas serían inseguras y por lo tanto no podrían permitirse (por supuesto, no quiere decir que no se optimice en absoluto):

```js
var a, b;

a = 10;
b = 30;

// we need `a` and `b` in their preincremented state!
console.log( a * b ); // 300

a = a + 1;
b = b + 1;

console.log( a + b ); // 42
```

Otros ejemplos donde la reordenación del compilador podría crear efectos secundarios observables (y por lo tanto debe ser prohibida) incluirían cosas como cualquier llamada a función con efectos secundarios (incluyendo y especialmente funciones getter), u objetos Proxy de ES6 (consulta el título *ES6 & Beyond* de esta serie de libros).

Considera:

```js
function foo() {
	console.log( b );
	return 1;
}

var a, b, c;

// ES5.1 getter literal syntax
c = {
	get bar() {
		console.log( a );
		return 1;
	}
};

a = 10;
b = 30;

a += foo();				// 30
b += c.bar;				// 11

console.log( a + b );	// 42
```

Si no fuera por las sentencias `console.log(..)` en este fragmento (solo usadas como una forma conveniente de efecto secundario observable para la ilustración), el motor de JS probablemente habría sido libre, si quisiera (¡quién sabe si lo haría!?), de reordenar el código a:

```js
// ...

a = 10 + foo();
b = 30 + c.bar;

// ...
```

Mientras que la semántica de JS afortunadamente nos protege de las pesadillas *observables* que la reordenación de sentencias del compilador parecería poner en peligro, es importante entender cuán tenue es el vínculo entre la forma en que el código fuente se escribe (de arriba hacia abajo) y la forma en que se ejecuta después de la compilación.

La reordenación de sentencias del compilador es casi una micro-metáfora de la concurrencia y la interacción. Como concepto general, tal conciencia puede ayudarte a entender mejor los problemas de flujo de código asíncrono en JS.

## Repaso

Un programa JavaScript se divide (prácticamente) siempre en dos o más fragmentos, donde el primer fragmento se ejecuta *ahora* y el siguiente fragmento se ejecuta *después*, en respuesta a un evento. Aunque el programa se ejecuta fragmento por fragmento, todos comparten el mismo acceso al ámbito y estado del programa, así que cada modificación al estado se hace sobre el estado anterior.

Siempre que hay eventos para ejecutar, el *event loop* se ejecuta hasta que la cola está vacía. Cada iteración del event loop es un "tick." La interacción del usuario, la E/S y los temporizadores encolan eventos en la cola de eventos.

En cualquier momento dado, solo un evento puede ser procesado de la cola a la vez. Mientras un evento se está ejecutando, puede directa o indirectamente causar uno o más eventos subsiguientes.

La concurrencia es cuando dos o más cadenas de eventos se intercalan a lo largo del tiempo, de manera que desde una perspectiva de alto nivel, parecen estar ejecutándose *simultáneamente* (aunque en cualquier momento dado solo un evento está siendo procesado).

A menudo es necesario hacer alguna forma de coordinación de interacción entre estos "procesos" concurrentes (a diferencia de los procesos del sistema operativo), por ejemplo para asegurar el ordenamiento o para prevenir "condiciones de carrera". Estos "procesos" también pueden *cooperar* dividiéndose en fragmentos más pequeños y permitiendo el intercalado de otros "procesos".
