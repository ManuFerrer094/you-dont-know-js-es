# No Sabes JS: Arriba y Andando
# Capítulo 3: Introducción a YDKJS

¿Qué trata esta serie? En pocas palabras: trata seriamente el aprendizaje de *todas las partes de JavaScript*, no solo un subconjunto del lenguaje que alguien llamó "las partes buenas," y no solo la cantidad mínima que necesitas para completar tu trabajo.

Los desarrolladores serios en otros lenguajes esperan dedicar esfuerzo a aprender la mayor parte o la totalidad del lenguaje(s) en los que escriben principalmente, pero los desarrolladores de JS parecen destacarse de alguna manera como aquellos que generalmente no aprenden mucho del lenguaje. Esto no es algo bueno, y no es algo que debamos seguir permitiendo como norma.

La serie *You Don't Know JS* (*YDKJS*) está en contraste con los enfoques de aprendizaje típicos de JS, y es diferente a casi cualquier otro libro de JS que leerás. Te desafía a ir más allá de tu zona de confort y a hacer las preguntas más profundas de "¿por qué?" para cada comportamiento que encuentres. ¿Estás listo para ese desafío?

Voy a usar este capítulo final para resumir brevemente qué esperar del resto de los libros de la serie, y cómo construir más efectivamente tu aprendizaje de JS sobre la cima de *YDKJS*.

## Scope y Closures

Quizás una de las cosas más fundamentales que necesitarás acertar rápidamente es cómo funciona el scoping de variables en JavaScript. No es suficiente tener creencias anecdóticas *vagas* sobre el scope.

El título *Scope & Closures* comienza por disipar el malentendido común de que JS es un "lenguaje interpretado" y por lo tanto no se compila. No.

El motor JS compila tu código justo antes (¡y a veces durante!) la ejecución. Así que usamos una comprensión más profunda del enfoque del compilador al código para entender cómo encuentra y trata las declaraciones de variables y funciones. A lo largo del camino, vemos la metáfora típica para la gestión del scope de variables de JS, "Hoisting."

Esta comprensión crítica del "scope en léxico" es entonces la base sobre la que establecemos los closures para el último capítulo de ese libro. El closure es quizás el concepto más importante de todo JS, pero si no has captado primero cómo funciona el scope, el closure probablemente permanecerá fuera de tu alcance.

Una aplicación importante del closure es el patrón módulo, como brevemente presentamos en el Capítulo 2 de este libro. El patrón módulo es quizás el patrón de organización de código más prevalente en todo JavaScript; la comprensión profunda de él debería ser una de tus principales prioridades.

## *this* y Prototipos de Objeto

Quizás uno de los conceptos más extendidos y persistentes de falso conocimiento sobre JavaScript es que la palabra clave `this` se refiere a la función en la que aparece. Terriblemente incorrecto.

La palabra clave `this` está vinculada dinámicamente basándose en cómo la función en cuestión es ejecutada, y resulta que hay cuatro reglas simples para entender y determinar completamente el enlace `this`.

Estrechamente relacionado con el mecanismo `this` está el objeto prototipo, que es una cadena de búsqueda de propiedades, similar a cómo las variables de scope léxico se encuentran. Pero envuelto en los prototipos hay otro gran malentendido sobre JS: la idea de emular clases y herencia (lo que se llama "herencia prototípica").

Desafortunadamente, la orientación orientada a objetos a veces se toma como el camino a seguir en JavaScript, cuando en realidad el patrón de "delegación de comportamiento" es mucho más ajustado a cómo está construido JS.

Esto es de lo que trata el título *this & Object Prototypes*: definir qué es realmente `this` y cómo el mecanismo de prototype de JS funciona de hecho, y cómo la orientación hacia "clases" y "herencia" simplemente no es la manera correcta de apalancarte del lenguaje. En su lugar, los lectores desbloquearán la claridad y el poder del patrón de delegación de comportamiento.

**Nota:** Para el título de ES6, el sistema de clases se ha formalizado en JavaScript con herencia. Esto puede parecer que justifica el uso de clases a través de JS, pero de hecho tiene el efecto opuesto: hace que la forma en que *funciona realmente* el mecanismo sea más opaca y hace que los patrones de delegación sean más difíciles de usar de manera efectiva. En lugar de ceder a la facilidad superficial de usar clases de ES6, te mantendremos centrado en la mecánica subyacente del prototype para que puedas hacer elecciones más informadas y deliberadas sobre cómo usar y aprovechar JavaScript.

## Tipos y Gramática

El tercer título de esta serie se centra principalmente en abordar uno más de los temas más conocidos pero mal entendidos: la coerción de tipos. Quizás ningún tema provoca más frustración en los desarrolladores JS que cuando hablas de las confusiones que rodean a la coerción implícita.

En consonancia con el tema de *YDKJS*, la postura de este libro es que la coerción no es prácticamente un "mal de diseño" del lenguaje, a pesar de la creencia popular de que "el operador `==` es malo." La coerción es un poderoso mecanismo que *puede usarse efectivamente*, pero solo si entiendes correctamente cómo funciona.

Una vez más, el libro no busca dar saltos retóricos a "sí, la coerción es buena." En su lugar, el libro explica en detalle las especificaciones de cómo funciona la coerción en JavaScript, de modo que tengas todas las herramientas para entender cuándo y cómo usarla efectivamente.

