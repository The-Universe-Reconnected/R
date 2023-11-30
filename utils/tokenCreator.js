import jwt from 'jsonwebtoken';

const tokenCreator = (_id, tokens = []) => {
    const token = jwt.sign({_id}, 'myNameIsDeveloperN00b');
    tokens.push(token);
    return tokens;
}

export default tokenCreator;