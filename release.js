const { getNextVersion } = require('semantic-release/lib/get-next-version');
const { getConfig } = require('semantic-release/lib/get-config');

async function getNextReleaseVersion() {
  const config = await getConfig();
  const nextVersion = await getNextVersion(config);
  return nextVersion;
}

async function run() {
  const nextVersion = await getNextReleaseVersion();
  console.log('Next version:', nextVersion);
  process.env.NEXT_VERSION = nextVersion;
}

run().catch((error) => {
  console.error('Error retrieving next version:', error);
  process.exit(1);
});
