# You Don't Know JS: ES6 & Más Allá
# Capítulo 8: Más Allá de ES6

Al momento de escribir esto, el borrador final de ES6 (*ECMAScript 2015*) se dirige en breve hacia su voto final de aprobación oficial por ECMA. Pero incluso mientras ES6 se está finalizando, el comité TC39 ya está trabajando arduamente en características para ES7/2016 y más allá.

Como discutimos en el Capítulo 1, se espera que la cadencia de progreso para JS se va a acelerar de actualizarse una vez cada varios años a tener una actualización de versión oficial una vez al año (de ahí la nomenclatura basada en años). Eso solo va a cambiar radicalmente cómo los desarrolladores JS aprenden sobre y se mantienen al día con el lenguaje.

Pero aún más importante, el comité en realidad va a trabajar característica por característica. Tan pronto como una característica esté completa en la especificación y haya resuelto sus problemas a través de experimentos de implementación en algunos navegadores, esa característica se considerará lo suficientemente estable para comenzar a usarse. Se nos anima fuertemente a adoptar características una vez que estén listas en lugar de esperar algún voto oficial de estándares. Si aún no has aprendido ES6, ¡el tiempo está *más que vencido* para subirse al tren!

Al momento de escribir esto, una lista de propuestas futuras y su estado puede verse aquí (https://github.com/tc39/ecma262#current-proposals).

Los transpiladores y polyfills son cómo haremos puente hacia estas nuevas características incluso antes de que todos los navegadores que soportamos las hayan implementado. Babel, Traceur, y varios otros transpiladores importantes ya tienen soporte para algunas de las características post-ES6 que es más probable que se estabilicen.

Con eso en mente, ya es hora de que veamos algunas de ellas. ¡Entremos!

**Advertencia:** Estas características están todas en varias etapas de desarrollo. Aunque es probable que lleguen, y probablemente se verán similares, toma el contenido de este capítulo con más de unos pocos granos de sal. Este capítulo evolucionará en futuras ediciones de este título a medida que estas (¡y otras!) características se finalicen.

## `async function`s

En "Generadores + Promesas" en el Capítulo 4, mencionamos que hay una propuesta para soporte sintáctico directo para el patrón de generadores que hacen `yield` de promesas a una utilidad tipo runner que los reanudará al completarse la promesa. Echemos un breve vistazo a esa característica propuesta, llamada `async function`.

Recuerda este ejemplo de generador del Capítulo 4:

```js
run( function *main() {
	var ret = yield step1();

	try {
		ret = yield step2( ret );
	}
	catch (err) {
		ret = yield step2Failed( err );
	}

	ret = yield Promise.all([
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	]);

	yield step4( ret );
} )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

La sintaxis propuesta de `async function` puede expresar esta misma lógica de control de flujo sin necesitar la utilidad `run(..)`, porque JS automáticamente sabrá cómo buscar promesas para esperar y reanudar. Considera:

```js
async function main() {
	var ret = await step1();

	try {
		ret = await step2( ret );
	}
	catch (err) {
		ret = await step2Failed( err );
	}

	ret = await Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	await step4( ret );
}

main()
.then(
	function fulfilled(){
		// `main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

En lugar de la declaración `function *main() { ..`, declaramos con la forma `async function main() { ..`. Y en lugar de hacer `yield` de una promesa, hacemos `await` de la promesa. La llamada para ejecutar la función `main()` en realidad devuelve una promesa que podemos observar directamente. Eso es el equivalente a la promesa que obtenemos de una llamada `run(main)`.

¿Ves la simetría? `async function` es esencialmente azúcar sintáctico para el patrón de generadores + promesas + `run(..)`; ¡bajo las coberturas, opera igual!

Si eres un desarrollador de C# y este `async`/`await` te parece familiar, es porque esta característica está directamente inspirada en la característica de C#. ¡Es agradable ver la precedencia del lenguaje informando la convergencia!

Babel, Traceur y otros transpiladores ya tienen soporte temprano para el estado actual de las `async function`s, así que puedes comenzar a usarlas ya. Sin embargo, en la siguiente sección "Advertencias", veremos por qué quizás no deberías subir a ese barco todavía.

**Nota:** También hay una propuesta para `async function*`, que se llamaría un "generador asíncrono". Puedes tanto hacer `yield` como `await` en el mismo código, e incluso combinar esas operaciones en la misma sentencia: `x = await yield y`. La propuesta de "generador asíncrono" parece estar más en flujo -- es decir, su valor de retorno aún no está completamente resuelto. Algunos sienten que debería ser un *observable*, que es algo así como la combinación de un iterador y una promesa. Por ahora, no iremos más lejos en ese tema, pero mantente atento a medida que evolucione.

### Advertencias

Un punto de contención sin resolver con `async function` es que debido a que solo devuelve una promesa, no hay forma desde el exterior de *cancelar* una instancia de `async function` que está actualmente ejecutándose. Esto puede ser un problema si la operación asíncrona consume muchos recursos, y quieres liberar los recursos tan pronto como estés seguro de que el resultado no será necesario.

Por ejemplo:

```js
async function request(url) {
	var resp = await (
		new Promise( function(resolve,reject){
			var xhr = new XMLHttpRequest();
			xhr.open( "GET", url );
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						resolve( xhr );
					}
					else {
						reject( xhr.statusText );
					}
				}
			};
			xhr.send();
		} )
	);

	return resp.responseText;
}

var pr = request( "http://some.url.1" );

pr.then(
	function fulfilled(responseText){
		// ajax success
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

Esta `request(..)` que he concebido es algo similar a la utilidad `fetch(..)` que recientemente ha sido propuesta para inclusión en la plataforma web. Entonces la preocupación es, ¿qué pasa si quieres usar el valor `pr` para de alguna manera indicar que quieres cancelar una solicitud Ajax de larga ejecución, por ejemplo?

Las promesas no son cancelables (al momento de escribir esto, de todos modos). En mi opinión, así como la de muchos otros, nunca deberían serlo (consulta el título *Async & Performance* de esta serie). E incluso si una promesa tuviera un método `cancel()`, ¿eso necesariamente significa que llamar `pr.cancel()` debería realmente propagar una señal de cancelación todo el camino de vuelta por la cadena de promesas hasta la `async function`?

Varias posibles resoluciones a este debate han surgido:

* Las `async function`s no serán cancelables en absoluto (statu quo)
* Se puede pasar un "token de cancelación" a una función async al momento de la llamada
* El valor de retorno cambia a un tipo de promesa-cancelable que se añade
* El valor de retorno cambia a algo más que no sea promesa (por ejemplo, observable, o token de control con capacidades de promesa y cancelación)

Al momento de escribir esto, las `async function`s devuelven promesas regulares, así que es menos probable que el valor de retorno cambie por completo. Pero es muy pronto para decir dónde terminarán las cosas. Mantén un ojo en esta discusión.

## `Object.observe(..)`

Uno de los santos griales del desarrollo web front-end es el data binding -- escuchar actualizaciones a un objeto de datos y sincronizar la representación DOM de esos datos. La mayoría de los frameworks JS proporcionan algún mecanismo para este tipo de operaciones.

Parece probable que después de ES6, veremos soporte añadido directamente al lenguaje, a través de una utilidad llamada `Object.observe(..)`. Esencialmente, la idea es que puedes configurar un listener para observar los cambios de un objeto, y tener un callback que se llame cada vez que ocurra un cambio. Entonces puedes actualizar el DOM correspondientemente, por ejemplo.

Hay seis tipos de cambios que puedes observar:

* add
* update
* delete
* reconfigure
* setPrototype
* preventExtensions

Por defecto, serás notificado de todos estos tipos de cambio, pero puedes filtrar solo a los que te importan.

Considera:

```js
var obj = { a: 1, b: 2 };

Object.observe(
	obj,
	function(changes){
		for (var change of changes) {
			console.log( change );
		}
	},
	[ "add", "update", "delete" ]
);

obj.c = 3;
// { name: "c", object: obj, type: "add" }

obj.a = 42;
// { name: "a", object: obj, type: "update", oldValue: 1 }

delete obj.b;
// { name: "b", object: obj, type: "delete", oldValue: 2 }
```

Además de los principales tipos de cambio `"add"`, `"update"`, y `"delete"`:

* El evento de cambio `"reconfigure"` se dispara si una de las propiedades del objeto se reconfigura con `Object.defineProperty(..)`, como cambiar su atributo `writable`. Consulta el título *this & Object Prototypes* de esta serie para más información.
* El evento de cambio `"preventExtensions"` se dispara si el objeto se hace no-extensible vía `Object.preventExtensions(..)`.

   Debido a que tanto `Object.seal(..)` como `Object.freeze(..)` también implican `Object.preventExtensions(..)`, también dispararán su evento de cambio correspondiente. Además, los eventos de cambio `"reconfigure"` también se dispararán para cada propiedad en el objeto.
* El evento de cambio `"setPrototype"` se dispara si el `[[Prototype]]` de un objeto cambia, ya sea estableciéndolo con el setter `__proto__`, o usando `Object.setPrototypeOf(..)`.

Nota que estos eventos de cambio se notifican inmediatamente después de dicho cambio. No confundas esto con proxies (ver Capítulo 7) donde puedes interceptar las acciones antes de que ocurran. La observación de objetos te permite responder después de que un cambio (o conjunto de cambios) ocurre.

### Eventos de Cambio Personalizados

Además de los seis tipos de eventos de cambio integrados, también puedes escuchar y disparar eventos de cambio personalizados.

Considera:

```js
function observer(changes){
	for (var change of changes) {
		if (change.type == "recalc") {
			change.object.c =
				change.object.oldValue +
				change.object.a +
				change.object.b;
		}
	}
}

function changeObj(a,b) {
	var notifier = Object.getNotifier( obj );

	obj.a = a * 2;
	obj.b = b * 3;

	// encolar eventos de cambio en un conjunto
	notifier.notify( {
		type: "recalc",
		name: "c",
		oldValue: obj.c
	} );
}

var obj = { a: 1, b: 2, c: 3 };

Object.observe(
	obj,
	observer,
	["recalc"]
);

changeObj( 3, 11 );

obj.a;			// 12
obj.b;			// 30
obj.c;			// 3
```

El conjunto de cambios (evento personalizado `"recalc"`) ha sido encolado para entrega al observador, pero no entregado aún, por eso `obj.c` sigue siendo `3`.

Los cambios por defecto se entregan al final del bucle de eventos actual (consulta el título *Async & Performance* de esta serie). Si quieres entregarlos inmediatamente, usa `Object.deliverChangeRecords(observer)`. Una vez que los eventos de cambio se entregan, puedes observar `obj.c` actualizado como se espera:

```js
obj.c;			// 42
```

En el ejemplo anterior, llamamos a `notifier.notify(..)` con el registro completo del evento de cambio. Una forma alternativa de encolar registros de cambio es usar `performChange(..)`, que separa la especificación del tipo de evento del resto de las propiedades del registro de evento (a través de un callback de función). Considera:

```js
notifier.performChange( "recalc", function(){
	return {
		name: "c",
		// `this` es el objeto bajo observación
		oldValue: this.c
	};
} );
```

En ciertas circunstancias, esta separación de preocupaciones puede mapearse más limpiamente a tu patrón de uso.

### Finalizar la Observación

Al igual que con los listeners de eventos normales, podrías querer dejar de observar los eventos de cambio de un objeto. Para eso, usas `Object.unobserve(..)`.

Por ejemplo:

```js
var obj = { a: 1, b: 2 };

Object.observe( obj, function observer(changes) {
	for (var change of changes) {
		if (change.type == "setPrototype") {
			Object.unobserve(
				change.object, observer
			);
			break;
		}
	}
} );
```

En este ejemplo trivial, escuchamos eventos de cambio hasta que vemos el evento `"setPrototype"` llegar, momento en el cual dejamos de observar más eventos de cambio.

## Operador de Exponenciación

Se ha propuesto un operador para JavaScript para realizar exponenciación de la misma manera que `Math.pow(..)` lo hace. Considera:

```js
var a = 2;

a ** 4;			// Math.pow( a, 4 ) == 16

a **= 3;		// a = Math.pow( a, 3 )
a;				// 8
```

**Nota:** `**` es esencialmente lo mismo que aparece en Python, Ruby, Perl, y otros.

## Propiedades de Objetos y `...`

Como vimos en la sección "Demasiados, Muy Pocos, Justo los Necesarios" del Capítulo 2, el operador `...` es bastante obvio en cómo se relaciona con expandir o recopilar arrays. ¿Pero qué hay de los objetos?

Tal característica fue considerada para ES6, pero fue diferida para ser considerada después de ES6 (también conocido como "ES7" o "ES2016" o ...). Así es como podría funcionar en ese marco temporal "más allá de ES6":

```js
var o1 = { a: 1, b: 2 },
	o2 = { c: 3 },
	o3 = { ...o1, ...o2, d: 4 };

console.log( o3.a, o3.b, o3.c, o3.d );
// 1 2 3 4
```

El operador `...` también podría usarse para recopilar las propiedades desestructuradas de un objeto de vuelta en un objeto:

```js
var o1 = { b: 2, c: 3, d: 4 };
var { b, ...o2 } = o1;

console.log( b, o2.c, o2.d );		// 2 3 4
```

Aquí, el `...o2` re-recopila las propiedades desestructuradas `c` y `d` de vuelta en un objeto `o2` (`o2` no tiene una propiedad `b` como `o1` sí tiene).

De nuevo, estas son solo propuestas bajo consideración más allá de ES6. Pero será genial si efectivamente se implementan.

## `Array#includes(..)`

Una tarea extremadamente común que los desarrolladores JS necesitan realizar es buscar un valor dentro de un array de valores. La forma en que esto siempre se ha hecho es:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.indexOf( 42 ) >= 0) {
	// ¡encontrado!
}
```

La razón de la verificación `>= 0` es porque `indexOf(..)` devuelve un valor numérico de `0` o mayor si se encuentra, o `-1` si no se encuentra. En otras palabras, estamos usando una función que devuelve un índice en un contexto booleano. Pero debido a que `-1` es truthy en lugar de falsy, tenemos que ser más manuales con nuestras verificaciones.

En el título *Types & Grammar* de esta serie, exploré otro patrón que prefiero ligeramente:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (~vals.indexOf( 42 )) {
	// ¡encontrado!
}
```

El operador `~` aquí conforma el valor de retorno de `indexOf(..)` a un rango de valores que es adecuadamente coercible a booleano. Es decir, `-1` produce `0` (falsy), y cualquier otra cosa produce un valor no-cero (truthy), que es lo que necesitamos para decidir si encontramos el valor o no.

Aunque yo creo que eso es una mejora, otros están fuertemente en desacuerdo. Sin embargo, nadie puede argumentar que la lógica de búsqueda de `indexOf(..)` es perfecta. Falla al encontrar valores `NaN` en el array, por ejemplo.

Así que una propuesta ha surgido y ganado mucho apoyo para añadir un método de búsqueda de array que devuelva realmente un booleano, llamado `includes(..)`:

```js
var vals = [ "foo", "bar", 42, "baz" ];

if (vals.includes( 42 )) {
	// ¡encontrado!
}
```

**Nota:** `Array#includes(..)` usa lógica de coincidencia que encontrará valores `NaN`, pero no distinguirá entre `-0` y `0` (consulta el título *Types & Grammar* de esta serie). Si no te importan los valores `-0` en tus programas, esto probablemente será exactamente lo que esperas. Si *sí* te importa `-0`, necesitarás hacer tu propia lógica de búsqueda, probablemente usando la utilidad `Object.is(..)` (ver Capítulo 6).

## SIMD

Cubrimos Single Instruction, Multiple Data (SIMD) con más detalle en el título *Async & Performance* de esta serie, pero merece una breve mención aquí, ya que es una de las siguientes características más probables de aterrizar en un futuro JS.

La API SIMD expone varias instrucciones de bajo nivel (CPU) que pueden operar en más de un solo valor numérico a la vez. Por ejemplo, podrás especificar dos *vectores* de 4 u 8 números cada uno, y multiplicar los elementos respectivos todos a la vez (¡paralelismo de datos!).

Considera:

```js
var v1 = SIMD.float32x4( 3.14159, 21.0, 32.3, 55.55 );
var v2 = SIMD.float32x4( 2.1, 3.2, 4.3, 5.4 );

SIMD.float32x4.mul( v1, v2 );
// [ 6.597339, 67.2, 138.89, 299.97 ]
```

SIMD incluirá varias otras operaciones además de `mul(..)` (multiplicación), como `sub()`, `div()`, `abs()`, `neg()`, `sqrt()`, y muchas más.

Las operaciones matemáticas en paralelo son críticas para las próximas generaciones de aplicaciones JS de alto rendimiento.

## WebAssembly (WASM)

Brendan Eich hizo un anuncio de última hora cerca de la finalización de la primera edición de este título que tiene el potencial de impactar significativamente el camino futuro de JavaScript: WebAssembly (WASM). No podremos cubrir WASM en detalle aquí, ya que es extremadamente temprano al momento de escribir esto. Pero este título estaría incompleto sin al menos una breve mención de ello.

Una de las presiones más fuertes sobre los cambios de diseño recientes (y del futuro cercano) del lenguaje JS ha sido el deseo de que se convierta en un objetivo más adecuado para transpilación/compilación cruzada desde otros lenguajes (como C/C++, ClojureScript, etc.). Obviamente, el rendimiento del código ejecutándose como JavaScript ha sido una preocupación principal.

Como se discutió en el título *Async & Performance* de esta serie, hace unos años un grupo de desarrolladores en Mozilla introdujeron una idea a JavaScript llamada ASM.js. ASM.js es un subconjunto de JS válido que más significativamente restringe ciertas acciones que hacen que el código sea difícil de optimizar para el motor JS. El resultado es que el código compatible con ASM.js ejecutándose en un motor consciente de ASM puede ejecutarse notablemente más rápido, casi a la par con equivalentes nativos optimizados en C. Muchos vieron ASM.js como la columna vertebral más probable sobre la cual las aplicaciones hambrientas de rendimiento se montarían en JavaScript.

En otras palabras, todos los caminos para ejecutar código en el navegador *pasan por JavaScript*.

Eso es, hasta el anuncio de WASM. WASM proporciona un camino alternativo para que otros lenguajes apunten al entorno de ejecución del navegador sin tener que pasar primero por JavaScript. Esencialmente, si WASM despega, los motores JS crecerán una capacidad extra para ejecutar un formato binario de código que puede verse como algo similar a un bytecode (como el que se ejecuta en la JVM).

WASM propone un formato para una representación binaria de un AST (árbol de sintaxis) altamente comprimido de código, que puede entonces dar instrucciones directamente al motor JS y sus bases subyacentes, sin tener que ser parseado por JS, o incluso comportarse según las reglas de JS. Lenguajes como C o C++ pueden compilarse directamente al formato WASM en lugar de ASM.js, y ganar una ventaja de velocidad extra al saltar el parseo de JS.

El futuro cercano para WASM es tener paridad con ASM.js y de hecho con JS. Pero eventualmente, se espera que WASM crezca con nuevas capacidades que superen cualquier cosa que JS pueda hacer. Por ejemplo, la presión para que JS evolucione características radicales como threads -- un cambio que ciertamente enviaría ondas de choque importantes a través del ecosistema JS -- tiene un futuro más esperanzador como una futura extensión de WASM, aliviando la presión de cambiar JS.

De hecho, esta nueva hoja de ruta abre muchos nuevos caminos para que muchos lenguajes apunten al runtime web. ¡Ese es un nuevo futuro emocionante para la plataforma web!

¿Qué significa para JS? ¿Se volverá JS irrelevante o "morirá"? Absolutamente no. ASM.js probablemente no verá mucho futuro más allá de los próximos par de años, pero la mayoría de JS está bastante anclado de forma segura en la historia de la plataforma web.

Los proponentes de WASM sugieren que su éxito significará que el diseño de JS será protegido de presiones que eventualmente lo habrían estirado más allá de los puntos de quiebre asumidos de razonabilidad. Se proyecta que WASM se convertirá en el objetivo preferido para partes de alto rendimiento de las aplicaciones, tal como están escritas en cualquiera de una miríada de diferentes lenguajes.

Interesantemente, JavaScript es uno de los lenguajes menos probables de apuntar a WASM en el futuro. Puede haber cambios futuros que delineen subconjuntos de JS que podrían ser viables para tal objetivo, pero ese camino no parece estar alto en la lista de prioridades.

Aunque JS probablemente no será mucho un embudo de WASM, el código JS y el código WASM podrán interoperar de las formas más significativas, tan naturalmente como las interacciones de módulos actuales. Puedes imaginar llamar a una función JS como `foo()` y que eso realmente invoque una función WASM de ese nombre con el poder de ejecutarse bien fuera de las restricciones del resto de tu JS.

Las cosas que actualmente están escritas en JS probablemente continuarán siempre estando escritas en JS, al menos para el futuro previsible. Las cosas que se transpilan a JS probablemente eventualmente al menos consideren apuntar a WASM en su lugar. Para cosas que necesitan lo máximo en rendimiento con tolerancia mínima para capas de abstracción, la elección probable será encontrar un lenguaje no-JS adecuado para escribir, y entonces apuntar a WASM.

Hay una buena probabilidad de que este cambio sea lento, y tomará años en desarrollarse. WASM aterrizando en todas las plataformas de navegadores principales probablemente esté a unos años como mínimo. Mientras tanto, el proyecto WASM (https://github.com/WebAssembly) tiene un polyfill temprano para demostrar la prueba de concepto de sus principios básicos.

Pero a medida que pase el tiempo, y a medida que WASM aprenda nuevos trucos no-JS, no es demasiado estirar la imaginación ver algunas cosas actualmente en JS siendo refactorizadas a un lenguaje que pueda apuntar a WASM. Por ejemplo, las partes sensibles al rendimiento de frameworks, motores de juegos, y otras herramientas muy usadas podrían muy bien beneficiarse de tal cambio. Los desarrolladores usando estas herramientas en sus aplicaciones web probablemente no notarán mucha diferencia en uso o integración, sino que simplemente aprovecharán automáticamente el rendimiento y las capacidades.

Lo que es seguro es que cuanto más real se vuelva WASM con el tiempo, más significará para la trayectoria y el diseño de JavaScript. Es quizás uno de los temas "más allá de ES6" más importantes que los desarrolladores deberían vigilar.

## Revisión

Si todos los otros libros en esta serie esencialmente proponen este desafío, "tú (quizás) no conoces JS (tanto como pensabas)," este libro en cambio ha sugerido, "ya no conoces JS." El libro ha cubierto una tonelada de cosas nuevas añadidas al lenguaje en ES6. Es una colección emocionante de nuevas características del lenguaje y paradigmas que mejorarán para siempre nuestros programas JS.

Pero JS no ha terminado con ES6. Ni de cerca. Ya hay bastantes características en varias etapas de desarrollo para el marco temporal "más allá de ES6". En este capítulo, echamos un breve vistazo a algunos de los candidatos más probables de aterrizar en JS muy pronto.

Las `async function`s son un poderoso azúcar sintáctico sobre el patrón de generadores + promesas (ver Capítulo 4). `Object.observe(..)` añade soporte nativo directo para observar eventos de cambio de objetos, que es crítico para implementar data binding. El operador de exponenciación `**`, `...` para propiedades de objetos, y `Array#includes(..)` son todas mejoras simples pero útiles a mecanismos existentes. Finalmente, SIMD inaugura una nueva era en la evolución de JS de alto rendimiento.

Tan cliché como suena, ¡el futuro de JS es realmente brillante! El desafío de esta serie, y de hecho de este libro, recae ahora en cada lector. ¿Qué estás esperando? ¡Es hora de empezar a aprender y explorar!
