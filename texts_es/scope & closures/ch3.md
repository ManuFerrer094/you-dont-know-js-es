# No Sabes JS: Scope y Closures
# Capítulo 3: Scope de Función vs. de Bloque

Como exploramos en el Capítulo 2, el scope consiste en una serie de "burbujas" que cada una actúa como un contenedor o cubo, en el que se declaran identificadores (variables, funciones). Estas burbujas se anidan pulcramente unas dentro de otras, y este anidamiento se define en tiempo de autor.

Pero, ¿qué exactly hace una nueva burbuja? ¿Es solo la función? ¿Pueden otras estructuras en JavaScript crear burbujas de scope?

## Scope Desde Funciones

La respuesta más común a esas preguntas es que JavaScript tiene scope basado en funciones. Es decir, cada función que declaras crea una burbuja para sí misma, pero ninguna otra estructura crea sus propias burbujas de scope. Como veremos en un momento, eso no es del todo cierto.

Pero primero, exploremos el scope de función y sus implicaciones.

Considera este código:

```js
function foo(a) {
	var b = 2;

	// some code

	function bar() {
		// ...
	}

	// more code

	var c = 3;
}
```

En este fragmento, la burbuja de scope para `foo(..)` incluye los identificadores `a`, `b`, `c` y `bar`. **No importa** *dónde* aparezca una declaración en el scope, la variable o función pertenece a la burbuja de scope que la contiene, independientemente. Exploraremos cómo funciona *eso* exactamente en el próximo capítulo.

`bar(..)` tiene su propia burbuja de scope. También lo tiene el scope global, que tiene solo un identificador adjunto a él: `foo`.

Dado que `a`, `b`, `c` y `bar` todos pertenecen a la burbuja de scope de `foo(..)`, no son accesibles fuera de `foo(..)`. Es decir, el siguiente código resultaría en errores `ReferenceError`, ya que los identificadores no están disponibles para el scope global:

```js
bar(); // fails

console.log( a, b, c ); // all 3 fail
```

Sin embargo, todos estos identificadores (`a`, `b`, `c`, `foo` y `bar`) son accesibles *dentro* de `foo(..)`, y de hecho también están disponibles dentro de `bar(..)` (suponiendo que no hay declaraciones de identificadores sombreados dentro de `bar(..)`).

El scope de función fomenta la idea de que todas las variables pertenecen a la función, y pueden ser utilizadas y reutilizadas a lo largo de toda la función (y de hecho, accesibles incluso a los scopes anidados). Este enfoque de diseño puede ser bastante útil, y ciertamente puede aprovechar al máximo la naturaleza "dinámica" de las variables JavaScript para tomar valores de diferentes tipos según se necesite.

Por otro lado, si no tomas precauciones cuidadosas, las variables que existen a lo largo de todo un scope pueden llevar a algunas trampas inesperadas.

## Esconderse en el Scope Evidente

La forma tradicional de pensar en las funciones es que declaras una función y luego agregas código dentro de ella. Pero el pensamiento inverso es igualmente poderoso y útil: toma cualquier sección arbitraria de código que hayas escrito, y envuelve una declaración de función a su alrededor, lo que efectivamente "oculta" el código.

El resultado práctico es crear una burbuja de scope alrededor del código en cuestión, lo que significa que cualquier declaración (variable o función) en ese código estará ahora vinculada al scope de la nueva función contenedora, en lugar del scope que lo contenía anteriormente. En otras palabras, puedes "ocultar" variables y funciones encerrándolas en el scope de una función.

¿Por qué sería "ocultar" variables y funciones una técnica útil?

Hay una variedad de razones que motivan esta ocultación basada en scope. Tienden a surgir del principio de diseño de software "Principio de Mínimo Privilegio" [^note-leastprivilege], a veces también llamado "Mínima Autoridad" o "Mínima Exposición". Este principio establece que en el diseño de software, como la API para un módulo/objeto, deberías exponer solo lo mínimamente necesario, y "ocultar" todo lo demás.

Este principio se extiende a la elección de qué scope debe contener las variables y funciones. Si todas las variables y funciones estuvieran en el scope global, por supuesto serían accesibles a cualquier scope anidado. Pero esto violaría el principio de "Mínimo..." en que estás (probablemente) exponiendo muchas variables o funciones que de otro modo deberías mantener privadas, ya que el uso adecuado del código desaconsejaría el acceso a esas variables/funciones.

