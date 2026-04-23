# ClosetRush Frontend

React-based frontend for the ClosetRush subscription platform.

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Ant Design 5** - UI component library
- **Tailwind CSS 3** - Utility-first CSS
- **Axios** - HTTP client
- **Context API** - State management

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Role-based routing (Individual, Business, Admin)
- ✅ Protected routes with authentication
- ✅ JWT token management
- ✅ API error handling
- ✅ Mobile-friendly navigation

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env and set:
# REACT_APP_API_URL=http://localhost:5000/api
```

### Development

```bash
# Start development server
npm start

# App will open at http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Build output in /build directory
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.js
│   │   │   └── RegisterPage.js
│   │   ├── public/
│   │   │   └── HomePage.js
│   │   └── CreatePlaceholders.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Available Routes

### Public Routes
- `/` - Home page
- `/science-behind` - Educational content
- `/what-we-offer` - Subscription bundles
- `/pricing` - Pricing information
- `/get-quote` - B2B quote request
- `/login` - User login
- `/register` - User registration

### Individual User Routes
- `/dashboard` - User dashboard
- `/subscriptions` - Manage subscriptions
- `/support` - Support tickets

### Business User Routes
- `/business/dashboard` - Business dashboard
- `/business/properties` - Property list
- `/business/properties/:id` - Property details
- `/business/subscriptions` - Subscriptions
- `/business/support` - Support tickets

### Admin Routes
- `/admin/dashboard` - Admin dashboard

## Responsive Breakpoints

- **xs**: 480px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## API Integration

The frontend communicates with the backend API using Axios. All API calls go through the `api.js` service which handles:

- Base URL configuration
- JWT token injection
- Error handling
- 401 redirect to login

## Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT token + user data
3. Token stored in localStorage
4. Token sent with all API requests
5. On 401 error, user redirected to login

## State Management

Uses React Context API for global state:

- **AuthContext**: User authentication state
  - `user` - Current user object
  - `login()` - Login function
  - `logout()` - Logout function
  - `isAuthenticated()` - Check if logged in
  - `isAdmin()` - Check if admin
  - `isBusiness()` - Check if business user
  - `isIndividual()` - Check if individual user

## Styling

Combines Tailwind CSS with Ant Design:

- **Tailwind**: Utility classes for layout, spacing, colors
- **Ant Design**: Pre-built components (Button, Form, Card, etc.)
- **Custom CSS**: Additional styles in `index.css`

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Development Tips

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.js`
3. Add navigation link in `Navbar.js`

### Protected Routes

```jsx
<Route 
  path="/protected" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### API Calls

```javascript
import api from '../services/api';

// GET request
const response = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', data);

// With error handling
try {
  const response = await api.post('/endpoint', data);
  message.success('Success!');
} catch (error) {
  message.error(error.error?.message || 'Error occurred');
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
