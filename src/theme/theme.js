export const COLORS = {
  background: '#F5F5F5',
  surface: '#FAFAFA',
  card: '#FFFFFF',
  surfaceLight: 'rgba(0,0,0,0.08)',
  primary: '#C58B45',
  primaryDark: '#B67A35',
  secondary: '#666666',
  text: '#111111',
  textMuted: '#999999',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',
  glassBackground: 'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(0,0,0,0.08)'
};

export const SIZES = {
  padding: 20,
  radius: 20,
  radiusSm: 12,
  radiusLg: 30,
  fontSm: 12,
  fontMd: 15,
  fontLg: 18,
  fontXl: 26,
  fontXxl: 34
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: {
    shadowColor: '#C58B45', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  }
};

export const FONTS = {
  h1: { fontSize: SIZES.fontXxl, fontWeight: '800', letterSpacing: 0.5 },
  h2: { fontSize: SIZES.fontXl, fontWeight: '700', letterSpacing: 0.3 },
  h3: { fontSize: SIZES.fontLg, fontWeight: '600', letterSpacing: 0.2 },
  body: { fontSize: SIZES.fontMd, fontWeight: '400', letterSpacing: 0.1 },
  bodySm: { fontSize: SIZES.fontSm, fontWeight: '400' },
};