Por ejemplo:

```js
function doSomething(a) {
	b = a + doSomethingElse( a * 2 );

	console.log( b * 3 );
}

function doSomethingElse(a) {
	return a - 1;
}

var b;

doSomething( 2 ); // 15
```

En este fragmento, la variable `b` y la función `doSomethingElse(..)` son probablemente detalles "privados" de cómo hace su trabajo `doSomething(..)`. Dar al scope que lo contiene "acceso" a `b` y `doSomethingElse(..)` no solo es innecesario sino también posiblemente "peligroso", en que pueden usarse de formas inesperadas, intencionalmente o no, y esto puede violar las suposiciones de precondición de `doSomething(..)`.

Un diseño más "apropiado" ocultaría estos detalles privados dentro del scope de `doSomething(..)`, como:

```js
function doSomething(a) {
	function doSomethingElse(a) {
		return a - 1;
	}

	var b;

	b = a + doSomethingElse( a * 2 );

	console.log( b * 3 );
}

doSomething( 2 ); // 15
```

Ahora, `b` y `doSomethingElse(..)` no son accesibles a ninguna influencia exterior, sino controlados solo por `doSomething(..)`. La funcionalidad y el resultado final no se han visto afectados, pero el diseño mantiene los detalles privados en privado, lo que generalmente se considera mejor software.

### Evitando Colisiones

Otro beneficio de "ocultar" variables y funciones dentro de un scope es evitar la colisión accidental entre dos identificadores diferentes con el mismo nombre pero con usos previstos diferentes. La colisión a menudo resulta en la sobrescritura inesperada de valores.

Por ejemplo:

```js
function foo() {
	function bar(a) {
		i = 3; // changing the `i` in the enclosing scope's for-loop
		console.log( a + i );
	}

	for (var i=0; i<10; i++) {
		bar( i * 2 ); // oops, infinite loop ahead!
	}
}

foo();
```

La asignación `i = 3` dentro de `bar(..)` sobreescribe inesperadamente el `i` que fue declarado en `foo(..)` en el bucle for. En este caso, resultará en un bucle infinito, porque `i` se establece en un valor fijo de `3` y que siempre permanecerá `< 10`.

La asignación dentro de `bar(..)` necesita declarar una variable local para usar, independientemente del nombre de identificador elegido. `var i = 3;` solucionaría el problema (y crearía la declaración de "variable sombreada" mencionada anteriormente para `i`). Una opción *adicional*, no alternativa, es elegir otro nombre de identificador completamente, como `var j = 3;`. Pero el diseño de tu software puede requerir naturalmente el mismo nombre de identificador, por lo que utilizar el scope para "ocultar" tu declaración interna es tu mejor/única opción en ese caso.

#### "Espacios de Nombres" Globales

Un ejemplo particularmente fuerte de (probable) colisión de variables ocurre en el scope global. Múltiples bibliotecas cargadas en tu programa pueden colisionar fácilmente entre sí si no ocultan adecuadamente sus funciones y variables internas/privadas.

Tales bibliotecas típicamente crearán una declaración de una sola variable, a menudo un objeto, con un nombre suficientemente único, en el scope global. Este objeto se usa entonces como un "espacio de nombres" para esa biblioteca, donde todas las exposiciones específicas de funcionalidad se hacen como propiedades de ese objeto (espacio de nombres), en lugar de como identificadores léxicamente en el nivel superior por sí mismos.

Por ejemplo:

```js
var MyReallyCoolLibrary = {
	awesome: "stuff",
	doSomething: function() {
		// ...
	},
	doAnotherThing: function() {
		// ...
	}
};
```

#### Gestión de Módulos

Otra opción para evitar colisiones es el enfoque de "módulos" más moderno, utilizando cualquiera de los diversos gestores de dependencias. Usando estas herramientas, ninguna biblioteca agrega nunca ningún identificador al scope global, sino que se requiere que su o sus identificadores se importen explícitamente en otro scope específico a través del uso de los diversos mecanismos del gestor de dependencias.

