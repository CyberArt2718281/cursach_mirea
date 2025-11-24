const mongoose = require('mongoose')

const registrationSchema = new mongoose.Schema(
	{
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
			required: [true, 'ID события обязательно'],
		},
		participant: {
			firstName: {
				type: String,
				required: [true, 'Имя обязательно'],
				trim: true,
				maxlength: [50, 'Имя не может превышать 50 символов'],
			},
			lastName: {
				type: String,
				required: [true, 'Фамилия обязательна'],
				trim: true,
				maxlength: [50, 'Фамилия не может превышать 50 символов'],
			},
			email: {
				type: String,
				required: [true, 'Email обязателен'],
				lowercase: true,
				trim: true,
				match: [/^\S+@\S+\.\S+$/, 'Неверный формат email'],
			},
			phone: {
				type: String,
				required: [true, 'Телефон обязателен'],
				trim: true,
			},
			organization: {
				type: String,
				trim: true,
				maxlength: [
					200,
					'Название организации не может превышать 200 символов',
				],
			},
			position: {
				type: String,
				trim: true,
				maxlength: [100, 'Должность не может превышать 100 символов'],
			},
		},
		status: {
			type: String,
			enum: ['подтверждена', 'ожидание', 'отменена'],
			default: 'подтверждена',
		},
		registrationNumber: {
			type: String,
			unique: true,
		},
		paymentStatus: {
			type: String,
			enum: ['оплачено', 'не оплачено', 'возвращено'],
			default: 'не оплачено',
		},
		notes: {
			type: String,
			maxlength: [500, 'Примечания не могут превышать 500 символов'],
		},
		attended: {
			type: Boolean,
			default: false,
		},
		attendedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
)

// Составной индекс для предотвращения дублирования регистраций
registrationSchema.index({ event: 1, 'participant.email': 1 }, { unique: true })

// Индексы для оптимизации поиска
registrationSchema.index({ status: 1 })

// Генерация номера регистрации перед сохранением
registrationSchema.pre('save', async function (next) {
	if (!this.registrationNumber) {
		const count = await mongoose.model('Registration').countDocuments()
		this.registrationNumber = `REG${Date.now()}${count + 1}`
	}
	next()
})

// Метод для подтверждения посещения
registrationSchema.methods.markAsAttended = function () {
	this.attended = true
	this.attendedAt = new Date()
	return this.save()
}

module.exports = mongoose.model('Registration', registrationSchema)
