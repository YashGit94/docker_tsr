steps:
  # 1. Build the Backend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/api-backend', '-f', 'Dockerfile-backend', '.']

  # 2. Build the Frontend Image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/angular-frontend', '-f', 'Dockerfile-frontend', '.']

  # 3. Push Backend Image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/api-backend']

  # 4. Push Frontend Image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/angular-frontend']

  # 5. Deploy Backend to Cloud Run
  # This step attaches your existing service account for keyless BigQuery access
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'api-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/api-backend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--port'
      - '8080'
      - '--service-account'
      - 'gudayaswanth-devops@appspot.gserviceaccount.com' # Replace with your actual service account email
      - '--allow-unauthenticated'

  # 6. Deploy Frontend to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'angular-frontend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/angular-frontend'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/api-backend'
  - 'gcr.io/$PROJECT_ID/angular-frontend'

options:
  logging: CLOUD_LOGGING_ONLY
