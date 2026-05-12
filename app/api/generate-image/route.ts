import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://159.203.27.124:8090');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomId, userPrompt } = req.body;
  
  // Note: We move the orchestrator logic inside the API route for simplicity in the scaffold
  try {
     // 1. Get Context
     const room = await pb.collection('rooms').getOne(roomId, { expand: 'project' });
     const project = room.expand?.project;
     
     // 2. OpenRouter Header
     const headers = {
       'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
       'Content-Type': 'application/json',
       'HTTP-Referer': 'https://renovation-ai.platform', 
       'X-Title': 'Renovation AI'
     };

     // 3. Assemble Prompt (The Architect)
     const architectRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
       method: 'POST', headers,
       body: JSON.stringify({
         model: 'anthropic/claude-3-5-sonnet',
         messages: [
           { role: 'system', content: 'You are an Architectural Orchestrator. Create a highly detailed image generation prompt. Maintain architecture facts. Vibe: High-end editorial.' },
           { role: 'user', content: `Style: ${JSON.stringify(project?.style_bible)}. Architecture: ${room.fixed_architecture}. Request: ${userPrompt}` }
         ]
       })
     });
     const architectData = await architectRes.json();
     const masterPrompt = architectData.choices?.[0]?.message?.content;

     // 4. Generate Image (The Artist)
     // Swapping to a highly capable model for architecture
     const artistRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
       method: 'POST', headers,
       body: JSON.stringify({
         model: 'black-forest-labs/flux-pro', // Using Flux Pro for realism
         prompt: masterPrompt
       })
     });
     const visualData = await artistRes.json();
     
     // 5. Store result
     const generation = await pb.collection('generations').create({
       room: roomId,
       prompt: masterPrompt,
       model_used: 'flux-pro',
       image_url: visualData.id || visualData.image_url // Simplified
     });

     return res.status(200).json(generation);
  } catch (err: any) {
     return res.status(500).json({ error: err.message });
  }
}
