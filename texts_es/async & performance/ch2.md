# You Don't Know JS: Async & Performance
# Capítulo 2: Callbacks

En el Capítulo 1 exploramos la terminología y los conceptos alrededor de la programación asíncrona en JavaScript. Nuestro foco fue entender el event loop (cola de eventos) single-threaded (uno a la vez) que impulsa todos los "eventos" (invocaciones de funciones asíncronas). También exploramos varias formas en que los patrones de concurrencia explican las relaciones (si las hay) entre cadenas de eventos que se ejecutan *simultáneamente*, o "procesos" (tareas, llamadas a funciones, etc.).

Todos nuestros ejemplos en el Capítulo 1 usaron la función como la unidad individual e indivisible de operaciones, de modo que dentro de la función las sentencias se ejecutan en orden predecible (más allá del nivel del compilador), pero al nivel del orden de funciones, los eventos (invocaciones de funciones asíncronas) pueden ocurrir en una variedad de órdenes.

En todos estos casos, la función actúa como un "callback", porque sirve como el objetivo al que el event loop "llama de vuelta" al programa cuando ese ítem en la cola se procesa.

Como habrás observado, los callbacks son con mucho la forma más común en que la asincronía en programas JS se expresa y gestiona. De hecho, el callback es el patrón async más fundamental en el lenguaje.

Incontables programas JS, incluso muy sofisticados y complejos, se han construido sobre ninguna otra base async que el callback (con, por supuesto, los patrones de interacción concurrente que exploramos en el Capítulo 1). La función callback es la bestia de carga del trabajo asíncrono para JavaScript, y hace su trabajo respetablemente.

Excepto... los callbacks no están exentos de sus limitaciones. Muchos desarrolladores se entusiasman con la *promesa* (¡juego de palabras intencionado!) de mejores patrones async. Pero es imposible usar eficazmente cualquier abstracción si no entiendes qué está abstrayendo y por qué.

En este capítulo exploraremos un par de esos motivos en profundidad, como motivación de por qué patrones async más sofisticados (explorados en capítulos posteriores) son necesarios y deseables.

## Continuaciones

Regresemos al ejemplo de callback async que iniciamos en el Capítulo 1, pero déjame modificarlo ligeramente para ilustrar un punto:

```js
// A
ajax( "..", function(..){
	// C
} );
// B
```

`// A` y `// B` representan la primera mitad del programa (aka el *ahora*), y `// C` marca la segunda mitad del programa (aka el *después*). La primera mitad se ejecuta de inmediato, y luego hay una "pausa" de longitud indeterminada. En algún momento futuro, si la llamada Ajax completa, el programa retomará donde lo dejó y *continuará* con la segunda mitad.

En otras palabras, la función callback envuelve o encapsula la *continuación* del programa.

Hagamos el código aún más simple:

```js
// A
setTimeout( function(){
	// C
}, 1000 );
// B
```

Detente un momento y pregúntate cómo describirías (a alguien menos informado sobre cómo funciona JS) el comportamiento de este programa. Pruébalo en voz alta. Es un buen ejercicio que ayudará a que mis siguientes puntos tengan más sentido.

La mayoría de lectores probablemente pensó o dijo algo como: "Hacer A, luego configurar un timeout de 1.000 ms, luego cuando eso dispare, hacer C." ¿Qué tan cerca estuviste?

Puede que te hayas corregido a ti mismo: "Hacer A, configurar el timeout por 1.000 ms, luego hacer B, luego después del timeout hacer C." Eso es más preciso que la primera versión. ¿Puedes ver la diferencia?

Aunque la segunda versión es más exacta, ambas son deficientes al explicar este código de una forma que conecte nuestras mentes con el código, y el código con el motor de JS. La desconexión es sutil y monumental, y está en el corazón del entendimiento de las limitaciones de los callbacks como expresión y gestión async.

