# AgriLink

AgriLink is a modern web application that connects farmers and buyers in a sustainable agricultural marketplace. The platform facilitates direct trading between farmers and buyers, making it easier to source and sell agricultural products.

## Features

### For Farmers
- Create and manage product listings
- Track inventory and sales
- Direct communication with buyers
- Sales analytics and reporting
- Profile management

### For Buyers
- Browse available agricultural products
- Real-time chat with sellers
- Track orders and purchase history
- Save favorite listings
- Profile customization

## Technology Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Socket.IO for real-time communication
- CSS Modules for styling
- Modern responsive design

### Backend
- Node.js with Express
- MongoDB for database
- Socket.IO for WebSocket connections
- JWT for authentication
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
```bash
git clone https://github.com/amohnice/AgriLink.git
cd agrilink
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Environment Setup
```bash
# In the backend directory, create a .env file
cp .env.example .env
# Edit .env with your configuration

# In the frontend directory, create a .env file
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd frontend
npm run dev
```

## Project Structure

```
agrilink/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS modules and global styles
│   │   ├── routes/        # Route configurations
│   │   └── api/          # API service layer
│   └── public/           # Static assets
└── backend/
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Custom middleware
    │   └── utils/        # Helper functions
    └── config/          # Configuration files
```

## Key Features

### Authentication
- JWT-based authentication
- Role-based access control (Farmer/Buyer)
- Protected routes and API endpoints

### Real-time Communication
- WebSocket integration for chat
- Real-time notifications
- Live updates for listings and orders

### User Interface
- Responsive design for all devices
- Modern and clean UI
- Intuitive navigation
- Consistent styling with CSS variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape AgriLink
- Special thanks to the open-source community for the tools and libraries used in this project

## Contact

Amos Korir - [@amoh_nice](https://x.com/amoh_nice)
Project Link: [https://github.com/amohnice/AgriLink](https://github.com/amohnice/AgriLink.git)
