# You Don't Know JS: Async y Rendimiento
# Capítulo 6: Benchmarking y Optimización

Mientras que los primeros cuatro capítulos de este libro trataron sobre el rendimiento como patrón de codificación (asincronía y concurrencia), y el Capítulo 5 fue sobre el rendimiento a nivel de arquitectura macro del programa, este capítulo aborda el tema del rendimiento a nivel micro, enfocándose en expresiones/sentencias individuales.

Una de las áreas más comunes de curiosidad -- de hecho, algunos desarrolladores pueden llegar a obsesionarse bastante con esto -- es analizar y probar varias opciones sobre cómo escribir una línea o fragmento de código, y cuál es más rápida.

Vamos a examinar algunos de estos temas, pero es importante entender desde el principio que este capítulo **no** trata de alimentar la obsesión por la optimización de microrendimiento, como si un motor JS dado puede ejecutar `++a` más rápido que `a++`. El objetivo más importante de este capítulo es descubrir qué tipos de rendimiento en JS importan y cuáles no, *y cómo distinguir la diferencia*.

Pero incluso antes de llegar ahí, necesitamos explorar cómo medir de la manera más precisa y confiable el rendimiento de JS, porque hay toneladas de conceptos erróneos y mitos que han inundado nuestra base de conocimiento colectiva. Tenemos que filtrar toda esa basura para encontrar algo de claridad.

## Benchmarking

OK, es hora de empezar a disipar algunos conceptos erróneos. Apostaría a que la gran mayoría de los desarrolladores de JS, si se les pidiera medir la velocidad (tiempo de ejecución) de una operación determinada, inicialmente lo harían de una manera similar a esta:

```js
var start = (new Date()).getTime();	// or `Date.now()`

// do some operation

var end = (new Date()).getTime();

console.log( "Duration:", (end - start) );
```

Levanta la mano si eso es más o menos lo que se te vino a la mente. Sí, eso pensé. Hay muchas cosas mal con este enfoque, pero no te sientas mal; **todos hemos pasado por eso.**

¿Qué te dijo exactamente esa medición? Entender lo que dice y lo que no dice sobre el tiempo de ejecución de la operación en cuestión es clave para aprender cómo medir correctamente el rendimiento en JavaScript.

Si la duración reportada es `0`, podrías sentirte tentado a creer que tomó menos de un milisegundo. Pero eso no es muy preciso. Algunas plataformas no tienen precisión de un solo milisegundo, sino que solo actualizan el temporizador en incrementos más grandes. Por ejemplo, versiones antiguas de Windows (y por lo tanto IE) tenían solo una precisión de 15ms, lo que significa que la operación tiene que tomar al menos ese tiempo para que se reporte algo distinto de `0`.

Además, sea cual sea la duración reportada, lo único que realmente sabes es que la operación tomó aproximadamente ese tiempo en esa única ejecución exacta. Tienes casi cero confianza de que siempre se ejecutará a esa velocidad. No tienes idea de si el motor o el sistema tuvo algún tipo de interferencia en ese momento exacto, y que en otros momentos la operación podría ejecutarse más rápido.

¿Y si la duración reportada es `4`? ¿Estás más seguro de que tomó alrededor de cuatro milisegundos? No. Podría haber tomado menos tiempo, y podría haber habido algún otro retraso al obtener las marcas de tiempo de `start` o `end`.

Más preocupante aún, tampoco sabes si las circunstancias de esta prueba de operación no son excesivamente optimistas. Es posible que el motor JS haya encontrado una forma de optimizar tu caso de prueba aislado, pero en un programa más real esa optimización sería diluida o imposible, de modo que la operación se ejecutaría más lentamente que en tu prueba.

Entonces... ¿qué sabemos? Desafortunadamente, con esas observaciones declaradas, **sabemos muy poco.** Algo con tan baja confianza no es ni remotamente lo suficientemente bueno para basar tus determinaciones. Tu "benchmark" es básicamente inútil. Y peor, es peligroso porque implica una falsa confianza, no solo para ti sino también para otros que no piensen críticamente sobre las condiciones que llevaron a esos resultados.

### Repetición

"OK," dices ahora, "Simplemente pon un bucle alrededor para que toda la prueba tome más tiempo." Si repites una operación 100 veces, y todo ese bucle supuestamente toma un total de 137ms, entonces puedes simplemente dividir por 100 y obtener una duración promedio de 1.37ms para cada operación, ¿verdad?

Bueno, no exactamente.

Un promedio matemático simple por sí solo definitivamente no es suficiente para hacer juicios sobre rendimiento que planees extrapolar a la totalidad de tu aplicación. Con cien iteraciones, incluso un par de valores atípicos (altos o bajos) pueden sesgar el promedio, y luego cuando aplicas esa conclusión repetidamente, inflas el sesgo aún más allá de la credibilidad.

En lugar de ejecutar un número fijo de iteraciones, puedes elegir ejecutar el bucle de pruebas hasta que haya pasado una cierta cantidad de tiempo. Eso podría ser más confiable, pero ¿cómo decides cuánto tiempo ejecutar? Podrías suponer que debería ser algún múltiplo de cuánto tarda tu operación en ejecutarse una vez. Incorrecto.

En realidad, la cantidad de tiempo de repetición debería basarse en la precisión del temporizador que estás usando, específicamente para minimizar las posibilidades de imprecisión. Cuanto menos preciso sea tu temporizador, más tiempo necesitarás ejecutar para asegurarte de haber minimizado el porcentaje de error. Un temporizador de 15ms es bastante malo para benchmarking preciso; para minimizar su incertidumbre (también conocida como "tasa de error") a menos del 1%, necesitas ejecutar cada ciclo de iteraciones de prueba durante 750ms. Un temporizador de 1ms solo necesita que un ciclo se ejecute durante 50ms para obtener la misma confianza.

Pero entonces, eso es solo una muestra. Para estar seguro de que estás eliminando el sesgo, querrás muchas muestras para promediar. También querrás entender algo sobre qué tan lenta es la peor muestra, qué tan rápida es la mejor muestra, qué tan separados están esos mejores y peores casos, y así sucesivamente. Querrás saber no solo un número que te diga qué tan rápido se ejecutó algo, sino también tener alguna medida cuantificable de qué tan confiable es ese número.

Además, probablemente quieras combinar estas diferentes técnicas (así como otras), para obtener el mejor equilibrio de todos los enfoques posibles.

Todo eso es solo lo mínimo para empezar. Si has estado abordando el benchmarking de rendimiento con algo menos serio de lo que acabo de describir superficialmente, bueno... "no sabes: benchmarking adecuado."

