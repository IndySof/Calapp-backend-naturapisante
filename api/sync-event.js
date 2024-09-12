require('dotenv').config(); // Charger les variables d'environnement
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Initialisation de Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

module.exports = async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        return res.status(401).send('Token Firebase manquant');
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;

        const { title, location, description, startDateTime, endDateTime } = req.body;

        oauth2Client.setCredentials({
            access_token: process.env.ACCESS_TOKEN,
            refresh_token: process.env.REFRESH_TOKEN,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: title,
            location: location,
            description: description,
            start: {
                dateTime: startDateTime,
                timeZone: 'Europe/Paris',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'Europe/Paris',
            },
        };

        const eventResponse = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.status(200).send(`Événement créé avec succès : ${eventResponse.data.htmlLink}`);
    } catch (error) {
        res.status(500).send('Erreur lors de la création de l\'événement : ' + error.message);
    }
};
