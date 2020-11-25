import 'mocha';
import * as sinon from 'sinon';
import * as _fs from 'fs';
import { expect } from 'chai';

import { BackupCommand } from './backup.command';

describe('BackupCommand', () => {
  
  let sandbox: sinon.SinonSandbox; 
  let consoleMock = {log: null}

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    consoleMock.log = sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('name should equal "backup"', () => {
    let subject = new BackupCommand();
    expect(subject.name).to.equal("backup");
  });

  it('run should return empty promise', (done) => {
    let subject = new BackupCommand();
    let globService = sandbox.stub(subject, 'globService');
    globService.onCall(0).returns(Promise.resolve(["F:/Apps/Sample/.git/HEAD"]));
    globService.onCall(1).returns(Promise.resolve(["F:/Apps/Sample/index.js"]));
    sandbox.stub(subject, 'archiveService').returns(GetMockArchive(sandbox));
    sandbox.stub(_fs, 'createReadStream').returns(null);
    subject.run({}).then(_ => done());
  });

  it('run (with arguments) should return empty promise', (done) => {
    let subject = new BackupCommand();
    let globService = sandbox.stub(subject, 'globService');
    globService.onCall(0).returns(Promise.resolve(["F:/Apps/Sample/.git/HEAD"]));
    globService.onCall(1).returns(Promise.resolve(["F:/Apps/Sample/index.js"]));
    sandbox.stub(subject, 'archiveService').returns(GetMockArchive(sandbox));
    sandbox.stub(_fs, 'createReadStream').returns(null);
    subject.run({root: '../', output: './output.zip', verbose: "true"}).then(_ => done());
  });

  it('run should throw error if archiver throws', (done) => {
    let subject = new BackupCommand();
    let globService = sandbox.stub(subject, 'globService');
    globService.onCall(0).returns(Promise.resolve(["F:/Apps/Sample/.git/HEAD"]));
    globService.onCall(1).returns(Promise.resolve(["F:/Apps/Sample/index.js"]));
    sandbox.stub(subject, 'archiveService').returns(GetMockArchive(sandbox, false));
    sandbox.stub(_fs, 'createReadStream').returns(null);
    subject.run({}).catch(ex => {
      expect(ex.message).to.equal("Test error.");
      done();
    });
  });

});

function GetMockArchive(sandbox: sinon.SinonSandbox, success: boolean = true): any {
  let callbacks = { error: (_ex) => {} };
  let onCompleteStub = sinon.stub();
  sandbox.stub(_fs, 'createWriteStream').returns(<any>{on: onCompleteStub});
  return {
    pipe: (_stream) => {},
    on: (event, callback) => callbacks[event] = callback,
    append: (_stream, _data) => {},
    finalize: () => {
      if (!success) return callbacks.error(new Error("Test error."));
      onCompleteStub.getCall(0).args[1]();
    }
  }
}