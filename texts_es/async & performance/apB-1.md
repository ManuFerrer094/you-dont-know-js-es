# You Don't Know JS: Async & Performance
# Apéndice B: Patrones Asíncronos Avanzados

El Apéndice A introdujo la biblioteca *asynquence* para el control de flujo asíncrono orientado a secuencias, basado principalmente en Promesas y generadores.

Ahora exploraremos otros patrones asíncronos avanzados construidos sobre esa comprensión y funcionalidad existentes, y veremos cómo *asynquence* hace que esas técnicas asíncronas sofisticadas sean fáciles de mezclar y combinar en nuestros programas sin necesitar muchas bibliotecas separadas.

## Secuencias Iterables

Introdujimos las secuencias iterables de *asynquence* en el apéndice anterior, pero queremos revisarlas con más detalle.

Para refrescar, recuerda:

```js
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM está listo
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

Ahora, definamos una secuencia de múltiples pasos como una secuencia iterable:

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(x){
	return x * 2;
} )
.then( function STEP2(x){
	return x + 3;
} )
.then( function STEP3(x){
	return x * 4;
} );

steps.next( 8 ).value;	// 16
steps.next( 16 ).value;	// 19
steps.next( 19 ).value;	// 76
steps.next().done;		// true
```

Como puedes ver, una secuencia iterable es un *iterador* que cumple con el estándar (ver Capítulo 4). Así que puede ser iterada con un bucle `for..of` de ES6, igual que un generador (o cualquier otro *iterable*):

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(){ return 2; } )
.then( function STEP2(){ return 4; } )
.then( function STEP3(){ return 6; } )
.then( function STEP4(){ return 8; } )
.then( function STEP5(){ return 10; } );

for (var v of steps) {
	console.log( v );
}
// 2 4 6 8 10
```

Más allá del ejemplo de disparo de eventos mostrado en el apéndice anterior, las secuencias iterables son interesantes porque en esencia pueden verse como un sustituto de generadores o cadenas de Promesas, pero con aún más flexibilidad.

Considera un ejemplo de múltiples peticiones Ajax -- hemos visto el mismo escenario en los Capítulos 3 y 4, tanto como cadena de Promesas como generador, respectivamente -- expresado como una secuencia iterable:

```js
// ajax consciente de secuencias
var request = ASQ.wrap( ajax );

ASQ( "http://some.url.1" )
.runner(
	ASQ.iterable()

	.then( function STEP1(token){
		var url = token.messages[0];
		return request( url );
	} )

	.then( function STEP2(resp){
		return ASQ().gate(
			request( "http://some.url.2/?v=" + resp ),
			request( "http://some.url.3/?v=" + resp )
		);
	} )

	.then( function STEP3(r1,r2){ return r1 + r2; } )
)
.val( function(msg){
	console.log( msg );
} );
```

La secuencia iterable expresa una serie secuencial de pasos (síncronos o asíncronos) que se parece enormemente a una cadena de Promesas -- en otras palabras, es mucho más limpia visualmente que simples callbacks anidados, pero no tan agradable como la sintaxis secuencial basada en `yield` de los generadores.

Pero pasamos la secuencia iterable a `ASQ#runner(..)`, que la ejecuta hasta completarse de la misma manera que si fuera un generador. El hecho de que una secuencia iterable se comporte esencialmente igual que un generador es notable por un par de razones.

Primero, las secuencias iterables son una especie de equivalente pre-ES6 a un cierto subconjunto de generadores ES6, lo que significa que puedes o bien escribirlas directamente (para ejecutar en cualquier lugar), o puedes escribir generadores ES6 y transpilarlos/convertirlos a secuencias iterables (¡o cadenas de Promesas para el caso!).

Pensar en un generador asíncrono de ejecución-hasta-completar como simplemente azúcar sintáctico para una cadena de Promesas es un reconocimiento importante de su relación isomórfica.

