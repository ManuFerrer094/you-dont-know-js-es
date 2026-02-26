# No Sabes JS: Scope y Closures
# Capítulo 4: Hoisting

A estas alturas, deberías estar bastante cómodo con la idea de scope, y cómo las variables se adjuntan a los distintos niveles de scope dependiendo de dónde y cómo se declaran. Tanto el scope de función como el scope de bloque se comportan con las mismas reglas en este sentido: cualquier variable declarada dentro de un scope se adjunta a ese scope.

Pero hay un detalle sutil sobre cómo se adjuntan las declaraciones a los scopes que funcionan, ante lo que hemos omitido explicar completamente. Exploremos ese tema ahora.

## ¿El Huevo o la Gallina?

Hay una tentación de pensar en todo el código en un programa JavaScript como interpretado línea por línea, de arriba hacia abajo, a medida que el programa se ejecuta. Aunque eso es sustancialmente verdad, hay una parte de esa suposición que puede llevarte a pensar incorrectamente sobre tu programa.

Considera este código:

```js
a = 2;

var a;

console.log( a );
```

¿Qué esperas que imprima la sentencia `console.log(..)`? Muchos desarrolladores esperarían `undefined`, ya que la sentencia `var a` viene *después* de `a = 2`, y parecería natural asumir que la variable se redefine y, por lo tanto, toma el valor predeterminado de `undefined`. Sin embargo, la salida será `2`.

Considera otro fragmento de código:

```js
console.log( a );

var a = 2;
```

Puedes estar tentado a asumir que, ya que el fragmento anterior exhibió un comportamiento algo *de arriba hacia abajo*, quizás aquí, el acceso a `a` antes de que sea declarado resultará en un `ReferenceError`. Sin embargo, la salida será `undefined`.

**¿Qué está pasando entonces?** Parece que tenemos una cuestión sobre el huevo y la gallina. ¿Qué viene primero, la declaración ("huevo"), o la asignación ("gallina")?

## El Compilador Ataca de Nuevo

La respuesta radica en nuestra explicación del Capítulo 1 sobre compiladores. Recuerda que el Motor compilará en realidad tu código JavaScript antes de interpretarlo. Parte de la fase de compilación fue encontrar y asociar todas las declaraciones con sus scopes apropiados. El Capítulo 2 nos mostró que esto es el núcleo del Scope Léxico.

Entonces, la mejor manera de pensar en las cosas es que todas las declaraciones, tanto variables como funciones, se procesan primero, antes de que se ejecute cualquier parte de tu código.

Cuando ves `var a = 2;`, probablemente piensas en eso como una sentencia. Pero JavaScript lo piensa como dos sentencias: `var a;` y `a = 2;`. La primera sentencia, la declaración, se procesa durante la fase de compilación. La segunda sentencia, la asignación, se deja **en su lugar** para la fase de ejecución.

Entonces nuestro primer fragmento debería pensarse como si se manejara de esta manera:

```js
var a;
```
```js
a = 2;

console.log( a );
```

...donde la primera parte es la compilación y la segunda parte es la ejecución.

De manera similar, nuestro segundo fragmento de código en realidad se procesa como:

```js
var a;
```
```js
console.log( a );

a = 2;
```

Así que, ¡una forma metafórica de pensar sobre este proceso es que las declaraciones de variables y funciones son "movidas" desde donde aparecen en el flujo del código hacia la parte superior del código. Esto da lugar al nombre "Hoisting".

En otras palabras, **el huevo (la declaración) viene antes que la gallina (la asignación)**.

**Nota:** Solo las declaraciones mismas hacen hoisting, no las asignaciones ni otra lógica ejecutable. Si el hoisting tuviera que reorganizar la lógica ejecutable de nuestro código, eso podría causar estragos.

```js
foo();

function foo() {
	console.log( a ); // undefined

	var a = 2;
}
```

La declaración de función para `foo` hace hoisting de tal manera que la llamada en la primera línea es capaz de ejecutarse.

También es importante notar que el hoisting es **por scope**. Entonces, si bien nuestra explicación anterior se centró en el scope global, la función `foo(..)` en sí misma exhibe que `var a` hace hoisting al principio de `foo(..)` (no, obviamente, al principio del programa). Entonces el programa puede quizás interpretarse más precisamente como:

```js
function foo() {
	var a;

	console.log( a ); // undefined

	a = 2;
}

foo();
```

Las declaraciones de función hacen hoisting, como acabamos de ver. Pero las expresiones de función no.

```js
foo(); // not ReferenceError, but TypeError!

var foo = function bar() {
	// ...
};
```

El identificador de variable `foo` hace hoisting y se adjunta al scope global (`window`) del programa, por lo que `foo()` no falla como un `ReferenceError`. Pero `foo` aún no tiene valor (lo haría si hubiera sido una declaración de función real en lugar de una expresión). Entonces, `foo()` está intentando invocar el valor `undefined`, que es una operación `TypeError` ilegal.

También, recuerda que incluso aunque es una expresión de función nombrada, el nombre del identificador no está disponible en el scope contenedor:

```js
foo(); // TypeError
bar(); // ReferenceError

var foo = function bar() {
	// ...
};
```

Este fragmento puede interpretarse más precisamente (con hoisting) como:

```js
var foo;

foo(); // TypeError
bar(); // ReferenceError

foo = function() {
	var bar = ...self...
	// ...
}
```

## Las Funciones Primero

Tanto las declaraciones de función como las de variable hacen hoisting. Pero un detalle sutil (que *puede* aparecer en código con múltiples declaraciones "duplicadas") es que las funciones hacen hoisting primero, y luego las variables.

Considera:

```js
foo(); // 1

var foo;

function foo() {
	console.log( 1 );
}

foo = function() {
	console.log( 2 );
};
```

`1` se imprime en lugar de `2`! Este fragmento se interpreta por el Motor como:

```js
function foo() {
	console.log( 1 );
}

foo(); // 1

foo = function() {
	console.log( 2 );
};
```

Observa que `var foo` era la declaración duplicada (y, por lo tanto, ignorada), aunque venía antes de la declaración `function foo()...`, porque las declaraciones de función hacen hoisting antes de las variables normales.

Aunque múltiples/duplicadas declaraciones `var` son efectivamente ignoradas, las declaraciones de función subsiguientes *sí* sobrescriben a las anteriores.

```js
foo(); // 3

function foo() {
	console.log( 1 );
}

var foo = function() {
	console.log( 2 );
};

function foo() {
	console.log( 3 );
}
```

Aunque esto suena como si fuera solo un asunto académico, resalta el hecho de que las declaraciones de función duplicadas en el mismo scope son realmente una mala idea y a menudo conduce a resultados confusos.

Las declaraciones de función que aparecen dentro de bloques normales típicamente hacen hoisting al scope contenedor, en lugar de ser condicionales como implica este código:

```js
foo(); // "b"

var a = true;
if (a) {
   function foo() { console.log( "a" ); }
}
else {
   function foo() { console.log( "b" ); }
}
```

Sin embargo, es importante notar que este comportamiento no es confiable y está sujeto a cambios en versiones futuras de JavaScript, por lo que es mejor evitar declarar funciones en bloques.

## Repaso (TL;DR)

Podemos ser tentados a ver `var a = 2;` como una sola sentencia, pero el Motor de JavaScript la ve como dos sentencias: `var a;` y `a = 2;`. La primera sentencia, la declaración, se procesa durante la fase de compilación. La segunda sentencia, la asignación, se deja en su lugar para durante la fase de ejecución.

Lo que esto conduce es a que todas las declaraciones en un scope, independientemente de dónde aparecen, se procesan *primero* antes de que se ejecute el código mismo. Puedes visualizar esto como declaraciones que son "movidas" a la parte superior de sus respectivos scopes, a lo que llamamos "hoisting".

Las declaraciones mismas hacen hoisting, pero las asignaciones, incluso las asignaciones de expresiones de función, *no* hacen hoisting.

Ten cuidado con las declaraciones duplicadas, especialmente mezclando declaraciones de función normal con declaraciones de var —¡hay un peligro real allí si lo haces!
