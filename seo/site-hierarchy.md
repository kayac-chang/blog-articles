# Organize your site hierarchy

## Understand how search engines use URLs

Search engines need a unique URL per piece of content
to be able to crawl and index that content,
and to refer users to it.

Different content (for example, different products in a shop)
as well as modified content (for example, translations or regional variations)
need to use separate URLs in order to be shown in search appropriately.

URLs are generally split into multiple distinct sections:

```
protocol://hostname/path/filename?querystring#fragment
```

For example:

```
https://www.example.com/RunningShoes/Womens.htm?size=8#info
```

Google recommends that all websites use https:// when possible.
The hostname is where your website is hosted,
commonly using the same domain name that you'd use for email.

Google differentiates between the www and non-www version
(for example, www.example.com or just example.com).
When adding your website to Search Console,
we recommend adding both http:// and https:// versions,
as well as the www and non-www versions.

Path, filename, and query string determine which content from your server is accessed.
These three parts are case-sensitive,
so FILE would result in a different URL than file.
The hostname and protocol are case-insensitive;
upper or lower case wouldn't play a role there.

A fragment (in this case, #info) generally identifies
which part of the page the browser scrolls to.
Because the content itself is usually the same regardless of the fragment,
search engines commonly ignore any fragment used.

When referring to the homepage,
a trailing slash after the hostname is optional
since it leads to the same content (https://example.com/ is the same as https://example.com).
For the path and filename, a trailing slash would be seen as a different URL
(signaling either a file or a directory),
for example, https://example.com/fish is not the same as https://example.com/fish/.

## Navigation is important for search engines

The navigation of a website is important in helping visitors quickly find the content they want.
It can also help search engines understand what content the website owner thinks is important.
Although Google's search results are provided at a page level,
Google also likes to have a sense of what role a page plays in the bigger picture of the site.

## Plan your navigation based on your homepage

All sites have a home or root page,
which is usually the most frequented page on the site
and the starting place of navigation for many visitors.

Unless your site has only a handful of pages,
think about how visitors will go from a general page (your root page)
to a page containing more specific content.

Do you have enough pages around a specific topic area
that it would make sense to create a page describing these related pages
(for example, root page -> related topic listing -> specific topic)?

Do you have hundreds of different products
that need to be classified under multiple category and subcategory pages?

## Using breadcrumb lists

A breadcrumb is a row of internal links at the top or bottom of the page
that allows visitors to quickly navigate back
to a previous section or the root page.

Many breadcrumbs have the most general page (usually the root page) as the first,
leftmost link and list the more specific sections out to the right.

## Create a simple navigational page for users

A navigational page is a simple page on your site
that displays the structure of your website,
and usually consists of a hierarchical listing of the pages on your site.
Visitors may visit this page if they are having problems finding pages on your site.
While search engines will also visit this page,
getting good crawl coverage of the pages on your site,
it's mainly aimed at human visitors.

## Create a naturally flowing hierarchy

Make it as easy as possible for users to go from general content
to the more specific content they want on your site.
Add navigation pages when it makes sense
and effectively work these into your internal link structure.
Make sure all of the pages on your site are reachable through links,
and that they don't require an internal search functionality to be found.
Link to related pages, where appropriate, to allow users to discover similar content.

### Avoid

- Avoid creating complex webs of navigation links,
  for example, linking every page on your site to every other page.
- Avoid going overboard with slicing and dicing your content
  (so that it takes twenty clicks to reach from the homepage).

## Use text for navigation

Controlling most of the navigation from page to page on your site
through text links makes it easier for search engines to crawl and understand your site.
When using JavaScript to create a page,
use `a` elements with URLs as href attribute values,
and generate all menu items on page-load,
instead of waiting for a user interaction.

### Avoid

- Avoid having a navigation based entirely on images, or animations.
- Avoid requiring script based event-handling for navigation.

## Create a navigational page for users, a sitemap for search engines

Include a simple navigational page for your entire site
(or the most important pages, if you have hundreds or thousands) for users.
Create an XML sitemap file
to ensure that search engines discover the new and updated pages on your site,
listing all relevant URLs together with their primary content's last modified dates.

### Avoid

- Avoid letting your navigational page become out of date with broken links.
- Avoid creating a navigational page that simply lists pages without organizing them, for example by subject.

## Show useful 404 pages

Users will occasionally come to a page that doesn't exist on your site,
either by following a broken link or typing in the wrong URL.
Having a custom 404 page that kindly guides users back to a working page
on your site can greatly improve a user's experience.
Consider including a link back to your root page
and providing links to popular or related content on your site.
You can use Google Search Console to find the sources of URLs causing "not found" errors.

### Avoid

- Avoid allowing your 404 pages to be indexed in search engines
  (make sure that your web server is configured to give a 404 HTTP status code
  or - in the case of Javascript-based sites-include the noindex tag when non-existent pages are requested.)

- Avoid blocking 404 pages from being crawled through the robots.txt file.

- Avoid providing only a vague message like "Not found", "404", or no 404 at all.

- Avoid using a design for your 404 pages that isn't consistent with the rest of your site.
