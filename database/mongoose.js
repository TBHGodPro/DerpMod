const mongoose = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: false,
            connectTimeoutMS:10000,
            family:4
        };

        mongoose.connect(process.env["MONGO_URL"], dbOptions);
				mongoose.set('useFindAndModify', false);
        mongoose.Promise = global.Promise

        mongoose.connection.on('connected', () => {console.log('Database Connected!')});

        mongoose.connection.on('err', err => {console.error(`Database Connection Error: ${err.stack}`)});

        mongoose.connection.on('disconnected', () => {console.warn('Database Connection Lost')})
    }
}