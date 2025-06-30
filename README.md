# Farm GIS Management App

A modern web application for managing large-scale farm operations with advanced GIS capabilities.

## Features (Planned)

- **Field Management**: Handle 700+ fields with ease
- **Interactive Map**: Leaflet-based mapping with polygon drawing
- **Field Selection**: Click and multi-select field areas
- **Drawing Tools**: Create cultivation areas with snapping to field boundaries
- **Status Management**: Track active/inactive cultivation areas
- **Farmer-Friendly UI**: Intuitive interface designed for non-technical users

## Tech Stack

- **Next.js 14** with TypeScript
- **Leaflet** for mapping
- **Tailwind CSS** for styling
- **Leaflet.Snap** for polygon snapping functionality

## Development Phases

### Phase 1: Basic Map Foundation ✅
- [x] Next.js project setup with TypeScript
- [x] Basic Leaflet map integration
- [x] CSV field data loading and parsing
- [x] Field polygon display with status-based styling
- [x] Interactive field selection and hover effects
- [x] Field list sidebar with active/inactive grouping
- [x] Responsive layout with map and sidebar

### Phase 2: Drawing System (Planned)
- [ ] Leaflet.draw integration
- [ ] Polygon snapping to field boundaries
- [ ] Multi-field selection
- [ ] Overlap validation

### Phase 3: Data Management (Planned)
- [ ] Field status management
- [ ] Information panels
- [ ] Detailed field views

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   └── MapComponent.tsx # Main map component
└── types/              # TypeScript type definitions
```
