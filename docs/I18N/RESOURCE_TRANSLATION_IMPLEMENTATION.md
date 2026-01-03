# Resource Translation Implementation Plan

> **⚠️ IMPORTANT UPDATE (2024-12-17):**
> Slug strategy has been revised. Slug is now a **technical identifier in English** (NOT translated per locale).
> - Slug stays in main `Resource` table
> - Auto-generated from English title (or English translation of title)
> - Globally unique across all resources
> - Same URL for all locales: `/[locale]/resources/guided-meditation`

## Overview

This document outlines the implementation plan for adding multi-language support to the Resources feature in MindfulSpace. The goal is to allow resources to be created in one language and automatically translated to other supported locales (currently FR/EN, expandable to more languages).

## Table of Contents

1. [Requirements](#requirements)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Approaches](#implementation-approaches)
4. [Recommended Solution](#recommended-solution)
5. [Technical Specifications](#technical-specifications)
6. [Implementation Phases](#implementation-phases)
7. [Key Decisions](#key-decisions)
8. [Migration Strategy](#migration-strategy)
9. [Testing Plan](#testing-plan)

---

## Requirements

### Functional Requirements

1. **Multi-Language Support**
   - Resources must support all application locales (currently FR and EN)
   - System should be expandable to additional languages in the future
   - Each resource has a "source locale" indicating the original language

2. **Automatic Translation**
   - Use existing AI endpoint to automatically translate resource content
   - Translations should be generated for: `title`, `summary`, `content`
   - Translation should be triggered on-demand, not automatic on save
   - **Slug is NOT translated** - technical identifier auto-generated from English title

3. **Editable Translations**
   - Users (coaches/admins) must be able to review AI-generated translations
   - Translations should be editable before final save
   - Users should be able to manually override any translation

4. **User Workflow**
   - User specifies source language when creating a resource
   - User fills in content in chosen language
   - User can trigger translation generation
   - User reviews and edits translations
   - User saves resource with all translations

5. **Technical Slug (Language-Neutral)**
   - Slug is a technical identifier in English (not translated)
   - Slug stays in main Resource table (not in ResourceTranslation)
   - Slug is auto-generated from title (English translation if source language is not English)
   - Slug must be globally unique across all resources
   - No slug field in the form - fully automatic generation
   - Routes are language-neutral: `/[locale]/resources/guided-meditation` (same slug for all locales)

### Non-Functional Requirements

1. **Backward Compatibility**
   - Existing resources must be migrated to new structure
   - Assume existing resources are in French (default locale)

2. **Performance**
   - Translations should be loaded efficiently (eager loading)
   - Translation generation should provide user feedback (loading states)

3. **Data Integrity**
   - Cascade deletes: removing a resource removes all translations
   - One translation per locale per resource (enforced at database level)
   - Slug uniqueness globally (enforced at Resource table level, not per locale)

---

## Architecture Overview

### Current Structure

```
Resource (single table)
├── id, title, slug, summary, content
├── type, isPremium, isFeatured
├── authorId, categoryId
└── tags (many-to-many via ResourceTagOnResource)
```

### New Structure (UPDATED)

```
Resource (common fields + technical slug)
├── id, slug (STAYS HERE - technical identifier in English)
├── type, isPremium, isFeatured
├── sourceLocale (NEW)
├── authorId, categoryId
├── tags (many-to-many via ResourceTagOnResource)
└── translations[] (one-to-many)
    └── ResourceTranslation
        ├── id, resourceId, locale
        ├── title, summary, content
        └── createdAt, updatedAt
```

### Key Changes

- **Moved to ResourceTranslation:** `title`, `summary`, `content` (NOT slug!)
- **Kept in Resource:** `slug` (technical identifier, always in English, globally unique)
- **Added to Resource:** `sourceLocale` (indicates original language)
- **New Table:** `ResourceTranslation` with unique constraint on `(resourceId, locale)`
- **Slug Generation:** Auto-generated from English title (or English translation of title if source is not English)

---

## Implementation Approaches

### Option 1: Two-Step Creation (Recommended for MVP)

**Flow:**
1. User creates resource in source language → saves as "draft"
2. Click "Generate Translations" button → AI translates
3. Review/edit translations in expandable panels
4. Click "Publish" → saves all translations

**Pros:**
- Simpler to implement
- Better UX for reviewing translations
- Clear separation between draft and published states

**Cons:**
- Requires two saves (draft + publish)
- More database operations

---

### Option 2: Single-Step with Translation Preview

**Flow:**
1. User fills form in source language
2. Click "Preview Translations" button → shows translation panels
3. Edit any translation if needed
4. Click "Save" → creates resource + all translations at once

**Pros:**
- Faster workflow for users who trust AI
- Single save operation

**Cons:**
- More complex UI
- Longer loading time on save
- All-or-nothing approach

---

### Option 3: Progressive Translation (Best UX, Most Complex)

**Flow:**
1. User creates resource in source language → auto-saves
2. "Translations" tab shows translation status (✓ FR, ⚠️ EN pending)
3. Click language → either "Auto-translate" or "Translate manually"
4. Each translation can be edited/published independently

**Pros:**
- Most flexible
- Best for multi-language teams
- Can publish resource before all translations are done

**Cons:**
- Most complex to implement
- Requires translation status tracking
- More UI components needed

---

## Recommended Solution

### Hybrid Approach (Option 1 + Option 2)

Combine the best aspects of both approaches:

#### Creation Flow

1. **Source language selection** at top of form
   ```
   [Dropdown: 🇫🇷 Français | 🇬🇧 English]
   ```

2. Fill form in chosen language (title, slug, summary, content)

3. **Two save modes:**
   - **"Save Draft"** → saves only source language translation
   - **"Save & Translate"** → triggers translation workflow (modal/expansion)

4. **Translation review modal:**
   - Shows source + target language side-by-side
   - Editable fields for each locale
   - Auto-generated slugs with uniqueness check
   - "Confirm & Publish" button

#### Edit Flow

1. Load resource with all translations
2. **Tabbed interface:** `[🇫🇷 FR] [🇬🇧 EN] [+ Add Language]`
3. Each tab shows translated fields
4. **"Re-translate from [source]"** button to regenerate
5. Save updates all modified translations

#### Benefits

- Flexible: supports both quick workflow and careful review
- Progressive: can add translations later
- User-friendly: clear visual feedback on translation status

---

## Technical Specifications

### 1. Database Schema

```prisma
model Resource {
  id          String   @id @default(uuid())
  slug        String   @unique // KEPT: technical identifier (always English, globally unique)
  // REMOVED: title, summary, content (moved to translations)

  type        ResourceType
  isPremium   Boolean  @default(false)
  isFeatured  Boolean  @default(false)
  sourceLocale String  @default("fr") // NEW: original language
  readTimeMin Int?
  externalUrl String?

  authorId    String?
  author      User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)

  categoryId  String
  category    ResourceCategory @relation(fields: [categoryId], references: [id])

  meditationProgramId String?
  meditationProgram   MeditationProgram? @relation(fields: [meditationProgramId], references: [id])

  tags         ResourceTagOnResource[]
  translations ResourceTranslation[] // NEW: one-to-many

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug]) // for slug-based lookups
}

model ResourceTranslation {
  id         String   @id @default(uuid())
  resourceId String
  locale     String   // "fr" | "en" | "es" | "de" etc.

  title      String
  summary    String
  content    String   // markdown/html

  resource   Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([resourceId, locale])  // one translation per language per resource
  @@index([locale])
  @@index([title])
}
```

#### Migration Strategy

**Step 1: Create new table**
```sql
CREATE TABLE "ResourceTranslation" (
  "id" TEXT PRIMARY KEY,
  "resourceId" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("resourceId", "locale"),
  UNIQUE("locale", "slug")
);
```

**Step 2: Migrate existing data**
```sql
-- Assume all existing resources are in French
INSERT INTO "ResourceTranslation" ("id", "resourceId", "locale", "title", "slug", "summary", "content", "createdAt", "updatedAt")
SELECT
  uuid_generate_v4(),
  "id" as "resourceId",
  'fr' as "locale",
  "title",
  "slug",
  "summary",
  "content",
  "createdAt",
  "updatedAt"
FROM "Resource";
```

**Step 3: Add sourceLocale to Resource**
```sql
ALTER TABLE "Resource" ADD COLUMN "sourceLocale" TEXT DEFAULT 'fr';
```

**Step 4: Drop old columns from Resource**
```sql
ALTER TABLE "Resource"
  DROP COLUMN "title",
  DROP COLUMN "slug",
  DROP COLUMN "summary",
  DROP COLUMN "content";
```

---

### 2. Backend API Changes

#### New DTOs

**create-resource.dto.ts**
```typescript
import { IsString, IsBoolean, IsOptional, IsInt, IsEnum, IsArray, MinLength, MaxLength, Min } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateResourceDto {
  // Common fields (not translated)
  @IsEnum(ResourceType)
  type: ResourceType;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsString()
  @MinLength(2)
  @MaxLength(5)
  sourceLocale: string; // "fr" | "en"

  @IsInt()
  @IsOptional()
  @Min(1)
  readTimeMin?: number;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsString()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  // Source translation (single language at creation)
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  // NOTE: Slug is NOT in DTO - auto-generated on backend from title (English)

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary: string;

  @IsString()
  @MinLength(10)
  content: string;
}
```

**create-translation.dto.ts**
```typescript
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateTranslationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  locale: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  // NOTE: No slug field - slug is at Resource level, not per translation

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  summary: string;

  @IsString()
  @MinLength(10)
  content: string;
}
```

**auto-translate.dto.ts**
```typescript
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class AutoTranslateDto {
  @IsString()
  resourceId: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  targetLocales: string[]; // ["en"] or ["fr", "de", "es"]
}
```

**update-resource.dto.ts**
```typescript
import { IsString, IsBoolean, IsOptional, IsInt, IsEnum, IsArray, MinLength, MaxLength, Min } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class UpdateResourceDto {
  // Common fields
  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsInt()
  @IsOptional()
  @Min(1)
  readTimeMin?: number;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  // Translations (update specific locale)
  @IsString()
  @IsOptional()
  locale?: string; // which translation to update

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsOptional()
  slug?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsOptional()
  summary?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  content?: string;
}
```

---

#### New Endpoints

**resources.controller.ts**
```typescript
// Existing endpoints (modified)
POST   /resources                         // Create resource with source translation
GET    /resources                         // Get all resources (includes translations for current locale)
GET    /resources/:id                     // Get resource with all translations
PUT    /resources/:id                     // Update resource common fields
DELETE /resources/:id                     // Delete resource (cascade deletes translations)

// New translation-specific endpoints
POST   /resources/:id/translations        // Manually add/update translation for specific locale
POST   /resources/:id/auto-translate      // AI translate to target locales
GET    /resources/:id/translations        // Get all translations for a resource
GET    /resources/:id/translations/:locale // Get specific translation
PUT    /resources/:id/translations/:locale // Update specific translation
DELETE /resources/:id/translations/:locale // Delete specific translation

// Utility endpoints
POST   /resources/:id/translations/:locale/regenerate // Re-generate translation from source
GET    /resources/slug/:slug              // Get resource by slug (requires locale query param)
```

---

#### Service Methods

**resources.service.ts**

```typescript
/**
 * Create resource with source translation
 */
async create(dto: CreateResourceDto, userId: string) {
  const { title, slug, summary, content, sourceLocale, tagIds, ...resourceData } = dto;

  // 1. Validate slug uniqueness for source locale
  await this.validateSlugUniqueness(slug, sourceLocale);

  // 2. Create resource with first translation
  const resource = await this.prisma.resource.create({
    data: {
      ...resourceData,
      sourceLocale,
      authorId: userId,
      translations: {
        create: {
          locale: sourceLocale,
          title,
          slug,
          summary,
          content,
        },
      },
      tags: tagIds ? {
        create: tagIds.map(tagId => ({
          tag: { connect: { id: tagId } },
        })),
      } : undefined,
    },
    include: {
      translations: true,
      category: true,
      tags: { include: { tag: true } },
      author: { select: { id: true, email: true, displayName: true } },
    },
  });

  return resource;
}

/**
 * Auto-translate resource to target locales using AI
 */
async autoTranslate(resourceId: string, targetLocales: string[], userId: string) {
  // 1. Get resource with source translation
  const resource = await this.prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      translations: {
        where: { locale: resource.sourceLocale },
      },
    },
  });

  if (!resource) {
    throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
  }

  // 2. Check authorization
  const isOwner = resource.authorId === userId;
  const isAdmin = await this.isUserAdmin(userId);
  if (!isOwner && !isAdmin) {
    throw new ForbiddenException('You do not have permission to translate this resource');
  }

  const sourceTranslation = resource.translations[0];
  const results = [];

  // 3. Translate to each target locale
  for (const targetLocale of targetLocales) {
    // Call AI translation service
    const translatedContent = await this.aiService.translate({
      sourceLocale: resource.sourceLocale,
      targetLocale,
      fields: {
        title: sourceTranslation.title,
        summary: sourceTranslation.summary,
        content: sourceTranslation.content,
      },
    });

    // Generate localized slug
    const translatedSlug = await this.generateUniqueSlug(
      translatedContent.title,
      targetLocale,
      resourceId
    );

    // Create or update translation
    const translation = await this.prisma.resourceTranslation.upsert({
      where: {
        resourceId_locale: {
          resourceId,
          locale: targetLocale,
        },
      },
      create: {
        resourceId,
        locale: targetLocale,
        title: translatedContent.title,
        slug: translatedSlug,
        summary: translatedContent.summary,
        content: translatedContent.content,
      },
      update: {
        title: translatedContent.title,
        slug: translatedSlug,
        summary: translatedContent.summary,
        content: translatedContent.content,
      },
    });

    results.push(translation);
  }

  return results;
}

/**
 * Get resource by slug (locale-specific)
 */
async findBySlug(slug: string, locale: string) {
  const translation = await this.prisma.resourceTranslation.findUnique({
    where: {
      locale_slug: {
        locale,
        slug,
      },
    },
    include: {
      resource: {
        include: {
          category: true,
          tags: { include: { tag: true } },
          author: { select: { id: true, email: true, displayName: true } },
          translations: true, // include all translations for language switcher
        },
      },
    },
  });

  if (!translation) {
    throw new NotFoundException(`Resource with slug "${slug}" not found for locale "${locale}"`);
  }

  return {
    ...translation.resource,
    // Flatten current translation to top level for easier access
    title: translation.title,
    slug: translation.slug,
    summary: translation.summary,
    content: translation.content,
    currentLocale: locale,
  };
}

/**
 * Update translation for specific locale
 */
async updateTranslation(
  resourceId: string,
  locale: string,
  dto: CreateTranslationDto,
  userId: string
) {
  // 1. Check authorization
  const resource = await this.prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new NotFoundException(`Resource with ID "${resourceId}" not found`);
  }

  const isOwner = resource.authorId === userId;
  const isAdmin = await this.isUserAdmin(userId);
  if (!isOwner && !isAdmin) {
    throw new ForbiddenException('You do not have permission to edit this resource');
  }

  // 2. Validate slug uniqueness (if changed)
  await this.validateSlugUniqueness(dto.slug, locale, resourceId);

  // 3. Update translation
  const translation = await this.prisma.resourceTranslation.upsert({
    where: {
      resourceId_locale: {
        resourceId,
        locale,
      },
    },
    create: {
      resourceId,
      locale,
      ...dto,
    },
    update: dto,
  });

  return translation;
}

/**
 * Validate slug uniqueness within locale
 */
private async validateSlugUniqueness(slug: string, locale: string, excludeResourceId?: string) {
  const existing = await this.prisma.resourceTranslation.findUnique({
    where: {
      locale_slug: {
        locale,
        slug,
      },
    },
  });

  if (existing && existing.resourceId !== excludeResourceId) {
    throw new BadRequestException(
      `A resource with slug "${slug}" already exists for locale "${locale}"`
    );
  }
}

/**
 * Generate unique slug from title (locale-specific)
 */
private async generateUniqueSlug(title: string, locale: string, excludeResourceId?: string): Promise<string> {
  let baseSlug = this.slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await this.prisma.resourceTranslation.findUnique({
      where: {
        locale_slug: {
          locale,
          slug,
        },
      },
    });

    if (!existing || existing.resourceId === excludeResourceId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Convert string to URL-friendly slug
 */
private slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
```

---

### 3. AI Translation Service

**Check if existing AI endpoint exists. If not, create one:**

**ai.service.ts** (or similar)

```typescript
import { Injectable } from '@nestjs/common';

interface TranslateRequest {
  sourceLocale: string;
  targetLocale: string;
  fields: {
    title: string;
    summary: string;
    content: string;
  };
}

interface TranslateResponse {
  title: string;
  summary: string;
  content: string;
}

@Injectable()
export class AiService {
  async translate(request: TranslateRequest): Promise<TranslateResponse> {
    // TODO: Implement AI translation
    // Options:
    // 1. Use existing internal AI service
    // 2. Use external API (OpenAI, DeepL, Google Translate)
    // 3. Use local LLM

    // Example with OpenAI (pseudo-code):
    const prompt = `
      Translate the following content from ${request.sourceLocale} to ${request.targetLocale}.
      Maintain the same tone and formatting.

      Title: ${request.fields.title}
      Summary: ${request.fields.summary}
      Content: ${request.fields.content}

      Return JSON with keys: title, summary, content
    `;

    // Call AI service...
    // const response = await this.openai.chat.completions.create({...});

    return {
      title: 'Translated title',
      summary: 'Translated summary',
      content: 'Translated content',
    };
  }
}
```

**ai.controller.ts** (if needed as separate endpoint)

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('translate')
  async translate(@Body() request: TranslateRequest) {
    return this.aiService.translate(request);
  }
}
```

---

### 4. Frontend Changes

#### Type Definitions

**apps/frontend-next/src/lib/api/resources.ts**

```typescript
// Updated Resource type
export interface Resource {
  id: string;
  type: ResourceType;
  isPremium: boolean;
  isFeatured: boolean;
  sourceLocale: string; // NEW
  readTimeMin?: number;
  externalUrl?: string;

  categoryId: string;
  category?: ResourceCategory;

  authorId?: string;
  author?: {
    id: string;
    email: string;
    displayName: string;
  };

  meditationProgramId?: string;
  meditationProgram?: any;

  tags?: ResourceTagOnResource[];
  translations: ResourceTranslation[]; // NEW

  createdAt: string;
  updatedAt: string;

  // Convenience fields (flattened from current locale translation)
  currentLocale?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
}

// NEW: ResourceTranslation type
export interface ResourceTranslation {
  id: string;
  resourceId: string;
  locale: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Updated CreateResourceData
export interface CreateResourceData {
  // Common fields
  type: ResourceType;
  isPremium?: boolean;
  sourceLocale: string; // NEW
  readTimeMin?: number;
  externalUrl?: string;
  categoryId: string;
  tagIds?: string[];

  // Source translation
  title: string;
  slug: string;
  summary: string;
  content: string;
}

// Updated UpdateResourceData
export interface UpdateResourceData {
  // Common fields
  type?: ResourceType;
  isPremium?: boolean;
  isFeatured?: boolean;
  readTimeMin?: number;
  externalUrl?: string;
  categoryId?: string;
  tagIds?: string[];

  // Translation update (for specific locale)
  locale?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
}

// NEW: Translation-specific types
export interface TranslationData {
  locale: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
}

export interface AutoTranslateRequest {
  resourceId: string;
  targetLocales: string[];
}

export interface AutoTranslateResponse {
  translations: ResourceTranslation[];
}
```

#### API Client Functions

**apps/frontend-next/src/lib/api/resources.ts** (additions)

```typescript
/**
 * Auto-translate resource to target locales
 */
export async function autoTranslateResource(
  resourceId: string,
  targetLocales: string[]
): Promise<ResourceTranslation[]> {
  const res = await apiFetch(`/resources/${resourceId}/auto-translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLocales }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to auto-translate resource');
  }

  return res.json();
}

/**
 * Update translation for specific locale
 */
export async function updateTranslation(
  resourceId: string,
  locale: string,
  data: Omit<TranslationData, 'locale'>
): Promise<ResourceTranslation> {
  const res = await apiFetch(`/resources/${resourceId}/translations/${locale}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update translation');
  }

  return res.json();
}

/**
 * Get all translations for a resource
 */
export async function getTranslations(resourceId: string): Promise<ResourceTranslation[]> {
  const res = await apiFetch(`/resources/${resourceId}/translations`);

  if (!res.ok) {
    throw new Error('Failed to fetch translations');
  }

  return res.json();
}

/**
 * Get resource by slug for specific locale
 */
export async function getResourceBySlug(slug: string, locale: string): Promise<Resource> {
  const res = await apiFetch(`/resources/slug/${slug}?locale=${locale}`);

  if (!res.ok) {
    throw new Error('Resource not found');
  }

  return res.json();
}
```

---

#### UI Components

**1. SourceLocaleSelector Component**

**apps/frontend-next/src/components/resources/SourceLocaleSelector.tsx**

```tsx
'use client';

import { locales } from '@/i18n/config';

interface SourceLocaleSelectorProps {
  value: string;
  onChange: (locale: string) => void;
  disabled?: boolean;
}

export default function SourceLocaleSelector({
  value,
  onChange,
  disabled = false,
}: SourceLocaleSelectorProps) {
  const localeFlags: Record<string, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
    es: '🇪🇸',
    de: '🇩🇪',
  };

  const localeNames: Record<string, string> = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
  };

  return (
    <div>
      <label
        htmlFor="sourceLocale"
        className="block text-sm font-medium text-brandText mb-2"
      >
        Source Language *
      </label>
      <select
        id="sourceLocale"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeFlags[locale]} {localeNames[locale]}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-brandText/60">
        The language you'll write this resource in
      </p>
    </div>
  );
}
```

---

**2. TranslationTabs Component**

**apps/frontend-next/src/components/resources/TranslationTabs.tsx**

```tsx
'use client';

import { locales } from '@/i18n/config';
import { ResourceTranslation } from '@/lib/api/resources';

interface TranslationTabsProps {
  activeLocale: string;
  onLocaleChange: (locale: string) => void;
  sourceLocale: string;
  translations: Record<string, Partial<ResourceTranslation>>;
}

export default function TranslationTabs({
  activeLocale,
  onLocaleChange,
  sourceLocale,
  translations,
}: TranslationTabsProps) {
  const localeFlags: Record<string, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
    es: '🇪🇸',
    de: '🇩🇪',
  };

  const localeNames: Record<string, string> = {
    fr: 'FR',
    en: 'EN',
    es: 'ES',
    de: 'DE',
  };

  return (
    <div className="border-b border-brandBorder">
      <div className="flex gap-2">
        {locales.map((locale) => {
          const isActive = activeLocale === locale;
          const isSource = locale === sourceLocale;
          const hasTranslation = !!translations[locale]?.title;

          return (
            <button
              key={locale}
              onClick={() => onLocaleChange(locale)}
              className={`
                relative px-4 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'border-b-2 border-brandGreen text-brandGreen'
                    : 'text-brandText/60 hover:text-brandText'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span>{localeFlags[locale]}</span>
                <span>{localeNames[locale]}</span>
                {isSource && (
                  <span className="text-[10px] bg-brandGreen/10 text-brandGreen px-1.5 py-0.5 rounded">
                    SOURCE
                  </span>
                )}
                {!isSource && hasTranslation && (
                  <span className="text-green-600">✓</span>
                )}
                {!isSource && !hasTranslation && (
                  <span className="text-orange-500">⚠️</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

**3. TranslationFields Component**

**apps/frontend-next/src/components/resources/TranslationFields.tsx**

```tsx
'use client';

import { ResourceTranslation } from '@/lib/api/resources';

interface TranslationFieldsProps {
  locale: string;
  data: Partial<ResourceTranslation>;
  isSource: boolean;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
  onAutoTranslate?: () => void;
  isTranslating?: boolean;
}

export default function TranslationFields({
  locale,
  data,
  isSource,
  onChange,
  disabled = false,
  onAutoTranslate,
  isTranslating = false,
}: TranslationFieldsProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Auto-translate button for non-source locales */}
      {!isSource && onAutoTranslate && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAutoTranslate}
            disabled={isTranslating || disabled}
            className="inline-flex items-center gap-2 rounded-lg bg-brandPrimary/10 hover:bg-brandPrimary/20 text-brandPrimary text-sm font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? (
              <>
                <span className="animate-spin">⏳</span>
                Translating...
              </>
            ) : (
              <>
                <span>🤖</span>
                Auto-translate from source
              </>
            )}
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-brandText mb-2">
          Title *
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          disabled={disabled}
          className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 disabled:bg-gray-100"
          placeholder={`Resource title in ${locale}`}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-brandText mb-2">
          Slug (URL) *
        </label>
        <input
          type="text"
          value={data.slug || ''}
          onChange={(e) => onChange('slug', e.target.value)}
          disabled={disabled}
          className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 disabled:bg-gray-100"
          placeholder="url-friendly-slug"
        />
        <p className="mt-1 text-xs text-brandText/60">
          URL-friendly identifier (lowercase letters, numbers, and hyphens only)
        </p>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-brandText mb-2">
          Summary *
        </label>
        <textarea
          value={data.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          disabled={disabled}
          rows={3}
          maxLength={500}
          className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 disabled:bg-gray-100"
          placeholder={`Brief summary in ${locale}`}
        />
        <p className="mt-1 text-xs text-brandText/60">
          {data.summary?.length || 0} / 500 characters
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-brandText mb-2">
          Content *
        </label>
        <textarea
          value={data.content || ''}
          onChange={(e) => onChange('content', e.target.value)}
          disabled={disabled}
          rows={12}
          className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20 disabled:bg-gray-100 font-mono text-sm"
          placeholder={`Full content in ${locale} (Markdown supported)`}
        />
        <p className="mt-1 text-xs text-brandText/60">
          Markdown formatting supported
        </p>
      </div>
    </div>
  );
}
```

---

**4. Updated ResourceForm Component**

**apps/frontend-next/src/components/resources/ResourceForm.tsx** (major refactor)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/TranslationContext';
import { locales } from '@/i18n/config';
import {
  Resource,
  ResourceCategory,
  ResourceTag,
  ResourceTranslation,
  CreateResourceData,
  UpdateResourceData,
  ResourceType,
  autoTranslateResource,
  generateSlug,
} from '@/lib/api/resources';
import SourceLocaleSelector from './SourceLocaleSelector';
import TranslationTabs from './TranslationTabs';
import TranslationFields from './TranslationFields';

interface ResourceFormProps {
  initialData?: Resource;
  categories: ResourceCategory[];
  tags: ResourceTag[];
  onSubmit: (data: CreateResourceData | UpdateResourceData) => Promise<void>;
  onCancel: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

export default function ResourceForm({
  initialData,
  categories,
  tags,
  onSubmit,
  onCancel,
  isAdmin,
  isLoading,
}: ResourceFormProps) {
  const t = useTranslations('resourcesManagement');
  const isEdit = !!initialData;

  // Form state
  const [formData, setFormData] = useState({
    // Common fields
    type: (initialData?.type as ResourceType) || 'ARTICLE',
    isPremium: initialData?.isPremium || false,
    isFeatured: initialData?.isFeatured || false,
    sourceLocale: initialData?.sourceLocale || 'fr',
    readTimeMin: initialData?.readTimeMin || undefined,
    externalUrl: initialData?.externalUrl || '',
    categoryId: initialData?.categoryId || '',
    tagIds: initialData?.tags?.map((t) => t.tag.id) || [],

    // Translations (keyed by locale)
    translations: {} as Record<string, Partial<ResourceTranslation>>,
  });

  // UI state
  const [activeLocale, setActiveLocale] = useState(formData.sourceLocale);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize translations from initialData
  useEffect(() => {
    if (initialData?.translations) {
      const translationsMap: Record<string, Partial<ResourceTranslation>> = {};
      initialData.translations.forEach((t) => {
        translationsMap[t.locale] = t;
      });
      setFormData((prev) => ({
        ...prev,
        translations: translationsMap,
      }));
    } else {
      // For new resources, initialize source locale with empty data
      setFormData((prev) => ({
        ...prev,
        translations: {
          [prev.sourceLocale]: {
            title: '',
            slug: '',
            summary: '',
            content: '',
          },
        },
      }));
    }
  }, [initialData]);

  // Handle translation field changes
  const handleTranslationChange = (locale: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value,
        },
      },
    }));

    // Auto-generate slug from title
    if (field === 'title' && value) {
      const slug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: {
            ...prev.translations[locale],
            slug,
          },
        },
      }));
    }
  };

  // Handle auto-translation
  const handleAutoTranslate = async (targetLocale: string) => {
    if (!isEdit) {
      alert('Please save the resource first before translating.');
      return;
    }

    setIsTranslating(true);
    try {
      const translations = await autoTranslateResource(initialData!.id, [targetLocale]);

      // Update form with translated data
      translations.forEach((t) => {
        setFormData((prev) => ({
          ...prev,
          translations: {
            ...prev.translations,
            [t.locale]: t,
          },
        }));
      });
    } catch (error: any) {
      alert(error.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const sourceTranslation = formData.translations[formData.sourceLocale];

    // Validate common fields
    if (!formData.categoryId) {
      newErrors.categoryId = t('errors.categoryRequired');
    }

    // Validate source translation
    if (!sourceTranslation?.title?.trim()) {
      newErrors[`${formData.sourceLocale}.title`] = t('errors.titleRequired');
    }
    if (!sourceTranslation?.slug?.trim()) {
      newErrors[`${formData.sourceLocale}.slug`] = t('errors.slugRequired');
    }
    if (!sourceTranslation?.summary?.trim()) {
      newErrors[`${formData.sourceLocale}.summary`] = t('errors.summaryRequired');
    }
    if (!sourceTranslation?.content?.trim()) {
      newErrors[`${formData.sourceLocale}.content`] = t('errors.contentRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const sourceTranslation = formData.translations[formData.sourceLocale];

    // Prepare submit data
    const submitData: CreateResourceData | UpdateResourceData = {
      // Common fields
      type: formData.type,
      isPremium: formData.isPremium,
      ...(isAdmin && { isFeatured: formData.isFeatured }),
      sourceLocale: formData.sourceLocale,
      readTimeMin: formData.readTimeMin || undefined,
      externalUrl: formData.externalUrl || undefined,
      categoryId: formData.categoryId,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined,

      // Source translation
      title: sourceTranslation.title!,
      slug: sourceTranslation.slug!,
      summary: sourceTranslation.summary!,
      content: sourceTranslation.content!,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Source Locale Selector (only for new resources) */}
      {!isEdit && (
        <SourceLocaleSelector
          value={formData.sourceLocale}
          onChange={(locale) => {
            setFormData((prev) => ({
              ...prev,
              sourceLocale: locale,
              translations: {
                [locale]: prev.translations[prev.sourceLocale] || {
                  title: '',
                  slug: '',
                  summary: '',
                  content: '',
                },
              },
            }));
            setActiveLocale(locale);
          }}
          disabled={isLoading}
        />
      )}

      {/* Translation Tabs */}
      <TranslationTabs
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        sourceLocale={formData.sourceLocale}
        translations={formData.translations}
      />

      {/* Translation Fields */}
      <TranslationFields
        locale={activeLocale}
        data={formData.translations[activeLocale] || {}}
        isSource={activeLocale === formData.sourceLocale}
        onChange={(field, value) => handleTranslationChange(activeLocale, field, value)}
        disabled={isLoading}
        onAutoTranslate={
          isEdit && activeLocale !== formData.sourceLocale
            ? () => handleAutoTranslate(activeLocale)
            : undefined
        }
        isTranslating={isTranslating}
      />

      {/* Common Fields Section */}
      <div className="border-t border-brandBorder pt-6 space-y-4">
        <h3 className="text-lg font-semibold text-brandText">
          {t('form.commonFields')}
        </h3>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-brandText mb-2">
            {t('form.category')} *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            disabled={isLoading}
            className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
          >
            <option value="">{t('form.selectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.iconEmoji} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-brandText mb-2">
            {t('form.tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  const isSelected = formData.tagIds.includes(tag.id);
                  setFormData({
                    ...formData,
                    tagIds: isSelected
                      ? formData.tagIds.filter((id) => id !== tag.id)
                      : [...formData.tagIds, tag.id],
                  });
                }}
                disabled={isLoading}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  formData.tagIds.includes(tag.id)
                    ? 'bg-brandGreen text-white'
                    : 'bg-gray-100 text-brandText hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-brandText mb-2">
            {t('form.type')} *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
            disabled={isLoading}
            className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
          >
            <option value="ARTICLE">{t('types.article')}</option>
            <option value="VIDEO">{t('types.video')}</option>
            <option value="GUIDE">{t('types.guide')}</option>
            <option value="MEDITATION_PROGRAM">{t('types.meditationProgram')}</option>
          </select>
        </div>

        {/* Read Time */}
        <div>
          <label className="block text-sm font-medium text-brandText mb-2">
            {t('form.readTime')}
          </label>
          <input
            type="number"
            min="1"
            value={formData.readTimeMin || ''}
            onChange={(e) => setFormData({ ...formData, readTimeMin: parseInt(e.target.value) || undefined })}
            disabled={isLoading}
            className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
            placeholder="5"
          />
        </div>

        {/* External URL */}
        <div>
          <label className="block text-sm font-medium text-brandText mb-2">
            {t('form.externalUrl')}
          </label>
          <input
            type="url"
            value={formData.externalUrl}
            onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
            disabled={isLoading}
            className="block w-full rounded-lg border border-brandBorder px-4 py-2 text-brandText focus:border-brandGreen focus:outline-none focus:ring-2 focus:ring-brandGreen/20"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        {/* Premium Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={formData.isPremium}
            onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
            disabled={isLoading}
            className="h-4 w-4 rounded border-brandBorder text-brandGreen focus:ring-brandGreen"
          />
          <label htmlFor="isPremium" className="text-sm font-medium text-brandText">
            {t('form.isPremium')}
          </label>
        </div>

        {/* Featured Checkbox (admin only) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              disabled={isLoading}
              className="h-4 w-4 rounded border-brandBorder text-brandGreen focus:ring-brandGreen"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-brandText">
              {t('form.isFeatured')}
            </label>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-brandBorder">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 rounded-card bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 transition-colors disabled:opacity-50"
        >
          {t('actions.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-card bg-brandGreen hover:bg-brandGreen/90 text-white font-medium py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('actions.saving') : isEdit ? t('actions.update') : t('actions.create')}
        </button>
      </div>
    </form>
  );
}
```

---

### 5. Routing Changes

**Current Route:** `/[locale]/resources/[slug]`

**No change needed!** The route structure already supports locales. We just need to update the page to fetch the resource by slug + locale.

**apps/frontend-next/src/app/[locale]/(public)/resources/[slug]/page.tsx** (update)

```tsx
import { getResourceBySlug } from '@/lib/api/resources';

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Fetch resource for specific locale
  const resource = await getResourceBySlug(slug, locale);

  // Render resource...
}
```

---

## Implementation Phases

### Phase 1: Database Foundation ✅
**Timeline:** Week 1
**Goal:** Set up new schema and migrate existing data

**Tasks:**
- [ ] Update Prisma schema with `ResourceTranslation` model
- [ ] Add `sourceLocale` field to `Resource`
- [ ] Remove `title`, `slug`, `summary`, `content` from `Resource`
- [ ] Create migration script
- [ ] Write data migration to populate French translations
- [ ] Test migration on development database
- [ ] Verify data integrity after migration

**Deliverables:**
- Updated `schema.prisma`
- Migration file: `YYYYMMDDHHMMSS_add_resource_translations.sql`
- Data migration script: `migrate-resources-to-translations.ts`

---

### Phase 2: Backend API ✅
**Timeline:** Week 1-2
**Goal:** Implement translation-aware CRUD operations

**Tasks:**
- [ ] Create DTOs: `CreateResourceDto`, `CreateTranslationDto`, `AutoTranslateDto`, `UpdateResourceDto`
- [ ] Update `resources.service.ts`:
  - [ ] Modify `create()` to create resource + source translation
  - [ ] Implement `autoTranslate()` method
  - [ ] Implement `updateTranslation()` method
  - [ ] Update `findBySlug()` to accept locale parameter
  - [ ] Add `validateSlugUniqueness()` helper
  - [ ] Add `generateUniqueSlug()` helper
- [ ] Update `resources.controller.ts`:
  - [ ] Modify existing endpoints to work with translations
  - [ ] Add `/resources/:id/auto-translate` endpoint
  - [ ] Add `/resources/:id/translations/:locale` endpoints
  - [ ] Add `/resources/slug/:slug` endpoint with locale param
- [ ] Write unit tests for service methods
- [ ] Write integration tests for endpoints

**Deliverables:**
- Updated `resources.service.ts`
- Updated `resources.controller.ts`
- New DTO files in `src/resources/dto/`
- Test files: `resources.service.spec.ts`, `resources.controller.spec.ts`

---

### Phase 3: AI Translation Integration ✅
**Timeline:** Week 2
**Goal:** Integrate AI translation service

**Tasks:**
- [ ] Check if existing AI service can handle translation
- [ ] Create/update `ai.service.ts` with `translate()` method
- [ ] Decide on translation provider (OpenAI, DeepL, local LLM, etc.)
- [ ] Implement translation logic
- [ ] Add error handling and retry logic
- [ ] Add rate limiting if using external API
- [ ] Test translation quality for FR ↔ EN
- [ ] Document AI service configuration

**Deliverables:**
- `ai.service.ts` with translation method
- Environment variables for AI service configuration
- Documentation on translation provider setup

---

### Phase 4: Frontend - Basic ✅
**Timeline:** Week 2-3
**Goal:** Update UI to support translations

**Tasks:**
- [ ] Update TypeScript types in `resources.ts`
- [ ] Create `SourceLocaleSelector` component
- [ ] Create `TranslationTabs` component
- [ ] Create `TranslationFields` component
- [ ] Refactor `ResourceForm` component:
  - [ ] Add source locale selection
  - [ ] Replace single form fields with tabbed translation interface
  - [ ] Handle translation state
- [ ] Update `ResourcesList` component to use locale-specific translations
- [ ] Update resource detail page to fetch by slug + locale
- [ ] Add API client functions:
  - [ ] `autoTranslateResource()`
  - [ ] `updateTranslation()`
  - [ ] `getTranslations()`
  - [ ] Update `getResourceBySlug()` to accept locale

**Deliverables:**
- Updated `ResourceForm.tsx`
- New components: `SourceLocaleSelector`, `TranslationTabs`, `TranslationFields`
- Updated `ResourcesList.tsx`
- Updated resource detail page
- Updated `resources.ts` API client

---

### Phase 5: Frontend - Advanced ✅
**Timeline:** Week 3-4
**Goal:** Polish UX and add advanced features

**Tasks:**
- [ ] Add auto-translate button with loading states
- [ ] Create translation review modal (optional, if using preview workflow)
- [ ] Add validation for missing translations
- [ ] Add visual indicators for translation status (✓ complete, ⚠️ missing)
- [ ] Update admin panel to show translation coverage stats
- [ ] Add "Re-translate from source" functionality
- [ ] Add toast notifications for translation success/failure
- [ ] Implement optimistic UI updates
- [ ] Add keyboard shortcuts for tab switching (optional)

**Deliverables:**
- Polished translation UI
- Translation status indicators
- Admin dashboard translation stats (optional)

---

### Phase 6: Migration & Polish ✅
**Timeline:** Week 4
**Goal:** Migrate existing data and finalize

**Tasks:**
- [ ] Run data migration script on production database (backup first!)
- [ ] Batch auto-translate all existing resources to English
- [ ] Manual review of auto-translated content
- [ ] Update user documentation
- [ ] Create video tutorial for coaches on using translation feature
- [ ] Performance optimization:
  - [ ] Add database indexes if needed
  - [ ] Eager load translations in list queries
  - [ ] Add caching for frequently accessed resources
- [ ] Final testing:
  - [ ] Test all workflows (create, edit, translate, delete)
  - [ ] Test slug uniqueness across locales
  - [ ] Test cascade deletes
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness

**Deliverables:**
- Production database migrated
- All existing resources translated
- User documentation updated
- Performance benchmarks
- Final QA report

---

## Key Decisions

### 1. Slug Strategy ✅ (UPDATED)

**Decision:** Technical slug in English (NOT translated)

**Rationale:**
- Simpler routing: same URL slug for all languages (`/[locale]/resources/guided-meditation`)
- Easier to share URLs across languages
- Consistent with application's technical routes (already in English)
- Avoids complexity of locale-specific slug uniqueness checks
- No need for slug field in form - fully automatic

**Implementation:**
- Slug stays in main `Resource` table (not in `ResourceTranslation`)
- Slug is ALWAYS auto-generated in English
  - If source language is English: `generateSlug(englishTitle)`
  - If source language is French: `generateSlug(await translateToEnglish(frenchTitle))`
- Slug uniqueness enforced globally (not per locale)
- No slug field in the UI - completely automatic
- Routes: `/fr/resources/guided-meditation` and `/en/resources/guided-meditation` (same slug)

---

### 2. Missing Translation Handling ✅

**Decision:** Fallback to source language with language indicator

**Rationale:**
- Better UX than hiding content
- Allows progressive translation (publish before all translations done)
- Encourages content availability

**Implementation:**
```tsx
// If translation doesn't exist for current locale, fall back to source
const displayTranslation =
  resource.translations.find(t => t.locale === currentLocale) ||
  resource.translations.find(t => t.locale === resource.sourceLocale);

// Show indicator if fallback was used
{displayTranslation.locale !== currentLocale && (
  <span className="text-orange-500 text-sm">
    ⚠️ Not available in {currentLocale}, showing {displayTranslation.locale} version
  </span>
)}
```

---

### 3. Translation Workflow ✅

**Decision:** Allow progressive translation (publish per locale)

**Rationale:**
- Flexible: coaches can translate immediately or later
- Realistic: not all content needs all languages immediately
- Scalable: easier to add new languages in future

**Implementation:**
- Resources can be saved with only source translation
- Additional translations can be added/edited anytime
- Translation status shown in UI (✓ complete, ⚠️ missing)

---

### 4. Existing Resources Migration ✅

**Decision:** Auto-translate during migration, allow manual review

**Rationale:**
- Batch translation is more efficient
- Manual review ensures quality
- Can be done gradually (not blocking launch)

**Implementation:**
1. Run migration script to create French translations for all existing resources
2. Batch auto-translate all to English using AI
3. Coaches/admins review and edit translations as needed
4. Mark reviewed translations (optional: add `isReviewed` flag)

---

### 5. Category/Tag Translations ⏳

**Decision:** Separate phase, use same pattern (future work)

**Rationale:**
- Resources are higher priority
- Same pattern can be reused
- Less content to translate (fewer categories/tags than resources)

**Future Implementation:**
```prisma
model ResourceCategory {
  id           String @id @default(uuid())
  slug         String @unique // technical slug
  iconEmoji    String?

  translations ResourceCategoryTranslation[]
  // ...
}

model ResourceCategoryTranslation {
  id         String @id @default(uuid())
  categoryId String
  locale     String
  name       String

  @@unique([categoryId, locale])
}
```

---

## Migration Strategy

### Pre-Migration Checklist

- [ ] **Backup production database**
- [ ] Test migration on staging environment
- [ ] Verify all existing resources have required fields (title, slug, summary, content)
- [ ] Communicate downtime to users (if needed)
- [ ] Prepare rollback plan

---

### Migration Steps

**Step 1: Schema Update**
```bash
cd apps/api-nest
npx prisma migrate dev --name add_resource_translations
```

**Step 2: Data Migration Script**

Create: `apps/api-nest/prisma/migrate-resources-to-translations.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting resource translation migration...');

  // Get all existing resources
  const resources = await prisma.resource.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log(`Found ${resources.length} resources to migrate`);

  // Create French translations for each resource
  for (const resource of resources) {
    await prisma.resourceTranslation.create({
      data: {
        resourceId: resource.id,
        locale: 'fr',
        title: resource.title,
        slug: resource.slug,
        summary: resource.summary,
        content: resource.content,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      },
    });

    console.log(`✓ Migrated resource: ${resource.title}`);
  }

  // Update all resources to set sourceLocale = 'fr'
  await prisma.resource.updateMany({
    data: {
      sourceLocale: 'fr',
    },
  });

  console.log('Migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run migration:**
```bash
npx tsx prisma/migrate-resources-to-translations.ts
```

**Step 3: Verify Migration**
```sql
-- Check that all resources have French translation
SELECT
  r.id,
  r."sourceLocale",
  COUNT(rt.id) as translation_count
FROM "Resource" r
LEFT JOIN "ResourceTranslation" rt ON r.id = rt."resourceId"
GROUP BY r.id, r."sourceLocale"
HAVING COUNT(rt.id) = 0;

-- Should return 0 rows
```

**Step 4: Deploy Backend + Frontend**
- Deploy updated backend with new endpoints
- Deploy updated frontend with translation UI
- Monitor logs for errors

**Step 5: Batch Auto-Translate (Optional)**

Create: `apps/api-nest/prisma/auto-translate-all-resources.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { AiService } from '../src/ai/ai.service';

const prisma = new PrismaClient();
const aiService = new AiService();

async function main() {
  console.log('Starting batch auto-translation...');

  const resources = await prisma.resource.findMany({
    where: {
      sourceLocale: 'fr',
    },
    include: {
      translations: {
        where: {
          locale: 'fr',
        },
      },
    },
  });

  console.log(`Found ${resources.length} French resources to translate`);

  for (const resource of resources) {
    const frTranslation = resource.translations[0];

    try {
      // Translate to English
      const enTranslation = await aiService.translate({
        sourceLocale: 'fr',
        targetLocale: 'en',
        fields: {
          title: frTranslation.title,
          summary: frTranslation.summary,
          content: frTranslation.content,
        },
      });

      // Generate English slug
      const slug = generateSlug(enTranslation.title);

      // Create English translation
      await prisma.resourceTranslation.upsert({
        where: {
          resourceId_locale: {
            resourceId: resource.id,
            locale: 'en',
          },
        },
        create: {
          resourceId: resource.id,
          locale: 'en',
          title: enTranslation.title,
          slug: slug,
          summary: enTranslation.summary,
          content: enTranslation.content,
        },
        update: {
          title: enTranslation.title,
          slug: slug,
          summary: enTranslation.summary,
          content: enTranslation.content,
        },
      });

      console.log(`✓ Translated: ${frTranslation.title}`);
    } catch (error) {
      console.error(`✗ Failed to translate resource ${resource.id}:`, error);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Batch translation complete!');
}

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

main()
  .catch((e) => {
    console.error('Batch translation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### Rollback Plan

If migration fails:

1. **Restore database from backup:**
   ```bash
   pg_restore -d mindfulspace_prod backup.dump
   ```

2. **Revert Prisma schema:**
   ```bash
   git revert <migration-commit>
   npx prisma migrate dev
   ```

3. **Redeploy previous version of backend/frontend**

---

## Testing Plan

### Unit Tests

**Backend:**
- [ ] Test `create()` creates resource + source translation
- [ ] Test `autoTranslate()` generates correct translations
- [ ] Test `updateTranslation()` updates specific locale
- [ ] Test `findBySlug()` finds resource by locale-specific slug
- [ ] Test `validateSlugUniqueness()` prevents duplicate slugs per locale
- [ ] Test `generateUniqueSlug()` generates unique slugs with counters

**Frontend:**
- [ ] Test `ResourceForm` initializes with source locale
- [ ] Test `ResourceForm` switches between translation tabs
- [ ] Test `autoTranslateResource()` API call
- [ ] Test `updateTranslation()` API call

---

### Integration Tests

- [ ] Test full create flow: create resource → auto-translate → update translation → save
- [ ] Test slug uniqueness across locales (same slug allowed in different locales)
- [ ] Test cascade delete (deleting resource deletes all translations)
- [ ] Test fallback behavior (missing translation shows source)
- [ ] Test admin vs coach permissions (featured flag, access to all resources, etc.)

---

### E2E Tests (Playwright/Cypress)

- [ ] Test creating new resource with auto-translation
- [ ] Test editing resource in multiple languages
- [ ] Test viewing resource in different locales
- [ ] Test translation status indicators
- [ ] Test form validation errors
- [ ] Test responsive design (mobile/tablet)

---

### Manual Testing Checklist

- [ ] Create resource in French → translate to English → verify quality
- [ ] Create resource in English → translate to French → verify quality
- [ ] Edit French translation → verify English translation unchanged
- [ ] Delete resource → verify all translations deleted
- [ ] Test slug uniqueness: create `/fr/resources/test` and `/en/resources/test` (should work)
- [ ] Test slug collision: create two resources with same slug in same locale (should fail)
- [ ] Test fallback: view resource in locale without translation
- [ ] Test language switcher on resource detail page
- [ ] Test admin features (featured flag, edit any resource)
- [ ] Test coach features (only edit own resources, no featured flag)
- [ ] Test performance: load resource list with 100+ resources
- [ ] Test AI translation quality: verify translations are accurate and natural
- [ ] Test error handling: network failures, AI service downtime, etc.

---

## Success Criteria

### Functional Requirements ✅
- [ ] Resources can be created in any supported locale
- [ ] AI auto-translation works for all supported locales
- [ ] Translations are editable before saving
- [ ] Slugs are unique within each locale
- [ ] Resources display in correct language based on URL locale
- [ ] Missing translations fall back to source language

### Non-Functional Requirements ✅
- [ ] Existing resources migrated without data loss
- [ ] Translation generation completes in < 10 seconds per resource
- [ ] Resource list page loads in < 2 seconds (with 100+ resources)
- [ ] No breaking changes to existing API contracts (backward compatible)
- [ ] All tests passing (unit, integration, E2E)

### User Experience ✅
- [ ] Clear visual indicators for translation status
- [ ] Intuitive UI for managing translations
- [ ] Helpful error messages for validation failures
- [ ] Loading states during AI translation
- [ ] Responsive design works on mobile/tablet

---

## Future Enhancements

### Phase 7+: Additional Features (Post-MVP)

1. **Translation Review Workflow**
   - Add `isReviewed` flag to translations
   - Allow admins to mark translations as "reviewed"
   - Show translation quality score (from AI service)

2. **Translation History**
   - Track translation versions
   - Allow reverting to previous translations
   - Show diff between versions

3. **Category/Tag Translations**
   - Apply same pattern to `ResourceCategory` and `ResourceTag`
   - Translate category names and tag names

4. **Bulk Translation Tools**
   - Admin panel to batch translate multiple resources
   - Translation queue (process in background)
   - Translation status dashboard

5. **Additional Languages**
   - Spanish (ES)
   - German (DE)
   - Italian (IT)
   - Portuguese (PT)

6. **Translation Analytics**
   - Track which translations are most viewed
   - Identify missing translations by usage
   - Translation quality feedback from users

7. **Content Localization**
   - Beyond translation: adapt content for cultural context
   - Different images/examples per locale
   - Locale-specific formatting (dates, numbers, etc.)

---

## Appendix

### A. Glossary

- **Source Locale:** The original language a resource was written in
- **Translation:** A version of the resource in a different language
- **Slug:** URL-friendly identifier for a resource (e.g., `meditation-guidee`)
- **Locale:** Language code (e.g., `fr`, `en`, `es`)
- **Auto-translate:** Using AI to automatically generate translations
- **Fallback:** Showing source language when translation doesn't exist

### B. File Structure

```
apps/api-nest/
├── src/
│   ├── resources/
│   │   ├── dto/
│   │   │   ├── create-resource.dto.ts
│   │   │   ├── update-resource.dto.ts
│   │   │   ├── create-translation.dto.ts
│   │   │   └── auto-translate.dto.ts
│   │   ├── resources.controller.ts
│   │   ├── resources.service.ts
│   │   └── resources.module.ts
│   ├── ai/
│   │   ├── ai.service.ts
│   │   ├── ai.controller.ts
│   │   └── ai.module.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_add_resource_translations/
│   ├── migrate-resources-to-translations.ts
│   └── auto-translate-all-resources.ts

apps/frontend-next/
├── src/
│   ├── components/
│   │   └── resources/
│   │       ├── ResourceForm.tsx
│   │       ├── SourceLocaleSelector.tsx
│   │       ├── TranslationTabs.tsx
│   │       ├── TranslationFields.tsx
│   │       └── ResourcesList.tsx
│   ├── lib/
│   │   └── api/
│   │       └── resources.ts
│   ├── app/
│   │   └── [locale]/
│   │       └── resources/
│   │           └── [slug]/
│   │               └── page.tsx
```

### C. References

- [Prisma Multi-Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [OpenAI Translation API](https://platform.openai.com/docs/guides/chat)
- [DeepL API Documentation](https://www.deepl.com/docs-api)

---

**Document Version:** 1.0
**Last Updated:** 2024-12-17
**Author:** Claude (AI Assistant)
**Status:** Draft - Pending Implementation
