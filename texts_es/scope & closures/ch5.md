# No Sabes JS: Scope y Closures
# Capítulo 5: Scope y Closures

La esperanza es una cosa poderosa. Es difícil ser más optimista que esto: el scope y los closures son el corazón de JavaScript.

Si bien hay una gran cantidad de contenido en línea sobre el scope y los closures, mucho de él en el mejor de los casos roza la superficie del tema, y en el peor de los casos expone ideas falsas y confusas. Este capítulo pretende abordar el tema de frente.

## Iluminación

Para aquellos con cierta experiencia en JavaScript, pero que quizás nunca han captado completamente el concepto de closures, *entender el closure* puede parecer un nirvana especial que uno debe esforzarse y sacrificarse para alcanzar.

Recuerdo cuando entendí los closures por primera vez, había una enorme sensación de iluminación. Pero ahora me doy cuenta de que los closures no son en realidad una herramienta misteriosa o especial que requiere un profundo conocimiento del lenguaje que debe ser conquistado o añadido a tu arsenal. Los closures suceden como resultado del escribir código que se apoya en el scope léxico. Simplemente suceden. Ni siquiera tienes que crear closures intencionalmente para aprovecharlos.

Los closures son de alguna manera un misterio en base a la detección e intención deficiente. *¿Qué misterio?* El misterio es que el Motor JS sí entiende y produce closures — no nosotros.

De hecho, los closures obstruyen el propósito del scope léxico, en cierto sentido. Pero antes de llegar demasiado lejos, necesitamos entender el scope un poco más.

## Lo Esencial

OK, suficiente entusiasmo y referencias a los 80s.

Aquí hay una definición directa de lo que necesitas saber para entender y reconocer los closures:

> El closure ocurre cuando una función es capaz de recordar y acceder a su scope léxico incluso cuando esa función se está ejecutando fuera de su scope léxico.

Veamos código para ilustrar esa definición:

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a ); // 2
	}

	bar();
}

foo();
```

Este código debería parecerse a un código familiar de nuestra discusión sobre el Scope Anidado. La función `bar()` tiene *acceso* a la variable `a` en el scope exterior que la contiene en virtud de las reglas de búsqueda de scope léxico (en este caso, es una referencia RHS de búsqueda).

¿Es esto "closure"?

Bueno, técnicamente... *quizás*. Pero por nuestra definición de lo-que-necesitas-saber anteriormente... *no exactamente*. Creo que la forma más precisa de explicar `bar()` referenciando `a` es a través de las reglas de búsqueda de scope léxico, y esas reglas son *solo* (¡una parte importante!) de lo que el closure es.

Desde una perspectiva puramente académica, lo que se dice del fragmento anterior es que la función `bar()` tiene un *closure* sobre el scope de `foo()` (e incluso, de hecho, sobre el resto de los scopes a los que tiene acceso, como el scope global en nuestro caso). Dicho de otra manera, se dice que `bar()` cierra sobre el scope de `foo()`. ¿Por qué? Porque `bar()` aparece anidada dentro de `foo()`. Simple y directo.

Pero, el closure definido de esta manera no es directamente *observable*, ni lo vemos como closure *exercised* en ese fragmento. Podemos claramente ver el scope léxico, pero el closure permanece como una especie de sombra misteriosa detrás del código.

Consideremos entonces el código que trae el closure a plena luz:

```js
function foo() {
	var a = 2;

	function bar() {
		console.log( a );
	}

	return bar;
}

var baz = foo();