Debe observarse que estas herramientas no poseen funcionalidad "mágica" que esté exenta de las reglas de scope léxico. Simplemente usan las reglas de scope como se explican aquí para garantizar que no se inyecten identificadores en ningún scope compartido, sino que se mantengan en scopes privados, no susceptibles a colisiones, lo que evita cualquier colisión de scope accidental.

Como tal, puedes codificar defensivamente y lograr los mismos resultados que los gestores de dependencias hacen sin necesitar usarlos realmente, si así lo eliges. Consulta el Capítulo 5 para más información sobre el patrón módulo.

## Funciones Como Scopes

Hemos visto que podemos tomar cualquier fragmento de código y envolver una función alrededor de él, y eso efectivamente "oculta" cualquier declaración de variable o función encerrada del scope exterior dentro del scope interno de esa función.

Por ejemplo:

```js
var a = 2;

function foo() { // <-- insert this

	var a = 3;
	console.log( a ); // 3

} // <-- and this
foo(); // <-- and this

console.log( a ); // 2
```

Si bien esta técnica "funciona", no es necesariamente muy ideal. Introduce algunos problemas. El primero es que tenemos que declarar una función nombrada `foo()`, lo que significa que el identificador de nombre `foo` en sí mismo "contamina" el scope contenedor (global, en este caso). También tenemos que llamar explícitamente la función por nombre (`foo()`) para que el código contenido se ejecute en realidad.

Sería más ideal si la función no necesitara un nombre (o, más bien, que el nombre no contaminara el scope contenedor), y si la función pudiera ejecutarse automáticamente.

Afortunadamente, JavaScript ofrece una solución a ambos problemas.

```js
var a = 2;

(function foo(){ // <-- insert this

	var a = 3;
	console.log( a ); // 3

})(); // <-- and this

console.log( a ); // 2
```

Analicemos lo que está pasando aquí.

Primero, observa que la declaración de función contenedora comienza con `(function...` en oposición a solo `function...`. Si bien esto puede parecer un detalle menor, en realidad es un cambio importante. En lugar de tratar la función como una declaración estándar, la función se trata como una expresión de función.

**Nota:** La forma más fácil de distinguir declaración vs. expresión es la posición de la palabra "function" en la sentencia (no solo una línea, sino una sentencia distinta). Si "function" es lo primerísimo en la sentencia, entonces es una declaración de función. De lo contrario, es una expresión de función.

La diferencia clave que podemos observar aquí entre una declaración de función y una expresión de función se relaciona con dónde su nombre está vinculado como identificador.

Compara los dos fragmentos anteriores. En el primer fragmento, el nombre `foo` está vinculado en el scope contenedor, y lo llamamos directamente con `foo()`. En el segundo fragmento, el nombre `foo` no está vinculado en el scope contenedor, sino que está vinculado solo dentro de su propia función.

En otras palabras, `(function foo(){ .. })` como expresión significa que el identificador `foo` se encuentra *solo* en el scope donde `..` indica, no en el scope exterior. Ocultar el nombre `foo` dentro de sí mismo significa que no contamina el scope contenedor innecesariamente.

### Anónimas vs. Nombradas

Probablemente estás más familiarizado con las expresiones de función como parámetros de callback, como:

```js
setTimeout( function(){
	console.log("I waited 1 second!");
}, 1000 );
```

Esto se llama "expresión de función anónima", porque `function()...` no tiene un identificador de nombre en ella. Las expresiones de función pueden ser anónimas, pero las declaraciones de función no pueden omitir el nombre —eso sería gramática JS ilegal.

Las expresiones de función anónimas son rápidas y fáciles de escribir, y muchas bibliotecas y herramientas tienden a fomentar este estilo idiomático de código. Sin embargo, tienen varios inconvenientes a considerar:

1. Las funciones anónimas no tienen un nombre útil para mostrar en las trazas de pila, lo que puede dificultar la depuración.

2. Sin un nombre, si la función necesita referirse a sí misma, para recursión, etc., se requiere desafortunadamente la referencia **en desuso** `arguments.callee`. Otro ejemplo de necesitar auto-referencia es cuando una función manejadora de eventos quiere desvincularse a sí misma después de dispararse.

3. Las funciones anónimas omiten un nombre que a menudo es útil para proporcionar código más legible/comprensible. Un nombre descriptivo ayuda a auto-documentar el código en cuestión.

