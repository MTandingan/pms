# Preventive Maintenance System (PMS)

## Overview
PMS is a comprehensive web application designed to streamline the management of IT asset maintenance within organizations. Built with Vue.js 3 and Node.js, this system provides a robust solution for tracking IT assets, scheduling maintenance, and generating detailed reports.

## Features

### Asset Management
- Complete IT asset inventory tracking
- Detailed asset information including specifications, location, and maintenance history
- Asset status monitoring and updates

### Maintenance Scheduling
- Automated maintenance schedule generation
- View of upcoming maintenance tasks
- Task assignment and tracking

### Reporting System
- Comprehensive maintenance history reports
- Asset lifecycle tracking
- Maintenance cost analysis
- Custom report generation
- Export capabilities (PDF, Excel)

## User Roles

### Administrator
- Full system access
- User management
- System configuration
- Report generation
- Asset management

### Maintenance Staff
- View assigned maintenance tasks
- Update maintenance records
- Asset status updates
- Basic report generation

### Regular Users
- View asset information
- Submit maintenance requests
- Track request status
- View basic reports

## Tech Stack

### Frontend
- Vue.js 3
- Pinia for state management
- Vue Router
- Axios for API calls

### Backend
- Node.js
- Express.js

## Installation

1. Clone the repository
```bash
git clone https://github.com/MTandingan/pms.git
cd pms
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Run the development servers

Frontend:
```bash
cd frontend
npm run dev
```

Backend:
```bash
cd backend
npm run dev
```

## Project Structure
```
pms/
├── frontend/              # Vue.js frontend
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── store/
│   │   └── router/
│   └── public/
└── backend/              # Node.js backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── config/
```

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact
Mhelward Ely Tandingan - mntandingan97@gmail.com
