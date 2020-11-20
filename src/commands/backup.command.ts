import * as _path from 'path';
import * as _glob from 'fast-glob';
import * as _fs from 'fs';
import * as _archive from 'archiver';

import { ArgumentList } from "../argument-list";
import { ICommand } from "./command";

export class BackupCommand implements ICommand {

  globService = _glob;
  get name(): string { return "backup"; }

  run = (args: ArgumentList): Promise<void> => {
    let path = _path.join(process.cwd(), args.root ?? "./");
    let patterns = ["**/.gitignore", "!**/node_modules/*"];
    return this.getFilesFromGlob(path, patterns)
      .then(files => files.map(f => f.replace(".gitignore", "**/*")))
      .then(files => files.map(f => this.sanitizePath(path, f)))
      .then(files => ["!**/node_modules/**/*", ...files])
      .then(files => this.getFilesFromGlob(path, files))
      .then(files => files.map(f => this.sanitizePath(path, f, "")))
      .then(files => files.map(f => new FileData(f)))
      .then(files => this.createArchive(path, files));
  }

  private getFilesFromGlob = (cwd: string, patterns: string[]): Promise<string[]> => {
    return this.globService(patterns, {cwd}).then((rslt: string[]) => {
      return rslt.map(file => _path.join(cwd, file))
    });
  }

  private sanitizePath = (root: string, file: string, prefix: string = "./") => {
    let path = file.replace(root, "").replace(/\\/g, "/");
    return `${prefix}${path}`;
  }

  private createArchive = (path: string, files: FileData[]): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Archiving ${files.length} files.`);
      let archive = _archive("zip");
      let archivePath = _path.join(path, "./github.backup.zip");
      const output = _fs.createWriteStream(archivePath);
      output.on("finish", () => res());
      archive.pipe(output);
      archive.on("error", ex => { err(ex); });
      files.forEach(f => {
        let stream = _fs.createReadStream(_path.join(path, f.filePath));
        archive.append(stream, {name: f.fileName, prefix: f.path});
      });
      archive.finalize();
    });
  }

}

class FileData {

  constructor(public filePath: string) { }

  public get fileName(): string {
    let index = this.filePath.lastIndexOf('/');
    if (index < 0) return this.filePath;
    return this.filePath.substring(index + 1);    
  }

  public get path(): string {
    let filename = this.fileName;
    let path = this.filePath.replace(filename, "");
    return path == filename ? "" : `${path}/`
  }

}