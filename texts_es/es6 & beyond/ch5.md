# You Don't Know JS: ES6 & Beyond
# Capítulo 5: Colecciones

La recopilación y acceso estructurado a datos es un componente crítico de casi cualquier programa JS. Desde el comienzo del lenguaje hasta este punto, el array y el objeto han sido nuestro mecanismo principal para crear estructuras de datos. Por supuesto, muchas estructuras de datos de nivel superior se han construido sobre estos, como bibliotecas de código de usuario.

A partir de ES6, algunas de las abstracciones de estructura de datos más útiles (¡y optimizadoras de rendimiento!) se han añadido como componentes nativos del lenguaje.

Comenzaremos este capítulo primero mirando los *TypedArrays*, técnicamente contemporáneos al esfuerzo de ES5 de hace varios años, pero solo estandarizados como compañeros de WebGL y no de JavaScript en sí. A partir de ES6, estos han sido adoptados directamente por la especificación del lenguaje, lo que les da estatus de primera clase.

Los Maps son como objetos (pares clave/valor), pero en vez de solo una cadena para la clave, puedes usar cualquier valor — ¡incluso otro objeto o map! Los Sets son similares a arrays (listas de valores), pero los valores son únicos; si añades un duplicado, se ignora. También hay contrapartes débiles (en relación a la memoria/recolección de basura): WeakMap y WeakSet.

## TypedArrays

Como cubrimos en el título *Types & Grammar* de esta serie, JS sí tiene un conjunto de tipos integrados, como `number` y `string`. Sería tentador mirar una característica llamada "typed array" y asumir que significa un array de un tipo específico de valores, como un array de solo cadenas.

Sin embargo, los typed arrays son realmente más sobre proporcionar acceso estructurado a datos binarios usando semántica similar a arrays (acceso indexado, etc.). El "tipo" en el nombre se refiere a una "vista" sobre el tipo del contenedor de bits, que es esencialmente un mapeo de si los bits deberían verse como un array de enteros de 8 bits con signo, enteros de 16 bits con signo, y así sucesivamente.

¿Cómo construyes tal contenedor de bits? Se llama un "buffer", y lo construyes más directamente con el constructor `ArrayBuffer(..)`:

```js
var buf = new ArrayBuffer( 32 );
buf.byteLength;							// 32
```

`buf` ahora es un buffer binario de 32 bytes de largo (256 bits), que está pre-inicializado todo en `0`s. Un buffer por sí mismo realmente no te permite ninguna interacción excepto verificar su propiedad `byteLength`.

**Consejo:** Varias características de la plataforma web usan o devuelven array buffers, como `FileReader#readAsArrayBuffer(..)`, `XMLHttpRequest#send(..)`, e `ImageData` (datos de canvas).

Pero sobre este array buffer, puedes entonces colocar una "vista", que viene en la forma de un typed array. Considera:

```js
var arr = new Uint16Array( buf );
arr.length;							// 16
```

`arr` es un typed array de enteros sin signo de 16 bits mapeados sobre el buffer `buf` de 256 bits, lo que significa que obtienes 16 elementos.

### Endianness

Es muy importante entender que el `arr` se mapea usando la configuración endian (big-endian o little-endian) de la plataforma sobre la que JS está corriendo. Esto puede ser un problema si los datos binarios son creados con un endianness pero interpretados en una plataforma con el endianness opuesto.

Endian significa si el byte de orden bajo (colección de 8 bits) de un número multi-byte — como los ints sin signo de 16 bits que creamos en el fragmento anterior — está a la derecha o a la izquierda de los bytes del número.

Por ejemplo, imaginemos el número base-10 `3085`, que toma 16 bits para representarse. Si tienes solo un contenedor de un número de 16 bits, sería representado en binario como `0000110000001101` (hexadecimal `0c0d`) independientemente del endianness.

Pero si `3085` se representara con dos números de 8 bits, el endianness afectaría significativamente su almacenamiento en memoria:

* `0000110000001101` / `0c0d` (big endian)
* `0000110100001100` / `0d0c` (little endian)

Si recibieras los bits de `3085` como `0000110100001100` de un sistema little-endian, pero colocaras una vista sobre él en un sistema big-endian, verías en su lugar el valor `3340` (base-10) y `0d0c` (base-16).

Little endian es la representación más común en la web hoy en día, pero definitivamente hay navegadores donde eso no es cierto. Es importante que entiendas el endianness tanto del productor como del consumidor de un trozo de datos binarios.