El resultado: aprenderás cómo aprovechar la coerción de manera segura y efectiva en tu propio código, en lugar de siempre escribir código que asuma que la coerción es evil y por lo tanto inútil.

**Nota:** El cuarto capítulo del título *Types & Grammar* profundizará en el mecanismo de coerción. Lo cubro con mucho más detalle allí.

## Async y Rendimiento

Los primeros tres títulos de esta serie se centran en la mecánica central del lenguaje en sí, pero el cuarto título se ramifica ligeramente para cubrir los patrones sobre cómo gestionar la programación asíncrona. La asincronía no solo es crítica para el rendimiento de nuestras aplicaciones, sino que está convirtiéndose cada vez más en *la* técnica crítica para escribiblidad (writability) y mantenibilidad del código.

El libro comienza primero aclarando mucha terminología y conceptos confusos alrededor de cosas como "asíncrono," "paralelo" y "concurrente," y explica con profundidad cómo esas cosas se aplican y no se aplican a JS.

Luego pasamos a examinar los callbacks como el método primario de habilitar la asincronía. Y es aquí donde nos damos cuenta rápidamente de que el callback por sí solo es insuficiente para las demandas modernas de la programación asíncrona. Identificamos dos deficiencias principales del código de solo-callbacks: *Inversion of Control* (IoC) pérdida de confianza y razonamiento lineal de falta de razón.

Para abordar estas dos deficiencias principales, ES6 introduce dos nuevos mecanismos (y de hecho, patrones): promesas y generadores.

Las promesas son una forma agnóstica en cuanto al tiempo de razonar sobre valores futuros ("asíncronos"), lo que te permite razonar sobre ellos e componerlos independientemente de si el valor está listo todavía o no. Además, resuelven los problemas de confianza de IoC enrutando los callbacks a través de un mecanismo de promesa confiable y componible.

Los generadores introducen un nuevo modo de ejecución para las funciones JS, donde el generador puede ser pausado en los puntos de `yield` y ser reanudado asíncronamente más tarde. La capacidad de pausar-y-reanudar permite que el código de aspecto sincrónico secuencial en el generador sea procesado de manera asíncrona "entre bastidores." Al hacerlo, abordamos las confusiones de razonamiento no lineal y no local de los callbacks, lo que hace que nuestro código asíncrono parezca sincrónico y por lo tanto sea más razonable.

Pero es la combinación de promesas y generadores que "produce" (malas palabras en juego) nuestro patrón de codificación asíncrona más efectivo hasta la fecha en JS. De hecho, gran parte de la sofisticación futura de la asincronía en ES7 y más allá necesariamente se construirá sobre esa base. Para seriemente comprender la programación en JS del mundo moderno, necesitas obtener comodidad real con las promesas y los generadores.

Si las promesas y los generadores tratan sobre habilitar patrones que dejan que el motor JS corra tu programa con el máximo rendimiento monohilo, el capítulo 5 examina los sistemas de múltiples hilos con el paralelismo Web Workers y SIMD (data parallelism). El capítulo 6 examina la optimización del rendimiento con técnicas de benchmarking adecuadas.

## ES6 y Más Allá

No importa cuánto hayas dominado JavaScript hasta este punto, JavaScript siempre seguirá evolucionando, y además, la velocidad de evolución está aumentando rápidamente. Este hecho es casi una metáfora para el espíritu de *YDKJS*, para leer siempre curiosamente sobre el lenguaje en el que vivimos.

Este título no se trata de dominar las cosas que ES6 añade al lenguaje, aunque cubrimos eso. Se trata más de entender por qué ES6 evolucionó de la manera que lo hizo, y cómo eso continúa evolucionando en el futuro. Se trata de dar la bienvenida a las constantes actualizaciones del lenguaje en lugar de desearlos a un lado.

El título comienza por hacer un examen profundo de las partes de ES6 (para el momento de la escritura, básicamente listas para ser desplegadas) en detalle como las nuevas declaraciones de variables (`let`/`const`), notación literal de objeto actualizada, desestructuración, parámetros de función predeterminados, rest/spread, template literals (cadenas de plantilla), arrow functions, más sintaxis de iteración y generadores, mejoras de rendimiento de mapas/conjuntos/mapas débiles, promesas, `Proxy`/`Reflect`/`Symbol`, módulos, y mucho más.

Luego examinamos cosas que están en el horizonte para el futuro JS, incluyendo comprensiones de objetos/arrays, funciones de operador de cola de llamada asíncrona, mejoras adicionales de tipo, propiedades computadas en objetos literales, Object.observe(..), y más.

Siempre que sea posible, el libro se asegurará de que los lectores mantengan el "por qué" profundamente enfocado: ¿por qué está evolucionando el lenguaje hacia las capacidades que añade, y qué significa eso para la manera en que escribimos código?

## Repaso

La serie *YDKJS* está dedicada a la proposición de que todos los desarrolladores de JS pueden y deben aprender todas las partes de este gran lenguaje. La opinión de nadie, el framework, ni la historia de ningún proyecto debería ser la razón de que pares de aprender y profundizar en el lenguaje.

A medida que recorre cada libro de la serie, espero que encuentres cuánto hay en el lenguaje que probablemente no has explorado profundamente todavía. "No Sabes JS" no es crítica o insulto —es una realidad que todos nosotros debemos reconocer.

Mi esperanza es que ya estés abrazando esta realización y ansioso de explorar todo lo que esto tiene para ofrecer. Estás a punto de empezar *a conocer JS*.
