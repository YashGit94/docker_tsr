import { Injectable } from '@angular/core';

declare const gapi: any;

@Injectable({

  providedIn: 'root'

})

export class GoogleAuthService {

  private gapiSetup = false;

  private authInstance: any;

  private readonly clientId = '1053204123859-hk2ac8l8dnpuhql59i7s6048hcudav9s.apps.googleusercontent.com';

  private readonly scopes = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly';

//   getSignedInLdap(): string | null {
//   if (this.authInstance?.isSignedIn.get()) {
//     const profile = this.authInstance.currentUser.get().getBasicProfile();
//     const email = profile.getEmail();
//     const ldap = email.split('@')[0];
//     return ldap;
//   }
//   return null;
// }


  async initClient(): Promise<void> {

    return new Promise((resolve, reject) => {

      gapi.load('client:auth2', async () => {

        try {

          await gapi.client.init({

            apiKey: 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4',

            clientId: this.clientId,

            scope: this.scopes,

            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']

          });

          this.authInstance = gapi.auth2.getAuthInstance();

          this.gapiSetup = true;

          resolve();

        } catch (error) {

          reject(error);

        }

      });

    });

  }

  async signIn(): Promise<void> {

    if (!this.gapiSetup) await this.initClient();

    return this.authInstance.signIn();

  }

  async signOut(): Promise<void> {

    return this.authInstance.signOut();

  }

  isSignedIn(): boolean {

    return this.authInstance?.isSignedIn.get() || false;

  }

  async getSheetData(spreadsheetId: string, range: string, apiKey: string): Promise<any[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values || [];
  }

}