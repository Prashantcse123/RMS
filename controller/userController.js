var mongoose=require('mongoose');
var bcrypt=require('bcryptjs')


async function validateUser(password,hash){
    return bcrypt.compareSync(password,hash);
}