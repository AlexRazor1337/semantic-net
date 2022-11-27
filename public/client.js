document.getElementById('build').addEventListener('click', function (e) {
    document.getElementById('ui-container').classList.add('hidden');
    document.getElementById('spinner').classList.add('lds-ring');

    const input = document.getElementById('text-input').value;
    const alternative = document.getElementById('alternative').checked;
    fetch('/build', { method: 'POST', body: JSON.stringify( { input, alternative }), headers: { 'Content-Type': 'application/json' } })
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

            // Count ammount of isa links
            const isaLinks = uniqueEdges.filter((edge) => edge.label == 'isa').length;
            document.getElementById('links-count').innerHTML = `${isaLinks} 'isa' links`;

            document.getElementById('processed').value = data.processedString;

            document.getElementById('spinner').classList.remove('lds-ring');
            document.getElementById('result').classList.remove('hidden');

            const network = new vis.Network(container, graphData, { physics: false });
        })
        .catch(function (error) {
            console.log(error);
        });
});
