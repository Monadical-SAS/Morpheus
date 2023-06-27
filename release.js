const { getRecommendation } = require('conventional-recommended-bump');

const getNextVersion = async () => {
  const options = {
    preset: 'angular', // The conventional commits preset you are using
    whatBump: (commits) => {
      return getRecommendation(commits);
    },
  };

  try {
    const recommendation = await getRecommendation(options);
    const { releaseType } = recommendation;

    if (releaseType) {
      console.log(`Next version: ${releaseType}`);
    } else {
      console.log('No release version found.');
    }
  } catch (error) {
    console.error('Failed to get the next version:', error);
    process.exit(1);
  }
};

getNextVersion().catch((error) => {
  console.error('Failed to get the next version:', error);
  process.exit(1);
});
