# You Don't Know JS: Async y Rendimiento
# Capítulo 2: Callbacks

En el Capítulo 1, exploramos la terminología y los conceptos relacionados con la programación asíncrona en JavaScript. Nuestro enfoque se centra en comprender la cola del event loop de un solo hilo (una cosa a la vez) que impulsa todos los "eventos" (invocaciones de funciones asíncronas). También exploramos varias formas en que los patrones de concurrencia explican las relaciones (¡si las hay!) entre cadenas de eventos que se ejecutan *simultáneamente*, o "procesos" (tareas, llamadas a funciones, etc.).

Todos nuestros ejemplos en el Capítulo 1 usaron la función como la unidad individual e indivisible de operaciones, donde dentro de la función, las sentencias se ejecutan en un orden predecible (¡por encima del nivel del compilador!), pero a nivel del orden de funciones, los eventos (también conocidos como invocaciones de funciones asíncronas) pueden ocurrir en una variedad de órdenes.

En todos estos casos, la función actúa como un "callback", porque sirve como el objetivo para que el event loop "llame de vuelta" al programa, cada vez que ese elemento en la cola es procesado.

Como sin duda habrás observado, los callbacks son, con diferencia, la forma más común en que se expresa y gestiona la asincronía en los programas JS. De hecho, el callback es el patrón asíncrono más fundamental del lenguaje.

Innumerables programas JS, incluso los muy sofisticados y complejos, se han escrito sin otra base asíncrona más que el callback (con, por supuesto, los patrones de interacción de concurrencia que exploramos en el Capítulo 1). La función callback es el caballo de batalla asíncrono para JavaScript, y hace su trabajo de manera respetable.

Excepto que... los callbacks no están exentos de deficiencias. Muchos desarrolladores están entusiasmados con la *promesa* (¡juego de palabras intencionado!) de mejores patrones asíncronos. Pero es imposible usar efectivamente cualquier abstracción si no entiendes qué está abstrayendo, y por qué.

En este capítulo, exploraremos un par de ellas en profundidad, como motivación de por qué son necesarios y deseables patrones asíncronos más sofisticados (explorados en los capítulos siguientes de este libro).

## Continuaciones

Volvamos al ejemplo de callback asíncrono con el que comenzamos en el Capítulo 1, pero permíteme modificarlo ligeramente para ilustrar un punto:

```js
// A
ajax( "..", function(..){
	// C
} );
// B
```

`// A` y `// B` representan la primera mitad del programa (también conocida como el *ahora*), y `// C` marca la segunda mitad del programa (también conocida como el *después*). La primera mitad se ejecuta inmediatamente, y luego hay una "pausa" de duración indeterminada. En algún momento futuro, si la llamada Ajax se completa, entonces el programa retomará donde lo dejó y *continuará* con la segunda mitad.

En otras palabras, la función callback envuelve o encapsula la *continuación* del programa.

Hagamos el código aún más simple:

```js
// A
setTimeout( function(){
	// C
}, 1000 );
// B
```

Detente un momento y pregúntate cómo describirías (a alguien menos informado sobre cómo funciona JS) la forma en que se comporta ese programa. Adelante, inténtalo en voz alta. Es un buen ejercicio que ayudará a que mis próximos puntos tengan más sentido.

La mayoría de los lectores probablemente pensaron o dijeron algo como: "Haz A, luego configura un timeout para esperar 1,000 milisegundos, luego una vez que se dispare, haz C." ¿Qué tan cerca estuvo tu versión?

Puede que te hayas corregido a ti mismo: "Haz A, configura el timeout para 1,000 milisegundos, luego haz B, y después de que el timeout se dispare, haz C." Eso es más preciso que la primera versión. ¿Puedes detectar la diferencia?

Aunque la segunda versión es más precisa, ambas versiones son deficientes a la hora de explicar este código de una manera que conecte nuestro cerebro con el código, y el código con el motor JS. La desconexión es tanto sutil como monumental, y está en el corazón mismo de entender las deficiencias de los callbacks como expresión y gestión asíncrona.

Tan pronto como introducimos una sola continuación (¡o varias docenas como hacen muchos programas!) en forma de una función callback, hemos permitido que se forme una divergencia entre cómo funcionan nuestros cerebros y la forma en que operará el código. Cada vez que estas dos cosas divergen (¡y este no es de lejos el único lugar donde sucede, como seguro sabes!), nos encontramos con el hecho inevitable de que nuestro código se vuelve más difícil de entender, razonar, depurar y mantener.

## Cerebro Secuencial

Estoy bastante seguro de que la mayoría de ustedes, lectores, han escuchado a alguien decir (incluso han hecho la afirmación ustedes mismos), "Soy multitarea." Los efectos de intentar actuar como multitarea van desde lo humorístico (por ejemplo, el juego infantil tonto de darse palmaditas en la cabeza mientras te frotas el estómago) a lo mundano (masticar chicle mientras caminas) hasta lo francamente peligroso (enviar mensajes de texto mientras conduces).

