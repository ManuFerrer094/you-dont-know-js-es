````markdown
# You Don't Know JS: Async & Performance
# Capítulo 4: Generadores

En el Capítulo 2 identificamos dos desventajas clave de expresar el flujo asíncrono con callbacks:

* El enfoque basado en callbacks no encaja con cómo nuestra mente planifica los pasos de una tarea.
* Los callbacks no son fiables ni composables debido a la *inversión de control*.

En el Capítulo 3 detallamos cómo las Promesas revierten la *inversión de control* de los callbacks, restaurando la fiabilidad y composabilidad.

Ahora nos centramos en expresar el control de flujo asíncrono de una forma secuencial y con apariencia síncrona. La "magia" que lo hace posible son los **generadores** de ES6.

## Rompiendo el "run-to-completion"

En el Capítulo 1 explicamos una expectativa que los desarrolladores JS casi universalmente asumen: una vez que una función empieza a ejecutarse, corre hasta completarse y ningún otro código puede interrumpirla en medio.

Por extraño que parezca, ES6 introduce un nuevo tipo de función que no se comporta con ese run-to-completion. Este nuevo tipo se llama "generador".

Para entender las implicaciones, consideremos este ejemplo:

```js
var x = 1;

function foo() {
    x++;
    bar();                // <-- ¿qué pasa con esta línea?
    console.log( "x:", x );
}

function bar() {
    x++;
}

foo();                    // x: 3
```

En este ejemplo sabemos con certeza que `bar()` corre entre `x++` y `console.log(x)`. Pero ¿qué pasaría si `bar()` no estuviera presente y aun así pudiera ejecutarse entre esas dos sentencias?

En lenguajes multihilo preemptivos eso sería posible. JS no es preemptivo ni (actualmente) multihilo. Sin embargo, una forma cooperativa de esta "interrupción" (concurrencia) es posible si `foo()` pudiera indicar un "pausa" en ese punto del código.

**Nota:** Uso la palabra "cooperativa" no solo por la terminología clásica de concurrencia, sino porque la sintaxis ES6 para indicar un punto de pausa es `yield`, sugiriendo una cesión de control *cooperativa*.

Aquí está el código ES6 para lograr esa concurrencia cooperativa:

```js
var x = 1;

function *foo() {
    x++;
    yield; // ¡pausa!
    console.log( "x:", x );
}

function bar() {
    x++;
}
```

**Nota:** Verás en otros documentos la forma `function* foo()` en lugar de `function *foo()`. Ambas son equivalentes; la diferencia es solo de estilo.

Ahora, ¿cómo hacemos que `bar()` se ejecute en el punto del `yield` dentro de `*foo()`?

```js
// construye un iterador `it` para controlar el generador
var it = foo();

// ¡inicia `foo()` aquí!
it.next();
x;                      // 2
bar();
x;                      // 3
it.next();               // x: 3
```

Hay bastante nuevo y potencialmente confuso en esos ejemplos, así que lo desglosaremos. Pero antes, repasemos el flujo de comportamiento:

1. `it = foo()` no ejecuta el generador, solo construye un *iterador* para controlarlo.
2. El primer `it.next()` inicia `*foo()` y ejecuta `x++`.
3. `*foo()` pausa en `yield` y el primer `it.next()` termina. `*foo()` queda en estado pausado.
4. Inspeccionamos `x`, ahora es `2`.
5. Llamamos `bar()`, que incrementa `x` otra vez.
6. Inspeccionamos `x`, ahora `3`.
7. El último `it.next()` reanuda `*foo()` desde donde quedó y ejecuta `console.log(..)`.

Claramente `*foo()` comenzó pero no se completó; se pausó en `yield` y fue reanudado después.

### Entrada y salida

Un generador es una función especial pero sigue aceptando argumentos y pudiendo devolver un valor:

```js
function *foo(x,y) {
    return x * y;
}

var it = foo( 6, 7 );

var res = it.next();

res.value;       // 42
```

`foo(6,7)` no ejecuta el generador; crea un iterador `it`. `it.next()` avanza el generador hasta el siguiente `yield` o hasta su fin, y devuelve un objeto `{ value, done }`.

#### Mensajería de iteración

Además de aceptar argumentos y devolver valores, los generadores permiten una mensajería bidireccional entre `yield` y `next(..)`:

```js
function *foo(x) {
    var y = x * (yield);
    return y;
}

var it = foo( 6 );

// inicia `foo(..)`
it.next();

var res = it.next( 7 );

res.value;    // 42
```

La primera `next()` inicia el generador y para en `yield`. La segunda `next(7)` envía el `7` como resultado de la expresión `yield`, completando `var y = 6 * 7`.

Observa que por lo general habrá una `next()` más que `yield` porque la primera `next()` arranca el generador y no puede enviar un valor a un `yield` inexistente.

##### Historia de dos preguntas

