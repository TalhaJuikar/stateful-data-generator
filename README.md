# Stateful Application for Kubernetes Testing

This is a stateful application consisting of a Node.js API with an interactive UI connected to a MongoDB database. It's designed to be deployed to a Kubernetes cluster for testing stateful applications.

## Application Components

1. **Node.js API with Interactive UI**: 
   - Express.js API with endpoints to create, read, and delete data
   - Modern Bootstrap-based UI with responsive design
   - Multiple pages for data management and visualization
2. **MongoDB Database**: A stateful database that persists data.

## Project Structure

```plaintext
stateful/
├── src/
│   ├── server.js         # Node.js application code with EJS support
│   ├── views/            # EJS templates
│   │   ├── layout.ejs    # Main layout template
│   │   ├── index.ejs     # Dashboard page
│   │   ├── stats.ejs     # Statistics page
│   │   └── generator.ejs # Data generator page
│   └── public/           # Static assets
│       ├── css/
│       │   └── styles.css
│       └── js/
│           └── app.js
├── k8s/
│   ├── mongodb-statefulset.yaml  # MongoDB StatefulSet
│   ├── mongodb-service.yaml      # MongoDB Service
│   ├── app-deployment.yaml       # Application Deployment
│   └── app-service.yaml          # Application Service
├── Dockerfile            # Dockerfile for building the Node.js app
├── package.json          # Node.js dependencies
├── generate_load.sh      # Script to generate load for testing
└── README.md             # This file
```

## Interactive UI Features

1. **Dashboard UI**: A modern Bootstrap-based UI with responsive design
2. **Multiple Pages**: 
   - Dashboard: Displays data and key metrics
   - Statistics: Visualizes trends and distributions
   - Data Generator: Interactive form for generating test data
3. **Interactive Features**:
   - Add/view/delete records
   - Generate random data with progress tracking
   - View charts and statistics
   - Generation history tracking

## Prerequisites

- Docker
- Kubernetes cluster (Minikube, kind, or a cloud provider)
- kubectl configured to communicate with your cluster

## Building and Deploying

### 1. Build the Docker image

```bash
# From the project root
docker build -t ntipladmin/stateful-app:1.1 .
docker push ntipladmin/stateful-app:1.1
```

Make sure to replace `ntipladmin` with your Docker Hub username or your private registry if needed.

### 2. Update the image name in the deployment

Edit the `k8s/app-deployment.yaml` file and update the image name:

```yaml
image: ntipladmin/stateful-app:1.1
```

### 3. Deploy the application to Kubernetes

```bash
# Deploy MongoDB first
kubectl apply -f k8s/mongodb-statefulset.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod/mongodb-0 --timeout=120s

# Deploy the application
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

### 4. Access the application

```bash
# Get the NodePort assigned to the service
kubectl get svc stateful-app-service

# If using Minikube, get the URL
minikube service stateful-app-service --url
```

## Generating Test Data and Traffic

Use the provided script to generate load on the application:

```bash
# First, set up port forwarding if needed
kubectl port-forward service/stateful-app-service 3000:80

# In another terminal, run the load generation script
./generate_load.sh
```

You can modify the following parameters in the script:

- `APP_ENDPOINT`: The URL of your application
- `DATA_COUNT`: Initial number of data records to create
- `REQUEST_RATE`: Number of requests per second
- `DURATION`: Test duration in seconds

## API Endpoints

- `GET /api/data`: Get all data entries
- `GET /api/data/:id`: Get data by ID
- `POST /api/data`: Create new data entry
- `POST /api/generate`: Generate random data (specify count in request body)
- `DELETE /api/data/:id`: Delete a data entry

## Testing the UI Features

1. **Dashboard**: View your data in a table format with charts
2. **Stats Page**: See data analytics and system health
3. **Generator**: Easily generate test data with the interactive form
4. **Create/View/Delete**: Perform CRUD operations on your data

## Testing Stateful Behavior

To test the stateful behavior:

1. Generate some data
2. Scale the MongoDB StatefulSet down and back up
3. Verify that the data is still accessible

```bash
# Scale down
kubectl scale statefulset mongodb --replicas=0

# Wait a moment, then scale back up
kubectl scale statefulset mongodb --replicas=1

# Check if data is still accessible
curl http://<application-url>/api/data
```

## Updating an Existing Deployment

If you've already deployed an earlier version:

```bash
# Update the image version in your deployment
kubectl set image deployment/stateful-app stateful-app=ntipladmin/stateful-app:1.1

# Or update the YAML file and apply it
kubectl apply -f k8s/app-deployment.yaml
```
