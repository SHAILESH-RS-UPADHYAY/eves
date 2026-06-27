import { BrowserWindow } from 'electron'

export interface StealthStatus {
  supported: boolean
  active: boolean
}

let currentActive = false

export function setStealth(window: BrowserWindow, enable: boolean): StealthStatus {
  if (process.platform === 'linux') {
    return { supported: false, active: false }
  }
  window.setContentProtection(enable)
  currentActive = enable
  return { supported: true, active: enable }
}

export function getStealthStatus(): StealthStatus {
  return {
    supported: process.platform !== 'linux',
    active: currentActive
  }
}
