export enum ToastNotificationType {
  Success,
  Warning,
  Danger,
  Info
}

export type ToastNotification = {
  title?: string
  /**
   * Optionally provide extra text
   */
  description?: string
  type: ToastNotificationType
  /**
   * Optionally specify a CTA link on the right
   */
  cta?: {
    title: string
    url?: string
    onClick?: (e: MouseEvent) => void
  }
}
