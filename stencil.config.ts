import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
  taskQueue: 'async',
  outputTargets: [{
    baseUrl: 'https://cinema-booking-pwa-app.herokuapp.com',
    type: 'www',
    serviceWorker: {
      swSrc: 'src/sw.js',
    }
  }],
};
