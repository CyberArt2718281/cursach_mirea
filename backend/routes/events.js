const express = require('express')
const router = express.Router()
const Event = require('../models/Event')
const Registration = require('../models/Registration')
const { auth, adminAuth } = require('../middleware/auth')

// GET /api/events - Получить все события
router.get('/', async (req, res) => {
	try {
		const {
			category,
			status,
			search,
			sort = '-date',
			page = 1,
			limit = 10,
		} = req.query

		const query = {}

		if (category) query.category = category
		if (status) query.status = status
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			]
		}

		const events = await Event.find(query)
			.sort(sort)
			.limit(limit * 1)
			.skip((page - 1) * limit)

		const count = await Event.countDocuments(query)

		res.json({
			events,
			pagination: {
				total: count,
				pages: Math.ceil(count / limit),
				currentPage: parseInt(page),
				limit: parseInt(limit),
			},
		})
	} catch (error) {
		console.error('Ошибка при получении событий:', error)
		res.status(500).json({ error: 'Ошибка при получении событий' })
	}
})

// GET /api/events/:id - Получить событие по ID
router.get('/:id', async (req, res) => {
	try {
		const event = await Event.findById(req.params.id)

		if (!event) {
			return res.status(404).json({ error: 'Событие не найдено' })
		}

		res.json(event)
	} catch (error) {
		console.error('Ошибка при получении события:', error)
		res.status(500).json({ error: 'Ошибка при получении события' })
	}
})

// POST /api/events - Создать событие (требуется аутентификация)
router.post('/', auth, async (req, res) => {
	try {
		const eventData = {
			...req.body,
			availableSeats: req.body.capacity,
		}

		const event = new Event(eventData)
		await event.save()

		res.status(201).json(event)
	} catch (error) {
		console.error('Ошибка при создании события:', error)

		if (error.name === 'ValidationError') {
			return res.status(400).json({
				error: 'Ошибка валидации',
				details: Object.values(error.errors).map(err => err.message),
			})
		}

		res.status(500).json({ error: 'Ошибка при создании события' })
	}
})

// PUT /api/events/:id - Обновить событие (требуется аутентификация)
router.put('/:id', auth, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id)

		if (!event) {
			return res.status(404).json({ error: 'Событие не найдено' })
		}

		// Обновляем поля
		Object.keys(req.body).forEach(key => {
			if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
				event[key] = req.body[key]
			}
		})

		await event.save()

		res.json(event)
	} catch (error) {
		console.error('Ошибка при обновлении события:', error)

		if (error.name === 'ValidationError') {
			return res.status(400).json({
				error: 'Ошибка валидации',
				details: Object.values(error.errors).map(err => err.message),
			})
		}

		res.status(500).json({ error: 'Ошибка при обновлении события' })
	}
})

// DELETE /api/events/:id - Удалить событие (требуется аутентификация)
router.delete('/:id', auth, async (req, res) => {
	try {
		const { force } = req.query // Параметр для принудительного удаления

		const event = await Event.findById(req.params.id)

		if (!event) {
			return res.status(404).json({ error: 'Событие не найдено' })
		}

		// Проверяем, есть ли регистрации на это событие
		const registrations = await Registration.find({
			event: req.params.id,
		})

		const activeRegistrations = registrations.filter(
			r => r.status === 'подтверждена'
		)

		// Если есть активные регистрации и не указан force, предупреждаем
		if (activeRegistrations.length > 0 && force !== 'true') {
			return res.status(400).json({
				error: 'У этого события есть активные регистрации',
				registrationsCount: activeRegistrations.length,
				needsConfirmation: true,
			})
		}

		// Удаляем все регистрации на это событие
		if (registrations.length > 0) {
			await Registration.deleteMany({ event: req.params.id })
			console.log(
				`🗑️ Удалено ${registrations.length} регистраций для события ${event.title}`
			)
		}

		// Удаляем событие
		await Event.findByIdAndDelete(req.params.id)

		console.log(`✅ Событие "${event.title}" успешно удалено`)

		res.json({
			message: 'Событие успешно удалено',
			deletedRegistrations: registrations.length,
		})
	} catch (error) {
		console.error('Ошибка при удалении события:', error)
		res.status(500).json({ error: 'Ошибка при удалении события' })
	}
})

// GET /api/events/:id/stats - Получить статистику по событию
router.get('/:id/stats', auth, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id)

		if (!event) {
			return res.status(404).json({ error: 'Событие не найдено' })
		}

		const registrations = await Registration.find({ event: req.params.id })

		const stats = {
			totalRegistrations: registrations.length,
			confirmedRegistrations: registrations.filter(
				r => r.status === 'подтверждена'
			).length,
			pendingRegistrations: registrations.filter(r => r.status === 'ожидание')
				.length,
			cancelledRegistrations: registrations.filter(r => r.status === 'отменена')
				.length,
			attendedCount: registrations.filter(r => r.attended).length,
			availableSeats: event.availableSeats,
			capacity: event.capacity,
			occupancyRate: (
				(registrations.filter(r => r.status === 'подтверждена').length /
					event.capacity) *
				100
			).toFixed(2),
		}

		res.json(stats)
	} catch (error) {
		console.error('Ошибка при получении статистики:', error)
		res.status(500).json({ error: 'Ошибка при получении статистики' })
	}
})

module.exports = router
