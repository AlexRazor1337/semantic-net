document.getElementById('build').addEventListener('click', function (e) {
    fetch('/build', { method: 'POST' })
        .then(function (response) {
            if (response.ok) {
                console.log('Click was recorded');
                return;
            }

            throw new Error('Request failed.');
        })
        .catch(function (error) {
            console.log(error);
        });
});