¿Pero somos multitarea? ¿Realmente podemos hacer dos acciones conscientes e intencionales a la vez y pensar/razonar sobre ambas exactamente en el mismo momento? ¿Tiene nuestro nivel más alto de funcionalidad cerebral multithreading paralelo funcionando?

La respuesta puede sorprenderte: **probablemente no.**

Simplemente no es así como nuestros cerebros parecen estar configurados. Somos mucho más monotarea de lo que muchos de nosotros (¡especialmente las personalidades de tipo A!) quisiéramos admitir. Realmente solo podemos pensar en una cosa en cualquier instante dado.

No estoy hablando de todas nuestras funciones cerebrales involuntarias, subconscientes y automáticas, como los latidos del corazón, la respiración y el parpadeo. Todas esas son tareas vitales para nuestra vida, pero no les asignamos intencionalmente ninguna potencia cerebral. Afortunadamente, mientras nos obsesionamos con revisar las redes sociales por decimoquinta vez en tres minutos, nuestro cerebro continúa en segundo plano (¡hilos!) con todas esas tareas importantes.

En cambio, estamos hablando de cualquier tarea que esté en primer plano de nuestras mentes en el momento. Para mí, es escribir el texto de este libro ahora mismo. ¿Estoy haciendo alguna otra función cerebral de alto nivel exactamente en este mismo momento? No, realmente no. Me distraigo rápida y fácilmente -- ¡unas cuantas docenas de veces en estos últimos párrafos!

Cuando *simulamos* la multitarea, como intentar escribir algo al mismo tiempo que hablamos con un amigo o familiar por teléfono, lo que en realidad estamos haciendo con mayor probabilidad es actuar como rápidos conmutadores de contexto. En otras palabras, alternamos entre dos o más tareas en rápida sucesión, progresando *simultáneamente* en cada tarea en pequeños y rápidos fragmentos. Lo hacemos tan rápido que para el mundo exterior parece como si estuviéramos haciendo estas cosas *en paralelo*.

¿Te suena sospechosamente a la concurrencia asíncrona basada en eventos (como la que ocurre en JS)? Si no, ¡vuelve y lee el Capítulo 1 de nuevo!

De hecho, una forma de simplificar (es decir, abusar) del mundo masivamente complejo de la neurología en algo que remotamente puedo esperar discutir aquí es que nuestros cerebros funcionan más o menos como la cola del event loop.

Si piensas en cada letra (o palabra) que escribo como un solo evento asíncrono, solo en esta oración hay varias docenas de oportunidades para que mi cerebro sea interrumpido por algún otro evento, como de mis sentidos, o incluso solo mis pensamientos aleatorios.

No me interrumpo y me desvío a otro "proceso" en cada oportunidad que podría hacerlo (afortunadamente, ¡o este libro nunca se escribiría!). Pero sucede con suficiente frecuencia que siento que mi propio cerebro está casi constantemente alternando entre varios contextos diferentes (también conocidos como "procesos"). Y eso es muy similar a cómo probablemente se sentiría el motor de JS.

### Hacer Versus Planificar

Bien, entonces nuestros cerebros pueden ser pensados como operando de maneras similares a una cola de event loop de un solo hilo, al igual que el motor de JS. Eso suena como una buena coincidencia.

Pero necesitamos ser más matizados que eso en nuestro análisis. Hay una gran diferencia observable entre cómo planificamos varias tareas y cómo nuestros cerebros realmente operan esas tareas.

De nuevo, volviendo a la escritura de este texto como mi metáfora. Mi plan mental aproximado aquí es seguir escribiendo y escribiendo, avanzando secuencialmente a través de un conjunto de puntos que he ordenado en mis pensamientos. No planeo tener interrupciones o actividad no lineal en esta escritura. Pero aun así, mi cerebro está sin embargo alternando todo el tiempo.

Aunque a nivel operativo nuestros cerebros son asíncronos basados en eventos, parecemos planificar las tareas de una manera secuencial y síncrona. "Necesito ir a la tienda, luego comprar leche, luego dejar mi ropa en la tintorería."

Notarás que este pensamiento de nivel superior (planificación) no parece muy asíncrono basado en eventos en su formulación. De hecho, es bastante raro que pensemos deliberadamente solo en términos de eventos. En cambio, planificamos las cosas cuidadosamente, secuencialmente (A luego B luego C), y asumimos hasta cierto punto una especie de bloqueo temporal que obliga a B a esperar a A, y a C a esperar a B.

Cuando un desarrollador escribe código, está planificando un conjunto de acciones que deben ocurrir. Si es medianamente bueno como desarrollador, lo está **planificando cuidadosamente**. "Necesito asignar a `z` el valor de `x`, y luego `x` al valor de `y`," y así sucesivamente.

