import { Component, h, Listen } from '@stencil/core';
import { toastController } from '@ionic/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
})
export class AppRoot {

  @Listen('swUpdate', { target: 'window' })
  async onSWUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration || !registration.waiting) {
      // If there is no registration, this is the first service
      // worker to be installed. registration.waiting is the one
      // waiting to be activated.
      return;
    }

    const toast = await toastController.create({
      message: 'New version available',
      duration: 10000,
      buttons: [
        {
          side: 'end',
          text: 'Reload',
          handler: () => {
            window.location.reload();
          }
        }
      ]
    });
  
    await toast.present();
    await toast.onWillDismiss();

    registration.waiting.postMessage('skipWaiting');
  }


  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/" component="app-home" />
        </ion-router>
        <ion-nav />
      </ion-app>
    );
  }
}
