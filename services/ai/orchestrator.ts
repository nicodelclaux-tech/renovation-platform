import PocketBase from 'pocketbase';

const pb = new PocketBase('http://159.203.27.124:8090');

/**
 * AI ORCHESTRATOR & POCKETBASE INTEGRATION
 */

export class AIOrchestrator {
  private openRouterKey: string;

  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY || '';
  }

  async generateRenovationConcept(roomId: string, userPrompt: string) {
    try {
      // 1. Fetch Room Facts & Project Style Bible from PocketBase
      const room = await pb.collection('rooms').getOne(roomId, {
        expand: 'project'
      });

      const project = room.expand?.project;
      const bible = project?.style_bible || {};
      const facts = room.fixed_architecture || '';

      // 2. Phase 1: The Architect (Reasoning)
      // Assembles the master structured prompt via OpenRouter (using Claude 3.5 or Gemini)
      const architectResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{
            role: 'system',
            content: 'You are an Elite Architectural Prompt Engineer. Combine room facts and project bible into a master prompt for an image generator. Focus on consistency and professional nomenclature.'
          }, {
            role: 'user',
            content: `Room Facts: ${facts}. Style Bible: ${JSON.stringify(bible)}. User Intent: ${userPrompt}`
          }]
        })
      });

      const architectData = await architectResponse.json();
      const masterPrompt = architectData.choices[0].message.content;

      // 3. Phase 2: The Artist (Visual)
      // Dispatches the master prompt to Flux Pro or DALL-E 3
      const artistResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'black-forest-labs/flux-pro',
          messages: [{ role: 'user', content: masterPrompt }]
        })
      });

      const visualData = await artistResponse.json();
      const imageUrl = visualData.image_url; // Adapt based on exact OpenRouter response shape for image models

      // 4. Persistence: Log generation in PocketBase
      const record = await pb.collection('generations').create({
        room: roomId,
        prompt: masterPrompt,
        model_used: 'flux-pro',
        image: imageUrl, // Note: In production you'd download and re-upload to PB Storage
        metadata: { original_prompt: userPrompt }
      });

      return record;
    } catch (error) {
      console.error('Orchestration failed:', error);
      throw error;
    }
  }
}
