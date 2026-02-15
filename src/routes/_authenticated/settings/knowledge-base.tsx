import { createFileRoute } from '@tanstack/react-router'
import { SettingsKnowledgeBase } from '@/features/settings/knowledge-base'

export const Route = createFileRoute(
  '/_authenticated/settings/knowledge-base'
)({
  component: SettingsKnowledgeBase,
})
