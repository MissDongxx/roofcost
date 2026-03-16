/**
 * Zhipu AI Provider
 * Supports GLM-4V (Vision), GLM-4-Flash, GLM-4-Plus, GLM-4-Air
 */

import {
  AIProvider,
  AIConfigs,
  AIGenerateParams,
  AITaskResult,
  AITaskStatus,
} from './types';

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface ZhipuVisionOptions {
  imageUrl: string;
  prompt: string;
  model?: 'glm-4v' | 'glm-4v-plus';
}

export interface ZhipuChatOptions {
  messages: ZhipuMessage[];
  model?: 'glm-4-flash' | 'glm-4-plus' | 'glm-4-air';
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export class ZhipuProvider implements AIProvider {
  readonly name = 'zhipu';
  configs: AIConfigs;
  private apiKey: string;
  private apiBase: string;

  constructor(configs: AIConfigs) {
    this.configs = configs;
    this.apiKey = configs.apiKey || '';
    this.apiBase = configs.apiBase || 'https://open.bigmodel.cn/api/paas/v4';
  }

  /**
   * Generate content (implements AIProvider interface)
   */
  async generate({ params }: { params: AIGenerateParams }): Promise<AITaskResult> {
    // For compatibility with existing AI framework
    const response = await this.callChatAPI({
      messages: [{ role: 'user', content: params.prompt }],
      model: (params.model as any) || 'glm-4-flash',
    });

    return {
      taskStatus: AITaskStatus.SUCCESS,
      taskId: `zhipu_${Date.now()}`,
      taskResult: { text: response.content },
    };
  }

  /**
   * Call GLM-4V Vision API
   * Analyze images and return descriptions
   */
  async callVisionAPI(options: ZhipuVisionOptions): Promise<string> {
    const { imageUrl, prompt, model = 'glm-4v' } = options;

    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: prompt },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zhipu Vision API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Call GLM-4 Chat API
   * Used for classification and description generation
   */
  async callChatAPI(options: ZhipuChatOptions): Promise<{ content: string; usage?: any }> {
    const {
      messages,
      model = 'glm-4-flash',
      jsonMode = false,
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    // Enable JSON mode if requested
    if (jsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zhipu Chat API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
    };
  }

  /**
   * Batch vision analysis for multiple photos
   * Returns array of descriptions
   */
  async batchVisionAnalysis(items: Array<{ imageUrl: string; prompt: string }>): Promise<string[]> {
    const promises = items.map((item) =>
      this.callVisionAPI({ imageUrl: item.imageUrl, prompt: item.prompt })
    );

    const results = await Promise.allSettled(promises);
    return results.map((result) =>
      result.status === 'fulfilled' ? result.value : `Error: ${result.reason}`
    );
  }

  /**
   * Batch chat requests
   * Useful for processing multiple items at once
   */
  async batchChatAPI(
    requests: ZhipuChatOptions[]
  ): Promise<Array<{ content: string; error?: string }>> {
    const promises = requests.map((options) =>
      this.callChatAPI(options).catch((error) => ({ content: '', error: error.message }))
    );

    return Promise.all(promises);
  }

  /**
   * Generate JSON response using GLM-4 with JSON mode
   */
  async generateJSON(
    messages: ZhipuMessage[],
    model: 'glm-4-flash' | 'glm-4-plus' = 'glm-4-flash'
  ): Promise<any> {
    const response = await this.callChatAPI({
      messages,
      model,
      jsonMode: true,
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${response.content}`);
    }
  }
}
