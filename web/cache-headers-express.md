# Cache headers in Express js app

Effective implementation of caching strategy
can significantly improve resilience of your Express app and save cose.
When you implement the right caching strategies combined with a content delivery network (CDN)
your website can serve massive spikes in traffic without significant increase in the server load.

## Caching strategy

We will leverage the power of HTTP cache-control headers
combined with caching and serving your Express app via CDN network.
We will not be using any server side caching,
as the assumption is that with the right configuration of the HTTP headers
and the CDN there will be no need to burden your server with any additional requests
related to server-side caching.

## Cache headers intro

The http header Cache-control allows to define
how your proxy server (e.g. Nginx), your CDN and client browsers will cache content
and serve it instead of forwarding requests to the app.

You can find the full specification of Cache-control at MDN.
The following are the key parameters that we will use in our example configuration:

- public
  indicates that the response may be cached by any cache.
  That means that every layer that your response passes through
  is allowed to cache your content and serve it.
