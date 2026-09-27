import { useCallback, useEffect } from 'react'
import { useRepoStore, type RepoRole } from '../store/repo.store'
import { useSettingsStore } from '../store/settings.store'
import { useUIStore } from '../store/ui.store'

const PATH_KEY = { company: 'companyRepoPath', vault: 'referenceRepoPath' } as const
const PICKER_TITLE = { company: 'Select your company repository', vault: 'Select your reference repo / skill vault' }

/**
 * One attached repository. The path lives in settings (survives restarts); the
 * scan result lives in memory and is rebuilt on first use.
 */
export function useRepoLink(role: RepoRole) {
  const path = useSettingsStore((s) => s.settings[PATH_KEY[role]])
  const isLoaded = useSettingsStore((s) => s.isLoaded)
  const info = useRepoStore((s) => s.info[role])
  const scanning = useRepoStore((s) => s.scanning[role])
  const addToast = useUIStore((s) => s.addToast)

  const scan = useCallback(async (folder: string) => {
    const { setScanning, setInfo } = useRepoStore.getState()
    setScanning(role, true)
    const res = await window.eves?.scanRepoFolder(folder)
    setScanning(role, false)
    if (res?.success && res.data) setInfo(role, res.data)
    else addToast({ type: 'error', title: 'Scan failed', message: res?.error ?? folder })
  }, [role, addToast])

  const attach = useCallback(async () => {
    const res = await window.eves?.selectRepoFolder(PICKER_TITLE[role])
    if (!res?.success || !res.data) return
    await useSettingsStore.getState().updateSettings({ [PATH_KEY[role]]: res.data })
    await scan(res.data)
  }, [role, scan])

  const detach = useCallback(() => {
    useSettingsStore.getState().updateSettings({ [PATH_KEY[role]]: '' })
    useRepoStore.getState().setInfo(role, null)
  }, [role])

  // a path remembered from last session gets re-indexed once
  useEffect(() => {
    const { info: current, scanning: busy } = useRepoStore.getState()
    if (isLoaded && path && current[role]?.rootPath !== path && !busy[role]) scan(path)
  }, [isLoaded, path, role, scan])

  return { path, info: info?.rootPath === path ? info : null, scanning, attach, rescan: () => path && scan(path), detach }
}