baz(); // 2 -- Whoa, closure was just observed, man.
```

La función `bar()` tiene acceso de scope léxico al scope interior de `foo()`. Pero luego, tomamos `bar()`, la función en sí misma como un valor, y la *visszaadamos* (devolvemos). Después de que ejecutemos `foo()`, asignamos el valor que retornó (nuestra función interna `bar()`) a una variable llamada `baz`, y luego realmente invocamos `baz()`, que por supuesto es invocar nuestra función interna `bar()`, solo con un identificador de referencia diferente.

`bar()` se ejecuta, por supuesto. Pero en este caso, se ejecuta *fuera* de su scope léxico declarado.

Después de que `foo()` se ejecutó, normalmente esperaríamos que la totalidad del scope interior de `foo()` desapareciera, ya que sabemos que el Motor emplea un Recolector de Basura que viene y libera memoria una vez que ya no está en uso. Ya que parecería que el contenido de `foo()` ya no está siendo utilizado, parecería natural que debería ser considerado *ido*.

Pero la "magia" de los closures no deja que esto ocurra. Ese scope interior de hecho *todavía está* "en uso", y por lo tanto no desaparece. ¿Quién lo está utilizando? **La función `bar()` misma**.

En virtud de dónde fue declarada, `bar()` tiene un closure sobre scope léxico de `foo()`, que mantiene ese scope vivo para que `bar()` lo referencie en cualquier momento futuro.

**`bar()` todavía tiene una referencia al scope, y esa referencia se llama closure.**

Entonces, unos pocos microsegundos después, cuando se invoca la variable `baz` (invocando la función interna que inicialmente etiquetamos como `bar`), tiene debidamente *acceso* al scope léxico de tiempo de autor, así que puede acceder a la variable `a` como esperaríamos.

La función se invoca bien fuera de su scope léxico de tiempo de autor. **El closure** le permite a la función continuar accediendo al scope léxico en el que fue definida en tiempo de autor.

Por supuesto, cualquiera de las diversas formas en que las funciones pueden ser *transferidas* como valores y, de hecho, invocadas en otros lugares son todos ejemplos de observación/ejercicio de closure.

```js
function foo() {
	var a = 2;

	function baz() {
		console.log( a ); // 2
	}

	bar( baz );
}

function bar(fn) {
	fn(); // look ma, I saw closure!
}
```

Pasamos la función interna `baz` a `bar`, y llamamos a esa función interna (etiquetada como `fn`), y cuando lo hacemos, su closure sobre el scope interior de `foo()` se observa, accediendo a `a`.

Estas transferencias de función también pueden ser indirectas.

```js
var fn;

function foo() {
	var a = 2;

	function baz() {
		console.log( a );
	}

	fn = baz; // assign `baz` to global variable
}

function bar() {
	fn(); // look ma, I saw closure!
}

foo();

bar(); // 2
```

Independientemente del mecanismo que se use para *transportar* una función interna fuera del scope léxico en el que fue declarada, mantendrá una referencia de scope a donde fue declarada originalmente, y donde quiera que la ejecutemos, se ejercerá ese closure.

## Ahora Puedo Ver

Los fragmentos anteriores son de alguna manera artificiales y construidos para ilustrar el *uso del closure*. Pero te prometí algo más que un juguete nuevo. Te prometí que el closure es algo que está ya por todo tu código. Ahora déjame *verte*.

```js
function wait(message) {

	setTimeout( function timer(){
		console.log( message );
	}, 1000 );

}

wait( "Hello, closure!" );
```

Tomamos una función interna (llamada `timer`) y la pasamos a `setTimeout(..)`. Pero `timer` tiene un closure de scope sobre el scope de `wait(..)`, manteniendo de hecho una referencia a la variably `message`.

Un completo milisegundo después de que hemos ejecutado `wait(..)`, y su scope interior debería de otro modo estar muerto, esa función interna `timer` todavía tiene closure sobre ese scope.

Bien dentro de los intestinos del Motor, la utilidad incorporada `setTimeout(..)` tiene referencia a algún tipo de parámetro, probablemente llamado `fn` o `func` o algo así. El Motor va a invocar esa función, que está invocando nuestra función interna `timer`, y la referencia de scope léxico todavía está intacta.

**Closure.**

O, si eres de la fe jQuery (u otro framework JS, por ese asunto):

```js
function setupBot(name, selector) {
	$( selector ).click( function activator(){
		console.log( "Activating: " + name );
	} );
}

setupBot( "Closure Bot 1", "#bot_1" );
setupBot( "Closure Bot 2", "#bot_2" );
```

No sé qué tipo de código escribes, pero regularmente escribo código que es responsable de controlar una IA robótica de conquista del mundo entera, ¡así que esto es completamente realista!

En broma. Pero en serio, básicamente *siempre que* y *dondequiera que* tratas funciones (que acceden a sus propios scopes léxicos respectivos) como valores de primera clase y las pasas alrededor, es probable que veas esas funciones ejerciendo closure. Ya sean temporizadores, manejadores de eventos, solicitudes de Ajax, mensajes entre ventanas, web workers, u cualquier otra de las tareas asíncronas (o síncronas), cuando pasas una función *callback*, ¡prepárate para lanzar algunos closures alrededor!

**Nota:** El Capítulo 3 introdujo el patrón IIFE. Si bien a menudo se dice que la IIFE en sí misma es un ejemplo observado de closure, diferiría en cierta medida, según nuestra definición anterior.

```js
var a = 2;

