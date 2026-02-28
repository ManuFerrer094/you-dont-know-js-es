# You Don't Know JS: Async & Performance
# Apéndice A: Biblioteca *asynquence*

Los Capítulos 1 y 2 entraron en bastante detalle sobre los patrones típicos de programación asíncrona y cómo se resuelven comúnmente con callbacks. Pero también vimos por qué los callbacks están fatalmente limitados en capacidad, lo que nos llevó a los Capítulos 3 y 4, con Promesas y generadores ofreciendo una base mucho más sólida, confiable y razonable sobre la cual construir tu asincronía.

Hice referencia a mi propia biblioteca asíncrona *asynquence* (http://github.com/getify/asynquence) -- "async" + "sequence" = "asynquence" -- varias veces en este libro, y quiero ahora explicar brevemente cómo funciona y por qué su diseño único es importante y útil.

En el siguiente apéndice, exploraremos algunos patrones asíncronos avanzados, pero probablemente querrás una biblioteca para hacer que esos patrones sean lo suficientemente aceptables como para ser útiles. Usaremos *asynquence* para expresar esos patrones, así que querrás dedicar un poco de tiempo aquí para conocer la biblioteca primero.

*asynquence* obviamente no es la única opción para una buena codificación asíncrona; ciertamente hay muchas bibliotecas geniales en este espacio. Pero *asynquence* proporciona una perspectiva única al combinar lo mejor de todos estos patrones en una sola biblioteca, y además está construida sobre una única abstracción básica: la secuencia (asíncrona).

Mi premisa es que los programas JS sofisticados a menudo necesitan partes y piezas de varios patrones asíncronos diferentes entretejidos, y esto normalmente se deja enteramente al criterio de cada desarrollador. En lugar de tener que traer dos o más bibliotecas asíncronas diferentes que se centran en diferentes aspectos de la asincronía, *asynquence* las unifica en pasos de secuencia variados, con una sola biblioteca central para aprender e implementar.

Creo que el valor es lo suficientemente fuerte con *asynquence* como para hacer que la programación de control de flujo asíncrono con semántica estilo Promesas sea super fácil de lograr, así que por eso nos centraremos exclusivamente en esa biblioteca aquí.

Para empezar, explicaré los principios de diseño detrás de *asynquence*, y luego ilustraremos cómo funciona su API con ejemplos de código.

## Secuencias, Diseño de Abstracción

Entender *asynquence* comienza con comprender una abstracción fundamental: cualquier serie de pasos para una tarea, ya sean individualmente síncronos o asíncronos, puede pensarse colectivamente como una "secuencia". En otras palabras, una secuencia es un contenedor que representa una tarea, y está compuesta de pasos individuales (potencialmente asíncronos) para completar esa tarea.

Cada paso en la secuencia está controlado internamente por una Promesa (ver Capítulo 3). Es decir, cada paso que añades a una secuencia crea implícitamente una Promesa que está conectada al final anterior de la secuencia. Debido a las semánticas de las Promesas, cada avance individual de paso en una secuencia es asíncrono, incluso si completas el paso de forma síncrona.

Además, una secuencia siempre avanzará linealmente de paso a paso, lo que significa que el paso 2 siempre viene después de que el paso 1 termine, y así sucesivamente.

Por supuesto, una nueva secuencia puede bifurcarse de una secuencia existente, lo que significa que la bifurcación solo ocurre una vez que la secuencia principal alcanza ese punto en el flujo. Las secuencias también pueden combinarse de varias maneras, incluyendo tener una secuencia subsumida por otra secuencia en un punto particular del flujo.

Una secuencia es algo así como una cadena de Promesas. Sin embargo, con las cadenas de Promesas, no hay un "mango" para agarrar que haga referencia a toda la cadena. La Promesa a la que tengas referencia solo representa el paso actual en la cadena más cualquier otro paso que cuelgue de ella. Esencialmente, no puedes mantener una referencia a una cadena de Promesas a menos que mantengas una referencia a la primera Promesa en la cadena.

Hay muchos casos donde resulta bastante útil tener un mango que haga referencia a toda la secuencia colectivamente. El más importante de esos casos es con el aborto/cancelación de secuencia. Como cubrimos extensivamente en el Capítulo 3, las Promesas por sí mismas nunca deberían poder ser canceladas, ya que esto viola un imperativo fundamental de diseño: la inmutabilidad externa.

Pero las secuencias no tienen tal principio de diseño de inmutabilidad, principalmente porque las secuencias no se pasan como contenedores de valores futuros que necesitan semántica de valor inmutable. Así que las secuencias son el nivel apropiado de abstracción para manejar el comportamiento de aborto/cancelación. Las secuencias de *asynquence* pueden ser `abort()`adas en cualquier momento, y la secuencia se detendrá en ese punto y no continuará por ningún motivo.

Hay muchas más razones para preferir una abstracción de secuencia sobre las cadenas de Promesas, para propósitos de control de flujo.

Primero, el encadenamiento de Promesas es un proceso bastante manual -- uno que puede volverse muy tedioso una vez que empiezas a crear y encadenar Promesas a lo largo y ancho de tus programas -- y este tedio puede actuar contraproductivamente para disuadir al desarrollador de usar Promesas en lugares donde son bastante apropiadas.

Las abstracciones están pensadas para reducir el código repetitivo y el tedio, así que la abstracción de secuencia es una buena solución a este problema. Con las Promesas, tu enfoque está en el paso individual, y hay poca suposición de que mantendrás la cadena. Con las secuencias, se toma el enfoque opuesto, asumiendo que la secuencia seguirá teniendo más pasos añadidos indefinidamente.

Esta reducción de complejidad de abstracción es especialmente poderosa cuando empiezas a pensar en patrones de Promesas de orden superior (más allá de `race([..])` y `all([..])`.

Por ejemplo, en medio de una secuencia, podrías querer expresar un paso que es conceptualmente como un `try..catch` en el sentido de que el paso siempre resultará en éxito, ya sea la resolución de éxito principal pretendida o una señal positiva de no-error para el error capturado. O podrías querer expresar un paso que sea como un bucle de reintentos/hasta, donde sigue intentando el mismo paso una y otra vez hasta que ocurra el éxito.

Este tipo de abstracciones son bastante no-triviales de expresar usando solo primitivas de Promesas, y hacerlo en medio de una cadena de Promesas existente no es bonito. Pero si abstraes tu pensamiento a una secuencia, y consideras un paso como un envoltorio alrededor de una Promesa, ese envoltorio de paso puede ocultar tales detalles, liberándote para pensar sobre el control de flujo de la manera más sensata sin ser molestado por los detalles.

Segundo, y quizás más importante, pensar en el control de flujo asíncrono en términos de pasos en una secuencia te permite abstraer los detalles de qué tipos de asincronía están involucrados con cada paso individual. Bajo el capó, una Promesa siempre controlará el paso, pero sobre el capó, ese paso puede verse como un callback de continuación (el simple por defecto), o como una Promesa real, o como un generador de ejecución-hasta-completar, o... Esperemos que entiendas la idea.

Tercero, las secuencias pueden torcerse más fácilmente para adaptarse a diferentes modos de pensar, como la codificación basada en eventos, flujos o reactiva. *asynquence* proporciona un patrón que llamo "secuencias reactivas" (que cubriremos más adelante) como una variación de las ideas de "observable reactivo" en RxJS ("Extensiones Reactivas"), que permite que un evento repetible dispare una nueva instancia de secuencia cada vez. Las Promesas son de un solo disparo, así que es bastante incómodo expresar asincronía repetitiva con Promesas solas.

Otro modo alterno de pensar invierte la capacidad de resolución/control en un patrón que llamo "secuencias iterables". En lugar de que cada paso individual controle internamente su propia completación (y por tanto el avance de la secuencia), la secuencia se invierte de modo que el control de avance es a través de un iterador externo, y cada paso en la *secuencia iterable* simplemente responde al control `next(..)` del *iterador*.

Exploraremos todas estas diferentes variaciones a medida que avancemos por el resto de este apéndice, así que no te preocupes si pasamos por esos puntos demasiado rápido ahora.

La conclusión es que las secuencias son una abstracción más poderosa y sensata para la asincronía compleja que solo las Promesas (cadenas de Promesas) o solo los generadores, y *asynquence* está diseñada para expresar esa abstracción con justo el nivel correcto de azúcar sintáctico para hacer la programación asíncrona más comprensible y más disfrutable.

## API de *asynquence*

Para comenzar, la forma en que creas una secuencia (una instancia de *asynquence*) es con la función `ASQ(..)`. Una llamada `ASQ()` sin parámetros crea una secuencia inicial vacía, mientras que pasar uno o más valores o funciones a `ASQ(..)` configura la secuencia con cada argumento representando los pasos iniciales de la secuencia.

**Nota:** Para los propósitos de todos los ejemplos de código aquí, usaré el identificador de nivel superior de *asynquence* en uso global del navegador: `ASQ`. Si incluyes y usas *asynquence* a través de un sistema de módulos (navegador o servidor), por supuesto puedes definir cualquier símbolo que prefieras, ¡y a *asynquence* no le importará!

Muchos de los métodos de API discutidos aquí están integrados en el núcleo de *asynquence*, pero otros se proporcionan incluyendo el paquete opcional de plug-ins "contrib". Consulta la documentación de *asynquence* para saber si un método está integrado o definido mediante plug-in: http://github.com/getify/asynquence

### Pasos

Si una función representa un paso normal en la secuencia, esa función se invoca con el primer parámetro siendo el callback de continuación, y cualquier parámetro subsiguiente siendo cualquier mensaje pasado desde el paso anterior. El paso no se completará hasta que se llame al callback de continuación. Una vez que se llama, cualquier argumento que le pases se enviará como mensajes al siguiente paso en la secuencia.

Para añadir un paso normal adicional a la secuencia, llama a `then(..)` (que tiene esencialmente la misma semántica exacta que la llamada `ASQ(..)`):

```js
ASQ(
	// paso 1
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	// paso 2
	function(done,greeting) {
		setTimeout( function(){
			done( greeting + " World" );
		}, 100 );
	}
)
// paso 3
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// paso 4
.then( function(done,msg){
	console.log( msg );			// HELLO WORLD
} );
```

**Nota:** Aunque el nombre `then(..)` es idéntico al de la API nativa de Promesas, este `then(..)` es diferente. Puedes pasar tantas funciones o valores como quieras a `then(..)`, y cada una se toma como un paso separado. No hay semántica de dos callbacks cumplida/rechazada involucrada.

A diferencia de las Promesas, donde para encadenar una Promesa a la siguiente tienes que crear y `return` esa Promesa desde un manejador de cumplimiento `then(..)`, con *asynquence*, todo lo que necesitas hacer es llamar al callback de continuación -- yo siempre lo llamo `done()` pero puedes nombrarlo como te convenga -- y opcionalmente pasarle mensajes de completación como argumentos.

Cada paso definido por `then(..)` se asume como asíncrono. Si tienes un paso que es síncrono, puedes simplemente llamar a `done(..)` inmediatamente, o puedes usar el helper de paso más simple `val(..)`:

```js
// paso 1 (síncrono)
ASQ( function(done){
	done( "Hello" );	// manualmente síncrono
} )
// paso 2 (síncrono)
.val( function(greeting){
	return greeting + " World";
} )
// paso 3 (asíncrono)
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// paso 4 (síncrono)
.val( function(msg){
	console.log( msg );
} );
```

Como puedes ver, los pasos invocados con `val(..)` no reciben un callback de continuación, ya que esa parte se asume por ti -- ¡y la lista de parámetros queda menos desordenada como resultado! Para enviar un mensaje al siguiente paso, simplemente usas `return`.

Piensa en `val(..)` como representando un paso síncrono de "solo valor", lo cual es útil para operaciones de valor síncronas, logging, y similares.

### Errores

Una diferencia importante de *asynquence* comparado con las Promesas es el manejo de errores.

Con las Promesas, cada Promesa individual (paso) en una cadena puede tener su propio error independiente, y cada paso subsiguiente tiene la capacidad de manejar el error o no. La razón principal de esta semántica viene (de nuevo) del enfoque en Promesas individuales en lugar de en la cadena (secuencia) como un todo.

Yo creo que la mayoría de las veces, un error en una parte de una secuencia generalmente no es recuperable, así que los pasos subsiguientes en la secuencia son irrelevantes y deberían saltarse. Así que, por defecto, un error en cualquier paso de una secuencia pone toda la secuencia en modo de error, y el resto de los pasos normales se ignoran.

Si *necesitas* tener un paso donde su error es recuperable, hay varios métodos API diferentes que pueden acomodar, como `try(..)` -- mencionado previamente como una especie de paso `try..catch` -- o `until(..)` -- un bucle de reintentos que sigue intentando el paso hasta que tiene éxito o tú manualmente `break()` el bucle. *asynquence* incluso tiene métodos `pThen(..)` y `pCatch(..)`, que funcionan idénticamente a como funcionan el `then(..)` y `catch(..)` normales de Promesas (ver Capítulo 3), así que puedes hacer manejo de errores localizado a mitad de secuencia si así lo prefieres.

El punto es que tienes ambas opciones, pero la más común en mi experiencia es la por defecto. Con las Promesas, para conseguir que una cadena de pasos ignore todos los pasos una vez que ocurre un error, tienes que tener cuidado de no registrar un manejador de rechazo en ningún paso; de lo contrario, ese error es absorbido como manejado, y la secuencia puede continuar (quizás inesperadamente). Este tipo de comportamiento deseado es un poco incómodo de manejar correcta y confiablemente.

Para registrar un manejador de notificación de error de secuencia, *asynquence* proporciona un método de secuencia `or(..)`, que también tiene un alias `onerror(..)`. Puedes llamar a este método en cualquier parte de la secuencia, y puedes registrar todos los manejadores que quieras. Eso facilita que múltiples consumidores diferentes escuchen una secuencia para saber si falló o no; es como un manejador de eventos de error en ese sentido.

Al igual que con las Promesas, todas las excepciones JS se convierten en errores de secuencia, o puedes señalar un error de secuencia programáticamente:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		// señalar un error para la secuencia
		done.fail( "Oops" );
	}, 100 );
} )
.then( function(done){
	// nunca llegará aquí
} )
.or( function(err){
	console.log( err );			// Oops
} )
.then( function(done){
	// tampoco llegará aquí
} );

