import { useMutation, useQueryClient } from '@tanstack/react-query'
import { exportBackup, importBackup } from './backup.service'
import { downloadBackup } from './downloadBackup'
import { parseBackup } from './utils'

interface BackupActions {
  isBusy: boolean
  exportToFile: () => void
  importFromFile: (file: File) => void
}

export function useBackupActions(): BackupActions {
  const queryClient = useQueryClient()

  const { mutate: exportToFile, isPending: isExporting } = useMutation({
    mutationFn: exportBackup,
    meta: { successMessage: '내보내기를 완료했습니다' },
    onSuccess: (backup) => downloadBackup(backup),
  })

  const { mutate: importFromFile, isPending: isImporting } = useMutation({
    mutationFn: readAndImport,
    meta: { successMessage: '가져오기를 완료했습니다' },
    onSuccess: () => queryClient.invalidateQueries(),
  })

  return {
    isBusy: isExporting || isImporting,
    exportToFile: (): void => exportToFile(),
    importFromFile,
  }
}

async function readAndImport(file: File): Promise<void> {
  await importBackup(parseBackup(await file.text()))
}
