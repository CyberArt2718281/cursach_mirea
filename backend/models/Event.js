const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Название события обязательно'],
			trim: true,
			maxlength: [200, 'Название не может превышать 200 символов'],
		},
		description: {
			type: String,
			required: [true, 'Описание события обязательно'],
			maxlength: [2000, 'Описание не может превышать 2000 символов'],
		},
		date: {
			type: Date,
			required: [true, 'Дата события обязательна'],
		},
		endDate: {
			type: Date,
		},
		location: {
			type: String,
			required: [true, 'Место проведения обязательно'],
			maxlength: [300, 'Место проведения не может превышать 300 символов'],
		},
		category: {
			type: String,
			enum: [
				'конференция',
				'семинар',
				'вебинар',
				'мастер-класс',
				'выставка',
				'концерт',
				'спорт',
				'другое',
			],
			default: 'другое',
		},
		capacity: {
			type: Number,
			required: [true, 'Вместимость обязательна'],
			min: [1, 'Вместимость должна быть больше 0'],
		},
		availableSeats: {
			type: Number,
			required: true,
		},
		price: {
			type: Number,
			default: 0,
			min: [0, 'Цена не может быть отрицательной'],
		},
		imageUrl: {
			type: String,
			default: '',
		},
		status: {
			type: String,
			enum: ['активное', 'отменено', 'завершено', 'черновик'],
			default: 'активное',
		},
		organizer: {
			name: {
				type: String,
				required: true,
			},
			email: {
				type: String,
				required: true,
			},
			phone: String,
		},
		registrationDeadline: {
			type: Date,
		},
		tags: [
			{
				type: String,
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
)

// Индексы для оптимизации поиска
eventSchema.index({ date: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ status: 1 })
eventSchema.index({ title: 'text', description: 'text' })

// Виртуальное поле для подсчета зарегистрированных участников
eventSchema.virtual('registeredCount', {
	ref: 'Registration',
	localField: '_id',
	foreignField: 'event',
	count: true,
})

// Метод для проверки доступности мест
eventSchema.methods.hasAvailableSeats = function () {
	return this.availableSeats > 0
}

// Метод для уменьшения доступных мест
eventSchema.methods.decrementSeats = function () {
	if (this.availableSeats > 0) {
		this.availableSeats -= 1
		return this.save()
	}
	throw new Error('Нет доступных мест')
}

// Метод для увеличения доступных мест (при отмене регистрации)
eventSchema.methods.incrementSeats = function () {
	if (this.availableSeats < this.capacity) {
		this.availableSeats += 1
		return this.save()
	}
	return this.save()
}

module.exports = mongoose.model('Event', eventSchema)
