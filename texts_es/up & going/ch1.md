# No Sabes JS: Arriba y Andando
# Capítulo 1: Introducción a la Programación

Bienvenido a la serie *You Don't Know JS* (*YDKJS*).

*Arriba y Andando* es una introducción a varios conceptos básicos de la programación —por supuesto nos inclinamos específicamente hacia JavaScript (a menudo abreviado JS)— y a cómo abordar y comprender el resto de los títulos de esta serie. Especialmente si estás empezando en la programación y/o en JavaScript, este libro explorará brevemente lo que necesitas saber para ponerte *arriba y andando*.

Este libro empieza explicando los principios básicos de la programación a un nivel muy alto. Está pensado principalmente si comienzas *YDKJS* con poca o ninguna experiencia previa en programación, y buscas en estos libros una ayuda para que te inicies en el camino hacia la comprensión de la programación a través de la lente de JavaScript.

El Capítulo 1 debe tratarse como un repaso rápido de las cosas sobre las que querrás saber más y practicar para *introducirte en la programación*. También hay muchos otros recursos fantásticos de introducción a la programación que pueden ayudarte a profundizar en estos temas, y te animo a que aprendas de ellos además de este capítulo.

Una vez que te sientas cómodo con los conceptos básicos de la programación en general, el Capítulo 2 te guiará a familiarizarte con el estilo de programación de JavaScript. El Capítulo 2 presenta de qué trata JavaScript, pero nuevamente, no es una guía exhaustiva —¡para eso están el resto de los libros de *YDKJS*!

Si ya te sientes bastante cómodo con JavaScript, primero echa un vistazo al Capítulo 3 como un breve adelanto de lo que puedes esperar de *YDKJS*, ¡y luego sumérgete de lleno!

## Código

Empecemos desde el principio.

Un programa, a menudo denominado *código fuente* o simplemente *código*, es un conjunto de instrucciones especiales para indicarle al ordenador qué tareas debe realizar. Normalmente el código se guarda en un archivo de texto, aunque con JavaScript también puedes escribir código directamente en una consola de desarrollador en un navegador, lo cual cubriremos en breve.

Las reglas para el formato válido y las combinaciones de instrucciones se denominan *lenguaje de computadora*, a veces llamado su *sintaxis*, de la misma manera que el español te indica cómo deletrear palabras y cómo crear oraciones válidas usando palabras y puntuación.

### Sentencias

En un lenguaje de computadora, un grupo de palabras, números y operadores que realiza una tarea específica es una *sentencia*. En JavaScript, una sentencia podría verse así:

```js
a = b * 2;
```

Los caracteres `a` y `b` se llaman *variables* (ver "Variables"), que son como simples cajas en las que puedes almacenar cualquier cosa. En los programas, las variables contienen valores (como el número `42`) para ser usados por el programa. Piensa en ellas como marcadores de posición simbólicos para los propios valores.

Por el contrario, el `2` es solo un valor en sí mismo, llamado *valor literal*, porque se mantiene solo sin estar almacenado en una variable.

Los caracteres `=` y `*` son *operadores* (ver "Operadores") —realizan acciones con los valores y las variables, como la asignación y la multiplicación matemática.

La mayoría de las sentencias en JavaScript terminan con un punto y coma (`;`) al final.

La sentencia `a = b * 2;` le indica al ordenador, grosso modo, que obtenga el valor actual almacenado en la variable `b`, multiplique ese valor por `2`, y luego almacene el resultado en otra variable que llamamos `a`.

Los programas son simplemente colecciones de muchas sentencias de este tipo, que juntas describen todos los pasos necesarios para cumplir el propósito del programa.

### Expresiones

Las sentencias están compuestas de una o más *expresiones*. Una expresión es cualquier referencia a una variable o valor, o un conjunto de variables y/o valores combinados con operadores.

Por ejemplo:

```js
a = b * 2;
```

Esta sentencia tiene cuatro expresiones:

* `2` es una *expresión de valor literal*
* `b` es una *expresión de variable*, que significa recuperar su valor actual
* `b * 2` es una *expresión aritmética*, que significa realizar la multiplicación
* `a = b * 2` es una *expresión de asignación*, que significa asignar el resultado de la expresión `b * 2` a la variable `a` (más sobre las asignaciones más adelante)

Una expresión general que está sola también se llama *sentencia de expresión*, como la siguiente:

```js
b * 2;
```

Este tipo de sentencia de expresión no es muy común ni útil, ya que generalmente no tendría ningún efecto en la ejecución del programa —recuperaría el valor de `b` y lo multiplicaría por `2`, pero luego no haría nada con ese resultado.

Una sentencia de expresión más común es una sentencia de *expresión de llamada* (ver "Funciones"), ya que toda la sentencia es la propia expresión de llamada a función:

```js
alert( a );
```

### Ejecutar un Programa

¿Cómo esas colecciones de sentencias de programación le dicen al ordenador qué hacer? El programa necesita ser *ejecutado*, también denominado *correr el programa*.

Sentencias como `a = b * 2` son útiles para los desarrolladores cuando leen y escriben, pero en realidad no están en una forma que el ordenador pueda entender directamente. Por eso se usa una utilidad especial en el ordenador (ya sea un *intérprete* o un *compilador*) para traducir el código que escribes a comandos que el ordenador puede entender.

Para algunos lenguajes de computadora, esta traducción de comandos se realiza típicamente de arriba hacia abajo, línea por línea, cada vez que el programa se ejecuta, lo cual se suele llamar *interpretar* el código.

Para otros lenguajes, la traducción se hace de antemano, llamada *compilar* el código, de modo que cuando el programa *se ejecuta* después, lo que se está ejecutando son en realidad las instrucciones del ordenador ya compiladas y listas para funcionar.

