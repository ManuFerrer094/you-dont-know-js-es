# You Don't Know JS: Tipos y Gramática
# Capítulo 3: Nativos

Varias veces en los Capítulos 1 y 2, hicimos alusión a varios incorporados, generalmente llamados "nativos", como `String` y `Number`. Examinemos esos en detalle ahora.

Aquí hay una lista de los nativos más comúnmente usados:

* `String()`
* `Number()`
* `Boolean()`
* `Array()`
* `Object()`
* `Function()`
* `RegExp()`
* `Date()`
* `Error()`
* `Symbol()` -- ¡agregado en ES6!

Como puedes ver, estos nativos son en realidad funciones incorporadas.

Si vienes a JS desde un lenguaje como Java, el `String()` de JavaScript se verá como el constructor `String(..)` al que estás acostumbrado para crear valores de string. Así que, rápidamente observarás que puedes hacer cosas como:

```js
var s = new String( "Hello World!" );

console.log( s.toString() ); // "Hello World!"
```

*Es* cierto que cada uno de estos nativos puede ser usado como un constructor nativo. Pero lo que se está construyendo puede ser diferente de lo que piensas.

```js
var a = new String( "abc" );

typeof a; // "object" ... no "String"

a instanceof String; // true

Object.prototype.toString.call( a ); // "[object String]"
```

El resultado de la forma de constructor de creación de valores (`new String("abc")`) es un objeto envoltorio alrededor del valor primitivo (`"abc"`).

Importantemente, `typeof` muestra que estos objetos no son sus propios *tipos* especiales, sino más apropiadamente son subtipos del tipo `object`.

Este objeto envoltorio puede ser observado además con:

```js
console.log( a );
```

La salida de esa declaración varía dependiendo de tu navegador, ya que las consolas de desarrollador son libres de elegir cómo consideran apropiado serializar el objeto para la inspección del desarrollador.

**Nota:** Al momento de escribir, la última versión de Chrome imprime algo como esto: `String {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}`. Pero versiones anteriores de Chrome solían imprimir solo esto: `String {0: "a", 1: "b", 2: "c"}`. La última versión de Firefox actualmente imprime `String ["a","b","c"]`, pero solía imprimir `"abc"` en itálicas, que era clicable para abrir el inspector de objetos. Por supuesto, estos resultados están sujetos a cambios rápidos y tu experiencia puede variar.

El punto es, `new String("abc")` crea un objeto envoltorio de string alrededor de `"abc"`, no solo el valor primitivo `"abc"` en sí.

## `[[Class]]` Interno

Los valores que son `typeof` `"object"` (como un array) están adicionalmente etiquetados con una propiedad interna `[[Class]]` (piensa en esto más como una *clas*ificación interna en lugar de estar relacionado con clases de la codificación tradicional orientada a clases). Esta propiedad no puede ser accedida directamente, pero generalmente puede ser revelada indirectamente tomando prestado el método predeterminado `Object.prototype.toString(..)` llamado contra el valor. Por ejemplo:

```js
Object.prototype.toString.call( [1,2,3] );			// "[object Array]"

Object.prototype.toString.call( /regex-literal/i );	// "[object RegExp]"
```

Entonces, para el array en este ejemplo, el valor interno de `[[Class]]` es `"Array"`, y para la expresión regular, es `"RegExp"`. En la mayoría de los casos, este valor interno de `[[Class]]` corresponde al constructor nativo incorporado (ver abajo) que está relacionado con el valor, pero ese no siempre es el caso.

¿Qué hay de los valores primitivos? Primero, `null` y `undefined`:

```js
Object.prototype.toString.call( null );			// "[object Null]"
Object.prototype.toString.call( undefined );	// "[object Undefined]"
```

Notarás que no hay constructores nativos `Null()` o `Undefined()`, pero sin embargo los `"Null"` y `"Undefined"` son los valores internos de `[[Class]]` expuestos.

Pero para las otras primitivas simples como `string`, `number` y `boolean`, otro comportamiento realmente entra en acción, que usualmente se llama "boxing" (ver la sección "Envoltorios Boxing" a continuación):