// más tarde

sq.or( function(err){
	console.log( err );			// Oops
} );
```

Otra diferencia realmente importante del manejo de errores en *asynquence* comparado con las Promesas nativas es el comportamiento por defecto de "excepciones no manejadas". Como discutimos extensamente en el Capítulo 3, una Promesa rechazada sin un manejador de rechazo registrado simplemente retendrá (es decir, tragará) el error silenciosamente; tienes que recordar siempre terminar una cadena con un `catch(..)` final.

En *asynquence*, la suposición está invertida.

Si ocurre un error en una secuencia, y **en ese momento** no tiene manejadores de error registrados, el error se reporta a la `console`. En otras palabras, los rechazos no manejados se reportan siempre por defecto para no ser tragados y perdidos.

Tan pronto como registras un manejador de error contra una secuencia, eso opta a la secuencia fuera de tal reporte, para prevenir ruido duplicado.

De hecho, puede haber casos donde quieras crear una secuencia que pueda entrar en estado de error antes de que tengas la oportunidad de registrar el manejador. Esto no es común, pero puede ocurrir de vez en cuando.

En esos casos, también puedes **optar una instancia de secuencia fuera** del reporte de errores llamando a `defer()` en la secuencia. Solo deberías optar fuera del reporte de errores si estás seguro de que eventualmente manejarás tales errores:

```js
var sq1 = ASQ( function(done){
	doesnt.Exist();			// lanzará excepción a la consola
} );

