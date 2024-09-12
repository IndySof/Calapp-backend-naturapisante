require('dotenv').config(); // Charger les variables d'environnement

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

module.exports = async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Vous devriez stocker les tokens obtenus de manière sécurisée
    res.send('Authentification réussie, tokens obtenus');
};
