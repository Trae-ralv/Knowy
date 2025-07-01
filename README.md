# Knowy
Knowy, ABC Condo is a know-your-neighbourhood web application developed as a full-stack project using **React.js** for the frontend, **Spring Boot** for the backend, and **XAMPP MySQL** for the database. This project is designed for educational purposes to demonstrate **API integration, secure authentication,** and **AI-driven features** for a community-focused platform.

## Project Overview
The Knowy application provides users with information about their neighborhood, including real-time weather updates, location-based services, and an AI-powered chatbot. Key features include user authentication via Google OAuth 2.0 and Facebook SDK, a blog system, and profile management. The application is built with a three-tier architecture to ensure modularity and scalability.

## Project Structure
```
Knowy/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── css/
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── .env
│   │   .....
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/abccondo/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   └── security/
│   │   │   └── resources/application.properties
│   └── pom.xml
└── README.md
```

## Features
- **Authentication🔒**: Secure login with Google OAuth 2.0 and Facebook SDK.
- **Location Services📍**: Display condo and user location with real-time weather updates.
- **AI Chatbot, Knowy🤖**: Powered by Gemini API for answering queries and generating blog/image content.
- **Blog System📝**: CRUD operations for blog posts with user-specific actions.
- **Profile Management😏**: View and update user information.

## Prerequisites
Before setting up the project, ensure you have the following installed:
- **Node.js** (v22.16.0 or later)
- **npm** (v11.1.0 or later)
- **Java** (v17 or later)
- **Maven** (for Spring Boot)
- **XAMPP** (with MySQL and phpMyAdmin)
- **Visual Studio Code** or **Eclipse STS** (v4.30.0 or later)
- **Postman** (for API testing)

## Frontend Setup
### `Npm Installation`
Navigate to the `frontend` directory and install the required dependencies:

```bash
npm install @fortawesome/fontawesome-svg-core@6.7.2 @fortawesome/free-brands-svg-icons@6.7.2 @fortawesome/free-regular-svg-icons@6.7.2 @fortawesome/free-solid-svg-icons@6.7.2 @fortawesome/react-fontawesome@0.2.2 @google/genai@1.7.0 @react-oauth/google@0.12.2 @testing-library/dom@10.4.0 @testing-library/jest-dom@6.6.3 @testing-library/react@16.3.0 @testing-library/user-event@13.5.0 @types/react-dom@19.1.6 @types/react@19.1.8 @vitejs/plugin-react@4.5.2 axios@1.9.0 bootstrap@5.3.6 concurrently@9.1.2 cors@2.8.5 express@5.1.0 google-auth-library@10.1.0 install@0.13.0 jquery@3.7.1 jwt-decode@4.0.0
```

Verify the installed packages by running:

```bash
npm list
```

Expected output:

```
...\Knowy\frontend
├── @fortawesome/fontawesome-svg-core@6.7.2
├── @fortawesome/free-brands-svg-icons@6.7.2
├── @fortawesome/free-regular-svg-icons@6.7.2
├── @fortawesome/free-solid-svg-icons@6.7.2
├── @fortawesome/react-fontawesome@0.2.2
├── @google/genai@1.7.0
├── @react-oauth/google@0.12.2
├── @testing-library/dom@10.4.0
├── @testing-library/jest-dom@6.6.3
├── @testing-library/react@16.3.0
├── @testing-library/user-event@13.5.0
├── @types/react-dom@19.1.6
├── @types/react@19.1.8
├── @vitejs/plugin-react@4.5.2
├── axios@1.9.0
├── bootstrap@5.3.6
├── concurrently@9.1.2
├── cors@2.8.5
├── express@5.1.0
├── google-auth-library@10.1.0
├── install@0.13.0
├── jquery@3.7.1
├── jwt-decode@4.0.0
├── nodemon@3.1.10
├── npm@11.4.2
├── react-bootstrap@2.10.10
├── react-dom@19.1.0
├── react-router-dom@7.6.2
├── react-scripts@5.0.1
├── react-social-login-buttons@4.1.1
├── react@19.1.0
├── styled-components@6.1.19
├── vite@6.3.5
└── web-vitals@2.1.4
```

### `Environment Variables`
Create a `.env` file in the `../Knowy/frontend` directory with the following:

```env
REACT_APP_API_URL=http://localhost:8080

REACT_APP_FACEBOOK_APP_ID=

REACT_APP_GOOGLE_AUTH_CLIENT_ID=

REACT_APP_GEMINI_API_KEY=
REACT_APP_GOOGLE_API_KEY=
REACT_APP_CONDO_LOCATION=
```

Replace placeholders with your API keys and condo address.

### `API Configuration`
The application integrates the following APIs:
- **Google OAuth 2.0**: For user authentication.
- **Facebook SDK**: For alternative login.
- **Google Geocoding/Geolocation/Weather APIs**: For location-based services and weather data.
- **Google Gemini API**: For AI-driven chatbot and content generation.


## Backend Setup
### `Maven Installation`
Navigate to the `backend` directory and install the required Maven dependencies for Spring Boot:

```bash
cd ../Knowy/backend
mvn clean install
```

Ensure the `pom.xml` includes dependencies for:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- MySQL Connector
- Google Auth Library
- JJWT (for JWT token handling)

### `Backend Configuration`
Create an `application.properties` file in `../Knowy/backend/src/main/resources` with the following configurations:

```properties
spring.application.name=backend

# Database connection

spring.datasource.url=jdbc:mysql://localhost:3306/knowy_db
spring.datasource.username=root
spring.datasource.password=

# JWT Secret
jwt.secret=

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080

# Id & Secret
google.client-id=
google.client-secret=
facebook.app-id=
facebook.app-secret=
```

Replace `your_jwt_secret`, `your_google_client_id`, `your_facebook_app_id`, and `your_facebook_app_secret` with appropriate values.

## Database Setup
1. Install and start **XAMPP** with MySQL and phpMyAdmin.
2. Create a database named `knowy_db` in phpMyAdmin.
3. Ensure the `spring.datasource` properties in `application.properties` match your MySQL configuration.
4. The schema will be automatically created by Spring Boot with `spring.jpa.hibernate.ddl-auto=update`.


## Running the Application
1. Start the MySQL server via XAMPP.
2. Run the backend application (`mvn spring-boot:run`).
3. Run the frontend application (`npm start`).
4. Access the application at [http://localhost:3000](http://localhost:3000).
5. Use Google or Facebook login to authenticate and explore features like the chatbot, blog, and weather updates.


### `Npm Start`
Run the frontend application from the `../Knowy/frontend` directory:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

### `Start Your Database`
Always Start Your XAMPP Apache and MySql before backend

### `Maven Start`
Run the backend application :

```bash
mvn spring-boot:run
```

The backend will be accessible at [http://localhost:8080](http://localhost:8080).


## Contributing
This project is for educational purposes. Contributions are not expected, since this is submitted as a project for my Integrated Application Development 😊.

## References
- [React Documentation](https://react.dev/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Google APIs](https://developers.google.com/)
- [Facebook SDK](https://developers.facebook.com/docs/facebook-login/)
- [Gemini API](https://ai.google.dev/gemini-api/docs/api-key)

## License
This project is for educational purposes and not licensed for commercial use.