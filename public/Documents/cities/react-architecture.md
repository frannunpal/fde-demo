# `@fde-desktop/cities` — React Architecture

Cómo usar la librería desde React: desde el caso más simple hasta el control total.

---

## Niveles de uso

| Nivel | Qué importas | Cuándo usarlo |
|---|---|---|
| **Plug & play** | `registerCitiesApp()` | Quieres la app en el desktop sin pensar |
| **App con seed** | `registerCitiesApp()` + `useOpenApp()` | Abres la app pasando un nombre de ciudad |
| **Componentes sueltos** | `CityMap`, `BuildingViewer`, `BuildingTooltip` | Embedes el visor en tu propia UI |
| **Generación directa** | `CityGenerator`, `AttributeRegistry` | Generas datos sin UI, o con tu propia UI |
| **Control total** | `RuleEngine`, `Grammar`, `CGAShapeGenerator` | Gramática personalizada, reglas propias |

---

## Nivel 1 — Plug & play

La forma más rápida. La app aparece en el launcher del desktop.

```tsx
// App.tsx
import { FdeDesktop } from '@fde-desktop/fde-core';
import { registerCitiesApp } from '@fde-desktop/cities';

registerCitiesApp();  // una sola vez, fuera del componente

export function App() {
  return <FdeDesktop />;
}
```

El usuario abre "Cities" desde el launcher. La ciudad se genera con seed `'default-city'`.

---

## Nivel 2 — Abrir la app con un nombre de ciudad

```tsx
import { useOpenApp } from '@fde-desktop/fde-core';
import { registerCitiesApp } from '@fde-desktop/cities';

registerCitiesApp();

function MyButton() {
  const openApp = useOpenApp();

  return (
    <button onClick={() => openApp('cities', { contentData: { seed: 'Madrid' } })}>
      Explorar Madrid
    </button>
  );
}
```

Mismo nombre → misma ciudad siempre. Funciona con cualquier string o número.

---

## Nivel 3 — Opciones de registro

`registerCitiesApp` acepta opciones para personalizar cómo aparece en el desktop:

```tsx
registerCitiesApp({
  appId: 'cities',           // ID para useOpenApp — default: 'cities'
  appName: 'City Explorer',  // nombre en el launcher — default: 'Cities'
  fcIcon: 'FcGlobe',         // icono — default: 'FcGlobe'
  defaultWidth: 1100,
  defaultHeight: 700,
});
```

Para registrar varias instancias con distintas ciudades por defecto:

```tsx
registerCitiesApp({ appId: 'cities-madrid', appName: 'Madrid' });
registerCitiesApp({ appId: 'cities-tokyo',  appName: 'Tokyo' });

// Abrir directamente:
openApp('cities-madrid', { contentData: { seed: 'Madrid' } });
```

---

## Nivel 4 — Componentes sueltos

Si quieres integrar el visor en tu propia app sin usar `CitiesApp`, importa los componentes directamente.

### `CityMap`

Canvas 2D con todos los footprints de una ciudad. Hover y click.

```tsx
import { CityMap, CityGenerator, CityEventEmitter, AttributeRegistry, PREDEFINED_SCHEMAS } from '@fde-desktop/cities';

function MyCityView() {
  const [city, setCity] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const generator = new CityGenerator(
      new AttributeRegistry(PREDEFINED_SCHEMAS),
      new CityEventEmitter(),
    );
    const result = generator.generate({
      seed: 'Barcelona',
      lots: [
        { x: 0,  z: 0,  width: 20, depth: 30 },
        { x: 25, z: 0,  width: 15, depth: 20 },
        { x: 0,  z: 35, width: 30, depth: 25 },
      ],
    });
    setCity(result);
  }, []);

  if (!city) return <div>Generando...</div>;

  return (
    <CityMap
      buildings={city.buildings}
      width={800}
      height={600}
      onBuildingHover={b => console.log('hover', b?.id)}
      onBuildingClick={setSelected}
    />
  );
}
```

### `BuildingViewer`

Muestra un edificio en 2D (siempre) o 3D (si `three` está disponible como peer dep).