Cuando escribimos código síncrono, sentencia por sentencia, funciona mucho como nuestra lista de tareas pendientes:

```js
// swap `x` and `y` (via temp variable `z`)
z = x;
x = y;
y = z;
```

Estas tres sentencias de asignación son síncronas, así que `x = y` espera a que `z = x` termine, y `y = z` a su vez espera a que `x = y` termine. Otra forma de decirlo es que estas tres sentencias están temporalmente vinculadas para ejecutarse en un cierto orden, una justo después de la otra. Afortunadamente, no necesitamos preocuparnos por los detalles de asincronía basada en eventos aquí. ¡Si tuviéramos que hacerlo, el código se volvería mucho más complejo, rápidamente!

Entonces, si la planificación cerebral síncrona se mapea bien a las sentencias de código síncronas, ¿qué tan bien planifican nuestros cerebros el código asíncrono?

Resulta que la forma en que expresamos la asincronía (con callbacks) en nuestro código no se mapea muy bien en absoluto a ese comportamiento de planificación cerebral síncrona.

¿Puedes realmente imaginarte teniendo una línea de pensamiento que planifique tus tareas del día así?

> "Necesito ir a la tienda, pero en el camino seguro recibiré una llamada telefónica, así que 'Hola, mamá', y mientras ella empieza a hablar, buscaré la dirección de la tienda en el GPS, pero eso tardará un segundo en cargar, así que bajaré la radio para poder escuchar mejor a mamá, luego me daré cuenta de que olvidé ponerme una chaqueta y hace frío afuera, pero no importa, sigo conduciendo y hablando con mamá, y luego el pitido del cinturón de seguridad me recuerda abrochármelo, así que 'Sí, mamá, sí llevo puesto el cinturón, ¡siempre lo hago!'. Ah, finalmente el GPS obtuvo las direcciones, ahora..."

Por ridículo que suene eso como formulación de cómo planificamos nuestro día y pensamos en qué hacer y en qué orden, sin embargo es exactamente cómo operan nuestros cerebros a nivel funcional. Recuerda, eso no es multitarea, es simplemente conmutación rápida de contexto.

La razón por la que nos resulta difícil como desarrolladores escribir código asíncrono basado en eventos, especialmente cuando todo lo que tenemos es el callback para hacerlo, es que ese flujo de conciencia de pensamiento/planificación no es natural para la mayoría de nosotros.

Pensamos en términos de paso a paso, pero las herramientas (callbacks) disponibles para nosotros en el código no se expresan de manera paso a paso una vez que pasamos de lo síncrono a lo asíncrono.

Y **eso** es por lo que es tan difícil escribir correctamente y razonar sobre código JS asíncrono con callbacks: porque no es como funciona la planificación de nuestro cerebro.

**Nota:** Lo único peor que no saber por qué un código falla es no saber por qué funcionó en primer lugar. Es la clásica mentalidad del "castillo de naipes": "funciona, pero no sé por qué, ¡así que nadie lo toque!" Puede que hayas escuchado, "El infierno son los otros" (Sartre), y la versión para programadores, "El infierno es el código de otros." Yo creo sinceramente: "El infierno es no entender mi propio código." Y los callbacks son uno de los principales culpables.

### Callbacks Anidados/Encadenados

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

Hay una buena probabilidad de que código como ese te resulte reconocible. Tenemos una cadena de tres funciones anidadas, cada una representando un paso en una serie asíncrona (tarea, "proceso").

Este tipo de código a menudo se llama "callback hell" (infierno de callbacks), y a veces también se le conoce como la "pirámide de la perdición" (por su forma triangular orientada de lado debido a la indentación anidada).

Pero el "callback hell" en realidad no tiene casi nada que ver con el anidamiento/indentación. Es un problema mucho más profundo que eso. Veremos cómo y por qué a medida que continuemos a lo largo del resto de este capítulo.

Primero, estamos esperando el evento "click", luego estamos esperando que el temporizador se dispare, luego estamos esperando que llegue la respuesta Ajax, punto en el cual podría hacerlo todo de nuevo.

A primera vista, este código puede parecer que mapea su asincronía de forma natural a la planificación cerebral secuencial.

Primero (*ahora*), nosotros:

```js
listen( "..", function handler(..){
	// ..
} );
```

Luego *después*, nosotros:

```js
setTimeout( function request(..){
	// ..
}, 500) ;
```

Luego aún *más después*, nosotros:

```js
ajax( "..", function response(..){
	// ..
} );
```

Y finalmente (lo *más después*), nosotros:

```js
if ( .. ) {
	// ..
}
else ..
```

Pero hay varios problemas con razonar sobre este código linealmente de esa manera.