Antes de continuar, debemos notar que el fragmento anterior podría haberse expresado en *asynquence* como:

```js
ASQ( "http://some.url.1" )
.seq( /*PASO 1*/ request )
.seq( function STEP2(resp){
	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )
.val( function STEP3(r1,r2){ return r1 + r2; } )
.val( function(msg){
	console.log( msg );
} );
```

Además, el paso 2 podría haberse expresado incluso como:

```js
.gate(
	function STEP2a(done,resp) {
		request( "http://some.url.2/?v=" + resp )
		.pipe( done );
	},
	function STEP2b(done,resp) {
		request( "http://some.url.3/?v=" + resp )
		.pipe( done );
	}
)
```

Entonces, ¿por qué nos tomaríamos la molestia de expresar nuestro control de flujo como una secuencia iterable en un paso `ASQ#runner(..)`, cuando parece que una cadena *asynquence* más simple/plana hace bien el trabajo?

Porque la forma de secuencia iterable tiene un truco importante bajo la manga que nos da más capacidad. Sigue leyendo.

### Extendiendo Secuencias Iterables

Los generadores, las secuencias normales de *asynquence* y las cadenas de Promesas, son todos **evaluados ansiosamente** -- cualquier control de flujo expresado inicialmente *es* el flujo fijo que se seguirá.

Sin embargo, las secuencias iterables son **evaluadas perezosamente**, lo que significa que durante la ejecución de la secuencia iterable, puedes extender la secuencia con más pasos si lo deseas.

**Nota:** Solo puedes añadir al final de una secuencia iterable, no insertar en medio de la secuencia.

Primero veamos un ejemplo más simple (síncrono) de esa capacidad para familiarizarnos con ella:

```js
function double(x) {
	x *= 2;

	// ¿deberíamos seguir extendiendo?
	if (x < 500) {
		isq.then( double );
	}

	return x;
}

// configurar secuencia iterable de un solo paso
var isq = ASQ.iterable().then( double );

for (var v = 10, ret;
	(ret = isq.next( v )) && !ret.done;
) {
	v = ret.value;
	console.log( v );
}
```

La secuencia iterable comienza con solo un paso definido (`isq.then(double)`), pero la secuencia sigue extendiéndose a sí misma bajo ciertas condiciones (`x < 500`). Tanto las secuencias de *asynquence* como las cadenas de Promesas técnicamente *pueden* hacer algo similar, pero veremos en un momento por qué su capacidad es insuficiente.

Aunque este ejemplo es bastante trivial y podría expresarse de otra manera con un bucle `while` en un generador, consideraremos casos más sofisticados.

Por ejemplo, podrías examinar la respuesta de una petición Ajax y si indica que se necesitan más datos, condicionalmente insertar más pasos en la secuencia iterable para hacer la(s) petición(es) adicional(es). O podrías condicionalmente añadir un paso de formateo de valor al final de tu manejo de Ajax.

Considera:

```js
var steps = ASQ.iterable()

.then( function STEP1(token){
	var url = token.messages[0].url;

	// ¿se proporcionó un paso de formateo adicional?
	if (token.messages[0].format) {
		steps.then( token.messages[0].format );
	}

	return request( url );
} )

.then( function STEP2(resp){
	// ¿añadir otra petición Ajax a la secuencia?
	if (/x1/.test( resp )) {
		steps.then( function STEP5(text){
			return request(
				"http://some.url.4/?v=" + text
			);
		} );
	}

	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )

.then( function STEP3(r1,r2){ return r1 + r2; } );
```

Puedes ver en dos lugares diferentes donde condicionalmente extendemos `steps` con `steps.then(..)`. Y para ejecutar esta secuencia iterable `steps`, simplemente la conectamos a nuestro flujo de programa principal con una secuencia *asynquence* (llamada `main` aquí) usando `ASQ#runner(..)`:

```js
var main = ASQ( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.runner( steps )
.val( function(msg){
	console.log( msg );
} );
```

