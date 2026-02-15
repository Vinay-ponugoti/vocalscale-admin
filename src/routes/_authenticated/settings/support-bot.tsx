import { createFileRoute } from '@tanstack/react-router'
import { SettingsSupportBot } from '@/features/settings/support-bot'

export const Route = createFileRoute('/_authenticated/settings/support-bot')({
  component: SettingsSupportBot,
})