### Benchmark.js

Cualquier benchmark relevante y confiable debería estar basado en prácticas estadísticamente sólidas. No voy a escribir un capítulo sobre estadística aquí, así que pasaré por encima de algunos términos: desviación estándar, varianza, margen de error. Si no sabes lo que realmente significan esos términos -- yo tomé una clase de estadística en la universidad y todavía estoy un poco confuso con ellos -- realmente no estás cualificado para escribir tu propia lógica de benchmarking.

Afortunadamente, personas inteligentes como John-David Dalton y Mathias Bynens sí entienden estos conceptos, y escribieron una herramienta de benchmarking estadísticamente sólida llamada Benchmark.js (http://benchmarkjs.com/). Así que puedo acabar con el suspenso simplemente diciendo: "solo usa esa herramienta."

No voy a repetir toda su documentación sobre cómo funciona Benchmark.js; tienen fantástica documentación de API (http://benchmarkjs.com/docs) que deberías leer. También hay algunos excelentes (http://calendar.perfplanet.com/2010/bulletproof-javascript-benchmarks/) artículos (http://monsur.hossa.in/2012/12/11/benchmarkjs.html) sobre más detalles y metodología.

Pero solo como ilustración rápida, así es como podrías usar Benchmark.js para ejecutar una prueba de rendimiento rápida:

```js
function foo() {
	// operation(s) to test
}

var bench = new Benchmark(
	"foo test",				// test name
	foo,					// function to test (just contents)
	{
		// ..				// optional extra options (see docs)
	}
);

bench.hz;					// number of operations per second
bench.stats.moe;			// margin of error
bench.stats.variance;		// variance across samples
// ..
```

Hay *mucho* más que aprender sobre el uso de Benchmark.js además de esta mirada que estoy incluyendo aquí. Pero el punto es que está manejando todas las complejidades de configurar un benchmark de rendimiento justo, confiable y válido para una pieza dada de código JavaScript. Si vas a intentar probar y medir tu código, esta biblioteca es el primer lugar al que deberías recurrir.

Estamos mostrando aquí el uso para probar una sola operación como X, pero es bastante común que quieras comparar X con Y. Esto es fácil de hacer simplemente configurando dos pruebas diferentes en una "Suite" (una característica organizativa de Benchmark.js). Luego, las ejecutas cara a cara, y comparas las estadísticas para concluir si X o Y fue más rápido.

Benchmark.js por supuesto puede usarse para probar JavaScript en un navegador (consulta la sección "jsPerf.com" más adelante en este capítulo), pero también puede ejecutarse en entornos no-navegador (Node.js, etc.).

Un caso de uso potencial en gran parte sin explotar para Benchmark.js es usarlo en tus entornos de desarrollo o control de calidad para ejecutar pruebas automatizadas de regresión de rendimiento contra las partes de ruta crítica del JavaScript de tu aplicación. Similar a cómo podrías ejecutar suites de pruebas unitarias antes del despliegue, también puedes comparar el rendimiento con benchmarks anteriores para monitorear si estás mejorando o degradando el rendimiento de la aplicación.

#### Setup/Teardown

En el fragmento de código anterior, pasamos por encima del objeto de "opciones extra" `{ .. }`. Pero hay dos opciones que debemos discutir: `setup` y `teardown`.

Estas dos opciones te permiten definir funciones que se llaman antes y después de que se ejecute tu caso de prueba.

Es increíblemente importante entender que tu código de `setup` y `teardown` **no se ejecuta para cada iteración de prueba**. La mejor forma de pensarlo es que hay un bucle exterior (ciclos repetidos) y un bucle interior (iteraciones de prueba repetidas). `setup` y `teardown` se ejecutan al principio y al final de cada iteración del *bucle exterior* (también conocido como ciclo), pero no dentro del bucle interior.

¿Por qué importa esto? Imaginemos que tienes un caso de prueba que se ve así:

```js
a = a + "w";
b = a.charAt( 1 );
```

Luego, configuras tu `setup` de prueba de la siguiente manera:

```js
var a = "x";
```

Tu tentación es probablemente creer que `a` comienza como `"x"` para cada iteración de prueba.

¡Pero no es así! Está inicializando `a` como `"x"` para cada ciclo de prueba, y luego tus concatenaciones repetidas de `+ "w"` estarán haciendo un valor de `a` cada vez más grande, aunque solo estés accediendo al carácter `"w"` en la posición `1`.

Donde esto más comúnmente te muerde es cuando haces cambios con efectos secundarios a algo como el DOM, como agregar un elemento hijo. Podrías pensar que tu elemento padre se establece como vacío cada vez, pero en realidad se le están agregando muchos elementos, y eso puede sesgar significativamente los resultados de tus pruebas.

## El Contexto es Rey

No olvides verificar el contexto de un benchmark de rendimiento particular, especialmente una comparación entre las tareas X e Y. Solo porque tu prueba revele que X es más rápido que Y no significa que la conclusión "X es más rápido que Y" sea realmente relevante.

Por ejemplo, digamos que una prueba de rendimiento revela que X ejecuta 10,000,000 operaciones por segundo, e Y ejecuta 8,000,000 operaciones por segundo. Podrías afirmar que Y es un 20% más lento que X, y estarías matemáticamente correcto, pero tu afirmación no tiene tanto peso como podrías pensar.

Pensemos en los resultados más críticamente: 10,000,000 operaciones por segundo son 10,000 operaciones por milisegundo, y 10 operaciones por microsegundo. En otras palabras, una sola operación toma 0.1 microsegundos, o 100 nanosegundos. Es difícil imaginar lo pequeño que son 100ns, pero para comparar, se cita frecuentemente que el ojo humano generalmente no es capaz de distinguir nada que dure menos de 100ms, lo cual es un millón de veces más lento que la velocidad de 100ns de la operación X.

Incluso estudios científicos recientes que muestran que quizás el cerebro puede procesar tan rápido como en 13ms (aproximadamente 8 veces más rápido de lo que se afirmaba anteriormente) significarían que X todavía se ejecuta 125,000 veces más rápido de lo que el cerebro humano puede percibir que algo distinto está ocurriendo. **X es realmente, realmente rápido.**

Pero más importante aún, hablemos de la diferencia entre X e Y, la diferencia de 2,000,000 operaciones por segundo. Si X toma 100ns e Y toma 80ns, la diferencia es de 20ns, que en el mejor de los casos sigue siendo una 650-milésima parte del intervalo que el cerebro humano puede percibir.

¿Cuál es mi punto? **¡Nada de esta diferencia de rendimiento importa, en absoluto!**

Pero espera, ¿y si esta operación va a ocurrir muchas veces seguidas? Entonces la diferencia podría acumularse, ¿verdad?

OK, entonces lo que estamos preguntando es, ¿qué tan probable es que la operación X se ejecute una y otra vez, una justo después de la otra, y que esto tiene que suceder 650,000 veces solo para obtener un atisbo de esperanza de que el cerebro humano pueda percibirlo? Más probablemente, tendría que suceder de 5,000,000 a 10,000,000 de veces juntas en un bucle cerrado para siquiera acercarse a la relevancia.

Mientras que el científico de la computación en ti podría protestar que esto es posible, la voz más fuerte del realismo en ti debería verificar la cordura de qué tan probable o improbable es eso realmente. Incluso si es relevante en raras ocasiones, es irrelevante en la mayoría de las situaciones.

La gran mayoría de tus resultados de benchmark en operaciones diminutas -- como el mito de `++x` vs `x++` -- **son simplemente totalmente falsos** para respaldar la conclusión de que X debería preferirse sobre Y con base en el rendimiento.

### Optimizaciones del Motor

Simplemente no puedes extrapolar de forma confiable que si X fue 10 microsegundos más rápido que Y en tu prueba aislada, eso significa que X siempre es más rápido que Y y siempre debería usarse. Así no es como funciona el rendimiento. Es muchísimo más complicado.

Por ejemplo, imaginemos (puramente hipotético) que pruebas algún comportamiento de microrendimiento como comparar:

```js
var twelve = "12";
var foo = "foo";

// test 1
var X1 = parseInt( twelve );
var X2 = parseInt( foo );

// test 2
var Y1 = Number( twelve );
var Y2 = Number( foo );
```

Si entiendes lo que hace `parseInt(..)` en comparación con `Number(..)`, podrías intuir que `parseInt(..)` potencialmente tiene "más trabajo" que hacer, especialmente en el caso de `foo`. O podrías intuir que deberían tener la misma cantidad de trabajo que hacer en el caso de `foo`, ya que ambos deberían poder detenerse en el primer carácter `"f"`.

¿Qué intuición es correcta? Honestamente no lo sé. Pero voy a argumentar que no importa cuál sea tu intuición. ¿Cuáles podrían ser los resultados cuando lo pruebes? De nuevo, estoy inventando un caso puramente hipotético aquí, realmente no lo he probado, ni me importa.

Supongamos que la prueba regresa y dice que `X` e `Y` son estadísticamente idénticos. ¿Has confirmado entonces tu intuición sobre el asunto del carácter `"f"`? No.

Es posible en nuestro hipotético que el motor podría reconocer que las variables `twelve` y `foo` solo se están usando en un lugar en cada prueba, y entonces podría decidir hacer inline de esos valores. Luego podría darse cuenta de que `Number( "12" )` simplemente puede reemplazarse por `12`. Y quizás llega a la misma conclusión con `parseInt(..)`, o quizás no.

O la heurística de eliminación de código muerto de un motor podría activarse, y podría darse cuenta de que las variables `X` e `Y` no se están usando, así que declararlas es irrelevante, por lo que termina sin hacer nada en ninguna de las pruebas.

Y todo eso está hecho solo con la mentalidad de suposiciones sobre una sola ejecución de prueba. Los motores modernos son fantásticamente más complicados de lo que estamos intuyendo aquí. Hacen todo tipo de trucos, como rastrear y seguir cómo se comporta un fragmento de código durante un corto período de tiempo, o con un conjunto particularmente restringido de entradas.

¿Y si el motor optimiza de cierta manera por la entrada fija, pero en tu programa real le das entrada más variada y las decisiones de optimización resultan diferentes (¡o no se aplican en absoluto!)? ¿O qué pasa si el motor activa optimizaciones porque ve el código ejecutándose decenas de miles de veces por la utilidad de benchmarking, pero en tu programa real solo se ejecutará un centenar de veces en proximidad cercana, y bajo esas condiciones el motor determina que las optimizaciones no valen la pena?

Y todas esas optimizaciones que acabamos de hipotetizar podrían ocurrir en nuestra prueba restringida pero quizás el motor no las haría en un programa más complejo (por varias razones). O podría ser al revés -- el motor podría no optimizar código tan trivial pero podría estar más inclinado a optimizarlo más agresivamente cuando el sistema ya está más exigido por un programa más sofisticado.

El punto que estoy tratando de hacer es que realmente no sabes con certeza exactamente qué está pasando bajo el capó. Todas las conjeturas e hipótesis que puedas reunir no equivalen a casi nada concreto para tomar tales decisiones realmente.

¿Eso significa que realmente no puedes hacer ninguna prueba útil? **¡Definitivamente no!**

A lo que esto se reduce es que probar código *no real* te da resultados *no reales*. En la medida de lo posible y práctico, deberías probar fragmentos reales, no triviales de tu código, y bajo las mejores condiciones reales que puedas realmente esperar. Solo entonces los resultados que obtengas tendrán una oportunidad de aproximarse a la realidad.

Los microbenchmarks como `++x` vs `x++` son tan increíblemente propensos a ser falsos, que bien podríamos simplemente asumir que lo son.

## jsPerf.com

Aunque Benchmark.js es útil para probar el rendimiento de tu código en cualquier entorno JS que estés ejecutando, no se puede enfatizar lo suficiente que necesitas recopilar resultados de pruebas de muchos entornos diferentes (navegadores de escritorio, dispositivos móviles, etc.) si quieres tener alguna esperanza de conclusiones de prueba confiables.

Por ejemplo, Chrome en una máquina de escritorio de alta gama probablemente no va a rendir igual que Chrome móvil en un smartphone. Y un smartphone con la batería completamente cargada probablemente no va a rendir igual que un smartphone con un 2% de batería restante, cuando el dispositivo está empezando a reducir la potencia de la radio y el procesador.

Si quieres hacer afirmaciones como "X es más rápido que Y" en cualquier sentido razonable a través de más de un solo entorno, vas a necesitar probar en tantos de esos entornos del mundo real como sea posible. Solo porque Chrome ejecute alguna operación X más rápido que Y no significa que todos los navegadores lo hagan. Y por supuesto probablemente también querrás cruzar los resultados de múltiples ejecuciones de prueba en navegadores con la demografía de tus usuarios.

Hay un sitio web increíble para este propósito llamado jsPerf (http://jsperf.com). Usa la biblioteca Benchmark.js de la que hablamos antes para ejecutar pruebas estadísticamente precisas y confiables, y hace la prueba en una URL públicamente disponible que puedes compartir con otros.

Cada vez que se ejecuta una prueba, los resultados se recopilan y persisten con la prueba, y los resultados acumulados de las pruebas se grafican en la página para que cualquiera los vea.

Al crear una prueba en el sitio, comienzas con dos casos de prueba para completar, pero puedes agregar tantos como necesites. También tienes la capacidad de configurar código de `setup` que se ejecuta al inicio de cada ciclo de prueba y código de `teardown` que se ejecuta al final de cada ciclo.

**Nota:** Un truco para hacer solo un caso de prueba (si estás midiendo un solo enfoque en lugar de una comparación cara a cara) es llenar los cuadros de entrada de la segunda prueba con texto de relleno en la primera creación, luego editar la prueba y dejar la segunda prueba en blanco, lo cual la eliminará. Siempre puedes agregar más casos de prueba después.

Puedes definir la configuración inicial de la página (importar bibliotecas, definir funciones auxiliares de utilidad, declarar variables, etc.). También hay opciones para definir el comportamiento de setup y teardown si es necesario -- consulta la sección "Setup/Teardown" en la discusión de Benchmark.js anterior.

### Verificación de Cordura

jsPerf es un recurso fantástico, pero hay una gran cantidad de pruebas publicadas que cuando las analizas son bastante defectuosas o falsas, por cualquier variedad de razones como las descritas hasta ahora en este capítulo.

Considera:

```js
// Case 1
var x = [];
for (var i=0; i<10; i++) {
	x[i] = "x";
}

// Case 2
var x = [];
for (var i=0; i<10; i++) {
	x[x.length] = "x";
}

// Case 3
var x = [];
for (var i=0; i<10; i++) {
	x.push( "x" );
}
```

Algunas observaciones para reflexionar sobre este escenario de prueba:

* Es extremadamente común que los desarrolladores pongan sus propios bucles en los casos de prueba, y olvidan que Benchmark.js ya hace toda la repetición que necesitas. Hay una muy alta probabilidad de que los bucles `for` en estos casos sean ruido totalmente innecesario.
* La declaración e inicialización de `x` está incluida en cada caso de prueba, posiblemente innecesariamente. Recuerda de antes que si `x = []` estuviera en el código de `setup`, en realidad no se ejecutaría antes de cada iteración de prueba, sino una vez al inicio de cada ciclo. Eso significa que `x` continuaría creciendo bastante, no solo hasta el tamaño `10` implicado por los bucles `for`.

   Entonces, ¿la intención es asegurarse de que las pruebas estén restringidas solo a cómo se comporta el motor JS con arrays muy pequeños (tamaño `10`)? Esa *podría* ser la intención, pero si lo es, tienes que considerar si eso no es enfocarse demasiado en detalles matizados de implementación interna.

   Por otro lado, ¿la intención de la prueba abarca el contexto de que los arrays en realidad crecerán bastante? ¿Es el comportamiento de los motores JS con arrays más grandes relevante y preciso cuando se compara con el uso previsto en el mundo real?

* ¿Es la intención averiguar cuánto agregan `x.length` o `x.push(..)` al rendimiento de la operación de agregar al array `x`? OK, eso podría ser algo válido para probar. Pero de nuevo, `push(..)` es una llamada a función, así que por supuesto va a ser más lento que el acceso con `[..]`. Posiblemente, los casos 1 y 2 son más justos que el caso 3.


Aquí hay otro ejemplo que ilustra un error común de comparar peras con manzanas:

```js
// Case 1
var x = ["John","Albert","Sue","Frank","Bob"];
x.sort();

// Case 2
var x = ["John","Albert","Sue","Frank","Bob"];
x.sort( function mySort(a,b){
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
} );
```

Aquí, la intención obvia es averiguar cuánto más lento es el comparador personalizado `mySort(..)` que el comparador predeterminado integrado. Pero al especificar la función `mySort(..)` como una expresión de función inline, has creado una prueba injusta/falsa. Aquí, el segundo caso no solo está probando una función JS personalizada del usuario, **sino que también está probando crear una nueva expresión de función para cada iteración.**

¿Te sorprendería descubrir que si ejecutas una prueba similar pero la actualizas para aislar solo la creación de una expresión de función inline versus usar una función pre-declarada, la creación de la expresión de función inline puede ser del 2% al 20% más lenta?

A menos que tu intención con esta prueba *sea* considerar el "costo" de creación de la expresión de función inline, una prueba mejor/más justa pondría la declaración de `mySort(..)` en la configuración de la página -- no la pongas en el `setup` de la prueba ya que sería una re-declaración innecesaria para cada ciclo -- y simplemente la referenciaría por nombre en el caso de prueba: `x.sort(mySort)`.

Basándonos en el ejemplo anterior, otro escollo es evitar u agregar opacamente "trabajo extra" a un caso de prueba que crea un escenario de comparar peras con manzanas:

```js
// Case 1
var x = [12,-14,0,3,18,0,2.9];
x.sort();

// Case 2
var x = [12,-14,0,3,18,0,2.9];
x.sort( function mySort(a,b){
	return a - b;
} );
```

Dejando de lado el escollo de la expresión de función inline mencionado anteriormente, el `mySort(..)` del segundo caso funciona en este caso porque le has proporcionado números, pero por supuesto habría fallado con strings. El primer caso no lanza un error, ¡pero en realidad se comporta diferente y tiene un resultado diferente! Debería ser obvio, pero: **un resultado diferente entre dos casos de prueba casi con certeza invalida toda la prueba.**

Pero más allá de los resultados diferentes, en este caso, el comparador integrado de `sort(..)` en realidad está haciendo "trabajo extra" que `mySort()` no hace, ya que el integrado convierte los valores comparados a strings y hace una comparación lexicográfica. El primer fragmento resulta en `[-14, 0, 0, 12, 18, 2.9, 3]` mientras que el segundo fragmento resulta (probablemente más preciso según la intención) en `[-14, 0, 0, 2.9, 3, 12, 18]`.

Así que esa prueba es injusta porque en realidad no está haciendo la misma tarea entre los casos. Cualquier resultado que obtengas es falso.

Estos mismos escollos pueden ser incluso mucho más sutiles:

```js
// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x;
var y = x ? 1 : 2;
```

Aquí, la intención podría ser probar el impacto en el rendimiento de la coerción a Boolean que el operador `? :` hará si la expresión `x` no es ya un Boolean (consulta el título *Types & Grammar* de esta serie de libros). Entonces, aparentemente estás de acuerdo con el hecho de que hay trabajo extra para hacer la coerción en el segundo caso.

¿El problema sutil? Estás estableciendo el valor de `x` en el primer caso y no lo estás estableciendo en el otro, así que en realidad estás haciendo trabajo en el primer caso que no estás haciendo en el segundo. Para eliminar cualquier sesgo potencial (aunque menor), intenta:

```js
// Case 1
var x = false;
var y = x ? 1 : 2;

// Case 2
var x = undefined;
var y = x ? 1 : 2;
```

Ahora hay una asignación en ambos casos, así que lo que quieres probar -- la coerción de `x` o no -- probablemente ha sido aislado y probado con más precisión.

## Escribiendo Buenas Pruebas

Déjame ver si puedo articular el punto más grande que estoy tratando de hacer aquí.

La buena creación de pruebas requiere un pensamiento analítico cuidadoso sobre qué diferencias existen entre dos casos de prueba y si las diferencias entre ellos son *intencionales* o *no intencionales*.

Las diferencias intencionales son por supuesto normales y están bien, pero es demasiado fácil crear diferencias no intencionales que sesgan tus resultados. Tienes que ser realmente, realmente cuidadoso para evitar ese sesgo. Además, podrías tener la intención de una diferencia pero podría no ser obvio para otros lectores de tu prueba cuál fue tu intención, así que podrían dudar (¡o confiar!) de tu prueba incorrectamente. ¿Cómo arreglas eso?

**Escribe pruebas mejores y más claras.** Pero también, tómate el tiempo para documentar (usando el campo "Description" de jsPerf.com y/o comentarios de código) exactamente cuál es la intención de tu prueba, incluso hasta el detalle matizado. Señala las diferencias intencionales, lo cual ayudará a otros y a tu yo futuro a identificar mejor las diferencias no intencionales que podrían estar sesgando los resultados de la prueba.

Aísla las cosas que no son relevantes para tu prueba pre-declarándolas en la configuración de la página o de la prueba para que estén fuera de las partes cronometradas de la prueba.

En lugar de tratar de enfocarte en un pequeño fragmento de tu código real y hacer benchmarking solo de esa pieza fuera de contexto, las pruebas y benchmarks son mejores cuando incluyen un contexto más amplio (aunque todavía relevante). Esas pruebas también tienden a ejecutarse más lentamente, lo que significa que cualquier diferencia que identifiques es más relevante en contexto.

## Microrendimiento

OK, hasta ahora hemos estado rodeando varios temas de microrendimiento y generalmente mirándolos con desdén por obsesionarse con ellos. Quiero tomar un momento para abordarlos directamente.

Lo primero con lo que necesitas sentirte más cómodo al pensar en el benchmarking de rendimiento de tu código es que el código que escribes no siempre es el código que el motor realmente ejecuta. Examinamos brevemente ese tema en el Capítulo 1 cuando discutimos el reordenamiento de sentencias por parte del compilador, pero aquí vamos a sugerir que el compilador a veces puede decidir ejecutar código diferente al que escribiste, no solo en diferentes órdenes sino diferente en sustancia.

Consideremos este fragmento de código:

```js
var foo = 41;

(function(){
	(function(){
		(function(baz){
			var bar = foo + baz;
			// ..
		})(1);
	})();
})();
```

Podrías pensar que la referencia a `foo` en la función más interna necesita hacer una búsqueda de alcance de tres niveles. Cubrimos en el título *Scope & Closures* de esta serie de libros cómo funciona el alcance léxico, y el hecho de que el compilador generalmente almacena en caché tales búsquedas para que referenciar `foo` desde diferentes alcances no "cueste" realmente prácticamente nada extra.

Pero hay algo más profundo a considerar. ¿Qué pasa si el compilador se da cuenta de que `foo` no está referenciado en ningún otro lugar excepto esa única ubicación, y además nota que el valor nunca es nada excepto el `41` como se muestra?

¿No es bastante posible y aceptable que el compilador JS pueda decidir simplemente eliminar la variable `foo` por completo, y hacer *inline* del valor, algo así:

```js
(function(){
	(function(){
		(function(baz){
			var bar = 41 + baz;
			// ..
		})(1);
	})();
})();
```

**Nota:** Por supuesto, el compilador probablemente también podría hacer un análisis y reescritura similar con la variable `baz` aquí.

Cuando empiezas a pensar en tu código JS como una pista o sugerencia para el motor de qué hacer, en lugar de un requisito literal, te das cuenta de que gran parte de la obsesión sobre minucias sintácticas discretas probablemente no tiene fundamento.

Otro ejemplo:

```js
function factorial(n) {
	if (n < 2) return 1;
	return n * factorial( n - 1 );
}

factorial( 5 );		// 120
```

Ah, ¡el buen y clásico algoritmo "factorial"! Podrías asumir que el motor JS ejecutará ese código más o menos tal cual. Y para ser honesto, podría hacerlo -- realmente no estoy seguro.

Pero como anécdota, el mismo código expresado en C y compilado con optimizaciones avanzadas resultaría en que el compilador se diera cuenta de que la llamada `factorial(5)` puede simplemente ser reemplazada con el valor constante `120`, eliminando la función y la llamada por completo.

Además, algunos motores tienen una práctica llamada "desenrollo de recursión", donde pueden darse cuenta de que la recursión que has expresado en realidad puede hacerse "más fácilmente" (es decir, de manera más óptima) con un bucle. Es posible que el código anterior pudiera ser *reescrito* por un motor JS para ejecutarse como:

```js
function factorial(n) {
	if (n < 2) return 1;

	var res = 1;
	for (var i=n; i>1; i--) {
		res *= i;
	}
	return res;
}

factorial( 5 );		// 120
```

Ahora, imaginemos que en el fragmento anterior estabas preocupado por si `n * factorial(n-1)` o `n *= factorial(--n)` se ejecuta más rápido. Quizás incluso hiciste un benchmark de rendimiento para tratar de descubrir cuál era mejor. ¡Pero te pierdes el hecho de que en el contexto más amplio, el motor puede no ejecutar ninguna de las dos líneas de código porque puede desenrollar la recursión!

Hablando de `--`, `--n` versus `n--` a menudo se cita como uno de esos lugares donde puedes optimizar eligiendo la versión `--n`, porque teóricamente requiere menos esfuerzo a nivel de ensamblador del procesamiento.

Ese tipo de obsesión es básicamente sin sentido en JavaScript moderno. Ese es el tipo de cosa que deberías dejar que el motor se encargue. Deberías escribir el código que tenga más sentido. Compara estos tres bucles `for`:

```js
// Option 1
for (var i=0; i<10; i++) {
	console.log( i );
}

// Option 2
for (var i=0; i<10; ++i) {
	console.log( i );
}

// Option 3
for (var i=-1; ++i<10; ) {
	console.log( i );
}
```

Incluso si tienes alguna teoría donde la segunda o tercera opción es más eficiente que la primera opción por un poco, lo cual es dudoso en el mejor de los casos, el tercer bucle es más confuso porque tienes que empezar con `-1` para `i` para compensar el hecho de que se usa el pre-incremento `++i`. Y la diferencia entre la primera y segunda opciones es realmente bastante irrelevante.

Es completamente posible que un motor JS vea un lugar donde se usa `i++` y se dé cuenta de que puede reemplazarlo de manera segura con el equivalente `++i`, lo que significa que tu tiempo dedicado a decidir cuál elegir fue completamente desperdiciado y el resultado es irrelevante.

Aquí hay otro ejemplo común de obsesión tonta por el microrendimiento:

```js
var x = [ .. ];

// Option 1
for (var i=0; i < x.length; i++) {
	// ..
}

// Option 2
for (var i=0, len = x.length; i < len; i++) {
	// ..
}
```

La teoría aquí dice que deberías cachear la longitud del array `x` en la variable `len`, porque aparentemente no cambia, para evitar pagar el precio de consultar `x.length` en cada iteración del bucle.

Si ejecutas benchmarks de rendimiento comparando el uso de `x.length` con cachearlo en una variable `len`, encontrarás que aunque la teoría suena bien, en la práctica cualquier diferencia medida es estadísticamente completamente irrelevante.

De hecho, en algunos motores como v8, se puede demostrar (http://mrale.ph/blog/2014/12/24/array-length-caching.html) que podrías empeorar las cosas ligeramente al pre-cachear la longitud en lugar de dejar que el motor lo resuelva por ti. No intentes ser más listo que tu motor de JavaScript, probablemente perderás cuando se trata de optimizaciones de rendimiento.

### No Todos los Motores Son Iguales

Los diferentes motores JS en varios navegadores pueden ser todos "conformes con la especificación" mientras tienen formas radicalmente diferentes de manejar el código. La especificación de JS no requiere nada relacionado con el rendimiento -- bueno, excepto el "Tail Call Optimization" de ES6 cubierto más adelante en este capítulo.

Los motores son libres de decidir que una operación recibirá su atención para optimizar, quizás intercambiando por menor rendimiento en otra operación. Puede ser muy tenue encontrar un enfoque para una operación que siempre se ejecute más rápido en todos los navegadores.

Hay un movimiento entre algunos en la comunidad de desarrolladores JS, especialmente aquellos que trabajan con Node.js, de analizar los detalles específicos de implementación interna del motor JavaScript v8 y tomar decisiones sobre escribir código JS que esté adaptado para aprovechar al máximo cómo funciona v8. De hecho puedes lograr un grado sorprendentemente alto de optimización de rendimiento con tales esfuerzos, así que la recompensa por el esfuerzo puede ser bastante alta.

Algunos ejemplos comúnmente citados (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers) para v8:

* No pases la variable `arguments` de una función a ninguna otra función, ya que esa "fuga" ralentiza la implementación de la función.
* Aísla un `try..catch` en su propia función. Los navegadores tienen dificultades para optimizar cualquier función con un `try..catch` en ella, así que mover esa construcción a su propia función significa que contienes el daño de la des-optimización mientras dejas que el código circundante sea optimizable.

Pero en lugar de enfocarnos en esos consejos específicamente, hagamos una verificación de cordura del enfoque de optimización solo para v8 en un sentido general.

¿Realmente estás escribiendo código que solo necesita ejecutarse en un motor JS? Incluso si tu código está completamente destinado a Node.js *ahora mismo*, ¿es confiable la suposición de que v8 *siempre* será el motor JS utilizado? ¿Es posible que algún día dentro de unos años, haya otra plataforma JS del lado del servidor además de Node.js en la que elijas ejecutar tu código? ¿Qué pasa si lo que optimizaste antes ahora es una forma mucho más lenta de hacer esa operación en el nuevo motor?

¿O qué pasa si tu código siempre sigue ejecutándose en v8 de aquí en adelante, pero v8 decide en algún momento cambiar la forma en que funciona algún conjunto de operaciones de tal manera que lo que antes era rápido ahora es lento, y viceversa?

Estos escenarios tampoco son solo teóricos. Solía ser más rápido poner múltiples valores de string en un array y luego llamar a `join("")` en el array para concatenar los valores que simplemente usar la concatenación directa con `+` en los valores. La razón histórica de esto es matizada, pero tiene que ver con detalles de implementación interna sobre cómo los valores de string se almacenaban y gestionaban en memoria.

Como resultado, los consejos de "mejores prácticas" de la época se diseminaron por toda la industria sugiriendo que los desarrolladores siempre usaran el enfoque de `join(..)` con arrays. Y muchos lo siguieron.

Excepto que, en algún punto del camino, los motores JS cambiaron sus enfoques para la gestión interna de strings, y específicamente implementaron optimizaciones para la concatenación con `+`. No ralentizaron `join(..)` per se, pero pusieron más esfuerzo en ayudar al uso de `+`, ya que todavía era bastante más extendido.

**Nota:** La práctica de estandarizar u optimizar un enfoque particular basado principalmente en su uso extendido existente a menudo se llama (metafóricamente) "pavimentar el camino de las vacas."

Una vez que ese nuevo enfoque para manejar strings y concatenación se asentó, desafortunadamente todo el código en circulación que estaba usando `join(..)` de arrays para concatenar strings era entonces sub-óptimo.

Otro ejemplo: en un momento dado, el navegador Opera difería de otros navegadores en cómo manejaba el boxing/unboxing de objetos envoltorio de primitivos (consulta el título *Types & Grammar* de esta serie de libros). Como tal, su consejo a los desarrolladores era usar un objeto `String` en lugar del valor primitivo `string` si se necesitaba acceder a propiedades como `length` o métodos como `charAt(..)`. Este consejo pudo haber sido correcto para Opera en ese momento, pero era literalmente completamente opuesto para otros navegadores principales contemporáneos, ya que tenían optimizaciones específicamente para las primitivas `string` y no para sus contrapartes de objetos envoltorio.

Creo que estas diversas trampas son al menos posibles, si no probables, para código incluso hoy en día. Así que soy muy cauteloso al hacer optimizaciones de rendimiento de amplio alcance en mi código JS basándome puramente en detalles de implementación del motor, **especialmente si esos detalles solo son verdaderos para un solo motor**.

Lo inverso también es algo de lo que hay que cuidarse: no deberías necesariamente cambiar un fragmento de código para sortear la dificultad de un motor para ejecutar un fragmento de código de una manera con rendimiento aceptable.

Históricamente, IE ha sido el blanco de muchas de esas frustraciones, dado que ha habido muchos escenarios en versiones antiguas de IE donde tenía dificultades con algún aspecto de rendimiento con el que otros navegadores principales de la época parecían no tener mucho problema. La discusión sobre concatenación de strings que acabamos de tener era en realidad una preocupación real en los días de IE6 e IE7, donde era posible obtener mejor rendimiento de `join(..)` que de `+`.

Pero es problemático sugerir que la dificultad de rendimiento de un solo navegador es justificación para usar un enfoque de código que posiblemente podría ser sub-óptimo en todos los demás navegadores. Incluso si el navegador en cuestión tiene una gran cuota de mercado para la audiencia de tu sitio, puede ser más práctico escribir el código apropiado y confiar en que el navegador se actualice con mejores optimizaciones eventualmente.

"No hay nada más permanente que un hack temporal." Lo más probable es que el código que escribas ahora para sortear algún bug de rendimiento probablemente sobreviva al bug de rendimiento en el propio navegador.

En los días cuando un navegador solo se actualizaba una vez cada cinco años, esa era una decisión más difícil de tomar. Pero como están las cosas ahora, los navegadores de todo tipo se están actualizando a un ritmo mucho más rápido (aunque obviamente el mundo móvil todavía va rezagado), y todos están compitiendo para optimizar las características web cada vez mejor.

Si te encuentras con un caso donde un navegador *tiene* una verruga de rendimiento que otros no sufren, asegúrate de reportarlo a ellos a través de cualquier medio que tengas disponible. La mayoría de los navegadores tienen rastreadores de bugs públicos abiertos adecuados para este propósito.

**Consejo:** Solo sugeriría sortear un problema de rendimiento en un navegador si fuera un problema realmente drástico que impide el funcionamiento, no solo una molestia o frustración. Y tendría mucho cuidado de verificar que el hack de rendimiento no tuviera efectos secundarios negativos notables en otro navegador.

### El Panorama General

En lugar de preocuparte por todas estas sutilezas de microrendimiento, deberíamos en su lugar estar observando tipos de optimización de panorama general.

¿Cómo sabes qué es panorama general o no? Primero tienes que entender si tu código se está ejecutando en una ruta crítica o no. Si no está en la ruta crítica, lo más probable es que tus optimizaciones no valgan mucho.

¿Alguna vez has escuchado la advertencia, "¡eso es optimización prematura!"? Viene de una cita famosa de Donald Knuth: "la optimización prematura es la raíz de todo mal." Muchos desarrolladores citan esta frase para sugerir que la mayoría de las optimizaciones son "prematuras" y por lo tanto un desperdicio de esfuerzo. La verdad es, como siempre, más matizada.

Aquí está la cita de Knuth, en contexto:

> Los programadores desperdician enormes cantidades de tiempo pensando en, o preocupándose por, la velocidad de partes **no críticas** de sus programas, y estos intentos de eficiencia en realidad tienen un fuerte impacto negativo cuando se consideran la depuración y el mantenimiento. Deberíamos olvidarnos de las eficiencias pequeñas, digamos alrededor del 97% del tiempo: la optimización prematura es la raíz de todo mal. Sin embargo, no deberíamos desperdiciar nuestras oportunidades en ese **crítico** 3%. [énfasis añadido]

(http://web.archive.org/web/20130731202547/http://pplab.snu.ac.kr/courses/adv_pl05/papers/p261-knuth.pdf, Computing Surveys, Vol 6, No 4, December 1974)

Creo que es una paráfrasis justa decir que Knuth *quiso decir*: "la optimización de rutas no críticas es la raíz de todo mal." Así que la clave es averiguar si tu código está en la ruta crítica -- ¡deberías optimizarlo! -- o no.

Incluso iría tan lejos como para decir esto: ninguna cantidad de tiempo dedicada a optimizar rutas críticas es desperdiciada, sin importar cuán poco se ahorre; pero ninguna cantidad de optimización en rutas no críticas está justificada, sin importar cuánto se ahorre.

Si tu código está en la ruta crítica, como un fragmento de código "caliente" que se va a ejecutar una y otra vez, o en lugares críticos de la experiencia de usuario donde los usuarios lo notarán, como un bucle de animación o actualizaciones de estilos CSS, entonces no deberías escatimar esfuerzo en tratar de emplear optimizaciones relevantes y mediblemente significativas.

Por ejemplo, considera un bucle de animación de ruta crítica que necesita convertir un valor de string a un número. Por supuesto hay múltiples formas de hacer eso (consulta el título *Types & Grammar* de esta serie de libros), pero ¿cuál si alguna es la más rápida?

```js
var x = "42";	// need number `42`

// Option 1: let implicit coercion automatically happen
var y = x / 2;

// Option 2: use `parseInt(..)`
var y = parseInt( x, 0 ) / 2;

// Option 3: use `Number(..)`
var y = Number( x ) / 2;

// Option 4: use `+` unary operator
var y = +x / 2;

// Option 5: use `|` unary operator
var y = (x | 0) / 2;
```

**Nota:** Dejaré como ejercicio para el lector configurar una prueba si estás interesado en examinar las diferencias mínimas de rendimiento entre estas opciones.

Al considerar estas diferentes opciones, como dicen, "una de estas cosas no es como las otras." `parseInt(..)` hace el trabajo, pero también hace mucho más -- analiza el string en lugar de solo hacer coerción. Probablemente puedas adivinar, correctamente, que `parseInt(..)` es una opción más lenta, y probablemente deberías evitarla.

Por supuesto, si `x` alguna vez puede ser un valor que **necesita análisis (parsing)**, como `"42px"` (como de una consulta de estilo CSS), entonces `parseInt(..)` es realmente la única opción adecuada.

`Number(..)` también es una llamada a función. Desde una perspectiva de comportamiento, es idéntico a la opción del operador unario `+`, pero puede de hecho ser un poco más lento, requiriendo más maquinaria para ejecutar la función. Por supuesto, también es posible que el motor JS reconozca esta simetría de comportamiento y simplemente maneje el inlining del comportamiento de `Number(..)` (o sea `+x`) por ti.

Pero recuerda, obsesionarse con `+x` versus `x | 0` es en la mayoría de los casos probablemente un desperdicio de esfuerzo. Este es un tema de microrendimiento, y uno que no deberías dejar que dicte/degrade la legibilidad de tu programa.

Aunque el rendimiento es muy importante en las rutas críticas de tu programa, no es el único factor. Entre varias opciones que son aproximadamente similares en rendimiento, la legibilidad debería ser otra preocupación importante.

## Tail Call Optimization (TCO)

Como mencionamos brevemente antes, ES6 incluye un requisito específico que se aventura en el mundo del rendimiento. Está relacionado con una forma específica de optimización que puede ocurrir con las llamadas a funciones: *tail call optimization*.

Brevemente, un "tail call" es una llamada a función que aparece en la "cola" de otra función, de tal manera que después de que la llamada termina, no queda nada más por hacer (excepto quizás devolver su valor de resultado).

Por ejemplo, aquí hay una configuración no recursiva con tail calls:

```js
function foo(x) {
	return x;
}

function bar(y) {
	return foo( y + 1 );	// tail call
}

function baz() {
	return 1 + bar( 40 );	// not tail call
}

baz();						// 42
```

`foo(y+1)` es un tail call en `bar(..)` porque después de que `foo(..)` termina, `bar(..)` también ha terminado excepto en este caso devolviendo el resultado de la llamada a `foo(..)`. Sin embargo, `bar(40)` *no* es un tail call porque después de que se completa, su valor de resultado debe ser sumado a `1` antes de que `baz()` pueda devolverlo.

Sin entrar en demasiados detalles minuciosos, llamar a una nueva función requiere una cantidad extra de memoria reservada para gestionar la pila de llamadas, llamada "stack frame". Así que el fragmento anterior generalmente requeriría un stack frame para cada una de `baz()`, `bar(..)` y `foo(..)` todas al mismo tiempo.

Sin embargo, si un motor con capacidad de TCO puede darse cuenta de que la llamada `foo(y+1)` está en *posición de cola* significando que `bar(..)` básicamente ha terminado, entonces al llamar a `foo(..)`, no necesita crear un nuevo stack frame, sino que puede reutilizar el stack frame existente de `bar(..)`. Eso no solo es más rápido, sino que también usa menos memoria.

Ese tipo de optimización no es gran cosa en un fragmento simple, pero se convierte en un *asunto mucho más grande* cuando se trata de recursión, especialmente si la recursión podría haber resultado en cientos o miles de stack frames. ¡Con TCO el motor puede realizar todas esas llamadas con un solo stack frame!

La recursión es un tema espinoso en JS porque sin TCO, los motores han tenido que implementar límites arbitrarios (¡y diferentes!) de qué tan profunda dejan que la pila de recursión llegue antes de detenerla, para prevenir quedarse sin memoria. ¡Con TCO, las funciones recursivas con llamadas en *posición de cola* pueden esencialmente ejecutarse sin límite, porque nunca hay ningún uso extra de memoria!

Considera ese `factorial(..)` recursivo de antes, pero reescrito para hacerlo amigable con TCO:

```js
function factorial(n) {
	function fact(n,res) {
		if (n < 2) return res;

		return fact( n - 1, n * res );
	}

	return fact( n, 1 );
}

factorial( 5 );		// 120
```

Esta versión de `factorial(..)` sigue siendo recursiva, pero también es optimizable con TCO, porque ambas llamadas internas a `fact(..)` están en *posición de cola*.

**Nota:** Es importante señalar que TCO solo aplica si realmente hay un tail call. Si escribes funciones recursivas sin tail calls, el rendimiento seguirá recurriendo a la asignación normal de stack frames, y los límites de los motores en tales pilas de llamadas recursivas seguirán aplicando. Muchas funciones recursivas pueden reescribirse como acabamos de mostrar con `factorial(..)`, pero requiere atención cuidadosa a los detalles.

Una razón por la que ES6 requiere que los motores implementen TCO en lugar de dejarlo a su discreción es porque la *falta de TCO* en realidad tiende a reducir las posibilidades de que ciertos algoritmos sean implementados en JS usando recursión, por temor a los límites de la pila de llamadas.

Si la falta de TCO en el motor simplemente degradara gracefully a un rendimiento más lento en todos los casos, probablemente no habría sido algo que ES6 necesitara *requerir*. Pero porque la falta de TCO puede realmente hacer ciertos programas imprácticos, es más una característica importante del lenguaje que solo un detalle de implementación oculto.

ES6 garantiza que de ahora en adelante, los desarrolladores de JS podrán confiar en esta optimización en todos los navegadores conformes con ES6+. ¡Eso es una victoria para el rendimiento de JS!

## Revisión

Medir efectivamente el rendimiento de un fragmento de código, especialmente para compararlo con otra opción para ese mismo código y ver cuál enfoque es más rápido, requiere atención cuidadosa a los detalles.

En lugar de crear tu propia lógica de benchmarking estadísticamente válida, simplemente usa la biblioteca Benchmark.js, que hace eso por ti. Pero ten cuidado con cómo escribes las pruebas, porque es demasiado fácil construir una prueba que parezca válida pero que en realidad esté defectuosa -- incluso diferencias mínimas pueden sesgar los resultados para ser completamente poco confiables.

Es importante obtener la mayor cantidad posible de resultados de prueba de tantos entornos diferentes como sea posible para eliminar el sesgo de hardware/dispositivo. jsPerf.com es un sitio web fantástico para obtener ejecuciones de pruebas de benchmark de rendimiento de forma colaborativa.

Muchas pruebas de rendimiento comunes desafortunadamente se obsesionan con detalles de microrendimiento irrelevantes como `x++` versus `++x`. Escribir buenas pruebas significa entender cómo enfocarse en preocupaciones de panorama general, como optimizar en la ruta crítica, y evitar caer en trampas como los detalles de implementación de diferentes motores JS.

Tail call optimization (TCO) es una optimización requerida a partir de ES6 que hará prácticos algunos patrones recursivos en JS que habrían sido imposibles de otra manera. TCO permite que una llamada a función en la *posición de cola* de otra función se ejecute sin necesitar ningún recurso extra, lo que significa que el motor ya no necesita colocar restricciones arbitrarias en la profundidad de la pila de llamadas para algoritmos recursivos.
