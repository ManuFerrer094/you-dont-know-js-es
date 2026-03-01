# You Don't Know JS: Tipos y Gramática
# Apéndice A: JavaScript en Entornos Mixtos

Más allá de la mecánica central del lenguaje que hemos explorado completamente en este libro, hay varias formas en las que tu código JS puede comportarse de manera diferente cuando se ejecuta en el mundo real. Si JS se ejecutara puramente dentro de un motor, sería completamente predecible basándose en nada más que el blanco y negro de la especificación. Pero JS casi siempre se ejecuta en el contexto de un entorno de alojamiento, lo que expone tu código a cierto grado de imprevisibilidad.

Por ejemplo, cuando tu código se ejecuta junto con código de otras fuentes, o cuando tu código se ejecuta en diferentes tipos de motores JS (no solo navegadores), hay algunas cosas que pueden comportarse de manera diferente.

Exploraremos brevemente algunas de estas preocupaciones.

## Annex B (ECMAScript)

Es un hecho poco conocido que el nombre oficial del lenguaje es ECMAScript (en referencia al organismo de estándares ECMA que lo gestiona). ¿Qué es entonces "JavaScript"? JavaScript es el nombre comercial común del lenguaje, por supuesto, pero más apropiadamente, JavaScript es básicamente la implementación del navegador de la especificación.

La especificación oficial de ECMAScript incluye el "Annex B", que discute desviaciones específicas de la especificación oficial para propósitos de compatibilidad de JS en navegadores.

La forma correcta de considerar estas desviaciones es que solo están presente/son válidas de manera confiable si tu código se ejecuta en un navegador. Si tu código siempre se ejecuta en navegadores, no verás ninguna diferencia observable. Si no (como si puede ejecutarse en node.js, Rhino, etc.), o no estás seguro, procede con cuidado.

Las principales diferencias de compatibilidad son:

* Los literales numéricos octales están permitidos, como `0123` (decimal `83`) en modo no-`strict mode`.
* `window.escape(..)` y `window.unescape(..)` te permiten escapar o desescapar cadenas con secuencias de escape hexadecimales delimitadas por `%`. Por ejemplo: `window.escape( "?foo=97%&bar=3%" )` produce `"%3Ffoo%3D97%25%26bar%3D3%25"`.
* `String.prototype.substr` es bastante similar a `String.prototype.substring`, excepto que en lugar de que el segundo parámetro sea el índice final (no inclusivo), el segundo parámetro es la `length` (número de caracteres a incluir).

### Web ECMAScript

