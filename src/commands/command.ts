import { ArgumentList } from "../argument-list";

export interface ICommand {
  name: string;
  run: (args: ArgumentList) => Promise<void>;
}