Típicamente se afirma que JavaScript es *interpretado*, porque tu código fuente JavaScript se procesa cada vez que se ejecuta. Pero eso no es del todo preciso. El motor de JavaScript en realidad *compila* el programa al vuelo y luego lo ejecuta inmediatamente.

**Nota:** Para más información sobre la compilación de JavaScript, consulta los dos primeros capítulos del título *Scope & Closures* de esta serie.

## Pruébalo Tú Mismo

Este capítulo va a introducir cada concepto de programación con fragmentos de código simples, todos escritos en JavaScript (¡obviamente!).

No se puede enfatizar suficiente: mientras recorres este capítulo —y es posible que necesites tomarte el tiempo para repasarlo varias veces— deberías practicar cada uno de estos conceptos escribiendo el código tú mismo. La forma más sencilla de hacerlo es abrir la consola de herramientas de desarrollador en tu navegador más cercano (Firefox, Chrome, IE, etc.).

**Consejo:** Normalmente puedes abrir la consola de desarrollador con un atajo de teclado o desde un elemento del menú. Para más información detallada sobre cómo abrir y usar la consola en tu navegador favorito, consulta "Mastering The Developer Tools Console" (http://blog.teamtreehouse.com/mastering-developer-tools-console). Para escribir varias líneas en la consola a la vez, usa `<shift> + <enter>` para pasar a la siguiente línea. Una vez que presionas `<enter>` solo, la consola ejecutará todo lo que hayas escrito.

Familiaricémonos con el proceso de ejecutar código en la consola. Primero, sugiero abrir una pestaña vacía en tu navegador. Prefiero hacerlo escribiendo `about:blank` en la barra de direcciones. Luego, asegúrate de que tu consola de desarrollador esté abierta, como acabamos de mencionar.

Ahora, escribe este código y observa cómo se ejecuta:

```js
a = 21;

b = a * 2;

console.log( b );
```

Escribir el código anterior en la consola de Chrome debería producir algo como lo siguiente:

<img src="fig1.png" width="500">

Adelante, inténtalo. ¡La mejor manera de aprender a programar es empezar a programar!

### Salida

En el fragmento de código anterior, usamos `console.log(..)`. Brevemente, veamos de qué trata esa línea de código.

Puede que lo hayas adivinado, pero así es exactamente como imprimimos texto (también conocido como *salida* al usuario) en la consola de desarrollador. Hay dos características de esa sentencia que debemos explicar.

Primero, la parte `log( b )` se denomina llamada a función (ver "Funciones"). Lo que ocurre es que pasamos la variable `b` a esa función, que le pide que tome el valor de `b` y lo imprima en la consola.

Segundo, la parte `console.` es una referencia a un objeto donde se encuentra la función `log(..)`. Cubriremos los objetos y sus propiedades con más detalle en el Capítulo 2.

Otra forma de crear salida que puedes ver es ejecutar una sentencia `alert(..)`. Por ejemplo:

```js
alert( b );
```

Si la ejecutas, notarás que en lugar de imprimir la salida en la consola, muestra un cuadro emergente "OK" con el contenido de la variable `b`. Sin embargo, usar `console.log(..)` generalmente hará que aprender sobre la codificación y ejecutar tus programas en la consola sea más fácil que usar `alert(..)`, porque puedes dar salida a muchos valores a la vez sin interrumpir la interfaz del navegador.

Para este libro, usaremos `console.log(..)` para la salida.

### Entrada

Mientras hablamos de salida, puede que también te preguntes por la *entrada* (es decir, recibir información del usuario).

La forma más común de que esto ocurra es que la página HTML muestre elementos de formulario (como cuadros de texto) a un usuario para que los rellene, y luego usando JS para leer esos valores en las variables de tu programa.

Pero hay una manera más sencilla de obtener entrada para propósitos simples de aprendizaje y demostración, como lo que estarás haciendo a lo largo de este libro. Usa la función `prompt(..)`:

```js
age = prompt( "Please tell me your age:" );

console.log( age );
```

Como habrás adivinado, el mensaje que pasas a `prompt(..)` —en este caso, `"Please tell me your age:"` — se imprime en la ventana emergente.

Esto debería verse similar a lo siguiente:

<img src="fig2.png" width="500">

Una vez que envíes el texto de entrada haciendo clic en "OK," observarás que el valor que escribiste está almacenado en la variable `age`, que luego *mostramos* con `console.log(..)`:

<img src="fig3.png" width="500">

Para mantener las cosas simples mientras aprendemos conceptos básicos de programación, los ejemplos en este libro no requerirán entrada. Pero ahora que has visto cómo usar `prompt(..)`, si quieres desafiarte a ti mismo puedes intentar usar entrada en tus exploraciones de los ejemplos.

## Operadores

Los operadores son cómo realizamos acciones sobre variables y valores. Ya hemos visto dos operadores de JavaScript, el `=` y el `*`.

El operador `*` realiza la multiplicación matemática. Bastante sencillo, ¿verdad?

El operador `=` igual se usa para la *asignación* —primero calculamos el valor en el *lado derecho* (valor fuente) del `=` y luego lo ponemos en la variable que especificamos en el *lado izquierdo* (variable objetivo).

**Advertencia:** Esto puede parecer un orden inverso extraño para especificar la asignación. En lugar de `a = 42`, algunos preferirían invertir el orden para que el valor fuente esté a la izquierda y la variable objetivo a la derecha, como `42 -> a` (¡esto no es JavaScript válido!). Desafortunadamente, la forma ordenada `a = 42`, y variaciones similares, es bastante prevalente en los lenguajes de programación modernos. Si te parece poco natural, simplemente dedica algo de tiempo a practicar ese orden en tu mente para acostumbrarte a él.

Considera:

```js
a = 2;
b = a + 1;
```

Aquí, asignamos el valor `2` a la variable `a`. Luego, obtenemos el valor de la variable `a` (todavía `2`), le sumamos `1` resultando en el valor `3`, y luego almacenamos ese valor en la variable `b`.

Aunque técnicamente no es un operador, necesitarás la palabra clave `var` en cada programa, ya que es la forma principal de *declarar* (también, *crear*) *var*iables (ver "Variables").

Siempre debes declarar la variable por su nombre antes de usarla. Pero solo necesitas declarar una variable una vez por cada *scope* (ver "Scope"); puede usarse tantas veces como sea necesario después. Por ejemplo:

```js
var a = 20;

a = a + 1;
a = a * 2;

console.log( a );	// 42
```

Aquí están algunos de los operadores más comunes en JavaScript:

* Asignación: `=` como en `a = 2`.
* Matemáticas: `+` (suma), `-` (resta), `*` (multiplicación) y `/` (división), como en `a * 3`.
* Asignación compuesta: `+=`, `-=`, `*=` y `/=` son operadores compuestos que combinan una operación matemática con la asignación, como en `a += 2` (igual que `a = a + 2`).
* Incremento/Decremento: `++` (incremento), `--` (decremento), como en `a++` (similar a `a = a + 1`).
* Acceso a propiedades de objetos: `.` como en `console.log()`.

   Los objetos son valores que contienen otros valores en ubicaciones específicas con nombre llamadas propiedades. `obj.a` significa un valor de objeto llamado `obj` con una propiedad de nombre `a`. Las propiedades también se pueden acceder como `obj["a"]`. Ver Capítulo 2.
* Igualdad: `==` (igualdad flexible), `===` (igualdad estricta), `!=` (desigualdad flexible), `!==` (desigualdad estricta), como en `a == b`.

   Ver "Valores y Tipos" y el Capítulo 2.
* Comparación: `<` (menor que), `>` (mayor que), `<=` (menor que o igualdad flexible), `>=` (mayor que o igualdad flexible), como en `a <= b`.

   Ver "Valores y Tipos" y el Capítulo 2.
* Lógicos: `&&` (y), `||` (o), como en `a || b` que selecciona `a` *o* `b`.

   Estos operadores se usan para expresar condicionales compuestos (ver "Condicionales"), como si `a` *o* `b` es verdadero.

**Nota:** Para mucho más detalle y cobertura de operadores no mencionados aquí, consulta la Red de Desarrolladores de Mozilla (MDN) "Expressions and Operators" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators).

