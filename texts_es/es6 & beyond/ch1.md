# You Don't Know JS: ES6 & Más Allá
# Capítulo 1: ¿ES? Ahora y Futuro

Antes de sumergirte en este libro, deberías tener un dominio sólido de JavaScript hasta el estándar más reciente (al momento de escribir esto), que comúnmente se llama *ES5* (técnicamente ES 5.1). Aquí, planeamos hablar directamente sobre el próximo *ES6*, así como proyectar nuestra visión más allá para entender cómo evolucionará JS en el futuro.

Si aún estás buscando confianza con JavaScript, te recomiendo encarecidamente que leas los otros títulos de esta serie primero:

* *Up & Going*: ¿Eres nuevo en programación y JS? Este es el mapa de ruta que necesitas consultar al comenzar tu viaje de aprendizaje.
* *Scope & Closures*: ¿Sabías que el alcance léxico de JS se basa en semánticas de compilador (¡no de intérprete!)? ¿Puedes explicar cómo los closures son resultado directo del alcance léxico y las funciones como valores?
* *this & Object Prototypes*: ¿Puedes recitar las cuatro reglas simples de cómo se enlaza `this`? ¿Has estado confundiéndote con falsas "clases" en JS en lugar de adoptar el patrón de diseño más simple de "delegación de comportamiento"? ¿Alguna vez escuchaste sobre *objetos enlazados a otros objetos* (OLOO)?
* *Types & Grammar*: ¿Conoces los tipos incorporados en JS, y más importante, sabes cómo usar correcta y seguramente la coerción entre tipos? ¿Qué tan cómodo te sientes con los matices de la gramática/sintaxis de JS?
* *Async & Performance*: ¿Sigues usando callbacks para gestionar tu asincronía? ¿Puedes explicar qué es una promise y por qué/cómo resuelve el "infierno de callbacks"? ¿Sabes cómo usar generators para mejorar la legibilidad del código asíncrono? ¿Qué constituye exactamente la optimización madura de programas JS y operaciones individuales?

Si ya leíste todos esos títulos y te sientes bastante cómodo con los temas que cubren, es hora de sumergirnos en la evolución de JS para explorar todos los cambios que vienen no solo pronto sino más allá del horizonte.

A diferencia de ES5, ES6 no es solo un modesto conjunto de nuevas APIs añadidas al lenguaje. Incorpora toda una serie de nuevas formas sintácticas, algunas de las cuales pueden tomar bastante tiempo para acostumbrarse. También hay una variedad de nuevas formas de organización y nuevos helpers de API para varios tipos de datos.

ES6 es un salto radical hacia adelante para el lenguaje. Incluso si crees que conoces JS en ES5, ES6 está lleno de cosas nuevas que *aún no conoces*, ¡así que prepárate! Este libro explora todos los temas principales de ES6 que necesitas dominar, e incluso te da un vistazo de las características futuras que vienen en camino y de las que deberías estar al tanto.

**Advertencia:** Todo el código en este libro asume un entorno ES6+. Al momento de escribir esto, el soporte de ES6 varía bastante en navegadores y entornos JS (como Node.js), así que tu experiencia puede variar.

## Versionado

El estándar de JavaScript se referencia oficialmente como "ECMAScript" (abreviado "ES"), y hasta hace poco ha sido versionado enteramente por número ordinal (es decir, "5" para "5ta edición").

Las versiones más tempranas, ES1 y ES2, no fueron ampliamente conocidas ni implementadas. ES3 fue la primera línea base extendida para JavaScript, y constituye el estándar de JavaScript para navegadores como IE6-8 y navegadores móviles Android 2.x más antiguos. Por razones políticas más allá de lo que cubriremos aquí, la malograda ES4 nunca se materializó.

En 2009, ES5 fue oficialmente finalizada (luego ES5.1 en 2011), y se estableció como el estándar extendido de JS para la revolución y explosión moderna de navegadores, como Firefox, Chrome, Opera, Safari, y muchos otros.

Acercándose a la esperada *próxima* versión de JS (que se deslizó de 2013 a 2014 y luego a 2015), la etiqueta obvia y común en el discurso ha sido ES6.

Sin embargo, tarde en la línea temporal de la especificación ES6, han surgido sugerencias de que el versionado podría en el futuro cambiar a un esquema basado en años, como ES2016 (también conocido como ES7) para referirse a cualquier versión de la especificación que se finalice antes del final de 2016. Algunos no están de acuerdo, pero ES6 probablemente mantendrá su dominio mental sobre el sustituto de cambio tardío ES2015. Sin embargo, ES2016 puede de hecho señalar el nuevo esquema basado en años.

También se ha observado que el ritmo de evolución de JS es mucho más rápido incluso que el versionado año a año. Tan pronto como una idea comienza a progresar a través de las discusiones de estándares, los navegadores comienzan a prototipar la característica, y los primeros adoptadores comienzan a experimentar con el código.

Generalmente mucho antes de que haya un sello oficial de aprobación, una característica está estandarizada de facto en virtud de este prototipado temprano en motores/herramientas. Así que también es válido considerar que el futuro del versionado de JS sea por característica en lugar de por colección arbitraria de características principales (como es ahora) o incluso por año (como podría llegar a ser).

La conclusión es que las etiquetas de versión dejan de ser tan importantes, y JavaScript comienza a verse más como un estándar vivo y siempre verde. La mejor manera de lidiar con esto es dejar de pensar en tu base de código como siendo "basada en ES6", por ejemplo, y en su lugar considerarla característica por característica para soporte.

