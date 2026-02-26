# No Sabes JS: Scope y Closures
# Apéndice C: `this` Léxico

Aunque este título no aborda el mecanismo `this` en detalle, hay un tema de ES6 que relaciona `this` con el scope léxico de una manera importante, que examinaremos rápidamente.

ES6 añade una forma sintáctica especial de declaración de función llamada la "función flecha". Se ve así:

```js
var foo = a => {
	console.log( a );
};

foo( 2 ); // 2
```

La llamada "flecha gruesa" se menciona a menudo como una abreviatura del *tediosamente verboso* (con sarcasmo) la palabra clave `function`.

Pero hay algo mucho más importante sucediendo con las funciones flecha que no tiene nada que ver con ahorrar pulsaciones de teclas en tu declaración.

Brevemente, este código sufre un problema:

```js

var obj = {
	id: "awesome",
	cool: function coolFn() {
		console.log( this.id );
	}
};

var id = "not awesome";

obj.cool(); // awesome

setTimeout( obj.cool, 100 ); // not awesome
```

El problema es la pérdida del enlace `this` en la función `cool()`. Hay varias maneras de abordar ese problema, pero una solución que se repite a menudo es `var self = this;`.

Eso podría verse así:

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		var self = this;

		if (self.count < 1) {
			setTimeout( function timer(){
				self.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

Sin entrar demasiado en los detalles, la "solución" `var self = this` simplemente prescinde de todo el problema de entender y usar correctamente el enlace `this`, y en su lugar recurre a algo con lo que quizás nos sintamos más cómodos: el scope léxico. `self` se convierte simplemente en un identificador que puede resolverse mediante el scope léxico y el closure, y no le importa lo que haya ocurrido con el enlace `this` a lo largo del camino.

A la gente no le gusta escribir cosas verbosas, especialmente cuando lo hacen una y otra vez. Por lo tanto, una motivación de ES6 es ayudar a aliviar estos escenarios y, de hecho, *corregir* problemas de idiomas comunes, como este.

La solución de ES6, la función flecha, introduce un comportamiento llamado "`this` léxico".

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( () => { // arrow-function ftw?
				this.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

La breve explicación es que las funciones flecha no se comportan en absoluto como las funciones normales cuando se trata de su enlace `this`. Descartan todas las reglas normales para el enlace `this`, y en su lugar toman el valor `this` de su scope léxico envolvente inmediato, sea cual sea.

Entonces, en ese fragmento, la función flecha no obtiene su `this` desvinculado de alguna manera impredecible, simplemente "hereda" el enlace `this` de la función `cool()` (¡que es correcto si la invocamos como se muestra!).

Si bien esto hace que el código sea más corto, mi perspectiva es que las funciones flecha son realmente solo codificar en la sintaxis del lenguaje un *error* común de los desarrolladores, que es confundir y combinar las reglas de "enlace `this`" con las reglas de "scope léxico".

Dicho de otra manera: ¿por qué tomarse la molestia y la verbosidad de usar el paradigma de codificación estilo `this`, solo para cortarle las piernas mezclándolo con referencias léxicas? Parece natural adoptar uno u otro enfoque para cualquier pieza de código dada, y no mezclarlos en la misma pieza de código.

**Nota:** otra detracción de las funciones flecha es que son anónimas, no nombradas. Consulta el Capítulo 3 para ver las razones por las que las funciones anónimas son menos deseables que las funciones nombradas.

Un enfoque más apropiado, en mi perspectiva, a este "problema", es usar y adoptar el mecanismo `this` correctamente.

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( function timer(){
				this.count++; // `this` is safe because of `bind(..)`
				console.log( "more awesome" );
			}.bind( this ), 100 ); // look, `bind()`!
		}
	}
};

obj.cool(); // more awesome
```

Ya sea que prefieras el nuevo comportamiento de `this` léxico de las funciones flecha, o prefieras el probado y fiel `bind()`, es importante notar que las funciones flecha **no** son solo sobre menos escritura de "function".

Tienen una *diferencia de comportamiento intencional* que debemos aprender y entender, y si así lo elegimos, aprovechar.

¡Ahora que entendemos completamente el scope léxico (¡y el closure!), entender el `this` léxico debería ser pan comido!
