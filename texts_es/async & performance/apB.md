````markdown
# You Don't Know JS: Async & Performance
# Apéndice B: Patrones Asíncronos Avanzados

El Apéndice A introdujo la librería *asynquence* para control de flujo asíncrono orientado a secuencias, basada principalmente en Promesas y generadores.

Ahora exploraremos otros patrones asíncronos avanzados construidos sobre esa comprensión y funcionalidad, y veremos cómo *asynquence* facilita mezclar y combinar esas técnicas sofisticadas sin necesitar muchas librerías separadas.

## Secuencias iterables

Presentamos las secuencias iterables de *asynquence* en el apéndice anterior; ahora las revisaremos con más detalle.

Para refrescar:

```js
var domready = ASQ.iterable();

// ..

domready.val( function(){
    // DOM listo
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

Definamos ahora una secuencia de varios pasos como secuencia iterable:

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(x){
    return x * 2;
} )
.then( function STEP2(x){
    return x + 3;
} )
.then( function STEP3(x){
    return x * 4;
} );

steps.next( 8 ).value;  // 16
steps.next( 16 ).value; // 19
steps.next( 19 ).value; // 76
steps.next().done;      // true
```

Como se ve, una secuencia iterable es un *iterator* compatible con el estándar (ver Capítulo 4). Por tanto, puede iterarse con `for..of`, igual que un generador:

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(){ return 2; } )
.then( function STEP2(){ return 4; } )
.then( function STEP3(){ return 6; } )
.then( function STEP4(){ return 8; } )
.then( function STEP5(){ return 10; } );

for (var v of steps) {
    console.log( v );
}
// 2 4 6 8 10
```

Más allá del ejemplo de evento visto antes, las secuencias iterables son interesantes porque pueden actuar como sustituto de generadores o cadenas de Promesas, pero con aún más flexibilidad.

Considera un ejemplo de múltiples peticiones Ajax —ya lo vimos en los Capítulos 3 y 4 expresado con Promises y generadores— escrito como secuencia iterable:

```js
// ajax consciente de secuencia
var request = ASQ.wrap( ajax );

ASQ( "http://some.url.1" )
.runner(
    ASQ.iterable()

    .then( function STEP1(token){
        var url = token.messages[0];
        return request( url );
    } )

    .then( function STEP2(resp){
        return ASQ().gate(
            request( "http://some.url.2/?v=" + resp ),
            request( "http://some.url.3/?v=" + resp )
        );
    } )

    .then( function STEP3(r1,r2){ return r1 + r2; } )
)
.val( function(msg){
    console.log( msg );
} );
```

La secuencia iterable expresa una serie secuencial de pasos (sync o async) que se parece mucho a una cadena de Promesas. Si la pasamos a `ASQ#runner(..)`, se ejecuta hasta completarse como si fuera un generador. Que una secuencia iterable se comporte como un generador es notable por varias razones.

Primero, las secuencias iterables son una especie de equivalente pre-ES6 para un subconjunto de generadores ES6: puedes escribirlas directamente (para ejecutarlas en cualquier entorno), o puedes escribir generadores ES6 y transpilar/convetirlos a secuencias iterables (o a cadenas de Promesas).

Pensar en un generador que se ejecuta hasta completarse como azúcar sintáctico para una cadena de Promesas es una observación importante sobre su relación isomórfica.

Antes de seguir, observa que el fragmento anterior podría haberse expresado con *asynquence* así:

```js
ASQ( "http://some.url.1" )
.seq( /*STEP 1*/ request )
.seq( function STEP2(resp){
    return ASQ().gate(
        request( "http://some.url.2/?v=" + resp ),
        request( "http://some.url.3/?v=" + resp )
    );
} )
.val( function STEP3(r1,r2){ return r1 + r2; } )
.val( function(msg){
    console.log( msg );
} );
```

Incluso el paso 2 podría expresarse con `gate(..)` pasando funciones que hagan `pipe(..)` a `done`.

¿Por qué entonces escribir la lógica como secuencia iterable para usar en `ASQ#runner(..)` si la cadena plana de *asynquence* funciona bien? Porque la forma iterable tiene una habilidad clave: es perezosa (lazy) y durante su ejecución puedes extender la secuencia añadiendo pasos, algo que no es posible con cadenas de Promesas o generadores estándar.

