# You Don't Know JS: ES6 & Beyond
# Capítulo 4: Control de Flujo Asíncrono

No es ningún secreto si has escrito cualquier cantidad significativa de JavaScript que la programación asíncrona es una habilidad requerida. El mecanismo principal para gestionar la asincronía ha sido el callback de función.

Sin embargo, ES6 añade una nueva característica que ayuda a abordar deficiencias significativas en el enfoque de solo-callbacks para lo asíncrono: *Promesas*. Además, podemos revisitar los generadores (del capítulo anterior) y ver un patrón para combinar los dos que es un paso importante hacia adelante en la programación de control de flujo asíncrono en JavaScript.

## Promesas

Aclaremos algunos conceptos erróneos: las Promesas no tratan de reemplazar callbacks. Las Promesas proporcionan un intermediario confiable — es decir, entre tu código que llama y el código asíncrono que realizará la tarea — para gestionar callbacks.

Otra manera de pensar en una Promesa es como un escuchador de eventos, en el cual puedes registrarte para escuchar un evento que te avise cuando una tarea se ha completado. Es un evento que solo se disparará una vez, pero de todas formas puede pensarse como un evento.

Las Promesas pueden encadenarse juntas, lo que puede secuenciar una serie de pasos que se completan asíncronamente. Junto con abstracciones de nivel superior como el método `all(..)` (en términos clásicos, una "compuerta") y el método `race(..)` (en términos clásicos, un "pestillo"), las cadenas de promesas proporcionan un mecanismo para control de flujo asíncrono.

Otra manera más de conceptualizar una Promesa es que es un *valor futuro*, un contenedor independiente del tiempo envuelto alrededor de un valor. Este contenedor puede razonarse de manera idéntica ya sea que el valor subyacente sea final o no. Observar la resolución de una Promesa extrae este valor una vez disponible. En otras palabras, se dice que una Promesa es la versión asíncrona del valor de retorno de una función síncrona.

Una Promesa solo puede tener uno de dos posibles resultados de resolución: cumplida o rechazada, con un valor único opcional. Si una Promesa se cumple, el valor final se llama un cumplimiento. Si se rechaza, el valor final se llama una razón (como en, una "razón de rechazo"). Las Promesas solo pueden resolverse (cumplimiento o rechazo) *una vez*. Cualquier intento posterior de cumplir o rechazar simplemente se ignora. Así, una vez que una Promesa se resuelve, es un valor inmutable que no puede cambiar.

Claramente, hay varias maneras diferentes de pensar en lo que es una Promesa. Ninguna perspectiva individual es totalmente suficiente, pero cada una proporciona un aspecto separado del todo. Lo principal a llevarse es que ofrecen una mejora significativa sobre lo asíncrono con solo-callbacks, concretamente que proporcionan orden, previsibilidad y confiabilidad.

### Creando y Usando Promesas

Para construir una instancia de promesa, usa el constructor `Promise(..)`:

```js
var p = new Promise( function pr(resolve,reject){
	// ..
} );
```

El constructor `Promise(..)` toma una sola función (`pr(..)`), que se llama inmediatamente y recibe dos funciones de control como argumentos, usualmente llamadas `resolve(..)` y `reject(..)`. Se usan así:

* Si llamas a `reject(..)`, la promesa se rechaza, y si se pasa cualquier valor a `reject(..)`, se establece como la razón de rechazo.
* Si llamas a `resolve(..)` sin valor, o con cualquier valor que no sea promesa, la promesa se cumple.
* Si llamas a `resolve(..)` y pasas otra promesa, esta promesa simplemente adopta el estado — ya sea inmediato o eventual — de la promesa pasada (ya sea cumplimiento o rechazo).

Así es cómo típicamente usarías una promesa para refactorizar una llamada de función que depende de callbacks. Si empiezas con una utilidad `ajax(..)` que espera poder llamar un callback estilo error-primero:

```js
function ajax(url,cb) {
	// make request, eventually call `cb(..)`
}

// ..

ajax( "http://some.url.1", function handler(err,contents){
	if (err) {
		// handle ajax error
	}
	else {
		// handle `contents` success
	}
} );
```

Puedes convertirlo a:

```js
function ajax(url) {
	return new Promise( function pr(resolve,reject){
		// make request, eventually call
		// either `resolve(..)` or `reject(..)`
	} );
}

// ..

ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		// handle `contents` success
	},
	function rejected(reason){
		// handle ajax error reason
	}
);
```

Las Promesas tienen un método `then(..)` que acepta una o dos funciones callback. La primera función (si está presente) se trata como el manejador a llamar si la promesa se cumple exitosamente. La segunda función (si está presente) se trata como el manejador a llamar si la promesa es rechazada explícitamente, o si cualquier error/excepción es capturado durante la resolución.

