import requestIp from 'request-ip'
import requestCountry from "request-country"

var prisma = null;
var DEBUG = false;

export default {
    init : (p, debug = false) => {
        prisma = p,
        DEBUG = debug
    },
    GetLinkById : async (id, req) => {

        const link = await prisma.url.findUnique({
            where : {
                id: id
            }
        })
    
        if (DEBUG) console.log('link = ', link)
    
        if (req) {
    
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
                urlId: link ? id : null
            }
    
            if (DEBUG) console.log('data = ', data)
    
            await prisma.click.create({data})
        }
    
        return link ? link : null
    }
}