## Valores y Tipos

Si le preguntas a un empleado de una tienda de teléfonos cuánto cuesta cierto teléfono y dice "noventa y nueve, noventa y nueve" (es decir, $99.99), te está dando una cifra numérica real en dólares que representa lo que necesitarás pagar (más impuestos) para comprarlo. Si quieres comprar dos de esos teléfonos, puedes hacer fácilmente el cálculo mental para doblar ese valor y obtener $199.98 como costo base.

Si ese mismo empleado toma otro teléfono similar pero dice que es "gratis" (quizás con comillas al hablar), no te está dando un número, sino otro tipo de representación de tu costo esperado ($0.00) —la palabra "gratis."

Cuando más tarde preguntas si el teléfono incluye un cargador, esa respuesta solo podría haber sido "sí" o "no."

De manera muy similar, cuando expresas valores en un programa, eliges diferentes representaciones para esos valores según lo que planees hacer con ellos.

Estas diferentes representaciones para los valores se llaman *tipos* en la terminología de programación. JavaScript tiene tipos integrados para cada uno de estos llamados valores *primitivos*:

* Cuando necesitas hacer cálculos, quieres un `number`.
* Cuando necesitas imprimir un valor en la pantalla, necesitas una `string` (uno o más caracteres, palabras, oraciones).
* Cuando necesitas tomar una decisión en tu programa, necesitas un `boolean` (`true` o `false`).

Los valores que se incluyen directamente en el código fuente se llaman *literales*. Los literales `string` están rodeados por comillas dobles `"..."` o comillas simples (`'...'`) —la única diferencia es preferencia estilística. Los literales `number` y `boolean` se presentan tal como son (es decir, `42`, `true`, etc.).

Considera:

```js
"I am a string";
'I am also a string';

42;

true;
false;
```

Más allá de los tipos de valor `string`/`number`/`boolean`, es común que los lenguajes de programación proporcionen *arrays*, *objetos*, *funciones* y más. Cubriremos mucho más sobre valores y tipos a lo largo de este capítulo y el siguiente.

### Convertir Entre Tipos

Si tienes un `number` pero necesitas imprimirlo en la pantalla, necesitas convertir el valor a una `string`, y en JavaScript esta conversión se llama "coerción." De manera similar, si alguien ingresa una serie de caracteres numéricos en un formulario en una página de comercio electrónico, eso es una `string`, pero si luego necesitas usar ese valor para hacer operaciones matemáticas, necesitas *coercionar* ese valor a un `number`.

JavaScript proporciona varias instalaciones diferentes para coercionar de manera forzosa entre *tipos*. Por ejemplo:

```js
var a = "42";
var b = Number( a );

console.log( a );	// "42"
console.log( b );	// 42
```

Usar `Number(..)` (una función integrada) como se muestra es una coerción *explícita* de cualquier otro tipo al tipo `number`. Eso debería ser bastante directo.

Pero un tema controvertido es lo que ocurre cuando intentas comparar dos valores que no son del mismo tipo, lo que requeriría coerción *implícita*.

