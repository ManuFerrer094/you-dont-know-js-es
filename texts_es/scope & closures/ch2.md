# No Sabes JS: Scope y Closures
# Capítulo 2: Scope Léxico

En el Capítulo 1, definimos "scope" como el conjunto de reglas que rigen cómo el *Motor* puede buscar una variable por su nombre de identificador y encontrarla, ya sea en el *Scope* actual, o en cualquiera de los *Scopes Anidados* que la contienen.

Hay dos modelos predominantes sobre cómo funciona el scope. El primero de ellos es con diferencia el más común, utilizado por la gran mayoría de los lenguajes de programación. Se llama **Scope Léxico**, y lo examinaremos en profundidad. El otro modelo, que todavía usan algunos lenguajes (como los scripts Bash, algunos modos en Perl, etc.) se llama **Scope Dinámico**.

El Scope Dinámico se cubre en el Apéndice A. Lo menciono aquí solo para proporcionar un contraste con el Scope Léxico, que es el modelo de scope que emplea JavaScript.

## Tiempo Léxico

Como discutimos en el Capítulo 1, la primera fase tradicional de un compilador de lenguaje estándar se llama lexing (también conocido como tokenización). Si recuerdas, el proceso de lexing examina una cadena de caracteres de código fuente y asigna significado semántico a los tokens como resultado de algún análisis con estado.

Es este concepto el que proporciona la base para entender qué es el scope léxico y de dónde viene el nombre.

Para definirlo de manera algo circular, el scope léxico es el scope que se define en el momento del lexing. En otras palabras, el scope léxico se basa en dónde se crean (se escriben) las variables y los bloques de scope, por ti, en el momento de escritura, y por lo tanto está (en su mayoría) grabado en piedra para el momento en que el lexer procesa tu código.

**Nota:** Veremos en un momento que hay algunas formas de "engañar" al scope léxico, modificándolo así después de que el lexer ha pasado, pero estas están mal vistas. Se considera una buena práctica tratar el scope léxico como, de hecho, solo léxico, y por lo tanto enteramente de naturaleza en tiempo de autor.

Considera este bloque de código:

```js
function foo(a) {

	var b = a * 2;

	function bar(c) {
		console.log( a, b, c );
	}

	bar(b * 3);
}

foo( 2 ); // 2 4 12
```

Hay tres scopes anidados inherentes en este ejemplo de código. Puede ser útil pensar en estos scopes como burbujas dentro de cada una.

<img src="fig2.png" width="500">

La **Burbuja 1** abarca el scope global, y solo tiene un identificador en él: `foo`.

La **Burbuja 2** abarca el scope de `foo`, que incluye los tres identificadores: `a`, `bar` y `b`.

La **Burbuja 3** abarca el scope de `bar`, y incluye solo un identificador: `c`.

Las burbujas de scope se definen por dónde se escriben los bloques de scope, cuál está anidado dentro del otro, etc. En el próximo capítulo, discutiremos diferentes unidades de scope, pero por ahora, asumamos que cada función crea una nueva burbuja de scope.

La burbuja para `bar` está completamente contenida dentro de la burbuja para `foo`, porque (y solo porque) ahí es donde elegimos definir la función `bar`.

Observa que estas burbujas anidadas están estrictamente anidadas. No estamos hablando de diagramas de Venn donde las burbujas pueden cruzar fronteras. En otras palabras, ninguna burbuja de alguna función puede existir simultáneamente (parcialmente) dentro de otras dos burbujas de scope externas, al igual que ninguna función puede estar parcialmente dentro de cada una de dos funciones padre.

### Búsquedas

La estructura y la colocación relativa de estas burbujas de scope explica completamente al *Motor* todos los lugares donde necesita mirar para encontrar un identificador.

En el fragmento de código anterior, el *Motor* ejecuta la sentencia `console.log(..)` y busca los tres identificadores referenciados `a`, `b` y `c`. Primero comienza con la burbuja de scope más interna, el scope de la función `bar(..)`. No encontrará `a` allí, por lo que sube un nivel, hacia la siguiente burbuja de scope más cercana, el scope de `foo(..)`. Encuentra `a` allí, y por lo tanto usa ese `a`. Lo mismo para `b`. Pero `c`, sí lo encuentra dentro de `bar(..)`.

