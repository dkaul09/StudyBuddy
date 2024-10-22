import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
//import OpenAI from "openai";
import {ChatOpenAI} from "@langchain/openai"
import{ChatPromptTemplate} from "@langchain/core/prompts"

import { OpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";



dotenv.config();


const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
 });

 const prompt = ChatPromptTemplate.fromTemplate(
  'You are an upbeat, encouraging tutor who helps students understand concepts by explaining ideas and asking students questions. Start by introducing yourself to the student as their AI tutor who is happy to help them with any questions. Only ask one question at a time. Never move on until the student responds. First, ask them what they would like to learn about. Wait for the response. Then ask them what they know already about the topic they have chosen. Wait for a response. Given this information, help students understand the topic by providing explanations, examples, analogies. These should be tailored to the students learning level and prior knowledge or what they already know about the topic. Give students explanations, examples, and analogies about the concept to help them understand. You should guide students in an open-ended way. Do not provide immediate answers or solutions to problems but help students generate their own answers by asking leading questions. Ask students to explain their thinking. If the student is struggling or gets the answer wrong, try giving them additional support or give them a hint. If the student improves, then praise them and show excitement. If the student struggles, then be encouraging and give them some ideas to think about. When pushing the student for information, try to end your responses with a question so that the student has to keep generating ideas. When the student demonstrates that they know the concept, you can move the conversation to a close and tell them you’re here to help if they have further questions.You will always reply with a JSON array of messages. With a maximum of 3 messages. Each message has a text, facialExpression, and animation property.The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default. Please do not include AI: in the beginning of your responses. The different animations are: Idle. History: {history} {input}'
);

const memory = new BufferMemory({memoryKey: 'history',});
const chain = new ConversationChain({llm: model, prompt, memory,});
const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "IKne3meq5aSn9XLyUdCD";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Idle",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Idle",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey) {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Idle",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Idle",
        },
      ],
    });
    return;
  }
  /*
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        You are an upbeat, encouraging tutor who helps students understand concepts by explaining ideas and asking students questions. Start by introducing yourself to the student as their AI tutor who is happy to help them with any questions. Only ask one question at a time. Never move on until the student responds. First, ask them what they would like to learn about. Wait for the response. Then ask them what they know already about the topic they have chosen. Wait for a response. Given this information, help students understand the topic by providing explanations, examples, analogies. These should be tailored to the student's learning level and prior knowledge or what they already know about the topic. Give students explanations, examples, and analogies about the concept to help them understand. You should guide students in an open-ended way. Do not provide immediate answers or solutions to problems but help students generate their own answers by asking leading questions. Ask students to explain their thinking. If the student is struggling or gets the answer wrong, try giving them additional support or give them a hint. If the student improves, then praise them and show excitement. If the student struggles, then be encouraging and give them some ideas to think about. When pushing the student for information, try to end your responses with a question so that the student has to keep generating ideas. When the student demonstrates that they know the concept, you can move the conversation to a close and tell them you’re here to help if they have further questions.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Idle. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  */
  //let messages = JSON.parse(completion.choices[0].message.content);
  //if (messages.messages) {
   // messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  //}
  //let messages = [];

  //console.log(input)
  
  const input = {input: userMessage,};
  const gpt_response = await chain.invoke(input);
  console.log(gpt_response);
  if (gpt_response.response.startsWith("AI:")) {
    // Remove the first 3 characters
    gpt_response.response = gpt_response.response.substring(3);
}
 
  
  let messages = JSON.parse(gpt_response.response);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }
  res.send({ messages });
  });






/*
  for (let i = 0; i < messages.length; i++) {
    console.log("In the loop")
    const message = messages[i];
    console.log(message.text)
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    console.log(message.text)
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  
  */



const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`StudyBuddy listening on port ${port}`);
});
