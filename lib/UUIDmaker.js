import crypto from 'crypto';

export function makeUUID()
{
    //console.log(crypto.randomBytes(20).toString('hex'));
    return crypto.randomBytes(20).toString('hex');
}

makeUUID();