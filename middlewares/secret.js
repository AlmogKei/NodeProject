require('dotenv').config()
exports.config = {
    tokenSecret: process.env.TOKEN_SECRET,
    db_pass: "",
    db_user: "",
    db_url: ""
}