### Extender secuencias iterables

Generadores, secuencias *asynquence* normales y cadenas de Promesas son todos evaluados con actitud "eager" —el flujo expresado inicialmente es el flujo fijo a seguir. En cambio, las secuencias iterables son *lazily evaluated*, es decir, durante su ejecución puedes añadir más pasos al final de la secuencia.

Nota: solo puedes añadir al final, no inyectar en medio.

Un ejemplo síncrono simple para ilustrarlo:

```js
function double(x) {
    x *= 2;

    // ¿seguimos extendiendo?
    if (x < 500) {
        isq.then( double );
    }

    return x;
}

// secuencia iterable con un solo paso inicialmente
var isq = ASQ.iterable().then( double );

for (var v = 10, ret; (ret = isq.next( v )) && !ret.done; ) {
    v = ret.value;
    console.log( v );
}
```

La secuencia comienza con un solo paso pero se va extendiendo condicionalmente. Técnicamente tanto secuencias como Promises *pueden* intentar algo parecido, pero veremos por qué su capacidad es insuficiente en ciertos casos.

Si, por ejemplo, la respuesta Ajax indica que se necesita más información, puedes condicionalmente insertar pasos adicionales para hacer solicitudes extra o formatear resultados.

```js
var steps = ASQ.iterable()

.then( function STEP1(token){
    var url = token.messages[0].url;

    // ¿se proporcionó un paso de formateo adicional?
    if (token.messages[0].format) {
        steps.then( token.messages[0].format );
    }

    return request( url );
} )

.then( function STEP2(resp){
    // ¿añadimos otra petición Ajax?
    if (/x1/.test( resp )) {
        steps.then( function STEP5(text){
            return request(
                "http://some.url.4/?v=" + text
            );
        } );
    }

    return ASQ().gate(
        request( "http://some.url.2/?v=" + resp ),
        request( "http://some.url.3/?v=" + resp )
    );
} )

.then( function STEP3(r1,r2){ return r1 + r2; } );
```

Para ejecutar `steps` lo enchufamos con `ASQ#runner(..)`:

```js
var main = ASQ({
    url: "http://some.url.1",
    format: function STEP4(text){ return text.toUpperCase(); }
})
.runner( steps )
.val( function(msg){ console.log( msg ); } );
```

¿Puede un generador expresar lo mismo? Sí, pero hay que reorganizar la lógica de forma algo más forzada, por ejemplo reescribiendo en `*steps()` y usando `yield` en distintos puntos.

¿Y con Promises/sequence? Podrías re-asignar la variable `steps = steps.then(..)` mientras la cadena se ejecuta, pero esto introduce una condición de carrera: cuando `main` hace `return steps`, `steps` puede ser la cadena original o la extendida — si es la original y luego se extiende, `main` no verá la extensión. Ese es el peligro de la evaluación ansiosa (eager). Las secuencias iterables, por ser perezosas, evitan ese problema.

## Reactivo por eventos

Como quedó claro en el Capítulo 3, las Promesas son potentes, pero no manejan flujos de eventos (streams) porque solo se resuelven una vez. Lo mismo aplica a secuencias simples de *asynquence*.

Si quieres ejecutar una serie de pasos cada vez que ocurre un evento, crearás una nueva cadena/sequence por cada ocurrencia, lo cual mezcla responsabilidades:

```js
listener.on( "foobar", function(data){
    new Promise(function(resolve,reject){
        // ..
    }).then( .. ).then( .. );
});
```

Es mejor separar la escucha del evento y la respuesta a ese evento. Imagina tener un `observable` que puedas observar múltiples veces y que dispare cada vez que ocurra el evento.

Esto se alinea con los conceptos de programación reactiva (Reactive Programming, RP) y observables (p. ej. RxJS). También hay propuestas de ES7 para un tipo `Observable`.

### Observables ES7

La propuesta ES7 sugiere pasar un generador (o cualquier iterable) como suscriptor, cuyo `next(..)` será llamado por cada evento. En esencia, lo que importa es el *iterator*, y conceptualmente podrías pasar `ASQ.iterable()`.

### Secuencias reactivas

Inspirados por Observables, *asynquence* ofrece `ASQ.react(..)`, una utilidad para construir ese patrón:

```js
var observable = ASQ.react( function setup(next){
    listener.on( "foobar", next );
} );

observable
.seq( .. )
.then( .. )
.val( .. );
```

