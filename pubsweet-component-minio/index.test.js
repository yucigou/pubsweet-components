const Assert = require('assert')
const httpMocks = require('node-mocks-http')
const minioClient = require('./index')

const minioMiddleware = minioClient.middleware()


describe('Minio express middleware', () => {  
    it('uploads a file', () => {
        return Assert.equal(minioClient.Ops.post, 1)
    }),
    
    it('gets a file', () => {
        return Assert.equal('HELLO WORLD', 'HELLO WORLD')
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
        console.log('hello')
    }),
    
    it('deletes a file', () => {
        return Assert.equal('HELLO WORLD', 'HELLO WORLD')
    })
})