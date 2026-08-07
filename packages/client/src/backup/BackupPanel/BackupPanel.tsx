import type { ChangeEvent, ReactElement } from 'react'
import { useRef } from 'react'
import { useBackupActions } from '../useBackupActions'

export function BackupPanel(): ReactElement {
  const { isBusy, exportToFile, importFromFile } = useBackupActions()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    if (!window.confirm('저장된 모든 내용을 가져온 파일로 덮어씁니다. 계속할까요?')) {
      return
    }
    importFromFile(file)
  }

  return (
    <section>
      <h2>데이터 백업</h2>
      <p>브라우저에 저장된 모든 내용을 파일로 내보내거나, 파일의 내용으로 덮어씁니다.</p>
      <div role="group">
        <button type="button" onClick={exportToFile} disabled={isBusy}>
          내보내기
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
        >
          가져오기
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleFileChange}
      />
    </section>
  )
}
