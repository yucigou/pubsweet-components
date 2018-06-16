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

  listFiles(username, fragmentId, res) {
    const { uploads } = minioConfig
    const prefix = `${username}/${uploads}/${fragmentId}`
    const stream = minioClient.listObjects(minioConfig.bucket, prefix, true)
    const list = []
    stream.on('data', obj => {
      list.push(obj)
    })
    stream.on('error', err => {
      res.send(err)
    })
    stream.on('end', () => {
      res.send(list)
    })
  },

  getFile(username, fragmentId, fileName, tmpFile, callback) {
    const { uploads } = minioConfig
    const objectName = `${username}/${uploads}/${fragmentId}/${fileName}`
    minioClient.fGetObject(minioConfig.bucket, objectName, tmpFile, callback)
  },

  deleteFile(username, fragmentId, fileName, callback) {
    const { uploads } = minioConfig
    const objectName = `${username}/${uploads}/${fragmentId}/${fileName}`
    minioClient.removeObject(minioConfig.bucket, objectName, err => {
      callback(err)
    })
  },
}