var sq2 = ASQ( function(done){
	doesnt.Exist();			// solo lanzará un error de secuencia
} )
// optar fuera del reporte de errores
.defer();

setTimeout( function(){
	sq1.or( function(err){
		console.log( err );	// ReferenceError
	} );

	sq2.or( function(err){
		console.log( err );	// ReferenceError
	} );
}, 100 );

// ReferenceError (de sq1)
```

Este es un mejor comportamiento de manejo de errores que el que tienen las Promesas por sí mismas, porque es el Pozo del Éxito, no el Pozo del Fracaso (ver Capítulo 3).

**Nota:** Si una secuencia se canaliza hacia (es decir, es subsumida por) otra secuencia -- ver "Combinando Secuencias" para una descripción completa -- entonces la secuencia fuente opta fuera del reporte de errores, pero ahora el reporte de errores o la falta del mismo de la secuencia destino debe considerarse.

### Pasos Paralelos

No todos los pasos en tus secuencias tendrán solo una única tarea (asíncrona) que realizar; algunos necesitarán realizar múltiples pasos "en paralelo" (concurrentemente). Un paso en una secuencia en el que múltiples sub-pasos se procesan concurrentemente se llama `gate(..)` -- hay un alias `all(..)` si lo prefieres -- y es directamente simétrico al `Promise.all([..])` nativo.

Si todos los pasos en el `gate(..)` se completan exitosamente, todos los mensajes de éxito se pasarán al siguiente paso de la secuencia. Si alguno de ellos genera errores, toda la secuencia inmediatamente entra en estado de error.

Considera:

```js
ASQ( function(done){
	setTimeout( done, 100 );
} )
.gate(
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	function(done){
		setTimeout( function(){
			done( "World", "!" );
		}, 100 );
	}
)
.val( function(msg1,msg2){
	console.log( msg1 );	// Hello
	console.log( msg2 );	// [ "World", "!" ]
} );
```

Para ilustración, comparemos ese ejemplo con Promesas nativas:

```js
new Promise( function(resolve,reject){
	setTimeout( resolve, 100 );
} )
.then( function(){
	return Promise.all( [
		new Promise( function(resolve,reject){
			setTimeout( function(){
				resolve( "Hello" );
			}, 100 );
		} ),
		new Promise( function(resolve,reject){
			setTimeout( function(){
				// nota: necesitamos un array [ ] aquí
				resolve( [ "World", "!" ] );
			}, 100 );
		} )
	] );
} )
.then( function(msgs){
	console.log( msgs[0] );	// Hello
	console.log( msgs[1] );	// [ "World", "!" ]
} );
```

Puaj. Las Promesas requieren mucha más sobrecarga de código repetitivo para expresar el mismo control de flujo asíncrono. Esa es una gran ilustración de por qué la API y abstracción de *asynquence* hacen que lidiar con pasos de Promesas sea mucho más agradable. La mejora solo aumenta cuanto más compleja sea tu asincronía.

#### Variaciones de Pasos

Hay varias variaciones en los plug-ins contrib del tipo de paso `gate(..)` de *asynquence* que pueden ser bastante útiles:

* `any(..)` es como `gate(..)`, excepto que solo un segmento tiene que eventualmente tener éxito para proceder en la secuencia principal.
* `first(..)` es como `any(..)`, excepto que tan pronto como cualquier segmento tiene éxito, la secuencia principal procede (ignorando los resultados subsiguientes de otros segmentos).
* `race(..)` (simétrico con `Promise.race([..])`) es como `first(..)`, excepto que la secuencia principal procede tan pronto como cualquier segmento se completa (ya sea éxito o fallo).
* `last(..)` es como `any(..)`, excepto que solo el último segmento en completarse exitosamente envía su(s) mensaje(s) a la secuencia principal.
* `none(..)` es el inverso de `gate(..)`: la secuencia principal procede solo si todos los segmentos fallan (con todos los mensajes de error de segmento transpuestos como mensajes de éxito y viceversa).

Primero definamos algunos helpers para hacer la ilustración más limpia:

```js
function success1(done) {
	setTimeout( function(){
		done( 1 );
	}, 100 );
}

