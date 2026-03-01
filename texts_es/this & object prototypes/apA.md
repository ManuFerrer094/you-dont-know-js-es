# You Don't Know JS: *this* & Prototipos de Objetos
# Apéndice A: `class` en ES6

Si hay algún mensaje para llevar de la segunda mitad de este libro (Capítulos 4-6), es que las clases son un patrón de diseño opcional para código (no un dado necesario), y que además a menudo son bastante incómodas de implementar en un lenguaje `[[Prototype]]` como JavaScript.

Esta incomodidad *no* es solo sobre sintaxis, aunque es una gran parte. Los Capítulos 4 y 5 examinaron bastante de fealdad sintáctica, desde la verbosidad de las referencias a `.prototype` ensuciando el código, hasta el *pseudo-polimorfismo explícito* (ver Capítulo 4) cuando les das a los métodos el mismo nombre en diferentes niveles de la cadena e intentas implementar una referencia polimórfica desde un método de nivel inferior a un método de nivel superior. `.constructor` siendo erróneamente interpretado como "fue construido por" y sin embargo siendo poco confiable para esa definición es otra fealdad sintáctica más.

Pero los problemas con el diseño de clases son mucho más profundos. El Capítulo 4 señala que las clases en los lenguajes tradicionales orientados a clases realmente producen una acción de *copia* de padre a hijo a instancia, mientras que en `[[Prototype]]`, la acción **no** es una copia, sino más bien lo opuesto -- un enlace de delegación.

Cuando se compara con la simplicidad del código estilo OLOO y la delegación de comportamiento (ver Capítulo 6), que abrazan `[[Prototype]]` en lugar de esconderse de él, las clases destacan como una espina clavada en JS.

## `class`

Pero *no* necesitamos re-argumentar ese caso de nuevo. Re-menciono esos problemas brevemente solo para que los mantengas frescos en tu mente ahora que dirigimos nuestra atención al mecanismo `class` de ES6. Demostraremos aquí cómo funciona, y veremos si `class` hace algo sustancial para abordar alguna de esas preocupaciones de "clases".

Revisitemos el ejemplo de `Widget` / `Button` del Capítulo 6:

```js
class Widget {
	constructor(width,height) {
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	}
	render($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
}

class Button extends Widget {
	constructor(width,height,label) {
		super( width, height );
		this.label = label || "Default";
		this.$elem = $( "<button>" ).text( this.label );
	}
	render($where) {
		super.render( $where );
		this.$elem.click( this.onClick.bind( this ) );
	}
	onClick(evt) {
		console.log( "Button '" + this.label + "' clicked!" );
	}
}
```

Más allá de que esta sintaxis *se vea* más bonita, ¿qué problemas resuelve ES6?

1. No hay más (bueno, más o menos, ¡ver abajo!) referencias a `.prototype` ensuciando el código.
2. `Button` se declara directamente para "heredar de" (también conocido como `extends`) `Widget`, en lugar de necesitar usar `Object.create(..)` para reemplazar un objeto `.prototype` que está vinculado, o tener que establecerlo con `.__proto__` u `Object.setPrototypeOf(..)`.
3. `super(..)` ahora nos da una capacidad de **polimorfismo relativo** muy útil, para que cualquier método en un nivel de la cadena pueda referirse relativamente un nivel arriba en la cadena a un método del mismo nombre. Esto incluye una solución a la nota del Capítulo 4 sobre la rareza de que los constructores no pertenecen a su clase, y por lo tanto no están relacionados -- `super()` funciona dentro de constructores exactamente como esperarías.
4. La sintaxis literal de `class` no tiene provisión para especificar propiedades (solo métodos). Esto puede parecer limitante para algunos, pero se espera que la vasta mayoría de los casos donde una propiedad (estado) existe en otro lugar que no sea las "instancias" del final de la cadena, esto es usualmente un error y sorprendente (ya que es estado que está implícitamente "compartido" entre todas las "instancias"). Así que, uno *podría* decir que la sintaxis de `class` te está protegiendo de errores.
5. `extends` te permite extender incluso (sub)tipos de objetos integrados, como `Array` o `RegExp`, de una forma muy natural. Hacer esto sin `class .. extends` ha sido por mucho tiempo una tarea excesivamente compleja y frustrante, una que solo los más expertos de los autores de frameworks han sido capaces de abordar con precisión. ¡Ahora, será bastante trivial!

Con toda justicia, esas son algunas soluciones sustanciales a muchos de los problemas más obvios (sintácticos) y sorpresas que la gente tiene con el código estilo prototipo clásico.

## Trampas de `class`

Sin embargo, no todo es confeti y rosas. Todavía hay algunos problemas profundos y profundamente preocupantes con usar "clases" como patrón de diseño en JS.

Primero, la sintaxis de `class` puede convencerte de que un nuevo mecanismo de "clase" existe en JS a partir de ES6. **No es así.** `class` es, mayormente, solo azúcar sintáctica encima del mecanismo `[[Prototype]]` (¡delegación!) existente.

