# w-URL - URL shortener 

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This is a simple package that provides a function to look for a `id` in a `Url` table and return the redirected URL, and save the click with IP, time, userAgent, referer, and country code of the user.

To install it, you will need to use [Prisma ORM](https://www.prisma.io/) with the following models in the DB schema:

```prisma
model Url {
  id        String   @id
  url       String
  title     String?
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
  clicks    Click[]
}

model Click {
  id            Int      @id @default(autoincrement())
  time          DateTime @default(now())
  referer      String
  userAgent     String
  clickedBy     String
  countryCode   String
  urlId         String?
  originalUrlId String?
  requestedUrl  String?
  Url           Url?     @relation(fields: [urlId], references: [id])
}
```

**Note that the write access is needed for `Click` table!**.

## Initializing

Import the client using `import wurl from '@wcota/wurl-client'`. Now, call `wurl.init(prisma)` with a given Prisma client with access to `Url` and `Click` models.  It will link the w-URL client with Prisma. If debug is necessary (please do not use in production!), pass the flag `debug = true` in `wurl.init()`.

## Using `find()`

This function is `async`, requiring the `id` and an optional `req` object with the HTTP request object. Prisma will try to find the given URL data from for `id`, and if `req` is provided, will add the access to `id` in the Click table with the timestamp, referer, user agent, IP, country code, requested ID, original request URL, and URL to where the user was redirected.

In case of success (`id` exists), the following object is returned:

```js
{
  status: "ok", // "ok" means that the ID was found
  data: {
    id: "example", // the requested ID
    url: "https://example.com", // the redirected URL
    title: "Example.com web page!", // title of the page, as it is in the database
    createdBy: "127.0.0.1", // IP of who created the ID
    createdAt: 2021-03-06T00:43:05.000Z, // timestamp of creation
    updatedAt: 2022-08-08T04:22:55.723Z // timestamp of last modified
  },
  errorCode: undefined, // 500 if there was an error adding the click info
  errorMessage: undefined // "error while saving click" if there was an error adding the click info
}
```

Note the `errorCode` if there is an error saving the user's information. 

If the URL does not exist (`id` is not found), the following JSON object is returned, without `data` keyword:

```js
{
  status: "error", // "error" means that the ID was not found or there was another error
  errorCode: 404, // or 500 if there was an error finding the ID
  errorMessage: "not found" // or "error while finding link" if there was an error finding the ID
}
```

All the errors are saved with `console.error()` for debugging.

## Click data

The user data consists of the following information:

```js
{
    referer, // referer address
    userAgent, // user agent
    clickedBy, // IP of the user
    countryCode, // 2 letters country code
    originalUrlId, // the id accessed when clicked
    urlId, // the id associated to the click, if the ID was found
    requestedUrl // the requested URL, preserving query strings and so on
}
```

Note that `urlId` and `originalUrlId` can be different. The first only exists if the respective ID was found. It may be different if the ID of the associated click has been changed in the `Url` table.

## Using it in Next.JS

Create a file at `/lib/wurl.js` with the following content:

```js
import { prisma } from '@/lib/db'
import wurl from '@wcota/wurl-client'

wurl.init(prisma, false)

export default wurl
```

Now, import it where you want to use, such as

```js
import wurl from '@/lib/wurl'

export const getServerSideProps = async ({req, res, params}) => {

    const result = await wurl.find(params.id, req)

    if (result.status != 'ok') {
        return {
            redirect: {
                destination: process.env.DEFAULT_URL_REDIRECT,
                statusCode: 302
            }
        }
    }

    return {
        redirect: {
            destination: result.data.url,
            statusCode: 301
        }
    }
    
    return null
}
```

## Licence

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg