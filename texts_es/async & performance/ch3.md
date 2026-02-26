# You Don't Know JS: Async & Performance
# Capítulo 3: Promesas

En el Capítulo 2 identificamos dos grandes categorías de deficiencias al usar callbacks para expresar la asincronía y gestionar la concurrencia: falta de secuencialidad y falta de confianza. Ahora que entendemos esos problemas más íntimamente, es hora de dedicar atención a los patrones que pueden abordarlos.

El asunto que queremos tratar primero es la *inversión de control*, la confianza que se sostiene tan frágilmente y se pierde con facilidad.

Recuerda que envolvemos la *continuación* de nuestro programa en una función callback, y entregamos ese callback a otra parte (potencialmente código externo) y cruzamos los dedos para que invoque el callback correctamente.

Hacemos esto porque queremos decir: "esto es lo que pasa *después*, cuando el paso actual termina".

Pero ¿y si pudiéramos deshacer esa *inversión de control*? ¿Y si en lugar de entregar la continuación del programa a otra parte, pudiéramos esperar que nos devolviera una capacidad para saber cuándo su tarea termina, y entonces nuestro código decide qué hacer después?

Ese paradigma se llama **Promesas**.

Las promesas están empezando a transformar el mundo JS, ya que desarrolladores y autores de especificaciones buscan desesperadamente desenmarañar el infierno de callbacks en su código/diseño. De hecho, la mayoría de las nuevas APIs asíncronas que se añaden a la plataforma JS/DOM se construyen sobre Promesas. Así que es buena idea aprenderlas, ¿verdad?

**Nota:** La palabra "inmediatamente" se usará frecuentemente en este capítulo, generalmente para referirse a alguna acción de resolución de Promesa. Sin embargo, en casi todos los casos, "inmediatamente" significa en términos del comportamiento del Job queue (ver Capítulo 1), no en el sentido estrictamente sincrónico de *ahora*.

## ¿Qué es una promesa?

Antes de mostrarte el código de las Promesas, quiero explicar conceptualmente qué es una Promesa. Algunas abstracciones se pierden si solo vemos la API; Promesas es una de ellas.

Veamos dos analogías para lo que *es* una Promesa.

### Valor futuro

Imagina esta escena: llego al mostrador de una hamburguesería, pido una hamburguesa con queso y entrego $1.47. Al hacer el pedido y pagar, he solicitado un *valor* (la hamburguesa). Sin embargo, a menudo la hamburguesa no está lista de inmediato. El cajero me da un recibo con un número de pedido. Ese número es un pagaré (IOU), una *promesa* que asegura que eventualmente recibiré mi hamburguesa.

Sostengo mi ticket y sé que representa mi *hamburguesa futura*, así que no me preocupo más por ello (salvo por el hambre). Mientras espero, puedo hacer otras cosas, como enviar un mensaje: "Oye, ¿te unes a comer?".

Estoy razonando sobre mi *hamburguesa futura* incluso sin tenerla, porque trato el número de pedido como un marcador que hace que el valor sea independiente del tiempo. Es un **valor futuro**.

Eventualmente llaman mi número y voy al mostrador, entrego el recibo y recibo la hamburguesa. Es decir, cuando mi *valor futuro* está listo, intercambio el pagaré por el valor.

Pero puede ocurrir otro resultado: al ir a recoger la hamburguesa me informan "lo sentimos, se agotaron las hamburguesas". En ese caso, el valor futuro produce un fallo en lugar de un éxito.

En código, esto se mapea a que una Promesa se resuelve con éxito (fulfill) o con rechazo (reject). También puede ocurrir que nunca se resuelva, y volveremos a eso más adelante.

#### Valores ahora y después

Cuando trabajas con valores en código (como sumar números), asumes implícitamente que los valores están disponibles *ahora*:

```js
var x, y = 2;
console.log( x + y ); // NaN  <-- porque `x` aún no está definido
```

La operación `x + y` supone que `x` y `y` ya están resueltos. Sería absurdo que el operador `+` se quedara esperando a que ambos valores estén listos; eso volvería el flujo caótico.

Si queremos manejar valores que pueden estar disponibles *ahora* o *después*, podemos normalizar y tratar ambos como *después*: todas las operaciones pasan a ser asincrónicas.

Con callbacks podríamos hacer algo así:

```js
function add(getX,getY,cb) {
	var x, y;
	getX( function(xVal){
		x = xVal;
		if (y !== undefined) {
			cb( x + y );
		}
	} );
	getY( function(yVal){
		y = yVal;
		if (x !== undefined) {
			cb( x + y );
		}
	} );
}
```

Con Promesas lo expresamos más fácilmente:

```js
function add(xPromise,yPromise) {
	return Promise.all( [xPromise, yPromise] )
	.then( function(values){
		return values[0] + values[1];
	} );
}

add( fetchX(), fetchY() )
.then( function(sum){
	console.log( sum );
} );
```

`fetchX()` y `fetchY()` devuelven promesas. `add(..)` devuelve una promesa que se resuelve cuando ambas están listas.

Una promesa puede resolverse con rechazo en lugar de cumplimiento; `then(..)` admite dos callbacks: el primero para cumplimiento y el segundo para rechazo.

Las promesas encapsulan el estado dependiente del tiempo: desde fuera, la promesa es independiente del tiempo, y puede observarse repetidamente una vez resuelta (inmutabilidad después de resolución).

### Evento de finalización

Otra forma de ver la resolución de una promesa es como un evento de finalización: queremos ser notificados cuando `foo(..)` termina para continuar.

En lugar de pasar callbacks a `foo(..)`, `foo(..)` devuelve un objeto `evt` (analógico a una promesa) que nos permite registrar listeners:

```js
var evt = foo( 42 );

evt.on( "completion", function(){ /* ... */ } );
evt.on( "failure", function(err){ /* ... */ } );
```

La promesa actúa como esa capacidad de suscripción; `then(..)` registra handlers de "fulfillment" y/o "rejection".

```js
function foo(x) {
	return new Promise( function(resolve,reject){
		// llamar resolve(..) o reject(..) eventualmente
	} );
}

var p = foo( 42 );
bar( p );
baz( p );
```

`p` puede pasarse a múltiples consumidores y todos observarán la resolución.

## Thenable (duck typing)

Para saber si un valor se comporta como promesa, ES6 usa "thenable": cualquier objeto/función con método `then(..)` será tratado como promesa. Esta comprobación por forma (duck-typing) permite interoperabilidad con bibliotecas, pero puede ser peligrosa si un objeto accidentalmente tiene `then` en su prototipo.

Por eso `Promise.resolve(..)` es útil: normaliza cualquier valor (promesa, thenable o valor inmediato) en una promesa genuina en la que puedes confiar.

## Confianza (Trust)

Las promesas aportan garantías que mitiguen los problemas de confianza de los callbacks:

- Nunca llamarán a los handlers de `then(..)` de forma sincrónica (evitan el efecto Zalgo).
- Las callbacks registradas se programan de forma asíncrona y se ejecutan en el siguiente Job, de forma predecible.
- Una promesa solo puede resolverse una vez; intentos posteriores se ignoran.
- Errores/excepciones dentro de la creación o handlers de promesas se transforman en rechazadas de promesa, no en excepciones sin capturar.

Además, `Promise.resolve(..)` permite "confiar" en thenables devolviendo una promesa verdadera.

## Flujo en cadena (Chain Flow)

Cada llamada `then(..)` crea y devuelve una nueva promesa. Si el handler devuelve un valor, ese valor cumple la promesa encadenada; si devuelve una promesa/thenable, se desenvuelve y la promesa encadenada espera su resolución. Esto permite construir secuencias asincrónicas legibles:

```js
Promise.resolve( 21 )
.then(function(v){
	return v * 2;
})
.then(function(v){
	console.log(v); // 42
});
```

También se gestionan excepciones y rechazos propagan hasta un handler de rechazo encontrado.

### Nomenclatura: resolve, fulfill, reject

`resolve(..)` del constructor puede aceptar valores, thenables o promesas y "desenvolverlos"; `reject(..)` marca una promesa como rechazada tal cual. Los handlers de `then(..)` se suelen llamar `onFulfilled` y `onRejected`.

## Manejo de errores

`try..catch` no funciona a través de operaciones asíncronas. Con promesas, los rechazos y las excepciones se convierten en rechazos de promesas, que pueden capturarse con `then(…, onRejected)` o `catch(..)`. Sin embargo, es fácil que errores queden "silenciados" si no se observa la promesa devuelta por `then(..)`.

Se recomiendan patrones como terminar cadenas con `catch(..)` y, en algunas bibliotecas, usar mecanismos de manejo global de rechazos no observados o `done(..)` para forzar arrojar errores globalmente. Otra mejora propuesta es que las promesas notifiquen por defecto los rechazos no observados (pit of success), y permitir `defer()` para optar por posponer la observación.

## Patrones con Promesas

ES6 incluye `Promise.all([..])` (espera que todas cumplan, o rechaza si una falla) y `Promise.race([..])` (resuelve o rechaza con la primera que termine). Sobre estos se construyen variaciones: `any`, `first`, `last`, `none`, `map`, etc. También conviene observar promesas (p.ej. `Promise.observe`) para ejecutar limpiezas sin interferir con la promesa principal.

### Concurrent Iterations y utilidades

Se pueden implementar utilidades como `Promise.map` que transforman arrays de valores/promesas de forma concurrente y devuelven una promesa sobre el array resultante.

## Recap API

- `new Promise(function(resolve,reject){..})` — constructor (revealing constructor).
- `Promise.resolve(..)` y `Promise.reject(..)` — crean promesas ya resueltas o rechazadas; `resolve` desenvuelve thenables.
- `.then(onFulfilled, onRejected)` y `.catch(onRejected)` — registran handlers y devuelven nuevas promesas encadenables.
- `Promise.all([..])`, `Promise.race([..])` — helpers estáticos para coordinación.

## Limitaciones de las Promesas

- Manejo de errores en cadenas: puede ser fácil perder errores si no se observa la promesa devuelta por `then(..)`.
- Un único valor por promesa: si necesitas múltiples valores conviene devolver varias promesas y usar `Promise.all([..])`, o envolver valores en arrays/objetos. ES6 destructuring ayuda.
- Resolución única: las promesas no sirven para flujos multi-valor por sí solas (para eso están observables/streams).
- Inercia en el ecosistema: mucho código existente usa callbacks; hay que "promisificar" utilidades (p. ej. `Promise.wrap` o `util.promisify`) para migrar.
- Las promesas no son cancelables por diseño; la cancelación debería modelarse en una abstracción de mayor nivel (por ejemplo, secuencias con `abort()`).
- Rendimiento: las promesas implican más trabajo que callbacks simples, y pueden ser algo más lentas, pero la recomendación es usarlas y optimizar solo los hot paths tras medir.

## Conclusión

Las promesas son una herramienta poderosa: resuelven la inversión de control de los callbacks, ofrecen garantías de confianza y permiten componer asincronía de forma más razonable. En el siguiente capítulo veremos una solución aún más expresiva para el control secuencial con generadores.