function success2(done) {
	setTimeout( function(){
		done( 2 );
	}, 100 );
}

function failure3(done) {
	setTimeout( function(){
		done.fail( 3 );
	}, 100 );
}

function output(msg) {
	console.log( msg );
}
```

Ahora, demostremos estas variaciones de paso `gate(..)`:

```js
ASQ().race(
	failure3,
	success1
)
.or( output );		// 3


ASQ().any(
	success1,
	failure3,
	success2
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log(
		args		// [ 1, undefined, 2 ]
	);
} );


ASQ().first(
	failure3,
	success1,
	success2
)
.val( output );		// 1


ASQ().last(
	failure3,
	success1,
	success2
)
.val( output );		// 2

ASQ().none(
	failure3
)
.val( output )		// 3
.none(
	failure3
	success1
)
.or( output );		// 1
```

Otra variación de paso es `map(..)`, que te permite mapear asíncronamente los elementos de un array a diferentes valores, y el paso no procede hasta que todos los mapeos estén completos. `map(..)` es muy similar a `gate(..)`, excepto que obtiene los valores iniciales de un array en lugar de funciones especificadas por separado, y también porque defines una sola función callback para operar sobre cada valor:

```js
function double(x,done) {
	setTimeout( function(){
		done( x * 2 );
	}, 100 );
}

