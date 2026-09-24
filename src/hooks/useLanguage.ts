import { useContext } from 'react';
import { LanguageContext } from '../i18n/LanguageProvider';

/** `const { language, setLanguage, t } = useLanguage();` */
export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage() must be used inside <LanguageProvider>.');
  return value;
}
