# CRM Frontend (Vite + React + Ant Design)

## [2024-06] UI/UX Update: Modern Button Styles

- All buttons across admin pages now use a modern, consistent style:
  - Rounded corners, bold font, and improved padding for better touch targets.
  - Unified color palette using CSS variables from `root.css`.
  - Smooth hover, focus, and active transitions for better accessibility and feedback.
  - Custom color overrides for View, Edit, Delete actions remain in `LeadTableCustom.css`.
  - All Ant Design and native buttons are affected.
- See `src/root.css` and `src/pages/admin/LeadTableCustom.css` for implementation details.
- This change brings a more modern, accessible, and visually consistent look to all admin pages.

# [UPDATE] Backend Structure (2024-06)
- The backend now uses the following structure:
  - `Inventory`: Represents inventory categories/types (e.g., Hardware, Software)
  - `Component`: Represents component types/categories under inventory (e.g., CPU, PC, etc.), and now handles all product usage and versioning information directly as separate rows (not as a JSON column).
- The `product_usage` table and all related backend/frontend logic have been removed. All product-related logic and fields are now managed by the `component` table and API.
- The backend API endpoints for products are now under `/api/components`.
- The `component` table and model now include: `id`, `inventory_id`, `product_name`, `model`, `img`, `unit_price`, `availability`, `total_quantity`, `description`, `created_at`, `updated_at`.

