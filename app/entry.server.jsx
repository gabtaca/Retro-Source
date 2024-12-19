// entry.server.jsx

import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  // Ensure the existing CSP header ends with a semicolon
  let extendedHeader = header.trim();
  if (!extendedHeader.endsWith(';')) {
    extendedHeader += ';';
  }

  // Append the 'img-src' directive with all necessary domains
  extendedHeader +=
    "img-src 'self' https://cdn.shopify.com https://assets-prd.ignimgs.com https://static0.gamerantimages.com https://www.gameinformer.com https://cdn.mos.cms.futurecdn.net https://static1.thegamerimages.com https://i.kinja-img.com https://newsboilerstorage.blob.core.windows.net;";

  // **Optional:** Append the 'connect-src' directive if client-side fetches to Shopify API are necessary
  // **Caution:** This is not recommended. Prefer server-side fetching.
  const shopifyApiEndpoint = context.env.SHOPIFY_API_ENDPOINT; // Ensure this env variable is set
  if (shopifyApiEndpoint) {
    extendedHeader += ` connect-src 'self' ${shopifyApiEndpoint};`;
  }

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error); // Log any server-side rendering errors
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', extendedHeader); // Use the extended header

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
