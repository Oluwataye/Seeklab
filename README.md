# SeekLab: Medical Lab Results Management System

A HIPAA-compliant web application for secure, role-based management of medical lab test results, streamlining patient data access and interdisciplinary collaboration.

![SeekLab](generated-icon.png)

## Overview

SeekLab is a comprehensive healthcare platform designed to simplify the management, sharing, and analysis of medical laboratory test results. The system connects patients, laboratory technicians, scientists, psychologists, and administrators in a secure, role-appropriate environment.

## Key Features

### For Patients
- **Secure Access**: View test results through unique, time-limited access codes
- **Simple Results Viewing**: Easy-to-understand test result displays
- **PDF Reports**: Download and print lab reports for healthcare appointments
- **Session Security**: Auto-expiring sessions for enhanced data protection

### For Lab Technicians
- **Test Result Entry**: Record and upload new test results
- **Mock Result Generation**: Create test data for system testing and training
- **Quality Control**: Verify and manage lab data before submission

### For Lab Scientists
- **Scientific Review**: Verify and approve test results with comments
- **Research Tools**: Analyze result patterns and generate reports
- **Quality Assurance**: Maintain lab testing standards and protocols

### For Psychologists
- **Assessment Tools**: Review and comment on test results
- **Patient Management**: Track patients and their test histories
- **Report Generation**: Create specialized psychological assessment reports

### For Administrators
- **User Management**: Add, modify, and maintain system user accounts
- **Role Management**: Define and assign permissions and roles
- **Audit Logging**: Track all system activities for compliance and security
- **Result Template Management**: Configure standard test result formats

## Security Features

- **HIPAA Compliance**: Designed with healthcare privacy regulations in mind
- **Role-Based Access**: Users can only access information appropriate to their role
- **Session Management**: Secure login with automatic timeout protection
- **Audit Trails**: Comprehensive logging of all data access and modifications
- **Encrypted Data**: Protection of sensitive information at rest and in transit

## Technical Architecture

### Frontend
- React with TypeScript
- TailwindCSS for responsive design
- Shadcn UI component library
- React Query for efficient data fetching
- React Hook Form for form validation

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- Rate limiting for API protection
- Server-side caching for performance optimization

### Performance Optimizations
- Client-side caching with state management
- Optimistic UI updates
- Efficient API query batching
- Lazy loading of components
- Response compression

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/seeklab.git
   cd seeklab
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/seeklab
   SESSION_SECRET=your_secret_key
   NODE_ENV=development
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

## Default User Accounts

The system comes with pre-configured user accounts for testing:

| Username      | Password | Role            |
|---------------|----------|-----------------|
| Admin         | password | Administrator   |
| LabTechnician | password | Lab Technician  |
| LabScientist  | password | Lab Scientist   |
| Psychologist  | password | Psychologist    |

## Usage Workflow

1. **Lab Technician** generates test results either manually or using the mock generator
2. **Lab Scientist** reviews and approves/rejects the results with comments
3. **Patient** accesses results using a unique access code
4. **Psychologist** may provide additional assessment for certain test types
5. **Administrator** oversees the system, manages users, and handles audits

## Project Structure

```
seeklab/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and helpers
│   │   ├── pages/        # Page components for each route
│   │   └── App.tsx       # Main application component
├── server/               # Backend Express server
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data storage operations
│   └── vite.ts           # Vite server configuration
└── shared/               # Shared code between client and server
    └── schema.ts         # Database schema definitions
```

## Performance Considerations

The system is designed to handle high traffic volumes with:
- Efficient database queries using indexes
- API response caching
- Rate limiting to prevent abuse
- Optimized frontend rendering

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hospital and laboratory staff who provided domain expertise
- Security consultants who assisted with HIPAA compliance features
- The open-source community for providing excellent tools and libraries