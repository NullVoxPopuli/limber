export interface Manifest {
  first: Tutorial;
  list: Tutorial[][];
  grouped: { [group: string]: Tutorial[] };
}

export interface Tutorial {
  path: string;
  name: string;
  groupName: string;
  tutorialName: string;
}