Eso significa que `class` en realidad no está copiando definiciones estáticamente al momento de la declaración como se hace en los lenguajes tradicionales orientados a clases. Si cambias/reemplazas un método (a propósito o por accidente) en la "clase" padre, la "clase" hija y/o las instancias todavía serán "afectadas", en que no obtuvieron copias al momento de la declaración, todas están aún usando el modelo de delegación en vivo basado en `[[Prototype]]`:

```js
class C {
	constructor() {
		this.num = Math.random();
	}
	rand() {
		console.log( "Random: " + this.num );
	}
}

var c1 = new C();
c1.rand(); // "Random: 0.4324299..."

C.prototype.rand = function() {
	console.log( "Random: " + Math.round( this.num * 1000 ));
};

var c2 = new C();
c2.rand(); // "Random: 867"

c1.rand(); // "Random: 432" -- ¡ups!
```

Esto solo parece un comportamiento razonable *si ya conoces* la naturaleza de delegación de las cosas, en lugar de esperar *copias* de "clases reales". Así que la pregunta para hacerte es, ¿por qué estás eligiendo la sintaxis de `class` para algo fundamentalmente diferente de las clases?

¿No es que la sintaxis de `class` de ES6 **solo hace más difícil** ver y entender la diferencia entre clases tradicionales y objetos delegados?

La sintaxis de `class` *no proporciona* una forma de declarar propiedades miembro de clase (solo métodos). Así que si necesitas hacer eso para rastrear estado compartido entre instancias, entonces terminas volviendo a la fea sintaxis `.prototype`, así:

```js
class C {
	constructor() {
		// make sure to modify the shared state,
		// not set a shadowed property on the
		// instances!
		C.prototype.count++;

		// here, `this.count` works as expected
		// via delegation
		console.log( "Hello: " + this.count );
	}
}

// add a property for shared state directly to
// prototype object
C.prototype.count = 0;

var c1 = new C();
// Hello: 1

var c2 = new C();
// Hello: 2

c1.count === 2; // true
c1.count === c2.count; // true
```

El mayor problema aquí es que traiciona la sintaxis de `class` al exponer (¡fuga!) `.prototype` como un detalle de implementación.

Pero, también seguimos teniendo la sorpresa de que `this.count++` implícitamente crearía una propiedad ensombrecida `.count` separada en ambos objetos `c1` y `c2`, en lugar de actualizar el estado compartido. `class` no nos ofrece consuelo de ese problema, excepto (presumiblemente) para implicar por la falta de soporte sintáctico que no deberías estar haciendo eso *en absoluto*.

Además, el ensombrecimiento accidental sigue siendo un peligro:

```js
class C {
	constructor(id) {
		// oops, gotcha, we're shadowing `id()` method
		// with a property value on the instance
		this.id = id;
	}
	id() {
		console.log( "Id: " + this.id );
	}
}

var c1 = new C( "c1" );
c1.id(); // TypeError -- `c1.id` is now the string "c1"
```

También hay algunos problemas de matices muy sutiles con cómo funciona `super`. Podrías asumir que `super` estaría enlazado de forma análoga a cómo `this` se enlaza (ver Capítulo 2), que es que `super` siempre estaría enlazado a un nivel más arriba que cualquiera que sea la posición del método actual en la cadena `[[Prototype]]`.

Sin embargo, por razones de rendimiento (el enlace de `this` ya es costoso), `super` no está enlazado dinámicamente. Está enlazado más bien "estáticamente", al momento de la declaración. No es gran cosa, ¿verdad?

Ehh... tal vez, tal vez no. Si tú, como la mayoría de los desarrolladores JS, comienzas a asignar funciones a diferentes objetos (que vinieron de definiciones de `class`), en varias formas diferentes, probablemente no serás muy consciente de que en todos esos casos, el mecanismo de `super` bajo las cubiertas tiene que ser re-enlazado cada vez.

Y dependiendo de qué tipos de enfoques sintácticos tomes para estas asignaciones, puede muy bien haber casos donde el `super` no pueda ser apropiadamente enlazado (al menos, no donde sospechas), así que puede que (al momento de escribir, la discusión del TC39 está en curso sobre el tema) tengas que enlazar manualmente `super` con `toMethod(..)` (algo así como tienes que hacer `bind(..)` para `this` -- ver Capítulo 2).

Estás acostumbrado a poder asignar métodos a diferentes objetos para *automáticamente* aprovechar el dinamismo de `this` vía la regla de *enlace implícito* (ver Capítulo 2). Pero lo mismo probablemente no será cierto con métodos que usen `super`.

Considera lo que `super` debería hacer aquí (contra `D` y `E`):

```js
class P {
	foo() { console.log( "P.foo" ); }
}

class C extends P {
	foo() {
		super();
	}
}

var c1 = new C();
c1.foo(); // "P.foo"

var D = {
	foo: function() { console.log( "D.foo" ); }
};

var E = {
	foo: C.prototype.foo
};

// Link E to D for delegation
Object.setPrototypeOf( E, D );

E.foo(); // "P.foo"
```

