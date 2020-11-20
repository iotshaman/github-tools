import { ICommand } from "./commands/command";
import { ArgumentList } from "./argument-list";
import { ReleaseCommand } from "./commands/release.command";
import { BackupCommand } from "./commands/backup.command";

export class GithubTools {

  constructor(private commands: ICommand[] = GithubToolsCommands) { }

  RunCommand = (command: string, args: ArgumentList): Promise<void> => {
    if (!command) throw new Error("Command parameter not provided.");
    let cmd = this.commands.find(c => c.name == command);
    if (!cmd) throw new Error(`Invalid command '${command}'.`)
    return cmd.run(args);
  }

}

const GithubToolsCommands: ICommand[] = [
  new ReleaseCommand(),
  new BackupCommand()
]