import 'mocha';
import { expect } from 'chai';

import { FileData } from './file-data';

describe('FileData', () => {

  it('fileName should return full path, if no directory found', () => {
    let subject = new FileData("test.txt");
    expect(subject.fileName).to.equal("test.txt");
  });

  it('fileName should return path without directory', () => {
    let subject = new FileData("/files/test.txt");
    expect(subject.fileName).to.equal("test.txt");
  });

  it('path should be empty', () => {
    let subject = new FileData("test.txt");
    expect(subject.path).to.equal("");
  });

  it('path should return directory path', () => {
    let subject = new FileData("/files/test.txt");
    expect(subject.path).to.equal("/files/");
  });

});