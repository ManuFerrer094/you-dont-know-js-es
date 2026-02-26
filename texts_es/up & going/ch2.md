# No Sabes JS: Arriba y Andando
# Capítulo 2: Introducción a JavaScript

En el capítulo anterior, presenté los bloques de construcción básicos de la programación, como variables, bucles, condicionales y funciones. Por supuesto, todo el código mostrado ha sido en JavaScript. Pero en este capítulo, queremos centrarnos específicamente en las cosas que necesitas saber sobre JavaScript para ponerte arriba y andando como desarrollador JS.

Introduciremos bastantes conceptos en este capítulo que no se explorarán completamente hasta los libros posteriores de *YDKJS*. Puedes pensar en este capítulo como un resumen de los temas tratados en detalle a lo largo del resto de esta serie.

Especialmente si eres nuevo en JavaScript, deberías esperar dedicar bastante tiempo a revisar los conceptos y ejemplos de código aquí varias veces. Cualquier buena base se asienta ladrillo a ladrillo, así que no esperes entenderlo todo a la primera.

Tu viaje para aprender JavaScript profundamente empieza aquí.

**Nota:** Como dije en el Capítulo 1, definitivamente deberías probar todo este código tú mismo mientras lees y trabajas en este capítulo. Ten en cuenta que parte del código aquí asume capacidades introducidas en la versión más reciente de JavaScript en el momento de escribir esto (comúnmente llamada "ES6" por la 6ª edición de ECMAScript —el nombre oficial de la especificación JS). Si estás usando un navegador más antiguo, previo a ES6, el código puede no funcionar. Debes usar una actualización reciente de un navegador moderno (como Chrome, Firefox, o IE).

## Valores y Tipos

Como afirmamos en el Capítulo 1, JavaScript tiene valores tipados, no variables tipadas. Los siguientes tipos integrados están disponibles:

* `string`
* `number`
* `boolean`
* `null` y `undefined`
* `object`
* `symbol` (nuevo en ES6)

JavaScript proporciona un operador `typeof` que puede examinar un valor e indicarte qué tipo es:

```js
var a;
typeof a;				// "undefined"

a = "hello world";
typeof a;				// "string"

a = 42;
typeof a;				// "number"

a = true;
typeof a;				// "boolean"

a = null;
typeof a;				// "object" -- weird, bug

a = undefined;
typeof a;				// "undefined"

a = { b: "c" };
typeof a;				// "object"
```

El valor devuelto por el operador `typeof` siempre es uno de seis (¡siete a partir de ES6! — el tipo "symbol") valores de cadena. Es decir, `typeof "abc"` devuelve `"string"`, no `string`.

Observa cómo en este fragmento la variable `a` contiene cada tipo diferente de valor, y que a pesar de las apariencias, `typeof a` no pregunta por el "tipo de `a`", sino por el "tipo del valor actualmente en `a`." Solo los valores tienen tipos en JavaScript; las variables son simplemente contenedores simples para esos valores.

`typeof null` es un caso interesante, porque erróneamente devuelve `"object"`, cuando esperarías que devolviera `"null"`.

**Advertencia:** Este es un bug de larga data en JS, pero uno que es probable que nunca se corrija. ¡Demasiado código en la Web depende del bug y por lo tanto corregirlo causaría muchos más bugs!

También, nota `a = undefined`. Estamos estableciendo explícitamente `a` al valor `undefined`, pero eso no es conductualmente diferente de una variable que aún no tiene ningún valor establecido, como con la línea `var a;` en la parte superior del fragmento. Una variable puede llegar a este estado de valor "undefined" de varias maneras diferentes, incluyendo funciones que no devuelven valores y el uso del operador `void`.

### Objetos

El tipo `object` se refiere a un valor compuesto donde puedes establecer propiedades (ubicaciones con nombre) que cada una contiene sus propios valores de cualquier tipo. Este es quizás uno de los tipos de valor más útiles en todo JavaScript.

```js
var obj = {
	a: "hello world",
	b: 42,
	c: true
};

obj.a;		// "hello world"
obj.b;		// 42
obj.c;		// true

obj["a"];	// "hello world"
obj["b"];	// 42
obj["c"];	// true
```

Puede ser útil visualizar este valor `obj` visualmente:

<img src="fig4.png">

Las propiedades pueden accederse tanto con *notación de punto* (es decir, `obj.a`) como con *notación de corchetes* (es decir, `obj["a"]`). La notación de punto es más corta y generalmente más fácil de leer, y por lo tanto es preferida cuando es posible.

La notación de corchetes es útil si tienes un nombre de propiedad que tiene caracteres especiales, como `obj["hello world!"]` —tales propiedades a menudo se denominan *claves* cuando se accede a través de la notación de corchetes. La notación `[ ]` requiere una variable (explicada a continuación) o un *literal* `string` (que debe estar entre `" .. "` o `' .. '`).

Por supuesto, la notación de corchetes también es útil si quieres acceder a una propiedad/clave pero el nombre está almacenado en otra variable, como:

```js
var obj = {
	a: "hello world",
	b: 42
};

var b = "a";

obj[b];			// "hello world"
obj["b"];		// 42
```

**Nota:** Para más información sobre los `object`s de JavaScript, consulta el título *this & Object Prototypes* de esta serie, específicamente el Capítulo 3.

Hay un par de otros tipos de valor con los que interactuarás comúnmente en los programas JavaScript: *array* y *function*. Pero en lugar de ser tipos integrados apropiados, deberían considerarse más como subtipos —versiones especializadas del tipo `object`.

#### Arrays

Un array es un `object` que contiene valores (de cualquier tipo) no particularmente en propiedades/claves con nombre, sino en posiciones indexadas numéricamente. Por ejemplo:

```js
var arr = [
	"hello world",
	42,
	true
];

arr[0];			// "hello world"
arr[1];			// 42
arr[2];			// true
arr.length;		// 3

typeof arr;		// "object"
```

**Nota:** Los lenguajes que empiezan a contar desde cero, como JS, usan `0` como índice del primer elemento en el array.

Puede ser útil visualizar `arr` visualmente:

<img src="fig5.png">

Dado que los arrays son objetos especiales (como implica `typeof`), también pueden tener propiedades, incluyendo la propiedad `length` que se actualiza automáticamente.

Teóricamente podrías usar un array como un objeto normal con tus propias propiedades con nombre, o podrías usar un `object` pero solo darle propiedades numéricas (`0`, `1`, etc.) similares a un array. Sin embargo, esto generalmente se consideraría un uso inapropiado de los tipos respectivos.

El mejor enfoque más natural es usar arrays para valores posicionados numéricamente y usar `object`s para propiedades con nombre.

#### Funciones

El otro subtipo de `object` que usarás en todos tus programas JS es una función:

```js
function foo() {
	return 42;
}

foo.bar = "hello world";

typeof foo;			// "function"
typeof foo();		// "number"
typeof foo.bar;		// "string"
```

De nuevo, las funciones son un subtipo de `objects` —`typeof` devuelve `"function"`, lo que implica que una `function` es un tipo principal— y por lo tanto pueden tener propiedades, pero típicamente solo usarás propiedades de objetos de función (como `foo.bar`) en casos limitados.

**Nota:** Para más información sobre los valores JS y sus tipos, consulta los dos primeros capítulos del título *Types & Grammar* de esta serie.

### Métodos de Tipo Integrado

Los tipos integrados y subtipos que acabamos de discutir tienen comportamientos expuestos como propiedades y métodos que son bastante poderosos y útiles.

Por ejemplo:

```js
var a = "hello world";
var b = 3.14159;

a.length;				// 11
a.toUpperCase();		// "HELLO WORLD"
b.toFixed(4);			// "3.1416"
```

El "cómo" detrás de poder llamar `a.toUpperCase()` es más complicado que simplemente que ese método existe en el valor.

Brevemente, hay una forma de objeto `String` (con `S` mayúscula), típicamente llamado "nativo", que está emparejado con el tipo primitivo `string`; es este envoltorio de objeto el que define el método `toUpperCase()` en su prototipo.

Cuando usas un valor primitivo como `"hello world"` como un `object` haciendo referencia a una propiedad o método (por ejemplo, `a.toUpperCase()` en el fragmento anterior), JS automáticamente "encuadra" el valor a su contraparte de envoltorio de objeto (oculto entre bastidores).

Un valor `string` puede ser envuelto por un objeto `String`, un `number` puede ser envuelto por un objeto `Number`, y un `boolean` puede ser envuelto por un objeto `Boolean`. Para la mayoría de los propósitos, no necesitas preocuparte ni usar directamente estas formas de envoltorio de objeto de los valores —prefiere las formas de valor primitivo en prácticamente todos los casos y JavaScript se encargará del resto.

**Nota:** Para más información sobre los nativos de JS y el "encuadre," consulta el Capítulo 3 del título *Types & Grammar* de esta serie. Para entender mejor el prototipo de un objeto, consulta el Capítulo 5 del título *this & Object Prototypes* de esta serie.

### Comparación de Valores

Hay dos tipos principales de comparación de valores que necesitarás hacer en tus programas JS: *igualdad* y *desigualdad*. El resultado de cualquier comparación es un valor estrictamente `boolean` (`true` o `false`), independientemente de qué tipos de valor se comparen.

#### Coerción

Hablamos brevemente sobre la coerción en el Capítulo 1, pero revisitémosla aquí.

La coerción viene en dos formas en JavaScript: *explícita* e *implícita*. La coerción explícita es simplemente que puedes ver claramente en el código que ocurrirá una conversión de un tipo a otro, mientras que la coerción implícita es cuando la conversión de tipo puede ocurrir como un efecto secundario no obvio de alguna otra operación.

Probablemente hayas escuchado opiniones como "la coerción es mala" derivadas del hecho de que claramente hay lugares donde la coerción puede producir resultados sorprendentes. Quizás nada evoca más frustración de los desarrolladores que cuando el lenguaje los sorprende.

La coerción no es mala, ni tiene que ser sorprendente. De hecho, la mayoría de los casos que puedes construir con coerción de tipos son bastante razonables y comprensibles, e incluso pueden usarse para *mejorar* la legibilidad de tu código. Pero no profundizaremos más en ese debate —el Capítulo 4 del título *Types & Grammar* de esta serie cubre todos los lados.

Aquí hay un ejemplo de coerción *explícita*:

```js
var a = "42";

var b = Number( a );

a;				// "42"
b;				// 42 -- the number!
```

Y aquí hay un ejemplo de coerción *implícita*:

```js
var a = "42";

var b = a * 1;	// "42" implicitly coerced to 42 here

a;				// "42"
b;				// 42 -- the number!
```

#### Truthy y Falsy

En el Capítulo 1, mencionamos brevemente la naturaleza "truthy" y "falsy" de los valores: cuando un valor no `boolean` es coercionado a un `boolean`, ¿se convierte en `true` o en `false`, respectivamente?

La lista específica de valores "falsy" en JavaScript es la siguiente:

* `""` (cadena vacía)
* `0`, `-0`, `NaN` (`number` inválido)
* `null`, `undefined`
* `false`

Cualquier valor que no esté en esta lista de "falsy" es "truthy." Aquí hay algunos ejemplos:

* `"hello"`
* `42`
* `true`
* `[ ]`, `[ 1, "2", 3 ]` (arrays)
* `{ }`, `{ a: 42 }` (objetos)
* `function foo() { .. }` (funciones)

Es importante recordar que un valor no `boolean` solo sigue esta coerción "truthy"/"falsy" si en realidad se coerciona a un `boolean`. No es tan difícil confundirse con una situación que parece estar coercionando un valor a un `boolean` cuando no lo está.

#### Igualdad

Hay cuatro operadores de igualdad: `==`, `===`, `!=` y `!==`. Las formas con `!` son por supuesto las versiones simétricas de "no igual" de sus contrapartes; la *no-igualdad* no debe confundirse con la *desigualdad*.

