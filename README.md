# w-URL - URL shortner 

This is a simple package that provides a function to look for a `id` in a `Url` table and return the redirected URL, and save the click with IP, time, userAgent, referrer, and country code of the user.

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
  referrer      String
  userAgent     String
  clickedBy     String
  countryCode   String
  urlId         String?
  originalUrlId String?
  Url           Url?     @relation(fields: [urlId], references: [id])
}
```

**Note that the write access is needed for `Click` table!**.

## Initializing

Import the client using `import wurl from '@wcota/wurl-client'`. Now, call `wurl.init(prisma)` with a given Prisma client with access to `Url` and `Click` models.  It will link the w-URL client with Prisma.

## Using `find()`

This function is `async`, requiring the `id` and an optional `req` object with the HTTP request object. Prisma will try to find the given URL data from for `id`, and if `req` is provided, will add the access to `id` in the Click table with the timestamp, referrer, user agent, IP, country code, requested ID, original request URL, and URL to where the user was redirected.

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
