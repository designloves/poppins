// Step 2 of the coins → dressing room gamification plan: one free
// starter accessory, to prove the equip/render loop end to end before
// a real priced shop (step 3) adds more.
export interface Accessory {
  id: string
  cost: number
}

export const ACCESSORIES: Accessory[] = [
  { id: 'party-hat', cost: 0 },
  // Was previously baked permanently into the cat avatar's art; pulled
  // out into a real, removable accessory.
  { id: 'fish-hairclip', cost: 0 },
]
