import { parser } from '@glimdown/lezer-glimmer-expression';

export function parse(input: string) {
  let tree = parser.parse(input);

  let stringifiedTree = tree.toString();

  return format(stringifiedTree);
}

function format(flatTree) {
  let result = '';
  let indent = 0;
  let inQuote = false;

  let quoteSplit = flatTree.split(/("[^"]+")/g);

  let sections = quoteSplit
    .map((s) => {
      if (s.startsWith('"') && s.endsWith('"')) {
        return s;
      }

      return s.split(/([()])/g);
    })
    .flat()
    .filter(Boolean);

  // Combine groups of non ( or )
  let combined = sections.reduce((acc, current) => {
    let last = acc[acc.length - 1];

    if (last) {
      if (!last.endsWith('(') && last !== ')') {
        if (current !== '(' && current !== ')') {
          acc[acc.length - 1] = last + current;

          return acc;
        }
      }

      if (!last.endsWith('(') && current === '(') {
        acc[acc.length - 1] = last + current;

        return acc;
      }
    }

    acc.push(current);

    return acc;
  }, []);

  for (let section of combined) {
    if (section.endsWith('(')) {
      if (inQuote) break;
      result += indentFor(indent) + section + '\n';
      indent += 2;
    } else if (section.endsWith(')')) {
      if (inQuote) break;
      indent -= 2;
      result += '\n' + indentFor(indent) + section;
    } else {
      result += indentFor(indent) + section;
    }
  }

  return result;
}

function indentFor(size = 0) {
  return Array(size).fill(' ').join('');
}
