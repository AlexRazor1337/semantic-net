document.getElementById('build').addEventListener('click', function (e) {
    const input = document.getElementById('text-input').value;
    fetch('/build', { method: 'POST', body: JSON.stringify( { input }), headers: { 'Content-Type': 'application/json' } })
        .then(function (response) {
            if (response.ok) {
                console.log(response.body);
                return;
            }

            throw new Error('Request failed.');
        })
        .catch(function (error) {
            console.log(error);
        });
});
