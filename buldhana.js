document.getElementById('submit-to-google-sheet').addEventListener('submit', function(event) {
    event.preventDefault();

    alert('Submitting your data...');

    const formData = new FormData(this);
    const fileInputNames = [
        'मृत्यू_प्रमाण_पत्र', 'उत्पन्न_दाखला', 'रेशन_कार्ड', 'शाळेचे_बोनाफाईड',
        'बँक_पासबुक_प्रत', 'रहिवासी_दाखला', 'पालकाचे_आधार_कार्ड', 'बालकांचे_आधार_कार्ड',
        'स्वयम्_घोषणा_पत्र', 'बालकाचा_फोटो', 'घरा_समोरचा_फोटो', 'सामाजिक_तपासणी_अहवाल'
    ];

    const uploadPromises = fileInputNames.map(name => {
        const fileInput = document.querySelector(`input[name="${name}"]`);
        const file = fileInput.files[0];
        if (file) {
            const storageRef = storage.ref(`files/${file.name}`);
            return storageRef.put(file).then(snapshot => {
                return snapshot.ref.getDownloadURL();
            });
        }
        return Promise.resolve(null);
    });

    Promise.all(uploadPromises).then(urls => {
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        fileInputNames.forEach((name, index) => {
            const url = urls[index];
            if (url) {
                data[name] = url;
            }
        });

        const dbRef = database.ref('submissions');
        dbRef.push(data).then(() => {
            alert('Data submitted successfully!');
            document.getElementById('submit-to-google-sheet').reset();
            displayPDFs();
        }).catch(error => {
            alert('Error submitting data: ' + error.message);
            console.error('Error submitting data:', error);
        });
    }).catch(error => {
        alert('Error uploading files: ' + error.message);
        console.error('Error uploading files:', error);
    });
});

function displayPDFs() {
    const dbRef = database.ref('submissions');
    dbRef.on('value', snapshot => {
        const submissions = snapshot.val();
        const container = document.getElementById('pdf-container');
        container.innerHTML = '';

        Object.keys(submissions).forEach(key => {
            const data = submissions[key];
            Object.keys(data).forEach(field => {
                if (field.includes('PDF')) {
                    const iframe = document.createElement('iframe');
                    iframe.src = data[field];
                    iframe.width = '600';
                    iframe.height = '500';
                    container.appendChild(iframe);
                }
            });
        });
    });
}

window.onload = displayPDFs;
