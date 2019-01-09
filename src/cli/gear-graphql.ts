import commander from 'commander';

commander
  .version(require('../../package.json').version) // tslint:disable-line
  .command('build', 'process graphql files and write output')
  .parse(process.argv);
