'use strict';
// https://blog.bitsrc.io/interacting-with-openai-in-node-js-and-express-647e771fc4ad
//
// https://platform.openai.com/docs/api-reference/completions/create
// https://vaadin.com/blog/how-to-build-a-chatgpt-assistant-for-your-documentation
// https://github.com/marcushellberg/vaadin-docs-assistant
// 
// Testing:
// ❯ curl -X POST http://0.0.0.0:5000/ask -d '{"prompt": "What does a component look like"}' -H "Content-Type: application/json"


import express from 'express';
import OpenAI from 'openai';
import fse from 'fs-extra';

import { emberContext, buildDocs, getDocs } from './local-docs';
import { openai } from './ai';

const app = express();
app.use(express.json());

const port = process.env['PORT'] || 5000;

const divider = '###';

await fse.writeFile('training-data.jsonl', await buildDocs());


const data = new FormData();

data.append('purpose', 'fine-tune');

// console.log(await openai.files.list());

// console.log(await openai.fineTuning.jobs.list());
// openai.fineTunes.retrieve("ft-icj7IC4ocJ2NSchlgEsy6WBF")

// await openai.models.del('ada:ft-personal-2023-08-30-02-15-57');
// console.log(await openai.models.list()); 

// console.log(emberContext);

const docs = await getDocs();

function generatePrompt(prompt: string): OpenAI.Chat.CompletionCreateParams['messages'] {
  return [
    {
      role: 'system',
      content: emberContext,
    },
    ...docs.slice(0, 10).map(doc => {
      return {
        role: 'system',
        content: `Given the prompt """${doc.prose}""", I produce the code """${doc.answer}"""`
      } as const;
    }),
    {
      role: 'user',
      content: prompt,
    }
  ];
}


app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;

  if (prompt == null) {
    return res.status(400).json({ success: false, message: 'no prompt provided' });
  }

  try {
     const params: OpenAI.Chat.CompletionCreateParams = {
      model: 'gpt-4',
      // model: 'gpt-3.5-turbo-0613',
      // model: 'ft:gpt-3.5-turbo-0613:personal::7t5UMNAC',
      messages: generatePrompt(prompt),
      // max_tokens: 20_000
    };
    const completion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
    // const completion = await openai.completions.create(params);

    // console.log(completion.choices);
    console.log(completion.choices[0]?.message);

    return res.status(200).json({
      success: true,
      message: completion.choices[0]?.message,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));
