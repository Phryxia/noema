import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { exportBackup, importBackup } from './backup.service'
import { downloadBackup } from './downloadBackup'
import { getErrorMessage, parseBackup } from './utils'

interface BackupActions {
  notice: string
  isBusy: boolean
  exportToFile: () => void
  importFromFile: (file: File) => void
}

export function useBackupActions(): BackupActions {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState('')

  const { mutate: exportToFile, isPending: isExporting } = useMutation({
    mutationFn: exportBackup,
    onSuccess: (backup) => {
      downloadBackup(backup)
      setNotice('내보내기를 완료했습니다')
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  })

  const { mutate: importFromFile, isPending: isImporting } = useMutation({
    mutationFn: readAndImport,
    onSuccess: () => {
      queryClient.invalidateQueries()
      setNotice('가져오기를 완료했습니다')
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  })

  return {
    notice,
    isBusy: isExporting || isImporting,
    exportToFile: (): void => exportToFile(),
    importFromFile,
  }
}

async function readAndImport(file: File): Promise<void> {
  await importBackup(parseBackup(await file.text()))
}
