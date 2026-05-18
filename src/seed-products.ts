// src/seed-products.ts
// Run with: export $(grep -v '^#' .env | xargs) && npx tsx src/seed-products.ts

import { getPayload } from "payload";
import config from "@payload-config";
import path from "path";
import fs from "fs";

// Helper: random price between 49 and 99
const randomPrice = () => Math.floor(Math.random() * 51) + 49;

// Capitalize each word
const capitalizeName = (slug: string) =>
  slug
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const generateDescription = (displayName: string) =>
  `${displayName} is a high-quality digital character asset designed for game developers and animators. It features clean outlines and a vibrant colour palette that brings your projects to life.`;

const generateContent = (displayName: string) =>
  `This purchase includes the full-resolution ${displayName} PNG file. ` +
  `You may use this asset in personal or commercial projects without additional licensing fees. ` +
  `The image is suitable for 2D games, video animations, educational materials, and more. ` +
  `Instant download is available right after payment confirmation. ` +
  `If you need custom poses or formats, feel free to contact our support team.`;

const seed = async () => {
  const payload = await getPayload({ config });

  // 1. Ensure the "New" tag exists
  const tagName = "New";
  const tagRes = await payload.find({
    collection: "tags",
    where: { name: { equals: tagName } },
    limit: 1,
  });
  let tagId: string;
  if (tagRes.docs.length === 0) {
    const newTag = await payload.create({ collection: "tags", data: { name: tagName } });
    tagId = newTag.id;
  } else {
    tagId = tagRes.docs[0]!.id;
  }

  // 2. Ensure the subcategory "original-characters" exists
  const subcategorySlug = "original-characters";
  const catRes = await payload.find({
    collection: "categories",
    where: { slug: { equals: subcategorySlug } },
    limit: 1,
  });
  if (catRes.docs.length === 0) {
    console.error(`Subcategory "${subcategorySlug}" not found. Please create it in the admin panel first.`);
    process.exit(1);
  }
  const categoryId: string = catRes.docs[0]!.id;

  // 3. Process all PNG files
  const charactersDir = path.join(process.cwd(), "public", "characters");
  const files = fs.readdirSync(charactersDir).filter((file) => file.endsWith(".png"));

  for (const file of files) {
    const fileNameWithoutExt = file.replace(".png", "");
    const displayName = capitalizeName(fileNameWithoutExt.replace(/_/g, " "));

    // Skip if product already exists
    const existing = await payload.find({
      collection: "products",
      where: { name: { equals: displayName } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      console.log(`⏭  Skipping existing product: ${displayName}`);
      continue;
    }

    // Upload media using a Buffer
    const filePath = path.join(charactersDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    const media = await payload.create({
      collection: "media",
      data: { alt: displayName },
      file: {
        data: fileBuffer,
        mimetype: "image/png",
        name: file,
        size: fileBuffer.length,
      } as any,
    });

    // Create product
    await payload.create({
      collection: "products",
      data: {
        name: displayName,
        price: randomPrice(),
        category: categoryId,
        tags: [tagId],
        image: media.id!,
        refundPolicy: "no-refunds",
        description: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [{ type: "text", version: 1, text: generateDescription(displayName) }],
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
          },
        },
        content: {
          root: {
            type: "root",
            children: [
              {
                type: "paragraph",
                version: 1,
                children: [{ type: "text", version: 1, text: generateContent(displayName) }],
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            version: 1,
          },
        },
      },
    });

    console.log(`✅ Created product: ${displayName}`);
  }

  console.log("🎉 All products seeded successfully!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});