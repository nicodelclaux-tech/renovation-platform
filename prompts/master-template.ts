import type { Room, StyleBible } from "@/types/domain";

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
