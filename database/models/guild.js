const mongoose = require('mongoose')

const guildSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,

    'id': {
      type: String,
      required: true,
      unique: true,
    },
    'name': {
      type: String,
      required: true,
    },
    'icon': {
      type: String,
      required: true,
    },

    'settings': {
      type: Object,
      required: true,
    }
    
})

module.exports = mongoose.model('Guilds', guildSchema, 'guilds')