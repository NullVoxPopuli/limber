import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export async function deleteAllFiles() {
  let files = await openai.files.list();

  for (let fileObj of files.data) {
    await openai.files.del(fileObj.id);
  }
}

export async function uploadDocs() {
  let fileResponse = await openai.files.create({ file: fsSync.createReadStream('training-data.jsonl'), purpose: 'fine-tune' });

  // TODO: wait for processing to finish
  //

  let jobResponse = await openai.fineTuning.jobs.create({ 
    // model: 'ada',
    // model: 'gpt-4',
    model: 'gpt-3.5-turbo-0613',
    training_file: 'file-SiRlTjGS1X5HcPe72vEUyc9F',
    // training_file: response.data.id,
  });

  // TODO: wait for training to finish
}
