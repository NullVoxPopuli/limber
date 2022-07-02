import type { ComponentLike } from '@glint/template';
import type {
  ContextFrom,
  createMachine,
  EventFrom,
  Interpreter,
  InterpreterFrom,
  MachineConfig,
  StateSchema,
} from 'xstate';

export type Send<T> = Interpreter<ContextFrom<T>>['send'];

export type ComponentFromMachine<T extends ReturnType<typeof createMachine>> = ComponentLike<{
  Args: {
    config?: MachineConfig<ContextFrom<T>, StateSchema<T>, EventFrom<T>>;
    context?: ContextFrom<T>;
    state?: Send<T>; // StateFrom<T>;
  };
  Blocks: {
    default: [
      InterpreterFrom<T>['state'],
      InterpreterFrom<T>['send'],
      InterpreterFrom<T>['onTransition']
    ];
  };
}>;
