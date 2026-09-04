# Space Invaders

Juego clásico de Space Invaders implementado en HTML5 + JavaScript vanilla con Canvas API.

## Características

- **Canvas 800x600** con renderizado en tiempo real
- **4x9 grid de enemigos** (36 naves) con movimiento lateral y descenso
- **Sistema de disparos** con cooldown de 250ms
- **Detección de colisiones** AABB (Axis-Aligned Bounding Box)
- **Sistema de puntuación**: +10 puntos por enemigo destruido
- **Condiciones de victoria/derrota**:
  - `YOU WIN!` al eliminar todos los enemigos
  - `GAME OVER` cuando un enemigo alcanza la línea del jugador
- **Controles**:
  - `←` `→` para mover la nave
  - `Espacio` para disparar
  - `R` o `Enter` para reiniciar (tras victoria/derrota)

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Juego completo (HTML + CSS + JS inline) |
| `test-space-invaders.js` | Suite de tests en Node.js (sin dependencias) |

## Tests

```bash
node test-space-invaders.js
```

Cubre: sintaxis JS, arranque del canvas, movimiento del jugador, disparo por `event.key` y `event.code`, colisiones AABB, puntuación, eliminación de enemigos, victoria, derrota, y ausencia de errores de consola.

## Sin dependencias

Todo el juego corre en el navegador sin frameworks, bundlers ni dependencias externas. Un solo archivo `index.html` autocontenido.