ASQ().map( [1,2,3], double )
.val( output );					// [2,4,6]
```

Además, `map(..)` puede recibir cualquiera de sus parámetros (el array o el callback) de mensajes pasados desde el paso anterior:

```js
function plusOne(x,done) {
	setTimeout( function(){
		done( x + 1 );
	}, 100 );
}

ASQ( [1,2,3] )
.map( double )			// el mensaje `[1,2,3]` llega
.map( plusOne )			// el mensaje `[2,4,6]` llega
.val( output );			// [3,5,7]
```

Otra variación es `waterfall(..)`, que es una especie de mezcla entre el comportamiento de recolección de mensajes de `gate(..)` pero el procesamiento secuencial de `then(..)`.

El paso 1 se ejecuta primero, luego el mensaje de éxito del paso 1 se da al paso 2, y luego ambos mensajes de éxito van al paso 3, y luego los tres mensajes de éxito van al paso 4, y así sucesivamente, de modo que los mensajes se acumulan y caen en cascada por la "cascada".

Considera:

```js
function double(done) {
	var args = [].slice.call( arguments, 1 );
	console.log( args );

	setTimeout( function(){
		done( args[args.length - 1] * 2 );
	}, 100 );
}

ASQ( 3 )
.waterfall(
	double,					// [ 3 ]
	double,					// [ 6 ]
	double,					// [ 6, 12 ]
	double					// [ 6, 12, 24 ]
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log( args );	// [ 6, 12, 24, 48 ]
} );
```

Si en cualquier punto de la "cascada" ocurre un error, toda la secuencia inmediatamente entra en estado de error.

#### Tolerancia a Errores

A veces quieres manejar errores a nivel de paso y no dejar que necesariamente envíen toda la secuencia al estado de error. *asynquence* ofrece dos variaciones de paso para ese propósito.

`try(..)` intenta un paso, y si tiene éxito, la secuencia procede normalmente, pero si el paso falla, el fallo se convierte en un mensaje de éxito formateado como `{ catch: .. }` con el/los mensaje(s) de error rellenados:

```js
ASQ()
.try( success1 )
.val( output )			// 1
.try( failure3 )
.val( output )			// { catch: 3 }
.or( function(err){
	// nunca llega aquí
} );
```

En su lugar podrías configurar un bucle de reintentos usando `until(..)`, que intenta el paso y si falla, reintenta el paso de nuevo en el siguiente tick del bucle de eventos, y así sucesivamente.

Este bucle de reintentos puede continuar indefinidamente, pero si quieres salir del bucle, puedes llamar a la bandera `break()` en el disparador de completación, lo que envía la secuencia principal al estado de error:

```js
var count = 0;

