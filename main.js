document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('bookmark-list');
    const tagRegex = /\[(.*?)\]/;

    // We fetch the whole tree to ensure we don't miss characters like '['
    chrome.bookmarks.getTree((nodes) => {
        const grouped = {};

        // Helper to crawl the tree
        function findTagged(nodeList) {
            nodeList.forEach(node => {
                if (node.url && tagRegex.test(node.title)) {
                    console.log(node.title);

                    const match = node.title.match(tagRegex);
                    const tagName = match[1]; // Normalize tag case
                    const cleanTitle = node.title.replace(tagRegex, '').trim();

                    if (!grouped[tagName]) grouped[tagName] = [];
                    grouped[tagName].push({
                        url: node.url,
                        title: cleanTitle || node.url
                    });
                }
                if (node.children) findTagged(node.children);
            });
        }

        findTagged(nodes);
        renderGroups(grouped);
    });

    function renderGroups(groups) {
        if (Object.keys(groups).length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:#64748b;">No tagged bookmarks found. Try naming a bookmark "[Test] Site Name".</p>';
            return;
        }

        listContainer.innerHTML = '';
        Object.keys(groups).sort().forEach(tag => {
            const section = document.createElement('section');
            section.className = 'tag-section';

            let cardsHtml = groups[tag].map(bm => {
                const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(bm.url).hostname}`;
                return `
                    <a class="bookmark-card" href="${bm.url}">
                        <img src="${favicon}" class="icon" alt="">
                        <span class="title">${bm.title}</span>
                    </a>
                `;
            }).join('');

            section.innerHTML = `
                <h2 class="section-title">${tag}</h2>
                <div class="card-grid">${cardsHtml}</div>
            `;
            listContainer.appendChild(section);
        });
    }
});
