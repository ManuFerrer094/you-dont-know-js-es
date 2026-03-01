# You Don't Know JS: *this* & Prototipos de Objetos
# Capítulo 4: Mezclando Objetos "Clase"

Siguiendo nuestra exploración de objetos del capítulo anterior, es natural que ahora dirijamos nuestra atención a la "programación orientada a objetos (OO)", con "clases". Primero veremos la "orientación a clases" como un patrón de diseño, antes de examinar las mecánicas de las "clases": "instanciación", "herencia" y "polimorfismo (relativo)".

Veremos que estos conceptos realmente no mapean muy naturalmente al mecanismo de objetos en JS, y las longitudes (mixins, etc.) a las que muchos desarrolladores JavaScript llegan para superar tales desafíos.

**Nota:** Este capítulo dedica bastante tiempo (¡la primera mitad!) a la teoría pesada de "programación orientada a objetos". Eventualmente relacionamos estas ideas con código JavaScript real y concreto en la segunda mitad, cuando hablamos de "Mixins". Pero hay mucho concepto y pseudo-código por el que navegar primero, así que no te pierdas -- ¡solo sigue adelante!

## Teoría de Clases

"Clase/Herencia" describe una cierta forma de organización y arquitectura de código -- una forma de modelar dominios de problemas del mundo real en nuestro software.

La programación OO u orientada a clases enfatiza que los datos intrínsecamente tienen comportamiento asociado (¡por supuesto, diferente dependiendo del tipo y naturaleza de los datos!) que opera sobre ellos, así que el diseño apropiado es empaquetar (también conocido como encapsular) los datos y el comportamiento juntos. Esto a veces se llama "estructuras de datos" en ciencia de la computación formal.

Por ejemplo, una serie de caracteres que representa una palabra o frase usualmente se llama un "string". Los caracteres son los datos. Pero casi nunca solo te importan los datos, usualmente quieres *hacer cosas* con los datos, así que los comportamientos que pueden aplicarse *a* esos datos (calcular su longitud, agregar datos, buscar, etc.) están todos diseñados como métodos de una clase `String`.

Cualquier string dado es solo una instancia de esta clase, lo que significa que es un empaquetamiento ordenado tanto de los datos de caracteres como de la funcionalidad que podemos realizar sobre ellos.

Las clases también implican una forma de *clasificar* una cierta estructura de datos. La forma en que hacemos esto es pensar en cualquier estructura dada como una variación específica de una definición base más general.

Exploremos este proceso de clasificación viendo un ejemplo comúnmente citado. Un *carro* puede describirse como una implementación específica de una "clase" más general de cosa, llamada un *vehículo*.

Modelamos esta relación en software con clases definiendo una clase `Vehicle` y una clase `Car`.

La definición de `Vehicle` podría incluir cosas como propulsión (motores, etc.), la capacidad de transportar personas, etc., que serían todos los comportamientos. Lo que definimos en `Vehicle` es todo lo que es común a todos (o la mayoría de) los diferentes tipos de vehículos (los "aviones, trenes y automóviles").

Podría no tener sentido en nuestro software redefinir la esencia básica de "capacidad de transportar personas" una y otra vez para cada tipo diferente de vehículo. En su lugar, definimos esa capacidad una vez en `Vehicle`, y luego cuando definimos `Car`, simplemente indicamos que "hereda" (o "extiende") la definición base de `Vehicle`. Se dice que la definición de `Car` especializa la definición general de `Vehicle`.

Mientras que `Vehicle` y `Car` colectivamente definen el comportamiento mediante métodos, los datos en una instancia serían cosas como el VIN único de un carro específico, etc.

**Y así, las clases, la herencia y la instanciación emergen.**

Otro concepto clave con las clases es el "polimorfismo", que describe la idea de que un comportamiento general de una clase padre puede ser anulado en una clase hija para darle más especificidad. De hecho, el polimorfismo relativo nos permite referenciar el comportamiento base desde el comportamiento anulado.

La teoría de clases sugiere fuertemente que una clase padre y una clase hija comparten el mismo nombre de método para un cierto comportamiento, de modo que la hija anula a la padre (diferencialmente). Como veremos después, hacer esto en tu código JavaScript es optar por frustración y fragilidad del código.

### Patrón de Diseño "Clase"

Quizás nunca hayas pensado en las clases como un "patrón de diseño", ya que es más común ver discusión de "Patrones de Diseño OO" populares, como "Iterator", "Observer", "Factory", "Singleton", etc. Presentado de esta manera, es casi una suposición que las clases OO son las mecánicas de nivel inferior mediante las cuales implementamos todos los patrones de diseño (de nivel superior), como si OO fuera una base dada para *todo* el código (apropiado).