Cada evento dispara una nueva instancia de la secuencia, y la definición de la secuencia puede incluir pasos asincrónicos de cualquier tipo (callbacks, Promises, generadores). Si quieres detener la secuencia reactiva, llama a `stop()`; puedes registrar un `registerTeardown` en `setup(..)` para desactivar handlers.

Ejemplo de uso en DOM:

```js
ASQ.react( function setup(next){
    document.getElementById( "mybtn" )
    .addEventListener( "click", next, false );
} )
.seq( function(evt){
    var btnID = evt.target.id;
    return request("http://some.url.1/?id=" + btnID);
} )
.val( function(text){ console.log( text ); } );
```

En Node.js también es útil, por ejemplo para manejar peticiones HTTP reactivamente.

También hay adaptadores para integrar streams Node (`onStream` / `unStream`) y combinar múltiples secuencias reactivas con `gate(..)`.

## Corutinas con generadores

En el Capítulo 4 vimos `runAll(..)` y la idea de correr varios generadores concurrentemente. `ASQ#runner(..)` puede correr múltiples generadores (coroutines) concurrentes y coordinarlos.

Algunas diferencias clave de `ASQ#runner(..)`:

* Cada generador recibe un `token` que hay que `yield`ear para transferir explícitamente el control.
* `token.messages` es un array con mensajes pasados desde el paso previo y sirve para intercambio entre coroutines.
* `yield` de una Promesa/sequence pausa la coroutine hasta su resolución; no transfiere control.
* El último `return` o `yield` de la ejecución se pasa al siguiente paso de la secuencia.

### Máquinas de estado

Con un pequeño helper `state(..)` puedes construir máquinas de estado que funcionan mediante coroutines reinvocadas cada vez que se entra en un estado. `state(..)` devuelve un generador apto para pasar a `ASQ#runner(..)` y coordinar transiciones mediante `token.messages[0]`.

El helper y su uso permiten modelar transiciones y mantener el bucle hasta que se alcance un estado terminal.

## Procesos Secuenciales Comunicantes (CSP)

"Communicating Sequential Processes" (CSP) de C. A. R. Hoare describe un método formal para que procesos concurrentes interactúen mediante paso de mensajes. En CSP, el paso de mensajes se describe como una acción *síncrona*: emisor y receptor deben estar listos para el intercambio.

¿Cómo se relaciona esto con JS asíncrono? Los generadores ES6 permiten escribir acciones que parecen síncronas pero pueden pausar por asincronía. Dos generadores concurrentes pueden aparentar enviarse mensajes de forma síncrona mientras el runtime gestiona la reanudación.

En CSP se usa una abstracción llamada "channel" que ofrece `take(..)` (bloquea hasta recibir) y `put(..)` (bloquea hasta enviar). Bibliotecas como `js-csp` y las ideas de core.async (ClojureScript) son referencias útiles.

### Emulación CSP en *asynquence*

En *asynquence* existe una capa de emulación CSP en `asynquence-contrib` que adapta `ASQ#runner(..)` para comportarse parecida a goroutines y canales. `ASQ.csp.go(..)` transforma una función generadora en una que recibe un canal compartido, y `ASQ.csp.chan(..)` crea canales.

En lugar de `yield`ear Promesas, `request(..)` puede devolver un canal al que `take(..)` y `put(..)` interactúan:

```js
function request(url){
    var ch = ASQ.csp.channel();
    ajax( url ).then( function(content){
        ASQ.csp.putAsync( ch, content );
    } );
    return ch;
}
```

Con `ASQ.csp.go(..)` y `ASQ.csp.take/put` puedes coordinar goroutines y pasar mensajes por canales; ajustar `ch.buffer_size` permite evitar bloqueos al `put(..)` final.

Ejemplo concurrente provisto en el original muestra cómo dos goroutines intercambian URLs y resultados mediante `ch` y cómo pasar los resultados al siguiente paso en la secuencia.

## Resumen

Promesas y generadores son bloques de construcción que permiten técnicas más sofisticadas.

*asynquence* ofrece utilidades para implementar secuencias iterables, secuencias reactivas (Observables), corutinas concurrentes y una emulación CSP, integrando diversas capacidades asíncronas en una sola abstracción: la secuencia.

````