Si uno de los argumentos se omite o de lo contrario no es una función válida — típicamente usarás `null` en su lugar — se usa un equivalente placeholder por defecto. El callback de éxito por defecto pasa su valor de cumplimiento y el callback de error por defecto propaga su razón de rechazo.

La forma abreviada para llamar `then(null,handleRejection)` es `catch(handleRejection)`.

Tanto `then(..)` como `catch(..)` automáticamente construyen y devuelven otra instancia de promesa, que está conectada para recibir la resolución de cualquiera que sea el valor de retorno del manejador de cumplimiento o rechazo de la promesa original (el que realmente se llame). Considera:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return contents.toUpperCase();
	},
	function rejected(reason){
		return "DEFAULT VALUE";
	}
)
.then( function fulfilled(data){
	// handle data from original promise's
	// handlers
} );
```

En este fragmento, estamos devolviendo un valor inmediato de `fulfilled(..)` o `rejected(..)`, que luego se recibe en el siguiente turno de evento en el `fulfilled(..)` del segundo `then(..)`. Si en su lugar devolvemos una nueva promesa, esa nueva promesa se subsume y adopta como la resolución:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return ajax(
			"http://some.url.2?v=" + contents
		);
	},
	function rejected(reason){
		return ajax(
			"http://backup.url.3?err=" + reason
		);
	}
)
.then( function fulfilled(contents){
	// `contents` comes from the subsequent
	// `ajax(..)` call, whichever it was
} );
```

Es importante notar que una excepción (o promesa rechazada) en el primer `fulfilled(..)` *no* resultará en que se llame al primer `rejected(..)`, ya que ese manejador solo responde a la resolución de la primera promesa original. En su lugar, la segunda promesa, contra la cual se llama el segundo `then(..)`, recibe ese rechazo.

En este fragmento anterior, no estamos escuchando ese rechazo, lo que significa que se mantendrá silenciosamente para observación futura. Si nunca lo observas llamando un `then(..)` o `catch(..)`, entonces permanecerá sin manejar. Algunas consolas de desarrollador de navegador pueden detectar estos rechazos sin manejar y reportarlos, pero esto no está garantizado de forma confiable; siempre deberías observar los rechazos de promesas.

**Nota:** Esto fue solo un breve resumen de la teoría y comportamiento de las Promesas. Para una exploración mucho más profunda, ver el Capítulo 3 del título *Async & Performance* de esta serie.

### Thenables

Las Promesas son instancias genuinas del constructor `Promise(..)`. Sin embargo, hay objetos similares a promesas llamados *thenables* que generalmente pueden interoperar con los mecanismos de Promesas.

Cualquier objeto (o función) con una función `then(..)` en él se asume que es un thenable. Cualquier lugar donde los mecanismos de Promesas pueden aceptar y adoptar el estado de una promesa genuina, también pueden manejar un thenable.

Los thenables son básicamente una etiqueta general para cualquier valor similar a una promesa que puede haber sido creado por algún otro sistema que no sea el constructor real `Promise(..)`. En esa perspectiva, un thenable es generalmente menos confiable que una Promesa genuina. Considera este thenable que se comporta mal, por ejemplo:

```js
var th = {
	then: function thener( fulfilled ) {
		// call `fulfilled(..)` once every 100ms forever
		setInterval( fulfilled, 100 );
	}
};
```

Si recibes ese thenable y lo encadenas con `th.then(..)`, probablemente te sorprenderás de que tu manejador de cumplimiento se llame repetidamente, cuando las Promesas normales se supone que solo se resuelven una vez.

Generalmente, si estás recibiendo lo que pretende ser una promesa o thenable de vuelta de algún otro sistema, no deberías simplemente confiar en ello ciegamente. En la siguiente sección, veremos una utilidad incluida con las Promesas ES6 que ayuda a abordar esta preocupación de confianza.

Pero para entender más los peligros de este tema, considera que *cualquier* objeto en *cualquier* pieza de código que haya sido definido para tener un método llamado `then(..)` puede ser potencialmente confundido como un thenable — si se usa con Promesas, por supuesto — independientemente de si esa cosa alguna vez fue intencionada para estar ni remotamente relacionada con codificación asíncrona estilo Promesas.

Antes de ES6, nunca hubo ninguna reserva especial hecha sobre métodos llamados `then(..)`, y como puedes imaginar ha habido al menos algunos casos donde ese nombre de método fue elegido antes de que las Promesas aparecieran en el radar. El caso más probable de thenable confundido serán bibliotecas asíncronas que usan `then(..)` pero que no son estrictamente compatibles con Promesas — hay varias en circulación.

