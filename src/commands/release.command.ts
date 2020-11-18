import { ArgumentList } from "../argument-list";
import { ICommand } from "./command";

export class ReleaseCommand implements ICommand {

  get name(): string { return "release"; }

  run = (args: ArgumentList): Promise<void> => {
    return Promise.reject("Not implemented");
  }

}