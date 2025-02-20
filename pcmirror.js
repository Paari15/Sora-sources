async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://pcmirror.cc/pv/search.php?s=${encodedKeyword}`);
        const data = await response.json();

        const transformedResults = data.map(movie => ({
            title: movie.title,
            image: movie.image, 
            href: `https://pcmirror.cc/watch/${movie.id}` // Movie Page
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Search API Error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/pcmirror\.cc\/watch\/(.+)$/);
        const movieID = match[1];
        const response = await fetch(`https://pcmirror.cc/pv/mini-modal-info.php?id=${movieID}&t=null`);
        const data = await response.json();

        const transformedResults = [{
            description: data.description || 'No description available',
            aliases: data.genres ? data.genres.join(', ') : 'No genres available',
            airdate: `Released: ${data.release_date || 'Unknown'}`
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details API Error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Unknown',
            airdate: 'Unknown'
        }]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/pcmirror\.cc\/watch\/(.+)$/);
        const movieID = match[1];
        const timestamp = Math.floor(Date.now() / 1000); // Generate timestamp dynamically

        const response = await fetch(`https://pcmirror.cc/pv/playlist.php?id=${movieID}&tm=${timestamp}`);
        const data = await response.json();

        if (data.playlist && data.playlist.length > 0) {
            return data.playlist[0].file; // Extract first `.m3u8` link
        } else {
            return null;
        }
    } catch (error) {
        console.log('Stream API Error:', error);
        return null;
    }
}