## Transpilación

Empeorado aún más por la rápida evolución de características, surge un problema para los desarrolladores de JS que al mismo tiempo pueden desear fuertemente usar nuevas características mientras se enfrentan a la realidad de que sus sitios/aplicaciones pueden necesitar soportar navegadores más antiguos sin tal soporte.

La forma en que ES5 parece haberse desarrollado en la industria en general, la mentalidad típica era que las bases de código esperaran para adoptar ES5 hasta que la mayoría si no todos los entornos pre-ES5 hubieran salido de su espectro de soporte. Como resultado, muchos apenas recientemente (al momento de escribir esto) están comenzando a adoptar cosas como el modo `strict`, que llegó en ES5 hace más de cinco años.

Se considera ampliamente un enfoque dañino para el futuro del ecosistema JS el esperar y seguir la especificación con tantos años de retraso. Todos los responsables de evolucionar el lenguaje desean que los desarrolladores comiencen a basar su código en las nuevas características y patrones tan pronto como se estabilicen en forma de especificación y los navegadores tengan la oportunidad de implementarlas.

Entonces, ¿cómo resolvemos esta aparente contradicción? La respuesta es herramientas, específicamente una técnica llamada *transpilación* (transformación + compilación). En general, la idea es usar una herramienta especial para transformar tu código ES6 en equivalentes (¡o cercanos!) que funcionen en entornos ES5.

Por ejemplo, considera las definiciones abreviadas de propiedades (ver "Extensiones de Literales de Objeto" en el Capítulo 2). Aquí está la forma ES6:

```js
var foo = [1,2,3];

var obj = {
	foo		// significa `foo: foo`
};

obj.foo;	// [1,2,3]
```

Pero (aproximadamente) así es como se transpila:

```js
var foo = [1,2,3];

var obj = {
	foo: foo
};

obj.foo;	// [1,2,3]
```

Esta es una transformación menor pero agradable que nos permite acortar el `foo: foo` en una declaración de literal de objeto a solo `foo`, si los nombres son iguales.

Los transpiladores realizan estas transformaciones por ti, generalmente en un paso del flujo de trabajo de construcción similar a cómo realizas linting, minificación y otras operaciones similares.

### Shims/Polyfills

No todas las nuevas características de ES6 necesitan un transpilador. Los polyfills (también conocidos como shims) son un patrón para definir comportamiento equivalente de un entorno más nuevo en uno más antiguo, cuando es posible. La sintaxis no puede ser polyfillada, pero las APIs a menudo sí pueden serlo.

Por ejemplo, `Object.is(..)` es una nueva utilidad para verificar igualdad estricta de dos valores pero sin las excepciones sutiles que `===` tiene para valores `NaN` y `-0`. El polyfill para `Object.is(..)` es bastante fácil:

```js
if (!Object.is) {
	Object.is = function(v1, v2) {
		// prueba para `-0`
		if (v1 === 0 && v2 === 0) {
			return 1 / v1 === 1 / v2;
		}
		// prueba para `NaN`
		if (v1 !== v1) {
			return v2 !== v2;
		}
		// todo lo demás
		return v1 === v2;
	};
}
```

**Consejo:** Presta atención a la sentencia `if` externa que envuelve el polyfill. Este es un detalle importante, que significa que el fragmento solo define su comportamiento de respaldo para entornos más antiguos donde la API en cuestión no está ya definida; sería muy raro que quisieras sobrescribir una API existente.

Hay una gran colección de shims de ES6 llamada "ES6 Shim" (https://github.com/paulmillr/es6-shim/) que definitivamente deberías adoptar como parte estándar de cualquier nuevo proyecto JS.

Se asume que JS continuará evolucionando constantemente, con los navegadores desplegando soporte para características continuamente en lugar de en grandes bloques. Así que la mejor estrategia para mantenerte actualizado a medida que evoluciona es simplemente introducir shims de polyfill en tu base de código, y un paso de transpilación en tu flujo de trabajo de construcción, ahora mismo y acostumbrarte a esa nueva realidad.

Si decides mantener el statu quo y simplemente esperar a que todos los navegadores sin soporte para una característica desaparezcan antes de empezar a usar la característica, siempre estarás muy atrasado. Tristemente te estarás perdiendo todas las innovaciones diseñadas para hacer que escribir JavaScript sea más efectivo, eficiente y robusto.

## Repaso

ES6 (algunos pueden intentar llamarlo ES2015) está apenas llegando al momento de escribir esto, ¡y tiene muchas cosas nuevas que necesitas aprender!

Pero es aún más importante cambiar tu mentalidad para alinearte con la nueva forma en que JavaScript va a evolucionar. No se trata solo de esperar años a que algún documento oficial obtenga un voto de aprobación, como muchos han hecho en el pasado.

Ahora, las características de JavaScript llegan a los navegadores cuando están listas, y depende de ti si te subirás al tren temprano o si estarás jugando costosos juegos de ponerse al día años a partir de ahora.

Cualquiera que sean las etiquetas que el futuro JavaScript adopte, va a moverse mucho más rápido de lo que jamás se ha movido antes. Los transpiladores y shims/polyfills son herramientas importantes para mantenerte a la vanguardia de hacia dónde se dirige el lenguaje.

Si hay alguna narrativa importante que entender sobre la nueva realidad de JavaScript, es que todos los desarrolladores JS son fuertemente exhortados a moverse del borde trasero de la curva al borde delantero. ¡Y aprender ES6 es donde todo eso comienza!