```js
Object.prototype.toString.call( "abc" );	// "[object String]"
Object.prototype.toString.call( 42 );		// "[object Number]"
Object.prototype.toString.call( true );		// "[object Boolean]"
```

En este fragmento, cada una de las primitivas simples son automáticamente encapsuladas por sus respectivos objetos envoltorio, razón por la cual `"String"`, `"Number"` y `"Boolean"` se revelan como los respectivos valores internos de `[[Class]]`.

**Nota:** El comportamiento de `toString()` y `[[Class]]` como se ilustra aquí ha cambiado un poco de ES5 a ES6, pero cubrimos esos detalles en el título *ES6 & Beyond* de esta serie.

## Envoltorios Boxing

Estos objetos envoltorio sirven un propósito muy importante. Los valores primitivos no tienen propiedades ni métodos, así que para acceder a `.length` o `.toString()` necesitas un objeto envoltorio alrededor del valor. Afortunadamente, JS automáticamente hará *box* (también conocido como envolver) el valor primitivo para satisfacer tales accesos.

```js
var a = "abc";

a.length; // 3
a.toUpperCase(); // "ABC"
```

Entonces, si vas a estar accediendo a estas propiedades/métodos en tus valores de string regularmente, como una condición `i < a.length` en un bucle `for` por ejemplo, podría parecer tener sentido simplemente tener la forma de objeto del valor desde el inicio, para que el motor JS no necesite crearlo implícitamente por ti.

Pero resulta que esa es una mala idea. Los navegadores hace mucho tiempo optimizaron el rendimiento de los casos comunes como `.length`, lo que significa que tu programa realmente *irá más lento* si intentas "preoptimizar" usando directamente la forma de objeto (que no está en la ruta optimizada).

En general, básicamente no hay razón para usar la forma de objeto directamente. Es mejor simplemente dejar que el boxing ocurra implícitamente donde sea necesario. En otras palabras, nunca hagas cosas como `new String("abc")`, `new Number(42)`, etc. -- siempre prefiere usar los valores primitivos literales `"abc"` y `42`.

### Trampas de los Objetos Envoltorio

Hay algunas trampas con usar los objetos envoltorio directamente de las que deberías estar consciente si *eliges* usarlos alguna vez.

Por ejemplo, considera los valores envueltos `Boolean`:

```js
var a = new Boolean( false );

if (!a) {
	console.log( "Oops" ); // nunca se ejecuta
}
```

El problema es que has creado un objeto envoltorio alrededor del valor `false`, pero los objetos en sí son "truthy" (ver Capítulo 4), así que usar el objeto se comporta de manera opuesta a usar el valor `false` subyacente en sí, lo cual es bastante contrario a la expectativa normal.

Si quieres encapsular manualmente un valor primitivo, puedes usar la función `Object(..)` (sin la palabra clave `new`):

```js
var a = "abc";
var b = new String( a );
var c = Object( a );

typeof a; // "string"
typeof b; // "object"
typeof c; // "object"

b instanceof String; // true
c instanceof String; // true

Object.prototype.toString.call( b ); // "[object String]"
Object.prototype.toString.call( c ); // "[object String]"
```

De nuevo, usar el objeto envoltorio encapsulado directamente (como `b` y `c` arriba) generalmente no se recomienda, pero puede haber algunas raras ocasiones donde puedas encontrarles utilidad.

## Unboxing

Si tienes un objeto envoltorio y quieres obtener el valor primitivo subyacente, puedes usar el método `valueOf()`:

```js
var a = new String( "abc" );
var b = new Number( 42 );
var c = new Boolean( true );

a.valueOf(); // "abc"
b.valueOf(); // 42
c.valueOf(); // true
```

El unboxing también puede ocurrir implícitamente, cuando se usa un valor de objeto envoltorio de una manera que requiere el valor primitivo. Este proceso (coerción) será cubierto en más detalle en el Capítulo 4, pero brevemente:

```js
var a = new String( "abc" );
var b = a + ""; // `b` tiene el valor primitivo unboxed "abc"

typeof a; // "object"
typeof b; // "string"
```

## Nativos como Constructores

Para valores de `array`, `object`, `function` y expresión regular, es casi universalmente preferido que uses la forma literal para crear los valores, pero la forma literal crea el mismo tipo de objeto que la forma de constructor (es decir, no hay valor sin envolver).

Tal como hemos visto arriba con los otros nativos, estas formas de constructor generalmente deberían evitarse, a menos que realmente sepas que las necesitas, principalmente porque introducen excepciones y trampas que probablemente realmente no *quieres* manejar.

### `Array(..)`

```js
var a = new Array( 1, 2, 3 );
a; // [1, 2, 3]

var b = [1, 2, 3];
b; // [1, 2, 3]
```

**Nota:** El constructor `Array(..)` no requiere la palabra clave `new` delante. Si la omites, se comportará como si la hubieras usado de todas formas. Así que `Array(1,2,3)` es el mismo resultado que `new Array(1,2,3)`.

El constructor `Array` tiene una forma especial donde si solo se pasa un argumento `number`, en lugar de proporcionar ese valor como *contenido* del array, se toma como una longitud para "predimensionar el array" (bueno, más o menos).

Esta es una idea terrible. Primero, puedes tropezar con esa forma accidentalmente, ya que es fácil de olvidar.

Pero más importantly, no existe tal cosa como realmente predimensionar el array. En su lugar, lo que estás creando es un array por lo demás vacío, pero estableciendo la propiedad `length` del array al valor numérico especificado.

Un array que no tiene valores explícitos en sus ranuras, pero tiene una propiedad `length` que *implica* que las ranuras existen, es un tipo de estructura de datos exótica y rara en JS con un comportamiento muy extraño y confuso. La capacidad de crear tal valor proviene puramente de funcionalidades antiguas, deprecadas e históricas (objetos "array-like" como el objeto `arguments`).

**Nota:** Un array con al menos una "ranura vacía" a menudo se llama un "array disperso".

No ayuda que este sea otro ejemplo donde las consolas de desarrollador de los navegadores varían en cómo representan tal objeto, lo que genera más confusión.

Por ejemplo:

```js
var a = new Array( 3 );

a.length; // 3
a;
```

La serialización de `a` en Chrome es (al momento de escribir): `[ undefined x 3 ]`. **Esto es realmente desafortunado.** Implica que hay tres valores `undefined` en las ranuras de este array, cuando de hecho las ranuras no existen (las llamadas "ranuras vacías" -- ¡también un mal nombre!).

Para visualizar la diferencia, prueba esto:

```js
var a = new Array( 3 );
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;

a;
b;
c;
```

**Nota:** Como puedes ver con `c` en este ejemplo, las ranuras vacías en un array pueden ocurrir después de la creación del array. Cambiar el `length` de un array más allá de su número de valores de ranura realmente definidos, implícitamente introduces ranuras vacías. De hecho, podrías incluso llamar `delete b[1]` en el fragmento anterior, y eso introduciría una ranura vacía en el medio de `b`.

Para `b` (en Chrome, actualmente), encontrarás `[ undefined, undefined, undefined ]` como la serialización, en oposición a `[ undefined x 3 ]` para `a` y `c`. ¿Confundido? Sí, todos los demás también.

Peor que eso, al momento de escribir, Firefox reporta `[ , , , ]` para `a` y `c`. ¿Captaste por qué es tan confuso? Mira de cerca. Tres comas implican cuatro ranuras, no tres ranuras como esperaríamos.

**¡¿Qué?!** Firefox pone una `,` extra al final de su serialización aquí porque a partir de ES5, las comas finales en listas (valores de array, listas de propiedades, etc.) son permitidas (y por lo tanto eliminadas e ignoradas). Así que si fueras a escribir un valor `[ , , , ]` en tu programa o la consola, realmente obtendrías el valor subyacente que es como `[ , , ]` (es decir, un array con tres ranuras vacías). Esta elección, aunque confusa si se lee la consola de desarrollador, se defiende como hacer que el comportamiento de copiar y pegar sea preciso.

