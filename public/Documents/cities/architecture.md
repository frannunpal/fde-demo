# `packages/cities` — Architecture Notes

> Notas de arquitectura y diseño. Para el plan de implementación paso a paso ver [`action_plan.md`](../../action_plan.md).

---

## 1. Conceptos CGA Shape → TypeScript

Mapeo directo del paper *"Procedural Modeling of Buildings"* (Müller et al., 2006) a las abstracciones TypeScript de esta librería.

### 1.1 Conceptos del paper

| Paper | TypeScript | Descripción |
|---|---|---|
| **Shape** | `Shape` interface | `{ id, symbol, scope, active, isTerminal, meshData? }` |
| **Scope (OBB)** | `Scope3D` | Oriented Bounding Box: origin P + ejes X/Y/Z + tamaño S. No es un AABB. |
| **Production Rule** | `RuleDefinition` | `{ id, priority, predecessor, condition?, probability?, actions[] }` |
| **Subdiv split** | `RuleAction { type: 'subdiv' }` | Divide scope por eje. Soporta valores absolutos y relativos (`r`). |
| **Repeat split** | `RuleAction { type: 'repeat' }` | Tila un elemento. `repetitions = ⌈scope.size / tileSize⌉` |
| **Comp split** | `RuleAction { type: 'comp' }` | Extrae faces/edges/vertices como scopes 2D alineados a sus normales. |
| **I(objId)** | `RuleAction { type: 'instance' }` | Terminal: inserta geometría (cube, quad, cylinder, archivo .obj). |
| **T/R/S** | `RuleAction { type: 'translate' / 'rotate' / 'scale' }` | Transformaciones de scope. |
| **`[` / `]`** | `RuleAction { type: 'push' / 'pop' }` | Stack de scopes para ramificación L-system. |
| **Snap** | `RuleAction { type: 'snap' }` | Snapping a planos de construcción dominantes. Modifica splits `XS/YS/ZS`. |
| **Roof(type, angle)** | `RuleAction { type: 'roof' }` | Genera geometría de tejado a partir del footprint. |
| **Occlusion query** | `RuleCondition { type: 'occ' }` | Pregunta al Octree si el scope está ocluido (none/part/full). |
| **Shape.visible** | `RuleCondition { type: 'visible' }` | Comprueba visibilidad desde calle (via CityGraph). |
| **Derivation tree** | `DerivationNode` | Shapes marcados como inactive (no eliminados) para queries históricas. |
| **Priority derivation** | `RuleEngine.derive()` | Breadth-first por prioridad: se procesa primero el shape con regla de mayor prioridad. |
| **Non-terminal (V)** | `shape.isTerminal = false` | Sujeto a más reglas. |
| **Terminal (Σ)** | `shape.isTerminal = true` | Se renderiza; no se reemplaza más. |

### 1.2 Conceptos adicionales (no en el paper)

| Concepto | Implementación | Motivación |
|---|---|---|
| **String seed** | `SeededRandom(cityName: string)` | Mismo nombre de ciudad → mismos datos siempre. Hash MurmurHash3-inspired a uint32. |
| **CityGraph** | `CityGraph` | Grafo urbano: nodos (building/street/lot/park) + aristas (adjacent/fronts/contains). Necesario para `Shape.visible("street")`. |
| **StyleProfile** | `StyleProfile` | Parámetros regionales: rangos de altura, materiales con pesos, tipos de tejado con pesos. |
| **LoDLevel** | `LoDLevel` enum | LOW/MEDIUM/HIGH controla qué se genera (windows, doors, metadata, polígonos máximos). |
| **AttributeRegistry** | Injectable class (no singleton) | Atributos extensibles por instancia: residents, ipAddress, buildingManager, custom. `attributeId` incluido en la seed para determinismo per-atributo. |
| **MeshData / BuildingMesh** | `{ vertices, normals, uvs, indices, materialId }` | Salida de la gramática lista para `THREE.BufferGeometry`. |
| **RoofGenerator** | Straight skeleton simplificado | Geometría real para gabled/hipped/mansard desde footprint. Convex-only en MVP. |
| **CityEventEmitter** | Typed event emitter | `building:generated`, `city:generation-complete`, `rule:applied`, etc. No singleton. |
| **DerivationInspector** | Toggle on/off | Registra `RuleApplication` para debugging sin overhead en producción. |
| **BuildingViewer** | Wrapper lazy 2D/3D | Three.js como peer dep opcional. Detecta disponibilidad en runtime. Fallback a Canvas 2D. |

