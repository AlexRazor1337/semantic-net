document.getElementById('build').addEventListener('click', function (e) {
    const input = document.getElementById('text-input').value;
    fetch('/build', { method: 'POST', body: JSON.stringify( { input }), headers: { 'Content-Type': 'application/json' } })
        .then(response => response.json())
        .then(data => {
            const nodes = [];
            const edges = [];

            data.vocab.forEach((token) => {
                nodes.push({ id: token.keyword, label: token.keyword });
                token.links.forEach((link) => {
                    edges.push({ from: link.source, to: link.target, label: link.type });
                });
            });

            // Remove duplicate edges
            const uniqueEdges = edges.reduce((unique, o) => {
                if (!unique.some(obj => (obj.from === o.from && obj.to === o.to) || (obj.from === o.to && obj.to === o.from)))  unique.push(o);

                return unique;
            }, []);


            const container = document.getElementById("network");
            const graphData = {
                nodes: new vis.DataSet(nodes),
                edges: new vis.DataSet(uniqueEdges),
            };

            const network = new vis.Network(container, graphData, { physics: false });
        })
        .catch(function (error) {
            console.log(error);
        });
});