Si estás sacudiendo tu cabeza o poniendo los ojos en blanco en este momento, ¡no estás solo! Encogimiento de hombros.

Desafortunadamente, se pone peor. Más que solo salida confusa de consola, `a` y `b` del fragmento de código anterior realmente se comportan igual en algunos casos **pero diferente en otros**:

```js
a.join( "-" ); // "--"
b.join( "-" ); // "--"

a.map(function(v,i){ return i; }); // [ undefined x 3 ]
b.map(function(v,i){ return i; }); // [ 0, 1, 2 ]
```

**Ugh.**

La llamada `a.map(..)` *falla* porque las ranuras realmente no existen, así que `map(..)` no tiene nada sobre que iterar. `join(..)` funciona de manera diferente. Básicamente, podemos pensar que está implementado algo como esto:

```js
function fakeJoin(arr,connector) {
	var str = "";
	for (var i = 0; i < arr.length; i++) {
		if (i > 0) {
			str += connector;
		}
		if (arr[i] !== undefined) {
			str += arr[i];
		}
	}
	return str;
}

var a = new Array( 3 );
fakeJoin( a, "-" ); // "--"
```

Como puedes ver, `join(..)` funciona simplemente *asumiendo* que las ranuras existen e iterando hasta el valor `length`. Lo que sea que `map(..)` hace internamente, (aparentemente) no hace tal suposición, así que el resultado del extraño array de "ranuras vacías" es inesperado y probablemente cause fallos.

Entonces, si quisieras *realmente* crear un array de valores `undefined` reales (no solo "ranuras vacías"), ¿cómo podrías hacerlo (además de manualmente)?

```js
var a = Array.apply( null, { length: 3 } );
a; // [ undefined, undefined, undefined ]
```

¿Confundido? Sí. Aquí está aproximadamente cómo funciona.

`apply(..)` es una utilidad disponible para todas las funciones, que llama a la función con la que se usa pero de una manera especial.

El primer argumento es un enlace de objeto `this` (cubierto en el título *this & Object Prototypes* de esta serie), que no nos importa aquí, así que lo establecemos en `null`. El segundo argumento se supone que es un array (o algo *como* un array -- también conocido como un "objeto array-like"). Los contenidos de este "array" se "esparcen" como argumentos a la función en cuestión.

Entonces, `Array.apply(..)` está llamando a la función `Array(..)` y esparciendo los valores (del valor del objeto `{ length: 3 }`) como sus argumentos.

Dentro de `apply(..)`, podemos imaginar que hay otro bucle `for` (algo como `join(..)` de arriba) que va desde `0` hasta, pero sin incluir, `length` (`3` en nuestro caso).

Para cada índice, recupera esa clave del objeto. Así que si el parámetro array-objeto fue nombrado `arr` internamente dentro de la función `apply(..)`, el acceso a la propiedad sería efectivamente `arr[0]`, `arr[1]`, y `arr[2]`. Por supuesto, ninguna de esas propiedades existe en el valor del objeto `{ length: 3 }`, así que los tres accesos a propiedad devolverían el valor `undefined`.

En otras palabras, termina llamando a `Array(..)` básicamente así: `Array(undefined,undefined,undefined)`, que es cómo terminamos con un array lleno de valores `undefined`, y no solo esas (locas) ranuras vacías.

Aunque `Array.apply( null, { length: 3 } )` es una forma extraña y verbosa de crear un array lleno de valores `undefined`, es **enormemente** mejor y más confiable que lo que obtienes con el peligroso `Array(3)` de ranuras vacías.

En resumen: **nunca jamás, bajo ninguna circunstancia**, deberías intencionalmente crear y usar estos exóticos arrays de ranuras vacías. Simplemente no lo hagas. Son una locura.

### `Object(..)`, `Function(..)`, y `RegExp(..)`

Los constructores `Object(..)`/`Function(..)`/`RegExp(..)` también son generalmente opcionales (y por lo tanto generalmente deberían evitarse a menos que se requieran específicamente):

