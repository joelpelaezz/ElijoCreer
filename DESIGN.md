# DESIGN.md — ElijoCreer

## 1. Producto

**ElijoCreer** es una aplicación web social y colaborativa de pronósticos deportivos inspirada en el Mundial 2026.

Permite que usuarios:
- creen una cuenta
- armen o se sumen a grupos
- carguen pronósticos de partidos
- compitan con amigos, familia u oficina
- vean rankings, aciertos y evolución dentro de cada grupo

La experiencia debe sentirse:
- futbolera
- emocional
- moderna
- competitiva pero amigable
- clara para cualquier persona

---

## 2. Personalidad de marca

### Concepto
Una marca inspirada en la fe futbolera, la ilusión colectiva y la energía de competir entre amigos.

### Valores
- comunidad
- pasión
- confianza
- competencia sana
- orgullo
- celebración

### Sensación que debe transmitir
- “estamos jugando entre amigos”
- “esto se siente mundialista”
- “quiero volver a entrar para ver cómo voy”
- “es fácil de usar y se ve muy bien”

### Evitar
- estética infantil
- look de casino/apuestas agresivas
- visual gamer exagerado
- exceso de efectos, ruido o saturación

---

## 3. Identidad visual

### Inspiración
Selección Argentina, clima mundialista, comunidad, campeones del mundo, fútbol moderno.

### Paleta sugerida

#### Colores principales
- **Celeste principal**: `#6EC6FF`
- **Celeste suave**: `#DDF4FF`
- **Blanco**: `#FFFFFF`
- **Azul profundo**: `#0D2B45`

#### Colores de apoyo
- **Dorado sutil**: `#D4AF37`
- **Gris claro**: `#F3F6F9`
- **Gris medio**: `#9AA8B6`
- **Texto oscuro**: `#16212B`

#### Estados
- **Success**: `#22C55E`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`
- **Info**: `#3B82F6`

### Uso visual
- el celeste debe ser protagonista
- el blanco debe dar aire y limpieza
- el azul profundo debe ordenar jerarquía y contraste
- el dorado debe aparecer con moderación, solo para premium, logros o top 3

---

## 4. Tipografía

### Estilo tipográfico
Usar una tipografía sans-serif moderna, limpia y sólida.

### Sugerencias
- **Headings**: Inter, Plus Jakarta Sans o Sora
- **Body**: Inter, Public Sans o Manrope

### Criterios
- títulos con presencia deportiva moderna
- textos muy legibles en mobile
- números de puntajes y resultados con alto protagonismo

---

## 5. Principios UX

### Regla general
La app tiene que ser entendible en segundos.

### Principios
1. **Primero el partido**
   - los próximos partidos y pronósticos pendientes deben ser visibles rápido

2. **Primero el grupo**
   - el usuario entra para competir con gente conocida

3. **Primero el ranking**
   - siempre debe estar claro cómo va cada uno

4. **Menos fricción**
   - cargar un pronóstico debe ser rápido y obvio

5. **Feedback inmediato**
   - cuando el usuario acierta o falla, tiene que verse claro y sentirse relevante

6. **Diseño social**
   - mostrar actividad, comparación, progreso y pertenencia

---

## 6. Estilo de layout

### Mobile
- mobile-first real
- navegación inferior o tabs simples
- cards apiladas
- CTA siempre visibles
- inputs grandes y cómodos
- jerarquía de información vertical y escaneable

### Desktop
- layouts más amplios y respirados
- grids para rankings, fixtures y dashboards
- sidebar o top navigation cuando sume claridad
- tablas con buena lectura y filtros visibles

---

## 7. Componentes clave

### Cards de partido
Deben mostrar:
- equipo local
- equipo visitante
- escudos
- fecha/hora
- estado del partido
- acción principal: pronosticar / ver resultado

### Cards de grupo
Deben mostrar:
- nombre del grupo
- cantidad de miembros
- posición del usuario
- próximos partidos
- acceso rápido al ranking

### Ranking table
Debe incluir:
- posición
- avatar
- nombre
- puntaje total
- aciertos
- tendencia

### Prediction input
Debe ser:
- simple
- visual
- rápido
- optimizado para mobile

### Badges
Usar badges para:
- próximo
- en juego
- finalizado
- exacto
- acertó ganador
- cerrado
- admin
- público / privado

### Stats cards
Para mostrar:
- puntos
- porcentaje de aciertos
- pronósticos pendientes
- lugar en ranking

---

## 8. Patrones visuales

### Bordes y formas
- bordes redondeados medianos
- look moderno y amigable
- no usar esquinas agresivas

### Sombras
- suaves
- sutiles
- solo para jerarquía, no decoración excesiva

### Íconos
- simples
- limpios
- consistentes
- deportivos o sociales solo cuando aporten claridad

### Ilustraciones / fondos
- fondos sutiles inspirados en estadio, césped, luces o energía mundialista
- no usar fondos recargados
- evitar ruido que compita con la data

---

## 9. Experiencia emocional

### Cuando el usuario entra
Debe sentir:
- expectativa
- cercanía
- orgullo
- competencia amistosa

### Cuando carga un pronóstico
Debe sentir:
- rapidez
- seguridad
- control

### Cuando ve el ranking
Debe sentir:
- tensión linda
- motivación por subir
- claridad absoluta

### Cuando acierta
Debe sentirse recompensado, sin caer en estridencia.

---

## 10. Copy y tono

### Tono general
- cercano
- futbolero
- optimista
- claro
- social

### No usar
- tono frío corporativo
- tono técnico innecesario
- lenguaje de apuestas agresivo

### Ejemplos de microcopy
- **Cargá tu pronóstico**
- **Todavía estás a tiempo**
- **Tu grupo te espera**
- **Subiste un puesto**
- **Acertaste el resultado exacto**
- **Partido cerrado**
- **Invitá a tu banda**

---

## 11. Accesibilidad

- contraste alto entre texto y fondo
- botones grandes y claros
- labels visibles
- feedback textual además de color
- componentes táctiles cómodos en mobile

---

## 12. Pantallas prioritarias

### Nivel 1
- landing
- login
- registro
- home autenticada
- grupo
- fixture
- carga de pronóstico
- ranking

### Nivel 2
- perfil
- reglas del grupo
- administración del grupo
- panel admin global

### Nivel 3
- actividad reciente
- comparativa entre usuarios
- logros / insignias

---

## 13. Reglas de consistencia

1. El ranking debe verse importante en toda la app.
2. Los estados del partido deben ser inequívocos.
3. Los CTAs principales deben repetirse con consistencia.
4. Las configuraciones complejas deben explicarse con lenguaje simple.
5. El sistema visual tiene que funcionar igual de bien en mobile y desktop.

---

## 14. Prompt corto de referencia para herramientas generativas

```text
Diseñar una app web llamada ElijoCreer, un Prode Mundial 2026 colaborativo y social inspirado visualmente en la Selección Argentina: celeste, blanco, azul profundo y acentos dorados sutiles. Debe sentirse moderna, premium, deportiva, emocional y fácil de usar, como una mezcla entre app social, fantasy sports y dashboard elegante. Priorizar ranking, pronósticos, grupos y claridad de información.
```
