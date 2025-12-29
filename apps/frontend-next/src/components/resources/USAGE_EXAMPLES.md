# ResourcesList Component - Usage Examples

## Quick Start

```tsx
import { ResourcesList } from '@/components/resources';

// In your page component
<ResourcesList mode="public" locale="fr" />
```

## Complete Page Examples

### Example 1: Public Resources Page (View-Only)

**File**: `apps/frontend-next/src/app/[locale]/(public)/resources/page.tsx`

This example shows how to replace the existing resources page with the ResourcesList component:

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';
import PageHero from '@/components/PageHero';
import { useTranslations } from '@/i18n/TranslationContext';

export default function ResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('resourcesPage');

  return (
    <div className="text-brandText flex flex-col">
      <PageHero
        title={t('heroTitle')}
        subtitle={t('heroSubtitle')}
      />

      <section className="mx-auto max-w-5xl w-full px-4 py-8">
        <ResourcesList
          mode="public"
          locale={locale}
        />
      </section>
    </div>
  );
}
```

**Features**:
- Premium resources locked for non-premium users
- Server-side search and filtering
- Clickable cards linking to resource detail pages
- No edit/delete actions

---

### Example 2: Coach Resources Dashboard

**File**: `apps/frontend-next/src/app/[locale]/coach/resources/page.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';
import { useTranslations } from '@/i18n/TranslationContext';

export default function CoachResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('resourcesManagement');

  return (
    <div className="min-h-screen bg-brandBg">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brandText">
            {t('myResources')}
          </h1>
          <p className="text-brandText-soft mt-2">
            Manage your educational resources and content
          </p>
        </div>

        {/* Resources List */}
        <ResourcesList
          mode="myResources"
          locale={locale}
          showCreateButton={true}
        />
      </div>
    </div>
  );
}
```

**Features**:
- Shows only coach's own resources
- Client-side search and filtering (fast UX)
- Edit and delete buttons on each card
- Create button in header
- No premium locking

---

### Example 3: Admin Resources Management

**File**: `apps/frontend-next/src/app/[locale]/admin/resources/page.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';
import { useTranslations } from '@/i18n/TranslationContext';

export default function AdminResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';
  const t = useTranslations('resourcesManagement');

  return (
    <div className="min-h-screen bg-brandBg">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brandText flex items-center gap-2">
            <span>🛠️</span>
            {t('title')}
          </h1>
          <p className="text-brandText-soft mt-2">
            Manage all platform resources - edit, delete, and feature content
          </p>
        </div>

        {/* Resources List */}
        <ResourcesList
          mode="admin"
          locale={locale}
          showCreateButton={true}
        />

        {/* Admin Stats (Optional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Resources" value="24" />
          <StatCard title="Premium" value="8" />
          <StatCard title="Free" value="16" />
          <StatCard title="Featured" value="5" />
        </div>
      </div>
    </div>
  );
}

// Optional Stats Component
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-brandBorder rounded-card shadow-card p-4">
      <div className="text-sm text-brandText-soft">{title}</div>
      <div className="text-2xl font-bold text-brandText mt-1">{value}</div>
    </div>
  );
}
```

**Features**:
- Shows all resources from all users
- Server-side search and filtering
- Full edit/delete permissions
- Create button
- Can manage featured resources

---

## Component Integration Patterns

### Pattern 1: With Custom Header

```tsx
<div className="space-y-6">
  {/* Custom Header */}
  <div className="bg-white border border-brandBorder rounded-card shadow-card p-6">
    <h2 className="text-2xl font-bold mb-2">Resource Library</h2>
    <p className="text-brandText-soft">
      Browse our collection of wellness resources
    </p>
  </div>

  {/* Resources List */}
  <ResourcesList mode="public" locale={locale} />
</div>
```

### Pattern 2: Side-by-Side with Filters

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Sidebar Filters */}
  <aside className="lg:col-span-1">
    <div className="bg-white border border-brandBorder rounded-card shadow-card p-4">
      <h3 className="font-semibold mb-4">Quick Filters</h3>
      {/* Custom filter buttons */}
    </div>
  </aside>

  {/* Main Content */}
  <main className="lg:col-span-3">
    <ResourcesList mode="public" locale={locale} />
  </main>
</div>
```

### Pattern 3: With Tabs (My Resources + Browse All)

```tsx
'use client';

import { useState } from 'react';
import { ResourcesList } from '@/components/resources';

export default function ResourcesPageWithTabs() {
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');
  const locale = 'fr';

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-brandBorder">
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'mine'
              ? 'border-brandPrimary text-brandPrimary'
              : 'border-transparent text-brandText-soft'
          }`}
        >
          My Resources
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-brandPrimary text-brandPrimary'
              : 'border-transparent text-brandText-soft'
          }`}
        >
          Browse All
        </button>
      </div>

      {/* Content */}
      {activeTab === 'mine' ? (
        <ResourcesList
          mode="myResources"
          locale={locale}
          showCreateButton={true}
        />
      ) : (
        <ResourcesList
          mode="public"
          locale={locale}
        />
      )}
    </div>
  );
}
```

---

## Protected Routes Setup

### Coach Route Protection

**File**: `apps/frontend-next/src/app/[locale]/coach/resources/layout.tsx`

```tsx
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function CoachResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roles={['coach', 'admin']}>
      {children}
    </AuthGuard>
  );
}
```

### Admin Route Protection

**File**: `apps/frontend-next/src/app/[locale]/admin/resources/layout.tsx`

```tsx
'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard roles={['admin']}>
      {children}
    </AuthGuard>
  );
}
```

---

## Customization Examples

### Custom Empty State

```tsx
<ResourcesList
  mode="myResources"
  locale={locale}
  showCreateButton={true}
  className="custom-resources-list"
/>

// Add custom CSS
.custom-resources-list .empty-state {
  /* Your custom styles */
}
```

### Custom Styling

```tsx
<div className="my-custom-container">
  <ResourcesList
    mode="public"
    locale={locale}
    className="shadow-xl rounded-3xl overflow-hidden"
  />
</div>
```

---

## Error Handling

The component handles errors gracefully:

1. **Network Errors**: Logged to console, empty state shown
2. **Delete Errors**: Alert shown to user with error message
3. **Auth Errors**: Handled by `apiFetch` with automatic token refresh

To add custom error handling:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ResourcesList } from '@/components/resources';

export default function ResourcesPageWithErrorBoundary() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600">
          Something went wrong
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brandPrimary text-white rounded-card"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return <ResourcesList mode="public" locale="fr" />;
}
```

---

## Testing the Component

### Manual Testing Checklist

#### Public Mode
- [ ] Premium resources are locked for non-premium users
- [ ] Premium resources are accessible for premium/coach/admin users
- [ ] Search works correctly
- [ ] Category filters work
- [ ] Cards link to resource detail pages
- [ ] No edit/delete buttons visible

#### MyResources Mode
- [ ] Only shows user's own resources
- [ ] Search filters client-side
- [ ] Category filters work
- [ ] Edit buttons link to edit page
- [ ] Delete button shows confirmation modal
- [ ] Delete works and removes from list
- [ ] Create button visible when `showCreateButton={true}`

#### Admin Mode
- [ ] Shows all resources from all users
- [ ] Edit/delete buttons work for all resources
- [ ] Can delete resources linked to meditation programs
- [ ] Create button works

---

## Performance Tips

1. **Use Server-Side Filtering** for large datasets (public/admin modes)
2. **Client-Side Filtering** for small datasets (myResources mode)
3. **Pagination**: Consider adding if resource count > 100
4. **Lazy Loading**: Consider implementing for infinite scroll

---

## Troubleshooting

### Issue: "No resources" always shown
**Solution**: Check network tab for API errors. Verify backend is running on port 3001.

### Issue: Premium resources not locking
**Solution**: Verify user roles in AuthContext. Check `hasPremiumAccess` logic.

### Issue: Delete not working
**Solution**: Check console for errors. Verify user has permission (owner or admin).

### Issue: Category filters not showing counts
**Solution**: Backend must return `_count.resources` in category objects.

### Issue: Translation keys missing
**Solution**: Verify all keys exist in both `fr.ts` and `en.ts` dictionaries under `resourcesManagement` namespace.
