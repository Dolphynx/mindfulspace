# Resources Components

This directory contains reusable components for managing and displaying resources in the MindfulSpace application.

## Components

### ResourcesList

A comprehensive, reusable component for displaying resources in a grid with search, filtering, and management capabilities.

#### Features

- **Three Display Modes**:
  - `public`: View-only for all users (locks premium content for non-premium users)
  - `myResources`: Coach's own resources with edit/delete actions
  - `admin`: All resources with full management capabilities

- **Search & Filtering**:
  - Real-time search by title/summary
  - Category filtering with counts
  - Client-side filtering for `myResources` mode
  - Server-side filtering for `public` and `admin` modes

- **Premium Content Protection**:
  - Automatically locks premium resources for non-premium users in public mode
  - Visual indicators (lock icon, opacity, disabled state)
  - Premium badge and icon display

- **Management Actions** (myResources & admin modes):
  - Edit button linking to edit page
  - Delete button with confirmation modal
  - Loading states during deletion

- **Responsive Design**:
  - Mobile-first grid layout (1 column → 2 columns on md+)
  - Responsive cards with hover effects
  - Touch-friendly buttons and interactions

#### Props

```typescript
interface ResourcesListProps {
  mode: 'public' | 'myResources' | 'admin';  // Display mode
  locale: string;                             // Current locale (e.g., 'fr', 'en')
  showCreateButton?: boolean;                 // Show "Create Resource" button
  onResourceCreated?: () => void;             // Callback after resource creation
  className?: string;                         // Additional CSS classes
}
```

#### Usage Examples

##### 1. Public Resources Page

```tsx
// app/[locale]/(public)/resources/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';
import PageHero from '@/components/PageHero';

export default function ResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <div>
      <PageHero
        title="Resources"
        subtitle="Explore our wellness resources"
      />

      <div className="container mx-auto px-4 py-8">
        <ResourcesList
          mode="public"
          locale={locale}
        />
      </div>
    </div>
  );
}
```

##### 2. Coach Dashboard - My Resources

```tsx
// app/[locale]/coach/resources/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';

export default function CoachResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Resources</h1>

      <ResourcesList
        mode="myResources"
        locale={locale}
        showCreateButton={true}
      />
    </div>
  );
}
```

##### 3. Admin Dashboard - All Resources

```tsx
// app/[locale]/admin/resources/page.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ResourcesList } from '@/components/resources';

export default function AdminResourcesPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resources Management</h1>

      <ResourcesList
        mode="admin"
        locale={locale}
        showCreateButton={true}
      />
    </div>
  );
}
```

#### Mode Behavior Comparison

| Feature | Public | MyResources | Admin |
|---------|--------|-------------|-------|
| Data Source | `getResources()` | `getMyResources()` | `getResources()` |
| Filtering | Server-side | Client-side | Server-side |
| Premium Lock | ✅ Yes | ❌ No | ❌ No |
| Edit/Delete | ❌ No | ✅ Own only | ✅ All |
| Create Button | ❌ No | ✅ Optional | ✅ Optional |
| Card Click | Link to detail | No link | No link |

#### Translation Keys Required

The component uses two i18n namespaces:

**resourcesManagement** (primary):
- `searchPlaceholder`, `allCategories`
- `myResources`, `allResources`, `createResource`
- `noResources`, `noResourcesDescription`
- `card.premium`
- `actions.edit`, `actions.delete`
- `deleteConfirm.title`, `deleteConfirm.message`, `deleteConfirm.confirm`, `deleteConfirm.cancel`
- `errors.deleteFailed`

**resourcesPage** (for public mode):
- `loading`, `premiumBadge`, `readTimeSuffix`
- `lockedPremiumResource`, `lockedPremiumTooltip`

#### API Functions Used

From `@/lib/api/resources`:
- `getResources(params)` - Fetch all/filtered resources (public/admin)
- `getMyResources()` - Fetch user's own resources (coach)
- `getCategories()` - Fetch categories with counts
- `deleteResource(id)` - Delete a resource

#### Authentication & Authorization

The component automatically:
- Checks user authentication via `useAuth()` hook
- Determines premium access based on roles: `premium`, `coach`, `admin`
- Shows/hides management actions based on mode and user role
- Locks premium resources for non-premium users in public mode

#### Styling

Uses MindfulSpace design system:
- **Colors**: `brandPrimary`, `brandText`, `brandText-soft`, `brandBorder`, `brandBg`, `brandBgCard`, `brandGreen`
- **Border Radius**: `rounded-card` (consistent with design system)
- **Shadows**: `shadow-card`, hover effects with `shadow-lg`
- **Transitions**: Smooth hover animations

#### Delete Confirmation Flow

1. User clicks "Delete" button on a resource card
2. Modal appears with confirmation message
3. User confirms → API call to `deleteResource(id)`
4. On success:
   - Resource removed from local state
   - Modal closes
   - UI updates immediately
5. On error:
   - Alert shows error message
   - Modal remains open

#### Performance Considerations

- **Optimized Filtering**:
  - Server-side for public/admin (reduces payload)
  - Client-side for myResources (better UX, smaller dataset)

- **State Management**:
  - Local state for resources list
  - Immediate UI updates after delete (optimistic UI)

- **Loading States**:
  - Global loading state while fetching
  - Per-resource loading state during deletion

#### Future Enhancements

Potential improvements (not yet implemented):
- Pagination for large datasets
- Bulk delete functionality
- Sort options (date, title, popularity)
- Grid/List view toggle
- Export resources to CSV
- Drag-and-drop reordering for featured resources

---

### ResourceForm

A comprehensive form component for creating/editing resources. See `ResourceForm.tsx` for implementation details.

## File Structure

```
components/resources/
├── index.ts              # Barrel export
├── ResourcesList.tsx     # Resources list component
├── ResourceForm.tsx      # Resource form component
└── README.md            # This file
```

## Related Files

- **API Client**: `apps/frontend-next/src/lib/api/resources.ts`
- **Backend Controller**: `apps/api-nest/src/resources/resources.controller.ts`
- **Backend Service**: `apps/api-nest/src/resources/resources.service.ts`
- **Translations**:
  - `apps/frontend-next/src/i18n/dictionaries/fr.ts` (resourcesManagement, resourcesPage)
  - `apps/frontend-next/src/i18n/dictionaries/en.ts` (resourcesManagement, resourcesPage)