Dependiendo de tu nivel de educación formal en programación, podrías haber escuchado sobre "programación procedural" como una forma de describir código que solo consiste en procedimientos (también conocidos como funciones) llamando a otras funciones, sin abstracciones superiores. Podrías haber aprendido que las clases eran la forma *apropiada* de transformar "código espagueti" estilo procedural en código bien formado y bien organizado.

Por supuesto, si tienes experiencia con "programación funcional" (Monads, etc.), sabes muy bien que las clases son solo uno de varios patrones de diseño comunes. Pero para otros, esta puede ser la primera vez que te preguntas si las clases realmente son una base fundamental para el código, o si son una abstracción opcional sobre el código.

Algunos lenguajes (como Java) no te dan la opción, así que no es muy *opcional* en absoluto -- todo es una clase. Otros lenguajes como C/C++ o PHP te dan tanto sintaxis procedural como orientada a clases, y se deja más a la elección del desarrollador qué estilo o mezcla de estilos es apropiado.

### "Clases" de JavaScript

¿Dónde cae JavaScript en este sentido? JS ha tenido *algunos* elementos sintácticos similares a clases (como `new` e `instanceof`) por bastante tiempo, y más recientemente en ES6, algunas adiciones, como la palabra clave `class` (ver Apéndice A).

¿Pero eso significa que JavaScript realmente *tiene* clases? Simple y llanamente: **No.**

Como las clases son un patrón de diseño, *puedes*, con bastante esfuerzo (como veremos a lo largo del resto de este capítulo), implementar aproximaciones para gran parte de la funcionalidad clásica de clases. JS intenta satisfacer el *deseo* extremadamente extendido de diseñar con clases proporcionando sintaxis aparentemente similar a clases.

Aunque podamos tener una sintaxis que se ve como clases, es como si las mecánicas de JavaScript estuvieran luchando contra ti usando el *patrón de diseño de clases*, porque detrás del telón, los mecanismos sobre los que construyes están operando de forma bastante diferente. El azúcar sintáctico y las bibliotecas de "Clases" JS (extremadamente usadas) van muy lejos en ocultar esta realidad de ti, pero tarde o temprano enfrentarás el hecho de que las *clases* que tienes en otros lenguajes no son como las "clases" que estás simulando en JS.

A lo que esto se reduce es que las clases son un patrón opcional en el diseño de software, y tienes la opción de usarlas en JavaScript o no. Como muchos desarrolladores tienen una fuerte afinidad al diseño de software orientado a clases, pasaremos el resto de este capítulo explorando qué se necesita para mantener la ilusión de clases con lo que JS proporciona, y los puntos de dolor que experimentamos.

## Mecánicas de Clases

En muchos lenguajes orientados a clases, la "biblioteca estándar" proporciona una estructura de datos "stack" (push, pop, etc.) como una clase `Stack`. Esta clase tendría un conjunto interno de variables que almacena los datos, y tendría un conjunto de comportamientos ("métodos") accesibles públicamente proporcionados por la clase, que da a tu código la capacidad de interactuar con los datos (ocultos) (agregar y eliminar datos, etc.).

Pero en tales lenguajes, realmente no operas directamente en `Stack` (a menos que hagas una referencia a miembro de clase **Static**, que está fuera del alcance de nuestra discusión). La clase `Stack` es meramente una explicación abstracta de lo que *cualquier* "stack" debería hacer, pero no es en sí mismo *un* "stack". Debes **instanciar** la clase `Stack` antes de tener una *cosa* de estructura de datos concreta contra la cual operar.

### Construcción

La metáfora tradicional para el pensamiento basado en "clase" e "instancia" viene de la construcción de edificios.

Un arquitecto planifica todas las características de un edificio: qué tan ancho, qué tan alto, cuántas ventanas y en qué ubicaciones, incluso qué tipo de material usar para las paredes y el techo. Ella no necesariamente se preocupa, en este punto, *dónde* se construirá el edificio, ni le importa *cuántas* copias de ese edificio se construirán.

Tampoco se preocupa mucho por los contenidos del edificio -- los muebles, el papel tapiz, los ventiladores de techo, etc. -- solo qué tipo de estructura los contendrá.

