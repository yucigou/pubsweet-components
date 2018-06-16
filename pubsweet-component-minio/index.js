require('dotenv').config()
const formidable = require('formidable')
const minioClient = require('./src/minio-client')

const Ops = Object.freeze({"post":1, "list":2, "get":3, "delete":4})

const validityCheck = (req, options) => {
	if (!options) {
		const error = 'Options not available'
		req.minioRes = {error}
		console.log(error)
		return false;
	}

	if (!req.minioReq) {
		const error = 'req.minioReq not available'
		req.minioRes = {error}
		console.log(error)
		return false;
	}

	if (!req.minioReq.username) {
		const error = 'req.minioReq.username not available'
		req.minioRes = {error}
		console.log(error)
		return false;
	}

	let supported = false;
	for (const property in Ops) {
		console.log('property: ', property);
		if (Ops[property] === options.op) {
			supported = true
			break
		}
	}
	if (!supported) {
		const error = 'Operation not supported'
		req.minioRes = {error}
		console.log(error)
		return false;
	}

	return true;
}

const handlePost = (req, fields, files) => {
	minioClient.uploadFile(
		req.minioReq.username,
		fields.fragmentId,
		files.file.name,
		files.file.type,
		files.file.path,
		(error, etag) => {
			if (error) {
				req.minioRes = {error}
				console.log(err)
				return false;
			}
			req.minioRes = { id: `${fields.fragmentId}/${files.file.name}` }
			return true;
		},
	)
}

const handleRequests = (req, options) => {
	if (!validityCheck(req, options)) {
		return;
	}

	const form = new formidable.IncomingForm()
	form.parse(req, (err, fields, files) => {
		req.minioRes = {error: 'No error'}

	    if (err) {
			req.minioRes = {error: err}
			console.log(err)
			return;
	    }

	    if (options.op === Ops.post) {
	    	handlePost(req, fields, files)
	    }
	})
}

module.exports = {
	Ops,
	middleware() {
		return options => {
			return async (req, res, next) => {
				handleRequests(req, options);
				next()
			}
		}
	}	
}