ASQ( 3 )
.until( double )
.val( output )					// 6
.until( function(done){
	count++;

	setTimeout( function(){
		if (count < 5) {
			done.fail();
		}
		else {
			// salir del bucle de reintentos `until(..)`
			done.break( "Oops" );
		}
	}, 100 );
} )
.or( output );					// Oops
```

#### Pasos Estilo Promesa

Si prefieres tener, en línea en tu secuencia, semánticas estilo Promesa como el `then(..)` y `catch(..)` de las Promesas (ver Capítulo 3), puedes usar los plug-ins `pThen` y `pCatch`:

```js
ASQ( 21 )
.pThen( function(msg){
	return msg * 2;
} )
.pThen( output )				// 42
.pThen( function(){
	// lanzar una excepción
	doesnt.Exist();
} )
.pCatch( function(err){
	// capturada la excepción (rechazo)
	console.log( err );			// ReferenceError
} )
.val( function(){
	// la secuencia principal está de vuelta en
	// estado de éxito porque la excepción
	// anterior fue capturada por `pCatch(..)`
} );
```

`pThen(..)` y `pCatch(..)` están diseñados para ejecutarse en la secuencia, pero comportarse como si fuera una cadena de Promesas normal. Como tal, puedes resolver Promesas genuinas o secuencias *asynquence* desde el manejador de "cumplimiento" pasado a `pThen(..)` (ver Capítulo 3).

### Bifurcando Secuencias

Una característica que puede ser bastante útil de las Promesas es que puedes adjuntar múltiples registros de manejadores `then(..)` a la misma promesa, efectivamente "bifurcando" el control de flujo en esa promesa:

```js
var p = Promise.resolve( 21 );

