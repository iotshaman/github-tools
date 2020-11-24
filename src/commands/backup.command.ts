import * as _path from 'path';
import * as _glob from 'fast-glob';
import * as _fs from 'fs';
import * as _archive from 'archiver';

import { ArgumentList } from "../argument-list";
import { ICommand } from "./command";
import { FileData } from '../models/file-data';

export class BackupCommand implements ICommand {

  globService = _glob;
  get name(): string { return "backup"; }

  run = (args: ArgumentList): Promise<void> => {
    console.log("Running backup command...")
    let path = _path.join(process.cwd(), args.root ?? "./");
    let patterns = ["*/.git/HEAD", "!**/node_modules/**/*"];
    return this.getFilesFromGlob(path, patterns)
      .then(files => { console.log(`Found ${files.length} packages.`); return files; })
      .then(files => files.map(f => this.sanitizePath(path, f)))
      .then(files => files.map(f => f.replace(".git/HEAD", "**/*")))
      .then(files => ["!**/node_modules/**/*", ...files])
      .then(files => this.getFilesFromGlob(path, files))
      .then(files => files.map(f => this.sanitizePath(path, f, "")))
      .then(files => files.map(f => new FileData(f)))
      .then(files => this.createArchive(path, files, args.output, !!args.verbose));
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

  private createArchive = (path: string, files: FileData[], outputFile: string, verbose: boolean): Promise<void> => {
    return new Promise((res, err) => {
      console.log(`Archiving ${files.length} files.`);
      let archive = _archive("zip");
      let archivePath = _path.join(path, outputFile ?? "./github.backup.zip");
      const output = _fs.createWriteStream(archivePath);
      output.on("finish", () => res());
      archive.pipe(output);
      archive.on("error", ex => { err(ex); });
      files.forEach(f => {
        let stream = _fs.createReadStream(_path.join(path, f.filePath));
        archive.append(stream, {name: f.fileName, prefix: f.path});
        if (verbose) console.log(`Archiving file: ${f.filePath}`);
      });
      archive.finalize();
    });
  }

}