
import { UnstructuredClient } from "unstructured-client";
import { Strategy } from "unstructured-client/sdk/models/shared";
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://159.203.27.124:8090');

/**
 * ARCHITECTURAL INGESTOR SERVICE
 * Uses Unstructured.io to extract geometry and constraints from floorplans.
 */
export class ArchitecturalIngestor {
  private client: UnstructuredClient;

  constructor() {
    this.client = new UnstructuredClient({
      serverURL: "https://api.unstructured.io/general/v0/general",
      security: { apiKeyAuth: process.env.UNSTRUCTURED_API_KEY },
    });
  }

  async processFloorplan(assetId: string) {
    // 1. Fetch asset from PocketBase
    const asset = await pb.collection('assets').getOne(assetId);
    const fileUrl = pb.files.getUrl(asset, asset.file);

    // 2. Extract structured data via Unstructured
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    
    // Note: Simplified for the scaffold. In production, we send to Unstructured.io
    // for OCR and table/layout extraction of architectural notes.
    console.log("Processing architectural document via Unstructured...");
    
    // 3. Update Room with "Fixed Facts"
    // Mock extraction for MVP:
    const extractedFacts = "Ceiling Height: 2.9m; Window: Original Victorian Sash; Walls: Load-bearing brick.";
    
    await pb.collection('rooms').update(asset.room, {
      fixed_architecture: extractedFacts
    });

    return extractedFacts;
  }
}