Si hubiera habido un `c` tanto dentro de `bar(..)` como dentro de `foo(..)`, la sentencia `console.log(..)` habría encontrado y utilizado el de `bar(..)`, sin llegar nunca al de `foo(..)`.

**La búsqueda de scope se detiene una vez que encuentra la primera coincidencia**. El mismo nombre de identificador puede especificarse en múltiples capas de scope anidado, lo que se llama "sombreado" (el identificador interno "sombrea" al identificador externo). Independientemente del sombreado, la búsqueda de scope siempre comienza en el scope más interno que se está ejecutando en ese momento, y se dirige hacia afuera/arriba hasta la primera coincidencia, y se detiene.

**Nota:** Las variables globales también son automáticamente propiedades del objeto global (`window` en los navegadores, etc.), por lo que *es* posible hacer referencia a una variable global no directamente por su nombre léxico, sino indirectamente como una referencia de propiedad del objeto global.

```js
window.a
```

Esta técnica da acceso a una variable global que de otro modo sería inaccesible debido a que está sombreada. Sin embargo, las variables sombreadas no globales no pueden accederse.

No importa *desde dónde* se invoque una función, o incluso *cómo* se invoca, su scope léxico **solo** está definido por dónde fue declarada la función.

El proceso de búsqueda de scope léxico *solo* aplica a identificadores de primera clase, como `a`, `b` y `c`. Si tuvieras una referencia a `foo.bar.baz` en un fragmento de código, la búsqueda de scope léxico se aplicaría a encontrar el identificador `foo`, pero una vez que localiza esa variable, las reglas de acceso a propiedades de objetos se hacen cargo para resolver las propiedades `bar` y `baz`, respectivamente.

## Engañando el Léxico

Si el scope léxico está definido solo por dónde se declara una función, lo cual es enteramente una decisión en tiempo de autor, ¿cómo podría haber alguna forma de "modificar" (alias, engañar) el scope léxico en tiempo de ejecución?

JavaScript tiene dos mecanismos así. Ambos están igualmente mal vistos en la comunidad más amplia como malas prácticas para usar en tu código. Pero los argumentos típicos contra ellos a menudo pasan por alto el punto más importante: **engañar el scope léxico conduce a un peor rendimiento.**

Antes de explicar el problema de rendimiento, sin embargo, veamos cómo funcionan estos dos mecanismos.

### `eval`

La función `eval(..)` en JavaScript toma una cadena como argumento, y trata el contenido de la cadena como si en realidad hubiera sido código creado en ese punto en el programa. En otras palabras, puedes generar código programáticamente dentro de tu código creado, y ejecutar el código generado como si hubiera estado allí en tiempo de autor.

Evaluando `eval(..)` (juego de palabras intencionado) bajo esa luz, debería estar claro cómo `eval(..)` te permite modificar el entorno de scope léxico engañando y pretendiendo que el código en tiempo de autor (también llamado léxico) siempre estuvo allí.

En las líneas de código posteriores después de que se haya ejecutado un `eval(..)`, el *Motor* no "sabrá" ni "se importará" que el código previo en cuestión fue interpretado dinámicamente y por lo tanto modificó el entorno de scope léxico. El *Motor* simplemente realizará sus búsquedas de scope léxico como siempre lo hace.

Considera el siguiente código:

```js
function foo(str, a) {
	eval( str ); // cheating!
	console.log( a, b );
}

var b = 2;

foo( "var b = 3;", 1 ); // 1 3
```

La cadena `"var b = 3;"` se trata, en el punto de la llamada `eval(..)`, como código que siempre estuvo allí. Debido a que ese código resulta declarar una nueva variable `b`, modifica el scope léxico existente de `foo(..)`. De hecho, como se mencionó anteriormente, este código en realidad crea la variable `b` dentro de `foo(..)` que sombrea el `b` que fue declarado en el scope externo (global).

Cuando ocurre la llamada `console.log(..)`, encuentra tanto `a` como `b` en el scope de `foo(..)`, y nunca encuentra el `b` externo. Por lo tanto, imprimimos "1 3" en lugar de "1 2" como habría sido el caso normalmente.

**Nota:** En este ejemplo, por simplicidad, la cadena de "código" que pasamos era un literal fijo. Pero podría fácilmente haberse creado programáticamente agregando caracteres juntos según la lógica de tu programa. `eval(..)` generalmente se usa para ejecutar código creado dinámicamente, ya que la evaluación dinámica de código esencialmente estático de un literal de cadena no proporcionaría ningún beneficio real sobre solo crear el código directamente.