---

## 2. Decisiones de diseño

### 2.1 Por qué Scope3D y no AABB

El paper define scope como un Oriented Bounding Box (OBB): un origen P más tres vectores unitarios ortogonales X/Y/Z más un tamaño S. Esto es fundamental para:

- Tejados en ángulo (no alineados con ejes mundo)
- Torre Petronas del paper: cubo rotado 45°
- `Comp("faces")` extrae scopes 2D alineados a las normales de cada cara — imposible con AABB

### 2.2 Por qué shapes nunca se eliminan

El paper lo explicita: shapes reemplazados se marcan como **inactive**, nunca se borran. Esto es necesario para:
- Occlusion queries contra shapes padre (`"noparent"` subset)
- Queries contra shapes activos vs. toda la historia (`"active"` vs. `"all"`)
- El derivation tree para debugging

### 2.3 Por qué priority-based y no depth-first

El paper justifica la derivación breadth-first por prioridad: garantiza que el modelo evoluciona de low detail a high detail de forma controlada. Depth-first generaría detalles finos en una esquina antes de tener la masa del edificio completa.

### 2.4 Por qué AttributeRegistry injectable (no singleton)

Dos instancias del componente con distintas ciudades deben poder tener distintos registros de atributos. Un singleton compartido haría imposible esto. El patrón injectable también facilita el testing (registro vacío o con mocks).

### 2.5 Por qué `seed: string | number` en todo el sistema

El seed como string (nombre de ciudad) fluye desde `GenerationParams` hasta cada `SeededRandom` de cada atributo. La seed de cada atributo es compuesta: `"${cityName}-${buildingId}-${attributeId}"`. Esto garantiza:
- Misma ciudad → mismos edificios
- Mismo edificio → mismo IP, mismo manager
- Distintos atributos del mismo edificio → valores independientes entre sí

### 2.6 Por qué straight skeleton solo convex en MVP

El algoritmo completo de Aichholzer/Eppstein para straight skeleton de polígonos cóncavos es O(n log n) y no trivial. Para el MVP, los footprints rectangulares (lotes simples) son convexos. La implementación completa se planifica para Phase 5.

---

## 3. Estructura de capas

```
packages/cities/src/

Domain (pura lógica, sin React, sin Three.js, sin I/O)
├── domain/
│   ├── geometry/       Scope3D, MeshData — tipos geométricos puros
│   ├── entities/       Building, Floor, Room, Window, Door, Footprint, CityGraph, StyleProfile, LoDLevel
│   ├── attributes/     AttributeSchema, AttributeRegistry, AttributeGenerators, PREDEFINED_SCHEMAS
│   ├── rules/          Grammar, RuleDefinition, RuleAction, RuleCondition, RuleEngine
│   ├── events/         CityEventEmitter, EventTypes
│   └── serialization/  CitySerializer, CityDeserializer, SchemaMigration

Application (puertos — interfaces que el dominio expone hacia afuera)
├── application/
│   ├── interfaces/     IBuildingGenerator, ICityGenerator, ISnapLineProvider, IStyleProvider
│   └── services/       RuleCompiler, DerivationTree, DerivationInspector, GenerationParams

Infrastructure (adaptadores — implementaciones concretas de los puertos)
├── infrastructure/
│   ├── adapters/       CGAShapeGenerator, OcclusionQuery, SnapLineEngine, RoofGenerator
│   └── primitives/     Vector3, Polygon, Octree, SeededRandom  ← solo aquí

Presentation (React, opcional Three.js)
└── presentation/
    ├── components/     BuildingViewer (wrapper), BuildingViewer3DInner (R3F, lazy), BuildingViewer2D, BuildingTooltip, CityMap, RuleInspector
    ├── lod/            LoDManager, LoDStrategies
    └── hooks/          useBuildingInteractions, useCityData, useLoD
```

**Regla de dependencias (inward only):**
- `domain/` no importa nada de fuera del dominio
- `application/` importa de `domain/`
- `infrastructure/` importa de `application/` y `domain/`
- `presentation/` importa de `application/` y `domain/`; nunca de `infrastructure/` directamente

---

## 4. Flujo de generación completo

