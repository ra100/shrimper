type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported'

export function getPermissionState(): PermissionState {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<PermissionState> {
  if (!('Notification' in window)) return 'unsupported'
  const result = await Notification.requestPermission()
  return result
}

export function showNotification(title: string, body: string): void {
  if (getPermissionState() !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/shrimper/favicon.svg',
    tag: 'shrimper-reminder',
    requireInteraction: true,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}
