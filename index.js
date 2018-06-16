const express = require('express')
const app = express()

const minioClient = require('./pubsweet-component-minio')
const minioMiddleware = minioClient.middleware();

const setupLoginUser = (req, res, next) => {
  	req.minioReq = {
		username: 'ygou@ebi.ac.uk'
	}
  	next()
}

const setupListFolder = (req, res, next) => {
  	req.minioReq = {
  		...req.minioReq,
		list: {
			folder: req.params.fragmentId
		}
	}
  	next()
}

const setupGetFile = (req, res, next) => {
  	req.minioReq = {
  		...req.minioReq,
		get: {
			folder: req.params.fragmentId,
			file: req.params.fileId
		}
	}
  	next()
}

const setupDeleteFile = (req, res, next) => {
  	req.minioReq = {
  		...req.minioReq,
		delete: {
			folder: req.params.fragmentId,
			file: req.params.fileId
		}
	}
  	next()
}

app.get('/', (req, res) => {
  res.send('Example to use PubSweet components!')
})

app.post('/api/files', setupLoginUser, minioMiddleware({op: minioClient.Ops.post}), (req, res) => {
	if (req.minioRes.error) {
		res.status(400).json({ error: req.minioRes.error })
	}

	res.send({ id: req.minioRes.post.id })
})

app.get('/api/files/:fragmentId',
	setupLoginUser, 
	setupListFolder,
	minioMiddleware({op: minioClient.Ops.list}), 
	(req, res) => {
		if (req.minioRes.error) {
			res.status(400).json({ error: req.minioRes.error })
		}
		res.send(req.minioRes.list);
	}
)

app.get('/api/files/:fragmentId/:fileId',
	setupLoginUser, 
	setupGetFile,
	minioMiddleware({op: minioClient.Ops.get}),
	(req, res) => {
		if (req.minioRes.error) {
			res.status(400).json({ error: req.minioRes.error })
		}
		res.download(req.minioRes.get);
	}
)

app.delete('/api/files/:fragmentId/:fileId',
	setupLoginUser,
	setupDeleteFile,
	minioMiddleware({op: minioClient.Ops.delete}),
	(req, res) => {
		if (req.minioRes.error) {
			res.status(400).json({ error: req.minioRes.error })
		}
		res.send(req.minioRes.delete);
	}
)

app.listen(3000)