En cuanto introducimos una sola continuación (o varias docenas como muchos programas hacen) en forma de callback, permitimos que surja una divergencia entre cómo funciona nuestro cerebro y la forma en que el código operará. Cada vez que estas dos divergen (y esto no es el único lugar donde ocurre), nos encontramos con el hecho inevitable de que nuestro código se vuelve más difícil de comprender, razonar, depurar y mantener.

## Cerebro secuencial

Estoy bastante seguro de que la mayoría de ustedes han escuchado a alguien decir (o lo han dicho ustedes mismos), "Soy multitarea". Los efectos de intentar actuar como multitarea van desde lo humorístico (el juego infantil de tocar la cabeza y frotar el estómago) hasta lo mundano (masticar chicle mientras caminas) e incluso peligroso (escribir mensajes mientras conduces).

Pero, ¿somos realmente multitarea? ¿Podemos hacer dos acciones conscientes e intencionales a la vez y razonar sobre ambas al mismo tiempo? ¿Nuestro nivel más alto de función cerebral opera con multihilos paralelos?

La respuesta puede sorprenderte: **probablemente no.**

Así no parece estar configurado realmente nuestro cerebro. Somos más bien "single taskers" de lo que muchos (especialmente personalidades tipo A) querrían admitir. Realmente sólo podemos pensar en una cosa en un instante dado.

No me refiero a nuestras funciones involuntarias y subconscientes como latir del corazón, respiración y parpadeo. Esas tareas son vitales y no asignamos atención consciente. Afortunadamente, mientras nos obsesionamos con chequear redes sociales por enésima vez, nuestro cerebro sigue en segundo plano (hilos) con esas tareas.

Hablamos en cambio de la tarea que está en el frente de nuestra mente en ese momento. Para mí, es escribir el texto de este libro ahora mismo. ¿Estoy realizando alguna otra función de alto nivel en este mismo instante? No realmente. Me distraigo con facilidad.

Cuando simulamos multitarea —por ejemplo, teclear algo mientras hablamos por teléfono— en realidad lo que hacemos es cambiar de contexto rápidamente. En otras palabras, alternamos entre dos o más tareas en rápida sucesión, progresando en cada una en pequeños trozos. Lo hacemos tan rápido que al observador parece que hacemos las cosas en paralelo.

Suena sospechosamente parecido al concurrency basado en eventos (como el que ocurre en JS), ¿no? Si no, vuelve a leer el Capítulo 1.

De hecho, una forma de simplificar (o abusar) el complejo mundo de la neurología para poder discutir aquí es que nuestro cerebro opera parecido a la cola del event loop.

Si piensas cada letra (o palabra) que tecleo como un evento async individual, en esta misma frase hay docenas de oportunidades para que mi cerebro sea interrumpido por algún otro evento, ya sea por mis sentidos o por pensamientos aleatorios.

No me interrumpo en cada oportunidad (por suerte — de otro modo este libro no se escribiría), pero sucede con suficiente frecuencia como para que mi cerebro cambie de contexto constantemente, y eso es muy parecido a cómo se sentiría el motor de JS.

### Hacer versus planear

Nuestra analogía cerebro ↔ event loop es útil, pero debemos matizar. Hay una diferencia observable entre cómo planeamos tareas y cómo nuestro cerebro las ejecuta realmente.

Volviendo al ejemplo de escribir, mi esquema mental es seguir escribiendo de forma secuencial a través de una lista de puntos ordenados. No planeo interrupciones ni actividades no lineales, pero aun así mi cerebro cambia de contexto con frecuencia.

Aunque a nivel operacional nuestro cerebro sea asincrónico y basado en eventos, tendemos a planear las tareas de forma secuencial y sincrónica: "Tengo que ir a la tienda, luego comprar leche, luego dejar la tintorería".

Ese pensamiento de alto nivel (planear) no parece asíncrono en su formulación. En realidad, rara vez pensamos deliberadamente en términos de eventos. En su lugar planeamos en pasos A → B → C y asumimos un cierto bloqueo temporal.

