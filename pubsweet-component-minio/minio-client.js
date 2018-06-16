const Minio = require('minio')

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  secure: process.env.MINIO_SECURITY === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

module.exports = {
  uploadFile(username, fragmentId, fileName, fileType, tempFilePath, callback) {
    const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
    const filePath = `${username}/${uploads}/${fragmentId}/${fileName}`

    const metaData = {
      'content-type': fileType,
      'file-name': fileName,
    }

    minioClient.fPutObject(
      process.env.MINIO_BUCKET,
      filePath,
      tempFilePath,
      metaData,
      callback,
    )
  },

  listFiles(username, fragmentId, callback) {
    const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
    const prefix = `${username}/${uploads}/${fragmentId}`
    const stream = minioClient.listObjects(process.env.MINIO_BUCKET, prefix, true)
    const list = []
    stream.on('data', obj => {
      list.push(obj)
    })
    stream.on('error', err => {
      callback(err)
    })
    stream.on('end', () => {
      callback(null, list)
    })
  },

  getFile(username, fragmentId, fileName, tmpFile, callback) {
    const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
    const objectName = `${username}/${uploads}/${fragmentId}/${fileName}`
    minioClient.fGetObject(process.env.MINIO_BUCKET, objectName, tmpFile, callback)
  },

  deleteFile(username, fragmentId, fileName, callback) {
    const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
    const objectName = `${username}/${uploads}/${fragmentId}/${fileName}`
    minioClient.removeObject(process.env.MINIO_BUCKET, objectName, err => {
      callback(err)
    })
  },
}