Al comparar la cadena `"99.99"` con el número `99.99`, la mayoría de la gente diría que son equivalentes. Pero no son exactamente iguales, ¿verdad? Es el mismo valor en dos representaciones diferentes, dos *tipos* diferentes. Podrías decir que son "ampliamente iguales", ¿no?

Para ayudarte en estas situaciones comunes, JavaScript a veces interviene y *implícitamente* coerciona los valores a los tipos que coinciden.

Así que si usas el operador de igualdad flexible `==` para hacer la comparación `"99.99" == 99.99`, JavaScript convertirá el lado izquierdo `"99.99"` a su equivalente numérico `99.99`. La comparación se convierte entonces en `99.99 == 99.99`, lo cual es por supuesto `true`.

Si bien está diseñado para ayudarte, la coerción implícita puede crear confusión si no te has tomado el tiempo de aprender las reglas que gobiernan su comportamiento. La mayoría de los desarrolladores de JS nunca lo han hecho, por lo que la sensación general es que la coerción implícita es confusa y daña los programas con errores inesperados, y por lo tanto debe evitarse. A veces incluso se le llama un defecto en el diseño del lenguaje.

Sin embargo, la coerción implícita es un mecanismo que *se puede aprender*, y además *debería ser aprendido* por cualquiera que desee tomar en serio la programación en JavaScript. No solo no es confuso una vez que aprendes las reglas, ¡sino que en realidad puede hacer tus programas mejores! El esfuerzo bien vale la pena.

**Nota:** Para más información sobre coerción, consulta el Capítulo 2 de este título y el Capítulo 4 del título *Types & Grammar* de esta serie.

## Comentarios de Código

El empleado de la tienda de teléfonos podría anotar algunas notas sobre las características de un teléfono recién lanzado o sobre los nuevos planes que ofrece su empresa. Estas notas son solo para el empleado —no son para que los clientes las lean. Sin embargo, estas notas ayudan al empleado a hacer su trabajo mejor documentando los cómos y los porqués de lo que debe decir a los clientes.

Una de las lecciones más importantes que puedes aprender sobre la escritura de código es que no es solo para el ordenador. El código es tanto, si no más, para el desarrollador como para el compilador.

Tu ordenador solo se preocupa por el código máquina, una serie de 0s y 1s binarios, que proviene de la *compilación*. Hay un número casi infinito de programas que podrías escribir que producen la misma serie de 0s y 1s. Las elecciones que haces sobre cómo escribir tu programa importan —no solo para ti, sino para tus otros compañeros de equipo e incluso para tu yo futuro.

Debes esforzarte no solo por escribir programas que funcionen correctamente, sino programas que tengan sentido cuando se examinan. Puedes llegar muy lejos en ese esfuerzo eligiendo buenos nombres para tus variables (ver "Variables") y funciones (ver "Funciones").

Pero otra parte importante son los comentarios de código. Estos son fragmentos de texto en tu programa que se insertan puramente para explicar cosas a un humano. El intérprete/compilador siempre ignorará estos comentarios.

Hay muchas opiniones sobre qué hace que el código esté bien comentado; realmente no podemos definir reglas universales absolutas. Pero algunas observaciones y pautas son bastante útiles:

* El código sin comentarios es subóptimo.
* Demasiados comentarios (uno por línea, por ejemplo) es probablemente señal de código mal escrito.
* Los comentarios deben explicar el *porqué*, no el *qué*. Opcionalmente pueden explicar el *cómo* si eso es particularmente confuso.

En JavaScript, hay dos tipos de comentarios posibles: un comentario de una sola línea y un comentario multilínea.

Considera:

```js
// This is a single-line comment

/* But this is
       a multiline
             comment.
                      */
```

El comentario de una sola línea `//` es apropiado si vas a poner un comentario justo encima de una sola sentencia, o incluso al final de una línea. Todo en la línea después de `//` se trata como comentario (y por lo tanto es ignorado por el compilador), hasta el final de la línea. No hay restricción sobre qué puede aparecer dentro de un comentario de una sola línea.

Considera:

```js
var a = 42;		// 42 is the meaning of life
```

El comentario multilínea `/* .. */` es apropiado si tienes varias líneas de explicación que hacer en tu comentario.

Aquí hay un uso común de comentarios multilínea:

```js
/* The following value is used because
   it has been shown that it answers
   every question in the universe. */
var a = 42;
```

También puede aparecer en cualquier lugar de una línea, incluso en el medio de una línea, porque el `*/` lo termina. Por ejemplo:

```js
var a = /* arbitrary value */ 42;

console.log( a );	// 42
```

Lo único que no puede aparecer dentro de un comentario multilínea es un `*/`, porque eso se interpretaría como el fin del comentario.

Definitivamente querrás comenzar tu aprendizaje de la programación iniciando con el hábito de comentar el código. A lo largo del resto de este capítulo, verás que uso comentarios para explicar las cosas, así que haz lo mismo en tu propia práctica. ¡Confía en mí, todos los que lean tu código te lo agradecerán!

## Variables

La mayoría de los programas útiles necesitan rastrear un valor a medida que cambia a lo largo del programa, sometiéndose a diferentes operaciones según lo requieran las tareas previstas de tu programa.

La forma más fácil de hacerlo en tu programa es asignar un valor a un contenedor simbólico, llamado *variable* —así llamado porque el valor en este contenedor puede *variar* con el tiempo según sea necesario.

En algunos lenguajes de programación, declaras una variable (contenedor) para contener un tipo específico de valor, como `number` o `string`. El *tipado estático*, también conocido como *aplicación de tipos*, se suele citar como un beneficio para la corrección del programa al prevenir conversiones de valores no deseadas.