Primero, es una casualidad del ejemplo que nuestros pasos estén en líneas consecutivas (1, 2, 3 y 4...). En programas JS asíncronos reales, a menudo hay mucho más ruido que enturbia las cosas, ruido que tenemos que sortear hábilmente en nuestros cerebros mientras saltamos de una función a la siguiente. Entender el flujo asíncrono en código tan cargado de callbacks no es imposible, pero ciertamente no es natural ni fácil, incluso con mucha práctica.

Pero también, hay algo más profundo que está mal, que no es evidente solo con ese ejemplo de código. Permíteme inventar otro escenario (pseudo-código) para ilustrarlo:

```js
doA( function(){
	doB();

	doC( function(){
		doD();
	} )

	doE();
} );

doF();
```

Aunque los más experimentados entre ustedes identificarán correctamente el verdadero orden de operaciones aquí, apuesto a que es más que un poco confuso a primera vista, y requiere algunos ciclos mentales concentrados para llegar a la respuesta. Las operaciones sucederán en este orden:

* `doA()`
* `doF()`
* `doB()`
* `doC()`
* `doE()`
* `doD()`

¿Lo acertaste la primera vez que echaste un vistazo al código?

OK, algunos de ustedes están pensando que fui injusto con los nombres de mis funciones, para llevarlos intencionalmente por el camino equivocado. Juro que solo las nombré en orden de aparición de arriba hacia abajo. Pero déjame intentar de nuevo:

```js
doA( function(){
	doC();

	doD( function(){
		doF();
	} )

	doE();
} );

doB();
```

Ahora, las he nombrado alfabéticamente en orden de ejecución real. Pero sigo apostando a que, incluso con experiencia ahora en este escenario, seguir el orden `A -> B -> C -> D -> E -> F` no les resulta natural a muchos, si es que a alguno de ustedes, lectores. Ciertamente, sus ojos hacen un montón de saltos arriba y abajo en el fragmento de código, ¿verdad?

Pero incluso si todo eso te resulta natural, todavía hay un peligro más que podría causar estragos. ¿Puedes detectar cuál es?

¿Qué pasa si `doA(..)` o `doD(..)` no son realmente asíncronas, como obviamente asumimos que eran? Uh oh, ahora el orden es diferente. Si ambas son síncronas (y quizás solo a veces, dependiendo de las condiciones del programa en ese momento), el orden es ahora `A -> C -> D -> F -> E -> B`.

Ese sonido que acabas de escuchar tenuemente de fondo son los suspiros de miles de desarrolladores JS que acaban de tener un momento de cara en las manos.

¿Es el anidamiento el problema? ¿Es eso lo que hace tan difícil seguir el flujo asíncrono? Eso es parte de ello, ciertamente.

Pero permíteme reescribir el ejemplo anterior de evento/timeout/Ajax anidado sin usar anidamiento:

```js
listen( "click", handler );

function handler() {
	setTimeout( request, 500 );
}

function request(){
	ajax( "http://some.url.1", response );
}

function response(text){
	if (text == "hello") {
		handler();
	}
	else if (text == "world") {
		request();
	}
}
```

Esta formulación del código no es ni de lejos tan reconocible por tener los problemas de anidamiento/indentación de su forma anterior, y sin embargo es igualmente susceptible al "callback hell." ¿Por qué?

A medida que intentamos razonar linealmente (secuencialmente) sobre este código, tenemos que saltar de una función a la siguiente, a la siguiente, y rebotar por toda la base de código para "ver" el flujo secuencial. Y recuerda, este es código simplificado en una especie de escenario ideal. Todos sabemos que las bases de código de programas JS asíncronos reales son a menudo fantásticamente más enredadas, lo que hace ese tipo de razonamiento órdenes de magnitud más difícil.

Otra cosa a notar: para vincular los pasos 2, 3 y 4 para que sucedan en sucesión, la única posibilidad que los callbacks solos nos dan es codificar de forma fija el paso 2 en el paso 1, el paso 3 en el paso 2, el paso 4 en el paso 3, y así sucesivamente. La codificación fija no es necesariamente algo malo, si realmente es una condición fija que el paso 2 siempre debe llevar al paso 3.

Pero la codificación fija definitivamente hace al código un poco más frágil, ya que no contempla nada que pueda salir mal y causar una desviación en la progresión de los pasos. Por ejemplo, si el paso 2 falla, el paso 3 nunca se alcanza, ni el paso 2 se reintenta, ni se mueve a un flujo alternativo de manejo de errores, y así sucesivamente.

Todos estos problemas son cosas que *puedes* codificar manualmente de forma fija en cada paso, pero ese código es a menudo muy repetitivo y no reutilizable en otros pasos u otros flujos asíncronos de tu programa.

Aunque nuestros cerebros podrían planificar una serie de tareas de manera secuencial (esto, luego esto, luego esto), la naturaleza basada en eventos de la operación de nuestro cerebro hace que la recuperación/reintento/bifurcación del flujo de control sea casi sin esfuerzo. Si estás haciendo recados y te das cuenta de que dejaste la lista de compras en casa, eso no termina el día porque no lo planificaste con anticipación. Tu cerebro sortea este contratiempo fácilmente: vas a casa, coges la lista y vuelves directamente a la tienda.

