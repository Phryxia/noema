import type { ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BackupPanel } from '../backup/BackupPanel/BackupPanel'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage(): ReactElement {
  return (
    <article>
      <h1>설정</h1>
      <BackupPanel />
    </article>
  )
}
