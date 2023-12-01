import jwt from 'jsonwebtoken';

const tokenCreator = (_id, tokens = []) => {
    // const token = jwt.sign({_id}, 'myNameIsDeveloperN00b');
    const token = jwt.sign({_id}, process.env.JWT_SECRET);
    tokens.push(token);
    return tokens;
}

export default tokenCreator;