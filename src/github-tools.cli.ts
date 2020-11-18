#!/usr/bin/env node
import * as yargs from 'yargs';
import { ArgumentList } from './argument-list';
import { GithubTools } from './github-tools';

/* istanbul ignore next */
(function() {
  let tools = new GithubTools();
  if (process.argv.length < 3) throw new Error("Invalid number of arguments.");
  const [command] = process.argv.slice(2);
  const argv =  <ArgumentList>yargs(process.argv.slice(3)).argv;
  tools.RunCommand(command, argv)
    .then(_ => { process.exit(0); })
    .catch(ex => {
      console.error(ex);
      process.exit(1);
    });
})();

function test(args: ArgumentList) {

}