Los planos arquitectónicos que produce son solo *planes* para un edificio. No constituyen realmente un edificio al que podamos entrar y sentarnos. Necesitamos un constructor para esa tarea. Un constructor tomará esos planos y los seguirá, exactamente, mientras *construye* el edificio. En un sentido muy real, está *copiando* las características previstas de los planos al edificio físico.

Una vez completo, el edificio es una instanciación física de los planos, con suerte una *copia* esencialmente perfecta. Y luego el constructor puede moverse al lote vacío de al lado y hacerlo todo de nuevo, creando otra *copia* más.

La relación entre edificio y plano es indirecta. Puedes examinar un plano para entender cómo se estructuró el edificio, para cualquier parte donde la inspección directa del edificio mismo fuera insuficiente. Pero si quieres abrir una puerta, tienes que ir al edificio mismo -- el plano meramente tiene líneas dibujadas en una página que *representan* dónde debería estar la puerta.

Una clase es un plano. Para realmente *obtener* un objeto con el que podamos interactuar, debemos construir (o sea, "instanciar") algo de la clase. El resultado final de tal "construcción" es un objeto, típicamente llamado una "instancia", en el cual podemos llamar métodos directamente y acceder a cualquier propiedad de datos pública, según sea necesario.

**Este objeto es una *copia*** de todas las características descritas por la clase.

Probablemente no esperarías entrar a un edificio y encontrar, enmarcada y colgada en la pared, una copia de los planos usados para planificar el edificio, aunque los planos probablemente estén archivados en una oficina de registros públicos. Similarmente, generalmente no usas una instancia de objeto para acceder directamente y manipular su clase, pero usualmente es posible al menos determinar *de qué clase* proviene una instancia de objeto.

Es más útil considerar la relación directa de una clase con una instancia de objeto, que cualquier relación indirecta entre una instancia de objeto y la clase de la que provino. **Una clase se instancia en forma de objeto mediante una operación de copia.**

<img src="fig1.png">

Como puedes ver, las flechas se mueven de izquierda a derecha, y de arriba a abajo, lo que indica las operaciones de copia que ocurren, tanto conceptual como físicamente.

### Constructor

Las instancias de clases son construidas por un método especial de la clase, usualmente del mismo nombre que la clase, llamado un *constructor*. El trabajo explícito de este método es inicializar cualquier información (estado) que la instancia necesitará.

Por ejemplo, considera este pseudo-código suelto (sintaxis inventada) para clases:

```js
class CoolGuy {
	specialTrick = nothing

	CoolGuy( trick ) {
		specialTrick = trick
	}

	showOff() {
		output( "Here's my trick: ", specialTrick )
	}
}
```

Para *hacer* una instancia de `CoolGuy`, llamaríamos al constructor de la clase:

```js
Joe = new CoolGuy( "jumping rope" )

Joe.showOff() // Here's my trick: jumping rope
```

Nota que la clase `CoolGuy` tiene un constructor `CoolGuy()`, que es realmente lo que llamamos cuando decimos `new CoolGuy(..)`. Obtenemos un objeto de vuelta (una instancia de nuestra clase) del constructor, y podemos llamar al método `showOff()`, que imprime el truco especial de ese `CoolGuy` particular.

*Obviamente, saltar la cuerda hace de Joe un tipo bastante genial.*

El constructor de una clase *pertenece* a la clase, casi universalmente con el mismo nombre que la clase. También, los constructores prácticamente siempre necesitan ser llamados con `new` para que el motor del lenguaje sepa que quieres construir una *nueva* instancia de clase.

## Herencia de Clases

En lenguajes orientados a clases, no solo puedes definir una clase que puede ser instanciada ella misma, sino que puedes definir otra clase que **hereda** de la primera clase.

A la segunda clase a menudo se le dice ser una "clase hija" mientras que la primera es la "clase padre". Estos términos obviamente vienen de la metáfora de padres e hijos, aunque las metáforas aquí están un poco estiradas, como verás en breve.

Cuando un padre tiene un hijo biológico, las características genéticas del padre se copian en el hijo. Obviamente, en la mayoría de los sistemas de reproducción biológica, hay dos padres que contribuyen genes por igual a la mezcla. Pero para los propósitos de la metáfora, asumiremos solo un padre.

Una vez que el hijo existe, él o ella está separado del padre. El hijo fue fuertemente influenciado por la herencia de su padre, pero es único y distinto. Si un hijo termina con pelo rojo, eso no significa que el pelo del padre *era* o automáticamente *se vuelve* rojo.

