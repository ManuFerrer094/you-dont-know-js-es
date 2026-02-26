````markdown
# You Don't Know JS: Async & Performance
# Apéndice A: Biblioteca *asynquence*

Los capítulos 1 y 2 profundizaron en los patrones típicos de programación asíncrona y en cómo suelen resolverse con callbacks. También vimos por qué los callbacks tienen limitaciones fatales en capacidad, lo que nos llevó a los capítulos 3 y 4, donde las Promesas y los generadores ofrecen una base mucho más sólida, fiable y razonable sobre la que construir la asincronía.

He citado mi propia librería asíncrona *asynquence* (http://github.com/getify/asynquence) —"async" + "sequence" = "asynquence"— varias veces en este libro, y ahora quiero explicar brevemente cómo funciona y por qué su diseño único es útil.

En el apéndice siguiente exploraremos algunos patrones asíncronos avanzados, pero probablemente querrás una librería que haga esos patrones manejables. Usaremos *asynquence* para expresar esos patrones, así que conviene dedicarle un poco de tiempo aquí para conocerla.

*asynquence* no es obviamente la única opción para programación asíncrona de calidad; hay muchas librerías excelentes. Pero *asynquence* aporta una perspectiva única al combinar lo mejor de estos patrones en una sola librería, y además está construida sobre una única abstracción básica: la secuencia (sequence).

Mi premisa es que los programas JS sofisticados a menudo necesitan piezas de varios patrones asíncronos combinadas, y esto suele dejarse al criterio del desarrollador. En lugar de tener que traer dos o más librerías diferentes, *asynquence* las unifica en pasos de secuencia variados, con una única biblioteca central que aprender y desplegar.

Creo que el valor de *asynquence* es suficiente como para facilitar mucho el control de flujo asíncrono con semántica tipo Promises, por eso nos centraremos en esa librería aquí.

Para empezar, explicaré los principios de diseño de *asynquence*, y luego ilustraremos cómo funciona su API con ejemplos de código.

## Secuencias, diseño de la abstracción

Comprender *asynquence* comienza por entender una abstracción fundamental: cualquier serie de pasos para una tarea, ya sean síncronos o asíncronos, puede pensarse colectivamente como una "secuencia". Es decir, una secuencia es un contenedor que representa una tarea y está compuesta por pasos individuales (potencialmente asíncronos) para completarla.

Cada paso de la secuencia está controlado internamente por una Promesa (ver Capítulo 3). Es decir, cada paso que añades a una secuencia crea implícitamente una Promesa conectada al final previo de la secuencia. Debido a la semántica de las Promesas, cada avance de paso en la secuencia es asíncrono, incluso si completas el paso de forma síncrona.

Además, una secuencia siempre procede de forma lineal de paso en paso: el paso 2 siempre viene después de que el paso 1 termine, y así sucesivamente.

Por supuesto, se puede crear una nueva secuencia bifurcando (fork) una existente; la bifurcación solo ocurre cuando la secuencia principal alcanza ese punto. Las secuencias también pueden combinarse de varias maneras, por ejemplo, subsumiendo una secuencia dentro de otra en un punto dado del flujo.

Una secuencia es algo parecido a una cadena de Promesas. Sin embargo, con cadenas de Promesas no existe un "handle" que haga referencia a la cadena completa: la Promesa a la que tengas referencia solo representa el paso actual en la cadena y los pasos que cuelgan de él. Esencialmente, no puedes mantener una referencia a la cadena completa a menos que mantengas la referencia a la primera Promesa.

Hay muchos casos en los que resulta útil tener un handle que haga referencia a la secuencia completa. El más importante es el abort/cancel de la secuencia. Como cubrimos en el Capítulo 3, las Promesas no deberían poder cancelarse, pues esto violaría la inmutabilidad externa.

Pero las secuencias no siguen esa inmutabilidad, principalmente porque no se pasan como contenedores de valor futuro que requieran semántica inmutable. Por tanto, las secuencias son el nivel de abstracción apropiado para manejar abort/cancel. Las secuencias de *asynquence* se pueden `abort()` en cualquier momento y la secuencia se detendrá.

Hay más razones para preferir una abstracción de secuencia sobre cadenas de Promesas para control de flujo.

Primero, encadenar Promesas es un proceso bastante manual y tedioso cuando lo haces extensamente, y esa tediosidad puede desincentivar el uso de Promesas donde son apropiadas.

Las abstracciones sirven para reducir boilerplate, así que la abstracción de secuencia es una buena solución. Con Promesas te concentras en el paso individual y no hay mucha asunción de que seguirás encadenando. Con secuencias, se asume que seguirás agregando pasos indefinidamente.

Esto reduce la complejidad, especialmente al pensar en patrones de Promesas de orden superior (más allá de `race([..])` y `all([..])`).

Por ejemplo, en medio de una secuencia podrías querer un paso que conceptualmente sea como un `try..catch`, donde el paso resulte siempre en éxito (o en una señal no errónea). O podrías querer un paso tipo retry/until que intente repetidamente hasta lograr éxito.

Estas abstracciones son difíciles de expresar solo con primitivas de Promesas, y hacerlo en medio de una cadena existente no es agradable. Si abstraes a una secuencia y consideras cada paso como un wrapper alrededor de una Promesa, ese wrapper puede ocultar esos detalles y dejarte pensar en el control de flujo con más claridad.

Segundo, pensar en el control de flujo asíncrono como pasos en una secuencia permite abstraer qué tipo de asincronía hay en cada paso. Internamente, una Promesa siempre controla el paso, pero externamente ese paso puede comportarse como un callback de continuación, una Promesa real, un generador, etc.

Tercero, las secuencias se adaptan mejor a modos de pensamiento alternativos, como programación por eventos, streams o reactiva. *asynquence* provee "secuencias reactivas" (reactive sequences), una variación inspirada en observables de RxJS, que permite que un evento repetible dispare una nueva instancia de secuencia cada vez. Las Promesas son "one-shot", así que expresar repetición con Promesas es incómodo.

Otro modo invierte el control de resolución en lo que llamo "iterable sequences": en lugar de que cada paso controle su propia finalización, la secuencia se invierte para que el avance sea controlado por un iterador externo, y cada paso responde a la llamada `next(..)` del iterador.

Exploraremos estas variaciones en el resto de este apéndice.

En resumen: las secuencias son una abstracción más poderosa y sensata para la asincronía compleja que solo Promesas o generadores, y *asynquence* está diseñada para expresar esa abstracción con el azúcar justa para hacer la programación asíncrona más clara y disfrutable.

## API de *asynquence*

Para empezar, se crea una secuencia con la función `ASQ(..)`. Una llamada `ASQ()` sin parámetros crea una secuencia vacía; pasar valores o funciones a `ASQ(..)` configura la secuencia con cada argumento representando un paso inicial.

**Nota:** En los ejemplos usaré el identificador global `ASQ` (navegador). Si importas *asynquence* mediante módulos puedes renombrarlo.

Algunos métodos son parte del núcleo y otros vienen en los "contrib" plug-ins. Revisa la documentación en http://github.com/getify/asynquence para ver qué está en el core o en contrib.

### Steps

Si una función representa un paso normal, se invoca con el primer parámetro siendo el callback de continuación, y los parámetros siguientes son los mensajes pasados desde el paso previo. El paso no concluirá hasta que se llame al callback. Los argumentos que pases al callback se enviarán como mensajes al siguiente paso.

Para añadir un paso normal usa `then(..)` (tiene semántica similar a `ASQ(..)`):

```js
ASQ(
    function(done){
        setTimeout(function(){ done("Hello"); }, 100);
    },
    function(done,greeting){
        setTimeout(function(){ done(greeting + " World"); }, 100);
    }
)
.then(function(done,msg){
    setTimeout(function(){ done(msg.toUpperCase()); }, 100);
})
.then(function(done,msg){
    console.log(msg); // HELLO WORLD
});
```

**Nota:** Aunque `then(..)` coincide en nombre con Promises, aquí es distinto: puedes pasar tantas funciones o valores como quieras y cada uno será un paso separado. No hay la semántica fulfilled/rejected de dos callbacks.

Con *asynquence*, solo llamas al callback de continuación (`done()` por convención) y opcionalmente pasas mensajes.

Cada paso `then(..)` se asume asíncrono. Si el paso es síncrono puedes llamar a `done(..)` inmediatamente, o usar el helper `val(..)`:

```js
ASQ(function(done){ done("Hello"); })
.val(function(greeting){ return greeting + " World"; })
.then(function(done,msg){ setTimeout(function(){ done(msg.toUpperCase()); }, 100); })
.val(function(msg){ console.log(msg); });
```

`val(..)` no recibe callback; devuelve el valor con `return`.

### Errores

Una diferencia importante frente a Promises es el manejo de errores.

Con Promises, cada Promesa puede tener su propio error y los pasos siguientes pueden manejarlo. Yo creo que en la mayoría de los casos un error en una parte de la secuencia no es recuperable, de modo que los pasos siguientes son irrelevantes y deberían saltarse. Por defecto, un error en cualquier paso lanza la secuencia entera a un modo de error y los pasos normales se ignoran.

Si necesitas que un paso tenga error recuperable, hay métodos para ello, como `try(..)` o `until(..)`. También existen `pThen(..)` y `pCatch(..)` que imitan `then(..)` y `catch(..)` de Promises.

Para registrar un manejador de errores en la secuencia, usa `or(..)` (alias `onerror(..)`). Puedes registrar handlers donde quieras y cuantas veces quieras; es parecido a un handler de evento.

Si ocurre una excepción JS, se convierte en error de secuencia; también puedes señalizarlo con `done.fail(..)`:

```js
var sq = ASQ(function(done){
    setTimeout(function(){ done.fail("Oops"); }, 100);
})
.then(function(done){ /* nunca llega */ })
.or(function(err){ console.log(err); /* Oops */ })
.then(function(done){ /* tampoco */ });

sq.or(function(err){ console.log(err); /* Oops */ });
```

Otra diferencia importante: el comportamiento por defecto de excepciones no manejadas está invertido. Si una secuencia entra en error y en ese momento no tiene handlers registrados, el error se reporta en la consola. Es decir, las rejections no manejadas se reportan por defecto para evitar que se "traguen" silenciosamente.

Si registras un handler en la secuencia, esta opta por no reportar el error automáticamente para evitar ruido duplicado.

Si necesitas crear una secuencia que pueda entrar en error antes de registrar handlers, puedes optar por desactivar el reporte llamando `defer()` en la secuencia. Solo hazlo si vas a manejar esos errores más tarde.

```js
var sq1 = ASQ(function(done){ doesnt.Exist(); }); // mostrará excepción en consola

var sq2 = ASQ(function(done){ doesnt.Exist(); }).defer(); // no reporta

setTimeout(function(){
    sq1.or(function(err){ console.log(err); });
    sq2.or(function(err){ console.log(err); });
}, 100);
```

Esto mejora el comportamiento por defecto respecto a Promises.

### Pasos en paralelo

Algunos pasos deben ejecutar múltiples sub-tareas concurrentes. Un paso que agrega subpasos concurrentes se llama `gate(..)` (alias `all(..)`), y es análogo a `Promise.all([..])`.

Si todas las sub-tareas finalizan con éxito, sus mensajes de éxito se pasan al siguiente paso. Si alguna falla, la secuencia entra en estado de error.

```js
ASQ(function(done){ setTimeout(done,100); })
.gate(
    function(done){ setTimeout(function(){ done("Hello"); },100); },
    function(done){ setTimeout(function(){ done("World","!"); },100); }
)
.val(function(msg1,msg2){ console.log(msg1); console.log(msg2); });
```

Comparado con Promises, expressar esto con `Promise.all` requiere más boilerplate.

#### Variaciones de pasos

En contrib existen variaciones útiles:

* `any(..)`: al menos un segmento debe tener éxito.
* `first(..)`: como `any(..)`, pero procede tan pronto uno tenga éxito.
* `race(..)`: como `first(..)`, pero procede cuando cualquier segmento completa (éxito o fallo).
* `last(..)`: envía el mensaje del último segmento que finalice con éxito.
* `none(..)`: procede solo si todos los segmentos fallan.

Ejemplos y helpers:

```js
function success1(done){ setTimeout(function(){ done(1); },100); }
function success2(done){ setTimeout(function(){ done(2); },100); }
function failure3(done){ setTimeout(function(){ done.fail(3); },100); }
function output(msg){ console.log(msg); }

ASQ().race(failure3, success1).or(output); // 3

ASQ().any(success1, failure3, success2)
.val(function(){ console.log([].slice.call(arguments)); }); // [1, undefined, 2]

ASQ().first(failure3, success1, success2).val(output); // 1
ASQ().last(failure3, success1, success2).val(output); // 2
ASQ().none(failure3).val(output); // 3
```

`map(..)` permite mapear asíncronamente elementos de un array:

```js
function double(x,done){ setTimeout(function(){ done(x*2); },100); }

ASQ().map([1,2,3], double).val(output); // [2,4,6]
```

`waterfall(..)` es mezcla entre `gate(..)` y `then(..)`: los mensajes se van acumulando y pasando hacia abajo.

#### Tolerancia a errores

Si quieres que un error no provoque que la secuencia falle completamente, existen `try(..)` (convierte fallo en `{ catch: .. }`) y `until(..)` para reintentos.

```js
ASQ().try(success1).val(output) // 1
.try(failure3).val(output) // { catch: 3 }
```

`until(..)` reintenta hasta éxito o hasta que llames `break()`:

```js
var count = 0;
ASQ(3).until(double).val(output)
.until(function(done){
    count++;
    setTimeout(function(){
        if (count < 5) done.fail();
        else done.break("Oops");
    },100);
}).or(output); // Oops
```

#### Pasos estilo Promises

Con `pThen` y `pCatch` (plug-ins) puedes usar semánticas tipo Promise dentro de una secuencia:

```js
ASQ(21)
.pThen(function(msg){ return msg * 2; })
.pThen(output) // 42
.pThen(function(){ doesnt.Exist(); })
.pCatch(function(err){ console.log(err); })
.val(function(){ /* secuencia vuelve a estado success */ });
```

### Fork de secuencias

Puedes "forkear" una secuencia con `fork()` para obtener múltiples flujos independientes.

### Combinar secuencias

`seq(..)` subsume una secuencia dentro de otra; `pipe(..)` también permite encadenar manualmente.

## Secuencias de valor y error

Valores simples mapean a mensajes de éxito. Para crear una secuencia con error usa `ASQ.failed(..)`.

Con contrib `after` y `failAfter` se pueden crear secuencias con demora.

## Promises y callbacks

`promise(..)` subsume una promesa en una secuencia; `toPromise` (contrib) convierte una secuencia a promesa.

`errfcb` y `ASQ.wrap(..)` ayudan a integrar funciones callback-first en secuencias.

## Secuencias iterables

Las "iterable sequences" externalizan el control por medio de un iterador, útil en casos como `domready`:

```js
var domready = ASQ.iterable();
domready.val(function(){ /* DOM listo */ });
document.addEventListener("DOMContentLoaded", domready.next);
```

Volveremos sobre esto en el Apéndice B.

## Ejecutando generadores

`runner(..)` de *asynquence* corre generadores escuchando Promesas y reanudando el generador.

```js
function doublePr(x){ return new Promise(function(resolve){ setTimeout(function(){ resolve(x*2); },100); }); }
function doubleSeq(x){ return ASQ(function(done){ setTimeout(function(){ done(x*2); },100); }); }

ASQ(10,11)
.runner(function*(token){
    var x = token.messages[0] + token.messages[1];
    x = yield doublePr(x);
    x = yield doubleSeq(x);
    return x;
})
.val(function(msg){ console.log(msg); /* 84 */ });
```

`ASQ.wrap(..)` puede crear funciones que ejecutan generadores y devuelven una secuencia.

## Resumen

*asynquence* es una abstracción simple (secuencia = serie de pasos asíncronos) sobre Promesas, diseñada para facilitar trabajar con diversos patrones asíncronos sin perder capacidad.

Hay más funcionalidades en el core y en contrib; revisa la documentación del proyecto para más detalles.

Si estos fragmentos te han aclarado la librería, ya tienes una buena base; si aún tienes dudas, juega con *asynquence* antes de seguir al Apéndice B.

````
