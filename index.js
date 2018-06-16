const express = require('express')
const app = express()

const minioClient = require('./pubsweet-component-minio')
const minioMiddleware = minioClient.middleware();

const setupLoginUser = function (req, res, next) {
  	req.minioReq = {
		username: 'ygou@ebi.ac.uk'
	}
  	next()
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/files', setupLoginUser, minioMiddleware({op: minioClient.Ops.post}), (req, res) => {
	if (req.minioRes.error) {
		response.status(400).json({ error: res.minioRes.error })
	}

	res.send({ id: req.minioRes.post.id })
})

app.listen(3000)