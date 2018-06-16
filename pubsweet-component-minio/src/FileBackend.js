const formidable = require('formidable')
const minioClient = require('./minio-client')

const FileBackend = app => {
  const authBearer = app.locals.passport.authenticate('bearer', {
    session: false,
  })

  app.post('/api/files', authBearer, (request, response) => {
    const form = new formidable.IncomingForm()
    form.parse(request, (err, fields, files) => {
      if (err) {
        response.status(400).json({ err })
      }

      minioClient.uploadFile(
        request.authInfo.username,
        fields.fragmentId,
        files.file.name,
        files.file.type,
        files.file.path,
        (error, etag) => {
          if (error) {
            response.status(400).json({ error })
          }
          response.send({ id: `${fields.fragmentId}/${files.file.name}` })
        },
      )
    })
  })

  app.get('/api/files/:fragmentId/:fileId', authBearer, (request, response) => {
    const tmpFile = `/tmp/${request.params.fragmentId}-${request.params.fileId}`
    minioClient.getFile(
      request.authInfo.username,
      request.params.fragmentId,
      request.params.fileId,
      tmpFile,
      error => {
        if (error) {
          response.status(400).json({ error })
        }
        response.download(tmpFile)
      },
    )
  })

  app.get('/api/files/:fragmentId', authBearer, (request, response) => {
    minioClient.listFiles(
      request.authInfo.username,
      request.params.fragmentId,
      response,
    )
  })

  app.delete(
    '/api/files/:fragmentId/:fileId',
    authBearer,
    (request, response) => {
      minioClient.deleteFile(
        request.authInfo.username,
        request.params.fragmentId,
        request.params.fileId,
        error => {
          if (error) {
            response.status(400).json({ error })
          }
          response.json({ info: 'File removed' })
        },
      )
    },
  )
}

module.exports = FileBackend
