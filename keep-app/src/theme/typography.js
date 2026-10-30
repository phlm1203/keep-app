export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

export const typography = {
  h1: { fontFamily: fonts.extrabold, fontSize: 28 },
  h2: { fontFamily: fonts.bold, fontSize: 22 },
  h3: { fontFamily: fonts.bold, fontSize: 18 },
  body: { fontFamily: fonts.regular, fontSize: 15 },
  bodySemibold: { fontFamily: fonts.semibold, fontSize: 15 },
  small: { fontFamily: fonts.regular, fontSize: 13 },
  smallSemibold: { fontFamily: fonts.semibold, fontSize: 13 },
  caption: { fontFamily: fonts.regular, fontSize: 11 },
  button: { fontFamily: fonts.bold, fontSize: 16 },
};

export default typography;
