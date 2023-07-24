const { Schema, model } = require('mongoose');

const adminSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	auroraID: {
		type: Number,
		required: true,
		unique: true
	},
	role: {
		type: String,
		required: true
	}
});

const Admin = model('admin', adminSchema, 'adminList');


module.exports = Admin;