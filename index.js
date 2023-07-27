import requestIp from 'request-ip'
import turboGeoip from 'turbo-geoip-country'

var prisma = null
var ADD_NOT_FOUND = false // add click even if not found
var DEBUG = false

export default {
    init : (p, addNotFound = false, debug = false) => {
        prisma = p
        ADD_NOT_FOUND = addNotFound
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
            // this will be empty if not found
        }
        catch (e) {
            errorCode = 500
            errorMessage = 'error while finding link'
            console.error(e)
        }
    
        if (DEBUG) console.log('link = ', link)
    
        // add to click table
        if (ADD_NOT_FOUND && req && !errorCode) {
    
            try {
                const ipAddress = requestIp.getClientIp(req)
                const ipCountry = turboGeoip.getCountry(ipAddress)
                
                const reqData = {
                    referer: req.headers.referer,
                    userAgent: req.headers["user-agent"],
                    clickedBy:  ipAddress,
                    countryCode: ipCountry,
                    requestedUrl: (req.originalUrl ? req.originalUrl : req.url)
                }
        
                if (DEBUG) console.log('reqData = ', reqData)
        
                const data = {
                    referer: reqData.referer ? reqData.referer : '',
                    userAgent: reqData.userAgent ? reqData.userAgent : '',
                    clickedBy:  reqData.clickedBy ? reqData.clickedBy : '',
                    countryCode: reqData.countryCode ? reqData.countryCode : '',
                    originalUrlId: id, // always the requested id
                    urlId: (link ? id : null), // if found, add to the table
                    requestedUrl : reqData.requestedUrl
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