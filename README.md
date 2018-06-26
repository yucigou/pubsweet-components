You need to add .env to get it up running, e.g.:

```shell
MINIO_ACCESS_KEY=xxx
MINIO_SECRET_KEY=xxx
MINIO_ENDPOINT='192.111.111.131'
MINIO_PORT=9000
MINIO_SECURITY=false
MINIO_BUCKET=manuscripts
MINIO_UPLOADS_FOLDER_NAME=uploads
```

APIs

```shell
Upload a file
POST: /api/files
Return: {"filename":"24383c60-792b-11e8-9f1f-d9194b25e031.pdf"}

List all files
GET: /api/files

Download a file
GET: /api/files/{filename}

Delete a file
DELETE: /api/files/{filename}
```