Otros lenguajes enfatizan los tipos para los valores en lugar de las variables. El *tipado débil*, también conocido como *tipado dinámico*, permite que una variable contenga cualquier tipo de valor en cualquier momento. Típicamente se cita como un beneficio para la flexibilidad del programa al permitir que una sola variable represente un valor sin importar qué forma de tipo tenga ese valor en un momento dado del flujo lógico del programa.

JavaScript usa el último enfoque, el *tipado dinámico*, lo que significa que las variables pueden contener valores de cualquier *tipo* sin ninguna aplicación de *tipo*.

Como se mencionó anteriormente, declaramos una variable usando la sentencia `var` —nótese que no hay otra información de *tipo* en la declaración. Considera este programa simple:

```js
var amount = 99.99;

amount = amount * 2;

console.log( amount );		// 199.98

// convert `amount` to a string, and
// add "$" on the beginning
amount = "$" + String( amount );

console.log( amount );		// "$199.98"
```

La variable `amount` comienza conteniendo el número `99.99`, y luego contiene el resultado `number` de `amount * 2`, que es `199.98`.

El primer comando `console.log(..)` tiene que *implícitamente* coercionar ese valor `number` a una `string` para imprimirlo.

Luego la sentencia `amount = "$" + String(amount)` *explícitamente* coerciona el valor `199.98` a una `string` y agrega un carácter `"$"` al principio. En este punto, `amount` ahora contiene el valor `string` `"$199.98"`, por lo que la segunda sentencia `console.log(..)` no necesita hacer ninguna coerción para imprimirlo.

Los desarrolladores de JavaScript notarán la flexibilidad de usar la variable `amount` para cada uno de los valores `99.99`, `199.98` y `"$199.98"`. Los entusiastas del tipado estático preferirían una variable separada como `amountStr` para contener la representación final de `"$199.98"` del valor, porque es un tipo diferente.

De cualquier manera, notarás que `amount` contiene un valor en ejecución que cambia a lo largo del programa, ilustrando el propósito principal de las variables: gestionar el *estado* del programa.

En otras palabras, el *estado* es el seguimiento de los cambios en los valores mientras el programa se ejecuta.

Otro uso común de las variables es para centralizar la configuración de valores. Esto se denomina más típicamente *constantes*, cuando declaras una variable con un valor y pretendes que ese valor *no cambie* a lo largo del programa.

Declaras estas *constantes*, a menudo al principio del programa, para que sea conveniente tener un lugar al que acudir para cambiar un valor si lo necesitas. Por convención, las variables de JavaScript como constantes suelen escribirse en mayúsculas, con guiones bajos `_` entre múltiples palabras.

Aquí hay un ejemplo tonto:

```js
var TAX_RATE = 0.08;	// 8% sales tax

var amount = 99.99;

amount = amount * 2;

amount = amount + (amount * TAX_RATE);

console.log( amount );				// 215.9784
console.log( amount.toFixed( 2 ) );	// "215.98"
```

**Nota:** Similar a cómo `console.log(..)` es una función `log(..)` accedida como propiedad de objeto en el valor `console`, `toFixed(..)` aquí es una función a la que se puede acceder en valores `number`. Los `number`s de JavaScript no se formatean automáticamente en dólares —el motor no sabe cuál es tu intención y no hay tipo para moneda. `toFixed(..)` nos permite especificar cuántos decimales queremos redondear el `number`, y produce la `string` según sea necesario.

La variable `TAX_RATE` solo es *constante* por convención —no hay nada especial en este programa que evite que sea cambiada. Pero si la ciudad sube la tasa de impuestos al 9%, todavía podemos actualizar fácilmente nuestro programa estableciendo el valor asignado a `TAX_RATE` en `0.09` en un solo lugar, en lugar de encontrar muchas ocurrencias del valor `0.08` dispersas por el programa y actualizarlas todas.

La versión más nueva de JavaScript en el momento de escribir esto (comúnmente llamada "ES6") incluye una nueva forma de declarar *constantes*, usando `const` en lugar de `var`:

```js
// as of ES6:
const TAX_RATE = 0.08;

var amount = 99.99;

// ..
```

Las constantes son útiles igual que las variables con valores sin cambios, excepto que las constantes también evitan cambiar accidentalmente el valor en otro lugar después de la configuración inicial. Si intentaras asignar cualquier valor diferente a `TAX_RATE` después de esa primera declaración, tu programa rechazaría el cambio (y en modo estricto, fallaría con un error —ver "Modo Estricto" en el Capítulo 2).

Por cierto, ese tipo de "protección" contra errores es similar a la aplicación de tipos del tipado estático, ¡así que puedes ver por qué los tipos estáticos en otros lenguajes pueden ser atractivos!

**Nota:** Para más información sobre cómo se pueden usar diferentes valores en variables en tus programas, consulta el título *Types & Grammar* de esta serie.

## Bloques

El empleado de la tienda de teléfonos debe pasar por una serie de pasos para completar el proceso de pago cuando compras tu nuevo teléfono.

De manera similar, en el código a menudo necesitamos agrupar una serie de sentencias juntas, lo que a menudo llamamos un *bloque*. En JavaScript, un bloque se define envolviendo una o más sentencias dentro de un par de llaves `{ .. }`. Considera:

```js
var amount = 99.99;

// a general block
{
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

Este tipo de bloque general `{ .. }` independiente es válido, pero no es tan comúnmente visto en programas JS. Típicamente, los bloques se adjuntan a alguna otra sentencia de control, como una sentencia `if` (ver "Condicionales") o un bucle (ver "Bucles"). Por ejemplo:

```js
var amount = 99.99;

