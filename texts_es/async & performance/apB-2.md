## Procesos Secuenciales Comunicantes (CSP)

"Procesos Secuenciales Comunicantes" (CSP) fue descrito por primera vez por C. A. R. Hoare en un artículo académico de 1978 (http://dl.acm.org/citation.cfm?doid=359576.359585), y posteriormente en un libro de 1985 (http://www.usingcsp.com/) del mismo nombre. CSP describe un método formal para que "procesos" concurrentes interactúen (es decir, "se comuniquen") durante el procesamiento.

Quizás recuerdes que examinamos "procesos" concurrentes en el Capítulo 1, así que nuestra exploración de CSP aquí se construirá sobre esa comprensión.

Como la mayoría de los grandes conceptos en la ciencia de la computación, CSP está profundamente impregnado de formalismo académico, expresado como un álgebra de procesos. Sin embargo, sospecho que los teoremas de álgebra simbólica no harán mucha diferencia práctica para el lector, así que querremos encontrar alguna otra forma de entender CSP.

Dejaré gran parte de la descripción formal y demostración de CSP a los escritos de Hoare, y a muchos otros fantásticos escritos desde entonces. En su lugar, intentaremos explicar brevemente la idea de CSP de la manera más no-académica e intuitivamente comprensible posible.

### Paso de Mensajes

El principio central en CSP es que toda comunicación/interacción entre procesos que de otra manera son independientes debe ser a través de paso formal de mensajes. Quizás en contra de tus expectativas, el paso de mensajes CSP se describe como una acción síncrona, donde el proceso emisor y el proceso receptor tienen que estar mutuamente listos para que el mensaje sea pasado.

¿Cómo podría tal mensajería síncrona estar posiblemente relacionada con la programación asíncrona en JavaScript?

Lo concreto de la relación viene de la naturaleza de cómo se usan los generadores ES6 para producir acciones de aspecto síncrono que bajo el capó pueden ser de hecho síncronas o (más probablemente) asíncronas.

En otras palabras, dos o más generadores ejecutándose concurrentemente pueden aparentar comunicarse síncronamente entre sí mientras preservan la asincronía fundamental del sistema porque el código de cada generador está pausado (es decir, "bloqueado") esperando la reanudación de una acción asíncrona.

¿Cómo funciona esto?

Imagina un generador (también conocido como "proceso") llamado "A" que quiere enviar un mensaje al generador "B". Primero, "A" hace `yield` del mensaje (pausando así a "A") para ser enviado a "B". Cuando "B" está listo y toma el mensaje, "A" entonces se reanuda (desbloquea).

Simétricamente, imagina un generador "A" que quiere un mensaje **de** "B". "A" hace `yield` de su petición (pausando así a "A") por el mensaje de "B", y una vez que "B" envía un mensaje, "A" toma el mensaje y se reanuda.

Una de las expresiones más populares de esta teoría de paso de mensajes CSP viene de la biblioteca core.async de ClojureScript, y también del lenguaje *go*. Estas interpretaciones de CSP encarnan la semántica de comunicación descrita en un conducto que se abre entre procesos llamado un "canal" (channel).

**Nota:** El término *canal* se usa en parte porque hay modos en los que más de un valor puede ser enviado a la vez al "buffer" del canal; esto es similar a lo que podrías pensar como un flujo (stream). No entraremos en profundidad sobre esto aquí, pero puede ser una técnica muy poderosa para gestionar flujos de datos.

En la noción más simple de CSP, un canal que creamos entre "A" y "B" tendría un método llamado `take(..)` para bloquear para recibir un valor, y un método llamado `put(..)` para bloquear para enviar un valor.

Esto podría verse así:

```js
var ch = channel();

function *foo() {
	var msg = yield take( ch );

	console.log( msg );
}

function *bar() {
	yield put( ch, "Hello World" );

	console.log( "message sent" );
}

run( foo );
run( bar );
// Hello World
// "message sent"
```

Compara esta interacción de paso de mensajes estructurada y síncrona(-en-apariencia) con el compartimiento de mensajes informal y no estructurado que `ASQ#runner(..)` proporciona a través del array `token.messages` y el `yield` cooperativo. En esencia, `yield put(..)` es una sola operación que tanto envía el valor como pausa la ejecución para transferir control, mientras que en ejemplos anteriores hacíamos esos como pasos separados.

Además, CSP enfatiza que realmente no "tranfieres control" explícitamente, sino que diseñas tus rutinas concurrentes para bloquearse esperando ya sea un valor recibido del canal, o para bloquearse intentando enviar un mensaje por el canal. El bloqueo alrededor de recibir o enviar mensajes es cómo coordinas la secuenciación del comportamiento entre las corrutinas.

**Nota:** Advertencia justa: este patrón es muy poderoso pero también es un poco retorcido mentalmente para acostumbrarse al principio. Querrás practicar esto un poco para acostumbrarte a esta nueva forma de pensar sobre la coordinación de tu concurrencia.

Hay varias grandes bibliotecas que han implementado este sabor de CSP en JavaScript, más notablemente "js-csp" (https://github.com/ubolonton/js-csp), que James Long (http://twitter.com/jlongster) bifurcó (https://github.com/jlongster/js-csp) y ha escrito extensamente sobre ello (http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript). Además, no se puede enfatizar lo suficiente lo increíbles que son los muchos escritos de David Nolen (http://twitter.com/swannodette) sobre el tema de adaptar el CSP core.async estilo go de ClojureScript a generadores JS (http://swannodette.github.io/2013/08/24/es6-generators-and-csp).

### Emulación CSP con asynquence

Como hemos estado discutiendo patrones asíncronos aquí en el contexto de mi biblioteca *asynquence*, podrías estar interesado en saber que podemos agregar bastante fácilmente una capa de emulación sobre el manejo de generadores de `ASQ#runner(..)` como un porting casi perfecto de la API y comportamiento de CSP. Esta capa de emulación se distribuye como una parte opcional del paquete "asynquence-contrib" junto con *asynquence*.

Muy similar al helper `state(..)` de antes, `ASQ.csp.go(..)` toma un generador -- en términos de go/core.async, se conoce como una goroutine -- y lo adapta para usar con `ASQ#runner(..)` devolviendo un nuevo generador.

En lugar de recibir un `token`, tu goroutine recibe un canal creado inicialmente (`ch` abajo) que todas las goroutines en esta ejecución compartirán. Puedes crear más canales (¡lo cual es frecuentemente bastante útil!) con `ASQ.csp.chan(..)`.

En CSP, modelamos toda la asincronía en términos de bloqueo sobre mensajes de canal, en lugar de bloquear esperando a que una Promesa/secuencia/thunk se complete.

Así que, en lugar de hacer `yield` de la Promesa devuelta por `request(..)`, `request(..)` debería devolver un canal del cual haces `take(..)` de un valor. En otras palabras, un canal de un solo valor es aproximadamente equivalente en este contexto/uso a una Promesa/secuencia.

Primero hagamos una versión consciente de canales de `request(..)`:

```js
function request(url) {
	var ch = ASQ.csp.channel();
	ajax( url ).then( function(content){
		// `putAsync(..)` es una versión de `put(..)` que
		// puede usarse fuera de un generador. Devuelve
		// una promesa para la completación de la operación. No
		// usamos esa promesa aquí, pero podríamos si
		// necesitáramos ser notificados cuando el valor hubiese
		// sido `take(..)`ado.
		ASQ.csp.putAsync( ch, content );
	} );
	return ch;
}
```

Del Capítulo 3, "promisory" es una utilidad productora de Promesas, "thunkory" del Capítulo 4 es una utilidad productora de thunks, y finalmente, en el Apéndice A inventamos "secuencioría" para una utilidad productora de secuencias.

Naturalmente, necesitamos acuñar un término simétrico aquí para una utilidad productora de canales. Así que llamémosla sin sorpresa una "canalería" ("channel" + "factory"). Como ejercicio para el lector, intenta definir una utilidad `channelify(..)` similar a `Promise.wrap(..)`/`promisify(..)` (Capítulo 3), `thunkify(..)` (Capítulo 4), y `ASQ.wrap(..)` (Apéndice A).

Ahora considera el ejemplo de Ajax concurrente usando CSP con sabor a *asynquence*:

```js
ASQ()
.runner(
	ASQ.csp.go( function*(ch){
		yield ASQ.csp.put( ch, "http://some.url.2" );

		var url1 = yield ASQ.csp.take( ch );
		// "http://some.url.1"

		var res1 = yield ASQ.csp.take( request( url1 ) );

		yield ASQ.csp.put( ch, res1 );
	} ),
	ASQ.csp.go( function*(ch){
		var url2 = yield ASQ.csp.take( ch );
		// "http://some.url.2"

		yield ASQ.csp.put( ch, "http://some.url.1" );

		var res2 = yield ASQ.csp.take( request( url2 ) );
		var res1 = yield ASQ.csp.take( ch );

		// pasar resultados al siguiente paso de la secuencia
		ch.buffer_size = 2;
		ASQ.csp.put( ch, res1 );
		ASQ.csp.put( ch, res2 );
	} )
)
.val( function(res1,res2){
	// `res1` viene de "http://some.url.1"
	// `res2` viene de "http://some.url.2"
} );
```

El paso de mensajes que intercambia las cadenas URL entre las dos goroutines es bastante directo. La primera goroutine hace una petición Ajax a la primera URL, y esa respuesta se pone en el canal `ch`. La segunda goroutine hace una petición Ajax a la segunda URL, luego obtiene la primera respuesta `res1` del canal `ch`. En ese punto, ambas respuestas `res1` y `res2` están completadas y listas.

Si quedan valores restantes en el canal `ch` al final de la ejecución de la goroutine, serán pasados al siguiente paso en la secuencia. Así que, para pasar mensaje(s) desde la goroutine final, haz `put(..)` de ellos en `ch`. Como se muestra, para evitar el bloqueo de esos `put(..)` finales, cambiamos `ch` al modo de buffering estableciendo su `buffer_size` en `2` (por defecto: `0`).

**Nota:** Ve muchos más ejemplos de usar CSP con sabor a *asynquence* aquí (https://gist.github.com/getify/e0d04f1f5aa24b1947ae).

## Repaso

Las Promesas y los generadores proporcionan los bloques de construcción fundamentales sobre los cuales podemos construir una asincronía mucho más sofisticada y capaz.

*asynquence* tiene utilidades para implementar *secuencias iterables*, *secuencias reactivas* (también conocidas como "Observables"), *corrutinas concurrentes*, e incluso *goroutines CSP*.

Esos patrones, combinados con las capacidades de callback de continuación y Promesas, le dan a *asynquence* una poderosa mezcla de diferentes funcionalidades asíncronas, todo integrado en una abstracción limpia de control de flujo asíncrono: la secuencia.
