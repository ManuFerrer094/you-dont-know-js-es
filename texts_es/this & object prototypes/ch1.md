# You Don't Know JS: *this* & Prototipos de Objetos
# Capítulo 1: ¿`this` O Eso?

Uno de los mecanismos más confusos en JavaScript es la palabra clave `this`. Es una palabra clave identificadora especial que se define automáticamente en el ámbito de cada función, pero a qué exactamente se refiere desconciertan incluso a desarrolladores JavaScript experimentados.

> Cualquier tecnología suficientemente *avanzada* es indistinguible de la magia. -- Arthur C. Clarke

El mecanismo `this` de JavaScript en realidad no es *tan* avanzado, pero los desarrolladores a menudo parafrasean esa cita en su propia mente insertando "complejo" o "confuso", y no hay duda de que sin una comprensión clara, `this` puede parecer simplemente mágico en *tu* confusión.

**Nota:** La palabra "this" es un pronombre terriblemente común en el discurso general. Por lo tanto, puede ser muy difícil, especialmente verbalmente, determinar si estamos usando "this" como pronombre o usándolo para referirnos al identificador de palabra clave real. Para mayor claridad, siempre usaré `this` para referirme a la palabra clave especial, y "this" o *this* o this de otra manera.

## ¿Por Qué `this`?

Si el mecanismo `this` es tan confuso, incluso para desarrolladores JavaScript experimentados, uno puede preguntarse ¿por qué es siquiera útil? ¿Es más problema de lo que vale? Antes de saltar al *cómo*, deberíamos examinar el *por qué*.

Intentemos ilustrar la motivación y utilidad de `this`:

```js
function identify() {
	return this.name.toUpperCase();
}

function speak() {
	var greeting = "Hello, I'm " + identify.call( this );
	console.log( greeting );
}

var me = {
	name: "Kyle"
};

var you = {
	name: "Reader"
};

identify.call( me ); // KYLE
identify.call( you ); // READER

speak.call( me ); // Hello, I'm KYLE
speak.call( you ); // Hello, I'm READER
```

Si el *cómo* de este fragmento te confunde, ¡no te preocupes! Llegaremos a eso en breve. Solo deja esas preguntas a un lado brevemente para que podamos investigar el *por qué* más claramente.

Este fragmento de código permite que las funciones `identify()` y `speak()` se reutilicen contra múltiples objetos de *contexto* (`me` y `you`), en lugar de necesitar una versión separada de la función para cada objeto.

En lugar de depender de `this`, podrías haber pasado explícitamente un objeto de contexto tanto a `identify()` como a `speak()`.

```js
function identify(context) {
	return context.name.toUpperCase();
}

function speak(context) {
	var greeting = "Hello, I'm " + identify( context );
	console.log( greeting );
}

identify( you ); // READER
speak( me ); // Hello, I'm KYLE
```

Sin embargo, el mecanismo `this` proporciona una forma más elegante de "pasar" implícitamente una referencia de objeto, llevando a un diseño de API más limpio y una reutilización más fácil.

Cuanto más complejo sea tu patrón de uso, más claramente verás que pasar contexto como un parámetro explícito es a menudo más desordenado que pasar un contexto `this`. Cuando exploremos objetos y prototipos, verás la utilidad de una colección de funciones siendo capaces de referenciar automáticamente el objeto de contexto apropiado.

## Confusiones

Pronto comenzaremos a explicar cómo `this` *realmente* funciona, pero primero debemos disipar algunos conceptos erróneos sobre cómo *no* funciona realmente.

El nombre "this" crea confusión cuando los desarrolladores intentan pensar en él demasiado literalmente. Hay dos significados que a menudo se asumen, pero ambos son incorrectos.

### Sí Mismo

La primera tentación común es asumir que `this` se refiere a la función misma. Esa es una inferencia gramatical razonable, al menos.

¿Por qué querrías referirte a una función desde dentro de sí misma? Las razones más comunes serían cosas como recursión (llamar a una función desde dentro de sí misma) o tener un manejador de eventos que pueda desvincularse a sí mismo cuando se llama por primera vez.

Los desarrolladores nuevos en los mecanismos de JS a menudo piensan que referenciar la función como un objeto (¡todas las funciones en JavaScript son objetos!) te permite almacenar *estado* (valores en propiedades) entre llamadas a funciones. Aunque esto ciertamente es posible y tiene algunos usos limitados, el resto del libro expondrá muchos otros patrones para *mejores* lugares para almacenar estado además del objeto función.

Pero por un momento, exploraremos ese patrón, para ilustrar cómo `this` no permite que una función obtenga una referencia a sí misma como podríamos haber asumido.