Pero la naturaleza frágil de los callbacks codificados manualmente de forma fija (incluso con manejo de errores codificado) es a menudo mucho menos elegante. Una vez que terminas especificando (es decir, pre-planificando) todas las diversas eventualidades/caminos, el código se vuelve tan enrevesado que es difícil mantenerlo o actualizarlo.

**Eso** es de lo que se trata el "callback hell". El anidamiento/indentación es básicamente un acto secundario, una pista falsa.

Y como si todo eso no fuera suficiente, ni siquiera hemos tocado lo que sucede cuando dos o más cadenas de estas continuaciones de callbacks están ocurriendo *simultáneamente*, o cuando el tercer paso se ramifica en callbacks "paralelos" con compuertas o pestillos, o... ¡AY, me duele el cerebro, ¿y el tuyo?!

¿Estás captando la noción de que nuestros comportamientos de planificación cerebral secuencial y bloqueante simplemente no se mapean bien al código asíncrono orientado a callbacks? Esa es la primera deficiencia importante que debemos articular sobre los callbacks: expresan la asincronía en el código de maneras contra las que nuestros cerebros tienen que luchar para mantenerse sincronizados (¡juego de palabras intencionado!).

## Problemas de Confianza

La falta de correspondencia entre la planificación cerebral secuencial y el código JS asíncrono basado en callbacks es solo parte del problema con los callbacks. Hay algo mucho más profundo de lo que preocuparse.

Revisitemos una vez más la noción de una función callback como la continuación (también conocida como la segunda mitad) de nuestro programa:

```js
// A
ajax( "..", function(..){
	// C
} );
// B
```

`// A` y `// B` suceden *ahora*, bajo el control directo del programa JS principal. Pero `// C` se difiere para suceder *después*, y bajo el control de otra parte -- en este caso, la función `ajax(..)`. En un sentido básico, ese tipo de traspaso de control no causa regularmente muchos problemas para los programas.

Pero no te dejes engañar por su infrecuencia pensando que este cambio de control no es gran cosa. De hecho, es uno de los peores (y sin embargo más sutiles) problemas del diseño basado en callbacks. Gira en torno a la idea de que a veces `ajax(..)` (es decir, la "parte" a la que le entregas tu continuación de callback) no es una función que tú escribiste, o que controlas directamente. Muchas veces, es una utilidad proporcionada por algún tercero.

A esto lo llamamos "inversión de control", cuando tomas parte de tu programa y cedes el control de su ejecución a otro tercero. Existe un "contrato" tácito entre tu código y la utilidad de terceros -- un conjunto de cosas que esperas que se mantengan.

### La Historia de los Cinco Callbacks

Puede que no sea terriblemente obvio por qué esto es un problema tan grande. Permíteme construir un escenario exagerado para ilustrar los peligros de confianza en juego.

Imagina que eres un desarrollador encargado de construir un sistema de pago para un sitio que vende televisores caros. Ya tienes todas las diversas páginas del sistema de pago construidas sin problemas. En la última página, cuando el usuario hace clic en "confirmar" para comprar el televisor, necesitas llamar a una función de terceros (proporcionada, digamos, por alguna empresa de seguimiento analítico) para que la venta pueda ser rastreada.

Notas que han proporcionado lo que parece una utilidad de seguimiento asíncrona, probablemente por buenas prácticas de rendimiento, lo que significa que necesitas pasar una función callback. En esta continuación que pasas, tendrás el código final que cobra la tarjeta de crédito del cliente y muestra la página de agradecimiento.

Este código podría verse así:

```js
analytics.trackPurchase( purchaseData, function(){
	chargeCreditCard();
	displayThankyouPage();
} );
```

Bastante fácil, ¿verdad? Escribes el código, lo pruebas, todo funciona y lo despliegas a producción. ¡Todos contentos!

Pasan seis meses y no hay problemas. Casi has olvidado que escribiste ese código. Una mañana, estás en una cafetería antes del trabajo, disfrutando tranquilamente de tu café con leche, cuando recibes una llamada de pánico de tu jefe insistiendo en que dejes el café y corras a la oficina inmediatamente.

Cuando llegas, descubres que a un cliente importante le han cobrado cinco veces en su tarjeta de crédito por el mismo televisor, y está comprensiblemente molesto. El servicio al cliente ya ha emitido una disculpa y procesado un reembolso. Pero tu jefe exige saber cómo pudo haber pasado esto. "¿No tenemos pruebas para este tipo de cosas?!"

Ni siquiera recuerdas el código que escribiste. Pero vuelves a buscarlo e intentas averiguar qué pudo haber salido mal.