De manera similar, una vez que una clase hija es definida, está separada y es distinta de la clase padre. La clase hija contiene una copia inicial del comportamiento del padre, pero puede entonces anular cualquier comportamiento heredado e incluso definir nuevo comportamiento.

Es importante recordar que estamos hablando de **clases** padre e hija, que no son cosas físicas. Aquí es donde la metáfora de padre e hijo se pone un poco confusa, porque realmente deberíamos decir que una clase padre es como el ADN de un padre y una clase hija es como el ADN de un hijo. Tenemos que hacer (o sea "instanciar") una persona de cada conjunto de ADN para realmente tener una persona física con la cual conversar.

Dejemos de lado padres e hijos biológicos, y veamos la herencia a través de un lente ligeramente diferente: diferentes tipos de vehículos. Esa es una de las metáforas más canónicas (y a menudo cansinas) para entender la herencia.

Revisitemos la discusión de `Vehicle` y `Car` de antes en este capítulo. Considera este pseudo-código suelto (sintaxis inventada) para clases heredadas:

```js
class Vehicle {
	engines = 1

	ignition() {
		output( "Turning on my engine." )
	}

	drive() {
		ignition()
		output( "Steering and moving forward!" )
	}
}

class Car inherits Vehicle {
	wheels = 4

	drive() {
		inherited:drive()
		output( "Rolling on all ", wheels, " wheels!" )
	}
}

class SpeedBoat inherits Vehicle {
	engines = 2

	ignition() {
		output( "Turning on my ", engines, " engines." )
	}

	pilot() {
		inherited:drive()
		output( "Speeding through the water with ease!" )
	}
}
```

**Nota:** Para claridad y brevedad, los constructores para estas clases han sido omitidos.

Definimos la clase `Vehicle` asumiendo un motor, una forma de encender la ignición, y una forma de conducir. Pero nunca fabricarías un "vehículo" genérico, así que realmente es solo un concepto abstracto en este punto.

Entonces definimos dos tipos específicos de vehículo: `Car` y `SpeedBoat`. Cada uno hereda las características generales de `Vehicle`, pero luego especializan las características apropiadamente para cada tipo. Un carro necesita 4 ruedas, y un bote rápido necesita 2 motores, lo que significa que necesita atención extra para encender la ignición de ambos motores.

### Polimorfismo

`Car` define su propio método `drive()`, que anula el método del mismo nombre que heredó de `Vehicle`. Pero entonces, el método `drive()` de `Car` llama a `inherited:drive()`, lo que indica que `Car` puede referenciar el `drive()` original pre-anulado que heredó. El método `pilot()` de `SpeedBoat` también hace una referencia a su copia heredada de `drive()`.

Esta técnica se llama "polimorfismo", o "polimorfismo virtual". Más específicamente para nuestro punto actual, lo llamaremos "polimorfismo relativo".

El polimorfismo es un tema mucho más amplio de lo que agotaremos aquí, pero nuestra semántica "relativa" actual se refiere a un aspecto particular: la idea de que cualquier método puede referenciar otro método (del mismo o diferente nombre) en un nivel superior de la jerarquía de herencia. Decimos "relativo" porque no definimos absolutamente qué nivel de herencia (o sea, clase) queremos acceder, sino que lo referenciamos relativamente diciendo esencialmente "mira un nivel arriba".

En muchos lenguajes, la palabra clave `super` se usa, en lugar del `inherited:` de este ejemplo, lo cual se apoya en la idea de que una "super clase" es el padre/ancestro de la clase actual.

Otro aspecto del polimorfismo es que un nombre de método puede tener múltiples definiciones en diferentes niveles de la cadena de herencia, y estas definiciones se seleccionan automáticamente como apropiadas al resolver qué métodos se están llamando.

Vemos dos ocurrencias de ese comportamiento en nuestro ejemplo anterior: `drive()` está definido tanto en `Vehicle` como en `Car`, e `ignition()` está definido tanto en `Vehicle` como en `SpeedBoat`.

**Nota:** Otra cosa que los lenguajes tradicionales orientados a clases te dan vía `super` es una forma directa para que el constructor de una clase hija referencie el constructor de su clase padre. Esto es mayormente cierto porque con clases reales, el constructor pertenece a la clase. Sin embargo, en JS, es al revés -- es realmente más apropiado pensar que la "clase" pertenece al constructor (las referencias tipo `Foo.prototype...`). Como en JS la relación entre hijo y padre existe solo entre los dos objetos `.prototype` de los respectivos constructores, los constructores mismos no están directamente relacionados, y por lo tanto no hay forma simple de referenciar relativamente uno desde el otro (ver Apéndice A para `class` de ES6 que "resuelve" esto con `super`).

