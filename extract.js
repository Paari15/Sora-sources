async function extract(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  const postId = urlParams.get('id');
  const timestamp = Math.floor(Date.now() / 1000);
  const playlistUrl = `https://iosmirror.cc/playlist.php?id=${postId}&t=Title&tm=${timestamp}`;

  try {
    const response = await fetch(playlistUrl);
    const data = await response.json();

    if (data.playlist && data.playlist.length > 0) {
      return {
        streamUrl: data.playlist[0].file,
        subtitles: data.tracks || []
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Extraction API Error:', error);
    return null;
  }
}