Las **expresiones de función en línea** son poderosas y útiles —la cuestión de anónimas vs. nombradas no resta a eso. Proporcionar un nombre para tu expresión de función aborda bastante efectivamente todos estos inconvenientes, pero no tiene desventajas tangibles. La mejor práctica es nombrar siempre tus expresiones de función:

```js
setTimeout( function timeoutHandler(){ // <-- Look, I have a name!
	console.log( "I waited 1 second!" );
}, 1000 );
```

### Invocando Expresiones de Función Inmediatamente

```js
var a = 2;

(function foo(){

	var a = 3;
	console.log( a ); // 3

})();

console.log( a ); // 2
```

Ahora que tenemos una función como una expresión en virtud de envolverla en un par `( )`, podemos ejecutar esa función añadiendo otro `()` al final, como `(function foo(){ .. })()`. El primer par `( )` que lo contiene convierte la función en una expresión, y el segundo `()` ejecuta la función.

Este patrón es tan común que hace algunos años la comunidad acordó un término para él: **IIFE**, que significa **I**nmediately **I**nvoked **F**unction **E**xpression (Expresión de Función Inmediatamente Invocada).

Por supuesto, las IIFEs no necesitan nombres, necesariamente —la forma más común de IIFE es usar una expresión de función anónima. Aunque ciertamente menos común, nombrar una IIFE tiene todos los beneficios mencionados anteriormente sobre las expresiones de función anónimas, por lo que es una buena práctica adoptar.

```js
var a = 2;

(function IIFE(){

	var a = 3;
	console.log( a ); // 3

})();

console.log( a ); // 2
```

Hay una ligera variación en la forma tradicional de IIFE, que algunos prefieren: `(function(){ .. }())`. Mira de cerca para ver la diferencia. En la primera forma, la expresión de función está envuelta en `( )`, y luego el par `()` de invocación está afuera inmediatamente después. En la segunda forma, el par `()` de invocación se mueve dentro del par externo `( )` que lo envuelve.

Estas dos formas son idénticas en funcionalidad. **Es puramente una elección estilística la que prefieres.**

Otra variación en las IIFEs que es bastante común es usar el hecho de que son, de hecho, solo llamadas de función, y pasar argumento(s).

Por ejemplo:

```js
var a = 2;

(function IIFE( global ){

	var a = 3;
	console.log( a ); // 3
	console.log( global.a ); // 2

})( window );

console.log( a ); // 2
```

Pasamos la referencia al objeto `window`, pero nombramos el parámetro `global`, de modo que tengamos una delineación estilística clara para referencias globales vs. no globales. Por supuesto, puedes pasar cualquier cosa del scope contenedor que quieras, y puedes nombrar el o los parámetros como mejor te parezca. Esto es en su mayoría solo una elección estilística.

Otra aplicación de este patrón aborda la (menor y específica) preocupación de que el identificador predeterminado `undefined` podría tener su valor incorrectamente sobrescrito, causando resultados inesperados. Al nombrar un parámetro `undefined`, pero sin pasar ningún valor para ese argumento, podemos garantizar que el identificador `undefined` sea en realidad el valor undefined en un bloque de código:

```js
undefined = true; // setting a land-mine for other code! avoid!

(function IIFE( undefined ){

	var a;
	if (a === undefined) {
		console.log( "Undefined is safe here!" );
	}

})();
```

Todavía otra variación de la IIFE invierte el orden de las cosas, donde la función a ejecutar se da segundo, *después* de la invocación y los parámetros a pasarle. Este patrón se usa en el proyecto UMD (Universal Module Definition). Algunas personas lo encuentran un poco más limpio de entender, aunque es ligeramente más verboso.

```js
var a = 2;

(function IIFE( def ){
	def( window );
})(function def( global ){

	var a = 3;
	console.log( a ); // 3
	console.log( global.a ); // 2

});
```

La expresión de función `def` se define en la segunda mitad del fragmento, y luego se pasa como parámetro (también llamado `def`) a la función `IIFE` definida en la primera mitad del fragmento. Finalmente, el parámetro `def` (la función) es invocado, pasando `window` como el parámetro `global`.

## Bloques Como Scopes

