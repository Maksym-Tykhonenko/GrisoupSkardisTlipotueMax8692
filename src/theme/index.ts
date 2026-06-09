export const palette = {
  night: '#120D08',
  nightDeep: '#0A0705',
  dune: '#1A120B',
  duneLight: '#261A11',
  gold: '#D9B45F',
  goldSoft: '#C49A4A',
  goldGlow: '#F6D27A',
  bronze: '#7B5C2E',
  cream: '#F5E9D2',
  sand: '#E3C98E',
  ink: '#0D0A07',
  mist: 'rgba(255,255,255,0.08)',
  mistStrong: 'rgba(255,255,255,0.16)',
  shadow: 'rgba(0,0,0,0.5)',
  shadowSoft: 'rgba(0,0,0,0.25)',
  glass: 'rgba(19,14,10,0.72)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.6,
  },
};

export const shadows = {
  soft: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  glow: {
    shadowColor: palette.goldGlow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const layout = {
  screenPadding: spacing.lg,
  cardGap: spacing.md,
  tabHeight: 78,
};