Por defecto, si una cadena de código que `eval(..)` ejecuta contiene una o más declaraciones (ya sea variables o funciones), esta acción modifica el scope léxico existente en el que reside el `eval(..)`. Técnicamente, `eval(..)` puede ser invocado "indirectamente", a través de varios trucos (más allá de nuestra discusión aquí), lo que lo hace ejecutar en el contexto del scope global, modificándolo así. Pero en cualquier caso, `eval(..)` puede en tiempo de ejecución modificar un scope léxico en tiempo de autor.

**Nota:** `eval(..)` cuando se usa en un programa en modo estricto opera en su propio scope léxico, lo que significa que las declaraciones hechas dentro del `eval()` no modifican en realidad el scope contenedor.

```js
function foo(str) {
   "use strict";
   eval( str );
   console.log( a ); // ReferenceError: a is not defined
}

foo( "var a = 2" );
```

Hay otras capacidades en JavaScript que equivalen a un efecto muy similar a `eval(..)`. `setTimeout(..)` y `setInterval(..)` *pueden* tomar una cadena para su respectivo primer argumento, cuyo contenido se `eval`úa como el código de una función generada dinámicamente. Esto es un comportamiento antiguo, heredado y desde hace tiempo en desuso. ¡No lo hagas!

El constructor de función `new Function(..)` de manera similar toma una cadena de código en su **último** argumento para convertirla en una función generada dinámicamente (el o los primeros argumentos, si los hay, son los parámetros nombrados para la nueva función). Esta sintaxis de constructor de función es ligeramente más segura que `eval(..)`, pero aun así debe evitarse en tu código.

Los casos de uso para generar código dinámicamente dentro de tu programa son increíblemente raros, ya que las degradaciones de rendimiento casi nunca valen la capacidad.

### `with`

La otra característica mal vista (¡y ahora en desuso!) en JavaScript que engaña el scope léxico es la palabra clave `with`. Hay múltiples formas válidas de explicar `with`, pero elegiré aquí explicarlo desde la perspectiva de cómo interactúa con el scope léxico y lo afecta.

`with` se explica típicamente como una forma abreviada para hacer múltiples referencias de propiedades contra un objeto *sin* repetir la referencia al objeto en sí misma cada vez.

Por ejemplo:

```js
var obj = {
	a: 1,
	b: 2,
	c: 3
};

// more "tedious" to repeat "obj"
obj.a = 2;
obj.b = 3;
obj.c = 4;

// "easier" short-hand
with (obj) {
	a = 3;
	b = 4;
	c = 5;
}
```

Sin embargo, aquí está pasando mucho más que solo una abreviación conveniente para el acceso a propiedades de objetos. Considera:

```js
function foo(obj) {
	with (obj) {
		a = 2;
	}
}

var o1 = {
	a: 3
};

var o2 = {
	b: 3
};

foo( o1 );
console.log( o1.a ); // 2

foo( o2 );
console.log( o2.a ); // undefined
console.log( a ); // 2 -- Oops, leaked global!
```

En este ejemplo de código, se crean dos objetos `o1` y `o2`. Uno tiene una propiedad `a`, y el otro no. La función `foo(..)` toma una referencia de objeto `obj` como argumento, y llama a `with (obj) { .. }` sobre la referencia. Dentro del bloque `with`, hacemos lo que parece ser una referencia léxica normal a una variable `a`, de hecho una referencia LHS (ver Capítulo 1), para asignarle el valor `2`.

Cuando pasamos `o1`, la asignación `a = 2` encuentra la propiedad `o1.a` y le asigna el valor `2`, como se refleja en la subsecuente sentencia `console.log(o1.a)`. Sin embargo, cuando pasamos `o2`, dado que no tiene una propiedad `a`, no se crea tal propiedad, y `o2.a` permanece `undefined`.

Pero luego notamos un peculiar efecto secundario, el hecho de que la asignación `a = 2` creó una variable global `a`. ¿Cómo puede ser esto?

La sentencia `with` toma un objeto, uno que tiene cero o más propiedades, y **trata ese objeto como si *él* fuera un scope léxico completamente separado**, y por lo tanto las propiedades del objeto se tratan como identificadores definidos léxicamente en ese "scope".

