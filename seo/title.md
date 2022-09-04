## Best Practices for influencing the title link

Title links are critical to giving users a quick insight into the content of a result and why it's relevant to their query.

It's often the primary piece of information people use to decide which result to click on,
so it's important to use high-quality title text on your web pages.

- Make sure every page on your site has a title specified in the `<title>` element.

- Write descriptive and concise text for your `<title>` elements.
  Avoid vague descriptors like "Home" for your home page, or "Profile" for a specific person's profile.
  Also avoid unnecessarily long or verbose text in your `<title>` elements,
  which is likely to get truncated when it shows up in search results.

- Avoid keyword stuffing.
  It's sometimes helpful to have a few descriptive terms in the `<title>` element,
  but there's no reason to have the same words or phrases appear multiple times.
  Title text like "Foobar, foo bar, foobars, foo bars" doesn't help the user,
  and this kind of keyword stuffing can make your results look spammy to Google and to users.

- Avoid repeated or boilerplate text in `<title>` elements.
  It's important to have distinct,
  descriptive text in the `<title>` element for each page on your site.
  Titling every page on a commerce site "Cheap products for sale",
  for example, makes it impossible for users to distinguish between two pages.
  Long text in the `<title>` element that varies by only a single piece of information ("boilerplate" titles) is also bad;
  for example, a common `<title>` element for all pages with text
  like "Band Name - See videos, lyrics, posters, albums, reviews and concerts"
  contains a lot of uninformative text.

  One solution is to dynamically update the `<title>` element to better reflect the actual content of the page.
  For example, include the words "video", "lyrics", etc.,
  only if that particular page contains video or lyrics.
  Another option is to just use the actual name of the band as a concise text in the `<title>` element
  and use the meta description to describe your page's content.

- Brand your titles concisely.
  The `<title>` element on your site's home page is a reasonable place to include some additional information about your site.
  For example:
    `<title>ExampleSocialSite, a place for people to meet and mingle</title>`
  But displaying that text in the `<title>` element of every single page on your site will look repetitive
  if several pages from your site are returned for the same query.
  In this case, consider including just your site name at the beginning or end of each `<title>` element,
  separated from the rest of the text with a delimiter such as a hyphen, colon, or pipe,
  like this:
    `<title>ExampleSocialSite: Sign up for a new account.</title>`

- Make it clear which text is the main title for the page.
  Google looks at various sources when creating title links,
  including the main visual title, heading elements, and other large and prominent text,
  and it can be confusing if multiple headings carry the same visual weight and prominence.
  Consider ensuring that your main title is distinctive from other text on a page
  and stands out as being the most prominent on the page
  (for example, using a larger font, putting the title text in the first visible `<h1>` element on the page, etc).

- Be careful about disallowing search engines from crawling your pages.
  Using the robots.txt protocol on your site can stop Google from crawling your pages,
  but it may not always prevent them from being indexed.
  For example, Google may index your page if we discover it by following a link from someone else's site.
  If we don't have access to the content on your page, we will rely on off-page content to generate the title link,
  such as anchor text from other sites.
  To prevent a URL from being indexed, you can use the noindex directive.

- Use the same script and language as the primary content on your pages.
  Google tries to show a title link that matches the primary script and language of a page.
  If Google determines that a `<title>` element does not match the script or language of the page's primary content,
  we may choose a different text as the title link.