¿Puede la flexibilidad (comportamiento condicional) de la secuencia iterable `steps` expresarse con un generador? Más o menos, pero tenemos que reorganizar la lógica de una manera ligeramente incómoda:

```js
function *steps(token) {
	// **PASO 1**
	var resp = yield request( token.messages[0].url );

	// **PASO 2**
	var rvals = yield ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);

	// **PASO 3**
	var text = rvals[0] + rvals[1];

	// **PASO 4**
	// ¿se proporcionó un paso de formateo adicional?
	if (token.messages[0].format) {
		text = yield token.messages[0].format( text );
	}

	// **PASO 5**
	// ¿necesitamos añadir otra petición Ajax a la secuencia?
	if (/foobar/.test( resp )) {
		text = yield request(
			"http://some.url.4/?v=" + text
		);
	}

	return text;
}

// nota: `*steps()` puede ser ejecutado por la misma secuencia `ASQ`
// que `steps` fue anteriormente
```

Dejando de lado los beneficios ya identificados de la sintaxis secuencial, de aspecto síncrono de los generadores (ver Capítulo 4), la lógica de `steps` tuvo que ser reordenada en la forma de generador `*steps()`, para simular el dinamismo de la secuencia iterable extensible `steps`.

¿Qué hay de expresar la funcionalidad con Promesas o secuencias? *Puedes* hacer algo así:

```js
var steps = something( .. )
.then( .. )
.then( function(..){
	// ..

	// ¿extendiendo la cadena, verdad?
	steps = steps.then( .. );

	// ..
})
.then( .. );
```

El problema es sutil pero importante de comprender. Así que, considera intentar conectar nuestra cadena de Promesas `steps` en nuestro flujo de programa principal -- esta vez expresado con Promesas en lugar de *asynquence*:

```js
var main = Promise.resolve( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.then( function(..){
	return steps;			// ¡pista!
} )
.val( function(msg){
	console.log( msg );
} );
```

¿Puedes detectar el problema ahora? ¡Mira de cerca!

Hay una condición de carrera para el ordenamiento de pasos de la secuencia. Cuando haces `return steps`, en ese momento `steps` *podría* ser la cadena de promesas originalmente definida, o podría ahora apuntar a la cadena de promesas extendida vía la llamada `steps = steps.then(..)`, dependiendo de qué orden sucedan las cosas.

Aquí están los dos posibles resultados:

* Si `steps` es todavía la cadena de promesas original, una vez que es posteriormente "extendida" por `steps = steps.then(..)`, esa promesa extendida al final de la cadena **no** es considerada por el flujo `main`, ya que ya se enganchó a la cadena `steps`. Esta es la desafortunadamente limitante **evaluación ansiosa**.
* Si `steps` ya es la cadena de promesas extendida, funciona como esperamos en que la promesa extendida es a la que `main` se engancha.

Aparte del hecho obvio de que una condición de carrera es intolerable, el primer caso es la preocupación; ilustra la **evaluación ansiosa** de la cadena de promesas. Por contraste, fácilmente extendimos la secuencia iterable sin tales problemas, porque las secuencias iterables son **evaluadas perezosamente**.

Cuanto más dinámico necesites tu control de flujo, más brillarán las secuencias iterables.