(function IIFE(){
	console.log( a );
})();
```

Este código "funciona", pero no es estrictamente un closure observado. ¿Por qué? Porque la función (que aquí nombramos "IIFE") no se ejecuta fuera de su scope léxico. Todavía se invoca justo allí en el mismo scope en que fue declarada (el scope que contiene `a`). `a` se encuentra a través de la búsqueda normal de scope léxico, no de closure.

Aunque el closure podría técnicamente estar sucediendo en el tiempo de la declaración, *no* es estrictamente observable, y así, como dicen, es un árbol que cae en el bosque sin nadie que lo escuche.

Aunque una IIFE por sí sola no es un ejemplo de closure *observado*, crea definitivamente el scope, y es una de las herramientas más comunes que usamos para crear el scope que puede ser cerrado. Así que las IIFEs están de hecho íntimamente relacionadas con el closure, incluso si no ejercen el closure ellas mismas.

Baja este libro por un segundo, lector. Tengo una tarea para ti. Abre algo de tu código JavaScript reciente. Busca tus funciones-como-valores y considera dónde ya estás usando closure y quizás nunca lo habías sabido antes.

Te esperaré.

Ahora... ¡ves!

## Bucles + Closure

El ejemplo más canónico usado para ilustrar el closure involucra el humilde bucle for.

```js
for (var i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

**Nota:** Los linters a menudo se quejan cuando pones funciones dentro de bucles, porque los errores de no entender closures son **tan comunes** entre los desarrolladores. Explicaremos cómo hacer esto apropiadamente aquí, de manera que tu linter a menudo entienda lo que estás haciendo y sea más indulgente. Consulta el Capítulo 3 para `let`.

La promesa de este código es que los números "1", "2", .. "5" serán impresos, uno en cada momento, uno por segundo.

En realidad, si ejecutas este código, obtienes "6" impreso 5 veces, a intervalos de un segundo.

**¿Qué?**

En primer lugar, vamos a explicar de dónde viene `6`. La condición de terminación del bucle es cuando `i` es *no* `<=5`. La primera vez que eso es el caso es cuando `i` es `6`. Así que, la salida está reflejando el valor final de `i` después de que el bucle finaliza.

Esto realmente parece obvio en la segunda vista. Las funciones callback del timeout se están *ejecutando* bien después de que el bucle ha completado. De hecho, mientras el temporizador siempre se ejecuta *después* de cada iteración del bucle, incluso `setTimeout(.., 0)` en cada iteración, todas esas funciones callback todavía se ejecutarían estrictamente *después* de que el bucle se complete, y así imprimir `6` cada vez.

Pero aquí hay una pregunta más profunda. ¿Qué *falta* en nuestro código para que realmente *se comporte* como hemos semánticamente implicado?

Lo que falta es que estamos intentando *implicar* que cada iteración del bucle "capture" su propia copia de `i`, en el momento de la iteración. Pero, la forma en que funciona el scope, todas esas 5 funciones, aún cuando son definidas separadamente en cada iteración del bucle, **las 5 cierran sobre el mismo scope global compartido**, que tiene, de hecho, solo un `i` en él.

Dicho de esa manera, *por supuesto* todas las funciones comparten una referencia al mismo `i`. Algo sobre la estructura del bucle tiende a distraernos y hace que pensemos que hay algo más sofisticado en el trabajo. No lo hay. No hay diferencia que si cada uno de los 5 callbacks de timeout eran declarados uno al lado del otro, sin ningún bucle en absoluto.

OK, entonces, ¿de vuelta a nuestra pregunta ardiente. ¿Qué falta? Necesitamos más closure en el ojo de buey del scope. Específicamente, necesitamos un nuevo scope de closure para cada iteración del bucle.

Aprendimos en el Capítulo 3 que la IIFE crea scope declarando una función y ejecutándola inmediatamente.

Intentemos:

```js
for (var i=1; i<=5; i++) {
	(function(){
		setTimeout( function timer(){
			console.log( i );
		}, i*1000 );
	})();
}
```

¿Funciona? Pruébalo. De nuevo, te esperaré.

Voy a parar el suspenso para ti. **No.** ¿Pero por qué? Ahora evidentemente tenemos más scope léxico. Cada función timer callback de hecho está cerrando sobre su propio scope por iteración de bucle creado respectivamente por cada IIFE.

No es suficiente tener un scope para cerrar si ese scope está vacío. Mira de cerca. La IIFE es simplemente un scope nulo vacío. Necesita *algo* dentro de él para ser útil para nosotros.

Necesita su propia copia de la variable `i`, por iteración.

```js
for (var i=1; i<=5; i++) {
	(function(){
		var j = i;
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})();
}
```

**¡Eureka! ¡Funciona!**

Una ligera variación que algunos prefieren es:

```js
for (var i=1; i<=5; i++) {
	(function(j){
		setTimeout( function timer(){
			console.log( j );
		}, j*1000 );
	})( i );
}
```

Por supuesto, ya que estas IIFEs son simplemente funciones, podemos pasar el `i`, y podemos llamarle `j` si queremos, o podemos incluso llamarle `i` de nuevo. De cualquier manera, el código funciona ahora.

El uso de una IIFE dentro de cada iteración creó un nuevo scope para cada iteración, que le dio a nuestra función callback de timeout la oportunidad de cerrar sobre un nuevo scope para cada iteración, para el cual tenía en él el valor correcto para acceder.

Problema resuelto.

### Revisitando el Scope de Bloque

Mira cuidadosamente nuestro análisis de la solución anterior. Usamos una IIFE para crear nuevo scope por iteración. En otras palabras, en realidad *necesitábamos* un scope de bloque por iteración. El Capítulo 3 nos mostró la declaración `let`, que secuestra un bloque y declara una variable allí mismo en el bloque.

**Esto esencialmente convierte un bloque en un scope que podemos cerrar.** Por tanto, el siguiente código impresionante simplemente "funciona":

```js
for (var i=1; i<=5; i++) {
	let j = i; // yay, block-scope for closure!
	setTimeout( function timer(){
		console.log( j );
	}, j*1000 );
}
```

*¡Pero eso no es todo!* (en mi mejor voz de anuncio de infomercial nocturno) Hay un comportamiento especial definido para declaraciones `let` usadas en el encabezado de un bucle for. Este comportamiento dice que la variable será declarada no solo una vez para el bucle, **sino que cada iteración**. Y, será inicializada en cada iteración subsecuente con el valor del final de la iteración anterior.

```js
for (let i=1; i<=5; i++) {
	setTimeout( function timer(){
		console.log( i );
	}, i*1000 );
}
```

¿Qué tan genial es eso? El scope de bloque y el closure trabajando de la mano, resolviendo todos los problemas del mundo. No sé sobre ti, pero eso me hace un feliz programador de JavaScript.

## Módulos

Hay otros patrones de código que aprovechan el poder del closure pero que, superficialmente, no parecen tener nada que ver con callbacks. Examinemos el más poderoso de ellos: el *módulo*.

```js
function foo() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}
}
```

Como este código se sitúa, no hay closure observable sucediendo. Simplemente tenemos algunas variables de datos privadas `something` y `another`, y un par de funciones internas `doSomething()` y `doAnother()`, que ambas tienen scope léxico (y por lo tanto closure!) sobre el scope interior de `foo()`.

Pero ahora considera:

```js
function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

Este patrón en JavaScript llamamos *módulo*. La forma más común de implementar el patrón del módulo se llama a menudo "Revealing Module", y es la variación que se presenta aquí.

Examinemos algunas cosas sobre este código.

En primer lugar, `CoolModule()` es solo una función, pero *tiene que ser invocada* para que haya una instancia del módulo creada. Sin la ejecución de la función exterior, la creación del scope interior y los closures no se produciría.

En segundo lugar, la función `CoolModule()` devuelve un objeto, denotado por la sintaxis de objeto-literal `{ key: value, ... }`. El objeto que devolvemos tiene en él referencias a nuestras funciones internas, pero *no* a nuestras variables de datos internas. Las mantenemos ocultas y privadas. Es apropiado pensar en este objeto de retorno como esencialmente una **API pública para nuestro módulo**.

Este objeto de retorno es en última instancia asignado a la variable exterior `foo`, y luego podemos acceder a esos métodos de propiedad en la API, como `foo.doSomething()`.

**Nota:** No es necesario que retornemos un objeto real (literal) desde nuestro módulo. Podríamos simplemente retornar directamente una función interna. jQuery es en realidad un buen ejemplo de esto. Los identificadores `jQuery` y `$` son la "API pública" para el módulo jQuery, pero son solo funciones en sí mismas (que pueden ellas mismas tener propiedades, ya que todas las funciones son objetos).

Las funciones `doSomething()` y `doAnother()` tienen closure sobre el scope interior de la instancia del módulo (llegado por, se invoca `CoolModule()`). Cuando transportamos esas funciones fuera del scope léxico, a través de propiedades en el objeto de retorno, ahora hemos establecido una condición por la que el closure puede ser observado y ejercido.

Para poner esto más simplemente, hay dos "requerimientos" para que el patrón del módulo sea ejercido:

1. Debe haber una función contenedora exterior, y debe ser invocada al menos una vez (cada vez crea una nueva instancia del módulo).

2. La función contenedora debe retornar de vuelta al menos una función interna, de modo que esta función interna tenga closure sobre el scope privado, y pueda acceder y/o modificar ese estado privado.

Un objeto con una propiedad función en él no es *realmente* un módulo. Un objeto devuelto de una invocación de función que solo tiene propiedades data en él, sin funciones cerradas en él, no es *realmente* un módulo, en el sentido observable.

El fragmento de código anterior muestra una función generadora de módulos independiente llamada `CoolModule()` que puede ser invocada cualquier número de veces, cada vez creando una nueva instancia del módulo. Una ligera variación en este patrón es cuando solo te importa tener una instancia, un "singleton" de sorts:

```js
var foo = (function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
})();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

