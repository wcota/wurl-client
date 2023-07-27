import requestIp from 'request-ip'
import path from 'path'
import geoip from 'geoip-country'

var prisma = null
var DEBUG = false

var FILE_1 = path.resolve(process.cwd(), 'node_modules/geoip-country/data/geoip-country.dat')
var FILE_2 = path.resolve(process.cwd(), 'node_modules/geoip-country/data/geoip-country6.dat')

export default {
    init : (p, debug = false) => {
        prisma = p,
        DEBUG = debug
    },
    find : async (id, req) => {

        var link;
        var errorCode;
        var errorMessage;

        try {
            link = await prisma.url.findUnique({
                where : {
                    id: id
                }
            })
        }
        catch (e) {
            errorCode = 500
            errorMessage = 'error while finding link'
            console.error(e)
        }
    
        if (DEBUG) console.log('link = ', link)
    
        if (req && !errorCode) {
    
            try {
                const ipAddress = requestIp.getClientIp(req)
                const ipCountry = geoip.lookup(ipAddress)
                
                const reqOptions = {
                    referrer: req.headers.referer,
                    userAgent: req.headers["user-agent"],
                    clickedBy:  ipAddress,
                    countryCode: ipCountry ? ipCountry.country : ''
                }
        
                if (DEBUG) console.log('reqOptions = ', reqOptions)
        
                const data = {
                    referrer: reqOptions.referrer ? reqOptions.referrer : '',
                    userAgent: reqOptions.userAgent ? reqOptions.userAgent : '',
                    clickedBy:  reqOptions.clickedBy ? reqOptions.clickedBy : '',
                    countryCode: reqOptions.countryCode ? reqOptions.countryCode : '',
                    originalUrlId: id,
                    urlId: (link ? id : null),
                    requestedUrl : (req.originalUrl ? req.originalUrl : req.url)
                }
        
                if (DEBUG) console.log('data = ', data)

                await prisma.click.create({data})
            }
            catch (e) {
                errorCode = 500
                errorMessage = 'error while saving click'
                console.error(e)
            }
            
        }
    
        return link ? {
            status: 'ok',
            data: link,
            errorCode,
            errorMessage
        } : {
            status: 'error',
            errorCode : (errorCode ? errorCode : 404),
            errorMessage: (errorMessage ? errorMessage : 'not found')
        }
    }
}