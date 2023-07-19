const parseRss = (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'text/xml');
  const parseError = parsedRss.querySelector('parsererror');
  if (parseError) {
    throw new Error('parseError');
  }
  return parsedRss;
};

export default parseRss;