// bifurcación 1 (de `p`)
p.then( function(msg){
	return msg * 2;
} )
.then( function(msg){
	console.log( msg );		// 42
} )

// bifurcación 2 (de `p`)
p.then( function(msg){
	console.log( msg );		// 21
} );
```

La misma "bifurcación" es fácil en *asynquence* con `fork()`:

```js
var sq = ASQ(..).then(..).then(..);

var sq2 = sq.fork();

// bifurcación 1
sq.then(..)..;

// bifurcación 2
sq2.then(..)..;
```

### Combinando Secuencias

Lo opuesto de `fork()`, puedes combinar dos secuencias subsumiendo una en otra, usando el método de instancia `seq(..)`:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		done( "Hello World" );
	}, 200 );
} );

ASQ( function(done){
	setTimeout( done, 100 );
} )
// subsumir la secuencia `sq` en esta secuencia
.seq( sq )
.val( function(msg){
	console.log( msg );		// Hello World
} )
```

`seq(..)` puede aceptar una secuencia en sí, como se muestra aquí, o una función. Si es una función, se espera que la función cuando se llame devuelva una secuencia, así que el código anterior podría haberse hecho con:

```js
// ..
.seq( function(){
	return sq;
} )
// ..
```

Además, ese paso podría haberse logrado con un `pipe(..)`:

```js
// ..
.then( function(done){
	// canalizar `sq` al callback de continuación `done`
	sq.pipe( done );
} )
// ..
```

Cuando una secuencia se subsume, tanto su flujo de mensajes de éxito como su flujo de errores se canalizan.

**Nota:** Como se mencionó en una nota anterior, la canalización (manualmente con `pipe(..)` o automáticamente con `seq(..)`) opta a la secuencia fuente fuera del reporte de errores, pero no afecta el estado de reporte de errores de la secuencia destino.

## Secuencias de Valor y Error

Si cualquier paso de una secuencia es simplemente un valor normal, ese valor se mapea al mensaje de completación de ese paso:

```js
var sq = ASQ( 42 );

sq.val( function(msg){
	console.log( msg );		// 42
} );
```

Si quieres hacer una secuencia que automáticamente esté en error:

```js
var sq = ASQ.failed( "Oops" );

ASQ()
.seq( sq )
.val( function(msg){
	// no llegará aquí
} )
.or( function(err){
	console.log( err );		// Oops
} );
```

También podrías querer crear automáticamente una secuencia de valor-retrasado o de error-retrasado. Usando los plug-ins contrib `after` y `failAfter`, esto es fácil:

```js
var sq1 = ASQ.after( 100, "Hello", "World" );
var sq2 = ASQ.failAfter( 100, "Oops" );

sq1.val( function(msg1,msg2){
	console.log( msg1, msg2 );		// Hello World
} );

sq2.or( function(err){
	console.log( err );				// Oops
} );
```

