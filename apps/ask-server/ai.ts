import OpenAI from 'openai';
import fsSync from 'node:fs';

export const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export async function deleteAllFiles() {
  let files = await openai.files.list();

  for (let fileObj of files.data) {
    await openai.files.del(fileObj.id);
  }
}

const twos = async () => new Promise(resolve => setTimeout(resolve, 2_000));

export async function uploadDocs() {
  let fileResponse = await openai.files.create({ file: fsSync.createReadStream('training-data.jsonl'), purpose: 'fine-tune' });


  while(true) {
    await twos();
    console.info(`Checking status of ${fileResponse.id} (currently ${fileResponse.status}) at ${new Date()}`);

    fileResponse = await openai.files.retrieve(fileResponse.id);

    if (fileResponse.status === 'processed') break;
  }

  let jobResponse = await openai.fineTuning.jobs.create({ 
    model: 'gpt-3.5-turbo-0613',
    training_file: fileResponse.id,
  });

  console.log(jobResponse);
  // TODO: wait for training to finish
  //  Initial: status=created
  //  then: status=running
  //  this can take a good long while
  //
  //  then: status=succeeded
  //     there may be other statuses here

  // once complete, get the list of models, and the id from the last one -- that'll be the one we can use with prompts
}