```js
var c = new Object();
c.foo = "bar";
c; // { foo: "bar" }

var d = { foo: "bar" };
d; // { foo: "bar" }

var e = new Function( "a", "return a * 2;" );
var f = function(a) { return a * 2; };
function g(a) { return a * 2; }

var h = new RegExp( "^a*b+", "g" );
var i = /^a*b+/g;
```

Prácticamente no hay razón para usar la forma de constructor `new Object()`, especialmente ya que te obliga a agregar propiedades una por una en lugar de muchas a la vez en la forma literal de objeto.

El constructor `Function` es útil solo en los casos más raros, donde necesitas definir dinámicamente los parámetros de una función y/o su cuerpo de función. **No trates a `Function(..)` simplemente como una forma alternativa de `eval(..)`.** Casi nunca necesitarás definir dinámicamente una función de esta manera.

Las expresiones regulares definidas en la forma literal (`/^a*b+/g`) son fuertemente preferidas, no solo por facilidad de sintaxis sino por razones de rendimiento -- el motor JS las precompila y las cachea antes de la ejecución del código. A diferencia de las otras formas de constructor que hemos visto hasta ahora, `RegExp(..)` tiene alguna utilidad razonable: para definir dinámicamente el patrón de una expresión regular.

```js
var name = "Kyle";
var namePattern = new RegExp( "\\b(?:" + name + ")+\\b", "ig" );

var matches = someText.match( namePattern );
```

Este tipo de escenario legítimamente ocurre en programas JS de vez en cuando, así que necesitarías usar la forma `new RegExp("patrón","flags")`.

### `Date(..)` y `Error(..)`

Los constructores nativos `Date(..)` y `Error(..)` son mucho más útiles que los otros nativos, porque no hay forma literal para ninguno de los dos.

Para crear un valor de objeto de fecha, debes usar `new Date()`. El constructor `Date(..)` acepta argumentos opcionales para especificar la fecha/hora a usar, pero si se omiten, se asume la fecha/hora actual.

Con mucho, la razón más común por la que construyes un objeto de fecha es para obtener el valor actual de timestamp (un número entero con signo de milisegundos desde el 1 de enero de 1970). Puedes hacer esto llamando a `getTime()` en una instancia de objeto de fecha.

Pero una forma aún más fácil es simplemente llamar a la función auxiliar estática definida a partir de ES5: `Date.now()`. Y hacer polyfill de eso para pre-ES5 es bastante fácil:

```js
if (!Date.now) {
	Date.now = function(){
		return (new Date()).getTime();
	};
}
```

**Nota:** Si llamas a `Date()` sin `new`, obtendrás una representación en string de la fecha/hora en ese momento. La forma exacta de esta representación no está especificada en la especificación del lenguaje, aunque los navegadores tienden a coincidir en algo cercano a: `"Fri Jul 18 2014 00:31:02 GMT-0500 (CDT)"`.

El constructor `Error(..)` (muy parecido a `Array()` arriba) se comporta igual con la palabra clave `new` presente u omitida.

La razón principal por la que querrías crear un objeto de error es que captura el contexto actual de la pila de ejecución en el objeto (en la mayoría de los motores JS, revelado como una propiedad de solo lectura `.stack` una vez construido). Este contexto de pila incluye la pila de llamadas de función y el número de línea donde se creó el objeto de error, lo que hace que depurar ese error sea mucho más fácil.

Típicamente usarías tal objeto de error con el operador `throw`:

```js
function foo(x) {
	if (!x) {
		throw new Error( "x wasn't provided" );
	}
	// ..
}
```

Las instancias de objetos de error generalmente tienen al menos una propiedad `message`, y a veces otras propiedades (que deberías tratar como de solo lectura), como `type`. Sin embargo, aparte de inspeccionar la propiedad `stack` mencionada arriba, generalmente es mejor simplemente llamar a `toString()` en el objeto de error (ya sea explícitamente, o implícitamente a través de coerción -- ver Capítulo 4) para obtener un mensaje de error con formato amigable.

