# PDFNova Implementation Guide

## Objective
Build a modern PDF Toolkit website using React and normal CSS with a clean, dashboard-style UI and reusable architecture.

## Tools To Include
- PDF to Word
- Word to PDF
- Merge PDF
- Split PDF
- Compress PDF
- Image to PDF

## Core Requirements Checklist
- Clean and responsive UI
- Modern dashboard-style layout
- Drag and drop file upload
- Upload progress indicator
- Download button after conversion
- Dark mode support
- Reusable React components
- Navbar and sidebar
- Tool cards on homepage
- Smooth animations
- Loading states and toast notifications

## React Concepts Used
- useState for local state and UI controls
- useEffect for side effects and lifecycle updates
- Props for reusable and configurable components
- Component-based architecture for scalability
- Conditional rendering for states and tool-specific options
- API handling pattern through a service layer
- File handling using browser File APIs and dropzone
- Routing with React Router

## Tech Stack
- React + Vite
- React Router
- React Dropzone
- Framer Motion
- Pure CSS (separate stylesheet per component/page)

## Pages
- Home page
- Tool details page
- About page
- Contact page

## Recommended Folder Structure
src/
- components/
- pages/
- styles/
- hooks/
- services/
- utils/
- assets/

## Component Plan
### Reusable Components
- Button component with variants: primary, secondary, ghost
- Tool card component for homepage grid
- Upload dropzone component for drag and drop file input
- Progress bar component for upload and processing feedback
- Toast provider for global success, error, and info messages
- Layout, Navbar, and Sidebar for dashboard shell

### Page Responsibilities
- Home page: hero section, stats, tool cards, workflow overview
- Tool details page: file upload, options, progress, convert action, download result
- About page: app purpose, architecture summary, design values
- Contact page: simple validated form with success toast

## State and Data Flow
- Keep global UI shell state in layout-level components (theme, sidebar)
- Keep tool state local to tool details page (files, progress, loading, output)
- Store tool metadata in a single data module (slug, labels, accepted files, features)
- Keep conversion logic in services for easier backend replacement later

## Service Layer Guidance
- Create a service module for conversion handling
- Start with mock or client-side conversion logic
- Return a normalized response shape:
  - blob
  - fileName
  - mimeType
  - summary
- Handle errors with clear user-facing messages

## Styling Guidelines
- Use CSS variables for colors, spacing, shadows, and radii
- Keep each component/page style in its own CSS file
- Use Flexbox for alignment and small layouts
- Use CSS Grid for dashboard and cards
- Add hover states and smooth transitions
- Use soft shadows, rounded cards, and gradient CTA buttons
- Implement dark mode using a theme attribute on root

## Animation and UX
- Use Framer Motion for route transitions and card reveal
- Add smooth enter/exit animations for toasts
- Show clear loading states during upload and conversion
- Animate progress bar updates

## Accessibility and Responsiveness
- Keep interactive controls keyboard-friendly
- Add clear labels and focus-visible styles
- Ensure mobile-first responsive behavior
- Collapse sidebar behavior for smaller screens

## Production-Style Standards
- Keep files small and focused
- Prefer reusable, composable components
- Avoid duplicated logic and duplicated styles
- Keep naming consistent and beginner-friendly
- Separate UI, state logic, and service logic

## Suggested Build Steps
1. Install dependencies.
2. Build shared layout and theme system.
3. Create reusable components.
4. Build homepage with tool cards.
5. Build tool details workflow with dropzone, progress, and download flow.
6. Add about and contact pages.
7. Add toasts and loading states.
8. Validate responsiveness and dark mode.
9. Run build and lint checks.

## Future Enhancements
- Replace mock/client conversion with backend APIs
- Add authentication and conversion history
- Add usage analytics dashboard
- Add localization support
- Add queue and retry support for failed jobs
