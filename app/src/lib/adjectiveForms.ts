import type { Word, WordList } from '../data/constants'
import type { WordForms } from './translate'

const COMPARATIVE_SUFFIX = 'Comparative'
const SUPERLATIVE_SUFFIX = 'Superlative'

export function comparativeKey(lang: string): string {
  return `${lang}${COMPARATIVE_SUFFIX}`
}

export function superlativeKey(lang: string): string {
  return `${lang}${SUPERLATIVE_SUFFIX}`
}

// Merges a /forms API result onto its matching words, by position — adds
// the comparative/superlative strings as extra `${lang}Comparative` /
// `${lang}Superlative` keys alongside a word's existing language keys.
// Words the API didn't mark as adjectives pass through unchanged.
export function mergeForms(words: Word[], forms: WordForms[], from: string, to: string): Word[] {
  return words.map((word, i) => {
    const f = forms[i]
    if (!f?.isAdjective || !f.from || !f.to) return word
    return {
      ...word,
      [comparativeKey(from)]: f.from.comparative,
      [superlativeKey(from)]: f.from.superlative,
      [comparativeKey(to)]: f.to.comparative,
      [superlativeKey(to)]: f.to.superlative,
    }
  })
}

// True once any word in a list carries stored comparative/superlative
// forms for both its languages — used to decide whether the "practice
// conjugations too" toggle is worth showing at all for a given list.
export function listHasForms(list: WordList): boolean {
  return list.words.some((w) => w[comparativeKey(list.from)] && w[comparativeKey(list.to)])
}

// True if any word already carries stored forms, regardless of which
// languages — used to default the list creator's "add conjugations"
// toggle back on when re-opening a list that was created with it on, so
// editing doesn't silently drop them if the toggle isn't re-checked.
export function wordsHaveAnyForms(words: Word[]): boolean {
  return words.some((w) => Object.keys(w).some((k) => k.endsWith(COMPARATIVE_SUFFIX)))
}

// Expands each word that has stored forms into three practice entries —
// positive, comparative, superlative — instead of one, so a "practice
// conjugations too" session quizzes all three forms per adjective rather
// than just its base. Each expanded entry is a plain two-key Word (just
// `list.from`/`list.to`), so the existing langHelpers/quiz logic reads it
// exactly like any other word, no special-casing needed. Words without
// stored forms (anything that isn't an adjective) pass through once,
// unchanged.
export function expandWithForms(words: Word[], list: WordList): Word[] {
  const out: Word[] = []
  for (const word of words) {
    out.push(word)
    const hasComparative = word[comparativeKey(list.from)] && word[comparativeKey(list.to)]
    if (!hasComparative) continue
    out.push({
      [list.from]: word[comparativeKey(list.from)],
      [list.to]: word[comparativeKey(list.to)],
    })
    const hasSuperlative = word[superlativeKey(list.from)] && word[superlativeKey(list.to)]
    if (hasSuperlative) {
      out.push({
        [list.from]: word[superlativeKey(list.from)],
        [list.to]: word[superlativeKey(list.to)],
      })
    }
  }
  return out
}
