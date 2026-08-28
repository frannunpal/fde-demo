/* eslint-disable @typescript-eslint/no-explicit-any */
// Ambient declarations for cross-package path aliases.
// These modules are resolved at runtime by Vite's bundler alias resolution,
// but are outside the root tsconfig.app.json include scope for type-checking.
// Each package is fully type-checked by its own tsconfig independently.

declare module '@fde-desktop/cities/Integration/CitiesApp' {
  export const CitiesApp: any;
}

declare module '@fde-desktop/cities/Integration/CitiesAppMenuBar' {
  export const CitiesAppMenuBar: any;
}

declare module '@fde-desktop/cities/Presentation/Components/CitiesTheatre' {
  export const CitiesTheatreApp: any;
}

declare module '@fde-desktop/cities/Presentation/Apps/FilterPanel' {
  export const FilterPanelApp: any;
}

declare module '@fde-desktop/ink' {
  export const InkChatApp: any;
}

declare module '@fde-desktop/hvac/Integration/HvacApp' {
  export const HvacApp: any;
}

declare module '@fde-desktop/hvac/Integration/HvacTheatreApp' {
  export const HvacTheatreApp: any;
}

declare module '@fde-desktop/hvac/Presentation/Components/HvacApp' {
  export const HvacApp: any;
}

declare module '@fde-desktop/hvac/Presentation/Components/HvacTheatreApp' {
  export const HvacTheatreApp: any;
}
