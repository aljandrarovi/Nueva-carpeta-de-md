# **ESPECIFICACIONES DEL PROYECTO**
## _*FUNCIONAMIENTO GENERAL DE LA APLICACIÓN*_
### Quiero hacer una interacción con las manos, que consiste en que cuando yo abra la mano y cierre como salpicando y caigan gotas a la pantalla, estas gotas se riegan bajando por la pantalla como si fuera lluvia, y que genere sonidos que caen gotas de lluvia.
## _*TECNOLOGÍA*_
- **p5.js**: lienzo, animación, dibujo de las gotas de lluvia y ciclo de renderizado (`setup`/`draw`).
- **ml5.js**: detección de manos con el modelo **HandPose** (21 puntos clave por mano a través de la webcam del navegador).

## _*DETECCIÓN DE GESTOS*_
- El gesto activador es **abrir y cerrar el puño completo** (mano abierta → puño cerrado → mano abierta), detectado con los 21 puntos clave de HandPose.
- Cuando se detecta ese gesto, se dispara la "salpicada": aparecen gotas que caen por la pantalla como lluvia.

## _*SISTEMA DE GOTAS*_
- **Cantidad**: hasta **150 gotas** simultáneas en pantalla para lograr un aspecto de lluvia suave y romántica.
- **Caída**: velocidad lenta y constante, gotas que reaparecen en la parte superior al llegar al fondo (lluvia continua en bucle).
- **Dibujo**: trazos verticales finos en tonos azules/grises translúcidos.

## _*SONIDO*_
- **Sonido de gota**: sonido suave de "gotita" al caer, con tono ligeramente aleatorio para evitar repetición.
- **Volumen**: bajo, ambiental y relajante.
- **Disparo**: se reproduce al activar el gesto del puño (una vez por salpicada).

