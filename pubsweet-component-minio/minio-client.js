const Minio = require('minio')

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    secure: process.env.MINIO_SECURITY === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
})

module.exports = {
    uploadFile(filename, oriFilename, fileType, tempFilePath, callback) {
        const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
        let filePath = `${uploads}/${filename}`

        const metaData = {
            'content-type': fileType,
            'file-name': oriFilename,
        }

        minioClient.fPutObject(
            process.env.MINIO_BUCKET,
            filePath,
            tempFilePath,
            metaData,
            callback
        )
    },

    listFiles(callback) {
        const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
        const prefix = `${uploads}`
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

    getFile(fileName, tmpFile, callback) {
        const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
        const objectName = `${uploads}/${fileName}`
        minioClient.fGetObject(process.env.MINIO_BUCKET, objectName, tmpFile, callback)
    },

    deleteFile(fileName, callback) {
        const uploads = process.env.MINIO_UPLOADS_FOLDER_NAME
        const objectName = `${uploads}/${fileName}`
        minioClient.removeObject(process.env.MINIO_BUCKET, objectName, err => {
            callback(err)
        })
    },
}