Aquí, convertimos nuestra función módulo en una IIFE (ver Capítulo 3), y la *invocamos inmediatamente* y asignamos su valor de retorno directamente a nuestro único identificador de instancia de módulo `foo`.

Los módulos son simplemente funciones, por lo que pueden recibir parámetros:

```js
function CoolModule(id) {
	function identify() {
		console.log( id );
	}

	return {
		identify: identify
	};
}

var foo1 = CoolModule( "foo 1" );
var foo2 = CoolModule( "foo 2" );

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```

Otra ligera pero poderosa variación en el patrón del módulo es nombrar el objeto que estás retornando como tu API pública:

```js
var foo = (function CoolModule(id) {
	function change() {
		// modifying the public API
		publicAPI.identify = identify2;
	}

	function identify1() {
		console.log( id );
	}

	function identify2() {
		console.log( id.toUpperCase() );
	}

	var publicAPI = {
		change: change,
		identify: identify1
	};

	return publicAPI;
})( "foo module" );

foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```

Al retener una referencia interna al objeto API pública dentro de tu instancia del módulo, puedes modificar esa instancia del módulo **desde adentro**, incluyendo agregar y eliminar métodos, propiedades, *y* cambiar sus valores.

### Módulos Modernos

Varios cargadores/gestores de dependencias de módulos esencialmente envuelven este patrón de definición de módulo en una API amigable. En lugar de examinar ninguna biblioteca en particular, déjame presentar un prueba de concepto **muy simple** solo para fines ilustrativos:

