export type ProductId = 'crew' | 'hoodie' | 'tee' | 'zip'

export type ApparelColor = {
  id: string
  label: string
  hex: string
  ink: string
}

export const COLORS: ApparelColor[] = [
  { id: 'aqua', label: 'Aqua', hex: '#4ecdc4', ink: '#0b2a2a' },
  { id: 'navy', label: 'Navy', hex: '#1c3550', ink: '#e8eef4' },
  { id: 'black', label: 'Black', hex: '#14181c', ink: '#e8eef4' },
  { id: 'white', label: 'White', hex: '#f2f4f6', ink: '#132a38' },
  { id: 'forest', label: 'Forest', hex: '#1f4d3a', ink: '#e8eef4' },
  { id: 'crimson', label: 'Crimson', hex: '#9b1e2e', ink: '#e8eef4' },
  { id: 'gold', label: 'Gold', hex: '#d4a017', ink: '#1a1408' },
  { id: 'slate', label: 'Slate', hex: '#5c6b78', ink: '#e8eef4' },
]

export const PRODUCTS: {
  id: ProductId
  label: string
  blurb: string
}[] = [
  { id: 'crew', label: 'Crewneck', blurb: 'Full-chest crest favorite' },
  { id: 'hoodie', label: 'Hoodie', blurb: 'Warm booth bestseller' },
  { id: 'zip', label: 'Zip hoodie', blurb: 'Left-chest crest' },
  { id: 'tee', label: 'Classic tee', blurb: 'Light & quick print' },
]

export type PrintStyle = 'crest' | 'left' | 'blank'

export const PRINTS: { id: PrintStyle; label: string }[] = [
  { id: 'crest', label: 'Full-chest crest' },
  { id: 'left', label: 'Left-chest crest' },
  { id: 'blank', label: 'Blank' },
]