La especificación Web ECMAScript (http://javascript.spec.whatwg.org/) cubre las diferencias entre la especificación oficial de ECMAScript y las implementaciones actuales de JavaScript en navegadores.

En otras palabras, estos elementos son "requeridos" por los navegadores (para ser compatibles entre sí) pero no están (al momento de escribir esto) listados en la sección "Annex B" de la especificación oficial:

* `<!--` y `-->` son delimitadores válidos de comentarios de una sola línea.
* Adiciones a `String.prototype` para retornar cadenas con formato HTML: `anchor(..)`, `big(..)`, `blink(..)`, `bold(..)`, `fixed(..)`, `fontcolor(..)`, `fontsize(..)`, `italics(..)`, `link(..)`, `small(..)`, `strike(..)` y `sub(..)`. **Nota:** Estos se usan muy raramente en la práctica, y generalmente se desaconsejan en favor de otras APIs del DOM integradas o utilidades definidas por el usuario.
* Extensiones de `RegExp`: `RegExp.$1` .. `RegExp.$9` (grupos de coincidencia) y `RegExp.lastMatch`/`RegExp["$&"]` (coincidencia más reciente).
* Adiciones a `Function.prototype`: `Function.prototype.arguments` (alias del objeto `arguments` interno) y `Function.caller` (alias del `arguments.caller` interno). **Nota:** `arguments` y por lo tanto `arguments.caller` están obsoletos, así que deberías evitar usarlos si es posible. Eso aplica doblemente para estos alias -- ¡no los uses!

**Nota:** Algunas otras desviaciones menores y raramente usadas no están incluidas en nuestra lista aquí. Consulta los documentos externos "Annex B" y "Web ECMAScript" para información más detallada según sea necesario.

Generalmente hablando, todas estas diferencias se usan raramente, así que las desviaciones de la especificación no son preocupaciones significativas. **Solo ten cuidado** si dependes de alguna de ellas.

## Objetos del Entorno

Las bien conocidas reglas sobre cómo se comportan las variables en JS tienen excepciones cuando se trata de variables que son auto-definidas, o creadas y proporcionadas a JS por el entorno que aloja tu código (navegador, etc.) -- los llamados "host objects" (que incluyen tanto `object`s como `function`s integrados).

Por ejemplo:

```js
var a = document.createElement( "div" );

typeof a;								// "object" -- como se esperaba
Object.prototype.toString.call( a );	// "[object HTMLDivElement]"

a.tagName;								// "DIV"
```

`a` no es solo un `object`, sino un host object especial porque es un elemento del DOM. Tiene un valor `[[Class]]` interno diferente (`"HTMLDivElement"`) y viene con propiedades predefinidas (y a menudo inmutables).

Otra peculiaridad similar ya fue cubierta, en la sección "Objetos Falsy" del Capítulo 4: algunos objetos pueden existir pero cuando se convierten a `boolean` (confusamente) se convertirán a `false` en lugar del esperado `true`.

Otras variaciones de comportamiento con host objects de las que debes estar al tanto pueden incluir:

* no tener acceso a `object` built-ins normales como `toString()`
* no ser sobreescribibles
* tener ciertas propiedades predefinidas de solo lectura
* tener métodos que no pueden ser sobrescritos con `this` hacia otros objetos
* y más...

Los host objects son críticos para hacer que nuestro código JS funcione con su entorno circundante. Pero es importante notar cuándo estás interactuando con un host object y tener cuidado al asumir sus comportamientos, ya que con bastante frecuencia no se conformarán a los `object`s regulares de JS.

Un ejemplo notable de un host object con el que probablemente interactúas regularmente es el objeto `console` y sus diversas funciones (`log(..)`, `error(..)`, etc.). El objeto `console` es proporcionado por el *entorno de alojamiento* específicamente para que tu código pueda interactuar con él para varias tareas de salida relacionadas con el desarrollo.

En los navegadores, `console` se conecta a la pantalla de la consola de las herramientas de desarrollo, mientras que en node.js y otros entornos JS del lado del servidor, `console` generalmente está conectado a los flujos de salida estándar (`stdout`) y error estándar (`stderr`) del proceso del sistema del entorno JavaScript.

## Variables Globales del DOM

Probablemente estás al tanto de que declarar una variable en el ámbito global (con o sin `var`) crea no solo una variable global, sino también su espejo: una propiedad del mismo nombre en el objeto `global` (`window` en el navegador).

Pero lo que puede ser menos conocido es que (debido al comportamiento heredado de los navegadores) crear elementos del DOM con atributos `id` crea variables globales con esos mismos nombres. Por ejemplo:

```html
<div id="foo"></div>
```

Y:

```js
if (typeof foo == "undefined") {
	foo = 42;		// nunca se ejecutará
}

console.log( foo );	// elemento HTML
```

Quizás estés acostumbrado a gestionar pruebas de variables globales (usando comprobaciones `typeof` o `.. in window`) bajo el supuesto de que solo el código JS crea tales variables, pero como puedes ver, el contenido de tu página HTML de alojamiento también puede crearlas, lo que fácilmente puede confundir tu lógica de comprobación de existencia si no tienes cuidado.

Esta es una razón más por la que deberías, si es posible, evitar usar variables globales, y si tienes que hacerlo, usar variables con nombres únicos que probablemente no colisionen. Pero también necesitas asegurarte de no colisionar con el contenido HTML así como con cualquier otro código.

## Prototipos Nativos

Una de las piezas más ampliamente conocidas y clásicas de sabiduría sobre *mejores prácticas* de JavaScript es: **nunca extiendas los prototipos nativos**.

Cualquier método o nombre de propiedad que se te ocurra agregar a `Array.prototype` que no exista (todavía), si es una adición útil y bien diseñada, y con nombre apropiado, hay una gran posibilidad de que *pueda* terminar siendo agregada a la especificación -- en cuyo caso tu extensión ahora está en conflicto.

Aquí hay un ejemplo real que realmente me sucedió y que ilustra bien este punto.

Estaba construyendo un widget embebible para otros sitios web, y mi widget dependía de jQuery (aunque prácticamente cualquier framework habría sufrido esta trampa). Funcionaba en casi todos los sitios, pero nos encontramos con uno donde estaba totalmente roto.

Después de casi una semana de análisis/depuración, descubrí que el sitio en cuestión tenía, enterrado profundamente en uno de sus archivos heredados, código que se veía así:

```js
// Netscape 4 doesn't have Array.push
Array.prototype.push = function(item) {
	this[this.length] = item;
};
```

Aparte del comentario loco (¿a quién le importa Netscape 4 a estas alturas?!), esto parece razonable, ¿verdad?

El problema es que `Array.prototype.push` fue agregado a la especificación en algún momento posterior a esta era de codificación de Netscape 4, pero lo que se agregó no es compatible con este código. El `push(..)` estándar permite que múltiples elementos sean insertados a la vez. Este hackeado ignora los elementos subsiguientes.

Básicamente todos los frameworks de JS tienen código que depende de `push(..)` con múltiples elementos. En mi caso, era código alrededor del motor de selectores CSS que estaba completamente roto. Pero podría haber concebiblamente docenas de otros lugares susceptibles.

El desarrollador que originalmente escribió ese hack de `push(..)` tenía el instinto correcto de llamarlo `push`, pero no previó el insertar múltiples elementos. Ciertamente estaban actuando de buena fe, pero crearon una mina terrestre que no explotó hasta casi 10 años después cuando yo, sin saberlo, aparecí.

Hay múltiples lecciones que extraer de todos los lados.

Primero, no extiendas los nativos a menos que estés absolutamente seguro de que tu código es el único código que se ejecutará en ese entorno. Si no puedes decir eso al 100%, entonces extender los nativos es peligroso. Debes sopesar los riesgos.

Segundo, no definas extensiones incondicionalmente (porque puedes sobreescribir nativos accidentalmente). En este ejemplo particular, si el código hubiera dicho esto:

```js
if (!Array.prototype.push) {
	// Netscape 4 doesn't have Array.push
	Array.prototype.push = function(item) {
		this[this.length] = item;
	};
}
```

La guarda del `if` solo habría definido este `push()` hackeado para entornos JS donde no existiera. En mi caso, eso probablemente habría estado bien. Pero incluso este enfoque no está libre de riesgo:

1. Si el código del sitio (¡por alguna razón loca!) dependía de un `push(..)` que ignorara múltiples elementos, ese código habría estado roto hace años cuando el `push(..)` estándar fue desplegado.
2. Si alguna otra biblioteca hubiera llegado y hackeado un `push(..)` antes de esta guarda `if`, y lo hubiera hecho de una manera incompatible, eso habría roto el sitio en ese momento.

Lo que eso resalta es una pregunta interesante que, francamente, no recibe suficiente atención de los desarrolladores JS: **¿Deberías ALGUNA VEZ depender del comportamiento nativo integrado** si tu código se ejecuta en cualquier entorno donde no es el único código presente?

La respuesta estricta es **no**, pero eso es tremendamente impráctico. Tu código generalmente no puede redefinir sus propias versiones privadas e intocables de todo el comportamiento integrado del que depende. Incluso si *pudieras*, eso es bastante despilfarrador.

Entonces, ¿deberías probar las características del comportamiento integrado así como también probar el cumplimiento de que hace lo que esperas? ¿Y qué pasa si esa prueba falla -- debería tu código simplemente negarse a ejecutar?

```js
// don't trust Array.prototype.push
(function(){
	if (Array.prototype.push) {
		var a = [];
		a.push(1,2);
		if (a[0] === 1 && a[1] === 2) {
			// tests passed, safe to use!
			return;
		}
	}

	throw Error(
		"Array#push() is missing/broken!"
	);
})();
```

En teoría, eso suena plausible, pero también es bastante impráctico diseñar pruebas para cada método integrado individual.

Entonces, ¿qué deberíamos hacer? ¿Deberíamos *confiar pero verificar* (probar características y cumplimiento) de **todo**? ¿Deberíamos simplemente asumir que la existencia es cumplimiento y dejar que la rotura (causada por otros) surja como sea?

No hay una gran respuesta. El único hecho que puede observarse es que extender los prototipos nativos es la única forma en que estas cosas te muerden.

Si no lo haces, y nadie más lo hace en el código de tu aplicación, estás a salvo. De lo contrario, deberías incorporar al menos un poco de escepticismo, pesimismo y expectativa de posible rotura.

Tener un conjunto completo de pruebas unitarias/de regresión de tu código que se ejecute en todos los entornos conocidos es una forma de sacar a la superficie algunos de estos problemas más temprano, pero no hace nada para realmente protegerte de estos conflictos.

### Shims/Polyfills

Usualmente se dice que el único lugar seguro para extender un nativo es en un entorno más antiguo (que no cumple con la especificación), ya que es poco probable que cambie -- los nuevos navegadores con nuevas características de la especificación reemplazan a los navegadores más antiguos en lugar de enmendarlos.

Si pudieras ver el futuro, y saber con certeza lo que un futuro estándar va a ser, como para `Array.prototype.foobar`, sería totalmente seguro hacer tu propia versión compatible para usar ahora, ¿verdad?

```js
if (!Array.prototype.foobar) {
	// silly, silly
	Array.prototype.foobar = function() {
		this.push( "foo", "bar" );
	};
}
```

Si ya hay una especificación para `Array.prototype.foobar`, y el comportamiento especificado es igual a esta lógica, estás bastante seguro al definir tal fragmento, y en ese caso generalmente se le llama "polyfill" (o "shim").

Tal código es **muy** útil para incluir en tu base de código para "parchear" entornos de navegadores más antiguos que no están actualizados a las especificaciones más recientes. Usar polyfills es una gran forma de crear código predecible en todos tus entornos soportados.

**Consejo:** ES5-Shim (https://github.com/es-shims/es5-shim) es una colección comprehensiva de shims/polyfills para llevar un proyecto a la línea base de ES5, y similarmente, ES6-Shim (https://github.com/es-shims/es6-shim) proporciona shims para nuevas APIs agregadas a partir de ES6. Aunque las APIs pueden ser shimmeadas/polyfilladas, la nueva sintaxis generalmente no puede. Para cerrar la brecha sintáctica, también querrás usar un transpilador de ES6 a ES5 como Traceur (https://github.com/google/traceur-compiler/wiki/Getting-Started).

Si hay un probable estándar próximo, y la mayoría de las discusiones coinciden en cómo se llamará y cómo operará, crear el polyfill anticipado para cumplimiento de estándares futuros se llama "prollyfill" (probably-fill).

La verdadera trampa es si algún nuevo comportamiento estándar no puede ser (completamente) polyfillado/prollyfillado.

Hay debate en la comunidad sobre si un polyfill parcial para los casos comunes es aceptable (documentando las partes que no pueden ser polyfilladas), o si un polyfill debería evitarse si simplemente no puede ser 100% compatible con la especificación.

Muchos desarrolladores al menos aceptan algunos polyfills parciales comunes (como por ejemplo `Object.create(..)`), porque las partes que no están cubiertas no son partes que pretendan usar de todos modos.

Algunos desarrolladores creen que la guarda `if` alrededor de un polyfill/shim debería incluir alguna forma de prueba de conformidad, reemplazando el método existente ya sea si está ausente o si falla las pruebas. Esta capa extra de pruebas de cumplimiento se usa a veces para distinguir "shim" (con prueba de cumplimiento) de "polyfill" (con comprobación de existencia).

Lo único absolutamente para llevar es que no hay una respuesta absolutamente *correcta* aquí. Extender los nativos, incluso cuando se hace "de forma segura" en entornos más antiguos, no es 100% seguro. Lo mismo aplica para depender de nativos (posiblemente extendidos) en presencia del código de otros.

Cualquiera de las dos debería hacerse siempre con precaución, código defensivo y mucha documentación obvia sobre los riesgos.

## `<script>`s

La mayoría de los sitios web/aplicaciones vistos en navegadores tienen más de un archivo que contiene su código, y es común tener algunos o varios elementos `<script src=..></script>` en la página que cargan estos archivos por separado, e incluso algunos elementos de código en línea `<script> .. </script>` también.

Pero, ¿estos archivos/fragmentos de código separados constituyen programas separados o son colectivamente un programa JS?

La realidad (quizás sorprendente) es que actúan más como programas JS independientes en la mayoría, pero no en todos, los aspectos.

Lo único que *comparten* es el objeto `global` único (`window` en el navegador), lo que significa que múltiples archivos pueden anexar su código a ese namespace compartido y todos pueden interactuar.

Entonces, si un elemento `script` define una función global `foo()`, cuando un segundo `script` se ejecuta después, puede acceder y llamar a `foo()` como si hubiera definido la función él mismo.

Pero el *hoisting* del ámbito de variables globales (ver el título *Scope & Closures* de esta serie) no ocurre a través de estos límites, así que el siguiente código no funcionaría (porque la declaración de `foo()` aún no está declarada), independientemente de si son (como se muestra) elementos `<script> .. </script>` en línea o archivos `<script src=..></script>` cargados externamente:

```html
<script>foo();</script>

<script>
  function foo() { .. }
</script>
```

Pero cualquiera de estos *sí* funcionaría en su lugar:

```html
<script>
  foo();
  function foo() { .. }
</script>
```

O:

```html
<script>
  function foo() { .. }
</script>

<script>foo();</script>
```

Además, si ocurre un error en un elemento `script` (en línea o externo), como un programa JS independiente separado, fallará y se detendrá, pero cualquier `script` subsiguiente se ejecutará (aún con el `global` compartido) sin impedimentos.

Puedes crear elementos `script` dinámicamente desde tu código, e inyectarlos en el DOM de la página, y el código en ellos se comportará básicamente como si se cargara normalmente en un archivo separado:

```js
var greeting = "Hello World";

var el = document.createElement( "script" );

el.text = "function foo(){ alert( greeting );\
 } setTimeout( foo, 1000 );";

document.body.appendChild( el );
```

**Nota:** Por supuesto, si intentaras el fragmento anterior pero establecieras `el.src` a alguna URL de archivo en lugar de establecer `el.text` al contenido del código, estarías creando dinámicamente un elemento `<script src=..></script>` cargado externamente.

Una diferencia entre el código en un bloque de código en línea y ese mismo código en un archivo externo es que en el bloque de código en línea, la secuencia de caracteres `</script>` no puede aparecer junta, ya que (independientemente de dónde aparezca) sería interpretada como el final del bloque de código. Así que, ten cuidado con código como:

```html
<script>
  var code = "<script>alert( 'Hello World' )</script>";
</script>
```

Parece inofensivo, pero el `</script>` que aparece dentro del literal `string` terminará el bloque de script de manera anormal, causando un error. La solución más común es:

```js
"</sc" + "ript>";
```

También, ten en cuenta que el código dentro de un archivo externo será interpretado en el conjunto de caracteres (UTF-8, ISO-8859-8, etc.) con el que el archivo es servido (o el predeterminado), pero que ese mismo código en un elemento `script` en línea en tu página HTML será interpretado por el conjunto de caracteres de la página (o su predeterminado).

**Advertencia:** El atributo `charset` no funcionará en elementos script en línea.

Otra práctica obsoleta con elementos `script` en línea es incluir comentarios estilo HTML o X(HT)ML alrededor del código en línea, como:

```html
<script>
<!--
alert( "Hello" );
//-->
</script>

<script>
<!--//--><![CDATA[//><!--
alert( "World" );
//--><!]]>
</script>
```

Ambos son totalmente innecesarios ahora, así que si todavía estás haciendo eso, ¡detente!

**Nota:** Tanto `<!--` como `-->` (comentarios estilo HTML) son en realidad especificados como delimitadores válidos de comentarios de una sola línea (`var x = 2; <!-- valid comment` y `--> another valid line comment`) en JavaScript (ver la sección "Web ECMAScript" anterior), puramente debido a esta vieja técnica. Pero nunca los uses.

## Palabras Reservadas

La especificación ES5 define un conjunto de "palabras reservadas" en la Sección 7.6.1 que no pueden usarse como nombres de variables independientes. Técnicamente, hay cuatro categorías: "keywords", "future reserved words", el literal `null`, y los literales booleanos `true` / `false`.

Las keywords son las obvias como `function` y `switch`. Las future reserved words incluyen cosas como `enum`, aunque muchas del resto (`class`, `extends`, etc.) ahora realmente son usadas por ES6; hay otras palabras reservadas solo para strict-mode como `interface`.

El usuario de StackOverflow "art4theSould" creativamente trabajó todas estas palabras reservadas en un divertido pequeño poema (http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript/12114140#12114140):

> Let this long package float,
> Goto private class if short.
> While protected with debugger case,
> Continue volatile interface.
> Instanceof super synchronized throw,
> Extends final export throws.
>
> Try import double enum?
> - False, boolean, abstract function,
> Implements typeof transient break!
> Void static, default do,
> Switch int native new.
> Else, delete null public var
> In return for const, true, char
> …Finally catch byte.

**Nota:** Este poema incluye palabras que estaban reservadas en ES3 (`byte`, `long`, etc.) que ya no están reservadas a partir de ES5.

Antes de ES5, las palabras reservadas tampoco podían ser nombres de propiedades o claves en literales de objetos, pero esa restricción ya no existe.

Entonces, esto no está permitido:

```js
var import = "42";
```

Pero esto sí está permitido:

```js
var obj = { import: "42" };
console.log( obj.import );
```

Sin embargo, debes estar al tanto de que algunas versiones de navegadores más antiguas (principalmente IE antiguo) no eran completamente consistentes al aplicar estas reglas, así que hay lugares donde usar palabras reservadas en ubicaciones de nombres de propiedades de objetos aún puede causar problemas. Prueba cuidadosamente todos los entornos de navegadores soportados.

## Límites de Implementación

La especificación de JavaScript no coloca límites arbitrarios en cosas como el número de argumentos de una función o la longitud de un literal de cadena, pero estos límites existen de todos modos, debido a detalles de implementación en diferentes motores.

Por ejemplo:

```js
function addAll() {
	var sum = 0;
	for (var i=0; i < arguments.length; i++) {
		sum += arguments[i];
	}
	return sum;
}

var nums = [];
for (var i=1; i < 100000; i++) {
	nums.push(i);
}

addAll( 2, 4, 6 );				// 12
addAll.apply( null, nums );		// should be: 499950000
```

En algunos motores JS, obtendrás la respuesta correcta `499950000`, pero en otros (como Safari 6.x), obtendrás el error: "RangeError: Maximum call stack size exceeded."

Ejemplos de otros límites que se sabe que existen:

* número máximo de caracteres permitidos en un literal de cadena (no solo un valor de cadena)
* tamaño (bytes) de datos que pueden enviarse en argumentos a una llamada de función (también conocido como tamaño de la pila)
* número de parámetros en una declaración de función
* profundidad máxima de la pila de llamadas no optimizada (es decir, con recursión): cuán larga puede ser una cadena de llamadas de función de una a otra
* número de segundos que un programa JS puede ejecutarse continuamente bloqueando el navegador
* longitud máxima permitida para un nombre de variable
* ...

No es muy común encontrarse con estos límites, pero debes estar al tanto de que los límites pueden existir y existen, e importantemente que varían entre motores.

## Revisión

Sabemos y podemos confiar en el hecho de que el lenguaje JS en sí tiene un estándar y está implementado de manera predecible por todos los navegadores/motores modernos. ¡Esto es algo muy bueno!

Pero JavaScript raramente se ejecuta en aislamiento. Se ejecuta en un entorno mezclado con código de bibliotecas de terceros, y a veces incluso se ejecuta en motores/entornos que difieren de los encontrados en navegadores.

Prestar mucha atención a estos problemas mejora la fiabilidad y robustez de tu código.
