const { Schema, model } = require(`mongoose`);

const userSchema = new Schema ({
	auroraID: {
		type: Number,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true,
		default: "USER" 
	},
	warns: {
		type: Object
	},
	isAdmin: Boolean,
	birthday: 'String'
});

const User = model('user', userSchema);


module.exports = User;