Dependiendo de la perspectiva (del generador o del iterador) parece haber un "desajuste" entre `yield` y `next(..)`, pero en realidad se trata de quién hace la pregunta y quién responde. `yield` puede incluso emitir un valor (p. ej. `yield "Hello"`) que es el resultado del primer `next()`.

### Múltiples iteradores

Cada llamada a la función generadora crea una nueva instancia (iterador). Puedes tener múltiples instancias del mismo generador ejecutándose simultáneamente e incluso interactuando entre sí:

```js
function *foo() {
    var x = yield 2;
    z++;
    var y = yield (x * z);
    console.log( x, y, z );
}

var z = 1;

var it1 = foo();
var it2 = foo();

var val1 = it1.next().value;            // 2
var val2 = it2.next().value;            // 2

val1 = it1.next( val2 * 10 ).value;     // 40
val2 = it2.next( val1 * 5 ).value;      // 600

it1.next( val2 / 2 );                   // 20 300 3
it2.next( val1 / 4 );                   // 200 10 3
```

#### Entretejido (Interleaving)

Con generadores podemos intercalar la ejecución de varias secuencias, incluso en medio de sentencias. Esto puede crear resultados diversos según el orden de avance de los iteradores.

## Generando valores

Los generadores pueden usarse para producir una secuencia de valores, manteniendo estado entre producciones. Esto se relaciona con el patrón de *iteradores*.

### Productores e iteradores

Ejemplo con cierre (closure):

```js
var gimmeSomething = (function(){
    var nextVal;

    return function(){
        if (nextVal === undefined) {
            nextVal = 1;
        }
        else {
            nextVal = (3 * nextVal) + 6;
        }

        return nextVal;
    };
})();

gimmeSomething();        // 1
gimmeSomething();        // 9
gimmeSomething();        // 33
gimmeSomething();        // 105
```

Podemos implementar el mismo productor con la interfaz estándar de iterador:

```js
var something = (function(){
    var nextVal;

    return {
        [Symbol.iterator]: function(){ return this; },

        next: function(){
            if (nextVal === undefined) {
                nextVal = 1;
            }
            else {
                nextVal = (3 * nextVal) + 6;
            }

            return { done:false, value:nextVal };
        }
    };
})();

something.next().value;     // 1
something.next().value;     // 9
```

`for..of` consume iteradores automáticamente.

### Iterables

Un "iterable" es un objeto que puede producir un iterador mediante `Symbol.iterator`. Arrays son iterables por defecto; objetos ordinarios no lo son.

### Iterador de generador

Al ejecutar un generador (`foo()` donde `foo` es `function *foo(){}`) obtenemos su iterador. Un generador puede `yield` valores fácilmente mediante `yield`.

#### Parando el generador

La terminación anticipada de un `for..of` (por `break`, `return` o excepción) envía una señal al iterador para que termine. También puedes terminar manualmente un iterador con `return(..)`, lo que disparará cláusulas `finally` dentro del generador.

## Iterar generadores de forma asíncrona

¿Qué tienen que ver los generadores con los patrones asíncronos? Revisemos un ejemplo callback del Capítulo 3:

```js
function foo(x,y,cb) {
    ajax(
        "http://some.url.1/?x=" + x + "&y=" + y,
        cb
    );
}

foo( 11, 31, function(err,text) {
    if (err) {
        console.error( err );
    }
    else {
        console.log( text );
    }
} );
```

Con un generador podríamos escribir:

```js
function foo(x,y) {
    ajax(
        "http://some.url.1/?x=" + x + "&y=" + y,
        function(err,data){
            if (err) {
                // lanzar un error dentro de `*main()`
                it.throw( err );
            }
            else {
                // reanudar `*main()` con `data`
                it.next( data );
            }
        }
    );
}

function *main() {
    try {
        var text = yield foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}

var it = main();

// ¡arranca todo!
it.next();
```

La clave está en `var text = yield foo(11,31);` — `yield` permite pausar el generador y luego reanudarlo con el dato asíncrono mediante `it.next(data)`.

### Manejo síncrono de errores

El `try..catch` dentro del generador puede capturar errores lanzados hacia dentro con `it.throw(err)`, permitiendo manejo de errores con apariencia síncrona.

## Generadores + Promesas

Para recuperar la confiabilidad y composabilidad de las Promesas, podemos combinar generadores y Promesas: `yield` una Promesa y reanudar/throw según se resuelva o rechace.

Por ejemplo, si `foo(..)` devuelve una promesa:

```js
function foo(x,y) {
    return request(
        "http://some.url.1/?x=" + x + "&y=" + y
    );
}

function *main() {
    try {
        var text = yield foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}
```

El iterador que controla el generador debe esperar a la promesa y luego reanudar o lanzar el error dentro del generador según corresponda.

### Runner consciente de Promesas

