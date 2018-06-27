const Assert = require('assert')
const httpMocks = require('node-mocks-http')
const FormData = require('form-data')
const fs = require('fs')
const path = require("path")
const minioClient = require('./index')

const minioMiddleware = minioClient.middleware()

const file = {
    key: '123abc',
    originalname: 'file.txt',
    size: 128,
}

const uploadBody = `
------WebKitFormBoundaryivBOieBfKa9pKMeQ
Content-Disposition: form-data; name="fileType"

manuscripts
------WebKitFormBoundaryivBOieBfKa9pKMeQ
Content-Disposition: form-data; name="fragmentId"

a693aaad-1640-4f2e-b5ec-0538bba34636
------WebKitFormBoundaryivBOieBfKa9pKMeQ
Content-Disposition: form-data; name="file"; filename="list-002.pdf"
Content-Type: application/pdf


------WebKitFormBoundaryivBOieBfKa9pKMeQ--
`

describe('Minio express middleware', () => {  
    it('uploads a file', (done) => {
        const form = new FormData()
        const buff = fs.readFileSync(path.join(__dirname, './README.md'));
        form.append('file', buff, {
            filename: 'README.md',
            contentType: 'text/html',
            knownLength: buff.length
        });
        form.append('name', 'Readme');
        const headers = form.getHeaders();

        const request  = httpMocks.createRequest({
            method: 'POST',
            url: '/api/files',
            // headers: {
                // "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryivBOieBfKa9pKMeQ"
            // },
            headers,
            // body: uploadBody,
            // file
        });
        
        console.log('Piping...')
        form.pipe(request);
        console.log('Piped')

        const response = httpMocks.createResponse();

        minioMiddleware({op: minioClient.Ops.post})(request, response, () => {
            Assert.equal(request.minio.error, null)
            console.log(request.minio.get)
            done()
        })
    }),
    
    it('gets a file', (done) => {
        const request  = httpMocks.createRequest({
            method: 'GET',
            url: '/api/files/IMG_20180521_133845.jpg',
            params: {
                filename: 'IMG_20180521_133845.jpg'
            }
        });
   
        const response = httpMocks.createResponse();

        minioMiddleware({op: minioClient.Ops.get})(request, response, () => {
            Assert.equal(request.minio.error, null)
            console.log(request.minio.get)
            done()
        })
    }),

    it('lists files', (done) => {
        const request  = httpMocks.createRequest({
            method: 'GET',
            url: '/api/files'
        });
   
        const response = httpMocks.createResponse();

        minioMiddleware({op: minioClient.Ops.list})(request, response, () => {
            Assert.equal(request.minio.error, null)
            console.log(request.minio.list)
            done()
        })
    }),
    
    it('deletes a file', (done) => {
        const request  = httpMocks.createRequest({
            method: 'DELETE',
            url: '/api/files/6062c140-7941-11e8-adfe-5563c172c69d.pdf',
            params: {
                filename: '6062c140-7941-11e8-adfe-5563c172c69d.pdf'
            }
        });
   
        const response = httpMocks.createResponse();

        minioMiddleware({op: minioClient.Ops.delete})(request, response, () => {
            Assert.equal(request.minio.error, null)
            console.log(request.minio.delete)
            done()
        })
    })
})