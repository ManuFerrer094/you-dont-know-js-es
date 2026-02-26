# No Sabes JS: Scope y Closures
# Capítulo 1: ¿Qué es el Scope?

Uno de los paradigmas más fundamentales de casi todos los lenguajes de programación es la capacidad de almacenar valores en variables, y posteriormente recuperar o modificar esos valores. De hecho, la capacidad de almacenar valores y extraer valores de las variables es lo que le otorga *estado* a un programa.

Sin tal concepto, un programa podría realizar algunas tareas, pero serían extremadamente limitadas y no muy interesantes.

Pero la inclusión de variables en nuestro programa genera las preguntas más interesantes que abordaremos ahora: ¿dónde *viven* esas variables? En otras palabras, ¿dónde se almacenan? Y, más importante aún, ¿cómo las encuentra nuestro programa cuando las necesita?

Estas preguntas hablan de la necesidad de un conjunto bien definido de reglas para almacenar variables en algún lugar, y para encontrar esas variables en un momento posterior. Llamaremos a ese conjunto de reglas: *Scope*.

Pero, ¿dónde y cómo se establecen estas reglas de *Scope*?

## Teoría del Compilador

Puede ser evidente, o puede ser sorprendente, dependiendo de tu nivel de interacción con varios lenguajes, pero a pesar de que JavaScript cae bajo la categoría general de lenguajes "dinámicos" o "interpretados", en realidad es un lenguaje compilado. *No* se compila con mucha anticipación, como ocurre con muchos lenguajes compilados de manera tradicional, ni los resultados de la compilación son portables entre varios sistemas distribuidos.

Pero, sin embargo, el motor JavaScript realiza muchos de los mismos pasos, aunque de formas más sofisticadas de las que normalmente somos conscientes, que cualquier compilador de lenguaje tradicional.

En un proceso de lenguaje compilado tradicional, un fragmento de código fuente, tu programa, sufrirá típicamente tres pasos *antes* de ejecutarse, llamados aproximadamente "compilación":

1. **Tokenización/Lexing:** descomposición de una cadena de caracteres en fragmentos significativos (para el lenguaje), llamados tokens. Por ejemplo, considera el programa: `var a = 2;`. Este programa probablemente se descompondría en los siguientes tokens: `var`, `a`, `=`, `2` y `;`. El espacio en blanco puede o no persistir como un token, dependiendo de si es significativo o no.

    **Nota:** La diferencia entre tokenización y lexing es sutil y académica, pero se centra en si estos tokens se identifican de forma *sin estado* o *con estado*. Dicho de manera simple, si el tokenizador invocara reglas de análisis con estado para determinar si `a` debe considerarse un token distinto o solo parte de otro token, *eso* sería **lexing**.

2. **Parsing:** tomar un flujo (array) de tokens y convertirlo en un árbol de elementos anidados, que en conjunto representan la estructura gramatical del programa. Este árbol se denomina "AST" (<b>A</b>rbol de <b>S</b>intaxis <b>A</b>bstracta).

    El árbol para `var a = 2;` podría comenzar con un nodo de nivel superior llamado `VariableDeclaration`, con un nodo hijo llamado `Identifier` (cuyo valor es `a`), y otro hijo llamado `AssignmentExpression` que a su vez tiene un hijo llamado `NumericLiteral` (cuyo valor es `2`).

3. **Generación de Código:** el proceso de tomar un AST y convertirlo en código ejecutable. Esta parte varía enormemente dependiendo del lenguaje, la plataforma a la que apunta, etc.

    Entonces, en lugar de perdernos en los detalles, simplemente diremos que hay una forma de tomar nuestro AST descrito anteriormente para `var a = 2;` y convertirlo en un conjunto de instrucciones de máquina para en realidad *crear* una variable llamada `a` (incluyendo la reserva de memoria, etc.), y luego almacenar un valor en `a`.

    **Nota:** Los detalles de cómo el motor gestiona los recursos del sistema son más profundos de lo que exploraremos, así que simplemente daremos por sentado que el motor es capaz de crear y almacenar variables según sea necesario.

El motor JavaScript es enormemente más complejo que *solo* esos tres pasos, al igual que la mayoría de los otros compiladores de lenguaje. Por ejemplo, en el proceso de análisis y generación de código, ciertamente hay pasos para optimizar el rendimiento de la ejecución, incluyendo el colapso de elementos redundantes, etc.

