import { OpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import dotenv from "dotenv";

dotenv.config();
const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
   });
//const model = new OpenAI({});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });
const res1 = await chain.call({ input: "Hi! I'm Dhruv." });
console.log({ res1 });
const res2 = await chain.call({ input: "What's my name?" });
console.log({ res2 });
