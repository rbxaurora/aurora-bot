<<<<<<< HEAD
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


=======
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


>>>>>>> 7fe6d55ff2fa1ca38214a0bc947977f95de2e5b1
module.exports = User;