Podemos escribir un utilitario `run(..)` que ejecute generadores que `yield`en Promesas y que devuelva una Promesa que se resuelva cuando el generador termine:

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
            })(next);
        } );
}
```

Usar `run(main)` hará que el generador `*main()` avance automáticamente hasta su fin.

#### ES7: `async` y `await`?

El patrón generador+Promesa inspiró la sintaxis `async`/`await` (posterior a ES6). Con `async function` y `await` obtienes la misma sensación de código síncrono pero sin necesidad de un `run(..)` manual:

```js
async function main() {
    try {
        var text = await foo( 11, 31 );
        console.log( text );
    }
    catch (err) {
        console.error( err );
    }
}

main();
```

### Concurrencia de Promesas en Generadores

Para ejecutar dos requests en paralelo y luego combinar resultados, crea ambas Promesas antes de `yield` y luego `yield`a cada promesa (o usa `Promise.all`):

```js
function *foo() {
    var p1 = request( "http://some.url.1" );
    var p2 = request( "http://some.url.2" );

    var r1 = yield p1;
    var r2 = yield p2;

    var r3 = yield request(
        "http://some.url.3/?v=" + r1 + "," + r2
    );

    console.log( r3 );
}

run( foo );
```

O alternativamente:

```js
var results = yield Promise.all( [ request(url1), request(url2) ] );
```

#### Promesas "ocultas"

Procura ocultar la lógica de composición de Promesas dentro de funciones auxiliares para no ensuciar el código del generador, preservando la claridad secuencial.

## Delegación de Generadores

Puedes delegar la iteración a otro generador usando `yield *foo()` en lugar de `yield run(foo)`. `yield*` transfiere el control del iterador delegado al generador objetivo y, cuando éste termine, el control regresa.

Ejemplo:

```js
function *foo() {
    var r2 = yield request( "http://some.url.2" );
    var r3 = yield request( "http://some.url.3/?v=" + r2 );

    return r3;
}

function *bar() {
    var r1 = yield request( "http://some.url.1" );

    var r3 = yield *foo();

    console.log( r3 );
}

run( bar );
```

`yield*` también delega la mensajería bidireccional y las excepciones a través de la cadena de delegación.

### Delegación a iterables no generadores

Puedes delegar a cualquier iterable, p. ej. `yield *["B","C","D"]` y el `yield*` consumirá el iterador del array.

### Delegación asíncrona y "recursión"

`yield*` es útil para organizar código asíncrono complejo y permite incluso delegación recursiva de generadores.

## Concurrencia con Generadores

Podemos coordinar múltiples instancias de generadores para sincronizar respuestas asíncronas. Un patrón es iniciar instancias, almacenar las Promesas y luego decidir cuándo reanudar cada iterador (por ejemplo usando `Promise.all`).

También se puede concebir un `runAll(..)` que gestione varias corrutinas y un espacio de datos compartido para comunicación; esto se aproxima a CSP (Communicating Sequential Processes).

## Thunks

Un "thunk" es una función sin parámetros que envuelve una llamada (posponer la ejecución). Los thunkories son fábricas de thunks (análogo a promisories).

Ejemplo de `thunkify`:

```js
function thunkify(fn) {
    return function() {
        var args = [].slice.call( arguments );
        return function(cb) {
            args.push( cb );
            return fn.apply( null, args );
        };
    };
}
```

Comparando thunks y Promesas: ambos representan una petición de un valor futuro, pero las Promesas ofrecen mayor confianza y composabilidad. Aun así, un `run(..)` inteligente puede manejar `yield` que produzca Promesas o thunks.

Ejemplo de manejo de thunk dentro del `run(..)`:

```js
else if (typeof next.value == "function") {
    return new Promise( function(resolve,reject){
        next.value( function(err,msg) {
            if (err) {
                reject( err );
            }
            else {
                resolve( msg );
            }
        } );
    } )
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
```

## Generadores en pre-ES6

Los generadores requieren nueva sintaxis, así que para entornos antiguos se usan transpilers (p. ej. regenerator) que transforman generadores en equivalentes ES5 basados en closures y máquinas de estados.

### Transformación manual (resumen)

La idea es convertir el generador en una función que devuelva un iterador con `next()` y `throw()` y mantener el estado interno con una variable `state` y un `switch` que represente cada punto de pausa.

### Transpilación automática

Herramientas como `regenerator` automatizan esa conversión y generan código que usa un runtime auxiliar (`regeneratorRuntime`) para manejar la lógica del iterador.

## Revisión

Los generadores son funciones ES6 que no necesariamente corren hasta completarse; pueden pausar con `yield` y reanudarse con `next(..)`. `yield` y `next(..)` forman un mecanismo de paso de mensajes bidireccional.

La ventaja clave para asincronía es poder escribir código con apariencia síncrona ocultando la asincronía detrás de `yield`, y usando Promesas (o thunks) y un runner para conservar fiabilidad y composabilidad.

````