Una implicación interesante del polimorfismo puede verse específicamente con `ignition()`. Dentro de `pilot()`, una referencia polimórfica-relativa se hace a la versión de `drive()` de `Vehicle` (la heredada). Pero ese `drive()` referencia un método `ignition()` solo por nombre (sin referencia relativa).

¿Qué versión de `ignition()` usará el motor del lenguaje, la de `Vehicle` o la de `SpeedBoat`? **Usa la versión de `SpeedBoat` de `ignition()`.** Si *fueras* a instanciar la clase `Vehicle` misma, y luego llamar su `drive()`, el motor del lenguaje en su lugar usaría la definición del método `ignition()` de `Vehicle`.

Dicho de otra forma, la definición del método `ignition()` *polimorfea* (cambia) dependiendo de qué clase (nivel de herencia) estás referenciando una instancia.

Esto puede parecer detalle académico excesivamente profundo. Pero entender estos detalles es necesario para contrastar apropiadamente comportamientos similares (pero distintos) en el mecanismo `[[Prototype]]` de JavaScript.

Cuando las clases son heredadas, hay una forma **para las clases mismas** (¡no las instancias de objetos creadas a partir de ellas!) de *relativamente* referenciar la clase de la cual heredaron, y esta referencia relativa usualmente se llama `super`.

Recuerda esta figura de antes:

<img src="fig1.png">

Nota cómo tanto para instanciación (`a1`, `a2`, `b1`, y `b2`) *como* herencia (`Bar`), las flechas indican una operación de copia.

Conceptualmente, parecería que una clase hija `Bar` puede acceder al comportamiento en su clase padre `Foo` usando una referencia polimórfica relativa (o sea, `super`). Sin embargo, en realidad, solo se le da una copia del comportamiento heredado de su clase padre a la clase hija. Si la hija "anula" un método que hereda, tanto la versión original como la anulada del método son realmente mantenidas, de modo que ambas son accesibles.

No dejes que el polimorfismo te confunda pensando que una clase hija está vinculada a su clase padre. Una clase hija en su lugar obtiene una copia de lo que necesita de la clase padre. **La herencia de clases implica copias.**

### Herencia Múltiple

Recuerda nuestra discusión anterior de padre(s) e hijos y ADN? Dijimos que la metáfora era un poco rara porque biológicamente la mayoría de los descendientes vienen de dos padres. Si una clase pudiera heredar de otras dos clases, se ajustaría más a la metáfora padre/hijo.

Algunos lenguajes orientados a clases te permiten especificar más de una clase "padre" de la cual "heredar". Herencia múltiple significa que cada definición de clase padre se copia en la clase hija.

En la superficie, esto parece una adición poderosa a la orientación a clases, dándonos la capacidad de componer más funcionalidad junta. Sin embargo, ciertamente surgen algunas preguntas complicadas. Si ambas clases padre proporcionan un método llamado `drive()`, ¿a qué versión resolvería una referencia `drive()` en la hija? ¿Siempre tendrías que especificar manualmente qué `drive()` del padre querías decir, perdiendo así algo de la gracia de la herencia polimórfica?

Hay otra variación, el llamado "Problema del Diamante", que se refiere al escenario donde una clase hija "D" hereda de dos clases padre ("B" y "C"), y cada una de esas a su vez hereda de un padre "A" común. Si "A" proporciona un método `drive()`, y tanto "B" como "C" anulan (polimorfean) ese método, cuando `D` referencia `drive()`, ¿qué versión debería usar (`B:drive()` o `C:drive()`)?

<img src="fig2.png">

Estas complicaciones van mucho más profundo que este vistazo rápido. Las abordamos aquí solo para poder contrastar con cómo funcionan los mecanismos de JavaScript.

JavaScript es más simple: no proporciona un mecanismo nativo para "herencia múltiple". Muchos ven esto como algo bueno, porque los ahorros en complejidad más que compensan la funcionalidad "reducida". Pero esto no evita que los desarrolladores intenten simularla de varias formas, como veremos a continuación.

## Mixins

El mecanismo de objetos de JavaScript no realiza *automáticamente* comportamiento de copia cuando "heredas" o "instancias". Llanamente, no hay "clases" en JavaScript para instanciar, solo objetos. Y los objetos no se copian a otros objetos, se *vinculan entre sí* (más sobre eso en el Capítulo 5).