// is amount big enough?
if (amount > 10) {			// <-- block attached to `if`
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

Explicaremos las sentencias `if` en la siguiente sección, pero como puedes ver, el bloque `{ .. }` con sus dos sentencias está adjunto a `if (amount > 10)`; las sentencias dentro del bloque solo se procesarán si el condicional pasa.

**Nota:** A diferencia de la mayoría de otras sentencias como `console.log(amount);`, una sentencia de bloque no necesita un punto y coma (`;`) para concluir.

## Condicionales

"¿Quieres agregar los protectores de pantalla adicionales a tu compra, por $9.99?" El servicial empleado de la tienda de teléfonos te ha pedido que tomes una decisión. Y es posible que primero necesites consultar el *estado* actual de tu billetera o cuenta bancaria para responder esa pregunta. Pero obviamente, esta es solo una simple pregunta de "sí o no."

Hay bastantes formas en que podemos expresar *condicionales* (también llamadas decisiones) en nuestros programas.

El más común es la sentencia `if`. Esencialmente, estás diciendo, "*Si* esta condición es verdadera, haz lo siguiente...". Por ejemplo:

```js
var bank_balance = 302.13;
var amount = 99.99;

if (amount < bank_balance) {
	console.log( "I want to buy this phone!" );
}
```

La sentencia `if` requiere una expresión entre los paréntesis `( )` que se pueda tratar como `true` o `false`. En este programa, proporcionamos la expresión `amount < bank_balance`, que efectivamente evaluará a `true` o `false` dependiendo del monto en la variable `bank_balance`.

Incluso puedes proporcionar una alternativa si la condición no es verdadera, llamada cláusula `else`. Considera:

```js
const ACCESSORY_PRICE = 9.99;

var bank_balance = 302.13;
var amount = 99.99;

amount = amount * 2;

// can we afford the extra purchase?
if ( amount < bank_balance ) {
	console.log( "I'll take the accessory!" );
	amount = amount + ACCESSORY_PRICE;
}
// otherwise:
else {
	console.log( "No, thanks." );
}
```

Aquí, si `amount < bank_balance` es `true`, imprimiremos `"I'll take the accessory!"` y agregaremos los `9.99` a nuestra variable `amount`. De lo contrario, la cláusula `else` dice que simplemente responderemos cortésmente con `"No, thanks."` y dejaremos `amount` sin cambios.

Como discutimos en "Valores y Tipos" anteriormente, los valores que no son ya del tipo esperado a menudo se coercionan a ese tipo. La sentencia `if` espera un `boolean`, pero si le pasas algo que no es ya `boolean`, ocurrirá la coerción.

JavaScript define una lista de valores específicos que se consideran "falsy" porque cuando se coercionan a `boolean`, se convierten en `false` —esto incluye valores como `0` y `""`. Cualquier otro valor que no esté en la lista "falsy" es automáticamente "truthy" —cuando se coerciona a `boolean` se convierte en `true`. Los valores truthy incluyen cosas como `99.99` y `"free"`. Ver "Truthy y Falsy" en el Capítulo 2 para más información.

Los *condicionales* existen en otras formas además de `if`. Por ejemplo, la sentencia `switch` se puede usar como una forma abreviada de una serie de sentencias `if..else` (ver Capítulo 2). Los bucles (ver "Bucles") usan un *condicional* para determinar si el bucle debe seguir ejecutándose o detenerse.

**Nota:** Para información más detallada sobre las coerciones que pueden ocurrir implícitamente en las expresiones de prueba de los *condicionales*, consulta el Capítulo 4 del título *Types & Grammar* de esta serie.

## Bucles

Durante los momentos de mayor actividad, hay una lista de espera para los clientes que necesitan hablar con el empleado de la tienda de teléfonos. Mientras siga habiendo personas en esa lista, simplemente necesita seguir atendiendo al siguiente cliente.

Repetir un conjunto de acciones hasta que una cierta condición falle —en otras palabras, repetir solo mientras la condición se mantenga— es el trabajo de los bucles de programación; los bucles pueden tomar diferentes formas, pero todos satisfacen este comportamiento básico.

Un bucle incluye la condición de prueba así como un bloque (típicamente como `{ .. }`). Cada vez que el bloque del bucle se ejecuta, eso se llama una *iteración*.

Por ejemplo, el bucle `while` y las formas del bucle `do..while` ilustran el concepto de repetir un bloque de sentencias hasta que una condición deja de evaluarse como `true`:

```js
while (numOfCustomers > 0) {
	console.log( "How may I help you?" );

	// help the customer...

	numOfCustomers = numOfCustomers - 1;
}

// versus:

do {
	console.log( "How may I help you?" );

	// help the customer...

	numOfCustomers = numOfCustomers - 1;
} while (numOfCustomers > 0);
```

La única diferencia práctica entre estos bucles es si el condicional se prueba antes de la primera iteración (`while`) o después de la primera iteración (`do..while`).

En cualquiera de las formas, si el condicional se evalúa como `false`, la próxima iteración no se ejecutará. Eso significa que si la condición es inicialmente `false`, un bucle `while` nunca se ejecutará, pero un bucle `do..while` se ejecutará solo la primera vez.

A veces estás haciendo un bucle con el propósito previsto de contar un cierto conjunto de números, como del `0` al `9` (diez números). Puedes hacerlo estableciendo una variable de iteración de bucle como `i` en el valor `0` e incrementándola en `1` cada iteración.

**Advertencia:** Por diversas razones históricas, los lenguajes de programación casi siempre cuentan las cosas de forma basada en cero, lo que significa empezar con `0` en lugar de `1`. Si no estás familiarizado con ese modo de pensar, puede ser bastante confuso al principio. ¡Dedica algo de tiempo a practicar el conteo empezando por `0` para sentirte más cómodo con ello!

El condicional se prueba en cada iteración, como si hubiera una sentencia `if` implícita dentro del bucle.

Podemos usar la sentencia `break` de JavaScript para detener un bucle. Además, podemos observar que es bastante fácil crear un bucle que de otro modo se ejecutaría para siempre sin un mecanismo de `break`.

Ilustremos:

```js
var i = 0;

// a `while..true` loop would run forever, right?
while (true) {
	// stop the loop?
	if ((i <= 9) === false) {
		break;
	}

	console.log( i );
	i = i + 1;
}
// 0 1 2 3 4 5 6 7 8 9
```

**Advertencia:** Esta no es necesariamente una forma práctica que querrías usar para tus bucles. Se presenta aquí solo con fines ilustrativos.

Aunque un `while` (o `do..while`) puede realizar la tarea manualmente, hay otra forma sintáctica llamada bucle `for` para ese propósito:

```js
for (var i = 0; i <= 9; i = i + 1) {
	console.log( i );
}
// 0 1 2 3 4 5 6 7 8 9
```

Como puedes ver, en ambos casos el condicional `i <= 9` es `true` para las primeras 10 iteraciones (`i` con valores del `0` al `9`) de cualquiera de las formas del bucle, pero se convierte en `false` una vez que `i` tiene el valor `10`.

El bucle `for` tiene tres cláusulas: la cláusula de inicialización (`var i=0`), la cláusula de prueba condicional (`i <= 9`) y la cláusula de actualización (`i = i + 1`). Por lo tanto, si vas a contar con tus iteraciones de bucle, `for` es una forma más compacta y a menudo más fácil de entender y escribir.

Existen otras formas especializadas de bucle que están diseñadas para iterar sobre valores específicos, como las propiedades de un objeto (ver Capítulo 2) donde la prueba condicional implícita es simplemente si todas las propiedades han sido procesadas. El concepto de "bucle hasta que falle una condición" se mantiene independientemente de cuál sea la forma del bucle.

## Funciones

El empleado de la tienda de teléfonos probablemente no lleve una calculadora para calcular los impuestos y el monto de compra final. Esa es una tarea que necesita definir una vez y reutilizar una y otra vez. Lo más probable es que la empresa tenga una caja registradora (ordenador, tablet, etc.) con esas "funciones" integradas.

De manera similar, tu programa casi con certeza querrá dividir las tareas del código en piezas reutilizables, en lugar de repetirte repetitivamente (¡juego de palabras intencionado!). La forma de hacer esto es definir una `function`.

Una función es generalmente una sección de código con nombre que puede ser "llamada" por nombre, y el código dentro de ella se ejecutará cada vez. Considera:

```js
function printAmount() {
	console.log( amount.toFixed( 2 ) );
}

var amount = 99.99;

printAmount(); // "99.99"

amount = amount * 2;

printAmount(); // "199.98"
```

Las funciones pueden opcionalmente tomar argumentos (también llamados parámetros) —valores que pasas dentro. Y también pueden opcionalmente devolver un valor.

```js
function printAmount(amt) {
	console.log( amt.toFixed( 2 ) );
}

function formatAmount() {
	return "$" + amount.toFixed( 2 );
}

var amount = 99.99;

printAmount( amount * 2 );		// "199.98"

amount = formatAmount();
console.log( amount );			// "$99.99"
```

La función `printAmount(..)` toma un parámetro que llamamos `amt`. La función `formatAmount()` devuelve un valor. Por supuesto, también puedes combinar esas dos técnicas en la misma función.

Las funciones se usan a menudo para código que planeas llamar múltiples veces, pero también pueden ser útiles solo para organizar fragmentos de código relacionados en colecciones con nombre, incluso si solo planeas llamarlas una vez.

Considera:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}

