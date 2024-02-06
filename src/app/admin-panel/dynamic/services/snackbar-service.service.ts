import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { CustomSnackbarComponent } from '../components/widgets/custom-snackbar/custom-snackbar.component';

const DEBOUNCE_TIME = 500;
const MAX_SINGLE_LINE_LENGTH = 100;
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private queue: { message: any; config: any }[] = [];
  private isDisplaying: boolean = false;
  private lastMessage: any = null;
  private lastShownTimestamp: number = 0;


  error: any;
  messages: any = [];
  snackBarRef;
  config
  constructor(public snackBar: MatSnackBar) { }

  private processQueue(): void {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      return;
    }

    const nextItem = this.queue.shift();
    this.openSnackBar(nextItem.message, nextItem.config);
  }

  private openSnackBar(message: any, config: any): void {
    this.config = config;
    if (!document.getElementsByTagName('snack-bar-container').length) {
      this.snackBarRef = null;
    }
    if (this.snackBarRef) {
      this.messages.push(message);
    } else {
      this.messages = [message];
      const snackbarConfig: MatSnackBarConfig = {
        ...config,
        data: { messages: this.messages, ...config },
        panelClass: 'custom-snackbar'
      };
      this.snackBarRef = this.snackBar.openFromComponent(CustomSnackbarComponent, snackbarConfig);
      this.snackBarRef.afterDismissed().subscribe(() => {
        this.snackBarRef = null;
        this.processQueue();
      });
    }
  }

  showSnack(message: any, config: any): void {
    const currentTime = new Date().getTime();
    const isMessageInQueue = this.queue.some(item => this.isSameMessage(item.message.text, message.text));
    const isDuplicateWithinDebounceTime = this.isSameMessage(this.lastMessage, message.text) && (currentTime - this.lastShownTimestamp) < DEBOUNCE_TIME;

    if (!isMessageInQueue && !isDuplicateWithinDebounceTime) {
      if (this.isDisplaying && this.isShortMessage(message.text)) {
        this.appendMessage(message, config);
      } else {
        this.lastMessage = message;
        this.lastShownTimestamp = currentTime;
        this.queue.push({ message, config });
        if (!this.isDisplaying) {
          this.isDisplaying = true;
          this.processQueue();
        }
      }
    }
  }


  private isSameMessage(messageA: any, messageB: any): boolean {
    if (typeof messageA === 'string' && typeof messageB === 'string') {
      return messageA === messageB;
    }
    return JSON.stringify(messageA) === JSON.stringify(messageB);
  }

  private isShortMessage(message: any): boolean {
    return message.length <= MAX_SINGLE_LINE_LENGTH;
  }

  private appendMessage(newMessage: any,config): void {
    this.messages.push(newMessage);
    this.snackBarRef.dismiss();

    const snackbarConfig: MatSnackBarConfig = {
      ...config,
      data: { messages: this.messages, ...config },
      panelClass: 'custom-snackbar'
    };
    this.snackBarRef = this.snackBar.openFromComponent(CustomSnackbarComponent, snackbarConfig);

    this.snackBarRef.afterDismissed().subscribe(() => {
      this.snackBarRef = null;
      this.processQueue();
    });
  }
}