```tsx
import { BuildingViewer } from '@fde-desktop/cities';

function MyBuildingPanel({ building, mesh }) {
  return (
    <div style={{ width: 400, height: 400 }}>
      <BuildingViewer
        building={building}
        mesh={mesh}              // opcional — si no se pasa, usa siempre 2D
        onHover={b => console.log(b?.id)}
        onClick={b => console.log('clicked', b.id)}
      />
    </div>
  );
}
```

`BuildingViewer` detecta automáticamente si `three` está disponible. Si no, usa `BuildingViewer2D`. No hay nada que configurar.

### `BuildingTooltip`

Muestra la geometría y los metadatos de un edificio.

```tsx
import { BuildingTooltip, AttributeRegistry, PREDEFINED_SCHEMAS } from '@fde-desktop/cities';

const registry = new AttributeRegistry(PREDEFINED_SCHEMAS);

function MyTooltip({ building }) {
  return <BuildingTooltip building={building} registry={registry} />;
}
```

---

## Nivel 5 — Generación directa

Sin UI. Genera datos de ciudad y úsalos como quieras.

```tsx
import {
  CityGenerator, CityEventEmitter,
  AttributeRegistry, PREDEFINED_SCHEMAS,
  LoDLevel,
} from '@fde-desktop/cities';

// Fuera del componente — el generator es stateless respecto a React
const registry = new AttributeRegistry(PREDEFINED_SCHEMAS);
const events = new CityEventEmitter();
const generator = new CityGenerator(registry, events);

function useCityData(cityName: string, lod = LoDLevel.MEDIUM) {
  return useMemo(() => {
    return generator.generate({
      seed: cityName,
      lod,
      lots: [
        { x: 0,  z: 0,  width: 20, depth: 30, styleProfileId: 'suburban' },
        { x: 25, z: 0,  width: 25, depth: 25, styleProfileId: 'downtown' },
      ],
    });
  }, [cityName, lod]);
}

function CityStats({ cityName }: { cityName: string }) {
  const city = useCityData(cityName);

  return (
    <ul>
      {city.buildings.map(b => (
        <li key={b.id}>
          {b.type} — {b.geometry.stories} plantas — {b.metadata.residents as number} residentes
        </li>
      ))}
    </ul>
  );
}
```

**Nota:** `generator.generate` es síncrono y determinista. Misma `cityName` → mismo resultado siempre. Puedes llamarlo directamente en `useMemo` sin preocuparte por efectos secundarios.

---

## Nivel 6 — Atributos personalizados

Añade tus propios atributos a los edificios. Útil para datos de dominio específicos de tu app.

```tsx
import {
  AttributeRegistry, AttributeGenerators,
  PREDEFINED_SCHEMAS,
} from '@fde-desktop/cities';

// Define tu schema
const CUSTOM_SCHEMAS = [
  ...PREDEFINED_SCHEMAS,
  {
    id: 'securityLevel',
    type: 'number' as const,
    displayName: 'Security Level',
    category: 'custom' as const,
    generator: AttributeGenerators.numberRange(1, 5),
  },
  {
    id: 'hasParking',
    type: 'boolean' as const,
    displayName: 'Has Parking',
    category: 'custom' as const,
    generator: AttributeGenerators.boolean(0.6),
  },
  {
    id: 'buildingCode',
    type: 'string' as const,
    displayName: 'Building Code',
    category: 'technical' as const,
    generator: AttributeGenerators.fromList(['A1', 'A2', 'B1', 'B2', 'C1']),
  },
];

// Inyecta el registry en el generator
const registry = new AttributeRegistry(CUSTOM_SCHEMAS);
const generator = new CityGenerator(registry, new CityEventEmitter());

const city = generator.generate({ seed: 'Madrid', lots: [...] });

// Acceder a los atributos:
city.buildings.forEach(b => {
  console.log(b.metadata.securityLevel);  // 1–5, determinista
  console.log(b.metadata.hasParking);     // boolean
  console.log(b.metadata.buildingCode);   // 'A1' | 'A2' | ...
});
```

