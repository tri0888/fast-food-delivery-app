# Hosting Web App (MERN Stack)
Web Hosting: [Host](http://3.25.79.221:3000/)

# Food Ordering Web App (MERN Stack)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Contact](#contact)

## Introduction
This is a full-stack food ordering web application built using the MERN stack (MongoDB, Express, React, Node.js). The application consists of a customer-facing app for ordering food and an admin app for managing orders, menu items, and more.

## Features
- User authentication and authorization
- Browse food items
- Add items to the cart and place orders
- Stripe Payment Integration: Secure and reliable payment processing using Stripe.
- Order tracking
- Admin panel to manage menu items, orders

## Technologies Used
- **Frontend:** React.js, React Context API, React Router
- **Backend:** Node.js, Express.js
- **Payment Gateway:** Stripe
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** CSS

## Installation
### Prerequisites
- Node.js
- MongoDB

### Clone the Repository
```sh
git clone https://github.com/DulanjaliSenarathna/mern-food-delivery-app.git
cd mern-food-delivery-app
```

## Backend Setup
Navigate to the backend directory:

```sh
cd backend

```
Install dependencies:

```sh
npm install
```

Create a .env file in the backend directory and add the following:

```sh
JWT_SECRET="random#secret"
STRIPE_SECRET_KEY="sk_test_51JhWAiRXoTvIuM91beRv8XldfL3GGKyuLhzabkSwNeIXryY51G9UKnwNUFcotg0N6k4UAGhiprjJd4XhAF85JCN4004TC42zkl"
```

Start the backend server:

```sh
npm run server
```
## Frontend Setup
Navigate to the frontend directory:

```sh

cd frontend
```

Install dependencies:
```sh

npm install
```

Start the frontend server:
```sh

npm run dev
```

## Admin App Setup

Navigate to the admin directory:
```sh

cd admin
```

Install dependencies:

```sh
npm install
```

Start the admin app :
```sh
npm run dev
```

## Testing Taxonomy
The repository standardizes tests into six categories (API, Data Integrity, Features, Security, Screen, Stress). Use the following helpers to run them quickly:

```bash
# Backend suites
npm run test:api --prefix backend
npm run test:data-integrity --prefix backend
npm run test:features --prefix backend
npm run test:security --prefix backend
npm run test:stress --prefix backend

# Screen / Playwright suites
npm run test:screen --prefix frontend
npm run test:screen --prefix admin
```

More guides:

- `docs/testing/stress.md` (k6 load/stress)
- `docs/testing/compat.md` (cross-browser compatibility)
- `docs/testing/speed.md` (basic performance budget)

## White-box vs Black-box Testing
We intentionally combine both methodologies:

| Methodology | Suites | Purpose |
|-------------|--------|---------|
| **White-box** | `npm run test:data-integrity --prefix backend`, `npm run test:features --prefix backend` | Inspect internal models, repositories, and service-layer branches (e.g., schema defaults, stock reconciliation, guarded role transitions) to ensure every conditional path is asserted from the code’s point of view. |
| **Black-box** | `npm run test:api --prefix backend`, `npm run test:security --prefix backend`, `npm run test:screen --prefix frontend`, `npm run test:screen --prefix admin`, `npm run test:stress --prefix backend` | Exercise the system strictly through its external contracts (HTTP endpoints, UI flows, and load entrypoints) to validate behavior without relying on implementation details. |

The scenario matrix in `docs/testing/test-taxonomy-v2.md` enumerates the concrete cases covered under each category so we can tell when coverage is complete (and where to add new tests if a feature expands).

## Usage
Access the customer-facing app at http://localhost:5173.
Access the admin app at http://localhost:5174.
Register as a new user or log in with existing credentials.
Browse the menu, add items to the cart, and place an order.
Pay using dummy visa card
Use the admin panel to manage orders, menu items.

## Screenshots
![1](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/b3d604f0-ae0e-4e29-9b95-51f6327c3952)
![2](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/0cb56d94-a715-48bd-9a7d-05c876a05b2c)
![3](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/f5dd216a-dc8d-4042-9a96-4884cdb17aef)
![Capture2](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/22fc6a58-b713-4ab7-babb-cff5844e7c55)
![Capture3](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/0f7fe1ab-8c29-4fa2-bdb2-7212994cdf80)
![Capture4](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/f41881c6-e148-4215-9953-458bbe602007)
![Capture5](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/34e366fa-8ee5-4f77-a5e0-d5d4ea294672)
![Capture6](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/1894f642-ea89-42de-ad74-de173c6c42aa)
![Capture7](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/1a94b8aa-aa4e-4991-9d45-f6548f793b47)
![Capture8](https://github.com/DulanjaliSenarathna/mern-food-delivery-app/assets/59603716/c85e4c11-7ebf-4e45-8678-4000abde835d)

## API Documentation
The API endpoints for the backend can be documented using tools like Postman or Swagger. Include endpoints for user authentication, menu items, orders, and more.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the code style and include relevant tests.

## Contact
For any questions or suggestions, feel free to contact me.

Happy coding!

Feel free to customize this template according to your specific project details and requirements.




