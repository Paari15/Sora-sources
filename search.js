async function search(query) {
  const encodedQuery = encodeURIComponent(query);
  const timestamp = Math.floor(Date.now() / 1000);
  const searchUrl = `https://iosmirror.cc/search.php?s=${encodedQuery}&t=${timestamp}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    });
    const data = await response.json();

    if (data.status === 'y' && data.searchResult) {
      return data.searchResult.map(result => ({
        title: result.t,
        url: `https://iosmirror.cc/post.php?id=${result.id}`
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Search API Error:', error);
    return [];
  }
}