```
CityName ("Madrid")
    │
    ▼
SeededRandom("Madrid") → uint32 hash → Mulberry32 sequence
    │
    ▼
CGAShapeGenerator.generateCity({ seed: "Madrid", lots: [...], styleProfile })
    │
    ├─ Para cada lot:
    │   ├─ createBuilding(params, registry) → BuildingEntity (sin geometría aún)
    │   ├─ RuleEngine.derive([axiom]) → Shape[] terminales
    │   │   ├─ Prioridad 1: mass model (Subdiv/Repeat en X/Y/Z)
    │   │   ├─ Prioridad 2: facade (Comp("sidefaces") → 2D scopes)
    │   │   ├─ Prioridad 3: windows/doors (Repeat + occlusion check)
    │   │   └─ Prioridad 4: roof (RoofGenerator → MeshData)
    │   └─ BuildingMesh { meshes: MeshData[] }
    │
    ├─ CityGraph.addNode/addEdge para cada building + street
    ├─ AttributeRegistry.generateAttributes para cada building
    └─ CityEventEmitter.emit('city:generation-complete', result)
    │
    ▼
{ buildings: BuildingEntity[], graph: CityGraph, meshes: Map<buildingId, BuildingMesh> }
    │
    ▼
Presentation:
├─ CityMap (Canvas 2D) — footprints con hover/click
└─ BuildingViewer → detecta 'three' → BuildingViewer3DInner (R3F) | BuildingViewer2D
```

---

## 5. Contrato de la gramática CGA Shape (resumen ejecutivo)

Un **Shape** es: `{ id, symbol, scope: Scope3D, active: boolean, isTerminal: boolean, meshData?: MeshData[] }`

Una **RuleDefinition** es: `{ id, priority, predecessor, condition?, probability?, actions: RuleAction[] }`

Una **RuleAction** puede ser:
- `subdiv` — divide el scope por eje con tamaños absolutos o relativos (`r`)
- `repeat` — tila a lo largo de un eje; `repetitions = ⌈size/tileSize⌉`
- `comp` — extrae faces/edges/vertices como scopes 2D alineados
- `instance` — inserta mesh terminal (cube, quad, cylinder, archivo)
- `translate / rotate / scale` — transforma el scope actual
- `push / pop` — stack de scopes
- `snap` — snapping a planos de construcción globales
- `roof` — genera geometría de tejado y crea shape hijo
- `terminal` — marca el shape como terminal (no más reglas)

Una **RuleCondition** puede ser:
- `occ` — occlusion query (none/part/full) contra subset del octree
- `visible` — visibilidad de sightline hacia street/target
- `param-compare` — guarda sobre parámetro numérico (`h > 9`)
- `scope-size` — guarda sobre dimensión del scope (`scope.y > 3`)

El **RuleEngine** ejecuta en bucle: selecciona el shape activo no-terminal cuya regla tiene mayor prioridad → evalúa condición → selecciona regla (stochastic) → aplica acciones → marca shape como inactive → añade sucesores. Termina cuando no quedan no-terminales activos o se alcanza `maxIterations`.

---

## 6. Notas de implementación pendientes

| Área | Nota |
|---|---|
| `extractFaceScopes()` | Debe alinear cada scope 2D a la normal de su cara. Para la cara frontal (−Z): axisX = scope.axisX, axisY = scope.axisY, axisZ = -scope.axisZ, size.z = 0. |
| Snapped splits (`XS/YS/ZS`) | Al encontrar snap planes en el scope, el split se divide en sub-splits antes y después de cada snap line. Para `subdiv` solo altera el split más cercano; para `repeat` divide el rango en partes. |
| Occlusion vs. scope occlusion | `Shape.occ` = OBB del shape completo. `Scope.occ` = solo el scope actual. La mayoría de casos usan `Shape.occ("noparent")`. |
| `straight skeleton` convex | Algoritmo simplificado: inset del polígono a velocidad constante hasta que aristas colisionan. Solo válido para footprints convexos. |
| `RoofType.gambrel` | No está en el enum actual — añadir antes de implementar `RoofGenerator`. El paper lo menciona en fig.7. |
| `BuildingViewer3DInner` | `mesh` prop viene pre-computado por `CGAShapeGenerator`. El componente no genera geometría, solo la renderiza. |
| Serialization de `seed` | `CitySerializer` debe guardar `seed` original (string o número), no el uint32 hasheado. `SerializedCity.seed: string \| number`. |
