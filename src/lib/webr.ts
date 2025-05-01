import { WebR } from 'webr';

export const webR = new WebR();

export async function initWebR() {
  await webR.init();
}

async function getRandomNumbers() {
    await webR.init();
    const result = await webR.evalR('rnorm(20,10,10)');
    try {
      return await result;
    } finally {
      webR.destroy(result);
    }
  }