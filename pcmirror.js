async function searchResults(keyword) {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const response = await fetch(`https://pcmirror.cc/pv/search.php?s=${encodedKeyword}`);
        const text = await response.text(); // Get response as text
        
        // If response is HTML, return an error
        if (text.includes("<html")) {
            console.log("Search API returned HTML. Parsing required.");
            return JSON.stringify([{ title: 'Error: Search API changed', image: '', href: '' }]);
        }
        
        const data = JSON.parse(text); // Try parsing JSON

        // Ensure data is an array before mapping
        if (!Array.isArray(data)) {
            console.log("Unexpected search response:", data);
            return JSON.stringify([{ title: 'Error: Unexpected Search Format', image: '', href: '' }]);
        }

        const transformedResults = data.map(movie => ({
            title: movie.title || "Unknown",
            image: movie.image || "https://pcmirror.cc/default-image.png",
            href: `https://pcmirror.cc/watch/${movie.id}` // Construct movie URL
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
        if (!match) throw new Error("Invalid URL format");

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
        if (!match) throw new Error("Invalid URL format");

        const movieID = match[1];
        const timestamp = Math.floor(Date.now() / 1000); // Generate timestamp dynamically

        const response = await fetch(`https://pcmirror.cc/pv/playlist.php?id=${movieID}&tm=${timestamp}`);
        const text = await response.text();

        // If response is not JSON, return an error
        if (text.includes("<html")) {
            console.log("Stream API returned HTML. Parsing required.");
            return null;
        }

        const data = JSON.parse(text);

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