Ya que los comportamientos de clase observados en otros lenguajes implican copias, examinemos cómo los desarrolladores JS **simulan** el comportamiento de copia *faltante* de las clases en JavaScript: mixins. Veremos dos tipos de "mixin": **explícito** e **implícito**.

### Mixins Explícitos

Revisitemos de nuevo nuestro ejemplo de `Vehicle` y `Car` de antes. Como JavaScript no copiará automáticamente el comportamiento de `Vehicle` a `Car`, podemos en su lugar crear una utilidad que copie manualmente. Tal utilidad a menudo se llama `extend(..)` por muchas bibliotecas/frameworks, pero aquí la llamaremos `mixin(..)` para propósitos ilustrativos.

```js
// ejemplo enormemente simplificado de `mixin(..)`:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// solo copiar si no está ya presente
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}

var Vehicle = {
	engines: 1,

	ignition: function() {
		console.log( "Turning on my engine." );
	},

	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};

var Car = mixin( Vehicle, {
	wheels: 4,

	drive: function() {
		Vehicle.drive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	}
} );
```

**Nota:** Sutil pero importantemente, ya no estamos lidiando con clases, porque no hay clases en JavaScript. `Vehicle` y `Car` son solo objetos de los cuales hacemos copias hacia y desde, respectivamente.

`Car` ahora tiene una copia de las propiedades y funciones de `Vehicle`. Técnicamente, las funciones no se duplican realmente, sino que se copian *referencias* a las funciones. Así que, `Car` ahora tiene una propiedad llamada `ignition`, que es una referencia copiada a la función `ignition()`, así como una propiedad llamada `engines` con el valor copiado de `1` de `Vehicle`.

`Car` *ya* tenía una propiedad `drive` (función), así que esa referencia de propiedad no fue anulada (ver la sentencia `if` en `mixin(..)` arriba).

#### "Polimorfismo" Revisitado

Examinemos esta sentencia: `Vehicle.drive.call( this )`. Esto es lo que llamo "pseudo-polimorfismo explícito". Recuerda que en nuestro pseudo-código anterior esta línea era `inherited:drive()`, que llamamos "polimorfismo relativo".

JavaScript no tiene (antes de ES6; ver Apéndice A) una facilidad para polimorfismo relativo. Así que, **porque tanto `Car` como `Vehicle` tenían una función del mismo nombre: `drive()`**, para distinguir una llamada de una u otra, debemos hacer una referencia absoluta (no relativa). Especificamos explícitamente el objeto `Vehicle` por nombre, y llamamos la función `drive()` en él.

Pero si dijéramos `Vehicle.drive()`, el enlace de `this` para esa llamada de función sería el objeto `Vehicle` en lugar del objeto `Car` (ver Capítulo 2), que no es lo que queremos. Así que, en su lugar usamos `.call( this )` (Capítulo 2) para asegurar que `drive()` se ejecute en el contexto del objeto `Car`.

**Nota:** Si el identificador del nombre de función para `Car.drive()` no hubiera solapado con (o sea, "ensombrecido"; ver Capítulo 5) `Vehicle.drive()`, no habríamos estado ejercitando "polimorfismo de método". Así que, una referencia a `Vehicle.drive()` habría sido copiada por la llamada `mixin(..)`, y podríamos haber accedido directamente con `this.drive()`. El solapamiento de identificadores elegido (**ensombrecimiento**) es la *razón* por la que tenemos que usar el enfoque más complejo de *pseudo-polimorfismo explícito*.

En lenguajes orientados a clases, que tienen polimorfismo relativo, el vínculo entre `Car` y `Vehicle` se establece una vez, al inicio de la definición de la clase, lo que hace que haya solo un lugar para mantener tales relaciones.

Pero por las peculiaridades de JavaScript, el pseudo-polimorfismo explícito (¡por el ensombrecimiento!) crea un vínculo manual/explícito frágil **en cada función donde necesites tal referencia (pseudo-)polimórfica**. Esto puede incrementar significativamente el costo de mantenimiento. Además, mientras que el pseudo-polimorfismo explícito puede emular el comportamiento de "herencia múltiple", solo incrementa la complejidad y fragilidad.

El resultado de tales enfoques es usualmente código más complejo, más difícil de leer, *y* más difícil de mantener. **El pseudo-polimorfismo explícito debería evitarse donde sea posible**, porque el costo supera el beneficio en la mayoría de los aspectos.

#### Mezclando Copias

Recuerda la utilidad `mixin(..)` de arriba:

```js
// ejemplo enormemente simplificado de `mixin()`:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// solo copiar si no está ya presente
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}
```