**Consejo:** Consulta más información y ejemplos de secuencias iterables en el sitio de *asynquence* (https://github.com/getify/asynquence/blob/master/README.md#iterable-sequences).

## Reactivo a Eventos

Debería ser obvio desde (¡al menos!) el Capítulo 3 que las Promesas son una herramienta muy poderosa en tu caja de herramientas asíncronas. Pero algo que claramente les falta es la capacidad de manejar flujos de eventos, ya que una Promesa solo puede resolverse una vez. Y francamente, esta exacta misma debilidad es cierta para las secuencias simples de *asynquence* también.

Considera un escenario donde quieras disparar una serie de pasos cada vez que se dispara un cierto evento. Una sola Promesa o secuencia no puede representar todas las ocurrencias de ese evento. Así que tienes que crear una cadena de Promesas (o secuencia) completamente nueva para *cada* ocurrencia del evento, como:

```js
listener.on( "foobar", function(data){

	// crear una nueva cadena de promesas para manejar el evento
	new Promise( function(resolve,reject){
		// ..
	} )
	.then( .. )
	.then( .. );

} );
```

La funcionalidad base que necesitamos está presente en este enfoque, pero está lejos de ser una forma deseable de expresar nuestra lógica pretendida. Hay dos capacidades separadas fusionadas en este paradigma: la escucha del evento, y la respuesta al evento; la separación de responsabilidades nos imploraría separar estas capacidades.

El lector cuidadosamente observador verá este problema como algo simétrico a los problemas que detallamos con callbacks en el Capítulo 2; es una especie de problema de inversión de control.

Imagina invertir este paradigma, así:

```js
var observable = listener.on( "foobar" );

// después
observable
.then( .. )
.then( .. );

// en otro lugar
observable
.then( .. )
.then( .. );
```

El valor `observable` no es exactamente una Promesa, pero puedes *observarlo* de manera muy similar a como puedes observar una Promesa, así que está estrechamente relacionado. De hecho, puede ser observado muchas veces, y enviará notificaciones cada vez que su evento (`"foobar"`) ocurra.

**Consejo:** Este patrón que acabo de ilustrar es una **simplificación masiva** de los conceptos y motivaciones detrás de la programación reactiva (también conocida como RP), que ha sido implementada/ampliada por varios grandes proyectos y lenguajes. Una variación de RP es la programación reactiva funcional (FRP), que se refiere a aplicar técnicas de programación funcional (inmutabilidad, integridad referencial, etc.) a flujos de datos. "Reactivo" se refiere a extender esta funcionalidad a lo largo del tiempo en respuesta a eventos. El lector interesado debería considerar estudiar "Observables Reactivos" en la fantástica biblioteca "Reactive Extensions" ("RxJS" para JavaScript) de Microsoft (http://rxjs.codeplex.com/); es mucho más sofisticada y poderosa de lo que acabo de mostrar. También, Andre Staltz tiene un excelente escrito (https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) que expone pragmáticamente la RP en ejemplos concretos.

### Observables ES7

Al momento de escribir esto, hay una propuesta temprana de ES7 para un nuevo tipo de dato llamado "Observable" (https://github.com/jhusain/asyncgenerator#introducing-observable), que en espíritu es similar a lo que hemos expuesto aquí, pero es definitivamente más sofisticado.

La noción de este tipo de Observable es que la forma en que te "suscribes" a los eventos de un flujo es pasando un generador -- en realidad el *iterador* es la parte interesada -- cuyo método `next(..)` será llamado para cada evento.

Podrías imaginártelo más o menos así:

```js
// `someEventStream` es un flujo de eventos, como de
// clics del ratón, y similares.

var observer = new Observer( someEventStream, function*(){
	while (var evt = yield) {
		console.log( evt );
	}
} );
```

El generador que pasas hará `yield` para pausar el bucle `while` esperando el siguiente evento. El *iterador* adjunto a la instancia del generador tendrá su `next(..)` llamado cada vez que `someEventStream` tenga un nuevo evento publicado, y así esos datos del evento reanudarán tu generador/*iterador* con los datos `evt`.

En la funcionalidad de suscripción a eventos aquí, es la parte del *iterador* la que importa, no el generador. Así que conceptualmente podrías pasar prácticamente cualquier iterable, incluyendo secuencias iterables `ASQ.iterable()`.

Interesantemente, también hay adaptadores propuestos para facilitar la construcción de Observables desde ciertos tipos de flujos, como `fromEvent(..)` para eventos DOM. Si miras una implementación sugerida de `fromEvent(..)` en la propuesta ES7 enlazada anteriormente, se parece enormemente al `ASQ.react(..)` que veremos en la siguiente sección.

Por supuesto, estas son todas propuestas tempranas, así que lo que resulte puede muy bien verse/comportarse diferente de lo mostrado aquí. ¡Pero es emocionante ver las alineaciones tempranas de conceptos entre diferentes bibliotecas y propuestas de lenguaje!

### Secuencias Reactivas

Con ese resumen locamente breve de Observables (y F/RP) como nuestra inspiración y motivación, ahora ilustraré una adaptación de un pequeño subconjunto de "Observables Reactivos," que llamo "Secuencias Reactivas."

Primero, comencemos con cómo crear un Observable, usando una utilidad de plug-in de *asynquence* llamada `react(..)`:

```js
var observable = ASQ.react( function setup(next){
	listener.on( "foobar", next );
} );
```

Ahora, veamos cómo definir una secuencia que "reacciona" -- en F/RP, esto se llama típicamente "suscribirse" -- a ese `observable`:

```js
observable
.seq( .. )
.then( .. )
.val( .. );
```

Así que simplemente defines la secuencia encadenando desde el Observable. Fácil, ¿verdad?

En F/RP, el flujo de eventos típicamente se canaliza a través de un conjunto de transformaciones funcionales, como `scan(..)`, `map(..)`, `reduce(..)`, y así sucesivamente. Con las secuencias reactivas, cada evento se canaliza a través de una nueva instancia de la secuencia. Veamos un ejemplo más concreto:

```js
ASQ.react( function setup(next){
	document.getElementById( "mybtn" )
	.addEventListener( "click", next, false );
} )
.seq( function(evt){
	var btnID = evt.target.id;
	return request(
		"http://some.url.1/?id=" + btnID
	);
} )
.val( function(text){
	console.log( text );
} );
```

La porción "reactiva" de la secuencia reactiva viene de asignar uno o más manejadores de eventos para invocar el disparador de eventos (llamando a `next(..)`).

La porción "secuencia" de la secuencia reactiva es exactamente como las secuencias que ya hemos explorado: cada paso puede ser cualquier técnica asíncrona que tenga sentido, desde callback de continuación hasta Promesa hasta generador.

Una vez que configuras una secuencia reactiva, continuará iniciando instancias de la secuencia mientras los eventos sigan disparándose. Si quieres detener una secuencia reactiva, puedes llamar a `stop()`.

Si una secuencia reactiva es `stop()`eada, probablemente quieras que el/los manejador(es) de eventos sean desregistrados también; puedes registrar un manejador de desmontaje para este propósito:

```js
var sq = ASQ.react( function setup(next,registerTeardown){
	var btn = document.getElementById( "mybtn" );

	btn.addEventListener( "click", next, false );

	// será llamado una vez que se llame a `sq.stop()`
	registerTeardown( function(){
		btn.removeEventListener( "click", next, false );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );

// después
sq.stop();
```

**Nota:** La referencia de enlace `this` dentro del manejador `setup(..)` es la misma secuencia reactiva `sq`, así que puedes usar la referencia `this` para añadir a la definición de la secuencia reactiva, llamar métodos como `stop()`, y demás.

Aquí hay un ejemplo del mundo Node.js, usando secuencias reactivas para manejar peticiones HTTP entrantes:

```js
var server = http.createServer();
server.listen(8000);

// observador reactivo
var request = ASQ.react( function setup(next,registerTeardown){
	server.addListener( "request", next );
	server.addListener( "close", this.stop );

	registerTeardown( function(){
		server.removeListener( "request", next );
		server.removeListener( "close", request.stop );
	} );
});

// responder a peticiones
request
.seq( pullFromDatabase )
.val( function(data,res){
	res.end( data );
} );

// desmontaje de node
process.on( "SIGINT", request.stop );
```

El disparador `next(..)` también puede adaptarse a flujos de node fácilmente, usando `onStream(..)` y `unStream(..)`:

```js
ASQ.react( function setup(next){
	var fstream = fs.createReadStream( "/some/file" );

	// canalizar el evento "data" del flujo a `next(..)`
	next.onStream( fstream );

	// escuchar el fin del flujo
	fstream.on( "end", function(){
		next.unStream( fstream );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );
```

También puedes usar combinaciones de secuencias para componer múltiples flujos de secuencias reactivas:

```js
var sq1 = ASQ.react( .. ).seq( .. ).then( .. );
var sq2 = ASQ.react( .. ).seq( .. ).then( .. );

var sq3 = ASQ.react(..)
.gate(
	sq1,
	sq2
)
.then( .. );
```

La conclusión principal es que `ASQ.react(..)` es una adaptación ligera de conceptos F/RP, habilitando la conexión de un flujo de eventos a una secuencia, de ahí el término "secuencia reactiva." Las secuencias reactivas son generalmente lo suficientemente capaces para usos reactivos básicos.

**Nota:** Aquí hay un ejemplo de usar `ASQ.react(..)` para gestionar estado de UI (http://jsbin.com/rozipaki/6/edit?js,output), y otro ejemplo de manejar flujos de petición/respuesta HTTP con `ASQ.react(..)` (https://gist.github.com/getify/bba5ec0de9d6047b720e).

## Corrutinas de Generadores

Esperemos que el Capítulo 4 te haya ayudado a familiarizarte bastante con los generadores ES6. En particular, queremos revisar la discusión sobre "Concurrencia de Generadores", y llevarla aún más lejos.

Imaginamos una utilidad `runAll(..)` que podía tomar dos o más generadores y ejecutarlos concurrentemente, dejándolos cooperativamente ceder con `yield` el control de uno al siguiente, con paso de mensajes opcional.

Además de poder ejecutar un solo generador hasta su completación, el `ASQ#runner(..)` que discutimos en el Apéndice A es una implementación similar de los conceptos de `runAll(..)`, que puede ejecutar múltiples generadores concurrentemente hasta completarse.

Así que veamos cómo podemos implementar el escenario de Ajax concurrente del Capítulo 4:

```js
ASQ(
	"http://some.url.2"
)
.runner(
	function*(token){
		// transferir control
		yield token;

		var url1 = token.messages[0]; // "http://some.url.1"

		// limpiar mensajes para empezar fresco
		token.messages = [];

		var p1 = request( url1 );

		// transferir control
		yield token;

		token.messages.push( yield p1 );
	},
	function*(token){
		var url2 = token.messages[0]; // "http://some.url.2"

		// pasar mensaje y transferir control
		token.messages[0] = "http://some.url.1";
		yield token;

		var p2 = request( url2 );

		// transferir control
		yield token;

		token.messages.push( yield p2 );

		// pasar resultados al siguiente paso de la secuencia
		return token.messages;
	}
)
.val( function(res){
	// `res[0]` viene de "http://some.url.1"
	// `res[1]` viene de "http://some.url.2"
} );
```

Las principales diferencias entre `ASQ#runner(..)` y `runAll(..)` son las siguientes:

* A cada generador (corrutina) se le proporciona un argumento que llamamos `token`, que es el valor especial para hacer `yield` cuando quieres transferir explícitamente el control a la siguiente corrutina.
* `token.messages` es un array que contiene cualquier mensaje pasado desde el paso anterior de la secuencia. También es una estructura de datos que puedes usar para compartir mensajes entre corrutinas.
* Hacer `yield` de un valor Promesa (o secuencia) no transfiere el control, sino que pausa el procesamiento de la corrutina hasta que ese valor esté listo.
* El último valor `return`ado o `yield`eado de la ejecución del procesamiento de corrutinas será pasado hacia adelante al siguiente paso en la secuencia.

También es fácil costruir helpers encima de la funcionalidad base de `ASQ#runner(..)` para adaptarse a diferentes usos.

### Máquinas de Estado

Un ejemplo que puede ser familiar para muchos programadores es el de las máquinas de estado. Puedes, con la ayuda de una simple utilidad cosmética, crear un procesador de máquina de estados fácil de expresar.

Imaginemos tal utilidad. La llamaremos `state(..)`, y le pasaremos dos argumentos: un valor de estado y un generador que maneja ese estado. `state(..)` hará el trabajo sucio de crear y devolver un generador adaptador para pasar a `ASQ#runner(..)`.

Considera:

```js
function state(val,handler) {
	// crear un manejador de corrutina para este estado
	return function*(token) {
		// manejador de transición de estado
		function transition(to) {
			token.messages[0] = to;
		}

		// establecer estado inicial (si no se ha establecido aún)
		if (token.messages.length < 1) {
			token.messages[0] = val;
		}

		// seguir hasta que se alcance el estado final (false)
		while (token.messages[0] !== false) {
			// ¿el estado actual coincide con este manejador?
			if (token.messages[0] === val) {
				// delegar al manejador de estado
				yield *handler( transition );
			}

			// ¿transferir control a otro manejador de estado?
			if (token.messages[0] !== false) {
				yield token;
			}
		}
	};
}
```

Si miras de cerca, verás que `state(..)` devuelve un generador que acepta un `token`, y luego configura un bucle `while` que se ejecutará hasta que la máquina de estados alcance su estado final (que arbitrariamente elegimos como el valor `false`); ¡ese es exactamente el tipo de generador que queremos pasar a `ASQ#runner(..)`!

También arbitrariamente reservamos la posición `token.messages[0]` como el lugar donde se rastreará el estado actual de nuestra máquina de estados, lo que significa que incluso podemos inicializar el estado inicial como el valor pasado desde el paso anterior en la secuencia.

¿Cómo usamos el helper `state(..)` junto con `ASQ#runner(..)`?

```js
var prevState;

ASQ(
	/* opcional: valor de estado inicial */
	2
)
// ejecutar nuestra máquina de estados
// transiciones: 2 -> 3 -> 1 -> 3 -> false
.runner(
	// manejador de estado `1`
	state( 1, function *stateOne(transition){
		console.log( "en estado 1" );

		prevState = 1;
		yield transition( 3 );	// ir al estado `3`
	} ),

	// manejador de estado `2`
	state( 2, function *stateTwo(transition){
		console.log( "en estado 2" );

		prevState = 2;
		yield transition( 3 );	// ir al estado `3`
	} ),

	// manejador de estado `3`
	state( 3, function *stateThree(transition){
		console.log( "en estado 3" );

		if (prevState === 2) {
			prevState = 3;
			yield transition( 1 ); // ir al estado `1`
		}
		// ¡terminamos!
		else {
			yield "That's all folks!";

			prevState = 3;
			yield transition( false ); // estado terminal
		}
	} )
)
// máquina de estados completa, así que continuar
.val( function(msg){
	console.log( msg );	// That's all folks!
} );
```

Es importante notar que los generadores `*stateOne(..)`, `*stateTwo(..)` y `*stateThree(..)` mismos se reinvocan cada vez que se entra en ese estado, y terminan cuando haces `transition(..)` a otro valor. Aunque no se muestra aquí, por supuesto estos manejadores de estado generadores pueden ser pausados asíncronamente haciendo `yield` de Promesas/secuencias/thunks.

Los generadores ocultos debajo producidos por el helper `state(..)` y realmente pasados a `ASQ#runner(..)` son los que continúan ejecutándose concurrentemente durante toda la vida de la máquina de estados, y cada uno de ellos maneja cooperativamente ceder con `yield` el control al siguiente, y así sucesivamente.

**Nota:** Ve este ejemplo de "ping pong" (http://jsbin.com/qutabu/1/edit?js,output) para más ilustración del uso de concurrencia cooperativa con generadores impulsados por `ASQ#runner(..)`.
