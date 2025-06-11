# Trust Frontend Microservice

## Architecture and Technology
- **Language:** [TypeScript](https://www.typescriptlang.org/) + [Vue 3](https://vuejs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Containerization:** [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- **API Communication:** Axios (proxied to backend microservices via Vite and Docker network)

## Overview
This microservice provides the frontend for the Trust Management System. It allows users to interact with the trust evaluation and aggregation backend services via a modern web interface.

## Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your system.

## Setup Instructions

### 1. Clone the Repository and Enter the Folder
```powershell
git clone https://github.com/LukaPantar/Trust_Frontend_Microservice
cd TrustFrontendMicroservice
```

### 2. Create the .env File
- Copy the contents of `.env.TEMPLATE` to a new file named `.env` in the same directory.
### 3. Create the Docker Network (only once)
Before running any microservice, create the shared Docker network (do this only once):
```powershell
# You only need to run this ONCE for all microservices
# You can do it in any of the microservice folders
# If the network already exists, Docker will not recreate it
docker network create trust_network
```

### 4. Start the Frontend Microservice
From the `TrustFrontendMicroservice` directory, run:
```powershell
# Build and start the frontend container
docker-compose up --build
```
This will build and start the frontend container. By default, the frontend will be available at [http://localhost:5173](http://localhost:5173).

### 5. Environment Variables
The `.env` file is already set up for Docker-based communication. No changes are needed unless you want to customize service names or ports.

## Notes
- Make sure the backend microservices (TrustEvaluator and TrustAggregator) are also running on the same `trust_network` for full functionality.
- If you change ports in the Docker or Vite config, update the port mapping in `docker-compose.yml` accordingly.

---