Considera el siguiente código, donde intentamos rastrear cuántas veces una función (`foo`) fue llamada:

```js
function foo(num) {
	console.log( "foo: " + num );

	// llevar cuenta de cuántas veces se llama a `foo`
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// ¿cuántas veces se llamó a `foo`?
console.log( foo.count ); // 0 -- ¿¡QUÉ!?
```

`foo.count` *todavía* es `0`, aunque las cuatro sentencias `console.log` indican claramente que `foo(..)` fue de hecho llamada cuatro veces. La frustración proviene de una interpretación *demasiado literal* de lo que `this` (en `this.count++`) significa.

Cuando el código ejecuta `foo.count = 0`, efectivamente está añadiendo una propiedad `count` al objeto función `foo`. Pero para la referencia `this.count` dentro de la función, `this` de hecho no está apuntando *en absoluto* a ese objeto función, y así aunque los nombres de propiedad son los mismos, los objetos raíz son diferentes, y la confusión se produce.

**Nota:** Un desarrollador responsable *debería* preguntar en este punto, "Si estaba incrementando una propiedad `count` pero no era la que esperaba, ¿cuál `count` *estaba* incrementando?" De hecho, si profundizara más, descubriría que accidentalmente creó una variable global `count` (ver Capítulo 2 para saber *cómo* sucedió eso!), y actualmente tiene el valor `NaN`. Por supuesto, una vez que identifica este resultado peculiar, entonces tiene todo otro conjunto de preguntas: "¿Cómo fue global, y por qué terminó en `NaN` en lugar de algún valor de conteo apropiado?" (ver Capítulo 2).

En lugar de detenerse en este punto e investigar por qué la referencia `this` no parece comportarse como se *esperaba*, y responder esas preguntas difíciles pero importantes, muchos desarrolladores simplemente evitan el problema por completo, y hackean hacia alguna otra solución, como crear otro objeto para contener la propiedad `count`:

```js
function foo(num) {
	console.log( "foo: " + num );

	// llevar cuenta de cuántas veces se llama a `foo`
	data.count++;
}

var data = {
	count: 0
};

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// ¿cuántas veces se llamó a `foo`?
console.log( data.count ); // 4
```

Aunque es cierto que este enfoque "resuelve" el problema, desafortunadamente simplemente ignora el problema real -- la falta de comprensión de lo que `this` significa y cómo funciona -- y en su lugar recurre a la zona de confort de un mecanismo más familiar: el ámbito léxico.

**Nota:** El ámbito léxico es un mecanismo perfectamente bueno y útil; no estoy menospreciando su uso, de ninguna manera (ver el título *"Scope & Closures"* de esta serie de libros). Pero constantemente *adivinar* cómo usar `this`, y usualmente estar *equivocado*, no es una buena razón para retirarse al ámbito léxico y nunca aprender *por qué* `this` te elude.

Para referenciar un objeto función desde dentro de sí mismo, `this` por sí solo típicamente será insuficiente. Generalmente necesitas una referencia al objeto función a través de un identificador léxico (variable) que apunte a él.

Considera estas dos funciones:

```js
function foo() {
	foo.count = 4; // `foo` se refiere a sí mismo
}

setTimeout( function(){
	// función anónima (sin nombre), no puede
	// referirse a sí misma
}, 10 );
```

En la primera función, llamada "función nombrada", `foo` es una referencia que puede usarse para referirse a la función desde dentro de sí misma.

Pero en el segundo ejemplo, el callback de función pasado a `setTimeout(..)` no tiene identificador de nombre (llamada "función anónima"), así que no hay forma apropiada de referirse al objeto función mismo.

**Nota:** La referencia antigua pero ahora obsoleta y desaconsejada `arguments.callee` dentro de una función *también* apunta al objeto función de la función que se está ejecutando actualmente. Esta referencia es típicamente la única forma de acceder al objeto de una función anónima desde dentro de sí misma. Sin embargo, el mejor enfoque es evitar el uso de funciones anónimas por completo, al menos para aquellas que requieren auto-referencia, y en su lugar usar una función nombrada (expresión). `arguments.callee` está obsoleto y no debería usarse.

Así que otra solución a nuestro ejemplo en ejecución habría sido usar el identificador `foo` como una referencia al objeto función en cada lugar, y no usar `this` en absoluto, lo cual *funciona*:

```js
function foo(num) {
	console.log( "foo: " + num );

	// llevar cuenta de cuántas veces se llama a `foo`
	foo.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		foo( i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// ¿cuántas veces se llamó a `foo`?
console.log( foo.count ); // 4
```

Sin embargo, ese enfoque similarmente esquiva la comprensión *real* de `this` y se basa enteramente en el ámbito léxico de la variable `foo`.