**Consejo:** Técnicamente, además del nativo general `Error(..)`, hay varios otros nativos de tipo de error específico: `EvalError(..)`, `RangeError(..)`, `ReferenceError(..)`, `SyntaxError(..)`, `TypeError(..)`, y `URIError(..)`. Pero es muy raro usar manualmente estos nativos de error específicos. Se usan automáticamente si tu programa realmente sufre de una excepción real (como referenciar una variable no declarada y obtener un error `ReferenceError`).

### `Symbol(..)`

Nuevo a partir de ES6, se ha agregado un tipo de valor primitivo adicional, llamado "Symbol". Los Symbols son valores especiales "únicos" (¡no estrictamente garantizado!) que pueden ser usados como propiedades en objetos con poco temor a cualquier colisión. Están diseñados principalmente para comportamientos incorporados especiales de las construcciones de ES6, pero también puedes definir tus propios symbols.

Los Symbols pueden ser usados como nombres de propiedades, pero no puedes ver ni acceder al valor real de un symbol desde tu programa, ni desde la consola de desarrollador. Si evalúas un symbol en la consola de desarrollador, lo que se muestra se ve como `Symbol(Symbol.create)`, por ejemplo.

Hay varios symbols predefinidos en ES6, accedidos como propiedades estáticas del objeto función `Symbol`, como `Symbol.create`, `Symbol.iterator`, etc. Para usarlos, haz algo como:

```js
obj[Symbol.iterator] = function(){ /*..*/ };
```

Para definir tus propios symbols personalizados, usa el nativo `Symbol(..)`. El "constructor" nativo `Symbol(..)` es único en que no se te permite usar `new` con él, ya que hacerlo lanzará un error.

```js
var mysym = Symbol( "my own symbol" );
mysym;				// Symbol(my own symbol)
mysym.toString();	// "Symbol(my own symbol)"
typeof mysym; 		// "symbol"

var a = { };
a[mysym] = "foobar";

Object.getOwnPropertySymbols( a );
// [ Symbol(my own symbol) ]
```

Aunque los symbols no son realmente privados (`Object.getOwnPropertySymbols(..)` refleja en el objeto y revela los symbols bastante públicamente), usarlos para propiedades privadas o especiales es probablemente su caso de uso principal. Para la mayoría de los desarrolladores, pueden tomar el lugar de nombres de propiedades con prefijos de guión bajo `_`, que son casi siempre por convención señales para decir, "oye, esta es una propiedad privada/especial/interna, ¡así que déjala en paz!"

**Nota:** Los `Symbol`s *no* son `object`s, son primitivos escalares simples.

### Prototipos Nativos

Cada uno de los constructores nativos incorporados tiene su propio objeto `.prototype` -- `Array.prototype`, `String.prototype`, etc.

Estos objetos contienen comportamiento único para su subtipo de objeto particular.

Por ejemplo, todos los objetos string, y por extensión (vía boxing) las primitivas `string`, tienen acceso al comportamiento predeterminado como métodos definidos en el objeto `String.prototype`.

**Nota:** Por convención de documentación, `String.prototype.XYZ` se acorta a `String#XYZ`, y de igual manera para todos los demás `.prototype`s.

* `String#indexOf(..)`: encontrar la posición en el string de otro substring
* `String#charAt(..)`: acceder al carácter en una posición del string
* `String#substr(..)`, `String#substring(..)`, y `String#slice(..)`: extraer una porción del string como un nuevo string
* `String#toUpperCase()` y `String#toLowerCase()`: crear un nuevo string convertido a mayúsculas o minúsculas
* `String#trim()`: crear un nuevo string despojado de cualquier espacio en blanco final o inicial

Ninguno de los métodos modifica el string *in situ*. Las modificaciones (como conversión de mayúsculas o recorte) crean un nuevo valor a partir del valor existente.

En virtud de la delegación de prototipo (ver el título *this & Object Prototypes* en esta serie), cualquier valor string puede acceder a estos métodos:

```js
var a = " abc ";

a.indexOf( "c" ); // 3
a.toUpperCase(); // " ABC "
a.trim(); // "abc"
```

Los otros prototipos de constructor contienen comportamientos apropiados para sus tipos, como `Number#toFixed(..)` (convertir a string un número con un número fijo de dígitos decimales) y `Array#concat(..)` (fusionar arrays). Todas las funciones tienen acceso a `apply(..)`, `call(..)`, y `bind(..)` porque `Function.prototype` los define.

Pero, algunos de los prototipos nativos no son *solo* objetos simples:

```js
typeof Function.prototype;			// "function"
Function.prototype();				// ¡es una función vacía!

RegExp.prototype.toString();		// "/(?:)/" -- regex vacío
"abc".match( RegExp.prototype );	// [""]
```

Una idea particularmente mala, incluso puedes modificar estos prototipos nativos (no solo agregar propiedades como probablemente ya conoces):

```js
Array.isArray( Array.prototype );	// true
Array.prototype.push( 1, 2, 3 );	// 3
Array.prototype;					// [1,2,3]

// ¡no lo dejes así, sin embargo, o espera comportamientos raros!
// restablecer el `Array.prototype` a vacío
Array.prototype.length = 0;
```

Como puedes ver, `Function.prototype` es una función, `RegExp.prototype` es una expresión regular, y `Array.prototype` es un array. Interesante y genial, ¿eh?

#### Prototipos como Predeterminados

`Function.prototype` siendo una función vacía, `RegExp.prototype` siendo un regex "vacío" (por ejemplo, que no coincide con nada), y `Array.prototype` siendo un array vacío, los hace a todos buenos valores "predeterminados" para asignar a variables si esas variables aún no tendrían un valor del tipo apropiado.

Por ejemplo:

```js
function isThisCool(vals,fn,rx) {
	vals = vals || Array.prototype;
	fn = fn || Function.prototype;
	rx = rx || RegExp.prototype;

	return rx.test(
		vals.map( fn ).join( "" )
	);
}

isThisCool();		// true

isThisCool(
	["a","b","c"],
	function(v){ return v.toUpperCase(); },
	/D/
);					// false
```

**Nota:** A partir de ES6, ya no necesitamos usar el truco de sintaxis de valor predeterminado `vals = vals || ..` (ver Capítulo 4), porque los valores predeterminados pueden establecerse para parámetros vía sintaxis nativa en la declaración de la función (ver Capítulo 5).

Un beneficio secundario menor de este enfoque es que los `.prototype`s ya están creados e incorporados, por lo tanto creados *solo una vez*. Por contraste, usar los valores `[]`, `function(){}`, y `/(?:)/` en sí para esos predeterminados (probablemente, dependiendo de las implementaciones del motor) recrearían esos valores (y probablemente los recolectarían como basura después) para *cada llamada* de `isThisCool(..)`. Eso podría ser desperdicio de memoria/CPU.

También, ten mucho cuidado de no usar `Array.prototype` como un valor predeterminado **que será modificado posteriormente**. En este ejemplo, `vals` se usa solo para lectura, pero si en cambio fueras a hacer cambios in situ a `vals`, estarías realmente modificando `Array.prototype` en sí, lo que llevaría a las trampas mencionadas antes.

**Nota:** Mientras señalamos estos prototipos nativos y alguna utilidad, ten cuidado de confiar en ellos y aún más precaución de modificarlos de cualquier manera. Ver Apéndice A "Prototipos Nativos" para más discusión.

## Repaso

JavaScript proporciona objetos envoltorio alrededor de valores primitivos, conocidos como nativos (`String`, `Number`, `Boolean`, etc.). Estos objetos envoltorio dan a los valores acceso a comportamientos apropiados para cada subtipo de objeto (`String#trim()` y `Array#concat(..)`).

Si tienes un valor primitivo escalar simple como `"abc"` y accedes a su propiedad `length` o algún método de `String.prototype`, JS automáticamente hace "box" al valor (lo envuelve en su respectivo objeto envoltorio) para que los accesos a propiedad/método puedan ser satisfechos.
