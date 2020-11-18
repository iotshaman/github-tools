import 'mocha';
import { expect } from 'chai';
import { GithubTools } from './github-tools';
import { ICommand } from './commands/command';
import { ArgumentList } from './argument-list';

describe('MySqlShaman', () => {

  it('should be created', () => {
    let factory = new GithubTools();
    expect(factory).not.to.be.null;
  })

  it('RunCommand should throw if no command provided', () => {
    let factory = new GithubTools([new MockCommand()]);
    let msg = "Command parameter not provided.";
    expect(() => factory.RunCommand(null, {})).to.throw(msg);
  });

  it('RunCommand should throw if invalid command', () => {
    let factory = new GithubTools([new MockCommand()]);
    let msg = "Invalid command 'invalid'.";
    expect(() => factory.RunCommand("invalid", {})).to.throw(msg);
  });

  it('RunCommand should return resolved promise', (done) => {
    let factory = new GithubTools([new MockCommand()]);
    factory.RunCommand("mock", {}).then(done);
  });

})

class MockCommand implements ICommand {
  name: string = 'mock';
  run(_: ArgumentList) {
    return Promise.resolve();
  }
}