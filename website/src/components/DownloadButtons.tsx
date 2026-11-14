import { useState } from 'react'
import { IOS, MOBILE, OS, OTHER_OS, RELEASES, REPO, promptInstall } from '../lib'

const Apple = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" /></svg>
const Windows = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5l7.4-1v7H3zM11.4 4.4L21 3v8.5h-9.6zM3 12.5h7.4v7l-7.4-1zM11.4 12.5H21V21l-9.6-1.4z" /></svg>
const Phone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
const icon = (os: string) => (os === 'macOS' ? <Apple /> : <Windows />)

/**
 * Desktop: the visitor's OS is the primary button, the other OS sits beside it.
 * Phone: the desktop app can't run there, so the primary action installs EVES as an app (PWA),
 * with the Windows / macOS downloads still one tap away.
 */
export function DownloadButtons({ github = true }: { github?: boolean }) {
  const [iosHint, setIosHint] = useState(false)

  const install = async () => { if (!(await promptInstall())) setIosHint(true) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {MOBILE ? (
          <button className="btn btn-primary" onClick={install}><span className="btn-dot" /><Phone /> Install EVES</button>
        ) : (
          <a href={RELEASES} target="_blank" rel="noreferrer" className="btn btn-primary"><span className="btn-dot" />{icon(OS)} Download for {OS}</a>
        )}
        <a href={RELEASES} target="_blank" rel="noreferrer" className="btn btn-ghost">
          {MOBILE ? <><Windows /> Windows · <Apple /> macOS</> : <>{icon(OTHER_OS)} {OTHER_OS}</>}
        </a>
        {github && !MOBILE && <a href={REPO} target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub ↗</a>}
      </div>
      {iosHint && (
        <p className="install-hint" role="status">
          {IOS ? <>Tap <b>Share</b> <span aria-hidden>⎋</span> then <b>Add to Home Screen</b>.</> : <>Open your browser menu and choose <b>Install app</b> / <b>Add to Home screen</b>.</>}
        </p>
      )}
      <span className="dl-meta">v1.0 · Windows 10+ · macOS 11+ (Intel & Apple silicon) · free</span>
    </div>
  )
}