Si estabas pensando (¡bastante razonablemente!) que `super` estaría enlazado dinámicamente al momento de la llamada, podrías esperar que `super()` reconocería automáticamente que `E` delega a `D`, y así `E.foo()` usando `super()` debería llamar a `D.foo()`.

**No es así.** Por razones de pragmatismo de rendimiento, `super` no está *enlazado tardíamente* (es decir, enlazado dinámicamente) como `this` lo está. En su lugar se deriva al momento de la llamada de `[[HomeObject]].[[Prototype]]`, donde `[[HomeObject]]` está estáticamente enlazado al momento de la creación.

En este caso particular, `super()` aún está resolviendo a `P.foo()`, ya que el `[[HomeObject]]` del método sigue siendo `C` y `C.[[Prototype]]` es `P`.

*Probablemente* habrá formas de abordar manualmente tales problemas. Usar `toMethod(..)` para enlazar/re-enlazar el `[[HomeObject]]` de un método (¡junto con establecer el `[[Prototype]]` de ese objeto!) parece funcionar en este escenario:

```js
var D = {
	foo: function() { console.log( "D.foo" ); }
};

// Link E to D for delegation
var E = Object.create( D );

// manually bind `foo`s `[[HomeObject]]` as
// `E`, and `E.[[Prototype]]` is `D`, so thus
// `super()` is `D.foo()`
E.foo = C.prototype.foo.toMethod( E, "foo" );

E.foo(); // "D.foo"
```

**Nota:** `toMethod(..)` clona el método, y toma `homeObject` como su primer parámetro (por eso pasamos `E`), y el segundo parámetro (opcionalmente) establece un `name` para el nuevo método (que mantenemos en "foo").

Queda por ver si hay otros casos esquina con los que los desarrolladores se encontrarán más allá de este escenario. Sin importar, tendrás que ser diligente y mantenerte consciente de en qué lugares el motor automáticamente resuelve `super` por ti, y en qué lugares tienes que encargarte manualmente. **¡Ugh!**

# ¿Estático > Dinámico?

Pero el problema más grande de todos sobre el `class` de ES6 es que todos estos varios problemas significan que `class` como que te opta en una sintaxis que parece implicar (como las clases tradicionales) que una vez que declaras un `class`, es una definición estática de una cosa (futuramente instanciada). Pierdes completamente de vista el hecho de que `C` es un objeto, una cosa concreta, con la que puedes interactuar directamente.

En los lenguajes tradicionales orientados a clases, nunca ajustas la definición de una clase después, así que el patrón de diseño de clases no sugiere tales capacidades. Pero **una de las partes más poderosas** de JS es que *es* dinámico, y la definición de cualquier objeto es (a menos que lo hagas inmutable) una *cosa* fluida y mutable.

`class` parece implicar que no deberías hacer tales cosas, forzándote a la sintaxis más fea de `.prototype` para hacerlo, o forzándote a pensar sobre las trampas de `super`, etc. También ofrece *muy poco* soporte para cualquiera de las trampas que este dinamismo puede traer.

En otras palabras, es como si `class` te estuviera diciendo: "lo dinámico es muy difícil, así que probablemente no es una buena idea. Aquí tienes una sintaxis de aspecto estático, así que codifica tus cosas estáticamente."

Qué comentario tan triste sobre JavaScript: **lo dinámico es muy difícil, pretendamos ser (¡pero no seamos realmente!) estáticos**.

Estas son las razones por las que el `class` de ES6 se enmascara como una buena solución a los dolores de cabeza sintácticos, pero en realidad está enturbiando las aguas más y haciendo las cosas peores para JS y para un entendimiento claro y conciso.

**Nota:** Si usas la utilidad `.bind(..)` para hacer una función con enlace duro (ver Capítulo 2), la función creada no es sub-clasificable con `extend` de ES6 como lo son las funciones normales.

## Revisión (TL;DR)

`class` hace un muy buen trabajo pretendiendo arreglar los problemas con el patrón de diseño de clase/herencia en JS. Pero en realidad hace lo opuesto: **esconde muchos de los problemas, e introduce otros sutiles pero peligrosos**.

`class` contribuye a la confusión continua de "clase" en JavaScript que ha plagado al lenguaje por casi dos décadas. En algunos aspectos, hace más preguntas de las que responde, y se siente en totalidad como un ajuste muy antinatural encima de la elegante simplicidad del mecanismo `[[Prototype]]`.

En resumen: si el `class` de ES6 hace más difícil aprovechar robustamente `[[Prototype]]`, y esconde la naturaleza más importante del mecanismo de objetos de JS -- **los enlaces de delegación en vivo entre objetos** -- ¿no deberíamos ver `class` como creando más problemas de los que resuelve, y simplemente relegarlo a un anti-patrón?

Realmente no puedo responder esa pregunta por ti. Pero espero que este libro haya explorado completamente el tema a un nivel más profundo de lo que nunca habías ido antes, y te haya dado la información que necesitas *para responderla tú mismo*.
