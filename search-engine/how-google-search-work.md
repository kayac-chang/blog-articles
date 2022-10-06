# In-depth guide to how Google Search works

Google Search is a fully-automated search engine  
that uses software known as web crawlers
that explore the web regularly to find pages to add to our index.

In fact,
the vast majority of pages listed in our results
aren't manually submitted for inclusion,
but are found and added automatically when our web crawlers explore the web.
This document explains the stages of how Search works in the context of your website.
Having this base knowledge can help you fix crawling issues,
get your pages indexed, and learn how to optimize how your site appears in Google Search.

## A few notes before we get started

Before we get into the details of how Search works,
it's important to note that Google doesn't accept payment
to crawl a site more frequently, or rank it higher.
If anyone tells you otherwise, they're wrong.

Google doesn't guarantee that is will crawl, index, or serve your page,
even if your page follows Google's guidelines and policies for site owners.

## Introducing the three stages of Google Search

Google Search works in three stages, and not all pages make it through each stage:

1. Crawling:
   Google downloads text, images, and videos from pages it found
   on the internet with automated programs called crawlers.
2. Indexing:
   Google analyzes the text, images, and video files on the page,
   and stores the information in the Google index, which is a large database.
3. Serving search results:
   When a user searches on Google, Google returns information that's relevant to the user's query.

## Crawling

The first stage is finding out what pages exist on the web.
There isn't a central registry of all web pages,
so Google must constantly look for new and updated pages
and add them to its list of known pages.
This process is called "URL discovery".
Some pages are known because Google has already visited them.
Other pages are discovered when Google follows a link from a known page to a new page:
for example, a hub page, such as a category page, links to a new blog post.
Still other pages are discovered when you submit a list of pages (a sitemap) for Google to crawl.

Once Google discovers a page's URL,
it may visit (or "crawl") the page to find out what's on it.
We use a huge set of computers to crawl billions of pages on the web.
The program that does the fetching is called Googlebot
(also known as a robot, bot, or spider).
Googlebot uses an algorithmic process to determine which sites to crawl,
how often, and how many pages to fetch from each site.
Google's crawlers are also programmed
such that they try not to crawl the site too fast to avoid overloading it.
This mechanism is based on the responses of the site
(for example, HTTP 500 errors mean "slow down") and settings in Search Console.

However, Googlebot doesn't crawl all the pages it discoverd.
Some pages may be disallowed for crawling by the site owner,
other pages may not be accessible without logging in to the site,
and other pages may be duplicates of previously crawled pages.
For example, many sites are accessible through the www (www.example.com)
and non-www (example.com) version of the domain name,
even through the content is identical under both versions.

During the crawl,
Google renders the page and runs any JavaScript it finds using a recent version of Chrome,
similar to how your browser renders pages you visit.
Rendering is important because websites often rely on JavaScript
to bring content to the page,
and without rendering Google might not see that content.

Crawling depends on whether Google's crawler can access the site.
Some common issues with Googlebot accessing sites include:

- Problems with the server handling the site
- Network issues
- robots.txt directives preventing Googlebot's access to the page

## Indexing

After a page is crawled, Google tries to understand what the page is about.
This stage is called indexing and it includes processing and analyzing the textual content
and key content tags and attributes,
such as <title> elements and alt attributes, images, videos, and more.
During the indexing process, Google determines if a page
is a duplicate of another page on the internet or canonical.
The canonical is the page that may be shown in search results.
To select the canonical, we first cluster the pages that we found on the internet
that have similar content,
and them we select the one that's most representative of the group.
The other pages in the group are alternate versions
that may be served in different contexts,
like if the user is searching from a mobile device
or they're looking for a ver specific page from that cluster.

Google also collects signals about the canonical page and its contents,
which may be used in the next page,
where we serve the page in search results.
Some signals include the language of the page,
the country the content is local to,
the usability of the page, and so on.

The collected information about the canonical page
and its cluster may be stored in the Google index,
a large database hosted on the thousands of computers.
Indexing isn't guaranteed; not every page that Google processes will be indexed.

Indexing also depends on the content of the page and its metadata.
Some common indexing issues can include:

- The quality of the content on page is low
- Robots meta directives disallow indexing
- The design of the website might make indexing difficult

## Serving Search Results

When a user enters a query,
our machines search the index for matching pages
and return the results we believe are the highest quality
and most relevant to the user.
Relevancy is determined by hundreds of factors,
which could include information
such as the user's location, language, and device (desktop or phone).
For example,
searching for "bicycle repair shops"
would show different results to a user in Paris
than it would to a user in Hong Kong.

Search Console might tell you that a page is indexed,
but you don't see it in search results.
This might because:

- The content of the content on page is irrelevant to users
- The quality of the content is low
- Robots meta directives prevent serving

While this guide explains how Search works,
we are always working on improving our algorithms.
You can keep track of these changes by following the Google Search Central blog.
