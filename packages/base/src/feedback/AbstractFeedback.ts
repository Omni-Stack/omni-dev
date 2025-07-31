type FeedbackType = 'success' | 'error'

type ShowToast<T extends FeedbackType> = (message: string, type?: T, duration?: number) => void
type ShowModal<T extends FeedbackType> = (message: string, title?: string, type?: T) => void

interface IFeedback<T extends FeedbackType> {
  defaultDuration: number
  showToast: ShowToast<T>
  showConfirm: ShowModal<T>
  showAlert: ShowModal<T>
}

export abstract class AbstractFeedback<T extends FeedbackType = FeedbackType> implements IFeedback<T> {
  constructor(public defaultDuration: number = 3000) {}

  abstract showToast<T extends FeedbackType>(message: string, type?: T, duration?: number): void
  abstract showConfirm<T extends FeedbackType>(message: string, title?: string, type?: T): void
  abstract showAlert<T extends FeedbackType>(message: string, title?: string, type?: T): void

  getDuration(duration?: number) {
    return duration ?? this.defaultDuration
  }

  toastSuccess(message: string, duration: number = this.defaultDuration) {
    this.showToast(message, 'success', duration)
  }

  toastError(message: string, duration: number = this.defaultDuration) {
    this.showToast(message, 'error', duration)
  }

  confirmSuccess(message: string, title: string = '确认') {
    this.showConfirm(message, title, 'success')
  }

  confirmError(message: string, title: string = '确认') {
    this.showConfirm(message, title, 'error')
  }

  alertSuccess(message: string, title: string = '提示') {
    this.showAlert(message, title, 'success')
  }

  alertError(message: string, title: string = '提示') {
    this.showAlert(message, title, 'error')
  }
}
