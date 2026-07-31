import type { ReactElement } from 'react'
import { ChoiceGroup } from '../../../explore/ChoiceGroup/ChoiceGroup'
import type { Choice } from '../../../explore/ChoiceGroup/ChoiceGroup'

interface ModelSelectorProps {
  modelDims: number[]
  selectedD: number | null
  onSelect: (d: number | null) => void
}

export function ModelSelector({
  modelDims,
  selectedD,
  onSelect,
}: ModelSelectorProps): ReactElement | null {
  if (!modelDims.length) {
    return null
  }
  const noModel: Choice<number | null>[] = [{ label: 'no model', value: null }]
  const choices = noModel.concat(modelDims.map((d) => ({ label: `d=${d}`, value: d })))
  return <ChoiceGroup choices={choices} selected={selectedD} onSelect={onSelect} />
}