Si bien las funciones son la unidad de scope más común, y ciertamente la más extendida de los enfoques de diseño en la mayoría del JS en circulación, otras unidades de scope son posibles, y el uso de estas otras unidades de scope puede llevar a un código aún mejor y más fácil de mantener.

Muchos lenguajes distintos de JavaScript admiten el Scope de Bloque, por lo que los desarrolladores de esos lenguajes están acostumbrados a la mentalidad, mientras que aquellos que principalmente solo han trabajado en JavaScript pueden encontrar el concepto ligeramente ajeno.

Pero incluso si nunca has escrito una sola línea de código en estilo de scope de bloque, probablemente estás familiarizado con este idioma extremadamente común en JavaScript:

```js
for (var i=0; i<10; i++) {
	console.log( i );
}
```

Declaramos la variable `i` directamente dentro del encabezado del bucle for, lo más probable porque nuestra *intención* es usar `i` solo dentro del contexto de ese bucle for, e ignoramos esencialmente el hecho de que la variable en realidad se alcanza a sí misma al scope contenedor (función o global).

De eso es de lo que trata el scope de bloque. Declarar variables tan cerca como sea posible, tan localmente como sea posible, de donde se usarán. Otro ejemplo:

```js
var foo = true;

if (foo) {
	var bar = foo * 2;
	bar = something( bar );
	console.log( bar );
}
```

Estamos usando una variable `bar` solo en el contexto de la sentencia if, por lo que tiene un tipo de sentido que la declaremos dentro del bloque if. Sin embargo, donde declaramos variables no es relevante cuando se usa `var`, porque siempre pertenecerán al scope contenedor. Este fragmento es esencialmente scope de bloque "falso", por razones estilísticas, y depende de la auto-aplicación para no usar accidentalmente `bar` en otro lugar en ese scope.

El scope de bloque es una herramienta para extender el anterior "Principio de Mínima ~~Privilegio~~ Exposición" [^note-leastprivilege] de ocultar información en funciones a ocultar información en bloques de nuestro código.

Considera el ejemplo del bucle for de nuevo:

```js
for (var i=0; i<10; i++) {
	console.log( i );
}
```

¿Por qué contaminar todo el scope de una función con la variable `i` que solo va a ser usada (o solo *debería serlo*, al menos) para el bucle for?

Pero más importante aún, los desarrolladores pueden preferir *revisarse a sí mismos* contra el (re)uso accidental de variables fuera de su propósito previsto, como recibir un error sobre una variable desconocida si intentas usarla en el lugar equivocado. El scope de bloque (si fuera posible) para la variable `i` haría que `i` estuviera disponible solo para el bucle for, causando un error si se accede a `i` en otro lugar de la función. Esto ayuda a garantizar que las variables no se reutilicen de formas confusas o difíciles de mantener.

Sin embargo, la triste realidad es que, en la superficie, JavaScript no tiene ninguna facilidad para el scope de bloque.

Eso es, hasta que excavas un poco más.

### `with`

Aprendimos sobre `with` en el Capítulo 2. Aunque es una construcción mal vista, *es* un ejemplo de (una forma de) scope de bloque, en que el scope que se crea a partir del objeto solo existe durante la duración de esa sentencia `with`, y no en el scope contenedor.

### `try/catch`

Es un hecho *muy* poco conocido que JavaScript en ES3 especificó que la declaración de variable en la cláusula `catch` de un `try/catch` tenga scope de bloque al bloque `catch`.

Por ejemplo:

```js
try {
	undefined(); // illegal operation to force an exception!
}
catch (err) {
	console.log( err ); // works!
}

console.log( err ); // ReferenceError: `err` not found
```

Como puedes ver, `err` existe solo en la cláusula `catch`, y lanza un error cuando intentas referenciarlo en otro lugar.

**Nota:** Si bien este comportamiento ha sido especificado y es cierto en prácticamente todos los entornos JS estándar (excepto quizás el IE antiguo), muchos linters parecen seguir quejándose si tienes dos o más cláusulas `catch` en el mismo scope que declaran cada una su variable de error con el mismo nombre de identificador. Esto no es en realidad una re-definición, ya que las variables están seguramente con scope de bloque, pero los linters parecen, molestos, quejarse de este hecho.

