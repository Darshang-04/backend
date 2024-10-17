const jwt = require('jsonwebtoken')
const { jwt_secret } = require('../key');  // Your secret key for JWT

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log(authHeader)
    
    if (!authHeader) {
        console.log('Authorization header is missing');
        return res.status(403).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(" ")[1];  // Expecting token in the format: Bearer <token>

    if (!token) {
        console.log('Authorization token is missing');
        return res.status(403).json({ error: 'Authorization token is missing' });
    }

    try {
        const verified = jwt.verify(token, jwt_secret);
        req.user = verified;  // Attach the decoded token (user id) to the request object
        // console.log('Token verified successfully:', verified);
        next();  // Proceed to the next middleware or the route handler
    } catch (err) {
        console.log('Invalid or expired token');
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
