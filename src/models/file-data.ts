export class FileData {

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