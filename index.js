import requestIp from 'request-ip'
import requestCountry from "request-country"

var prisma = null;
var DEBUG = false;

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
                const reqOptions = {
                    referrer: req.headers.referer,
                    userAgent: req.headers["user-agent"],
                    clickedBy:  requestIp.getClientIp(req),
                    countryCode: requestCountry(req)
                }
        
                if (DEBUG) console.log('reqOptions = ', reqOptions)
        
                const data = {
                    referrer: reqOptions.referrer ? reqOptions.referrer : '',
                    userAgent: reqOptions.userAgent ? reqOptions.userAgent : '',
                    clickedBy:  reqOptions.clickedBy ? reqOptions.clickedBy : '',
                    countryCode: reqOptions.countryCode ? reqOptions.countryCode : '',
                    originalUrlId: id,
                    urlId: link ? id : null,
                    requestedUrl : req.originalUrl
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