**Nota:** Aunque un bloque `with` trata un objeto como un scope léxico, una declaración `var` normal dentro de ese bloque `with` no estará en el alcance de ese bloque `with`, sino en cambio en el scope de la función contenedora.

Mientras que la función `eval(..)` puede modificar el scope léxico existente si toma una cadena de código con una o más declaraciones en ella, la sentencia `with` en realidad crea un **scope léxico completamente nuevo** de la nada, del objeto que le pasas.

Entendido de esta manera, el "scope" declarado por la sentencia `with` cuando pasamos `o1` era `o1`, y ese "scope" tenía un "identificador" en él que corresponde a la propiedad `o1.a`. Pero cuando usamos `o2` como el "scope", no tenía tal "identificador" `a` en él, y por lo tanto ocurrieron las reglas normales de búsqueda de identificador LHS (ver Capítulo 1).

Ni el "scope" de `o2`, ni el scope de `foo(..)`, ni siquiera el scope global, tiene un identificador `a` que se pueda encontrar, por lo que cuando se ejecuta `a = 2`, resulta en la creación automática del global (ya que estamos en modo no estricto).

Es un pensamiento un tanto alucinante ver `with` convirtiendo, en tiempo de ejecución, un objeto y sus propiedades en un "scope" *con* "identificadores". Pero esa es la explicación más clara que puedo dar para los resultados que vemos.

**Nota:** Además de ser una mala idea usar, tanto `eval(..)` como `with` están afectados (restringidos) por el Modo Estricto. `with` está directamente prohibido, mientras que varias formas de `eval(..)` indirecto o inseguro están prohibidas mientras se retiene la funcionalidad central.

### Rendimiento

Tanto `eval(..)` como `with` engañan al scope léxico definido en tiempo de autor modificando o creando un nuevo scope léxico en tiempo de ejecución.

Entonces, ¿cuál es el gran problema?, preguntas. Si ofrecen una funcionalidad más sofisticada y flexibilidad de codificación, ¿no son estas *buenas* características? **No.**

El *Motor* JavaScript tiene varias optimizaciones de rendimiento que realiza durante la fase de compilación. Algunas de estas se reducen a poder esencialmente analizar estáticamente el código mientras hace el lexing, y pre-determinar dónde están todas las declaraciones de variables y funciones, de modo que tome menos esfuerzo resolver identificadores durante la ejecución.

Pero si el *Motor* encuentra un `eval(..)` o `with` en el código, esencialmente tiene que *asumir* que toda su conciencia de la ubicación de los identificadores puede ser inválida, porque no puede saber en el momento del lexing exactamente qué código puedes pasarle a `eval(..)` para modificar el scope léxico, o los contenidos del objeto que puedes pasarle a `with` para crear un nuevo scope léxico a consultar.

En otras palabras, en el sentido pesimista, la mayoría de esas optimizaciones que *haría* son inútiles si `eval(..)` o `with` están presentes, por lo que simplemente no realiza las optimizaciones *en absoluto*.

Tu código casi con certeza tenderá a ejecutarse más lento simplemente por el hecho de que incluyes un `eval(..)` o `with` en cualquier parte del código. No importa cuán inteligente sea el *Motor* al intentar limitar los efectos secundarios de estas suposiciones pesimistas, **no hay forma de evitar el hecho de que sin las optimizaciones, el código se ejecuta más lento.**

## Repaso (TL;DR)

El scope léxico significa que el scope está definido por las decisiones del autor en tiempo de autor de dónde se declaran las funciones. La fase de lexing de la compilación es esencialmente capaz de conocer dónde y cómo se declaran todos los identificadores, y así predecir cómo serán buscados durante la ejecución.

Dos mecanismos en JavaScript pueden "engañar" al scope léxico: `eval(..)` y `with`. El primero puede modificar el scope léxico existente (en tiempo de ejecución) evaluando una cadena de "código" que tiene una o más declaraciones en ella. El último esencialmente crea un scope léxico completamente nuevo (de nuevo, en tiempo de ejecución) tratando una referencia de objeto *como* un "scope" y las propiedades de ese objeto como identificadores con scope.

El inconveniente de estos mecanismos es que derrota la capacidad del *Motor* para realizar optimizaciones en tiempo de compilación con respecto a la búsqueda de scope, porque el *Motor* tiene que asumir pesimistamente que tales optimizaciones serán inválidas. El código *se ejecutará* más lento como resultado de usar cualquiera de las características. **No los uses.**
