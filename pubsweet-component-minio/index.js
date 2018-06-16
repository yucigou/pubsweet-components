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

const handlePost = (req, next, fields, files) => {
	minioClient.uploadFile(
		req.minioReq.username,
		fields.fragmentId,
		files.file.name,
		files.file.type,
		files.file.path,
		(error, etag) => {
			if (error) {
				req.minioRes = {error}
				console.log(error)
			} else {
				req.minioRes = {post: { id: `${fields.fragmentId}/${files.file.name}` }}
			}
			next()
			return
		},
	)
}

const handleList = (req, next, fields, files) => {
	minioClient.listFiles(
		req.minioReq.username,
		req.minioReq.list.folder,
		(error, list) => {
			if (error) {
				req.minioRes = {error}
				console.log(error)
			} else {
				req.minioRes = {list}
			}
			next()
		},
	)
}

const handleGet = (req, next, fields, files) => {
	const tmpFile = `/tmp/${req.minioReq.get.folder}-${req.minioReq.get.file}`
	minioClient.getFile(
		req.minioReq.username,
		req.minioReq.get.folder,
		req.minioReq.get.file,
		tmpFile,
		error => {
			if (error) {
				req.minioRes = {error}
				console.log(error)
			} else {
				req.minioRes = {get: tmpFile}
			}
			next()
		},
	)
}

const handleRequests = (req, next, options) => {
	if (!validityCheck(req, options)) {
		next()
		return;
	}

	const form = new formidable.IncomingForm()
	req.minioRes = {error: 'No error'}

	form.parse(req, (err, fields, files) => {
	    if (err) {
			req.minioRes = {error: err}
			console.log(err)
			next()
			return;
	    }

	    if (options.op === Ops.post) {
	    	handlePost(req, next, fields, files)
	    } else if (options.op === Ops.list) {
	    	handleList(req, next, fields, files)
	    } else if (options.op === Ops.get) {
	    	handleGet(req, next, fields, files)
	    }
	})
}

module.exports = {
	Ops,
	middleware() {
		return options => {
			return (req, res, next) => {
				handleRequests(req, next, options);
			}
		}
	}	
}
