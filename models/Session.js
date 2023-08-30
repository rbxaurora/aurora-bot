const { Schema, model } = require(`mongoose`);

const sessionSchema = new Schema({
	key: {
		type: String,
		required: true
	},
	session: {
		type: Object,
		required: true
	}
});

const Session = model('session', sessionSchema, 'telegraf-sessions');


module.exports = Session;