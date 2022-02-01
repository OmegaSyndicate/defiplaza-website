# DefiPlaza website

## Installing

```bash
npm install
```

## Running

Start the development server

```bash
npm run serve
```

## Build

Start the development server

```bash
npm run start
```

You now have a completely static site pulling content from WordPress running as a headless CMS.

To use your own install, edit the `.env` config file with your credentials. 

```bash
WORDPRESS_API_URL=https://defiplaza.net/wp-json/wp/v2/
SITE_URL=http://localhost:8080
```

## Deploying with Cloudflare Pages

Simply commit to `main`.
