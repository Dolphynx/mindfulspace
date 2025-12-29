# Resource Translation - Slug Strategy Change

**Date:** 2024-12-17
**Status:** Decision Finalized

## Change Summary

The slug strategy for resource translations has been updated based on team feedback.

## OLD Approach (Localized Slugs)

**What was planned:**
- Slug in `ResourceTranslation` table
- Different slug per language (e.g., `/fr/resources/meditation-guidee` vs `/en/resources/guided-meditation`)
- Slug uniqueness per locale
- Users could edit slugs

**Problems:**
- More complex routing logic
- Slug field needed in form (manual editing)
- Locale-specific uniqueness checks
- Different URLs for same content across languages

## NEW Approach (Technical Slug)

**What we're doing now:**
- Slug stays in main `Resource` table
- Single slug for all languages (technical identifier)
- Slug is ALWAYS in English
- Auto-generated from title (no manual editing needed)
- Globally unique across all resources

**Benefits:**
- ✅ Simpler routing: same URL for all languages
- ✅ Easier to share URLs across languages
- ✅ No slug field in form - fully automatic
- ✅ Consistent with app's technical routes (already in English)
- ✅ Simpler uniqueness check (global, not per-locale)

## Implementation Details

### Database Schema

```prisma
model Resource {
  id          String   @id @default(uuid())
  slug        String   @unique // Technical identifier (English)
  type        ResourceType
  isPremium   Boolean  @default(false)
  isFeatured  Boolean  @default(false)
  sourceLocale String  @default("fr")
  // ... other fields

  translations ResourceTranslation[]
}

model ResourceTranslation {
  id         String   @id @default(uuid())
  resourceId String
  locale     String

  title      String
  summary    String
  content    String
  // NOTE: NO slug field here!

  @@unique([resourceId, locale])
}
```

### Slug Generation Logic

**On resource creation:**

```typescript
// Backend service method
async create(dto: CreateResourceDto, userId: string) {
  const { title, sourceLocale, summary, content, ...resourceData } = dto;

  // 1. Generate English slug
  let englishTitle = title;

  // If source is not English, translate title to English first
  if (sourceLocale !== 'en') {
    englishTitle = await this.aiService.translateText(title, sourceLocale, 'en');
  }

  // 2. Generate slug from English title
  const slug = await this.generateUniqueSlug(englishTitle);

  // 3. Create resource with slug + source translation
  const resource = await this.prisma.resource.create({
    data: {
      ...resourceData,
      slug, // Stored in Resource table
      sourceLocale,
      translations: {
        create: {
          locale: sourceLocale,
          title, // Original title (could be French)
          summary,
          content,
        },
      },
    },
  });

  return resource;
}

// Generate unique slug (English, globally unique)
private async generateUniqueSlug(englishTitle: string): Promise<string> {
  let baseSlug = this.slugify(englishTitle);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await this.prisma.resource.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

private slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
```

### URL Structure

**All locales use same slug:**
- `/fr/resources/guided-meditation` → French translation
- `/en/resources/guided-meditation` → English translation

**Backend lookup:**
```typescript
async findBySlug(slug: string, locale: string) {
  const resource = await this.prisma.resource.findUnique({
    where: { slug },
    include: {
      translations: {
        where: { locale }, // Get translation for current locale
      },
      // ... other includes
    },
  });

  // Fallback to source locale if translation doesn't exist
  if (resource && resource.translations.length === 0) {
    const sourceTranslation = await this.prisma.resourceTranslation.findUnique({
      where: {
        resourceId_locale: {
          resourceId: resource.id,
          locale: resource.sourceLocale,
        },
      },
    });
    resource.translations = [sourceTranslation];
  }

  return resource;
}
```

## Frontend Changes

### Form Updates

**REMOVED:**
- Slug input field (was in ResourceForm)
- Slug validation
- Manual slug editing

**KEPT:**
- Title input (per locale)
- Summary input (per locale)
- Content input (per locale)
- Source locale selector

**Example:**
```tsx
// OLD: Had slug field
<input
  name="slug"
  value={formData.translations[locale].slug}
  onChange={...}
/>

// NEW: No slug field - auto-generated on backend
// Just title, summary, content
```

### ResourcesList Component

**No changes needed!** Already uses slug from Resource level:

```tsx
<Link href={`/${locale}/resources/${resource.slug}`}>
  {translation.title}
</Link>
```

## Migration Impact

### Data Migration

**What needs to change:**
1. Keep existing `slug` in `Resource` table (already there)
2. Move `title`, `summary`, `content` to `ResourceTranslation` table
3. Do NOT move `slug` to `ResourceTranslation`

**Migration script remains mostly the same:**
```typescript
// Create French translations for existing resources
for (const resource of resources) {
  await prisma.resourceTranslation.create({
    data: {
      resourceId: resource.id,
      locale: 'fr',
      title: resource.title,
      summary: resource.summary,
      content: resource.content,
      // NOTE: Do NOT copy slug here!
    },
  });
}

// Slug stays in Resource table - no changes needed
```

## Testing Checklist

**Backend:**
- [ ] Test slug generation from English title
- [ ] Test slug generation from French title (should translate to English first)
- [ ] Test slug uniqueness (global check)
- [ ] Test slug collision handling (add counter: `-1`, `-2`, etc.)
- [ ] Test resource lookup by slug + locale

**Frontend:**
- [ ] Verify no slug field in form
- [ ] Test resource creation (slug auto-generated)
- [ ] Test resource edit (slug unchanged)
- [ ] Test resource URLs in both locales (same slug)
- [ ] Test resource display with correct translation

**Migration:**
- [ ] Test migration script preserves existing slugs
- [ ] Verify slug column stays in Resource table
- [ ] Verify no slug column in ResourceTranslation table

## Questions Answered

**Q: What if two resources have the same English title?**
A: Slug generation adds a counter suffix: `meditation-basics`, `meditation-basics-1`, `meditation-basics-2`, etc.

**Q: Can users edit the slug?**
A: No, it's fully automatic. This keeps URLs consistent and avoids broken links.

**Q: What if we want to change a resource's slug later?**
A: Admins can manually update via database if absolutely necessary, but this should be rare. Better to keep URLs stable.

**Q: What about SEO with non-localized slugs?**
A: The `<title>` and `<meta>` tags are localized, which is more important for SEO than the URL slug. Search engines prioritize content over URL structure.

**Q: What if source language is neither French nor English?**
A: The AI service should be able to translate any source language to English for slug generation.

## Summary

This change simplifies the implementation significantly:
- **Less complex routing** - same slug for all locales
- **No UI changes** - slug field removed from form
- **Simpler database** - no slug in ResourceTranslation
- **Better UX** - URLs are shareable across languages

The main tradeoff is losing localized URLs (e.g., `/meditation-guidee`), but the benefits outweigh this for a technical application where routes are already in English.
