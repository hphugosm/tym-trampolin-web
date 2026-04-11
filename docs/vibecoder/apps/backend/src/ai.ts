import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import axios from "axios";
export class AIProvider {
  private openai: OpenAI | null;
  private gemini: GoogleGenerativeAI | null;

  private opencodeZenKey: string | undefined;

  constructor(openaiKey: string | undefined, googleKey: string | undefined) {
    this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
    this.gemini = googleKey ? new GoogleGenerativeAI(googleKey) : null;
    this.opencodeZenKey = process.env.OPENCODE_ZEN_API_KEY;
  }

  async callOpenCodeZen(prompt: string, context: string = "", model: string = "opencode/big-pickle"): Promise<string> {
    if (!this.opencodeZenKey) {
      return this.mockResponse(`[OpenCode Zen Mock] ${prompt.slice(0, 60)}...`);
    }
    try {
      const messages = [
        { role: "user", content: context ? `${context}\n\n${prompt}` : prompt }
      ];
      const res = await axios.post(
        "https://opencode.ai/zen/v1/chat/completions",
        {
          model,
          messages
        },
        {
          headers: {
            Authorization: `Bearer ${this.opencodeZenKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      const content = res.data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenCode Zen");
      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OpenCode Zen error";
      throw new Error(`OpenCode Zen call failed: ${message}`);
    }
  }

  async callOpenAI(prompt: string, context: string = ""): Promise<string> {
    if (!this.openai) {
      // Fallback mock response for development without API key
      return this.mockResponse(`[OpenAI Mock] ${prompt.slice(0, 60)}...`);
    }

    try {
      const message = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: context ? `${context}\n\n${prompt}` : prompt
          }
        ]
      });

      const content = message.choices[0]?.message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return content;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OpenAI error";
      throw new Error(`OpenAI call failed: ${message}`);
    }
  }

  async callGemini(prompt: string, context: string = ""): Promise<string> {
    if (!this.gemini) {
      // Fallback mock response for development without API key
      return this.mockResponse(`[Gemini Mock] ${prompt.slice(0, 60)}...`);
    }

    try {
      const model = this.gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Gemini error";
      throw new Error(`Gemini call failed: ${message}`);
    }
  }

  private mockResponse(label: string): string {
    return `${label}
---
This is a mock response from the AI provider (API key not configured).
In production, OpenAI and Gemini API keys must be set in .env file.
`;
  }
}