Así que estoy pintando solo con trazos amplios aquí. Pero creo que verás enseguida por qué *estos* detalles que *sí* cubrimos, incluso a un alto nivel, son relevantes.

Por un lado, los motores JavaScript no tienen el lujo (como otros compiladores de lenguaje) de disponer de mucho tiempo para optimizar, porque la compilación de JavaScript no ocurre en un paso de construcción previo, como con otros lenguajes.

Para JavaScript, la compilación que ocurre sucede, en muchos casos, meros microsegundos (¡o menos!) antes de que el código se ejecute. Para garantizar el rendimiento más rápido, los motores JS utilizan todo tipo de trucos (como los JITs, que compilación perezosa e incluso recompilación en caliente, etc.) que están bien más allá del "alcance" de nuestra discusión aquí.

Digamos, por simplicidad, que cualquier fragmento de JavaScript tiene que ser compilado antes de (¡generalmente *justo* antes!) ejecutarse. Entonces, el compilador JS tomará el programa `var a = 2;` y lo compilará *primero*, y luego estará listo para ejecutarlo, generalmente de inmediato.

## Entendiendo el Scope

La forma en que abordaremos el aprendizaje sobre el scope es pensar en el proceso en términos de una conversación. Pero, ¿*quién* está teniendo la conversación?

### El Reparto

Conozcamos al reparto de personajes que interactúan para procesar el programa `var a = 2;`, de modo que entendamos sus conversaciones en las que escucharemos en breve:

1. *Motor*: responsable de la compilación y ejecución de inicio a fin de nuestro programa JavaScript.

2. *Compilador*: uno de los amigos del *Motor*; maneja todo el trabajo sucio de análisis y generación de código (ver sección anterior).

3. *Scope*: otro amigo del *Motor*; recopila y mantiene una lista de búsqueda de todos los identificadores declarados (variables), y aplica un conjunto estricto de reglas sobre cómo son accesibles al código que se está ejecutando actualmente.

Para que *comprendas completamente* cómo funciona JavaScript, debes comenzar a *pensar* como *Motor* (y amigos) piensan, hacer las preguntas que ellos hacen, y responder esas preguntas de la misma manera.

### De un Lado a Otro

Cuando ves el programa `var a = 2;`, lo más probable es que lo pienses como una sola sentencia. Pero así no es como lo ve nuestro nuevo amigo *Motor*. De hecho, *Motor* ve dos sentencias distintas, una que *Compilador* manejará durante la compilación, y una que *Motor* manejará durante la ejecución.

Entonces, desglosemos cómo *Motor* y sus amigos abordarán el programa `var a = 2;`.

Lo primero que *Compilador* hará con este programa es realizar el lexing para descomponerlo en tokens, que luego analizará para convertirlos en un árbol. Pero cuando *Compilador* llega a la generación de código, tratará este programa de manera algo diferente a lo que quizás se asume.

Una suposición razonable sería que *Compilador* producirá código que podría resumirse mediante este pseudo-código: "Asignar memoria para una variable, etiquetarla `a`, luego meter el valor `2` en esa variable." Desafortunadamente, eso no es del todo preciso.

*Compilador* procederá en su lugar de la siguiente manera:

1. Al encontrar `var a`, *Compilador* le pregunta a *Scope* si ya existe una variable `a` para esa colección de scope particular. Si es así, *Compilador* ignora esta declaración y continúa. De lo contrario, *Compilador* le pide a *Scope* que declare una nueva variable llamada `a` para esa colección de scope.

2. *Compilador* luego produce código para que *Motor* lo ejecute más tarde, para manejar la asignación `a = 2`. El código que *Motor* ejecuta primero le preguntará a *Scope* si hay una variable llamada `a` accesible en la colección de scope actual. Si la hay, *Motor* usa esa variable. Si no, *Motor* mira *en otro lugar* (ver la sección de *Scope* anidado a continuación).

Si *Motor* finalmente encuentra una variable, le asigna el valor `2`. Si no, ¡*Motor* levantará su mano y gritará un error!

Para resumir: se realizan dos acciones distintas para una asignación de variable: Primero, *Compilador* declara una variable (si no fue declarada previamente en el scope actual), y segundo, al ejecutarse, *Motor* busca la variable en *Scope* y le asigna, si la encuentra.

### El Lenguaje del Compilador

Necesitamos un poco más de terminología del compilador para proceder con la comprensión.

