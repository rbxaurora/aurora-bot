const { Schema, model } = require(`mongoose`);

const messageSchema = new Schema({
	message_id: {
		type: Number,
		required: true
	},
	text: String,
	entities: [Object]
}, { timestamps: true });

const Msg = model('message', messageSchema, 'msgCookie');


module.exports = Msg;