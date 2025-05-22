document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        contact: document.getElementById('contact').value,
        notes: document.getElementById('notes').value,
        interest: Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value),
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Vielen Dank für Dein Eintrag!');
            e.target.reset();
        } else {
            alert('Es gab einen Fehler. Bitte versuche es später erneut.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Es gab einen Fehler. Bitte versuche es später erneut.');
    }
}); 