# No Sabes JS: Scope y Closures
# Apéndice B: Polyfilling del Scope de Bloque

En el Capítulo 3, exploramos el Scope de Bloque. Vimos que `with` y la cláusula `catch` son ambos pequeños ejemplos de scope de bloque que han existido en JavaScript desde al menos la introducción de ES3.

Pero es la introducción de `let` en ES6 la que finalmente da plena e irrestricta capacidad de scope de bloque a nuestro código. Hay muchas cosas emocionantes, tanto funcional como en estilo de código, que el scope de bloque habilitará.

¿Pero qué pasa si quisiéramos usar el scope de bloque en entornos pre-ES6?

Considera este código:

```js
{
	let a = 2;
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

Esto funcionará perfectamente en entornos ES6. ¿Pero podemos hacerlo antes de ES6? `catch` es la respuesta.

```js
try{throw 2}catch(a){
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

¡Vaya! Ese es un código bastante feo y raro. Vemos un `try/catch` que aparentemente lanza forzadamente un error, pero el "error" que lanza es solo el valor `2`, y luego la declaración de variable que lo recibe está en la cláusula `catch(a)`. Mente: volada.

Así es, la cláusula `catch` tiene scope de bloque en ella, lo que significa que puede usarse como un polyfill para el scope de bloque en entornos pre-ES6.

"Pero...", dices. "...¡nadie quiere escribir código tan feo!" Eso es verdad. Nadie escribe (algo del) código producido por el compilador de CoffeeScript, tampoco. Ese no es el punto.

El punto es que las herramientas pueden transpilar código ES6 para que funcione en entornos pre-ES6. Puedes escribir código usando scope de bloque, y beneficiarte de tal funcionalidad, y dejar que una herramienta de paso de compilación se encargue de producir código que realmente *funcione* cuando se despliegue.

Este es en realidad el camino de migración preferido para todo (ejem, la mayoría) de ES6: usar un transpilador de código para tomar código ES6 y producir código compatible con ES5 durante la transición de pre-ES6 a ES6.

## Traceur

Google mantiene un proyecto llamado "Traceur" [^note-traceur], exactamente encargado de transpilar características de ES6 hacia pre-ES6 (principalmente ES5, ¡pero no todo!) para uso general. El comité TC39 depende de esta herramienta (y otras) para probar la semántica de las características que especifican.

¿Qué produce Traceur de nuestro fragmento? ¡Lo adivinaste!

```js
{
	try {
		throw undefined;
	} catch (a) {
		a = 2;
		console.log( a );
	}
}

console.log( a );
```

Así que, con el uso de tales herramientas, podemos comenzar a aprovechar el scope de bloque independientemente de si estamos apuntando a ES6 o no, porque `try/catch` ha existido (y funcionado de esta manera) desde los días de ES3.

## Bloques Implícitos vs. Explícitos

En el Capítulo 3, identificamos algunos posibles escollos para la mantenibilidad/refactorabilidad del código cuando introducimos el scope de bloque. ¿Hay otra manera de aprovechar el scope de bloque pero reducir este inconveniente?

Considera esta forma alternativa de `let`, llamada el "bloque let" o "sentencia let" (en contraste con las "declaraciones let" de antes).

```js
let (a = 2) {
	console.log( a ); // 2
}

console.log( a ); // ReferenceError
```

En lugar de secuestrar implícitamente un bloque existente, la sentencia-let crea un bloque explícito para su vinculación de scope. No solo el bloque explícito se destaca más, y quizás es más robusto en la refactorización del código, produce un código algo más limpio al, gramaticalmente, forzar todas las declaraciones al principio del bloque. Esto hace más fácil mirar cualquier bloque y saber qué tiene scope en él y qué no.

Como patrón, refleja el enfoque que muchas personas adoptan en el scope de función cuando mueven/elevan manualmente todas sus declaraciones `var` al principio de la función. La sentencia-let las coloca allí al principio del bloque intencionalmente, y si no usas declaraciones `let` dispersas por todas partes, tus declaraciones de scope de bloque son algo más fáciles de identificar y mantener.

Sin embargo, hay un problema. La forma de sentencia-let no está incluida en ES6. Tampoco el compilador oficial de Traceur acepta esa forma de código.

Tenemos dos opciones. Podemos formatear usando sintaxis válida de ES6 y un poco de disciplina de código:

```js
/*let*/ { let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

Pero, las herramientas están destinadas a resolver nuestros problemas. Por lo que la otra opción es escribir bloques de sentencia let explícitos, y dejar que una herramienta los convierta a código válido y funcional.

Así que, construí una herramienta llamada "let-er" [^note-let_er] para abordar exactamente este problema. *let-er* es un transpilador de código de paso de compilación, pero su única tarea es encontrar formas de sentencia-let y transpilarlas. Dejará solas el resto de tu código, incluyendo cualquier declaración-let. Puedes usar *let-er* de manera segura como el primer paso de transpilación ES6, y luego pasar tu código por algo como Traceur si es necesario.

Además, *let-er* tiene una bandera de configuración `--es6`, que cuando está activada (desactivada por defecto), cambia el tipo de código producido. En lugar del truco de polyfill `try/catch` de ES3, *let-er* tomaría nuestro fragmento y produciría el código completamente compatible con ES6, sin trucos:

```js
{
	let a = 2;
	console.log( a );
}

console.log( a ); // ReferenceError
```

Por lo que puedes empezar a usar *let-er* de inmediato, y apuntar a todos los entornos pre-ES6, y cuando solo te importa ES6, puedes agregar la bandera e inmediatamente apuntar solo a ES6.

Y lo más importante, **puedes usar la forma de sentencia-let más preferible y más explícita** aunque no sea parte oficial de ninguna versión ES (todavía).

## Rendimiento

Déjame añadir una última nota rápida sobre el rendimiento de `try/catch`, y/o para abordar la pregunta, "¿por qué no usar simplemente una IIFE para crear el scope?"

En primer lugar, el rendimiento de `try/catch` *es* más lento, pero no hay ningún supuesto razonable de que *tenga* que ser de esa manera, ni siquiera que *siempre lo será*. Como el transpilador oficial aprobado por TC39 para ES6 usa `try/catch`, el equipo de Traceur ha pedido a Chrome que mejore el rendimiento de `try/catch`, y obviamente están motivados para hacerlo.

En segundo lugar, la IIFE no es una comparación justa de manzanas con manzanas con `try/catch`, porque una función envuelta alrededor de cualquier código arbitrario cambia el significado, dentro de ese código, de `this`, `return`, `break` y `continue`. La IIFE no es un sustituto general adecuado. Solo podría usarse manualmente en ciertos casos.

La pregunta realmente se convierte en: ¿quieres scope de bloque o no? Si lo quieres, estas herramientas te proveen esa opción. Si no, ¡sigue usando `var` y continúa con tu codificación!


[^note-traceur]: [Google Traceur](http://google.github.io/traceur-compiler/demo/repl.html)

[^note-let_er]\: [let-er](https://github.com/getify/let-er)
