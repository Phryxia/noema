import type { ReactElement } from 'react'
import { TeachForm } from '../TeachForm/TeachForm'
import { TeachTypeSelector } from '../TeachTypeSelector/TeachTypeSelector'
import { useTeach } from '../useTeach'

export function TeachPage(): ReactElement {
  const teach = useTeach()

  return (
    <article>
      <h2>알려주기</h2>
      <TeachTypeSelector type={teach.type} onChange={teach.setType} />
      <hr />
      <TeachForm teach={teach} />
    </article>
  )
}