Después de revisar algunos logs, llegas a la conclusión de que la única explicación es que la utilidad de analíticas de alguna manera, por alguna razón, llamó a tu callback cinco veces en lugar de una. Nada en su documentación menciona algo sobre esto.

Frustrado, contactas al soporte al cliente, quienes por supuesto están tan asombrados como tú. Aceptan escalarlo a sus desarrolladores y prometen responderte. Al día siguiente, recibes un largo correo electrónico explicando lo que encontraron, que rápidamente reenvías a tu jefe.

Aparentemente, los desarrolladores de la empresa de analíticas habían estado trabajando en algo de código experimental que, bajo ciertas condiciones, reintentaría el callback proporcionado una vez por segundo, durante cinco segundos, antes de fallar con un timeout. Nunca tuvieron la intención de subir eso a producción, pero de alguna manera lo hicieron, y están totalmente avergonzados y disculpándose. Entran en bastante detalle sobre cómo han identificado el problema y qué harán para asegurarse de que nunca vuelva a pasar. Bla, bla, bla.

¿Qué sigue?

Lo hablas con tu jefe, pero él no se siente particularmente cómodo con el estado de las cosas. Insiste, y tú aceptas a regañadientes, que ya no puedes confiar en *ellos* (eso fue lo que te mordió), y que necesitarás averiguar cómo proteger el código de pago de tal vulnerabilidad de nuevo.

Después de algo de experimentación, implementas algo de código ad hoc simple como el siguiente, con el que el equipo parece contento:

```js
var tracked = false;

analytics.trackPurchase( purchaseData, function(){
	if (!tracked) {
		tracked = true;
		chargeCreditCard();
		displayThankyouPage();
	}
} );
```

**Nota:** Esto debería resultarte familiar del Capítulo 1, porque esencialmente estamos creando un pestillo para manejar si llegan a haber múltiples invocaciones concurrentes de nuestro callback.

Pero entonces uno de tus ingenieros de QA pregunta, "¿qué pasa si nunca llaman al callback?" Ups. Ninguno de los dos había pensado en eso.

Empiezas a caer por la madriguera del conejo y piensas en todas las cosas posibles que podrían salir mal con ellos llamando a tu callback. Aquí está aproximadamente la lista que elaboras de formas en que la utilidad de analíticas podría comportarse mal:

* Llamar al callback demasiado pronto (antes de que haya sido rastreado)
* Llamar al callback demasiado tarde (o nunca)
* Llamar al callback muy pocas o demasiadas veces (¡como el problema que encontraste!)
* No pasar los parámetros/entorno necesarios a tu callback
* Tragarse cualquier error/excepción que pueda ocurrir
* ...

Eso debería sentirse como una lista preocupante, porque lo es. Probablemente estás empezando a darte cuenta lentamente de que vas a tener que inventar un montón de lógica ad hoc **en cada uno de los callbacks** que se pasan a una utilidad en la que no estás seguro de poder confiar.

Ahora te das cuenta un poco más completamente de lo infernal que es el "callback hell".

### No Solo el Código de Otros

Algunos de ustedes pueden ser escépticos en este punto de si esto es tan grave como lo estoy planteando. Quizás no interactúas con utilidades de terceros realmente externas mucho o en absoluto. Quizás usas APIs versionadas o alojas tú mismo esas bibliotecas, de modo que su comportamiento no pueda cambiar por debajo de ti.

Así que, considera esto: ¿realmente puedes *de verdad* confiar en utilidades que teóricamente controlas (en tu propia base de código)?

Piénsalo de esta manera: la mayoría de nosotros estamos de acuerdo en que, al menos hasta cierto punto, deberíamos construir nuestras propias funciones internas con algunas verificaciones defensivas sobre los parámetros de entrada, para reducir/prevenir problemas inesperados.

Confianza excesiva en la entrada:
```js
function addNumbers(x,y) {
	// + is overloaded with coercion to also be
	// string concatenation, so this operation
	// isn't strictly safe depending on what's
	// passed in.
	return x + y;
}

addNumbers( 21, 21 );	// 42
addNumbers( 21, "21" );	// "2121"
```

Defensiva contra entradas no confiables:
```js
function addNumbers(x,y) {
	// ensure numerical input
	if (typeof x != "number" || typeof y != "number") {
		throw Error( "Bad parameters" );
	}

	// if we get here, + will safely do numeric addition
	return x + y;
}

addNumbers( 21, 21 );	// 42
addNumbers( 21, "21" );	// Error: "Bad parameters"
```

O quizás aún segura pero más amigable:
```js
function addNumbers(x,y) {
	// ensure numerical input
	x = Number( x );
	y = Number( y );

	// + will safely do numeric addition
	return x + y;
}

addNumbers( 21, 21 );	// 42
addNumbers( 21, "21" );	// 42
```

