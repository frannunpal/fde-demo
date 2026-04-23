# ACTION_PLAN.md — Tests para Drag & Drop

## Resumen

4 archivos nuevos sin tests unitarios + 0 tests E2E/visuales para drag & drop existentes.

---

## I. Tests Unitarios

### 1. `useFileOperations.test.ts`

**Ubicación:** `packages/core/src/hooks/useFileOperations.test.ts`

**Tests:**

- `findExistingNode` retorna el nodo correcto cuando existe
- `findExistingNode` retorna undefined cuando no existe
- `moveNode` mueve un archivo exitosamente
- `moveNode` muestra replaceConfirm cuando archivo duplicado existe
- `copyNode` copia un archivo exitosamente
- `copyNode` muestra replaceConfirm cuando archivo duplicado existe
- `handleReplaceConfirm(true)` ejecuta el reemplazo
- `handleReplaceConfirm(false)` cancela sin reemplazar
- `hideReplaceConfirm` limpia el estado de confirmación

**Patrón:** Mock de `useDesktopStore` con `fsNodes`, `setFsNodes`, `syncIcons`, `addNotification`

### 2. `DropFileMenu.test.tsx`

**Ubicación:** `packages/core/src/components/Shared/DropFileMenu/DropFileMenu.test.tsx`

**Tests:**

- Renderiza menú con `opened=true` y muestra nombre del archivo
- Muestra sourcePath y targetPath
- Llama `handleMove` al hacer click en "Move here"
- Llama `handleCopy` al hacer click en "Copy here"
- Llama `onClose` al hacer click en "Cancel"
- No renderiza nada si `sourceNode` es null
- Muestra modal de reemplazo cuando `replaceConfirm.opened=true`
- Limpia `replaceConfirm` al cerrar

**Patrón:** Mock de `useFileOperations`, `useTranslation`, Mantine Provider wrapper.
**Añadir data-testid:** `drop-file-menu`, `drop-file-menu-move`, `drop-file-menu-copy`, `drop-file-menu-cancel`, `drop-file-menu-label`, `replace-file-modal`

### 3. `useDroppableArea.test.ts`

**Ubicación:** `packages/core/src/hooks/useDragDrop/useDroppableArea.test.ts`

**Tests:**

- Retorna `setNodeRef`, `isOver`, `active`
- Llama `useDroppable` con el ID y data correctos
- Propaga `disabled` a `useDroppable`

**Patrón:** Similar a `useWindowDropZone.test.ts` — mock `@dnd-kit/core`

### 4. `useDraggableItem.test.ts`

**Ubicación:** `packages/core/src/hooks/useDragDrop/useDraggableItem.test.ts`

**Tests:**

- Retorna `attributes`, `listeners`, `setNodeRef`, `isDragging`, `transform`, `style`
- Llama `useDraggable` con el ID compuesto correcto
- `style` tiene `opacity: 0` cuando `isDragging`
- `style` tiene `cursor: 'grab'` cuando no está disabled
- `style` tiene `cursor: 'default'` cuando está disabled
- `disabled` se propaga correctamente

**Patrón:** Mock `@dnd-kit/core` y `DragDropStateContext`

### 5. Actualizar `DragDropStateContext.test.tsx`

- Añadir test para verificar que la posición se trackea durante el drag
- Añadir test para verificar que `onDrop` recibe la posición correcta

### 6. Actualizar `buildPath.test.ts`

**Ubicación:** `packages/core/src/utils/buildBreadcrumbs.test.ts`

**Tests:**

- `buildPath(null, nodes)` retorna `/home`
- `buildPath('folder-1', nodes)` retorna `/home/Documents`
- `buildPath` con carpeta anidada retorna la ruta completa

---

## II. Añadir `data-testid` a Componentes

| Componente                 | Atributos a añadir                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DropFileMenu.tsx`         | `data-testid="drop-file-menu"`, `data-testid="drop-file-menu-move"`, `data-testid="drop-file-menu-copy"`, `data-testid="drop-file-menu-cancel"`, `data-testid="replace-file-modal"` |
| `WindowDropOverlay.tsx`    | `data-testid="window-drop-overlay"` (overlay compatible), `data-testid="window-drop-overlay-incompatible"` (overlay incompatible)                                                   |
| `DragOverlayComponent.tsx` | `data-testid="drag-overlay"`                                                                                                                                                        |

---

## III. Tests E2E con Playwright

### 7. `tests/e2e/drag-drop.e2e.spec.ts`

**Tests:**

- Arrastrar archivo desde Desktop a ventana de Files
- Arrastrar archivo incompatible a ventana muestra overlay incompatible
- Arrastrar archivo a Desktop muestra menú de mover/copiar
- Arrastrar archivo desde FilesApp a carpeta en el sidebar

**Patrón:** Usar helpers existentes (`closeDefaultWelcomeWindow`, `openAppFromLauncher`), `page.locator('[data-testid="..."]')` para selectores, Playwright drag API (`page.locator().dragTo()`)

---

## IV. Tests Visuales con Playwright

### 8. `tests/visual/desktop/drag-drop.visual.spec.ts`

**Tests:**

- Screenshot del overlay compatible en ventana
- Screenshot del overlay incompatible en ventana
- Screenshot del DragOverlay arrastrando un archivo
- Screenshot del DropFileMenu en Desktop

---

## V. Checklist DoD

- [ ] Tests unitarios para `useFileOperations`
- [ ] Tests unitarios para `DropFileMenu`
- [ ] Tests unitarios para `useDroppableArea`
- [ ] Tests unitarios para `useDraggableItem`
- [ ] Actualizar tests de `DragDropStateContext`
- [ ] Tests unitarios para `buildPath`
- [ ] Actualizar tests de `WindowDropOverlay` para nuevos atributos
- [ ] Añadir `data-testid` a `DropFileMenu`, `WindowDropOverlay`, `DragOverlayComponent`
- [ ] Crear test E2E `drag-drop.e2e.spec.ts`
- [ ] Crear test visual `drag-drop.visual.spec.ts`
- [ ] Verificar typecheck pasa
- [ ] Verificar todos los tests pasan