var amount = 99.99;

amount = calculateFinalPurchaseAmount( amount );

console.log( amount.toFixed( 2 ) );		// "107.99"
```

Aunque `calculateFinalPurchaseAmount(..)` solo se llama una vez, organizar su comportamiento en una función con nombre separada hace que el código que usa su lógica (la sentencia `amount = calculateFinal...`) sea más limpio. Si la función tuviera más sentencias en ella, los beneficios serían aún más pronunciados.

### Scope

Si le preguntas al empleado de la tienda de teléfonos por un modelo de teléfono que su tienda no tiene, no podrá venderte el teléfono que quieres. Solo tiene acceso a los teléfonos en el inventario de su tienda. Tendrás que intentarlo en otra tienda para ver si puedes encontrar el teléfono que buscas.

La programación tiene un término para este concepto: *scope* (técnicamente llamado *scope léxico*). En JavaScript, cada función obtiene su propio scope. El scope es básicamente una colección de variables así como las reglas para cómo se accede a esas variables por nombre. Solo el código dentro de esa función puede acceder a las variables con *scope* de esa función.

Un nombre de variable tiene que ser único dentro del mismo scope —no puede haber dos variables `a` diferentes una al lado de la otra. Pero el mismo nombre de variable `a` podría aparecer en diferentes scopes.

```js
function one() {
	// this `a` only belongs to the `one()` function
	var a = 1;
	console.log( a );
}

function two() {
	// this `a` only belongs to the `two()` function
	var a = 2;
	console.log( a );
}

one();		// 1
two();		// 2
```

Además, un scope puede estar anidado dentro de otro scope, igual que si un payaso en una fiesta de cumpleaños infla un globo dentro de otro globo. Si un scope está anidado dentro de otro, el código dentro del scope más interno puede acceder a variables de cualquiera de los scopes.

Considera:

```js
function outer() {
	var a = 1;

	function inner() {
		var b = 2;

		// we can access both `a` and `b` here
		console.log( a + b );	// 3
	}

	inner();

	// we can only access `a` here
	console.log( a );			// 1
}

