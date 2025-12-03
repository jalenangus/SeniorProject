"use server";

import { recommendBuilding } from "@/ai/flows/building-recommendation";
import { z } from "zod";

const SuggestionInput = z.object({
  justification: z.string(),
});

export async function getBuildingSuggestion(justification: string) {
  try {
    const validatedInput = SuggestionInput.parse({ justification });
    const result = await recommendBuilding(validatedInput);
    return { buildingSuggestion: result.buildingSuggestion };
  } catch (error) {
    console.error("Error getting building suggestion:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid input." };
    }
    return { error: "Failed to get AI suggestion." };
  }
}
