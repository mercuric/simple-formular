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

        const messageContainer = document.getElementById('message-container');

        if (response.ok) {
            messageContainer.textContent = 'Vielen Dank für Dein Eintrag!';
            messageContainer.className = 'show success';
            e.target.reset();
        } else {
            messageContainer.textContent = 'Es gab einen Fehler. Bitte versuche es später erneut.';
            messageContainer.className = 'show error';
        }

        setTimeout(() => {
            messageContainer.className = '';
            if (response.ok) {
                e.target.reset();
            }
        }, 3000);

    } catch (error) {
        console.error('Error:', error);
        const messageContainer = document.getElementById('message-container');
        messageContainer.textContent = 'Es gab einen Fehler. Bitte versuche es später erneut.';
        messageContainer.className = 'show error';
        
        setTimeout(() => {
            messageContainer.className = '';
        }, 3000);
    }
}); 