outer();
```

Las reglas del scope léxico dicen que el código en un scope puede acceder a variables de ese scope o de cualquier scope fuera de él.

Por lo tanto, el código dentro de la función `inner()` tiene acceso tanto a la variable `a` como a `b`, pero el código en `outer()` solo tiene acceso a `a` —no puede acceder a `b` porque esa variable solo está dentro de `inner()`.

Recuerda este fragmento de código de antes:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}
```

La constante `TAX_RATE` (variable) es accesible desde dentro de la función `calculateFinalPurchaseAmount(..)`, aunque no la pasamos como parámetro, gracias al scope léxico.

**Nota:** Para más información sobre el scope léxico, consulta los primeros tres capítulos del título *Scope & Closures* de esta serie.

## Práctica

No hay absolutamente ningún sustituto para la práctica en el aprendizaje de la programación. Ninguna cantidad de escritura articulada de mi parte por sí sola va a hacerte programador.

Con eso en mente, intentemos practicar algunos de los conceptos que aprendimos aquí en este capítulo. Te daré los "requisitos", y tú intenta primero. Luego consulta el listado de código a continuación para ver cómo yo lo abordé.

* Escribe un programa para calcular el precio total de la compra de tu teléfono. Seguirás comprando teléfonos (¡pista: bucle!) hasta que te quedes sin dinero en tu cuenta bancaria. También comprarás accesorios para cada teléfono siempre que el monto de tu compra esté por debajo de tu umbral mental de gasto.
* Después de calcular el monto de tu compra, añade el impuesto, luego imprime el monto de compra calculado, correctamente formateado.
* Finalmente, compara el monto con el saldo de tu cuenta bancaria para ver si puedes permitírtelo o no.
* Debes configurar algunas constantes para la "tasa impositiva", "precio del teléfono", "precio del accesorio" y "umbral de gasto", así como una variable para el "saldo de tu cuenta bancaria".
* Debes definir funciones para calcular el impuesto y para formatear el precio con un "$" y redondeando a dos decimales.
* **Desafío Adicional:** Intenta incorporar entrada en este programa, quizás con el `prompt(..)` cubierto en "Entrada" anteriormente. Puedes pedirle al usuario su saldo de cuenta bancaria, por ejemplo. ¡Diviértete y sé creativo!

Bien, adelante. Inténtalo. ¡No espíes mi listado de código hasta que lo hayas intentado tú mismo!

**Nota:** Como este es un libro de JavaScript, evidentemente voy a resolver el ejercicio práctico en JavaScript. Pero puedes hacerlo en otro lenguaje por ahora si te sientes más cómodo.

Aquí está mi solución en JavaScript para este ejercicio:

```js
const SPENDING_THRESHOLD = 200;
const TAX_RATE = 0.08;
const PHONE_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;

var bank_balance = 303.91;
var amount = 0;

function calculateTax(amount) {
	return amount * TAX_RATE;
}

function formatAmount(amount) {
	return "$" + amount.toFixed( 2 );
}

// keep buying phones while you still have money
while (amount < bank_balance) {
	// buy a new phone!
	amount = amount + PHONE_PRICE;

	// can we afford the accessory?
	if (amount < SPENDING_THRESHOLD) {
		amount = amount + ACCESSORY_PRICE;
	}
}

// don't forget to pay the government, too
amount = amount + calculateTax( amount );

console.log(
	"Your purchase: " + formatAmount( amount )
);
// Your purchase: $334.76

// can you actually afford this purchase?
if (amount > bank_balance) {
	console.log(
		"You can't afford this purchase. :("
	);
}
// You can't afford this purchase. :(
```

**Nota:** La forma más sencilla de ejecutar este programa JavaScript es escribirlo en la consola de desarrollador de tu navegador más cercano.

¿Cómo te fue? No vendría mal intentarlo de nuevo ahora que has visto mi código. Y juega con el cambio de algunas de las constantes para ver cómo el programa se ejecuta con diferentes valores.

## Repaso

No tiene por qué ser un proceso complejo y abrumador aprender a programar. Solo hay unos pocos conceptos básicos que necesitas asimilar.

Estos actúan como bloques de construcción. Para construir una torre alta, comienzas colocando bloque sobre bloque sobre bloque. Lo mismo ocurre con la programación. Aquí están algunos de los bloques de construcción esenciales de la programación:

* Necesitas *operadores* para realizar acciones sobre los valores.
* Necesitas valores y *tipos* para realizar diferentes tipos de acciones como matemáticas con `number`s o salida con `string`s.
* Necesitas *variables* para almacenar datos (también llamado *estado*) durante la ejecución de tu programa.
* Necesitas *condicionales* como sentencias `if` para tomar decisiones.
* Necesitas *bucles* para repetir tareas hasta que una condición deje de ser verdadera.
* Necesitas *funciones* para organizar tu código en fragmentos lógicos y reutilizables.

Los comentarios de código son una forma eficaz de escribir código más legible, lo que hace que tu programa sea más fácil de entender, mantener y corregir más adelante si hay problemas.

Finalmente, no descuides el poder de la práctica. La mejor manera de aprender a escribir código es escribir código.

¡Estoy emocionado de que estés bien encaminado para aprender a programar! Sigue adelante. No olvides consultar otros recursos de introducción a la programación (libros, blogs, formación online, etc.). Este capítulo y este libro son un gran comienzo, pero son solo una breve introducción.

El próximo capítulo revisará muchos de los conceptos de este capítulo, pero desde una perspectiva más específica de JavaScript, lo que destacará la mayoría de los principales temas que se abordan con mayor detalle a lo largo del resto de la serie.