Otra forma más de abordar el problema es forzar a `this` a que realmente apunte al objeto función `foo`:

```js
function foo(num) {
	console.log( "foo: " + num );

	// llevar cuenta de cuántas veces se llama a `foo`
	// Nota: `this` ES realmente `foo` ahora, basado en
	// cómo se llama a `foo` (ver abajo)
	this.count++;
}

foo.count = 0;

var i;

for (i=0; i<10; i++) {
	if (i > 5) {
		// usando `call(..)`, nos aseguramos de que `this`
		// apunte al objeto función (`foo`) mismo
		foo.call( foo, i );
	}
}
// foo: 6
// foo: 7
// foo: 8
// foo: 9

// ¿cuántas veces se llamó a `foo`?
console.log( foo.count ); // 4
```

**En lugar de evitar `this`, lo abrazamos.** Explicaremos en un momento *cómo* tales técnicas funcionan mucho más completamente, ¡así que no te preocupes si todavía estás un poco confundido!

### Su Ámbito

El siguiente concepto erróneo más común sobre el significado de `this` es que de alguna manera se refiere al ámbito de la función. Es una pregunta engañosa, porque en un sentido hay algo de verdad, pero en el otro sentido, está bastante equivocado.

Para ser claros, `this` no se refiere, de ninguna manera, al **ámbito léxico** de una función. Es cierto que internamente, el ámbito es algo así como un objeto con propiedades para cada uno de los identificadores disponibles. Pero el "objeto" de ámbito no es accesible al código JavaScript. Es una parte interna de la implementación del *Motor*.

Considera código que intenta (¡y falla!) cruzar el límite y usar `this` para referirse implícitamente al ámbito léxico de una función:

```js
function foo() {
	var a = 2;
	this.bar();
}

function bar() {
	console.log( this.a );
}

foo(); //undefined
```

Hay más de un error en este fragmento. Aunque pueda parecer artificial, el código que ves es una destilación de código real del mundo real que ha sido intercambiado en foros de ayuda de la comunidad pública. Es una maravillosa (si no triste) ilustración de cuán equivocados pueden ser los supuestos sobre `this`.

Primero, se intenta referenciar la función `bar()` vía `this.bar()`. Es casi con certeza un *accidente* que funcione, pero explicaremos el *cómo* de eso en breve. La forma más natural de haber invocado `bar()` habría sido omitir el `this.` al inicio y simplemente hacer una referencia léxica al identificador.

Sin embargo, el desarrollador que escribe tal código está intentando usar `this` para crear un puente entre los ámbitos léxicos de `foo()` y `bar()`, para que `bar()` tenga acceso a la variable `a` en el ámbito interno de `foo()`. **Tal puente no es posible.** No puedes usar una referencia `this` para buscar algo en un ámbito léxico. No es posible.

Cada vez que te sientas intentando mezclar búsquedas de ámbito léxico con `this`, recuerda: *no hay puente*.

## ¿Qué Es `this`?

Habiendo dejado a un lado varias suposiciones incorrectas, dirijamos ahora nuestra atención a cómo realmente funciona el mecanismo `this`.

Dijimos antes que `this` no es un enlace en tiempo de escritura sino un enlace en tiempo de ejecución. Es contextual basado en las condiciones de la invocación de la función. El enlace de `this` no tiene nada que ver con dónde se declara una función, sino que tiene todo que ver con la manera en que la función es llamada.

Cuando una función se invoca, se crea un registro de activación, también conocido como contexto de ejecución. Este registro contiene información sobre desde dónde fue llamada la función (la pila de llamadas), *cómo* fue invocada la función, qué parámetros le fueron pasados, etc. Una de las propiedades de este registro es la referencia `this` que será usada durante la ejecución de esa función.

En el siguiente capítulo, aprenderemos a encontrar el **sitio de llamada** de una función para determinar cómo su ejecución enlazará `this`.

## Revisión (TL;DR)

El enlace de `this` es una fuente constante de confusión para el desarrollador JavaScript que no se toma el tiempo de aprender cómo el mecanismo realmente funciona. Adivinar, prueba y error, y copiar y pegar ciegamente de respuestas de Stack Overflow no es una forma efectiva o apropiada de aprovechar *este* importante mecanismo `this`.

Para aprender `this`, primero tienes que aprender lo que `this` *no* es, a pesar de cualquier suposición o concepto erróneo que pueda llevarte por esos caminos. `this` no es ni una referencia a la función misma, ni es una referencia al ámbito *léxico* de la función.

`this` es en realidad un enlace que se hace cuando una función es invocada, y *a qué* hace referencia está determinado enteramente por el sitio de llamada donde la función es llamada.
