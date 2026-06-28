import { createApp } from './app';
import { getDb } from './db/connection';
import { migrate } from './db/migrate';
import { env } from './env';

function main(): void {
  getDb();
  migrate();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`PenFolio API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main();