Cuando *Motor* ejecuta el código que *Compilador* produjo para el paso (2), tiene que buscar la variable `a` para ver si ha sido declarada, y esta búsqueda consiste en consultar *Scope*. Pero el tipo de búsqueda que *Motor* realiza afecta el resultado de la búsqueda.

En nuestro caso, se dice que *Motor* estaría realizando una búsqueda "LHS" para la variable `a`. El otro tipo de búsqueda se llama "RHS".

Apuesto a que puedes adivinar qué significa la "L" y la "R". Estos términos significan "Lado Izquierdo" (Left-hand Side) y "Lado Derecho" (Right-hand Side).

Lado... ¿de qué? **De una operación de asignación.**

En otras palabras, una búsqueda LHS se realiza cuando una variable aparece en el lado izquierdo de una operación de asignación, y una búsqueda RHS se realiza cuando una variable aparece en el lado derecho de una operación de asignación.

En realidad, seamos un poco más precisos. Una búsqueda RHS es indistinguible, para nuestros propósitos, de simplemente una búsqueda del valor de alguna variable, mientras que la búsqueda LHS está tratando de encontrar el contenedor de la variable en sí, para poder asignarle. De esta manera, RHS no *realmente* significa "lado derecho de una asignación" per se, simplemente, de manera más precisa, significa "no el lado izquierdo".

Siendo un poco superficial por un momento, también podrías pensar que "RHS" significa "recuperar su fuente (valor)", lo que implica que RHS significa "obtener el valor de...".

Profundicemos más en eso.

Cuando digo:

```js
console.log( a );
```

La referencia a `a` es una referencia RHS, porque no se le está asignando nada a `a` aquí. En cambio, estamos buscando para recuperar el valor de `a`, de modo que el valor pueda pasarse a `console.log(..)`.

Por el contrario:

```js
a = 2;
```

La referencia a `a` aquí es una referencia LHS, porque en realidad no nos importa cuál es el valor actual, simplemente queremos encontrar la variable como objetivo para la operación de asignación `= 2`.

**Nota:** LHS y RHS significando "lado izquierdo/derecho de una asignación" no necesariamente significa literalmente "lado izquierdo/derecho del operador de asignación `=`". Hay varias otras formas en que ocurren las asignaciones, y por eso es mejor pensarlo conceptualmente como: "¿quién es el objetivo de la asignación (LHS)?" y "¿quién es la fuente de la asignación (RHS)?".

Considera este programa, que tiene referencias tanto LHS como RHS:

```js
function foo(a) {
	console.log( a ); // 2
}

foo( 2 );
```

La última línea que invoca `foo(..)` como una llamada de función requiere una referencia RHS a `foo`, lo que significa "ir a buscar el valor de `foo`, y dármelo." Además, `(..)` significa que el valor de `foo` debe ejecutarse, ¡por lo que es mejor que en realidad sea una función!

Hay una asignación sutil pero importante aquí. **¿La viste?**

Puede que te hayas perdido el `a = 2` implícito en este fragmento de código. Ocurre cuando el valor `2` se pasa como argumento a la función `foo(..)`, en cuyo caso el valor `2` se **asigna** al parámetro `a`. Para (implícitamente) asignar al parámetro `a`, se realiza una búsqueda LHS.

También hay una referencia RHS para el valor de `a`, y el valor resultante se pasa a `console.log(..)`. `console.log(..)` necesita una referencia para ejecutarse. Es una búsqueda RHS del objeto `console`, y luego ocurre una resolución de propiedad para ver si tiene un método llamado `log`.

Finalmente, podemos conceptualizar que hay un intercambio LHS/RHS de pasarle el valor `2` (a través de la búsqueda RHS de la variable `a`) a `log(..)`. Dentro de la implementación nativa de `log(..)`, podemos asumir que tiene parámetros, el primero de los cuales (quizás llamado `arg1`) tiene una búsqueda de referencia LHS, antes de asignarle `2`.

**Nota:** Puede que te tiente conceptualizar la declaración de función `function foo(a) {...` como una declaración y asignación de variable normal, como `var foo` y `foo = function(a){...`. Al hacerlo, sería tentador pensar en esta declaración de función como si involucrara una búsqueda LHS.

Sin embargo, la diferencia sutil pero importante es que *Compilador* maneja tanto la declaración como la definición del valor durante la generación de código, de tal manera que cuando *Motor* está ejecutando el código, no hay procesamiento necesario para "asignar" un valor de función a `foo`. Por lo tanto, no es realmente apropiado pensar en una declaración de función como una asignación de búsqueda LHS de la manera que estamos discutiendo aquí.

