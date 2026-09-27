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
    back: 'Back',
    whichLangAnswer: 'Which language will you answer in?',
    starting: 'Starting "{name}"',
    answerIn: 'Answer in {lang}',
    practice: 'Practice',
    writeNTimes: 'Write "{word}" 5 times',
    inLang: '({source} in {lang})',
    gotItKeepGoing: 'Got it — keep going',
    doneOfFive: '{n} / 5 done',
    whatMeanIn: 'What does this mean in {lang}?',
    typeInLang: 'Answer and hit enter',
    youDidIt: 'You did it!',
    resultLine: '{pct}% right · {fraction} on the first try',
    home: 'Home',
    playAgain: 'Play again',
    exitGameConfirm: "Quit this round? Your progress on it won't be saved.",
    exitGame: 'Exit',
    returnToGame: 'Return to game',
    noListsYet: 'No lists yet — add one!',
    addNewList: 'Add a new list',
    pasteWordList: 'New list',
    language: 'Language',
    pasteInstructions:
      "Type or paste words with their translation next to them. It doesn't matter what character you put between the words, or which order the languages are in — you can practice in both directions. Or just type words in one language and we'll translate them for you.",
    listNamePlaceholder: "What's this list called?",
    wordTranslationPlaceholder: 'word = translation',
    cancel: 'Cancel',
    sortItOut: 'Sort it out',
    translating: 'Translating…',
    lookRight: 'Look right?',
    foundWords: 'Found {n} words',
    edit: 'Edit',
    saveChanges: 'Save changes',
    saveList: 'Save list',
    hejThere: 'Hej there!',
    notSignedIn: 'Not signed in',
    avatar: 'Avatar',
    appLanguage: 'App language',
    soundEffects: 'Sound effects',
    showPronunciation: 'Show pronunciation',
    logOut: 'Log out',
    logIn: 'Log in',
    madeWith: 'Poppins v1 · made with',
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
    back: 'Tillbaka',
    whichLangAnswer: 'Vilket språk vill du svara på?',
    starting: 'Startar "{name}"',
    answerIn: 'Svara på {lang}',
    practice: 'Övning',
    writeNTimes: 'Skriv "{word}" 5 gånger',
    inLang: '({source} på {lang})',
    gotItKeepGoing: 'Fixat — fortsätt',
    doneOfFive: '{n} / 5 klara',
    whatMeanIn: 'Vad betyder detta på {lang}?',
    typeInLang: 'Svara och tryck enter',
    youDidIt: 'Du klarade det!',
    resultLine: '{pct}% rätt · {fraction} på första försöket',
    home: 'Hem',
    playAgain: 'Spela igen',
    exitGameConfirm: 'Avsluta den här omgången? Ditt resultat sparas inte.',
    exitGame: 'Avsluta',
    returnToGame: 'Fortsätt spela',
    noListsYet: 'Inga listor än — lägg till en!',
    addNewList: 'Lägg till en ny lista',
    pasteWordList: 'Ny lista',
    language: 'Språk',
    pasteInstructions:
      'Skriv eller klistra in glosor med översättning bredvid. Det spelar ingen roll vilket tecken du har mellan orden eller vilken ordning språken sätts i, man kan träna åt båda hållen. Eller skriv bara ord på ett språk, så översätter vi automatiskt.',
    listNamePlaceholder: 'Vad ska listan heta?',
    wordTranslationPlaceholder: 'ord = översättning',
    cancel: 'Avbryt',
    sortItOut: 'Sortera ut det',
    translating: 'Översätter…',
    lookRight: 'Ser det rätt ut?',
    foundWords: 'Hittade {n} ord',
    edit: 'Redigera',
    saveChanges: 'Spara ändringar',
    saveList: 'Spara lista',
    hejThere: 'Hej där!',
    notSignedIn: 'Inte inloggad',
    avatar: 'Avatar',
    appLanguage: 'Appspråk',
    soundEffects: 'Ljudeffekter',
    showPronunciation: 'Spela upp ord',
    logOut: 'Logga ut',
    logIn: 'Logga in',
    madeWith: 'Poppins v1 · gjord med',
  },
} as const

export type UiStringKey = keyof (typeof UI_STRINGS)['en']

export function t(uiLang: UiLang, key: UiStringKey, vars?: Record<string, string>): string {
  let str: string = UI_STRINGS[uiLang][key] ?? UI_STRINGS.en[key]
  if (vars) {
    for (const k in vars) str = str.replaceAll(`{${k}}`, vars[k])
  }
  return str
}

// Language display names, translated per uiLang — e.g. "English" shown
// as "engelska" when uiLang is "sv".
const LANG_NAME_TRANSLATIONS: Record<UiLang, Record<string, string>> = {
  en: { sv: 'Swedish', en: 'English', es: 'Spanish', fr: 'French', de: 'German' },
  sv: { sv: 'svenska', en: 'engelska', es: 'spanska', fr: 'franska', de: 'tyska' },
}

export function langName(uiLang: UiLang, code: string): string {
  return LANG_NAME_TRANSLATIONS[uiLang][code] ?? code
}

export function wordsCountText(uiLang: UiLang, n: number): string {
  return uiLang === 'sv' ? `${n} ord` : `${n} word${n !== 1 ? 's' : ''}`
}

export function listsCountText(uiLang: UiLang, n: number): string {
  return uiLang === 'sv' ? `${n} ${n === 1 ? 'lista' : 'listor'}` : `${n} list${n !== 1 ? 's' : ''}`
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
