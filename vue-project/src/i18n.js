import { createI18n } from 'vue-i18n'
import en from './locales/en'
import km from './locales/km'

const supportedLocales = ['en', 'km']
const savedLocale = localStorage.getItem('app-locale')
const defaultLocale = supportedLocales.includes(savedLocale) ? savedLocale : 'en'

document.documentElement.lang = defaultLocale

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    km
  }
})

export default i18n
