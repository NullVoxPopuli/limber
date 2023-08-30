import path from 'node:path';
import { globby } from 'globby';
import fse from 'fs-extra';
import { project } from 'ember-apply';

export async function getDocsIntro() {
  const intro = path.join(await project.gitRoot(), '/apps/tutorial/docs/1-introduction/1-basics/prose.md'); 

  return (await fse.readFile(intro)).toString();
}

export async function getDocs() {
  const tutorialDocs = path.join(await project.gitRoot(), '/apps/tutorial/docs'); 
  let files = await globby(tutorialDocs + '/**/prose.md');

  let documents = [];
  for (let prosePath of files) {
    let dir = path.dirname(prosePath);
    let promptPath = path.join(dir, 'prompt.gjs');
    let answerPath = path.join(dir, 'answer.gjs');
    let tutorialPath = path.relative(tutorialDocs, dir);

    // chapters starting with x are in-progress
    if (tutorialPath.startsWith('x-')) continue;

    let allExist = (await Promise.all([fse.pathExists(prosePath), fse.pathExists(promptPath), fse.pathExists(answerPath)])).every(Boolean);

    if (!allExist) continue;

    let prose = await fse.readFile(prosePath);
    let prompt = await fse.readFile(promptPath);
    let answer = await fse.readFile(answerPath);

    documents.push({ prose: prose.toString(), prompt: prompt.toString(), answer: answer.toString() });
  }

  return documents;
}

export async function buildDocs() {
  let docs = await getDocs();

  return docs.map(doc => JSON.stringify({
    messages: [
      { role: 'system', content: emberContext },
      { role: 'user', content: doc.prose },
      { role: 'assistant', content: doc.answer },
    ],
  })).join('\n');
}

export const emberContext = 
  `You are tool for helping programmers write modern, beautiful code, written in only the most cutting edge paradigms, features, and syntax for EmberJS. ` 
  + `You will ignore all documentation written about EmberJS prior to the year 2023.` 
  + `You ignore anything about React, as the syntax does not apply to vanilla JavaScript. `
  + `Ember uses vanilla javascript. ` +
  + `Feel free to reference pages from MDN. ` +
  + `Do not use lifecycle events. ` +
  + `Know that in order for UI to update, there is root state that must be marked as "tracked".` +
  + `Tracked State may be abstracted -- for example in \`cell\` from \`ember-resources\`.` + 
  + `Prefer using \`ember-resources\` where possible.` +
  + `Additionally, all answers provided will be a combination of Ember's next edition of paradigms, titled "Polaris", and the patterns and tools written by a community member, NullVoxPopuli.` + await getDocsIntro(); 