De cualquier forma que lo hagas, este tipo de verificaciones/normalizaciones son bastante comunes en las entradas de funciones, incluso con código en el que teóricamente confiamos por completo. De una manera cruda, es como el equivalente en programación del principio geopolítico de "Confía pero verifica."

Entonces, ¿no tiene sentido que deberíamos hacer lo mismo con la composición de callbacks de funciones asíncronas, no solo con código verdaderamente externo sino incluso con código que sabemos que generalmente está "bajo nuestro propio control"? **Por supuesto que deberíamos.**

Pero los callbacks realmente no ofrecen nada para ayudarnos. Tenemos que construir toda esa maquinaria nosotros mismos, y a menudo termina siendo un montón de código repetitivo/sobrecarga que repetimos para cada callback asíncrono.

El problema más preocupante con los callbacks es la *inversión de control* que lleva a un colapso completo en todas esas líneas de confianza.

Si tienes código que usa callbacks, especialmente pero no exclusivamente con utilidades de terceros, y no estás aplicando algún tipo de lógica de mitigación para todos estos problemas de confianza de *inversión de control*, tu código *tiene* bugs en este momento aunque puede que aún no te hayan mordido. Los bugs latentes siguen siendo bugs.

Infierno de verdad.

## Intentando Salvar los Callbacks

Hay varias variaciones del diseño de callbacks que han intentado abordar algunos (¡no todos!) de los problemas de confianza que acabamos de ver. Es un esfuerzo valiente, pero condenado, por salvar el patrón de callbacks de implosionar sobre sí mismo.

Por ejemplo, respecto a un manejo de errores más elegante, algunos diseños de API proporcionan callbacks divididos (uno para la notificación de éxito, otro para la notificación de error):

```js
function success(data) {
	console.log( data );
}

function failure(err) {
	console.error( err );
}

ajax( "http://some.url.1", success, failure );
```

En APIs con este diseño, a menudo el manejador de errores `failure()` es opcional, y si no se proporciona, se asumirá que quieres que los errores se traguen. Ugh.

**Nota:** Este diseño de callbacks divididos es lo que usa la API de Promise de ES6. Cubriremos las Promises de ES6 con mucho más detalle en el próximo capítulo.

Otro patrón de callback común se llama estilo "error-first" (a veces llamado "estilo Node", ya que también es la convención utilizada en casi todas las APIs de Node.js), donde el primer argumento de un único callback está reservado para un objeto de error (si lo hay). Si es éxito, este argumento estará vacío/falsy (y los argumentos siguientes serán los datos de éxito), pero si se está señalando un resultado de error, el primer argumento está definido/truthy (y normalmente no se pasa nada más):

```js
function response(err,data) {
	// error?
	if (err) {
		console.error( err );
	}
	// otherwise, assume success
	else {
		console.log( data );
	}
}

ajax( "http://some.url.1", response );
```

En ambos casos, se deben observar varias cosas.

Primero, no ha resuelto realmente la mayoría de los problemas de confianza como podría parecer. No hay nada en ninguno de los dos callbacks que prevenga o filtre invocaciones repetidas no deseadas. Además, las cosas son peores ahora, porque podrías recibir tanto señales de éxito como de error, o ninguna, y aun así tienes que codificar para cualquiera de esas condiciones.

Además, no pases por alto el hecho de que aunque es un patrón estándar que puedes emplear, es definitivamente más verboso y con más código repetitivo sin mucha reutilización, así que te cansarás de escribir todo eso para cada callback en tu aplicación.

¿Qué pasa con el problema de confianza de que nunca te llamen al callback? Si esto es una preocupación (¡y probablemente debería serlo!), probablemente necesitarás configurar un timeout que cancele el evento. Podrías hacer una utilidad (solo prueba de concepto mostrada) para ayudarte con eso:

```js
function timeoutify(fn,delay) {
	var intv = setTimeout( function(){
			intv = null;
			fn( new Error( "Timeout!" ) );
		}, delay )
	;

	return function() {
		// timeout hasn't happened yet?
		if (intv) {
			clearTimeout( intv );
			fn.apply( this, [ null ].concat( [].slice.call( arguments ) ) );
		}
	};
}
```

Así es como la usarías:

```js
// using "error-first style" callback design
function foo(err,data) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( data );
	}
}

ajax( "http://some.url.1", timeoutify( foo, 500 ) );
```

Otro problema de confianza es ser llamado "demasiado pronto." En términos específicos de la aplicación, esto puede involucrar ser llamado antes de que alguna tarea crítica se complete. Pero de manera más general, el problema es evidente en utilidades que pueden invocar el callback que proporcionas *ahora* (síncronamente), o *después* (asíncronamente).

Este no-determinismo alrededor del comportamiento síncrono-o-asíncrono casi siempre va a llevar a bugs muy difíciles de rastrear. En algunos círculos, el ficticio monstruo inductor de locura llamado Zalgo se usa para describir las pesadillas sync/async. "¡No liberes a Zalgo!" es un grito común, y lleva a un consejo muy sólido: siempre invoca los callbacks de forma asíncrona, incluso si eso es "inmediatamente" en el siguiente turno del event loop, para que todos los callbacks sean predeciblemente asíncronos.

