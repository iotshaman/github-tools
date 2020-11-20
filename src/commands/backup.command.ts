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
      .then(files => files.map(f => this.sanitizePath(path, f)))
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

  private createArchive = (path: string, files: string[]): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Archiving ${files.length} files.`);
      let archive = _archive("zip");
      let archivePath = _path.join(path, "./github.backup.zip");
      const output = _fs.createWriteStream(archivePath);
      output.on("finish", () => res());
      archive.pipe(output);
      archive.on("error", ex => { err(ex); })
      files.forEach((f, i) => archive.append('testing', {name: `${i}.txt`, prefix: 'test1/test2/'}));
      archive.finalize();
    });
  }

}