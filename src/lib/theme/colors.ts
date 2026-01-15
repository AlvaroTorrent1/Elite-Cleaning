/**
 * Elite Cleaning - Sistema de Colores Centralizado
 * 
 * Paleta corporativa:
 * - Blanco como color base principal
 * - Rosa malva (#D4A5B3) como color primario/acento
 * - Lila (#8B7BA8) como color secundario
 * 
 * USO: Importar este archivo para mantener consistencia visual
 */

// Colores corporativos principales
export const brandColors = {
  // Rosa malva - Color primario corporativo
  primary: {
    50: '#FDF2F5',
    100: '#FCE7ED',
    200: '#F9D0DC',
    300: '#F4A9C0',
    400: '#E88BA6',
    500: '#D4A5B3', // Color principal
    600: '#C48A9B',
    700: '#A66B7C',
    800: '#8A5666',
    900: '#734856',
  },
  // Lila - Color secundario
  secondary: {
    50: '#F5F3F8',
    100: '#EBE7F1',
    200: '#D7CFE3',
    300: '#BDB0CF',
    400: '#A393BB',
    500: '#8B7BA8', // Color principal
    600: '#756693',
    700: '#61547A',
    800: '#504564',
    900: '#433952',
  },
} as const

// Estados semánticos (mantenemos para casos específicos como errores)
export const semanticColors = {
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#059669',
    text: '#065F46',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
    text: '#92400E',
  },
  danger: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
    text: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#2563EB',
    text: '#1E40AF',
  },
} as const

// Grises neutros
export const neutralColors = {
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  black: '#000000',
} as const

/**
 * PALETA DE ICONOS
 * 
 * Usamos variaciones de rosa y lila para mantener coherencia visual.
 * Cada variante tiene un color de icono y un color de fondo.
 * 
 * Uso en componentes:
 * - iconColors.primary para iconos principales
 * - iconColors.secondary para iconos secundarios
 * - iconColors.accent1-5 para diferenciar categorías
 */
export const iconColors = {
  // Rosa principal - para acciones primarias, métricas importantes
  primary: {
    icon: 'text-primary',
    bg: 'bg-primary/10',
    iconHex: '#D4A5B3',
    bgHex: '#FDF2F5',
  },
  // Lila - para acciones secundarias
  secondary: {
    icon: 'text-secondary',
    bg: 'bg-secondary/10',
    iconHex: '#8B7BA8',
    bgHex: '#F5F3F8',
  },
  // Rosa oscuro - para énfasis
  accent1: {
    icon: 'text-primary-dark',     // Rosa oscuro
    bg: 'bg-primary-dark/10',
    tailwind: { icon: 'text-[#A66B7C]', bg: 'bg-[#A66B7C]/10' },
  },
  // Lila claro - para items secundarios
  accent2: {
    icon: 'text-secondary-light',  // Lila claro
    bg: 'bg-secondary-light/10',
    tailwind: { icon: 'text-[#A393BB]', bg: 'bg-[#A393BB]/10' },
  },
  // Rosa suave - para estados positivos (reemplaza verde)
  accent3: {
    icon: 'text-[#E88BA6]',
    bg: 'bg-[#E88BA6]/10',
  },
  // Lila profundo - para estados de alerta suave (reemplaza amarillo)
  accent4: {
    icon: 'text-[#756693]',
    bg: 'bg-[#756693]/10',
  },
  // Rosa intenso - para alertas importantes (reemplaza rojo en contextos no-error)
  accent5: {
    icon: 'text-[#C48A9B]',
    bg: 'bg-[#C48A9B]/10',
  },
  // Gris neutro - para iconos deshabilitados o informativos
  muted: {
    icon: 'text-muted-foreground',
    bg: 'bg-muted',
  },
} as const

/**
 * VARIANTES DE ICONOS PARA STAT CARDS
 * 
 * Define combinaciones predefinidas para usar en StatCard y otros componentes
 * que muestran iconos con fondos.
 */
export const statIconVariants = {
  // Variantes principales (rosa/lila)
  default: { icon: 'text-primary', bg: 'bg-primary/10' },
  primary: { icon: 'text-primary', bg: 'bg-primary/10' },
  secondary: { icon: 'text-secondary', bg: 'bg-secondary/10' },
  
  // Variantes de acento (gama rosa-lila)
  accent1: { icon: 'text-[#A66B7C]', bg: 'bg-[#A66B7C]/10' },  // Rosa oscuro
  accent2: { icon: 'text-[#A393BB]', bg: 'bg-[#A393BB]/10' },  // Lila claro
  accent3: { icon: 'text-[#E88BA6]', bg: 'bg-[#E88BA6]/10' },  // Rosa suave
  accent4: { icon: 'text-[#756693]', bg: 'bg-[#756693]/10' },  // Lila profundo
  accent5: { icon: 'text-[#C48A9B]', bg: 'bg-[#C48A9B]/10' },  // Rosa intenso
  
  // Gris neutro
  muted: { icon: 'text-muted-foreground', bg: 'bg-muted' },
  
  // Solo para estados críticos (errores reales, no métricas)
  danger: { icon: 'text-destructive', bg: 'bg-destructive/10' },
} as const

// Clases de Tailwind mapeadas al tema
export const themeClasses = {
  // Backgrounds
  bg: {
    primary: 'bg-primary',
    primaryHover: 'hover:bg-primary/90',
    primaryLight: 'bg-primary/10',
    secondary: 'bg-secondary',
    secondaryHover: 'hover:bg-secondary/90',
    secondaryLight: 'bg-secondary/10',
    muted: 'bg-muted',
    card: 'bg-card',
    background: 'bg-background',
  },
  // Texto
  text: {
    primary: 'text-primary',
    primaryForeground: 'text-primary-foreground',
    secondary: 'text-secondary',
    secondaryForeground: 'text-secondary-foreground',
    muted: 'text-muted-foreground',
    foreground: 'text-foreground',
  },
  // Bordes
  border: {
    default: 'border-border',
    primary: 'border-primary',
    secondary: 'border-secondary',
  },
  // Focus rings
  ring: {
    primary: 'ring-primary focus:ring-primary',
    secondary: 'ring-secondary focus:ring-secondary',
  },
  // Iconos (para uso directo)
  icon: statIconVariants,
} as const

// Variantes de componentes usando el tema
export const componentVariants = {
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary',
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    ghost: 'text-foreground hover:bg-muted focus:ring-primary',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
  },
  badge: {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    success: 'bg-primary/10 text-primary border-primary/20',  // Usamos rosa en lugar de verde
    warning: 'bg-secondary/10 text-secondary border-secondary/20',  // Usamos lila en lugar de amarillo
    danger: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-secondary/10 text-secondary border-secondary/20',
    muted: 'bg-muted text-muted-foreground border-border',
  },
  card: {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    secondary: 'bg-secondary/5 border-secondary/20',
  },
  input: {
    default: 'border-input bg-background focus:ring-primary focus:border-primary',
  },
} as const

export type BrandColor = keyof typeof brandColors
export type SemanticColor = keyof typeof semanticColors
export type IconVariant = keyof typeof statIconVariants
