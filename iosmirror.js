async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const timestamp = Math.floor(Date.now() / 1000);
        
        const response = await fetch(`https://iosmirror.cc/search.php?s=${encodedKeyword}&t=${timestamp}`);
        const data = await response.json();

        if (!data.searchResult || !Array.isArray(data.searchResult)) {
            console.log("Unexpected search response:", data);
            return JSON.stringify([{ title: 'Error: Unexpected Search Format', image: '', href: '' }]);
        }

        const transformedResults = data.searchResult.map(movie => ({
            title: movie.t || "Unknown",
            image: "https://iosmirror.cc/default-image.png", // Placeholder image
            href: `https://iosmirror.cc/watch/${movie.id}`
        }));

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Search API Error:', error);
        return JSON.stringify([{ title: 'Error', image: '', href: '' }]);
    }
}

async function extractDetails(url) {
    try {
        const match = url.match(/https:\/\/iosmirror\.cc\/watch\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");

        const movieID = match[1];
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await fetch(`https://iosmirror.cc/post.php?id=${movieID}&t=${timestamp}`);
        const data = await response.json();

        const transformedResults = [{
            description: data.description || 'No description available',
            aliases: data.genres ? data.genres.join(', ') : 'No genres available',
            airdate: `Released: ${data.release_date || 'Unknown'}`,
            image: data.image || "https://iosmirror.cc/default-image.png"
        }];

        return JSON.stringify(transformedResults);
    } catch (error) {
        console.log('Details API Error:', error);
        return JSON.stringify([{
            description: 'Error loading description',
            aliases: 'Unknown',
            airdate: 'Unknown',
            image: "https://iosmirror.cc/default-image.png"
        }]);
    }
}

async function extractStreamUrl(url) {
    try {
        const match = url.match(/https:\/\/iosmirror\.cc\/watch\/(.+)$/);
        if (!match) throw new Error("Invalid URL format");

        const movieID = match[1];
        const timestamp = Math.floor(Date.now() / 1000);

        // Step 1: Get Playlist URL
        const playlistResponse = await fetch(`https://iosmirror.cc/playlist.php?id=${movieID}&t=${encodeURIComponent(movieID)}&tm=${timestamp}`);
        const playlistData = await playlistResponse.json();

        // Step 2: Extract final .m3u8 stream
        if (playlistData && playlistData.file) {
            return playlistData.file; // The actual .m3u8 URL
        } else {
            return null;
        }
    } catch (error) {
        console.log('Stream API Error:', error);
        return null;
    }
}
