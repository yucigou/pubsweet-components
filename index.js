const express = require('express')
const app = express()

const minioClient = require('express-middleware-minio')
const minioMiddleware = minioClient.middleware()

app.get('/', (req, res) => {
    res.send('Example to use PubSweet Minio components!')
})

app.post('/api/files', minioMiddleware({op: minioClient.Ops.post}), (req, res) => {
    if (req.minio.error) {
        res.status(400).json({ error: req.minio.error })
    }

    res.send({ filename: req.minio.post.filename })
})

app.get('/api/files',
    minioMiddleware({op: minioClient.Ops.list}), 
    (req, res) => {
        if (req.minio.error) {
            res.status(400).json({ error: req.minio.error })
        }
        res.send(req.minio.list)
    }
)

app.get('/api/files/:filename',
    minioMiddleware({op: minioClient.Ops.get}),
    (req, res) => {
        if (req.minio.error) {
            res.status(400).json({ error: req.minio.error })
        }
        res.download(req.minio.get)
    }
)

app.delete('/api/files/:filename',
    minioMiddleware({op: minioClient.Ops.delete}),
    (req, res) => {
        if (req.minio.error) {
            res.status(400).json({ error: req.minio.error })
        }
        res.send(req.minio.delete)
    }
)

app.listen(3000)