import Service from '@ember/service';

/**
 * Build the structure used by the docs service for mocking.
 */
function makeDocsTree(treeData: [string, string[]][]) {
  const pages = [];

  for (const [groupName, tutorialNames] of treeData) {
    const groupPath = groupName
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const groupPages = [];

    for (const tutorialName of tutorialNames) {
      const tutorialPath = tutorialName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const prosePath = `/${groupPath}/${tutorialPath}/prose.md`;

      const page = {
        path: tutorialPath,
        name: tutorialName,
        cleanedName: tutorialName.replace(/-/g, ' '),
        pages: [
          {
            path: prosePath,
            name: 'prose',
            groupName: tutorialName.replace(/-/g, ' '),
            cleanedName: 'prose',
          },
        ],
        first: prosePath,
      };

      groupPages.push(page);
    }
    const group = {
      path: groupPath,
      name: groupName,
      cleanedName: groupName.replace(/-/g, ' '),
      pages: groupPages,
      first: `/${groupPath}/${groupPages[0]?.path}/prose.md`,
    };
    pages.push(group);
  }

  return {
    name: 'root',
    pages,
    path: 'root',
    first: `/${pages[0]?.path}/${pages[0]?.pages[0]?.path}/prose.md`,
  };
}

export class MockDocsService extends Service {
  #groupsTree = {};
  #currentPath = '/';

  get grouped() {
    return this.#groupsTree;
  }

  get currentPath() {
    return this.#currentPath;
  }

  // Test extension
  _setGroupsData(treeData: [string, string[]][]) {
    this.#groupsTree = makeDocsTree(treeData);
  }

  _setCurrentPath(path: string) {
    this.#currentPath = path;
  }
}

export class MockRouterService extends Service {
  transitionTo(newRoute: string) {
    this._assert.step(`transition to: ${newRoute}`);
  }

  // Test extension
  _assert!: Assert;
  _setAssert(assert: Assert) {
    this._assert = assert;
  }
}
