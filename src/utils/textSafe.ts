const replacements: Array<[RegExp, string]> = [
  [/\bSacred\b/gi, 'Revered'],
  [/\bsacred\b/gi, 'revered'],
];

export const sanitizeCopy = (text: string): string => {
  if (!text) return text;
  return replacements.reduce((acc, [regex, value]) => acc.replace(regex, value), text);
};
