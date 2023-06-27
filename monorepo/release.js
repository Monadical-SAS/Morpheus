const semanticRelease = require('semantic-release');

const getNextVersion = async () => {
  const options = {
    // Configuration options for semantic-release
    // Add your specific configuration here if needed
  };

  const result = await semanticRelease(options);

  if (result.nextRelease) {
    console.log(`Next version: ${result.nextRelease.version}`);
  } else {
    console.log('No release version found.');
  }
};

getNextVersion().catch((error) => {
  console.error('Failed to get the next version:', error);
  process.exit(1);
});
