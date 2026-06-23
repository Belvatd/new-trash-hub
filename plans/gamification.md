# Gamification Feature Implementation Plan

Implement the gamification system where users progress their "Pohon Lestari" (Eco Tree) based on total XP calculated from completed order history. Create a dedicated `/customer/tree` page to visually display the tree's growth stages and allow claiming a reward when the tree is fully grown (Pohon Lestari).

## Proposed Changes

### 1. Database Schema
- Run SQL migration to add `reward_claimed` column to the `users` table:
  ```sql
  ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN DEFAULT false;
  ```

### 2. Gamification Logic & Utilities
- Create `src/utils/gamification.ts` defining:
  - **Tunas**: `0 - 349 XP` (Next: 350 XP)
  - **Tunas Remaja**: `350 - 499 XP` (Next: 500 XP)
  - **Pohon Muda**: `500 - 799 XP` (Next: 800 XP)
  - **Pohon Remaja**: `800 - 1499 XP` (Next: 1500 XP)
  - **Pohon Lestari**: `>= 1500 XP` (Reward unlock)

### 3. Customer Home Page Integration
- Update `src/app/(restricted-page)/customer/page.tsx`:
  - Fetch order history using `useGetOrderHistory`.
  - Calculate total XP from completed orders (`status === 'DONE'`).
  - Render the correct stage and XP dynamically.
  - Link the card to `/customer/tree`.

### 4. Create `/customer/tree` Page
- Create `src/app/(restricted-page)/customer/tree/page.tsx`:
  - Visual display of the tree SVG illustration from /public/assets/illustration.
  - Interactive status and dialogue box.
  - Progress bar & alert banner.
  - Claim Reward functionality.
  - "Riwayat Xp" section listing all completed orders.

### 5. Claim Reward Mutation
- Add `useClaimReward` mutation in `src/hooks/services/Auth/service.ts` or similar to toggle `reward_claimed` to true.
