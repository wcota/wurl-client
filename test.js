import wurl from './index.js'
import { PrismaClient } from "../prisma_client/index.js"
import httpMocks from 'node-mocks-http'

const prisma = new PrismaClient()

console.log(process.cwd())
var geodatadir = process.cwd()

wurl.init(prisma, true, false)

var req  = httpMocks.createRequest({
    method: 'GET',
    url: '/short?q=2023'
});

console.log(await wurl.find('short', req))