Ahora, examinemos cómo funciona `mixin(..)`. Itera sobre las propiedades de `sourceObj` (`Vehicle` en nuestro ejemplo) y si no hay una propiedad coincidente de ese nombre en `targetObj` (`Car` en nuestro ejemplo), hace una copia. Como estamos haciendo la copia después de que el objeto inicial existe, tenemos cuidado de no sobrescribir una propiedad del destino.

Si hiciéramos las copias primero, antes de especificar los contenidos específicos de `Car`, podríamos omitir esta verificación contra `targetObj`, pero eso es un poco más torpe y menos eficiente, así que generalmente es menos preferido:

```js
// mixin alternativo, menos "seguro" para sobrescrituras
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		targetObj[key] = sourceObj[key];
	}

	return targetObj;
}

var Vehicle = {
	// ...
};

// primero, crear un objeto vacío con
// las cosas de Vehicle copiadas
var Car = mixin( Vehicle, { } );

// ahora copiar los contenidos previstos en Car
mixin( {
	wheels: 4,

	drive: function() {
		// ...
	}
}, Car );
```

Con cualquier enfoque, hemos copiado explícitamente los contenidos no superpuestos de `Vehicle` en `Car`. El nombre "mixin" viene de una forma alternativa de explicar la tarea: `Car` tiene los contenidos de `Vehicle` **mezclados**, justo como mezclas chispas de chocolate en tu masa de galletas favorita.

Como resultado de la operación de copia, `Car` operará algo separadamente de `Vehicle`. Si agregas una propiedad a `Car`, no afectará a `Vehicle`, y viceversa.

**Nota:** Algunos detalles menores se han omitido aquí. Todavía hay algunas formas sutiles en que los dos objetos pueden "afectarse" mutuamente incluso después de copiar, como si ambos comparten una referencia a un objeto común (como un array).

Como los dos objetos también comparten referencias a sus funciones comunes, eso significa que **incluso la copia manual de funciones (o sea, mixins) de un objeto a otro no *realmente emula* la duplicación real de clase a instancia que ocurre en lenguajes orientados a clases**.

Las funciones JavaScript no pueden realmente ser duplicadas (de una forma estándar y confiable), así que lo que terminas obteniendo es una **referencia duplicada** al mismo objeto función compartido (las funciones son objetos; ver Capítulo 3). Si modificaras uno de los **objetos función** compartidos (como `ignition()`) agregando propiedades encima de él, por ejemplo, tanto `Vehicle` como `Car` serían "afectados" vía la referencia compartida.

Los mixins explícitos son un mecanismo válido en JavaScript. Pero aparentan ser más poderosos de lo que realmente son. No mucho beneficio se *deriva realmente* de copiar una propiedad de un objeto a otro, **en comparación con simplemente definir las propiedades dos veces**, una vez en cada objeto. Y eso es especialmente cierto dado el matiz de referencia de objeto-función que acabamos de mencionar.

Si explícitamente mezclas dos o más objetos en tu objeto destino, puedes **emular parcialmente** el comportamiento de "herencia múltiple", pero no hay forma directa de manejar colisiones si el mismo método o propiedad se está copiando de más de una fuente. Algunos desarrolladores/bibliotecas han ideado técnicas de "enlace tardío" y otras soluciones alternativas exóticas, pero fundamentalmente estos "trucos" son *usualmente* más esfuerzo (¡y menor rendimiento!) de lo que vale la pena.

Ten cuidado de usar mixins explícitos solo donde realmente ayuden a hacer código más legible, y evita el patrón si encuentras que hace código más difícil de rastrear, o si encuentras que crea dependencias innecesarias o difíciles de manejar entre objetos.

**Si empieza a ser *más difícil* usar mixins apropiadamente que antes de usarlos**, probablemente deberías dejar de usar mixins. De hecho, si tienes que usar una biblioteca/utilidad compleja para resolver todos estos detalles, podría ser una señal de que lo estás haciendo de la forma más difícil, quizás innecesariamente. En el Capítulo 6, intentaremos destilar una forma más simple que logre los resultados deseados sin toda la complicación.

#### Herencia Parasítica

Una variación de este patrón de mixin explícito, que es tanto en algunas formas explícita como en otras implícita, se llama "herencia parasítica", popularizada principalmente por Douglas Crockford.

Así es como puede funcionar:

