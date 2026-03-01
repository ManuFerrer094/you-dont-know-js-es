# You Don't Know JS: Tipos & Gramática
# Capítulo 1: Tipos

La mayoría de los desarrolladores dirían que un lenguaje dinámico (como JS) no tiene *tipos*. Veamos qué dice la especificación ES5.1 (http://www.ecma-international.org/ecma-262/5.1/) sobre el tema:

> Los algoritmos dentro de esta especificación manipulan valores cada uno de los cuales tiene un tipo asociado. Los posibles tipos de valores son exactamente los definidos en esta cláusula. Los tipos se sub-clasifican además en tipos del lenguaje ECMAScript y tipos de especificación.
>
> Un tipo del lenguaje ECMAScript corresponde a valores que son directamente manipulados por un programador ECMAScript usando el lenguaje ECMAScript. Los tipos del lenguaje ECMAScript son Undefined, Null, Boolean, String, Number, y Object.

Ahora, si eres fan de los lenguajes fuertemente tipados (estáticamente tipados), puedes objetar a este uso de la palabra "tipo". En esos lenguajes, "tipo" significa mucho *más* de lo que significa aquí en JS.

Algunas personas dicen que JS no debería afirmar tener "tipos", y que en su lugar deberían llamarse "etiquetas" o quizás "subtipos".

¡Bah! Vamos a usar esta definición aproximada (la misma que parece impulsar la redacción de la especificación): un *tipo* es un conjunto intrínseco e integrado de características que identifica de manera única el comportamiento de un valor particular y lo distingue de otros valores, tanto para el motor **como para el desarrollador**.

En otras palabras, si tanto el motor como el desarrollador tratan el valor `42` (el número) diferente de cómo tratan el valor `"42"` (el string), entonces esos dos valores tienen diferentes *tipos* -- `number` y `string`, respectivamente. Cuando usas `42`, estás *pretendiendo* hacer algo numérico, como matemáticas. Pero cuando usas `"42"`, estás *pretendiendo* hacer algo tipo string, como mostrar en la página, etc. **Estos dos valores tienen tipos diferentes.**

Esa de ninguna manera es una definición perfecta. Pero es lo suficientemente buena para esta discusión. Y es consistente con cómo JS se describe a sí mismo.

# Un Tipo Con Cualquier Otro Nombre...

Más allá de los desacuerdos de definición académica, ¿por qué importa si JavaScript tiene *tipos* o no?

Tener un entendimiento apropiado de cada *tipo* y su comportamiento intrínseco es absolutamente esencial para entender cómo convertir valores de manera correcta y precisa a diferentes tipos (ver Coerción, Capítulo 4). Casi todos los programas JS jamás escritos necesitarán manejar coerción de valores de alguna forma, así que es importante que lo hagas de manera responsable y con confianza.

Si tienes el valor `number` `42`, pero quieres tratarlo como un `string`, como extraer el `"2"` como un carácter en la posición `1`, obviamente primero debes convertir (coercer) el valor de `number` a `string`.

Eso parece bastante simple.

Pero hay muchas formas diferentes en que tal coerción puede suceder. Algunas de estas formas son explícitas, fáciles de razonar, y confiables. Pero si no eres cuidadoso, la coerción puede suceder de formas muy extrañas y sorprendentes.

La confusión de la coerción es quizás una de las frustraciones más profundas para los desarrolladores JavaScript. A menudo ha sido criticada como tan *peligrosa* que se considera un defecto en el diseño del lenguaje, que debe ser rechazada y evitada.

Armados con un entendimiento completo de los tipos de JavaScript, nuestro objetivo es ilustrar por qué la *mala reputación* de la coerción está en gran parte exagerada y algo inmerecida -- para voltear tu perspectiva, para ver el poder y utilidad de la coerción. Pero primero, tenemos que obtener un control mucho mejor sobre los valores y tipos.

## Tipos Integrados

JavaScript define siete tipos integrados:

* `null`
* `undefined`
* `boolean`
* `number`
* `string`
* `object`
* `symbol` -- ¡agregado en ES6!

**Nota:** Todos estos tipos excepto `object` se llaman "primitivos".

El operador `typeof` inspecciona el tipo del valor dado, y siempre retorna uno de siete valores string -- sorprendentemente, no hay una correspondencia exacta 1-a-1 con los siete tipos integrados que acabamos de listar.

```js
typeof undefined     === "undefined"; // true
typeof true          === "boolean";   // true
typeof 42            === "number";    // true
typeof "42"          === "string";    // true
typeof { life: 42 }  === "object";    // true

// added in ES6!
typeof Symbol()      === "symbol";    // true
```

Estos seis tipos listados tienen valores del tipo correspondiente y retornan un valor string del mismo nombre, como se muestra. `Symbol` es un nuevo tipo de datos a partir de ES6, y será cubierto en el Capítulo 3.

Como habrás notado, excluí `null` de la lista anterior. Es *especial* -- especial en el sentido de que es buggy cuando se combina con el operador `typeof`:

```js
typeof null === "object"; // true
```

Habría sido bonito (¡y correcto!) si retornara `"null"`, pero este bug original en JS ha persistido por casi dos décadas, y probablemente nunca será corregido porque hay demasiado contenido web existente que depende de su comportamiento con bugs, por lo que "corregir" el bug *crearía* más "bugs" y rompería mucho software web.

Si quieres probar un valor `null` usando su tipo, necesitas una condición compuesta:

```js
var a = null;

(!a && typeof a === "object"); // true
```

`null` es el único valor primitivo que es "falsy" (también conocido como falso-ish; ver Capítulo 4) pero que también retorna `"object"` de la verificación `typeof`.

Entonces, ¿cuál es el séptimo valor string que `typeof` puede retornar?

```js
typeof function a(){ /* .. */ } === "function"; // true
```

Es fácil pensar que `function` sería un tipo integrado de nivel superior en JS, especialmente dado este comportamiento del operador `typeof`. Sin embargo, si lees la especificación, verás que en realidad es un "subtipo" de object. Específicamente, una función se refiere como un "objeto invocable" -- un objeto que tiene una propiedad interna `[[Call]]` que le permite ser invocado.

El hecho de que las funciones son realmente objetos es bastante útil. Más importante aún, pueden tener propiedades. Por ejemplo:

```js
function a(b,c) {
	/* .. */
}
```

El objeto función tiene una propiedad `length` establecida al número de parámetros formales con los que fue declarada.

```js
a.length; // 2
```

Ya que declaraste la función con dos parámetros formales nombrados (`b` y `c`), la "longitud de la función" es `2`.

¿Y los arrays? Son nativos de JS, ¿así que son un tipo especial?

```js
typeof [1,2,3] === "object"; // true
```

No, solo objetos. Es más apropiado pensarlos también como un "subtipo" de object (ver Capítulo 3), en este caso con las características adicionales de ser indexados numéricamente (en oposición a ser solo con claves string como los objetos simples) y mantener una propiedad `.length` actualizada automáticamente.

## Valores como Tipos

En JavaScript, las variables no tienen tipos -- **los valores tienen tipos**. Las variables pueden contener cualquier valor, en cualquier momento.

Otra forma de pensar sobre los tipos de JS es que JS no tiene "imposición de tipos", en que el motor no insiste en que una *variable* siempre contenga valores del *mismo tipo inicial* con el que comenzó. Una variable puede, en una sentencia de asignación, contener un `string`, y en la siguiente contener un `number`, y así sucesivamente.

El *valor* `42` tiene un tipo intrínseco de `number`, y su *tipo* no puede ser cambiado. Otro valor, como `"42"` con el tipo `string`, puede ser creado *a partir* del valor `number` `42` a través de un proceso llamado **coerción** (ver Capítulo 4).

Si usas `typeof` contra una variable, no está preguntando "¿cuál es el tipo de la variable?" como podría parecer, ya que las variables JS no tienen tipos. En su lugar, está preguntando "¿cuál es el tipo del valor *en* la variable?"

```js
var a = 42;
typeof a; // "number"

a = true;
typeof a; // "boolean"
```

El operador `typeof` siempre retorna un string. Así que:

```js
typeof typeof 42; // "string"
```

El primer `typeof 42` retorna `"number"`, y `typeof "number"` es `"string"`.

### `undefined` vs "no declarado"

Las variables que no tienen valor *actualmente*, en realidad tienen el valor `undefined`. Llamar `typeof` contra tales variables retornará `"undefined"`:

```js
var a;

typeof a; // "undefined"

var b = 42;
var c;

// later
b = c;

typeof b; // "undefined"
typeof c; // "undefined"
```

Es tentador para la mayoría de los desarrolladores pensar en la palabra "undefined" y pensarla como sinónimo de "no declarado". Sin embargo, en JS, estos dos conceptos son bastante diferentes.

Una variable "undefined" es una que ha sido declarada en el scope accesible, pero *en el momento* no tiene otro valor en ella. Por contraste, una variable "no declarada" es una que no ha sido formalmente declarada en el scope accesible.

Considera:

```js
var a;

a; // undefined
b; // ReferenceError: b is not defined
```

Una confusión molesta es el mensaje de error que los navegadores asignan a esta condición. Como puedes ver, el mensaje es "b is not defined", que por supuesto es muy fácil y razonable de confundir con "b is undefined". Sin embargo, "undefined" y "is not defined" son cosas muy diferentes. ¡Sería bueno si los navegadores dijeran algo como "b is not found" o "b is not declared" para reducir la confusión!

También hay un comportamiento especial asociado con `typeof` en relación con variables no declaradas que refuerza aún más la confusión. Considera:

```js
var a;

typeof a; // "undefined"

typeof b; // "undefined"
```

El operador `typeof` retorna `"undefined"` incluso para variables "no declaradas" (o "no definidas"). Nota que no se lanzó ningún error cuando ejecutamos `typeof b`, aunque `b` es una variable no declarada. Esta es una guardia de seguridad especial en el comportamiento de `typeof`.

Similar a lo anterior, habría sido bueno si `typeof` usado con una variable no declarada retornara "undeclared" en lugar de mezclar el valor de resultado con el caso diferente de "undefined".

### `typeof` No Declarado

Sin embargo, esta guardia de seguridad es una característica útil cuando tratas con JavaScript en el navegador, donde múltiples archivos de script pueden cargar variables en el namespace global compartido.

**Nota:** Muchos desarrolladores creen que nunca debería haber variables en el namespace global, y que todo debería estar contenido en módulos y namespaces privados/separados. Esto es genial en teoría pero casi imposible en la práctica; aún así es un buen objetivo a perseguir. Afortunadamente, ES6 agregó soporte de primera clase para módulos, lo que eventualmente hará eso mucho más práctico.

Como ejemplo simple, imagina tener un "modo de depuración" en tu programa que es controlado por una variable global (flag) llamada `DEBUG`. Querrías verificar si esa variable fue declarada antes de realizar una tarea de depuración como registrar un mensaje en la consola. Una declaración global de nivel superior `var DEBUG = true` solo se incluiría en un archivo "debug.js", que solo cargas en el navegador cuando estás en desarrollo/pruebas, pero no en producción.

Sin embargo, tienes que tener cuidado en cómo verificas la variable global `DEBUG` en el resto del código de tu aplicación, para no lanzar un `ReferenceError`. La guardia de seguridad en `typeof` es nuestra amiga en este caso.

```js
// oops, this would throw an error!
if (DEBUG) {
	console.log( "Debugging is starting" );
}

// this is a safe existence check
if (typeof DEBUG !== "undefined") {
	console.log( "Debugging is starting" );
}
```

Este tipo de verificación es útil incluso si no estás tratando con variables definidas por el usuario (como `DEBUG`). Si estás haciendo una verificación de características para una API integrada, también puedes encontrar útil verificar sin lanzar un error:

```js
if (typeof atob === "undefined") {
	atob = function() { /*..*/ };
}
```

**Nota:** Si estás definiendo un "polyfill" para una característica si no existe ya, probablemente quieras evitar usar `var` para hacer la declaración de `atob`. Si declaras `var atob` dentro de la sentencia `if`, esta declaración es hoisted (ver el título *Scope & Closures* de esta serie) al tope del scope, incluso si la condición `if` no pasa (¡porque el global `atob` ya existe!). En algunos navegadores y para algunos tipos especiales de variables globales integradas (a menudo llamadas "host objects"), esta declaración duplicada puede lanzar un error. Omitir el `var` previene esta declaración hoisted.

Otra forma de hacer estas verificaciones contra variables globales pero sin la guardia de seguridad de `typeof` es observar que todas las variables globales son también propiedades del objeto global, que en el navegador es básicamente el objeto `window`. Así que, las verificaciones anteriores podrían haberse hecho (bastante seguramente) como:

```js
if (window.DEBUG) {
	// ..
}

if (!window.atob) {
	// ..
}
```

A diferencia de referenciar variables no declaradas, no se lanza `ReferenceError` si intentas acceder a una propiedad de objeto (incluso en el objeto global `window`) que no existe.

Por otro lado, referenciar manualmente la variable global con una referencia `window` es algo que algunos desarrolladores prefieren evitar, especialmente si tu código necesita ejecutarse en múltiples entornos JS (no solo navegadores, sino node.js del lado del servidor, por ejemplo), donde el objeto global puede que no siempre se llame `window`.

Técnicamente, esta guardia de seguridad en `typeof` es útil incluso si no estás usando variables globales, aunque estas circunstancias son menos comunes, y algunos desarrolladores pueden encontrar este enfoque de diseño menos deseable. Imagina una función utilitaria que quieres que otros copien-y-peguen en sus programas o módulos, en la que quieres verificar si el programa que la incluye ha definido cierta variable (para poder usarla) o no:

```js
function doSomethingCool() {
	var helper =
		(typeof FeatureXYZ !== "undefined") ?
		FeatureXYZ :
		function() { /*.. default feature ..*/ };

	var val = helper();
	// ..
}
```

`doSomethingCool()` prueba una variable llamada `FeatureXYZ`, y si la encuentra, la usa, pero si no, usa la suya propia. Ahora, si alguien incluye esta utilidad en su módulo/programa, verifica de forma segura si han definido `FeatureXYZ` o no:

```js
// an IIFE (see "Immediately Invoked Function Expressions"
// discussion in the *Scope & Closures* title of this series)
(function(){
	function FeatureXYZ() { /*.. my XYZ feature ..*/ }

	// include `doSomethingCool(..)`
	function doSomethingCool() {
		var helper =
			(typeof FeatureXYZ !== "undefined") ?
			FeatureXYZ :
			function() { /*.. default feature ..*/ };

		var val = helper();
		// ..
	}

	doSomethingCool();
})();
```

Aquí, `FeatureXYZ` no es para nada una variable global, pero aún estamos usando la guardia de seguridad de `typeof` para hacerlo seguro de verificar. Y de forma importante, aquí *no hay* ningún objeto que podamos usar (como hicimos para variables globales con `window.___`) para hacer la verificación, así que `typeof` es bastante útil.

Otros desarrolladores preferirían un patrón de diseño llamado "inyección de dependencias", donde en lugar de que `doSomethingCool()` inspeccione implícitamente si `FeatureXYZ` está definido afuera/alrededor de ella, necesitaría que la dependencia se pase explícitamente, así:

```js
function doSomethingCool(FeatureXYZ) {
	var helper = FeatureXYZ ||
		function() { /*.. default feature ..*/ };

	var val = helper();
	// ..
}
```

Hay muchas opciones al diseñar tal funcionalidad. Ningún patrón aquí es "correcto" o "incorrecto" -- hay varios compromisos en cada enfoque. Pero en general, es bueno que la guardia de seguridad de `typeof` para no declarados nos dé más opciones.

## Revisión

JavaScript tiene siete *tipos* integrados: `null`, `undefined`, `boolean`, `number`, `string`, `object`, `symbol`. Pueden ser identificados por el operador `typeof`.

Las variables no tienen tipos, pero los valores en ellas sí. Estos tipos definen el comportamiento intrínseco de los valores.

Muchos desarrolladores asumirán que "undefined" y "no declarado" son más o menos lo mismo, pero en JavaScript, son bastante diferentes. `undefined` es un valor que una variable declarada puede contener. "No declarado" significa que una variable nunca ha sido declarada.

JavaScript desafortunadamente como que mezcla estos dos términos, no solo en sus mensajes de error ("ReferenceError: a is not defined") sino también en los valores de retorno de `typeof`, que es `"undefined"` para ambos casos.

Sin embargo, la guardia de seguridad (previniendo un error) en `typeof` cuando se usa contra una variable no declarada puede ser útil en ciertos casos.