**Nota:** Para más información sobre Zalgo, consulta "Don't Release Zalgo!" de Oren Golan (https://github.com/oren/oren.github.io/blob/master/posts/zalgo.md) y "Designing APIs for Asynchrony" de Isaac Z. Schlueter (http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony).

Considera:

```js
function result(data) {
	console.log( a );
}

var a = 0;

ajax( "..pre-cached-url..", result );
a++;
```

¿Este código imprimirá `0` (invocación síncrona del callback) o `1` (invocación asíncrona del callback)? Depende... de las condiciones.

Puedes ver lo rápidamente que la imprevisibilidad de Zalgo puede amenazar cualquier programa JS. Así que el consejo que suena tonto de "nunca liberes a Zalgo" es en realidad increíblemente común y sólido. Siempre sé asíncrono.

¿Qué pasa si no sabes si la API en cuestión siempre se ejecutará de forma asíncrona? Podrías inventar una utilidad como esta prueba de concepto `asyncify(..)`:

```js
function asyncify(fn) {
	var orig_fn = fn,
		intv = setTimeout( function(){
			intv = null;
			if (fn) fn();
		}, 0 )
	;

	fn = null;

	return function() {
		// firing too quickly, before `intv` timer has fired to
		// indicate async turn has passed?
		if (intv) {
			fn = orig_fn.bind.apply(
				orig_fn,
				// add the wrapper's `this` to the `bind(..)`
				// call parameters, as well as currying any
				// passed in parameters
				[this].concat( [].slice.call( arguments ) )
			);
		}
		// already async
		else {
			// invoke original function
			orig_fn.apply( this, arguments );
		}
	};
}
```

Usarías `asyncify(..)` así:

```js
function result(data) {
	console.log( a );
}

var a = 0;

ajax( "..pre-cached-url..", asyncify( result ) );
a++;
```

Independientemente de si la petición Ajax está en la caché e intenta llamar al callback de inmediato, o tiene que ser obtenida por la red y por lo tanto completarse después de forma asíncrona, este código siempre imprimirá `1` en lugar de `0` -- `result(..)` no puede evitar ser invocado de forma asíncrona, lo que significa que `a++` tiene la oportunidad de ejecutarse antes que `result(..)`.

¡Genial, otro problema de confianza "resuelto"! Pero es ineficiente, y una vez más más código repetitivo hinchado que pesa en tu proyecto.

Esa es simplemente la historia, una y otra vez, con los callbacks. Pueden hacer prácticamente todo lo que quieras, pero tienes que estar dispuesto a trabajar duro para conseguirlo, y muchas veces este esfuerzo es mucho más del que puedes o deberías gastar en tal razonamiento de código.

Puede que te encuentres deseando APIs integradas u otros mecanismos del lenguaje para abordar estos problemas. ¡Finalmente ES6 ha llegado a escena con algunas respuestas geniales, así que sigue leyendo!

## Repaso

Los callbacks son la unidad fundamental de asincronía en JS. Pero no son suficientes para el panorama en evolución de la programación asíncrona a medida que JS madura.

Primero, nuestros cerebros planifican las cosas de maneras secuenciales, bloqueantes y de un solo hilo semántico, pero los callbacks expresan el flujo asíncrono de una manera bastante no lineal y no secuencial, lo que hace que razonar adecuadamente sobre dicho código sea mucho más difícil. Código difícil de razonar es código malo que lleva a bugs malos.

Necesitamos una forma de expresar la asincronía de una manera más síncrona, secuencial y bloqueante, tal como lo hacen nuestros cerebros.

Segundo, y más importante, los callbacks sufren de *inversión de control* en el sentido de que implícitamente ceden el control a otra parte (¡a menudo una utilidad de terceros que no está bajo tu control!) para invocar la *continuación* de tu programa. Esta transferencia de control nos lleva a una preocupante lista de problemas de confianza, como si el callback es llamado más veces de las que esperamos.

Inventar lógica ad hoc para resolver estos problemas de confianza es posible, pero es más difícil de lo que debería ser, y produce código más tosco y más difícil de mantener, así como código que probablemente está insuficientemente protegido de estos peligros hasta que te muerden visiblemente los bugs.

Necesitamos una solución generalizada a **todos los problemas de confianza**, una que pueda ser reutilizada para tantos callbacks como creemos sin toda la sobrecarga de código repetitivo extra.

Necesitamos algo mejor que los callbacks. Nos han servido bien hasta este punto, pero el *futuro* de JavaScript demanda patrones asíncronos más sofisticados y capaces. Los capítulos siguientes de este libro se sumergirán en esas evoluciones emergentes.