De MDN, aquí hay una manera rápida de probar el endianness de tu JavaScript:

```js
var littleEndian = (function() {
	var buffer = new ArrayBuffer( 2 );
	new DataView( buffer ).setInt16( 0, 256, true );
	return new Int16Array( buffer )[0] === 256;
})();
```

`littleEndian` será `true` o `false`; para la mayoría de navegadores, debería devolver `true`. Esta prueba usa `DataView(..)`, que permite un control de más bajo nivel y mayor granularidad sobre el acceso (establecer/obtener) a los bits de la vista que colocas sobre el buffer. El tercer parámetro del método `setInt16(..)` en el fragmento anterior es para decirle al `DataView` qué endianness quieres que use para esa operación.

**Advertencia:** No confundas el endianness del almacenamiento binario subyacente en array buffers con cómo un número dado se representa cuando se expone en un programa JS. Por ejemplo, `(3085).toString(2)` devuelve `"110000001101"`, que con cuatro `"0"`s iniciales asumidos aparenta ser la representación big-endian. De hecho, esta representación está basada en una sola vista de 16 bits, no una vista de dos bytes de 8 bits. La prueba `DataView` anterior es la mejor manera de determinar el endianness para tu entorno JS.

### Múltiples Vistas

Un solo buffer puede tener múltiples vistas adjuntas, como:

```js
var buf = new ArrayBuffer( 2 );

var view8 = new Uint8Array( buf );
var view16 = new Uint16Array( buf );

view16[0] = 3085;
view8[0];						// 13
view8[1];						// 12

view8[0].toString( 16 );		// "d"
view8[1].toString( 16 );		// "c"

// intercambiar (¡como si fuera endian!)
var tmp = view8[0];
view8[0] = view8[1];
view8[1] = tmp;

view16[0];						// 3340
```

Los constructores de typed array tienen múltiples variaciones de firma. Hemos mostrado hasta ahora solo pasarles un buffer existente. Sin embargo, esa forma también toma dos parámetros extra: `byteOffset` y `length`. En otras palabras, puedes iniciar la vista del typed array en una ubicación diferente a `0` y puedes hacer que abarque menos que la longitud completa del buffer.

Si el buffer de datos binarios incluye datos en tamaño/ubicación no uniforme, esta técnica puede ser bastante útil.

Por ejemplo, considera un buffer binario que tiene un número de 2 bytes (también llamado "word") al principio, seguido de dos números de 1 byte, seguido de un número de punto flotante de 32 bits. Así es como puedes acceder a esos datos con múltiples vistas en el mismo buffer, desplazamientos y longitudes:

```js
var first = new Uint16Array( buf, 0, 2 )[0],
	second = new Uint8Array( buf, 2, 1 )[0],
	third = new Uint8Array( buf, 3, 1 )[0],
	fourth = new Float32Array( buf, 4, 4 )[0];
```

### Constructores TypedArray

Además de la forma `(buffer,[offset, [length]])` examinada en la sección anterior, los constructores de typed array también soportan estas formas:

* [constructor]`(length)`: Crea una nueva vista sobre un nuevo buffer de `length` bytes
* [constructor]`(typedArr)`: Crea una nueva vista y buffer, y copia los contenidos de la vista `typedArr`
* [constructor]`(obj)`: Crea una nueva vista y buffer, e itera sobre el array-like u objeto `obj` para copiar sus contenidos

Los siguientes constructores de typed array están disponibles a partir de ES6:

* `Int8Array` (enteros de 8 bits con signo), `Uint8Array` (enteros de 8 bits sin signo)
	- `Uint8ClampedArray` (enteros de 8 bits sin signo, cada valor limitado al rango `0`-`255` al establecerlo)
* `Int16Array` (enteros de 16 bits con signo), `Uint16Array` (enteros de 16 bits sin signo)
* `Int32Array` (enteros de 32 bits con signo), `Uint32Array` (enteros de 32 bits sin signo)
* `Float32Array` (punto flotante de 32 bits, IEEE-754)
* `Float64Array` (punto flotante de 64 bits, IEEE-754)

Las instancias de constructores de typed array son casi iguales que los arrays nativos regulares. Algunas diferencias incluyen tener una longitud fija y los valores siendo todos del mismo "tipo".

Sin embargo, comparten la mayoría de los mismos métodos de `prototype`. Como tal, probablemente podrás usarlos como arrays regulares sin necesidad de convertirlos.

Por ejemplo:

```js
var a = new Int32Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

a.map( function(v){
	console.log( v );
} );
// 10 20 30

a.join( "-" );
// "10-20-30"
```