This project is a role-based Customer Relationship Management (CRM) frontend built with Vite, React, and Ant Design (antd).

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/                # API request functions (e.g., axios instances, endpoints)
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components (buttons, tables, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Layout components (AdminLayout, UserLayout, ManagerLayout)
│   ├── pages/
│   │   ├── admin/          # Admin-specific pages
│   │   │   └── Dashboard.jsx
│   │   ├── user/           # User-specific pages
│   │   │   └── Dashboard.jsx
│   │   ├── manager/        # Manager-specific pages
│   │   │   └── index.jsx
│   │   ├── auth/           # Login, Register, Forgot Password, etc.
│   │   │   └── Login.jsx
│   │   └── NotFound.jsx    # 404 page
│   ├── routes/             # Route definitions, role-based route guards
│   │   └── index.jsx
│   ├── store/              # State management (e.g., Redux, Zustand, Context)
│   ├── utils/              # Utility functions/helpers
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Features
- **Role-based layouts** for Admin, User, and Manager, each with their own sidebar and header.
- **Ant Design** UI components.
- **Logout icon** (Ant Design's `LogoutOutlined`) in the header corner for all roles.
- **React Router v6** for routing and role-based route protection.

## Usage

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
3. The app uses a placeholder for authentication and role logic. To test different roles, set the `role` in your browser's localStorage:
   - Open DevTools > Console and run:
     ```js
     localStorage.setItem('role', 'admin'); // or 'user', 'manager'
     ```
   - Then navigate to `/admin/dashboard`, `/user/dashboard`, or `/manager/dashboard`.

## Leads Management Page

- Navigate to **/admin/leads** for the full-featured Leads management page.
- Features:
  - Add, edit, view, and delete leads (Name, Email, Phone, WhatsApp, Reference, Remark, Status).
  - All forms and views are in fixed, scrollable drawers.
  - Table with pagination, continuous numbers, and responsive design.
  - 3-dot menu for actions (edit, view, delete with pop confirm).
  - Fully connected to backend API (Express + SQL DB).

### Usage
- Click **Add Lead** to open the drawer and submit a new lead.
- Use the action menu on each row to view, edit, or delete a lead.
- Pagination controls are at the bottom of the table.

## Client Management Page

- Navigate to **/admin/clients** for the Clients management page.
- Features:
  - View, add, edit, and delete clients.
  - When a lead is approved from the Leads page, it is moved to the Clients table.
  - All forms and views are in fixed, scrollable drawers.
  - Table with pagination, continuous numbers, and responsive design.
  - 3-dot menu for actions (edit, view, delete with pop confirm).
  - Fully connected to backend API.

### Usage
- Click **Add Client** to open the drawer and submit a new client.
- Use the action menu on each row to view, edit, or delete a client.
- Clients are also created automatically when a lead is approved from the Leads page.
- Pagination controls are at the bottom of the table.

## Inventory Management Page

- Navigate to **/admin/inventory** or use the **Inventory** link in the Admin sidebar.
- Features:
  - Placeholder for inventory management (page created, logic to be implemented).
  - Sidebar now includes an Inventory link with an archive box icon.

### Usage
- Click **Inventory** in the sidebar to access the Inventory page.
- Extend this page with inventory management features as needed.

## Inventory Navigation & Details

- The Inventory page lists all components (e.g., CPU, PC) with total types, description, and serial number.
- Clicking 'View' on a component navigates to the Component page, showing all products for that component in a table (with product name, model, image, price, availability, quantity, etc.).
- Clicking 'View' on a product navigates to the Product page, showing all details for that product.
- All navigation is available via the sidebar and table actions in the Admin section.
- Product details are now shown in a drawer on the Component page (Inventory/Component.jsx) instead of a separate Product page. The Product.jsx file has been removed.
- The edit drawer in the Inventory page and the add/edit drawer in the Component page now match the Client drawer UI for a consistent experience.
- The Component page now uses a vertical 3-dot dropdown for row actions, matching the modern UI pattern.
- The Component page now supports image upload for each product. Images are stored in the backend `/uploads` folder and served at `/uploads/filename`. When adding or editing a product, you can upload an image using the UI.
- The Component page (`src/pages/admin/Inventory/Component.jsx`) was fully refactored in June 2024:
  - All add, edit, view, and delete product (component) features are robust and error-handled.
  - Uses modern Ant Design best practices for forms, drawers, and dropdown menus.
  - Improved error handling and user feedback for all API actions.
  - Code is cleaner and more maintainable.

## Customization
- Add more pages to each role in their respective folders under `src/pages/`.
- Update the sidebar menu in each layout (`AdminLayout.jsx`, `UserLayout.jsx`, `ManagerLayout.jsx`).
- Implement real authentication and role management as needed.

---

## Responsive Layout Example

A new responsive layout example using Ant Design's Layout, Sider, Header, Content, and Footer is available at:

```
frontend/src/pages/layout/layout.jsx
```

- The layout features a collapsible sidebar, header, and footer.
- The sidebar collapses automatically on small screens (using the `breakpoint` prop).
- You can use this file as a template for new pages that require a consistent, responsive layout.

---

For more details, see the code in the `src/` directory.

## Known Issues & Warnings

### Ant Design v5 and React 19 Compatibility
- **Warning:** Ant Design v5 officially supports React 16–18. If you use React 19, you may see this warning:
  > [antd: compatible] antd v5 support React is 16 ~ 18. see https://u.ant.design/v5-for-19 for compatible.
- **Workaround:** Most features work, but if you see UI bugs, consider downgrading to React 18 or check the Ant Design docs for updates.

### Drawer `bodyStyle` Deprecated
- **Warning:** `[antd: Drawer] bodyStyle is deprecated. Please use styles.body instead.`
- **Fix:** Use the `styles` prop:
  ```jsx
  <Drawer styles={{ body: { ... } }} />
  ```

### Form.Item Single Child Warning
- **Warning:** `[antd: Form.Item] A Form.Item with a name prop must have a single child element.`
- **Fix:** Make sure each `<Form.Item name=...>` wraps only one input component, not multiple elements or fragments.

## Updates

- The "Sr No" (serial number), "Total Types", and "Action" columns in the Inventory table now have fixed widths and are center-aligned for better readability.
- In the Component table, the "Unit Price", "Total Quantity", and "Action" columns are also set to fixed widths and center-aligned.
- The `sr_no` columns have been removed from the `inventory` and `component` tables in the database schema, as serial numbers are now handled only in the frontend UI.

## 2024-06 Ant Design v5 Deprecation Fixes

- Updated `src/pages/admin/Inventory.jsx` and `src/pages/admin/Inventory/Component.jsx` to remove Ant Design v5 deprecation warnings:
  - Replaced `Dropdown.overlay` with `Dropdown.menu` and refactored `Menu` to use the `items` array instead of children.
  - Replaced `Drawer.bodyStyle` with `Drawer.styles.body`.
  - Replaced `Modal.destroyOnClose` and `Drawer.destroyOnClose` with `destroyOnHidden`.
  - Ensured all `Form.Item` with a `name` prop have only a single child.
- These changes improve compatibility with Ant Design v5 and React 18+ and remove related console warnings.

## Package Management Page

- Navigate to **/admin/package** or use the **Package** link in the Admin sidebar.
- Features:
  - All package management features are now fully implemented and connected to the backend!
  - Packages are displayed as cards, each with a 3-dot (MoreOutlined) dropdown menu for View (drawer, read-only), Edit (drawer), and Delete (Popconfirm) actions, matching the UI/UX of other admin pages.
  - The drawer for viewing, editing, or adding a package now uses a width of 900px (increased from 600px) for improved visibility and usability.
  - Only fixed packages are supported; the custom package (client customization) feature and all tabs have been removed.
  - The sidebar includes a Package link with an archive box icon.
  - All package data is loaded live from the backend and is persistent. Add, edit, and delete actions update the database and the UI always reflects the latest state, even after refresh.
  - The Customize button and Client Customization tab have been removed for a simpler, more robust experience.