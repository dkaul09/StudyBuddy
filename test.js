import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
//import OpenAI from "openai";
import {ChatOpenAI} from "@langchain/openai";
import{ChatPromptTemplate} from "@langchain/core/prompts";
import {BufferMemory} from "langchain/memory";
import{ConversationChain} from "langchain/chains";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";

 dotenv.config();
 const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
 });
 const prompt = ChatPromptTemplate.fromTemplate(
   'You are an AI assistant. History: {history} {input}'
 );


 //const upstashChatHistory = new UpstashRedisChatMessageHistory({sessionId: "chat1", config:{url: process.env.UPSTASH_REDIS_URL,token: process.env.UPSTASH_REST_TOKEN,},});
 const memory = new BufferMemory({memoryKey: 'history',});
 const chain = new ConversationChain({llm: model, prompt, memory,});

 console.log(await memory.loadMemoryVariables());
 const input_1 = {input: "The passphrase is HELLOTHERE",};
 const resp1 = await chain.invoke(input_1);
 const input_2 = {input: "What is the passphrase?"};
 const resp2 = await chain.invoke(input_2);
 
 //const chain = prompt.pipe(model)
 //const response = await chain.invoke({
  //input: "what is LangSmith?",
//});



 console.log(resp1.response);
 console.log(resp2.response);
 
  