**Advertencia:** No puedes usar ciertos métodos de `Array.prototype` con TypedArrays que no tienen sentido, como los mutadores (`splice(..)`, `push(..)`, etc.) y `concat(..)`.

Ten en cuenta que los elementos en TypedArrays realmente están restringidos a los tamaños de bits declarados. Si tienes un `Uint8Array` e intentas asignar algo más grande que un valor de 8 bits en uno de sus elementos, el valor se envuelve para mantenerse dentro de la longitud de bits.

Esto podría causar problemas si estuvieras tratando de, por ejemplo, elevar al cuadrado todos los valores en un TypedArray. Considera:

```js
var a = new Uint8Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

var b = a.map( function(v){
	return v * v;
} );

b;				// [100, 144, 132]
```

Los valores `20` y `30`, cuando se elevan al cuadrado, resultaron en desbordamiento de bits. Para sortear tal limitación, puedes usar la función `TypedArray#from(..)`:

```js
var a = new Uint8Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

var b = Uint16Array.from( a, function(v){
	return v * v;
} );

b;				// [100, 400, 900]
```

Ver la sección "Función Estática `Array.from(..)`" en el Capítulo 6 para más información sobre el `Array.from(..)` que se comparte con TypedArrays. Específicamente, la sección "Mapeo" explica la función de mapeo aceptada como su segundo argumento.

Un comportamiento interesante a considerar es que los TypedArrays tienen un método `sort(..)` muy parecido a los arrays regulares, pero este por defecto usa comparaciones de ordenamiento numérico en vez de convertir valores a cadenas para comparación lexicográfica. Por ejemplo:

```js
var a = [ 10, 1, 2, ];
a.sort();								// [1,10,2]

var b = new Uint8Array( [ 10, 1, 2 ] );
b.sort();								// [1,2,10]
```

El `TypedArray#sort(..)` toma un argumento de función de comparación opcional igual que `Array#sort(..)`, que funciona exactamente de la misma manera.

## Maps

Si tienes mucha experiencia con JS, sabes que los objetos son el mecanismo principal para crear estructuras de datos de pares clave/valor sin orden, también conocidas como maps. Sin embargo, la principal desventaja con los objetos-como-maps es la incapacidad de usar un valor que no sea cadena como clave.

Por ejemplo, considera:

```js
var m = {};

var x = { id: 1 },
	y = { id: 2 };

m[x] = "foo";
m[y] = "bar";

m[x];							// "bar"
m[y];							// "bar"
```

¿Qué está pasando aquí? Los dos objetos `x` y `y` ambos se convierten a cadena como `"[object Object]"`, así que solo esa clave se está estableciendo en `m`.

Algunos han implementado maps falsos manteniendo un array paralelo de claves no-cadena junto a un array de valores, como:

```js
var keys = [], vals = [];

var x = { id: 1 },
	y = { id: 2 };

keys.push( x );
vals.push( "foo" );

keys.push( y );
vals.push( "bar" );

keys[0] === x;					// true
vals[0];						// "foo"

keys[1] === y;					// true
vals[1];						// "bar"
```

Por supuesto, no querrías manejar esos arrays paralelos tú mismo, así que podrías definir una estructura de datos con métodos que automáticamente hacen la gestión internamente. Además de tener que hacer ese trabajo tú mismo, la principal desventaja es que el acceso ya no es de complejidad temporal O(1), sino O(n).

¡Pero a partir de ES6, ya no hay necesidad de hacer esto! Simplemente usa `Map(..)`:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

m.get( x );						// "foo"
m.get( y );						// "bar"
```

La única desventaja es que no puedes usar la sintaxis de acceso con corchetes `[ ]` para establecer y recuperar valores. Pero `get(..)` y `set(..)` funcionan perfectamente adecuados en su lugar.

Para eliminar un elemento de un map, no uses el operador `delete`, sino el método `delete(..)`:

```js
m.set( x, "foo" );
m.set( y, "bar" );

m.delete( y );
```

Puedes limpiar todo el contenido del map con `clear()`. Para obtener la longitud de un map (es decir, el número de claves), usa la propiedad `size` (no `length`):

```js
m.set( x, "foo" );
m.set( y, "bar" );
m.size;							// 2

m.clear();
m.size;							// 0
```

El constructor `Map(..)` también puede recibir un iterable (ver "Iteradores" en el Capítulo 3), que debe producir una lista de arrays, donde el primer elemento en cada array es la clave y el segundo es el valor. Este formato de iteración es idéntico al producido por el método `entries()`, explicado en la siguiente sección. Eso hace fácil hacer una copia de un map:

```js
var m2 = new Map( m.entries() );