```js
var MyModules = (function Manager() {
	var modules = {};

	function define(name, deps, impl) {
		for (var i=0; i<deps.length; i++) {
			deps[i] = modules[deps[i]];
		}
		modules[name] = impl.apply( impl, deps );
	}

	function get(name) {
		return modules[name];
	}

	return {
		define: define,
		get: get
	};
})();
```

La parte clave de este código es `modules[name] = impl.apply(impl, deps)`. Esto está invocando la función de fábrica de definición para un módulo (pasando en cualquier dependencia), y almacenando el valor de retorno, la API del módulo, en una lista interna de módulos rastreados por nombre.

Y aquí hay cómo lo podría usar para definir algunos módulos:

```js
MyModules.define( "bar", [], function(){
	function hello(who) {
		return "Let me introduce: " + who;
	}

	return {
		hello: hello
	};
} );

MyModules.define( "foo", ["bar"], function(bar){
	var hungry = "hippo";

	function awesome() {
		console.log( bar.hello( hungry ).toUpperCase() );
	}

	return {
		awesome: awesome
	};
} );

var bar = MyModules.get( "bar" );
var foo = MyModules.get( "foo" );

console.log(
	bar.hello( "hippo" )
); // Let me introduce: hippo

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

Tanto los módulos "foo" como "bar" se definen con una función que devuelve una API pública. "foo" incluso recibe la instancia de "bar" como parámetro de dependencia, y puede utilizarla en consecuencia.

Invierte algo de tiempo en estos fragmentos para entenderlos completamente. La clave a tomar es que no hay ninguna magia real en los gestores de módulos. Cumplen ambas características del patrón de módulo que enumere anteriormente: invocar una función contenedora de definición de función, y mantener su valor de retorno como la API para ese módulo.

En otras palabras, los módulos son simplemente módulos, incluso si pones una herramienta de envoltura amigable encima de ellos.

### Módulos Futuros

ES6 añade soporte de sintaxis de primera clase para el concepto de módulos. Cuando se carga a través del sistema de módulos, ES6 trata un archivo como un módulo separado. Cada módulo puede importar otros módulos o miembros de API específicos, y también puede exportar sus propios miembros de API públicos.

**Nota:** Los módulos basados en funciones no son un patrón estáticamente reconocido (algo que el compilador sabe sobre ellos), así que sus semánticas de API no son consideradas hasta el tiempo de ejecución. Es decir, en realidad puedes modificar la API de un módulo durante el tiempo de ejecución (vea la discusión anterior de `publicAPI`).

En contraste, las APIs de Módulo ES6 son estáticas (las APIs no cambian en tiempo de ejecución). Ya que el compilador sabe *eso*, puede (¡y lo hace!) comprobar durante compilación que una referencia a un miembro de una API de un módulo importado *en realidad existe*. Si la referencia a la API no existe, el compilador lanza un error "temprano" en tiempo de compilación, en lugar de esperar a la resolución de referencia dinámica en tiempo de ejecución tradicional (¡y error!).

Los módulos ES6 **no** tienen un formato en línea, deben estar definidos en archivos separados (uno por módulo). Los navegadores/motores tienen un "cargador de módulos" predeterminado (que es sobrescribible, pero eso está muy más allá de nuestra discusión aquí) que carga sincrónicamente un archivo de módulo cuando es importado.

Considera:

**bar.js**
```js
function hello(who) {
	return "Let me introduce: " + who;
}

