export interface Project {
  id: string
  title: string
  domain: string
  shortDescription: string
  deadline: string
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Community recipe wiki',
    domain: 'Documentation',
    shortDescription: 'Help build a small wiki of open recipes with clear licensing.',
    deadline: '2026-03-15',
  },
  {
    id: '2',
    title: 'Local event calendar',
    domain: 'Web app',
    shortDescription: 'A simple calendar to list and share local meetups and workshops.',
    deadline: '2026-04-01',
  },
  {
    id: '3',
    title: 'Accessibility audit template',
    domain: 'Tooling',
    shortDescription: 'Create a reusable checklist for auditing small websites for a11y.',
    deadline: '2026-03-31',
  },
]