// lo mismo que:
var m2 = new Map( m );
```

Porque una instancia de map es un iterable, y su iterador por defecto es el mismo que `entries()`, la segunda forma más corta es más preferible.

Por supuesto, también puedes simplemente especificar manualmente una lista de *entries* (array de arrays clave/valor) en la forma del constructor `Map(..)`:

```js
var x = { id: 1 },
	y = { id: 2 };

var m = new Map( [
	[ x, "foo" ],
	[ y, "bar" ]
] );

m.get( x );						// "foo"
m.get( y );						// "bar"
```

### Valores de Map

Para obtener la lista de valores de un map, usa `values(..)`, que devuelve un iterador. En los Capítulos 2 y 3, cubrimos varias maneras de procesar un iterador secuencialmente (como un array), como el operador spread `...` y el bucle `for..of`. También, "Arrays" en el Capítulo 6 cubre el método `Array.from(..)` en detalle. Considera:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var vals = [ ...m.values() ];

vals;							// ["foo","bar"]
Array.from( m.values() );		// ["foo","bar"]
```

Como se discutió en la sección anterior, puedes iterar sobre las entradas de un map usando `entries()` (o el iterador por defecto del map). Considera:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var vals = [ ...m.entries() ];

vals[0][0] === x;				// true
vals[0][1];						// "foo"

vals[1][0] === y;				// true
vals[1][1];						// "bar"
```

### Claves de Map

Para obtener la lista de claves, usa `keys()`, que devuelve un iterador sobre las claves en el map:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var keys = [ ...m.keys() ];

keys[0] === x;					// true
keys[1] === y;					// true
```

Para determinar si un map tiene una clave dada, usa `has(..)`:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );

m.has( x );						// true
m.has( y );						// false
```

Los Maps esencialmente te permiten asociar alguna pieza extra de información (el valor) con un objeto (la clave) sin realmente poner esa información en el objeto mismo.

Aunque puedes usar cualquier tipo de valor como clave para un map, típicamente usarás objetos, ya que las cadenas y otros primitivos ya son elegibles como claves de objetos normales. En otras palabras, probablemente querrás continuar usando objetos normales para maps a menos que algunas o todas las claves necesiten ser objetos, en cuyo caso map es más apropiado.

**Advertencia:** Si usas un objeto como clave de map y ese objeto es luego descartado (todas las referencias eliminadas) en un intento de que la recolección de basura (GC) reclame su memoria, el map mismo todavía retendrá su entrada. Necesitarás remover la entrada del map para que sea elegible para GC. En la siguiente sección, veremos WeakMaps como una mejor opción para claves de objeto y GC.

## WeakMaps

Los WeakMaps son una variación de maps, que tiene la mayoría del mismo comportamiento externo pero difiere internamente en cómo funciona la asignación de memoria (específicamente su GC).

Los WeakMaps toman (solo) objetos como claves. Esos objetos se mantienen *débilmente*, lo que significa que si el objeto mismo es recolectado por GC, la entrada en el WeakMap también se remueve. Esto no es un comportamiento observable, sin embargo, ya que la única manera en que un objeto puede ser recolectado por GC es si no hay más referencias a él — una vez que no hay más referencias, no tienes referencia de objeto para verificar si existe en el WeakMap.

De lo contrario, la API para WeakMap es similar, aunque más limitada:

```js
var m = new WeakMap();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );

m.has( x );						// true
m.has( y );						// false
```

Los WeakMaps no tienen una propiedad `size` ni método `clear()`, ni exponen ningún iterador sobre sus claves, valores o entradas. Así que incluso si eliminas la referencia `x`, lo que removerá su entrada de `m` cuando ocurra GC, no hay manera de saberlo. ¡Solo tendrás que confiar en la palabra de JavaScript!

Igual que los Maps, los WeakMaps te permiten asociar suavemente información con un objeto. Pero son particularmente útiles si el objeto no es uno que controles completamente, como un elemento DOM. Si el objeto que estás usando como clave de map puede ser eliminado y debería ser elegible para GC cuando lo sea, entonces un WeakMap es una opción más apropiada.

Es importante notar que un WeakMap solo mantiene sus *claves* débilmente, no sus valores. Considera:

```js
var m = new WeakMap();

var x = { id: 1 },
	y = { id: 2 },
	z = { id: 3 },
	w = { id: 4 };