export hello;
```

**foo.js**
```js
// import only `hello()` from the "bar" module
import hello from "bar";

var hungry = "hippo";

function awesome() {
	console.log(
		hello( hungry ).toUpperCase()
	);
}

export awesome;
```

```js
// import the entire "foo" and "bar" modules
module foo from "foo";
module bar from "bar";

console.log(
	bar.hello( "rhino" )
); // Let me introduce: rhino

foo.awesome(); // LET ME INTRODUCE: RHINO
```

**Nota:** Se requieren archivos separados **"foo.js"** y **"bar.js"**, con el contenido como se muestra en los dos primeros fragmentos, respectivamente. Luego, tu programa carga/importa esos módulos para utilizarlos, como se muestra en el tercer fragmento.

`import` importa uno o más miembros de la API de un módulo al scope actual, cada uno vinculado a una variable (en nuestro caso `hello`). `module` importa una API de módulo completa vinculada a una variable (en nuestro caso `foo`, `bar`). `export` exporta un identificador (variable, función) a la API pública para el módulo actual. Estos operadores pueden ser usados tantas veces en la definición de un módulo como sea necesario.

El contenido dentro del *archivo de módulo* se trata como si estuviera encerrado en un scope de closure, igual que con las funciones-closure módulo vistas anteriormente.

## Repaso (TL;DR)

El closure parece al desprevenido como un mundo místico dentro de JavaScript que solo los pocos elegidos y valientes llegan a conocer. Pero en realidad es solo un hecho estándar y casi obvio de cómo escribimos código en un entorno de scope léxico, donde las funciones son valores y pueden ser pasadas a voluntad.

**El closure es cuando una función puede recordar y acceder a su scope léxico incluso cuando se invoca fuera de su scope léxico.**

Los closures pueden quebrarnos el cerebro si no los buscamos con cuidado y propósito. Pero también son una herramienta enormemente poderosa, permitiendo patrones como los *módulos* en sus diversas formas.

Los módulos requieren dos características clave: 1) una función contenedora externa invocada, para crear el scope encerrado, y 2) el valor de retorno de la función contenedora debe incluir referencia a al menos una función interna que luego tenga closure sobre el scope privado interior.

¡Ahora podemos ver closures alrededor de nosotros, y tenemos la esperanza y la capacidad de reconocerlos y aprovecharlos para nuestro propio beneficio!