Para evitar estas advertencias innecesarias, algunos desarrolladores nombrarán sus variables `catch` como `err1`, `err2`, etc. Otros desarrolladores simplemente desactivarán la comprobación de linting para nombres de variables duplicados.

La naturaleza de scope de bloque de `catch` puede parecer un hecho académico inútil, pero consulta el Apéndice B para más información sobre cuán útil podría ser.

### `let`

Hasta ahora, hemos visto que JavaScript solo tiene algunos comportamientos extraños y específicos que exponen la funcionalidad de scope de bloque. Si eso fuera todo lo que teníamos, y *lo fue* por muchos, muchos años, entonces el scope de bloque no sería terriblemente útil para el desarrollador JavaScript.

Afortunadamente, ES6 cambia eso, e introduce una nueva palabra clave `let` que se sienta junto a `var` como otra forma de declarar variables.

La palabra clave `let` adjunta la declaración de variable al scope de cualquier bloque (comúnmente un par `{ .. }`) en el que está contenida. En otras palabras, `let` secuestra implícitamente el scope de cualquier bloque para su declaración de variable.

```js
var foo = true;

if (foo) {
	let bar = foo * 2;
	bar = something( bar );
	console.log( bar );
}

console.log( bar ); // ReferenceError
```

Usar `let` para adjuntar una variable a un bloque existente es algo implícito. Puede confundirte si no estás prestando mucha atención a qué bloques tienen variables con scope en ellos, y tienes el hábito de mover bloques, envolverlos en otros bloques, etc., a medida que desarrollas y evolucionas el código.

Crear bloques explícitos para el scope de bloque puede abordar algunas de estas preocupaciones, haciendo más obvio dónde están vinculadas las variables y dónde no. Por lo general, el código explícito es preferible al código implícito o sutil. Este estilo de scope de bloque explícito es fácil de lograr, y encaja más naturalmente con cómo funciona el scope de bloque en otros lenguajes:

```js
var foo = true;

if (foo) {
	{ // <-- explicit block
		let bar = foo * 2;
		bar = something( bar );
		console.log( bar );
	}
}

console.log( bar ); // ReferenceError
```

Podemos crear un bloque arbitrario para que `let` se vincule simplemente incluyendo un par `{ .. }` en cualquier lugar donde una sentencia sea gramática válida. En este caso, hemos creado un bloque explícito *dentro* de la sentencia if, que puede ser más fácil como un bloque completo para moverlo más tarde en la refactorización, sin afectar la posición y la semántica de la sentencia if contenedora.

**Nota:** Para otra forma de expresar scopes de bloque explícitos, consulta el Apéndice B.

En el Capítulo 4, abordaremos el hoisting, que habla de que las declaraciones se toman como existentes para todo el scope en el que ocurren.

Sin embargo, las declaraciones hechas con `let` *no* harán hoisting a todo el scope del bloque en el que aparecen. Tales declaraciones no "existirán" observablemente en el bloque hasta la sentencia de declaración.

```js
{
   console.log( bar ); // ReferenceError!
   let bar = 2;
}
```

#### Recolección de Basura

Otra razón por la que el scope de bloque es útil se relaciona con los closures y la recolección de basura para recuperar memoria. Ilustraremos brevemente aquí, pero el mecanismo de closure se explica en detalle en el Capítulo 5.

Considera:

```js
function process(data) {
	// do something interesting
}

var someReallyBigData = { .. };

process( someReallyBigData );

var btn = document.getElementById( "my_button" );

btn.addEventListener( "click", function click(evt){
	console.log("button clicked");
}, /*capturingPhase=*/false );
```

La función callback del manejador de clicks `click` no necesita la variable `someReallyBigData` en absoluto. Eso significa que, en teoría, después de que se ejecute `process(..)`, la gran estructura de datos con uso intensivo de memoria podría ser recolectada como basura. Sin embargo, es bastante probable (aunque dependiente de la implementación) que el motor JS todavía tenga que mantener la estructura, ya que la función `click` tiene un closure sobre todo el scope.

El scope de bloque puede abordar esta preocupación, haciendo más claro para el motor que no necesita mantener `someReallyBigData` alrededor:

