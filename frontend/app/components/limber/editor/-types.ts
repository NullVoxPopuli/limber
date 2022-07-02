export type PositionalArgs = [string, (text: string) => void];
export interface NamedArgs {
  setValue: (callback: (text: string) => void) => void;
}

export type Signature = {
  Args: {
    Positional: PositionalArgs;
    Named: NamedArgs;
  };
};
