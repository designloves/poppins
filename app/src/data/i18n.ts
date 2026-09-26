export type UiLang = 'en' | 'sv'

// Ported from the legacy app's UI_STRINGS — scoped to the keys the
// screens built so far actually use. Extend as more screens are ported.
const UI_STRINGS = {
  en: {
    todaysList: "Today's list",
    startPractice: 'Start practice',
    myLists: 'My lists',
    newList: 'New',
    noWordsYet: 'No words yet!',
    pickListOrPaste: 'Pick a list to start, or paste your own words.',
    pickAList: 'Pick a list',
    pasteMyOwn: 'Paste my own',
    sayHi: 'Say hi',
    mascotGreeting: "Hi! I'm Poppins. Let's learn some language!",
    settingsTitle: 'Settings',
    editList: 'Edit list',
  },
  sv: {
    todaysList: 'Dagens lista',
    startPractice: 'Starta övning',
    myLists: 'Mina listor',
    newList: 'Ny',
    noWordsYet: 'Inga ord än!',
    pickListOrPaste: 'Välj en lista för att börja, eller klistra in egna ord.',
    pickAList: 'Välj en lista',
    pasteMyOwn: 'Klistra in egna',
    sayHi: 'Säg hej',
    mascotGreeting: 'Hej! Jag är Poppins. Nu lär vi oss språk!',
    settingsTitle: 'Inställningar',
    editList: 'Redigera lista',
  },
} as const

export type UiStringKey = keyof (typeof UI_STRINGS)['en']

export function t(uiLang: UiLang, key: UiStringKey): string {
  return UI_STRINGS[uiLang][key] ?? UI_STRINGS.en[key]
}

export function wordsCountText(uiLang: UiLang, n: number): string {
  return uiLang === 'sv' ? `${n} ord` : `${n} word${n !== 1 ? 's' : ''}`
}

export const LANGUAGE_CODES: Record<string, string> = {
  sv: 'SV',
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
}

export const TTS_LOCALE: Record<string, string> = {
  sv: 'sv-SE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
}