**Por qué es determinista:** El generador de cada atributo recibe la seed compuesta `"Madrid-{buildingId}-securityLevel"`. Misma ciudad, mismo edificio, mismo atributo → mismo valor siempre, aunque añadas más atributos o cambies el orden.

---

## Nivel 7 — Escuchar eventos de generación

Útil para mostrar progreso o reaccionar a cada edificio según se genera.

```tsx
import { CityEventEmitter, CityGenerator, AttributeRegistry, PREDEFINED_SCHEMAS } from '@fde-desktop/cities';

function useCityWithProgress(seed: string) {
  const [buildings, setBuildings] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const events = new CityEventEmitter();
    const registry = new AttributeRegistry(PREDEFINED_SCHEMAS);
    const generator = new CityGenerator(registry, events);
    const lots = [...]; // define tus lotes

    // Suscribirse antes de generar
    const unsubBuilding = events.on('building:generated', building => {
      setBuildings(prev => [...prev, building]);
      setProgress(prev => prev + (1 / lots.length));
    });

    const unsubComplete = events.on('city:generation-complete', ({ buildings }) => {
      setBuildings(buildings);
      setProgress(1);
    });

    generator.generate({ seed, lots });

    return () => {
      unsubBuilding();
      unsubComplete();
    };
  }, [seed]);

  return { buildings, progress };
}
```

---

## Nivel 8 — LoD dinámico con cámara 3D

Para escenas Three.js donde el LoD cambia según la distancia.

```tsx
import { useLoD, BuildingViewer, LoDLevel } from '@fde-desktop/cities';
import { useThree } from '@react-three/fiber';

function AdaptiveBuilding({ building, mesh, position }) {
  const { camera } = useThree();
  const [camPos, setCamPos] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    setCamPos({ x: camera.position.x, y: camera.position.y, z: camera.position.z });
  });

  const lod = useLoD(camPos, position);

  // En producción: regenerar mesh al cambiar lod, o tener meshes pre-computados por nivel
  return <BuildingViewer building={building} mesh={mesh} />;
}
```

---

## Patrones a evitar

**No instanciar `CityGenerator` dentro del render:**

```tsx
// ❌ Mal — nueva instancia en cada render
function Bad() {
  const city = new CityGenerator(...).generate({ seed: 'Madrid', lots: [...] });
}

// ✅ Bien — instancia estable, resultado memoizado
const generator = new CityGenerator(registry, events);

function Good() {
  const city = useMemo(() => generator.generate({ seed: 'Madrid', lots: [...] }), []);
}
```

**No llamar `registerCitiesApp` dentro de un componente:**

```tsx
// ❌ Mal — se re-registra en cada render
function Bad() {
  registerCitiesApp();  // dentro del componente
  return <FdeDesktop />;
}

// ✅ Bien — fuera del componente, una sola vez
registerCitiesApp();

function Good() {
  return <FdeDesktop />;
}
```

**No compartir `CityEventEmitter` entre generaciones distintas:**

```tsx
// ❌ Mal — listeners de la generación anterior se acumulan
const events = new CityEventEmitter();
events.on('building:generated', cb1);
events.on('building:generated', cb2);  // ahora hay dos listeners

// ✅ Bien — nueva instancia por generación, o limpiar antes
const events = new CityEventEmitter();
const unsub = events.on('building:generated', cb);
generator.generate(...);
unsub();  // limpiar después
```

---

## Árbol de dependencias entre paquetes

```
Tu proyecto
├── @fde-desktop/fde-core    (peer)
└── @fde-desktop/cities      (dep)
    ├── @fde-desktop/fde-core  (peer — misma instancia que la tuya)
    ├── react                  (peer)
    ├── three                  (peer, optional)
    ├── @react-three/fiber     (peer, optional)
    └── @react-three/drei      (peer, optional)
```

`@fde-desktop/fde-core` es peer en cities para garantizar una única instancia del registry en memoria. Si fuera dependency directa, `registerCitiesApp()` escribiría en un registry distinto al que `<FdeDesktop />` lee, y la app no aparecería.