```js
function process(data) {
	// do something interesting
}

// anything declared inside this block can go away after!
{
	let someReallyBigData = { .. };

	process( someReallyBigData );
}

var btn = document.getElementById( "my_button" );

btn.addEventListener( "click", function click(evt){
	console.log("button clicked");
}, /*capturingPhase=*/false );
```

Declarar bloques explícitos para que las variables se vinculen localmente es una herramienta poderosa que puedes agregar a tu caja de herramientas de código.

#### Bucles con `let`

Un caso particular donde `let` brilla es en el caso del bucle for como discutimos anteriormente.

```js
for (let i=0; i<10; i++) {
	console.log( i );
}

console.log( i ); // ReferenceError
```

No solo `let` en el encabezado del bucle for vincula el `i` al cuerpo del bucle for, sino que de hecho **lo re-vincula** a cada *iteración* del bucle, asegurándose de re-asignarle el valor del final de la iteración anterior del bucle.

Aquí hay otra forma de ilustrar el comportamiento de vinculación por iteración que ocurre:

```js
{
	let j;
	for (j=0; j<10; j++) {
		let i = j; // re-bound for each iteration!
		console.log( i );
	}
}
```

La razón por la que esta vinculación por iteración es interesante quedará clara en el Capítulo 5 cuando discutamos los closures.

Debido a que las declaraciones `let` se adjuntan a bloques arbitrarios en lugar de al scope de la función contenedora (o global), puede haber problemas donde el código existente tiene una dependencia oculta en las declaraciones `var` con scope de función, y reemplazar el `var` con `let` puede requerir cuidado adicional al refactorizar el código.

Considera:

```js
var foo = true, baz = 10;

if (foo) {
	var bar = 3;

	if (baz > bar) {
		console.log( baz );
	}

	// ...
}
```

Este código es bastante fácilmente refactorizable como:

```js
var foo = true, baz = 10;

if (foo) {
	var bar = 3;

	// ...
}

if (baz > bar) {
	console.log( baz );
}
```

Pero, ten cuidado con tales cambios cuando uses variables con scope de bloque:

```js
var foo = true, baz = 10;

if (foo) {
	let bar = 3;

	if (baz > bar) { // <-- don't forget `bar` when moving!
		console.log( baz );
	}
}
```

Consulta el Apéndice B para un estilo alternativo (más explícito) de scope de bloque que puede proporcionar código más fácil de mantener/refactorizar que sea más robusto a estos escenarios.

### `const`

Además de `let`, ES6 introduce `const`, que también crea una variable con scope de bloque, pero cuyo valor es fijo (constante). Cualquier intento de cambiar ese valor en un momento posterior resulta en un error.

```js
var foo = true;

if (foo) {
	var a = 2;
	const b = 3; // block-scoped to the containing `if`

	a = 3; // just fine!
	b = 4; // error!
}

console.log( a ); // 3
console.log( b ); // ReferenceError!
```

## Repaso (TL;DR)

Las funciones son la unidad de scope más común en JavaScript. Las variables y funciones que se declaran dentro de otra función están esencialmente "ocultas" a cualquiera de los "scopes" contenedores, que es un principio de diseño intencional del buen software.

Pero las funciones de ninguna manera son la única unidad de scope. El scope de bloque se refiere a la idea de que las variables y funciones pueden pertenecer a un bloque arbitrario (generalmente, cualquier par `{ .. }`) de código, en lugar de solo a la función contenedora.

Empezando con ES3, la estructura `try/catch` tiene scope de bloque en la cláusula `catch`.

En ES6, la palabra clave `let` (una prima de la palabra clave `var`) se introduce para permitir declaraciones de variables en cualquier bloque arbitrario de código. `if (..) { let a = 2; }` declarará una variable `a` que esencialmente secuestra el scope del bloque `{ .. }` del `if` y se adjunta allí.

Aunque algunos parecen creer que sí, el scope de bloque no debe tomarse como un reemplazo absoluto del scope `var` de función. Ambas funcionalidades coexisten, y los desarrolladores pueden y deben usar técnicas tanto de scope de función como de scope de bloque donde sea apropiado respectivamente para producir código mejor, más legible/mantenible.

[^note-leastprivilege]: [Principio de Mínimo Privilegio](http://en.wikipedia.org/wiki/Principle_of_least_privilege)
