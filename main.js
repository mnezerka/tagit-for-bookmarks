document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('bookmark-list');
    const tagRegex = /\[(.*?)\]/;

    // We fetch the whole tree to ensure we don't miss characters like '['
    chrome.bookmarks.getTree((nodes) => {

        const groups = {};

        function findTagged(nodeList, forcedTag, level) {

            nodeList.forEach(node => {

                childrenForcedTag = null;

                if (forcedTag) {
                    if (!groups[forcedTag]) groups[forcedTag] = {title: forcedTag, index: level + '.' + node.index, items: []};
                    groups[forcedTag].items.push({
                        url: node.url,
                        title: node.title.trim() || node.url,
                        index: node.index
                    });
                }

                const match = node.title.match(tagRegex);

                // if node contains tag
                //if (node.url && tagRegex.test(node.title)) {
                if (tagRegex.test(node.title)) {

                    const tagName = match[1];

                    // remove tag from title
                    const cleanTitle = node.title.replace(tagRegex, '').trim();

                    // if node is folder, add all bookmars no matter if tagged
                    if (!node.url) {
                        childrenForcedTag = tagName
                    } else {
                        if (!groups[tagName]) groups[tagName] = {title: tagName, index: level + '.' + node.index, items: []};
                        groups[tagName].items.push({
                            url: node.url,
                            title: cleanTitle || node.url,
                            index: node.index
                        });
                    }
                }

                if (node.children) findTagged(node.children, childrenForcedTag, level + '.' + (node.index || '0'));
            });
        }

        findTagged(nodes, null, 'r');
        renderGroups(groups);
    });

    function sortItems(a, b) {
        if (a.index !== b.index ) return a.index - b.index;
        return a.title.localeCompare(b.title);
    }

    function renderGroups(groups) {

        if (Object.keys(groups).length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:#64748b;">No tagged bookmarks found. Try naming a bookmark "[Test] Site Name".</p>';
            return;
        }

        listContainer.innerHTML = '';
        Object.values(groups).sort(sortItems).forEach(group => {
            const section = document.createElement('section');
            section.className = 'tag-section';

            let cardsHtml = group.items.sort(sortItems).map(bm => {
                const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${new URL(bm.url).hostname}`;
                return `
                    <a class="bookmark-card" href="${bm.url}">
                        <img src="${favicon}" class="icon" alt="">
                        <span class="title">${bm.title}</span>
                    </a>
                `;
            }).join('');

            section.innerHTML = `
                <h2 class="section-title">${group.title}</h2>
                <div class="card-grid">${cardsHtml}</div>
            `;
            listContainer.appendChild(section);
        });
    }
});
