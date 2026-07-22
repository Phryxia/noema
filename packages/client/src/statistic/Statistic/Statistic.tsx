import type { ReactElement } from 'react'
import { TotalCounts } from '../TotalCounts/TotalCounts'
import { GrowthChart } from '../GrowthChart/GrowthChart'

export function Statistic(): ReactElement {
  return (
    <article>
      <TotalCounts />
      <hr />
      <GrowthChart />
    </article>
  )
}
