require('dotenv').config()
const formidable = require('formidable')
const minioClient = require('./minio-client.js')
const uuidv1 = require('uuid/v1')

const Ops = Object.freeze({'post':1, 'list':2, 'get':3, 'delete':4})

const extractFileExtension = filename => {
    if (filename) {
        return filename.split('.').pop()
    }

    return ''
}

const validityCheck = (req, options) => {
    if (!options) {
        const error = 'Options not provided'
        req.minio = {error}
        return false
    }

    let supported = false
    for (const property in Ops) {
        if (Ops[property] === options.op) {
            supported = true
            break
        }
    }
    if (!supported) {
        const error = 'Operation not supported'
        req.minio = {error}
        return false
    }

    return true
}

const handlePost = (req, next, fields, files) => {
    let filename = uuidv1()
    const extension = extractFileExtension(files.file.name)
    if (extension) {
        filename += '.' + extension
    }

    minioClient.uploadFile(
        filename,
        files.file.name,
        files.file.type,
        files.file.path,
        (error, etag) => {
            if (error) {
                req.minio = {error}
            } else {
                req.minio = {post: { filename: `${filename}`, etag }}
            }
            next()
            return
        }
    )
}

const handleList = (req, next) => {
	console.log('handleList...')
    minioClient.listFiles(
        (error, list) => {
            if (error) {
                req.minio = {error}
            } else {
                req.minio = {list}
            }
            next()
        }
    )
}

const handleGet = (req, next) => {
    const tmpFile = `/tmp/${req.params.filename}`
    minioClient.getFile(
        req.params.filename,
        tmpFile,
        error => {
            if (error) {
                req.minio = {error}
            } else {
                req.minio = {get: tmpFile}
            }
            next()
        }
    )
}

const handleDelete = (req, next) => {
    minioClient.deleteFile(
        req.params.filename,
        error => {
            if (error) {
                req.minio = {error}
            } else {
                req.minio = {delete: 'Success'}
            }
            next()
        }
    )
}

const handleRequests = (req, next, options) => {
	console.log('handleRequests...')
    if (!validityCheck(req, options)) {
        next()
        return
    }

    const form = new formidable.IncomingForm()
    req.minio = {error: 'No error'}

    form.parse(req, (err, fields, files) => {
        if (err) {
            req.minio = {error: err}
            next()
            return
        }

        if (options.op === Ops.post) {
            handlePost(req, next, fields, files)
        } else if (options.op === Ops.list) {
            handleList(req, next)
        } else if (options.op === Ops.get) {
            handleGet(req, next)
        } else if (options.op === Ops.delete) {
            handleDelete(req, next)
        }
    })
}

module.exports = {
    Ops,
    middleware() {
        return options => {
            return (req, res, next) => {
                handleRequests(req, next, options)
            }
        }
    }    
}