m.set( x, y );

x = null;						// { id: 1 } es elegible para GC
y = null;						// { id: 2 } es elegible para GC
								// solo porque { id: 1 } lo es

m.set( z, w );

w = null;						// { id: 4 } NO es elegible para GC
```

Por esta razón, los WeakMaps en mi opinión están mejor nombrados como "WeakKeyMaps."

## Sets

Un set es una colección de valores únicos (los duplicados se ignoran).

La API para un set es similar a la del map. El método `add(..)` toma el lugar del método `set(..)` (algo irónicamente), y no hay método `get(..)`.

Considera:

```js
var s = new Set();

var x = { id: 1 },
	y = { id: 2 };

s.add( x );
s.add( y );
s.add( x );

s.size;							// 2

s.delete( y );
s.size;							// 1

s.clear();
s.size;							// 0
```

La forma del constructor `Set(..)` es similar a `Map(..)`, en que puede recibir un iterable, como otro set o simplemente un array de valores. Sin embargo, a diferencia de cómo `Map(..)` espera una lista de *entries* (array de arrays clave/valor), `Set(..)` espera una lista de *valores* (array de valores):

```js
var x = { id: 1 },
	y = { id: 2 };

var s = new Set( [x,y] );
```

Un set no necesita un `get(..)` porque no recuperas un valor de un set, sino que pruebas si está presente o no, usando `has(..)`:

```js
var s = new Set();

var x = { id: 1 },
	y = { id: 2 };

s.add( x );

s.has( x );						// true
s.has( y );						// false
```

**Nota:** El algoritmo de comparación en `has(..)` es casi idéntico a `Object.is(..)` (ver Capítulo 6), excepto que `-0` y `0` se tratan como iguales en vez de distintos.

### Iteradores de Set

Los Sets tienen los mismos métodos de iterador que los maps. Su comportamiento es diferente para sets, pero simétrico con el comportamiento de los iteradores de map. Considera:

```js
var s = new Set();

var x = { id: 1 },
	y = { id: 2 };

s.add( x ).add( y );

var keys = [ ...s.keys() ],
	vals = [ ...s.values() ],
	entries = [ ...s.entries() ];

keys[0] === x;
keys[1] === y;

vals[0] === x;
vals[1] === y;

entries[0][0] === x;
entries[0][1] === x;
entries[1][0] === y;
entries[1][1] === y;
```

Los iteradores `keys()` y `values()` ambos producen una lista de los valores únicos en el set. El iterador `entries()` produce una lista de arrays de entrada, donde ambos elementos del array son el valor único del set. El iterador por defecto para un set es su iterador `values()`.

La unicidad inherente de un set es su rasgo más útil. Por ejemplo:

```js
var s = new Set( [1,2,3,4,"1",2,4,"5"] ),
	uniques = [ ...s ];

uniques;						// [1,2,3,4,"1","5"]
```

La unicidad del Set no permite coerción, por lo que `1` y `"1"` se consideran valores distintos.

## WeakSets

Mientras que un WeakMap mantiene sus claves débilmente (pero sus valores fuertemente), un WeakSet mantiene sus valores débilmente (realmente no hay claves).

```js
var s = new WeakSet();

var x = { id: 1 },
	y = { id: 2 };

s.add( x );
s.add( y );

x = null;						// `x` es elegible para GC
y = null;						// `y` es elegible para GC
```

**Advertencia:** Los valores de WeakSet deben ser objetos, no valores primitivos como está permitido con sets.

## Revisión

ES6 define un número de colecciones útiles que hacen que trabajar con datos de maneras estructuradas sea más eficiente y efectivo.

Los TypedArrays proporcionan "vistas" de buffers de datos binarios que se alinean con varios tipos de enteros, como enteros sin signo de 8 bits y flotantes de 32 bits. El acceso por array a datos binarios hace que las operaciones sean mucho más fáciles de expresar y mantener, lo que te permite trabajar más fácilmente con datos complejos como video, audio, datos de canvas, y demás.

Los Maps son pares clave-valor donde la clave puede ser un objeto en vez de solo una cadena/primitivo. Los Sets son listas únicas de valores (de cualquier tipo).

Los WeakMaps son maps donde la clave (objeto) se mantiene débilmente, así que GC es libre de recolectar la entrada si es la última referencia a un objeto. Los WeakSets son sets donde el valor se mantiene débilmente, de nuevo para que GC pueda remover la entrada si es la última referencia a ese objeto.