La diferencia entre `==` y `===` se suele caracterizar en que `==` comprueba la igualdad de valores y `===` comprueba tanto la igualdad de valor como de tipo. Sin embargo, esto es inexacto. La manera correcta de caracterizarlos es que `==` comprueba la igualdad de valores con coerción permitida, y `===` comprueba la igualdad de valores sin permitir la coerción; `===` a menudo se llama "igualdad estricta" por esta razón.

Considera la coerción implícita que permite la comparación de igualdad flexible `==` y que no permite la igualdad estricta `===`:

```js
var a = "42";
var b = 42;

a == b;			// true
a === b;		// false
```

En la comparación `a == b`, JS nota que los tipos no coinciden, por lo que pasa por una serie ordenada de pasos para coercionar uno o ambos valores a un tipo diferente hasta que los tipos coincidan, donde entonces se puede comprobar una igualdad de valor simple.

Si piensas en ello, hay dos posibles formas en que `a == b` podría dar `true` mediante coerción. La comparación podría terminar siendo `42 == 42` o podría ser `"42" == "42"`. ¿Cuál es?

La respuesta: `"42"` se convierte en `42`, para hacer la comparación `42 == 42`. En un ejemplo tan simple, realmente no parece importar de qué manera va ese proceso, ya que el resultado final es el mismo. Hay casos más complejos donde importa no solo cuál es el resultado final de la comparación, sino *cómo* llegas allí.

El `a === b` produce `false`, porque la coerción no se permite, por lo que la comparación de valor simple evidentemente falla. Muchos desarrolladores sienten que `===` es más predecible, por lo que abogan por usar siempre esa forma y alejarse de `==`. Creo que esta visión es muy corta de miras. Creo que `==` es una herramienta poderosa que ayuda a tu programa, *si te tomas el tiempo de aprender cómo funciona.*

