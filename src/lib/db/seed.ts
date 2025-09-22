import { db } from "./connection";
import { workflowConfigs } from "./schema";
import { eq } from "drizzle-orm";

// Initial workflow configurations
const initialWorkflowConfigs = [
  {
    id: "mannequin-to-human-v1",
    name: "Mannequin to Human Model v1",
    description:
      "Transform apparel images from mannequin to realistic human model with basic settings",
    falEndpoint: "fal-ai/flux-lora",
    defaultParameters: {
      aspect_ratio: "4:3",
      style_strength: 75,
      lighting_style: "studio",
      background_setting: "studio_white",
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
    isActive: true,
  },
  {
    id: "mannequin-to-human-v2",
    name: "Mannequin to Human Model v2",
    description:
      "Advanced transformation with enhanced realism and lighting options",
    falEndpoint: "fal-ai/flux-lora-fast",
    defaultParameters: {
      aspect_ratio: "4:3",
      style_strength: 80,
      lighting_style: "natural",
      background_setting: "outdoor_natural",
      num_inference_steps: 32,
      guidance_scale: 4.0,
      enable_safety_checker: true,
    },
    isActive: true,
  },
  {
    id: "apparel-enhancement",
    name: "Apparel Enhancement",
    description:
      "Enhance apparel details and textures while maintaining original form",
    falEndpoint: "fal-ai/flux-dev",
    defaultParameters: {
      aspect_ratio: "1:1",
      style_strength: 60,
      lighting_style: "soft",
      background_setting: "studio_white",
      num_inference_steps: 24,
      guidance_scale: 2.5,
    },
    isActive: false, // Disabled by default for MVP
  },
];

export async function seedWorkflowConfigs() {
  try {
    console.log("Seeding workflow configurations...");

    for (const config of initialWorkflowConfigs) {
      // Check if config already exists
      const existing = await db
        .select()
        .from(workflowConfigs)
        .where(eq(workflowConfigs.id, config.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(workflowConfigs).values(config);
        console.log(`✓ Inserted workflow config: ${config.name}`);
      } else {
        console.log(`- Workflow config already exists: ${config.name}`);
      }
    }

    console.log("Workflow configurations seeded successfully!");
  } catch (error) {
    console.error("Error seeding workflow configurations:", error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");
    await seedWorkflowConfigs();
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
}

// Function to reset workflow configs (useful for development)
export async function resetWorkflowConfigs() {
  try {
    console.log("Resetting workflow configurations...");

    // Delete all existing configs
    await db.delete(workflowConfigs);

    // Re-seed with initial configs
    await seedWorkflowConfigs();

    console.log("Workflow configurations reset successfully!");
  } catch (error) {
    console.error("Error resetting workflow configurations:", error);
    throw error;
  }
}
