const parseRss = (data) => {
  const parser = new DOMParser();
  const rss = parser.parseFromString(data, 'text/xml');
  const parseError = rss.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParseError = true;
    throw error;
  }
  const feedTitle = rss.querySelector('channel > title').textContent;
  const feedDescription = rss.querySelector('channel > description').textContent;

  const postsItems = rss.querySelectorAll('item');
  const items = [];
  postsItems.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    items.push({
      title,
      description,
      link,
    });
  });
  return { title: feedTitle, description: feedDescription, items };
};

export default parseRss;
