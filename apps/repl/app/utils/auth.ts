import { tracked } from '@glimmer/tracking';

import type { Auth0Client } from '@auth0/auth0-spa-js';

export class Auth0 {
  #client: Auth0Client | null = null;

  constructor() {
    this.#setup();
  }

  @tracked isAuthenticated: boolean | null = null;

  get isPending() {
    return this.isAuthenticated === null;
  }

  #setup = async () => {
    if (this.#client) return this.#client;

    const { createAuth0Client } = await import('@auth0/auth0-spa-js');

    this.#client = await createAuth0Client({
      domain: 'glimdown.us.auth0.com',
      clientId: 'QwKnvGVl1KzoVAuBGc8WYSReeNXahvv2',
    });

    await this.#updateAuthStatus();

    return this.#client;
  };

  #updateAuthStatus = async () => {
    if (!this.#client) return;

    let status = await this.#client.isAuthenticated();

    this.isAuthenticated = status;

    return this.isAuthenticated;
  };

  check = async () => {
    await this.#setup();
    await this.#updateAuthStatus();
  };

  login = async () => {
    let client = await this.#setup();

    if (this.isAuthenticated) return;

    await client.loginWithPopup();
    await this.#updateAuthStatus();
  };

  /**
   * Auth0 should make this easier...
   * - https://community.auth0.com/t/is-login-via-auth0-possible-without-reloading-my-spa/18846
   * - https://community.auth0.com/t/auth0js-logout-without-redirect/23966/2
   * - https://community.auth0.com/t/how-to-logout-without-reload/100289
   */
  logout = async () => {
    await this.#setup();

    if (!this.isAuthenticated) return;

    document.cookie = '';
    this.#client = null;
    await this.#setup();
  };
}
