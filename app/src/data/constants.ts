export type Word = Record<string, string>

export interface WordList {
  id: string
  from: string
  to: string
  name: string
  color: keyof typeof COLOR_MAP
  words: Word[]
}

export const SAMPLE_LISTS: WordList[] = [
  {
    id: 'djur',
    from: 'sv',
    to: 'en',
    name: 'Djur (Animals)',
    color: 'rose',
    words: [
      { sv: 'katt', en: 'cat' },
      { sv: 'hund', en: 'dog' },
      { sv: 'häst', en: 'horse' },
      { sv: 'fågel', en: 'bird' },
      { sv: 'kanin', en: 'rabbit' },
      { sv: 'räv', en: 'fox' },
      { sv: 'björn', en: 'bear' },
      { sv: 'ekorre', en: 'squirrel' },
      { sv: 'groda', en: 'frog' },
      { sv: 'fjäril', en: 'butterfly' },
    ],
  },
  {
    id: 'mat',
    from: 'sv',
    to: 'en',
    name: 'Mat (Food)',
    color: 'butter',
    words: [
      { sv: 'äpple', en: 'apple' },
      { sv: 'bröd', en: 'bread' },
      { sv: 'ost', en: 'cheese' },
      { sv: 'mjölk', en: 'milk' },
      { sv: 'smör', en: 'butter' },
      { sv: 'köttbullar', en: 'meatballs' },
      { sv: 'potatis', en: 'potato' },
      { sv: 'glass', en: 'ice cream' },
      { sv: 'kaka', en: 'cookie' },
      { sv: 'soppa', en: 'soup' },
    ],
  },
  {
    id: 'skola',
    from: 'sv',
    to: 'en',
    name: 'Skolan (School)',
    color: 'sky',
    words: [
      { sv: 'bok', en: 'book' },
      { sv: 'penna', en: 'pen' },
      { sv: 'lärare', en: 'teacher' },
      { sv: 'klassrum', en: 'classroom' },
      { sv: 'matematik', en: 'math' },
      { sv: 'rast', en: 'recess' },
      { sv: 'ryggsäck', en: 'backpack' },
      { sv: 'skrivbord', en: 'desk' },
    ],
  },
  {
    id: 'kanslor',
    from: 'sv',
    to: 'en',
    name: 'Känslor (Feelings)',
    color: 'mint',
    words: [
      { sv: 'glad', en: 'happy' },
      { sv: 'ledsen', en: 'sad' },
      { sv: 'arg', en: 'angry' },
      { sv: 'rädd', en: 'scared' },
      { sv: 'trött', en: 'tired' },
      { sv: 'förvånad', en: 'surprised' },
    ],
  },
]

export const COLOR_MAP = {
  rose: '#FFB0C8',
  butter: '#F2EE5B',
  sky: '#8AD7FF',
  mint: '#A8F08C',
  pink: '#B583E8',
} as const

export const CHARACTERS = [
  'cat',
  'elephant',
  'bear',
  'bunny',
  'frog',
  'owl',
  'lion',
  'penguin',
  'panda',
  'unicorn',
  'fox',
  'jellyfish',
] as const
export type AvatarKey = (typeof CHARACTERS)[number]

// A tint of each avatar's own color, blended into the app's cream
// background.
export const AVATAR_TINTS: Record<AvatarKey, string> = {
  cat: '#F5EDE6',
  elephant: '#D4E6EC',
  bear: '#D2BEA8',
  bunny: '#F6DFDE',
  frog: '#D5E5C3',
  owl: '#E4D4E9',
  lion: '#F4DCB4',
  penguin: '#C6DFD8',
  panda: '#DFDED8',
  unicorn: '#EEE3EA',
  fox: '#F0D3B4',
  jellyfish: '#F0C1D9',
}

// A more saturated version of the same color, for the profile card.
export const AVATAR_PANEL: Record<AvatarKey, string> = {
  cat: '#FCDAE2',
  elephant: '#CBE6F5',
  bear: '#ECCAA9',
  bunny: '#FADBE2',
  frog: '#CCE4BC',
  owl: '#E1CDF0',
  lion: '#F8D7A7',
  penguin: '#B7DBD9',
  panda: '#D9D9D8',
  unicorn: '#F0E2F2',
  fox: '#F2CBA7',
  jellyfish: '#F2B1DA',
}

// A more saturated version of each avatar's color, used as the app's
// accent — cascades to every primary button via --accent/--accent-text.
export const AVATAR_BUTTON: Record<AvatarKey, string> = {
  cat: '#FFB84D',
  elephant: '#B583E8',
  bear: '#A8F08C',
  bunny: '#FCA7C0',
  frog: '#F2EE5B',
  owl: '#F2EE5B',
  lion: '#D9691F',
  penguin: '#F2EE5B',
  panda: '#7CB342',
  unicorn: '#8AD7FF',
  fox: '#FFFFFF',
  jellyfish: '#E0399B',
}
export const AVATAR_BUTTON_TEXT: Partial<Record<AvatarKey, string>> = { jellyfish: '#fff' }

// Bump this whenever an avatar image file changes, so browsers/CDNs that
// cache images by URL are forced to fetch the new bytes instead of stale
// ones — kept in parity with the legacy app's own asset versioning.
export const AVATAR_ASSET_VERSION = 3

export const COIN_BUMP_MS = 380
// Every correct answer earns COIN_REWARD — including each repetition of
// the "write it 5 times" remediation after a wrong answer, rewarding
// grit rep by rep rather than only once at the end.
export const COIN_REWARD = 1

export function accentText(avatar: AvatarKey): string {
  return AVATAR_BUTTON_TEXT[avatar] || '#241F3D'
}

export interface LangHelpers {
  from: string
  to: string
  src: (word: Word) => string
  tgt: (word: Word) => string
}

// `reversed` swaps which language the player answers in (e.g. a list
// that's normally "see Swedish, type English" becomes "see English,
// type Swedish").
export function langHelpers(list: WordList, reversed: boolean): LangHelpers {
  const from = reversed ? list.to : list.from
  const to = reversed ? list.from : list.to
  return {
    from,
    to,
    src: (word) => word[from] ?? '',
    tgt: (word) => word[to] ?? '',
  }
}
