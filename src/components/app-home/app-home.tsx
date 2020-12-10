import { Component, h, Host, State } from '@stencil/core';
import { alertController, toastController } from '@ionic/core';
import { IMessage, MESSAGES } from '@helpers/messages';


interface ISeat {
  id: number;
  isBooked: boolean;
}

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
})
export class AppHome {

  private readonly url = 'https://cinema-booking-pwa-app.herokuapp.com';

  @State() private seats: ISeat[] = [];
  @State() private picked = 0;

  @State() private alert: HTMLIonAlertElement;
  @State() private toast: HTMLIonToastElement;

  private async getSeats(): Promise<void> {
    const response = await fetch(`${this.url}/seats`, { method: 'GET' });
    const data = await response.json();
    this.seats = data;
    this.picked = 0;
  }

  private bookSeatById(): void {
    fetch(`${this.url}/seats/book/${this.picked}`, { method: 'PUT' })
      .then(response => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then(() => {
        this.presentAlert(MESSAGES.BOOKED);
        this.getSeats();
      })
      .catch(error => {
        if (error.message === 'Conflict') {
          this.presentAlert(MESSAGES.BUSY);
          this.getSeats();
        }
        if (error.message === 'Failed to fetch') {
          this.presentAlert(MESSAGES.OFFLINE);
        }
        
      });
   
  }

  private async resetAllSeats(): Promise<void> {
    this.seats = await fetch(`${this.url}/seats/reset`, { method: 'PUT' }).then(res => res.json());
  }

  private async presentAlert({type, header, message}: IMessage): Promise<void> {
    if (this.alert) {
      await this.alert.dismiss();
      this.alert = null;
    }
    this.alert = await alertController.create({
      cssClass: `alert-${type}`,
      header,
      message,
      buttons: ['OK'],
    });
    await this.alert.present();
  }

  private async presentNetworkStateToast(): Promise<void> {
    if (this.toast) {
      await this.alert.dismiss();
      this.toast = null;
    }
    this.toast = await toastController.create({
      message: 'Connection has been lost',
    });
    await this.toast.present();
  }

  private async dismissNetworkStateToast(): Promise<void> {
    if (this.toast) {
      await this.toast.dismiss();
      this.toast = null;
    }
  }

  // Lifecycle hook
  public componentDidLoad(): void {
    window.addEventListener('online', () => this.dismissNetworkStateToast());
    window.addEventListener('offline', () => this.presentNetworkStateToast());


    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', ({data}) => {
        if (data.ok) {
          this.presentAlert(MESSAGES.BOOKED);
        } else {
          this.presentAlert(MESSAGES.BUSY);
        }
        this.getSeats();
      })
    }
    this.getSeats();
  }

  private pickSeat(id: number): void {
    this.picked = id;
  }

  render() {
    return (
      <Host>
        <ion-header>
          <ion-toolbar color="primary">
            <ion-title>Cinema Booking App</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-row>
            {this.seats.map(s =>
              <ion-col size="2">
                <ion-button
                  expand="block"
                  size="large"
                  color="medium"
                  fill={s.id === this.picked ? 'outline' : 'solid'}
                  disabled={s.isBooked}
                  onClick={() => this.pickSeat(s.id)}
                >
                  {s.id}
                </ion-button>
              </ion-col>
            )}
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button
                expand="block"
                color="primary"
                disabled={this.picked === 0}
                onClick={() => this.bookSeatById()}
              >
                Book
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button
                expand="block"
                color="light"
                onClick={() => this.resetAllSeats()}
              >
                Reset all seats
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-content>
      </Host>
    );
  }
}
