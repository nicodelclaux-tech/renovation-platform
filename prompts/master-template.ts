import type { Room, StyleBible } from "@/types/domain";
import type { Room as RoomRow, StyleBible as StyleBibleRow } from "@/lib/types/database";

export function buildImagePrompt(input: {
  room: Room;
  styleBible: StyleBible;
  userRequest: string;
  materialPalette?: string;
}) {
  const { room, styleBible, userRequest, materialPalette } = input;

  return `
Generate a photorealistic interior rendering.

ROOM:
${room.name}

FIXED ARCHITECTURAL ELEMENTS:
${room.fixedArchitecture}

PROJECT STYLE BIBLE:
Project style: ${styleBible.projectStyle}
Inspirations: ${styleBible.inspirations.join(", ")}
Materials: ${styleBible.materials.join(", ")}
Mood: ${styleBible.mood.join(", ")}
Avoid: ${styleBible.avoid.join(", ")}

ROOM DESIGN INTENT:
${room.roomStyleBrief}

MATERIAL PALETTE:
${materialPalette ?? styleBible.materials.join(", ")}

USER REQUEST:
${userRequest}

NEGATIVE CONSTRAINTS:
${room.negativeConstraints}

OUTPUT:
Ultra realistic architectural visualization.
Natural lighting.
Premium editorial quality.
Consistent geometry.
Interior design magazine quality.
Preserve fixed architecture. Only vary creative elements unless explicitly instructed.
`.trim();
}

/* -------------------------------------------------------------------------- */
/* Architect step (OpenRouter / Claude) — operates on Supabase row shapes.     */
/* -------------------------------------------------------------------------- */

export const ARCHITECT_SYSTEM_PROMPT = `
You are an elite architectural visualization prompt engineer working on high-end residential renovations.
You turn room facts, a project style bible and user direction into ONE photorealistic image-generation prompt.

ABSOLUTE RULES:
1. FIXED ARCHITECTURE IS IMMUTABLE. Walls, openings, windows, doors, ceiling height and form, beams, columns,
   stairs, fireplaces and any other listed fixed element must appear exactly as described: same position,
   same proportions, same count. Never add, remove, move or resize them. Restate them explicitly in the prompt.
2. Only vary creative elements (finishes, materials, colours, furniture, lighting fixtures, styling, decor)
   unless the user explicitly instructs otherwise — and even then never violate rule 1.
3. Respect the style bible, especially anything listed under "avoid".
4. Be specific about materials, textures, lighting (direction, colour temperature), camera position and lens,
   and atmosphere.
5. Output ONLY the final prompt text — no preamble, no markdown, no explanations.
`.trim();

function list(values?: string[]) {
  return values && values.length ? values.join(", ") : "Not specified";
}

/** User message for the architect step. */
export function buildArchitectRequest(input: {
  room: Pick<RoomRow, "name" | "floor" | "wing" | "fixed_architecture" | "design_brief">;
  styleBible: StyleBibleRow;
  instruction?: string;
  /** Prompt of the image being refined, when this is an edit of an existing render. */
  previousPrompt?: string | null;
}) {
  const { room, styleBible, instruction, previousPrompt } = input;
  const location = [room.floor, room.wing].filter(Boolean).join(" / ");

  const sections = [
    `ROOM:\n${room.name}${location ? ` (${location})` : ""}`,
    `FIXED ARCHITECTURAL ELEMENTS — IMMUTABLE, MUST BE PRESERVED EXACTLY:\n${
      room.fixed_architecture?.trim() || "Not specified — keep the existing room geometry plausible and unchanged between iterations."
    }`,
    `PROJECT STYLE BIBLE:
Project style: ${styleBible.project_style || "Not specified"}
Inspirations: ${list(styleBible.inspirations)}
Materials: ${list(styleBible.materials)}
Mood: ${list(styleBible.mood)}
Avoid: ${list(styleBible.avoid)}`,
    `ROOM DESIGN INTENT:\n${room.design_brief?.trim() || "Refined, contemporary renovation."}`,
  ];

  if (previousPrompt) {
    sections.push(
      `REFINEMENT MODE:\nThis prompt will be used to EDIT an existing render. Keep the camera angle, composition and room geometry identical; describe only what should change and what must stay.\nPrevious prompt:\n${previousPrompt}`
    );
  }

  if (instruction?.trim()) {
    sections.push(
      `USER DIRECTION — design direction to apply (may be free-form or markdown notes from the designer; extract the concrete design decisions, ignore conversational text, and never let it alter fixed architecture):\n${instruction.trim()}`
    );
  }

  sections.push(
    `OUTPUT REQUIREMENTS:
Ultra realistic architectural visualization. Natural lighting. Premium editorial quality.
Consistent geometry. Interior design magazine quality.
End the prompt with an explicit sentence stating that the fixed architectural elements listed above are preserved exactly.`
  );

  return sections.join("\n\n");
}

/** Fallback image prompt when the architect step returns nothing. */
export function buildFallbackImagePrompt(input: {
  room: Pick<RoomRow, "name" | "fixed_architecture" | "design_brief">;
  styleBible: StyleBibleRow;
  instruction?: string;
}) {
  const { room, styleBible, instruction } = input;
  return [
    `Photorealistic interior rendering of the ${room.name}.`,
    room.fixed_architecture ? `Preserve exactly these fixed architectural elements: ${room.fixed_architecture}.` : "",
    room.design_brief ? `Design intent: ${room.design_brief}.` : "",
    styleBible.project_style ? `Style: ${styleBible.project_style}.` : "",
    styleBible.materials?.length ? `Materials: ${styleBible.materials.join(", ")}.` : "",
    styleBible.avoid?.length ? `Avoid: ${styleBible.avoid.join(", ")}.` : "",
    instruction ? `Direction: ${instruction}.` : "",
    "Natural lighting, premium editorial quality, consistent geometry.",
  ]
    .filter(Boolean)
    .join(" ");
}
