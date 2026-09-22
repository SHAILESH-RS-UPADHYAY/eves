import { BrowserWindow } from 'electron'

export interface StealthStatus {
  supported: boolean
  active: boolean
}

let currentActive = false

export function setStealth(window: BrowserWindow, enable: boolean): StealthStatus {
  // Keep window visible on screen shares/recording
  if (process.platform !== 'linux') {
    window.setContentProtection(false)
  }
  currentActive = false
  return { supported: true, active: false }
}

export function getStealthStatus(): StealthStatus {
  return {
    supported: process.platform !== 'linux',
    active: false
  }
}