La responsabilidad será tuya de protegerte contra el uso directo de valores con el mecanismo de Promesas que serían incorrectamente asumidos como thenables.

### API de `Promise`

La API de `Promise` también proporciona algunos métodos estáticos para trabajar con Promesas.

`Promise.resolve(..)` crea una promesa resuelta al valor pasado. Comparemos cómo funciona contra el enfoque más manual:

```js
var p1 = Promise.resolve( 42 );

var p2 = new Promise( function pr(resolve){
	resolve( 42 );
} );
```

`p1` y `p2` tendrán esencialmente comportamiento idéntico. Lo mismo aplica para resolver con una promesa:

```js
var theP = ajax( .. );

var p1 = Promise.resolve( theP );

var p2 = new Promise( function pr(resolve){
	resolve( theP );
} );
```

**Consejo:** `Promise.resolve(..)` es la solución al problema de confianza de thenables planteado en la sección anterior. Cualquier valor del que no estés ya seguro de que es una promesa confiable — incluso si podría ser un valor inmediato — puede normalizarse pasándolo a `Promise.resolve(..)`. Si el valor ya es una promesa o thenable reconocible, su estado/resolución simplemente se adoptará, aislándote del mal comportamiento. Si en su lugar es un valor inmediato, será "envuelto" en una promesa genuina, normalizando así su comportamiento para ser asíncrono.

`Promise.reject(..)` crea una promesa inmediatamente rechazada, igual que su contraparte del constructor `Promise(..)`:

```js
var p1 = Promise.reject( "Oops" );

var p2 = new Promise( function pr(resolve,reject){
	reject( "Oops" );
} );
```

Mientras que `resolve(..)` y `Promise.resolve(..)` pueden aceptar una promesa y adoptar su estado/resolución, `reject(..)` y `Promise.reject(..)` no diferencian qué valor reciben. Así que, si rechazas con una promesa o thenable, la promesa/thenable en sí se establecerá como la razón de rechazo, no su valor subyacente.

`Promise.all([ .. ])` acepta un array de uno o más valores (por ejemplo, valores inmediatos, promesas, thenables). Devuelve una promesa que se cumplirá si todos los valores se cumplen, o se rechaza inmediatamente una vez que el primero de cualquiera de ellos se rechaza.

Comenzando con estos valores/promesas:

```js
var p1 = Promise.resolve( 42 );
var p2 = new Promise( function pr(resolve){
	setTimeout( function(){
		resolve( 43 );
	}, 100 );
} );
var v3 = 44;
var p4 = new Promise( function pr(resolve,reject){
	setTimeout( function(){
		reject( "Oops" );
	}, 10 );
} );
```

Consideremos cómo funciona `Promise.all([ .. ])` con combinaciones de esos valores:

```js
Promise.all( [p1,p2,v3] )
.then( function fulfilled(vals){
	console.log( vals );			// [42,43,44]
} );

Promise.all( [p1,p2,v3,p4] )
.then(
	function fulfilled(vals){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

Mientras que `Promise.all([ .. ])` espera todos los cumplimientos (o el primer rechazo), `Promise.race([ .. ])` espera solo el primer cumplimiento o rechazo. Considera:

```js
// NOTE: re-setup all test values to
// avoid timing issues misleading you!

Promise.race( [p2,p1,v3] )
.then( function fulfilled(val){
	console.log( val );				// 42
} );

