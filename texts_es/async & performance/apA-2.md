## Ejecutando Generadores

En el Capítulo 4, derivamos una utilidad llamada `run(..)` que puede ejecutar generadores hasta su completación, escuchando Promesas `yield`eadas y usándolas para reanudar asíncronamente el generador. *asynquence* tiene exactamente tal utilidad incorporada, llamada `runner(..)`.

Primero configuremos algunos helpers para ilustración:

```js
function doublePr(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( x * 2 );
		}, 100 );
	} );
}

function doubleSeq(x) {
	return ASQ( function(done){
		setTimeout( function(){
			done( x * 2)
		}, 100 );
	} );
}
```

Ahora, podemos usar `runner(..)` como un paso en medio de una secuencia:

```js
ASQ( 10, 11 )
.runner( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield una promesa real
	x = yield doublePr( x );

	// yield una secuencia
	x = yield doubleSeq( x );

	return x;
} )
.val( function(msg){
	console.log( msg );			// 84
} );
```

### Generadores Envueltos

También puedes crear un generador auto-empaquetado -- es decir, una función normal que ejecuta tu generador especificado y devuelve una secuencia para su completación -- envolviéndolo con `ASQ.wrap(..)`:

```js
var foo = ASQ.wrap( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield una promesa real
	x = yield doublePr( x );

	// yield una secuencia
	x = yield doubleSeq( x );

	return x;
}, { gen: true } );

// ..

foo( 8, 9 )
.val( function(msg){
	console.log( msg );			// 68
} );
```

Hay mucho más de lo que `runner(..)` es capaz, pero volveremos a eso en el Apéndice B.

## Repaso

*asynquence* es una abstracción simple -- una secuencia es una serie de pasos (asíncronos) -- sobre las Promesas, orientada a hacer que trabajar con varios patrones asíncronos sea mucho más fácil, sin ningún compromiso en capacidad.

Hay otras bondades en la API central de *asynquence* y sus plug-ins contrib más allá de lo que vimos en este apéndice, pero dejaremos eso como un ejercicio para que el lector vaya a revisar el resto de las capacidades.

Ahora has visto la esencia y el espíritu de *asynquence*. La conclusión clave es que una secuencia se compone de pasos, y esos pasos pueden ser cualquiera de docenas de variaciones diferentes de Promesas, o pueden ser una ejecución de generador, o... La elección es tuya, tienes toda la libertad para tejer cualquier lógica de control de flujo asíncrono que sea apropiada para tus tareas. No más cambiar de biblioteca para capturar diferentes patrones asíncronos.

Si estos fragmentos de *asynquence* te han tenido sentido, ahora estás bastante al día con la biblioteca; ¡en realidad no toma tanto aprenderla!

Si todavía estás un poco confuso sobre cómo funciona (¡o por qué!), querrás dedicar un poco más de tiempo examinando los ejemplos anteriores y jugando con *asynquence* por tu cuenta, antes de pasar al siguiente apéndice. El Apéndice B llevará a *asynquence* hacia varios patrones asíncronos más avanzados y potentes.
