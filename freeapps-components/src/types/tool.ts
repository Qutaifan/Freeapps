export interface ToolCard {
  id: string
  name: string
  description: string
  fullDetails?: string
  mainCategory: 'ai' | 'utilities' | 'apps' | 'opensource'
  mainCategoryLabel: string
  tags: string[]
  license: string
  stars: string
  url: string
  size: 'large' | 'medium' | 'small'
  features?: string[]
}

export type CategoryKey = 'all' | 'ai' | 'utilities' | 'apps' | 'opensource' | 'saved'

export interface CategoryPillar {
  key: CategoryKey
  label: string
  count?: number
}