No vamos a cubrir todos los detalles minutiosos de cómo funciona la coerción en las comparaciones `==` aquí. Gran parte de ello es bastante razonable, pero hay algunos casos límite importantes de los que hay que tener cuidado. Puedes leer la sección 11.9.3 de la especificación ES5 (http://www.ecma-international.org/ecma-262/5.1/) para ver las reglas exactas, y te sorprenderá lo sencillo que es este mecanismo, comparado con todo el revuelo negativo que lo rodea.

Para resumir una gran cantidad de detalles en unas pocas conclusiones simples, y ayudarte a saber si usar `==` o `===` en diversas situaciones, aquí están mis reglas simples:

* Si cualquiera de los valores (también llamados lados) de una comparación podría ser el valor `true` o `false`, evita `==` y usa `===`.
* Si cualquiera de los valores en una comparación podría ser uno de estos valores específicos (`0`, `""` o `[]` —array vacío), evita `==` y usa `===`.
* En *todos* los demás casos, es seguro usar `==`. No solo es seguro, sino que en muchos casos simplifica tu código de una manera que mejora la legibilidad.

Lo que estas reglas se reducen es a requerirte pensar críticamente sobre tu código y sobre qué tipos de valores pueden pasar por las variables que se comparan para la igualdad. Si puedes estar seguro sobre los valores y `==` es seguro, ¡úsalo! Si no puedes estar seguro sobre los valores, usa `===`. ¡Es así de simple!

La forma de no-igualdad `!=` se empareja con `==`, y la forma `!==` se empareja con `===`. Todas las reglas y observaciones que acabamos de discutir se aplican simétricamente para estas comparaciones de no-igualdad.

Debes tomar nota especial de las reglas de comparación de `==` y `===` si estás comparando dos valores no primitivos, como `object`s (incluyendo `function` y `array`). Dado que esos valores en realidad se mantienen por referencia, tanto las comparaciones `==` como `===` simplemente verificarán si las referencias coinciden, no nada sobre los valores subyacentes.

Por ejemplo, los `array`s se coercionan por defecto a `string`s simplemente uniendo todos los valores con comas (`,`) entre ellos. Podrías pensar que dos `array`s con el mismo contenido serían `==` iguales, pero no lo son:

```js
var a = [1,2,3];
var b = [1,2,3];
var c = "1,2,3";

a == c;		// true
b == c;		// true
a == b;		// false
```

**Nota:** Para más información sobre las reglas de comparación de igualdad `==`, consulta la especificación ES5 (sección 11.9.3) y también el Capítulo 4 del título *Types & Grammar* de esta serie; consulta el Capítulo 2 para más información sobre valores versus referencias.

#### Desigualdad

Los operadores `<`, `>`, `<=` y `>=` se usan para la desigualdad, denominados en la especificación como "comparación relacional." Típicamente se usarán con valores ordinalmente comparables como `number`s. Es fácil entender que `3 < 4`.

Pero los valores `string` de JavaScript también se pueden comparar para la desigualdad, usando las reglas alfabéticas típicas (`"bar" < "foo"`).

¿Qué pasa con la coerción? Se aplican reglas similares a la comparación `==` (¡aunque no exactamente idénticas!) a los operadores de desigualdad. Destacablemente, no hay operadores de "desigualdad estricta" que impidan la coerción de la misma manera que `===` hace con la "igualdad estricta."

Considera:

```js
var a = 41;
var b = "42";
var c = "43";

a < b;		// true
b < c;		// true
```

¿Qué pasa aquí? En la sección 11.8.5 de la especificación ES5, dice que si ambos valores en la comparación `<` son `string`s, como en el caso de `b < c`, la comparación se hace lexicográficamente (también alfabéticamente como un diccionario). Pero si uno o ambos no son una `string`, como en el caso de `a < b`, ambos valores se coercionan para ser `number`s, y se produce una comparación numérica típica.

El mayor inconveniente que puedes encontrarte aquí con comparaciones entre tipos de valores potencialmente diferentes —recuerda, no hay formas de "desigualdad estricta" para usar— es cuando uno de los valores no puede convertirse en un número válido, como:

```js
var a = 42;
var b = "foo";

a < b;		// false
a > b;		// false
a == b;		// false
```

Espera, ¿cómo pueden ser `false` las tres comparaciones? Porque el valor `b` está siendo coercionado al "valor numérico inválido" `NaN` en las comparaciones `<` y `>`, y la especificación dice que `NaN` no es ni mayor ni menor que ningún otro valor.

La comparación `==` falla por un motivo diferente. `a == b` podría fallar si se interpreta tanto como `42 == NaN` o `"42" == "foo"` —como explicamos anteriormente, el primero es el caso.

**Nota:** Para más información sobre las reglas de comparación de desigualdad, consulta la sección 11.8.5 de la especificación ES5 y también el Capítulo 4 del título *Types & Grammar* de esta serie.

## Variables

En JavaScript, los nombres de variables (incluyendo nombres de funciones) deben ser *identificadores* válidos. Las reglas estrictas y completas para los caracteres válidos en los identificadores son un poco complejas cuando se consideran caracteres no tradicionales como Unicode. Si solo consideras caracteres alfanuméricos ASCII típicos, sin embargo, las reglas son simples.

Un identificador debe comenzar con `a`-`z`, `A`-`Z`, `$` o `_`. Luego puede contener cualquiera de esos caracteres más los numerales `0`-`9`.

Generalmente, las mismas reglas se aplican a un nombre de propiedad que a un identificador de variable. Sin embargo, ciertas palabras no pueden usarse como variables, pero sí están bien como nombres de propiedad. Estas palabras se llaman "palabras reservadas," e incluyen las palabras clave JS (`for`, `in`, `if`, etc.) así como `null`, `true` y `false`.

**Nota:** Para más información sobre las palabras reservadas, consulta el Apéndice A del título *Types & Grammar* de esta serie.

### Scopes de Función

Usas la palabra clave `var` para declarar una variable que pertenecerá al scope de la función actual, o al scope global si está en el nivel superior fuera de cualquier función.

#### Hoisting

Dondequiera que aparezca un `var` dentro de un scope, se considera que esa declaración pertenece a todo el scope y es accesible en todas partes a lo largo de él.

Metafóricamente, este comportamiento se llama *hoisting*, cuando una declaración `var` es conceptualmente "movida" a la parte superior de su scope contenedor. Técnicamente, este proceso se explica con más precisión por cómo se compila el código, pero podemos omitir esos detalles por ahora.

Considera:

```js
var a = 2;

foo();					// works because `foo()`
						// declaration is "hoisted"

function foo() {
	a = 3;

	console.log( a );	// 3

	var a;				// declaration is "hoisted"
						// to the top of `foo()`
}

console.log( a );	// 2
```

**Advertencia:** No es común ni una buena idea depender del *hoisting* de variables para usar una variable antes en su scope de lo que aparece su declaración `var`; puede ser bastante confuso. Es mucho más común y aceptado usar declaraciones de funciones con *hoisting*, como hacemos con la llamada `foo()` apareciendo antes de su declaración formal.

#### Scopes Anidados

Cuando declaras una variable, está disponible en cualquier lugar dentro de ese scope, así como en cualquier scope inferior/interno. Por ejemplo:

```js
function foo() {
	var a = 1;

	function bar() {
		var b = 2;

		function baz() {
			var c = 3;

			console.log( a, b, c );	// 1 2 3
		}

		baz();
		console.log( a, b );		// 1 2
	}

	bar();
	console.log( a );				// 1
}

foo();
```

Nota que `c` no está disponible dentro de `bar()`, porque solo es declarada dentro del scope interno de `baz()`, y que `b` no está disponible para `foo()` por la misma razón.

Si intentas acceder al valor de una variable en un scope donde no está disponible, obtendrás un `ReferenceError` lanzado. Si intentas establecer una variable que no ha sido declarada, terminarás creando una variable en el scope global de nivel superior (¡malo!) u obtendrás un error, dependiendo del "modo estricto" (ver "Modo Estricto"). Veamos:

```js
function foo() {
	a = 1;	// `a` not formally declared
}

foo();
a;			// 1 -- oops, auto global variable :(
```

Esta es una práctica muy mala. ¡No la hagas! Siempre declara formalmente tus variables.

Además de crear declaraciones para variables en el nivel de función, ES6 te *permite* declarar variables para que pertenezcan a bloques individuales (pares de `{ .. }`), usando la palabra clave `let`. Además de algunos detalles sutiles, las reglas de scope se comportarán aproximadamente igual que lo que acabamos de ver con las funciones:

```js
function foo() {
	var a = 1;

	if (a >= 1) {
		let b = 2;

		while (b < 5) {
			let c = b * 2;
			b++;

			console.log( a + c );
		}
	}
}

foo();
// 5 7 9
```

Debido al uso de `let` en lugar de `var`, `b` pertenecerá solo a la sentencia `if` y por lo tanto no al scope de toda la función `foo()`. De manera similar, `c` pertenece solo al bucle `while`. El scope de bloque es muy útil para gestionar los scopes de variables de una manera más detallada, lo cual puede hacer que tu código sea mucho más fácil de mantener con el tiempo.

**Nota:** Para más información sobre el scope, consulta el título *Scope & Closures* de esta serie. Consulta el título *ES6 & Beyond* de esta serie para más información sobre el scope de bloque con `let`.

## Condicionales

Además de la sentencia `if` que presentamos brevemente en el Capítulo 1, JavaScript proporciona algunos otros mecanismos condicionales que deberíamos examinar.

A veces puedes encontrarte escribiendo una serie de sentencias `if..else..if` como esta:

```js
if (a == 2) {
	// do something
}
else if (a == 10) {
	// do another thing
}
else if (a == 42) {
	// do yet another thing
}
else {
	// fallback to here
}
```

Esta estructura funciona, pero es un poco verbosa porque necesitas especificar la prueba de `a` para cada caso. Aquí hay otra opción, la sentencia `switch`:

```js
switch (a) {
	case 2:
		// do something
		break;
	case 10:
		// do another thing
		break;
	case 42:
		// do yet another thing
		break;
	default:
		// fallback to here
}
```

El `break` es importante si quieres que solo las sentencias de un `case` se ejecuten. Si omites `break` de un `case`, y ese `case` coincide o se ejecuta, la ejecución continuará con las sentencias del siguiente `case` independientemente de si ese `case` coincide. Este llamado "fall through" a veces es útil/deseado:

```js
switch (a) {
	case 2:
	case 10:
		// some cool stuff
		break;
	case 42:
		// other stuff
		break;
	default:
		// fallback
}
```

Aquí, si `a` es `2` o `10`, ejecutará las sentencias de código "some cool stuff".

Otra forma de condicional en JavaScript es el "operador condicional," a menudo llamado el "operador ternario." Es como una forma más concisa de una sola sentencia `if..else`, como:

```js
var a = 42;

var b = (a > 41) ? "hello" : "world";

// similar to:

// if (a > 41) {
//    b = "hello";
// }
// else {
//    b = "world";
// }
```

Si la expresión de prueba (`a > 41` aquí) se evalúa como `true`, la primera cláusula (`"hello"`) resulta, de lo contrario la segunda cláusula (`"world"`) resulta, y cualquiera que sea el resultado se asigna luego a `b`.

El operador condicional no tiene que usarse en una asignación, pero ese es definitivamente el uso más común.

**Nota:** Para más información sobre condiciones de prueba y otros patrones para `switch` y `? :`, consulta el título *Types & Grammar* de esta serie.

## Modo Estricto

ES5 añadió un "modo estricto" al lenguaje, que endurece las reglas para ciertos comportamientos. Generalmente, estas restricciones se ven como mantener el código en un conjunto más seguro y apropiado de directrices. Además, adherirse al modo estricto hace que tu código generalmente sea más optimizable por el motor. El modo estricto es una gran ventaja para el código, y deberías usarlo para todos tus programas.

Puedes optar por el modo estricto para una función individual, o un archivo completo, dependiendo de dónde pongas el pragma de modo estricto:

```js
function foo() {
	"use strict";

	// this code is strict mode

	function bar() {
		// this code is strict mode
	}
}

// this code is not strict mode
```

Compara eso con:

```js
"use strict";

function foo() {
	// this code is strict mode

	function bar() {
		// this code is strict mode
	}
}

// this code is strict mode
```

Una diferencia clave (¡mejora!) con el modo estricto es que no permite la declaración de variable global automática implícita al omitir el `var`:

```js
function foo() {
	"use strict";	// turn on strict mode
	a = 1;			// `var` missing, ReferenceError
}

foo();
```

Si activas el modo estricto en tu código y obtienes errores, o el código comienza a comportarse con bugs, puede que tengas la tentación de evitar el modo estricto. Pero ceder a ese instinto sería una mala idea. Si el modo estricto causa problemas en tu programa, casi con certeza es una señal de que tienes cosas en tu programa que deberías arreglar.

El modo estricto no solo mantendrá tu código en un camino más seguro, y no solo hará que tu código sea más optimizable, sino que también representa la dirección futura del lenguaje. Sería más fácil para ti acostumbrarte al modo estricto ahora que seguir aplazándolo —¡solo será más difícil de convertir más tarde!

**Nota:** Para más información sobre el modo estricto, consulta el Capítulo 5 del título *Types & Grammar* de esta serie.

## Funciones Como Valores

Hasta ahora, hemos discutido las funciones como el mecanismo principal del *scope* en JavaScript. Recuerdas la sintaxis típica de declaración de `function` así:

```js
function foo() {
	// ..
}
```

Aunque puede no parecer obvio desde esa sintaxis, `foo` es básicamente solo una variable en el scope externo que contiene una referencia a la `function` que se está declarando. Es decir, la propia `function` es un valor, igual que `42` o `[1,2,3]` lo serían.

Esto puede sonar como un concepto extraño al principio, así que tómate un momento para reflexionar sobre ello. No solo puedes pasar un valor (argumento) *a* una función, sino que *una función en sí misma puede ser un valor* que se asigna a variables, o se pasa o devuelve desde otras funciones.

Como tal, un valor de función debe pensarse como una expresión, al igual que cualquier otro valor o expresión.

Considera:

```js
var foo = function() {
	// ..
};

var x = function bar(){
	// ..
};
```

La primera expresión de función asignada a la variable `foo` se llama *anónima* porque no tiene `nombre`.

La segunda expresión de función tiene *nombre* (`bar`), incluso como una referencia a ella también se asigna a la variable `x`. Las *expresiones de función con nombre* son generalmente más preferibles, aunque las *expresiones de función anónimas* siguen siendo extremadamente comunes.

Para más información, consulta el título *Scope & Closures* de esta serie.

### Expresiones de Función Inmediatamente Invocadas (IIFEs)

En el fragmento anterior, ninguna de las expresiones de función se ejecuta —podríamos hacerlo si hubiéramos incluido `foo()` o `x()`, por ejemplo.

Hay otra forma de ejecutar una expresión de función, que típicamente se denomina *expresión de función inmediatamente invocada* (IIFE):

```js
(function IIFE(){
	console.log( "Hello!" );
})();
// "Hello!"
```

El `( .. )` externo que rodea la expresión de función `(function IIFE(){ .. })` es solo un matiz de la gramática de JS necesario para evitar que se trate como una declaración de función normal.

El `()` final al final de la expresión —la línea `})();`— es lo que en realidad ejecuta la expresión de función referenciada inmediatamente antes.

Eso puede parecer extraño, pero no es tan ajeno a primera vista. Considera las similitudes entre `foo` e `IIFE` aquí:

```js
function foo() { .. }

// `foo` function reference expression,
// then `()` executes it
foo();

// `IIFE` function expression,
// then `()` executes it
(function IIFE(){ .. })();
```

Como puedes ver, listar la `(function IIFE(){ .. })` antes de su `()` de ejecución es esencialmente lo mismo que incluir `foo` antes de su `()`; en ambos casos, la referencia de función se ejecuta con `()` inmediatamente después.

Porque una IIFE es solo una función, y las funciones crean *scope* de variable, usar una IIFE de esta manera se usa a menudo para declarar variables que no afectarán al código circundante fuera de la IIFE:

```js
var a = 42;

(function IIFE(){
	var a = 10;
	console.log( a );	// 10
})();

console.log( a );		// 42
```

Las IIFEs también pueden tener valores de retorno:

```js
var x = (function IIFE(){
	return 42;
})();

x;	// 42
```

El valor `42` se devuelve con `return` desde la función nombrada `IIFE` que se está ejecutando, y luego se asigna a `x`.

### Closure

El *closure* es uno de los conceptos más importantes, y a menudo menos entendidos, en JavaScript. No lo cubriré en detalle profundo aquí, y en su lugar te remito al título *Scope & Closures* de esta serie. Pero quiero decir algunas cosas al respecto para que entiendas el concepto general. Será una de las técnicas más importantes en tu habilidad en JS.

Puedes pensar en el closure como una forma de "recordar" y seguir accediendo al scope de una función (sus variables) incluso una vez que la función ha terminado de ejecutarse.

Considera:

```js
function makeAdder(x) {
	// parameter `x` is an inner variable

	// inner function `add()` uses `x`, so
	// it has a "closure" over it
	function add(y) {
		return y + x;
	};

	return add;
}
```

La referencia a la función interna `add(..)` que se devuelve con cada llamada a la externa `makeAdder(..)` puede recordar cualquier valor `x` que se pasó a `makeAdder(..)`. Ahora, usemos `makeAdder(..)`:

```js
// `plusOne` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusOne = makeAdder( 1 );

// `plusTen` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusTen = makeAdder( 10 );

plusOne( 3 );		// 4  <-- 1 + 3
plusOne( 41 );		// 42 <-- 1 + 41

plusTen( 13 );		// 23 <-- 10 + 13
```

Más sobre cómo funciona este código:

1. Cuando llamamos `makeAdder(1)`, obtenemos de vuelta una referencia a su `add(..)` interno que recuerda `x` como `1`. A esta referencia de función la llamamos `plusOne(..)`.
2. Cuando llamamos `makeAdder(10)`, obtenemos de vuelta otra referencia a su `add(..)` interno que recuerda `x` como `10`. A esta referencia de función la llamamos `plusTen(..)`.
3. Cuando llamamos `plusOne(3)`, suma `3` (su `y` interno) al `1` (recordado por `x`), y obtenemos `4` como resultado.
4. Cuando llamamos `plusTen(13)`, suma `13` (su `y` interno) al `10` (recordado por `x`), y obtenemos `23` como resultado.

No te preocupes si esto parece extraño y confuso al principio —¡puede serlo! Se necesitará mucha práctica para entenderlo completamente.

Pero confía en mí, una vez que lo hagas, es una de las técnicas más poderosas y útiles en toda la programación. Definitivamente vale la pena el esfuerzo de dejar que tu cerebro medite sobre los closures por un momento. En la siguiente sección, practicaremos un poco más con el closure.

#### Módulos

El uso más común del closure en JavaScript es el patrón módulo. Los módulos te permiten definir detalles de implementación privados (variables, funciones) que están ocultos del mundo exterior, así como una API pública que *es* accesible desde el exterior.

Considera:

```js
function User(){
	var username, password;

	function doLogin(user,pw) {
		username = user;
		password = pw;

		// do the rest of the login work
	}

	var publicAPI = {
		login: doLogin
	};

	return publicAPI;
}

// create a `User` module instance
var fred = User();

fred.login( "fred", "12Battery34!" );
```

La función `User()` sirve como un scope externo que contiene las variables `username` y `password`, así como la función interna `doLogin()`; estos son todos detalles internos privados del módulo `User` que no pueden ser accedidos desde el mundo exterior.

**Advertencia:** No estamos llamando a `new User()` aquí, a propósito, a pesar del hecho de que esto probablemente parece más común para la mayoría de los lectores. `User()` es solo una función, no una clase a ser instanciada, por lo que se llama normalmente. Usar `new` sería inapropiado y en realidad desperdiciaría recursos.

Ejecutar `User()` crea una *instancia* del módulo `User` —se crea un scope completamente nuevo, y por lo tanto una copia completamente nueva de cada una de estas variables/funciones internas. Asignamos esta instancia a `fred`. Si ejecutamos `User()` de nuevo, obtendríamos una nueva instancia completamente separada de `fred`.

La función interna `doLogin()` tiene un closure sobre `username` y `password`, lo que significa que retendrá su acceso a ellas incluso después de que la función `User()` haya terminado de ejecutarse.

`publicAPI` es un objeto con una propiedad/método en él, `login`, que es una referencia a la función interna `doLogin()`. Cuando devolvemos `publicAPI` desde `User()`, se convierte en la instancia que llamamos `fred`.

En este punto, la función externa `User()` ha terminado de ejecutarse. Normalmente, pensarías que las variables internas como `username` y `password` habrían desaparecido. Pero aquí no lo han hecho, porque hay un closure en la función `login()` que las mantiene vivas.

Es por eso que podemos llamar a `fred.login(..)` —lo mismo que llamar al `doLogin(..)` interno— y aún puede acceder a las variables internas `username` y `password`.

Hay muchas posibilidades de que con este breve vistazo al closure y al patrón módulo, parte de ello todavía sea un poco confuso. ¡Está bien! Lleva algo de trabajo envolver tu cerebro en torno a ello.

Desde aquí, lee el título *Scope & Closures* de esta serie para una exploración mucho más detallada.

## Identificador `this`

Otro concepto muy comúnmente mal entendido en JavaScript es el identificador `this`. De nuevo, hay un par de capítulos sobre él en el título *this & Object Prototypes* de esta serie, así que aquí solo introduciremos brevemente el concepto.

Mientras que a menudo puede parecer que `this` está relacionado con los "patrones orientados a objetos," en JS `this` es un mecanismo diferente.

Si una función tiene una referencia `this` dentro de ella, esa referencia `this` generalmente apunta a un `object`. Pero a qué `object` apunta depende de cómo se llamó la función.

Es importante darse cuenta de que `this` *no se refiere* a la función en sí, como es el malentendido más común.

Aquí hay una ilustración rápida:

```js
function foo() {
	console.log( this.bar );
}

var bar = "global";

var obj1 = {
	bar: "obj1",
	foo: foo
};

var obj2 = {
	bar: "obj2"
};

// --------

foo();				// "global"
obj1.foo();			// "obj1"
foo.call( obj2 );		// "obj2"
new foo();			// undefined
```

Hay cuatro reglas para cómo se establece `this`, y se muestran en esas últimas cuatro líneas de ese fragmento.

1. `foo()` termina estableciendo `this` al objeto global en modo no estricto —en modo estricto, `this` sería `undefined` y obtendrías un error al acceder a la propiedad `bar`— por lo que `"global"` es el valor encontrado para `this.bar`.
2. `obj1.foo()` establece `this` al objeto `obj1`.
3. `foo.call(obj2)` establece `this` al objeto `obj2`.
4. `new foo()` establece `this` a un objeto vacío completamente nuevo.

Conclusión: para entender a qué apunta `this`, debes examinar cómo se llamó la función en cuestión. Será de una de esas cuatro maneras que acabamos de mostrar, y eso entonces responderá qué es `this`.

**Nota:** Para más información sobre `this`, consulta los Capítulos 1 y 2 del título *this & Object Prototypes* de esta serie.

## Prototipos

El mecanismo de prototipo en JavaScript es bastante complicado. Solo lo veremos brevemente aquí. Querrás dedicar bastante tiempo a revisar los Capítulos 4-6 del título *this & Object Prototypes* de esta serie para todos los detalles.

Cuando haces referencia a una propiedad en un objeto, si esa propiedad no existe, JavaScript usará automáticamente la referencia de prototipo interno de ese objeto para encontrar otro objeto donde buscar la propiedad. Podrías pensar en esto casi como un respaldo si la propiedad falta.

El enlace de referencia de prototipo interno de un objeto a su respaldo ocurre en el momento en que se crea el objeto. La forma más sencilla de ilustrarlo es con una utilidad integrada llamada `Object.create(..)`.

Considera:

```js
var foo = {
	a: 42
};

// create `bar` and link it to `foo`
var bar = Object.create( foo );

bar.b = "hello world";

bar.b;		// "hello world"
bar.a;		// 42 <-- delegated to `foo`
```

Puede ayudar visualizar los objetos `foo` y `bar` y su relación:

<img src="fig6.png">

La propiedad `a` en realidad no existe en el objeto `bar`, pero como `bar` está prototipo-enlazado a `foo`, JavaScript automáticamente recurre a buscar `a` en el objeto `foo`, donde se encuentra.

Este enlace puede parecer una característica extraña del lenguaje. La forma más común en que se usa esta característica —y yo diría que se abusa— es intentar emular/falsificar un mecanismo de "clase" con "herencia."

Pero una forma más natural de aplicar los prototipos es un patrón llamado "delegación de comportamiento," donde diseñas intencionalmente tus objetos enlazados para poder *delegar* de uno a otro las partes del comportamiento necesario.

**Nota:** Para más información sobre prototipos y delegación de comportamiento, consulta los Capítulos 4-6 del título *this & Object Prototypes* de esta serie.

## Lo Antiguo y Lo Nuevo

Algunas de las características de JS que ya hemos cubierto, y ciertamente muchas de las características cubiertas en el resto de esta serie, son adiciones más nuevas y no necesariamente estarán disponibles en navegadores más antiguos. De hecho, algunas de las características más nuevas de la especificación ni siquiera están implementadas en ningún navegador estable todavía.

Entonces, ¿qué haces con las cosas nuevas? ¿Tienes que esperar años o décadas para que todos los navegadores viejos caigan en la oscuridad?

Así es como mucha gente piensa sobre la situación, pero en realidad no es un enfoque saludable para JS.

Hay dos técnicas principales que puedes usar para "llevar" las cosas más nuevas de JavaScript a los navegadores más antiguos: polyfilling y transpiling.

### Polyfilling

La palabra "polyfill" es un término inventado (por Remy Sharp) (https://remysharp.com/2010/10/08/what-is-a-polyfill) que se usa para referirse a tomar la definición de una característica más nueva y producir un fragmento de código que es equivalente al comportamiento, pero puede ejecutarse en entornos JS más antiguos.

Por ejemplo, ES6 define una utilidad llamada `Number.isNaN(..)` para proporcionar una verificación precisa sin bugs de los valores `NaN`, reemplazando la utilidad original `isNaN(..)`. Pero es fácil hacer un polyfill de esa utilidad para que puedas empezar a usarla en tu código independientemente de si el usuario final está en un navegador ES6 o no.

Considera:

```js
if (!Number.isNaN) {
	Number.isNaN = function isNaN(x) {
		return x !== x;
	};
}
```

La sentencia `if` protege contra aplicar la definición del polyfill en los navegadores ES6 donde ya existirá. Si no está ya presente, definimos `Number.isNaN(..)`.

**Nota:** La verificación que hacemos aquí aprovecha una peculiaridad de los valores `NaN`, que es que son el único valor en todo el lenguaje que no es igual a sí mismo. Entonces, el valor `NaN` es el único que haría que `x !== x` sea `true`.

No todas las características nuevas son completamente polyfillable. A veces la mayor parte del comportamiento puede ser polyfilled, pero todavía hay pequeñas desviaciones. Debes ser muy, muy cuidadoso al implementar un polyfill tú mismo, para asegurarte de cumplir con la especificación lo más estrictamente posible.

O mejor aún, usa un conjunto ya verificado de polyfills en el que puedas confiar, como los proporcionados por ES5-Shim (https://github.com/es-shims/es5-shim) y ES6-Shim (https://github.com/es-shims/es6-shim).

### Transpiling

No hay manera de hacer polyfill de la nueva sintaxis que se ha añadido al lenguaje. La nueva sintaxis produciría un error en el antiguo motor JS como no reconocida/inválida.

Entonces la mejor opción es usar una herramienta que convierta tu código más nuevo en equivalentes de código más antiguo. Este proceso se denomina comúnmente "transpiling," un término para transform + compiling (transformar + compilar).

Esencialmente, tu código fuente se escribe en la nueva forma de sintaxis, pero lo que despliegas en el navegador es el código transpilado en la antigua forma de sintaxis. Típicamente insertas el transpiler en tu proceso de construcción, similar a tu linter de código o tu minificador.

Podrías preguntarte por qué te tomarías la molestia de escribir nueva sintaxis solo para que sea transpilada a código más antiguo —¿por qué no escribir directamente el código más antiguo?

Hay varias razones importantes por las que deberías preocuparte por el transpiling:

* La nueva sintaxis añadida al lenguaje está diseñada para hacer tu código más legible y mantenible. Los equivalentes más antiguos son a menudo mucho más complejos. Deberías preferir escribir sintaxis más nueva y más limpia, no solo para ti sino para todos los demás miembros del equipo de desarrollo.
* Si haces transpiling solo para navegadores más antiguos, pero sirves la nueva sintaxis a los navegadores más nuevos, puedes aprovechar las optimizaciones de rendimiento del navegador con la nueva sintaxis. Esto también permite a los fabricantes de navegadores tener más código del mundo real para probar sus implementaciones y optimizaciones.
* Usar la nueva sintaxis antes permite que se pruebe de manera más robusta en el mundo real, lo que proporciona retroalimentación más temprana al comité de JavaScript (TC39). Si los problemas se encuentran con suficiente anticipación, pueden cambiarse/corregirse antes de que esos errores de diseño del lenguaje se vuelvan permanentes.

Aquí hay un ejemplo rápido de transpiling. ES6 añade una característica llamada "valores de parámetro predeterminados." Se ve así:

```js
function foo(a = 2) {
	console.log( a );
}

foo();		// 2
foo( 42 );	// 42
```

Simple, ¿verdad? ¡También útil! Pero es nueva sintaxis que es inválida en motores previos a ES6. Entonces, ¿qué hará un transpiler con ese código para que se ejecute en entornos más antiguos?

```js
function foo() {
	var a = arguments[0] !== (void 0) ? arguments[0] : 2;
	console.log( a );
}
```

Como puedes ver, verifica si el valor de `arguments[0]` es `void 0` (también `undefined`), y si es así proporciona el valor predeterminado `2`; de lo contrario, asigna lo que se pasó.

Además de poder usar ahora la sintaxis más agradable incluso en navegadores más antiguos, mirar el código transpilado en realidad explica el comportamiento previsto con más claridad.

Es posible que no te hayas dado cuenta solo mirando la versión ES6 de que `undefined` es el único valor que no puede pasarse explícitamente para un parámetro de valor predeterminado, pero el código transpilado lo hace mucho más claro.

El último detalle importante a enfatizar sobre los transpilers es que ahora deberían considerarse como una parte estándar del ecosistema y proceso de desarrollo de JS. JS continuará evolucionando, mucho más rápidamente que antes, por lo que cada pocos meses se añadirán nuevas sintaxis y nuevas características.

Si usas un transpiler por defecto, siempre podrás hacer ese cambio a la nueva sintaxis cuando la encuentres útil, en lugar de siempre esperar años para que los navegadores actuales las desechen.

Hay bastantes transpilers excelentes para elegir. Aquí hay algunas buenas opciones en el momento de escribir esto:

* Babel (https://babeljs.io) (anteriormente 6to5): Transpila ES6+ a ES5
* Traceur (https://github.com/google/traceur-compiler): Transpila ES6, ES7 y más allá a ES5

## No-JavaScript

Hasta ahora, las únicas cosas que hemos cubierto están en el propio lenguaje JS. La realidad es que la mayor parte del JS está escrito para ejecutarse e interactuar con entornos como los navegadores. Una buena parte de lo que escribes en tu código, estrictamente hablando, no está controlado directamente por JavaScript. Eso probablemente suene un poco extraño.

El JavaScript no-JavaScript más común que encontrarás es la API DOM. Por ejemplo:

```js
var el = document.getElementById( "foo" );
```

La variable `document` existe como una variable global cuando tu código se ejecuta en un navegador. No es proporcionada por el motor JS, ni está particularmente controlada por la especificación JavaScript. Toma la forma de algo que se parece mucho a un `object` JS normal, pero en realidad no es exactamente eso. Es un `object` especial, a menudo llamado "objeto host."

Además, el método `getElementById(..)` en `document` parece una función JS normal, pero es solo una interfaz delgadamente expuesta a un método integrado proporcionado por el DOM desde tu navegador. En algunos navegadores (de generación más nueva), esta capa también puede estar en JS, pero tradicionalmente el DOM y su comportamiento se implementan en algo más parecido a C/C++.

Otro ejemplo es con la entrada/salida (I/O).

El favorito de todos `alert(..)` muestra un cuadro de mensaje en la ventana del navegador del usuario. `alert(..)` es proporcionado a tu programa JS por el navegador, no por el propio motor JS. La llamada que haces envía el mensaje a las partes internas del navegador y maneja el dibujo y la visualización del cuadro de mensaje.

Lo mismo ocurre con `console.log(..)`; tu navegador proporciona tales mecanismos y los conecta a las herramientas de desarrollador.

Este libro, y toda esta serie, se centra en JavaScript el lenguaje. Por eso no ves ninguna cobertura sustancial de estos mecanismos JavaScript no-JavaScript. Sin embargo, debes ser consciente de ellos, ¡ya que estarán en cada programa JS que escribas!

## Repaso

El primer paso para aprender el estilo de programación de JavaScript es obtener una comprensión básica de sus mecanismos centrales como valores, tipos, closures de función, `this` y prototipos.

Por supuesto, cada uno de estos temas merece una cobertura mucho mayor de la que has visto aquí, pero por eso hay capítulos y libros dedicados a ellos a lo largo del resto de esta serie. Después de que te sientas bastante cómodo con los conceptos y ejemplos de código en este capítulo, el resto de la serie te espera para profundizar realmente y conocer el lenguaje en profundidad.

El capítulo final de este libro resumirá brevemente cada uno de los otros títulos de la serie y los demás conceptos que cubren además de lo que ya hemos explorado.