Cuando un desarrollador escribe código, está planificando un conjunto de acciones. "Necesito asignar z al valor de x, luego x al valor de y".

Cuando escribimos código síncrono, enunciado por enunciado, funciona como nuestra lista de tareas:

```js
// intercambiar `x` y `y` (vía temporal `z`)
z = x;
x = y;
y = z;
```

Estas tres asignaciones son síncronas, de modo que `x = y` espera a que `z = x` termine, y `y = z` espera a que `x = y` termine. Esas tres sentencias están temporalmente ligadas, y no necesitamos preocuparnos por detalles async aquí.

Entonces, si la planificación cerebral síncrona mapea bien al código síncrono, ¿qué tal planear código asíncrono?

Resulta que la forma en que expresamos la asincronía (con callbacks) no mapea nada bien a ese estilo de planificación.

¿Puedes imaginar planear tus tareas así?

> "Necesito ir a la tienda, pero seguro que recibiré una llamada, así que 'Hola, mamá', y mientras habla, miraré la dirección en el GPS, pero tardará un segundo en cargar, así que bajaré la radio para oír a mamá mejor, luego me daré cuenta de que olvidé ponerme una chaqueta y hace frío, pero no importa, sigo conduciendo y hablando con mamá, y entonces el pitido del cinturón me recuerda abrocharme, así que 'Sí, mamá, me puse el cinturón, ¡siempre lo hago!'. Ah, por fin el GPS dio las direcciones, ahora..."

Por ridículo que suene como planificación, es exactamente así como funciona nuestro pensamiento a nivel funcional: cambio rápido de contexto. Y esa es la razón por la que es difícil escribir código async con callbacks —porque no coincide con cómo planificamos.

**Nota:** Peor que no saber por qué algo falla es no saber por qué funcionó. Callbacks contribuyen a esa "casa de naipes" mental.

### Callbacks anidados/encadenados

Considera:

```js
listen( "click", function handler(evt){
	setTimeout( function request(){
		ajax( "http://some.url.1", function response(text){
			if (text == "hello") {
				handler();
			}
			else if (text == "world") {
				request();
			}
		} );
	}, 500) ;
} );
```

Probablemente este tipo de código te resulte familiar. Tenemos una cadena de tres funciones anidadas, cada una representando un paso en una serie asíncrona.

A esto se le llama a menudo "callback hell" o la "pirámide de la perdición" (por su forma triangular debido a la indentación anidada).

Pero el "callback hell" tiene poco que ver con la indentación. Es un problema más profundo. Veremos por qué.

Primero, estamos esperando el evento "click", luego el temporizador, luego la respuesta Ajax, y puede repetirse.

A primera vista, este código puede parecer mapear la asincronía de forma secuencial al plan mental.

Primero (*ahora*):

```js
listen( "..", function handler(..){
	// ..
} );
```

Luego *después*:

```js
setTimeout( function request(..){
	// ..
}, 500) ;
```

Y aún más *después*:

```js
ajax( "..", function response(..){
	// ..
} );
```

Y finalmente (lo más *después*):

```js
if ( .. ) {
	// ..
}
else ..
```

Pero hay varios problemas al razonar linealmente sobre este código.

Primero, es un accidente del ejemplo que los pasos estén en líneas subsecuentes. En programas reales hay mucho más ruido que complica la lectura. Entender el flujo asíncrono en código cargado de callbacks no es imposible, pero tampoco natural ni sencillo.

Además, hay un problema más profundo: ¿qué pasa si `doA(..)` o `doD(..)` no son en verdad asíncronas, como asumimos? Si a veces son síncronas, el orden puede cambiar drásticamente. Ese tipo de variabilidad es fuente de frustración.

¿Es la anidación el problema principal? Es parte, pero no toda la historia.

Puedo reescribir el ejemplo sin anidación para ilustrarlo mejor, pero lo dejaremos para más adelante en el capítulo.