Promise.race( [p2,p4] )
.then(
	function fulfilled(val){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

**Advertencia:** Mientras que `Promise.all([])` se cumplirá inmediatamente (sin valores), `Promise.race([])` se quedará colgada para siempre. Esta es una inconsistencia extraña, y habla sobre la sugerencia de que nunca deberías usar estos métodos con arrays vacíos.

## Generadores + Promesas

*Es* posible expresar una serie de promesas en una cadena para representar el control de flujo asíncrono de tu programa. Considera:

```js
step1()
.then(
	step2,
	step1Failed
)
.then(
	function step3(msg) {
		return Promise.all( [
			step3a( msg ),
			step3b( msg ),
			step3c( msg )
		] )
	}
)
.then(step4);
```

Sin embargo, hay una opción mucho mejor para expresar control de flujo asíncrono, y probablemente será mucho más preferible en términos de estilo de codificación que cadenas largas de promesas. Podemos usar lo que aprendimos en el Capítulo 3 sobre generadores para expresar nuestro control de flujo asíncrono.

El patrón importante a reconocer: un generador puede hacer yield de una promesa, y esa promesa puede entonces conectarse para reanudar el generador con su valor de cumplimiento.

Considera el flujo asíncrono del fragmento anterior expresado con un generador:

```js
function *main() {

	try {
		var ret = yield step1();
	}
	catch (err) {
		ret = yield step1Failed( err );
	}

	ret = yield step2( ret );

	// step 3
	ret = yield Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	yield step4( ret );
}
```

En la superficie, este fragmento puede parecer más verboso que el equivalente de cadena de promesas en el fragmento anterior. Sin embargo, ofrece un estilo de codificación con apariencia síncrona mucho más atractivo — y más importante, más comprensible y razonable — (con asignación `=` de valores de "retorno", etc.) Eso es especialmente cierto en que el manejo de errores `try..catch` puede usarse a través de esas fronteras asíncronas ocultas.

¿Por qué estamos usando Promesas con el generador? Ciertamente es posible hacer codificación asíncrona con generadores sin Promesas.

Las Promesas son un sistema confiable que desinvierte la inversión de control de callbacks normales o thunks (ver el título *Async & Performance* de esta serie). Así que, combinar la confiabilidad de las Promesas y la sincronicidad del código en generadores aborda efectivamente todas las deficiencias principales de los callbacks. También, utilidades como `Promise.all([ .. ])` son una forma agradable y limpia de expresar concurrencia en un solo paso `yield` de un generador.

¿Entonces cómo funciona esta magia? Vamos a necesitar un *ejecutor* que pueda ejecutar nuestro generador, recibir una promesa a la que se hizo `yield`, y conectarla para reanudar el generador con el valor de éxito del cumplimiento, o lanzar un error en el generador con la razón de rechazo.

Muchas utilidades/bibliotecas con capacidad asíncrona tienen tal "ejecutor"; por ejemplo, `Q.spawn(..)` y el plug-in `runner(..)` de mi asynquence. Pero aquí hay un ejecutor independiente para ilustrar cómo funciona el proceso:

```js
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	it = gen.apply( this, args );

	return Promise.resolve()
		.then( function handleNext(value){
			var next = it.next( value );

			return (function handleResult(next){
				if (next.done) {
					return next.value;
				}
				else {
					return Promise.resolve( next.value )
						.then(
							handleNext,
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})( next );
		} );
}
```

**Nota:** Para una versión más prolíficamente comentada de esta utilidad, ver el título *Async & Performance* de esta serie. También, las utilidades de ejecución proporcionadas con varias bibliotecas asíncronas son frecuentemente más potentes/capaces que lo que hemos mostrado aquí. Por ejemplo, el `runner(..)` de asynquence puede manejar promesas, secuencias, thunks, y valores inmediatos (no-promesa) a los que se les hace yield, dándote flexibilidad máxima.

Así que ahora ejecutar `*main()` como se listó en el fragmento anterior es tan fácil como:

```js
run( main )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

Esencialmente, en cualquier lugar donde tengas más de dos pasos asíncronos de lógica de control de flujo en tu programa, puedes *y deberías* usar un generador que hace yield de promesas impulsado por una utilidad de ejecución para expresar el control de flujo de manera síncrona. Esto hará código mucho más fácil de entender y mantener.

Este patrón de hacer-yield-de-una-promesa-reanudar-el-generador va a ser tan común y tan poderoso, que la siguiente versión de JavaScript después de ES6 casi con certeza va a introducir un nuevo tipo de función que lo hará automáticamente sin necesitar la utilidad de ejecución. Cubriremos las `async function`s (como se espera que se llamen) en el Capítulo 8.

## Revisión

A medida que JavaScript continúa madurando y creciendo en su adopción generalizada, la programación asíncrona es cada vez más una preocupación central. Los callbacks no son totalmente suficientes para estas tareas, y se desmoronan completamente cuanto más sofisticada es la necesidad.

Afortunadamente, ES6 añade Promesas para abordar una de las principales deficiencias de los callbacks: falta de confianza en comportamiento predecible. Las Promesas representan el valor de completado futuro de una tarea potencialmente asíncrona, normalizando el comportamiento a través de las fronteras síncronas y asíncronas.

Pero es la combinación de Promesas con generadores lo que realiza completamente los beneficios de reorganizar nuestro código de control de flujo asíncrono para des-enfatizar y abstraer esa fea sopa de callbacks (también conocida como "infierno").

Ahora mismo, podemos gestionar estas interacciones con la ayuda de los ejecutores de varias bibliotecas asíncronas, ¡pero JavaScript eventualmente va a soportar este patrón de interacción con sintaxis dedicada sola!
