# No Sabes JS: Scope y Closures
# Apéndice A: Scope Dinámico

En el Capítulo 2, hablamos del "Scope Dinámico" como contraste con el modelo de "Scope Léxico", que es cómo funciona el scope en JavaScript (y de hecho, en la mayoría de los otros lenguajes).

Examinaremos brevemente el scope dinámico, para reforzar el contraste. Pero, más importante aún, el scope dinámico en realidad es un primo cercano de otro mecanismo (`this`) en JavaScript, que cubrimos en el título "*this & Object Prototypes*" de esta serie de libros.

Como vimos en el Capítulo 2, el scope léxico es el conjunto de reglas sobre cómo el *Motor* puede buscar una variable y dónde la encontrará. La característica clave del scope léxico es que se define en tiempo de autor, cuando se escribe el código (asumiendo que no engañas con `eval()` o `with`).

El scope dinámico parece implicar, y con buena razón, que hay un modelo por el cual el scope puede determinarse dinámicamente en tiempo de ejecución, en lugar de estáticamente en tiempo de autor. De hecho ese es el caso. Ilustrémoslo mediante código:

```js
function foo() {
	console.log( a ); // 2
}

function bar() {
	var a = 3;
	foo();
}

var a = 2;

bar();
```

El scope léxico sostiene que la referencia RHS a `a` en `foo()` se resolverá a la variable global `a`, lo que resultará en que se escriba el valor `2`.

El scope dinámico, por el contrario, no se preocupa por cómo y dónde se declaran las funciones y los scopes, sino más bien **desde dónde se llaman**. En otras palabras, la cadena de scope se basa en la pila de llamadas, no en el anidamiento de scopes en el código.

Entonces, si JavaScript tuviera scope dinámico, cuando se ejecuta `foo()`, **teóricamente** el código siguiente resultaría en `3` como salida.

```js
function foo() {
	console.log( a ); // 3  (not 2!)
}

function bar() {
	var a = 3;
	foo();
}

var a = 2;

bar();
```

¿Cómo puede ser esto? Porque cuando `foo()` no puede resolver la referencia de variable para `a`, en lugar de subir por la cadena de scope (léxica) anidada, sube por la pila de llamadas, para encontrar desde dónde fue *llamada* `foo()`. Como `foo()` fue llamada desde `bar()`, comprueba las variables en el scope de `bar()`, y encuentra un `a` allí con el valor `3`.

¿Extraño? Probablemente estés pensando eso en este momento.

Pero eso es simplemente porque probablemente solo has trabajado en (o al menos considerado profundamente) código que tiene scope léxico. Por lo tanto, el scope dinámico parece ajeno. Si solo hubieras escrito código en un lenguaje de scope dinámico, te parecería natural, y el scope léxico sería el extravagante.

Para ser claros, JavaScript **no tiene, de hecho, scope dinámico**. Tiene scope léxico. Simple y llanamente. Pero el mecanismo `this` es de alguna manera como el scope dinámico.

El contraste clave: **el scope léxico es en tiempo de escritura, mientras que el scope dinámico (¡y `this`!) son en tiempo de ejecución**. El scope léxico se preocupa por *dónde fue declarada una función*, pero el scope dinámico se preocupa por *desde dónde fue llamada* una función.

Finalmente: `this` se preocupa por *cómo fue llamada una función*, lo que muestra cuán estrechamente relacionado está el mecanismo `this` con la idea del scope dinámico. Para profundizar más en `this`, lee el título "*this & Object Prototypes*".
