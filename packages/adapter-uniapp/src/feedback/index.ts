import { AbstractFeedback } from '@omni-dev/base'

type ToastType = 'success' | 'error' | 'loading' | 'none' | 'fail' | 'exception'

export class Feedback extends AbstractFeedback {
  showConfirm(message: string, title?: string): void {
    uni.showModal({
      title,
      content: message,
      showCancel: true,
    })
  }

  showAlert(message: string, title?: string): void {
    uni.showModal({
      title,
      content: message,
      showCancel: false,
    })
  }

  showToast(message: string, type?: ToastType, duration?: number): void {
    uni.showToast({
      title: message,
      icon: type,
      duration,
    })
  }
}

export const feedback = new Feedback()
