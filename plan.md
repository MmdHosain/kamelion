# Frontend CSS Refactoring Plan

Based on the CSS evaluation, here is the step-by-step plan to refactor the styling of the `mehrafrouz-mock` project.

## Phase 1: Configuration Updates
1. **Update `tailwind.config.js`**:
   - Centralize hardcoded color values into the Tailwind configuration.
   - Extract custom animations and keyframes to reduce scattered CSS.
   - Proposed configuration additions:
     ```javascript
     export default {
       // ...existing config
       theme: {
         extend: {
           colors: {
             primary: '#2F5D50',
             primaryLight: '#264C42',
             secondary: '#E6C5CC',
             dark: '#1a2522',
             lightText: '#FAFAF8',
             mutedText: '#6B6E6C'
           },
           animation: {
             fadeSlide: 'fadeSlide 0.8s ease-out forwards',
             messageIn: 'messageIn 0.2s ease-out',
           }
         }
       }
     }
     ```

## Phase 2: CSS File Consolidation & Cleanup
1. **Remove Boilerplate Code**:
   - Delete `src/App.css` as it contains unused Vite template boilerplate.
   - Remove the import statement for `App.css` wherever it is imported (e.g., `src/App.jsx` or `src/main.jsx`).
2. **Consolidate Inline Styles**:
   - Move `.rdp-custom` (React Day Picker overrides) from the inline `<style>` tag in `src/components/ui/AppointmentModal.jsx` to `src/index.css`.
   - Move `scrollbarStyles` from the inline string in `src/components/admin/patients/PatientDetailModal.jsx` into `src/index.css`.
3. **Merge Stylesheets**:
   - Combine any stray animations (e.g., from `tailwind.css`) into `index.css` or replace them entirely via `tailwind.config.js`.

## Phase 3: Project-Wide Search & Replace (Tailwind Classes)
1. **Replace Arbitrary Color Values**:
   - Find instances of `[#2F5D50]` (e.g., `bg-[#2F5D50]`, `text-[#2F5D50]`, `border-[#2F5D50]`) and replace them with the corresponding `primary` utility class (e.g., `bg-primary`, `text-primary`, `border-primary`).
   - Find instances of `[#264C42]` and replace with `primaryLight` equivalents.
   - Find instances of `[#E6C5CC]` and replace with `secondary` equivalents.
   - Apply similar replacements for `dark`, `lightText`, and `mutedText` across all components.
2. **Testing & Verification**:
   - Run the development server and thoroughly check the application to ensure that no layout or styling breakages occurred due to the class replacements.
   - Verify that all modals, specifically `AppointmentModal` and `PatientDetailModal`, display their scrollbars and calendars correctly without inline styles.