```js
// "Clase JS Tradicional" `Vehicle`
function Vehicle() {
	this.engines = 1;
}
Vehicle.prototype.ignition = function() {
	console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
	this.ignition();
	console.log( "Steering and moving forward!" );
};

// "Clase Parasítica" `Car`
function Car() {
	// primero, `car` es un `Vehicle`
	var car = new Vehicle();

	// ahora, modifiquemos nuestro `car` para especializarlo
	car.wheels = 4;

	// guardar una referencia privilegiada a `Vehicle::drive()`
	var vehDrive = car.drive;

	// anular `Vehicle::drive()`
	car.drive = function() {
		vehDrive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	};

	return car;
}

var myCar = new Car();

myCar.drive();
// Turning on my engine.
// Steering and moving forward!
// Rolling on all 4 wheels!
```

Como puedes ver, inicialmente hacemos una copia de la definición de la "clase padre" `Vehicle` (objeto), luego mezclamos nuestra definición de "clase hija" (objeto) (preservando referencias privilegiadas a la clase padre según sea necesario), y pasamos este objeto compuesto `car` como nuestra instancia hija.

**Nota:** cuando llamamos `new Car()`, un nuevo objeto es creado y referenciado por la referencia `this` de `Car` (ver Capítulo 2). Pero como no usamos ese objeto, y en su lugar retornamos nuestro propio objeto `car`, el objeto inicialmente creado simplemente se descarta. Así que, `Car()` podría llamarse sin la palabra clave `new`, y la funcionalidad anterior sería idéntica, pero sin la creación/recolección de basura del objeto desperdiciado.

### Mixins Implícitos

Los mixins implícitos están estrechamente relacionados con el *pseudo-polimorfismo explícito* como se explicó anteriormente. Como tal, vienen con las mismas advertencias y precauciones.

Considera este código:

```js
var Something = {
	cool: function() {
		this.greeting = "Hello World";
		this.count = this.count ? this.count + 1 : 1;
	}
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
	cool: function() {
		// mixin implícito de `Something` a `Another`
		Something.cool.call( this );
	}
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (estado no compartido con `Something`)
```

Con `Something.cool.call( this )`, que puede ocurrir ya sea en una llamada de "constructor" (más común) o en una llamada de método (mostrado aquí), esencialmente "tomamos prestada" la función `Something.cool()` y la llamamos en el contexto de `Another` (vía su enlace de `this`; ver Capítulo 2) en lugar de `Something`. El resultado final es que las asignaciones que `Something.cool()` hace se aplican contra el objeto `Another` en lugar del objeto `Something`.

Así que, se dice que "mezclamos" el comportamiento de `Something` con (o en) `Another`.

Aunque este tipo de técnica parece aprovechar útilmente la funcionalidad de re-enlace de `this`, es la frágil llamada `Something.cool.call( this )`, que no puede hacerse una referencia relativa (y por lo tanto más flexible), a la que deberías **prestar atención con precaución**. Generalmente, **evita tales construcciones donde sea posible** para mantener código más limpio y más mantenible.

## Revisión (TL;DR)

Las clases son un patrón de diseño. Muchos lenguajes proporcionan sintaxis que permite diseño de software orientado a clases natural. JS también tiene una sintaxis similar, pero se comporta **muy diferentemente** de lo que estás acostumbrado con clases en esos otros lenguajes.

**Las clases significan copias.**

Cuando las clases tradicionales son instanciadas, ocurre una copia de comportamiento de clase a instancia. Cuando las clases son heredadas, también ocurre una copia de comportamiento de padre a hijo.

El polimorfismo (tener diferentes funciones en múltiples niveles de una cadena de herencia con el mismo nombre) puede parecer que implica un vínculo referencial relativo de hijo de vuelta a padre, pero sigue siendo solo un resultado del comportamiento de copia.

JavaScript **no crea automáticamente** copias (como las clases implican) entre objetos.

El patrón mixin (tanto explícito como implícito) se usa a menudo para *algo así como* emular el comportamiento de copia de clase, pero esto usualmente lleva a sintaxis fea y frágil como pseudo-polimorfismo explícito (`OtherObj.methodName.call(this, ...)`), que a menudo resulta en código más difícil de entender y mantener.

Los mixins explícitos tampoco son exactamente lo mismo que *copia* de clase, ya que los objetos (¡y las funciones!) solo tienen referencias compartidas duplicadas, no los objetos/funciones duplicados en sí mismos. No prestar atención a tal matiz es la fuente de una variedad de trampas.

En general, simular clases en JS a menudo coloca más minas terrestres para la codificación futura que resolver problemas *reales* presentes.
