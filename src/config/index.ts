module.exports = {
    "expressPort": process.env.PORT || 3000,
    facebook: require('./facebook'),
    db: require('./db')
}