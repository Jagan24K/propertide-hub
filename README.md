# Property Hub

Build a simple, clean, professional Property Management web app. FRONTEND ONLY — do not create any backend, database, or Lovable Cloud/Supabase. The backend already exists on Zoho Catalyst.

EXISTING CATALYST API (single constant API_BASE_URL):
https://propertymanagementapi-60087170674.development.catalystserverless.in/properties

API behavior (all parameters passed as URL query parameters; never mock data, never replace this API):
1. GET ALL: GET API_BASE_URL + "?action=get" → { "success": true, "properties": [...] }
2. CREATE: POST API_BASE_URL + "?action=create&property_name=...&location=...&price=...&property_type=...&status=..."
3. UPDATE: PUT API_BASE_URL + "?action=update&row_id=...&property_name=...&location=...&price=...&property_type=...&status=..."
4. DELETE: DELETE API_BASE_URL + "?action=delete&row_id=..."
Catalyst Data Store table "Properties" with fields: ROWID, PROPERTY_NAME, LOCATION, PRICE, PROPERTY_TYPE, STATUS.

Build reusable fetch functions: fetchProperties(), createProperty(), updateProperty(), deleteProperty() — all using fetch(), with API_BASE_URL defined once and never hardcoded elsewhere.

UI REQUIREMENTS:
- Header: title "Property Management", subtitle "Manage and monitor your property listings", and a "Refresh" button.
- Summary cards: Total Properties, Available Properties, Sold Properties, Total Property Value.
- Property list: clean responsive table (or cards on mobile) showing Property Name, Location, Price, Property Type, Status, Actions.
- Status badges: Available → green, Sold → red/gray.
- Price formatted in Indian currency format, e.g. ₹75,00,000.
- Actions per property: Edit and Delete.
- "Add Property" button opens a modal form with fields: Property Name, Location, Price, Property Type (Apartment, Villa, Independent House), Status (Available, Sold). On submit: call Catalyst create API, close the form, refresh the list, show a success message.
- Edit opens the same modal pre-filled, calls the update API (with row_id), refreshes the list, shows success message.
- Delete asks for confirmation, calls the delete API (with row_id), refreshes the list, shows success message.
- Loading indicator while fetching; friendly error message if the Catalyst API fails (e.g. CORS or network); never crash on unexpected API responses; disable submit buttons while saving.

DESIGN: professional business dashboard, clean white/light background, blue accent color, rounded cards, good spacing, responsive (desktop and mobile), minimal animations, simple because this is a demonstration project.

Use React (default setup). The final result should look like a small real-world property management dashboard, not a generic template.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4e42ac0-38fb-4978-baec-446e552cafc7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
