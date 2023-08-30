const { Schema, model } = require(`mongoose`);

const teaSchema = new Schema({
	auroraID: {
		type: Number, 
		required: true,
		unique: true
	},
	total: {
		type: Number, 
		required: true
	},
	username: {
		type: String,
		required: true
	},
	attempt: {
		type: Number,
		required: true
	},
	untilDate: {
		type: Number,
		required: true
	}
});

const Tea = model('tea', teaSchema, 'teaList');


module.exports = Tea;