También puedes insertar un retraso en medio de una secuencia usando `after(..)`:

```js
ASQ( 42 )
// insertar un retraso en la secuencia
.after( 100 )
.val( function(msg){
	console.log( msg );		// 42
} );
```

## Promesas y Callbacks

Creo que las secuencias de *asynquence* proporcionan mucho valor sobre las Promesas nativas, y en su mayoría encontrarás más placentero y más poderoso trabajar en ese nivel de abstracción. Sin embargo, integrar *asynquence* con otro código que no sea *asynquence* será una realidad.

Puedes fácilmente subsumir una promesa (por ejemplo, thenable -- ver Capítulo 3) en una secuencia usando el método de instancia `promise(..)`:

```js
var p = Promise.resolve( 42 );

ASQ()
.promise( p )			// también podría ser: `function(){ return p; }`
.val( function(msg){
	console.log( msg );	// 42
} );
```

Y para ir en la dirección opuesta y bifurcar/producir una promesa desde una secuencia en un cierto paso, usa el plug-in contrib `toPromise`:

```js
var sq = ASQ.after( 100, "Hello World" );

sq.toPromise()
// esta es una cadena de promesas estándar ahora
.then( function(msg){
	return msg.toUpperCase();
} )
.then( function(msg){
	console.log( msg );		// HELLO WORLD
} );
```

Para adaptar *asynquence* a sistemas que usan callbacks, hay varias facilidades auxiliares. Para generar automáticamente un callback de "estilo error-primero" de tu secuencia para conectar con una utilidad orientada a callbacks, usa `errfcb`:

```js
var sq = ASQ( function(done){
	// nota: esperando callback "estilo error-primero"
	someAsyncFuncWithCB( 1, 2, done.errfcb )
} )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );

// nota: esperando callback "estilo error-primero"
anotherAsyncFuncWithCB( 1, 2, sq.errfcb() );
```

También podrías querer crear una versión envuelta en secuencia de una utilidad -- compara con "promisory" en el Capítulo 3 y "thunkory" en el Capítulo 4 -- y *asynquence* proporciona `ASQ.wrap(..)` para ese propósito:

```js
var coolUtility = ASQ.wrap( someAsyncFuncWithCB );

coolUtility( 1, 2 )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );
```

**Nota:** Por claridad (¡y por diversión!), acuñemos otro término más, para una función productora de secuencias que viene de `ASQ.wrap(..)`, como `coolUtility` aquí. Propongo "secuencioría" ("secuencia" + "factoría").

## Secuencias Iterables

El paradigma normal para una secuencia es que cada paso es responsable de completarse a sí mismo, que es lo que avanza la secuencia. Las Promesas funcionan de la misma manera.

La parte desafortunada es que a veces necesitas control externo sobre una Promesa/paso, lo que lleva a una incómoda "extracción de capacidad".

Considera este ejemplo de Promesas:

```js
var domready = new Promise( function(resolve,reject){
	// no quiero poner esto aquí, porque
	// pertenece lógicamente a otra parte
	// del código
	document.addEventListener( "DOMContentLoaded", resolve );
} );

// ..

domready.then( function(){
	// ¡DOM está listo!
} );
```

El anti-patrón de "extracción de capacidad" con Promesas se ve así:

```js
var ready;

var domready = new Promise( function(resolve,reject){
	// extraer la capacidad `resolve()`
	ready = resolve;
} );

// ..

domready.then( function(){
	// ¡DOM está listo!
} );

// ..

document.addEventListener( "DOMContentLoaded", ready );
```

**Nota:** Este anti-patrón es un olor a código incómodo, en mi opinión, pero algunos desarrolladores les gusta, por razones que no puedo comprender.

*asynquence* ofrece un tipo de secuencia invertido que llamo "secuencias iterables", que externaliza la capacidad de control (es bastante útil en casos de uso como el `domready`):

```js
// nota: `domready` aquí es un *iterador* que
// controla la secuencia
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM está listo
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

Hay más sobre secuencias iterables de lo que vemos en este escenario. Volveremos a ellas en el Apéndice B.