### Conversación Motor/Scope

```js
function foo(a) {
	console.log( a ); // 2
}

foo( 2 );
```

Imaginemos el intercambio anterior (que procesa este fragmento de código) como una conversación. La conversación iría algo así:

> ***Motor***: Oye *Scope*, tengo una referencia RHS para `foo`. ¿Lo conoces?

> ***Scope***: Pues sí, lo tengo. *Compilador* lo declaró hace un momento. Es una función. Aquí tienes.

> ***Motor***: ¡Genial, gracias! OK, estoy ejecutando `foo`.

> ***Motor***: Oye, *Scope*, tengo una referencia LHS para `a`, ¿lo conoces?

> ***Scope***: Pues sí, lo tengo. *Compilador* lo declaró como un parámetro formal de `foo` hace poco. Aquí tienes.

> ***Motor***: Siempre tan útil, *Scope*. Gracias de nuevo. Ahora, es hora de asignar `2` a `a`.

> ***Motor***: Oye, *Scope*, perdona que te moleste de nuevo. Necesito una búsqueda RHS para `console`. ¿Lo conoces?

> ***Scope***: Sin problema, *Motor*, esto es lo que hago todo el día. Sí, tengo `console`. Es un integrado. Aquí tienes.

> ***Motor***: Perfecto. Buscando `log(..)`. OK, genial, es una función.

> ***Motor***: Oye, *Scope*. ¿Puedes ayudarme con una referencia RHS a `a`? Creo que lo recuerdo, pero solo quiero comprobarlo.

> ***Scope***: Tienes razón, *Motor*. El mismo tipo, no ha cambiado. Aquí tienes.

> ***Motor***: Bien. Pasando el valor de `a`, que es `2`, a `log(..)`.

> ...

### Cuestionario

Comprueba tu comprensión hasta ahora. Asegúrate de hacer el papel de *Motor* y tener una "conversación" con el *Scope*:

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identifica todas las búsquedas LHS (¡hay 3!).

2. Identifica todas las búsquedas RHS (¡hay 4!).

**Nota:** ¡Consulta el repaso del capítulo para las respuestas del cuestionario!

## Scope Anidado

Dijimos que *Scope* es un conjunto de reglas para buscar variables por su nombre de identificador. Sin embargo, por lo general hay más de un *Scope* a considerar.

Al igual que un bloque o función está anidado dentro de otro bloque o función, los scopes están anidados dentro de otros scopes. Entonces, si una variable no se puede encontrar en el scope inmediato, *Motor* consulta el siguiente scope contenedor externo, continuando hasta encontrarla o hasta que se haya alcanzado el scope más externo (también conocido como global).

Considera:

```js
function foo(a) {
	console.log( a + b );
}

var b = 2;

foo( 2 ); // 4
```

La referencia RHS para `b` no puede resolverse dentro de la función `foo`, pero sí puede resolverse en el *Scope* que la rodea (en este caso, el global).

Entonces, revisando las conversaciones entre *Motor* y *Scope*, escucharíamos:

> ***Motor***: "Oye, *Scope* de `foo`, ¿has oído hablar de `b`? Tengo una referencia RHS para ello."

> ***Scope***: "No, nunca lo he escuchado. A pescar."

> ***Motor***: "Oye, *Scope* fuera de `foo`, ah eres el *Scope* global, ok bien. ¿Has oído hablar de `b`? Tengo una referencia RHS para ello."

> ***Scope***: "Sí, claro que sí. Aquí tienes."

Las reglas simples para atravesar el *Scope* anidado: *Motor* comienza en el *Scope* que se está ejecutando actualmente, busca la variable allí, y luego si no la encuentra, sigue subiendo un nivel, y así sucesivamente. Si se alcanza el scope global más externo, la búsqueda se detiene, haya encontrado la variable o no.

### Construyendo sobre Metáforas

Para visualizar el proceso de resolución de *Scope* anidado, quiero que pienses en este edificio alto.

<img src="fig1.png" width="250">

El edificio representa el conjunto de reglas de *Scope* anidado de nuestro programa. El primer piso del edificio representa tu *Scope* que se está ejecutando actualmente, dondequiera que estés. El nivel superior del edificio es el *Scope* global.

