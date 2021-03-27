import SignJWT from 'jose/jwt/sign'
app.get("/oauth", function (req, res) {
    const jwt = await new SignJWT({ 'urn:example:claim': true })
    var client = getClient(req.query.client_id);
    if (!client) {
        res.render('error', { error: 'Unknown client' });
        return;
    }
    let redirect_uri = Array.isArray(client.redirect_uris) &&
        client.redirect_uris.find(uri => uri === req.query.redirect_uri);
    if (!redirect_uri) {
        res.render('error', { error: 'Invalid redirect URI' });
        return;
    }

});