Resuelves las referencias LHS y RHS mirando en tu piso actual, y si no las encuentras, tomando el ascensor al siguiente piso, mirando allí, luego al siguiente, y así sucesivamente. Una vez que llegas al último piso (el *Scope* global), o encuentras lo que buscas, o no. Pero tienes que detenerte independientemente.

## Errores

¿Por qué importa si lo llamamos LHS o RHS?

Porque estos dos tipos de búsquedas se comportan de manera diferente en la circunstancia en que la variable aún no ha sido declarada (no se encuentra en ningún *Scope* consultado).

Considera:

```js
function foo(a) {
	console.log( a + b );
	b = a;
}

foo( 2 );
```

Cuando ocurre la búsqueda RHS para `b` por primera vez, no se encontrará. Esto se dice que es una variable "no declarada", porque no se encuentra en el scope.

Si una búsqueda RHS nunca puede encontrar una variable, en ningún lugar de los *Scope*s anidados, esto resulta en que *Motor* lanza un `ReferenceError`. Es importante notar que el error es del tipo `ReferenceError`.

Por el contrario, si *Motor* está realizando una búsqueda LHS y llega al último piso (*Scope* global) sin encontrarla, y si el programa no se está ejecutando en "Modo Estricto" [^note-strictmode], entonces el *Scope* global creará una nueva variable con ese nombre **en el scope global**, y se la pasará de vuelta a *Motor*.

*"No, no había una antes, pero fui útil y cree una para ti."*

El "Modo Estricto" [^note-strictmode], que se añadió en ES5, tiene una serie de comportamientos diferentes del modo normal/relajado/perezoso. Uno de esos comportamientos es que no permite la creación automática/implícita de variables globales. En ese caso, no habría una variable con alcance global para devolver desde una búsqueda LHS, y *Motor* lanzaría un `ReferenceError` de manera similar al caso RHS.

Ahora bien, si se encuentra una variable para una búsqueda RHS, pero intentas hacer algo con su valor que es imposible, como intentar ejecutar como función un valor que no es una función, o hacer referencia a una propiedad en un valor `null` o `undefined`, entonces *Motor* lanza un tipo diferente de error, llamado `TypeError`.

`ReferenceError` está relacionado con el fallo en la resolución del *Scope*, mientras que `TypeError` implica que la resolución del *Scope* fue exitosa, pero que se intentó una acción ilegal/imposible contra el resultado.

## Repaso (TL;DR)

El scope es el conjunto de reglas que determina dónde y cómo se puede buscar una variable (identificador). Esta búsqueda puede ser con el fin de asignar a la variable, que es una referencia LHS (lado izquierdo), o puede ser con el fin de recuperar su valor, que es una referencia RHS (lado derecho).

Las referencias LHS resultan de operaciones de asignación. Las asignaciones relacionadas con el *Scope* pueden ocurrir tanto con el operador `=` como al pasar argumentos a (asignar a) los parámetros de función.

El *Motor* JavaScript primero compila el código antes de ejecutarlo, y al hacerlo, divide sentencias como `var a = 2;` en dos pasos separados:

1. Primero, `var a` para declararlo en ese *Scope*. Esto se realiza al principio, antes de la ejecución del código.

2. Más tarde, `a = 2` para buscar la variable (referencia LHS) y asignarle si se la encuentra.

Tanto las búsquedas de referencia LHS como RHS comienzan en el *Scope* que se está ejecutando actualmente, y si es necesario (es decir, no encuentran lo que buscan allí), trabajan hacia arriba en el *Scope* anidado, un scope (piso) a la vez, buscando el identificador, hasta que llegan al global (último piso) y se detienen, encontrándolo o no.

Las referencias RHS no satisfechas resultan en que se lanzan `ReferenceError`s. Las referencias LHS no satisfechas resultan en la creación automática de un global con ese nombre (si no está en "Modo Estricto" [^note-strictmode]), o en un `ReferenceError` (si está en "Modo Estricto" [^note-strictmode]).

### Respuestas del Cuestionario

```js
function foo(a) {
	var b = a;
	return a + b;
}

var c = foo( 2 );
```

1. Identifica todas las búsquedas LHS (¡hay 3!).

	**`c = ..`, `a = 2` (asignación implícita de parámetros) y `b = ..`**

2. Identifica todas las búsquedas RHS (¡hay 4!).

    **`foo(2..`, `= a;`, `a + ..` y `.. + b`**


[^note-strictmode]: MDN: [Strict Mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
