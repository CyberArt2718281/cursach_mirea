const mongoose = require('mongoose')
const Event = require('./models/Event')
const Registration = require('./models/Registration')
const User = require('./models/User')
require('dotenv').config()

// Подключение к MongoDB
mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log('✅ Подключено к MongoDB'))
	.catch(err => {
		console.error('❌ Ошибка подключения к MongoDB:', err)
		process.exit(1)
	})

// Данные для заполнения
const seedData = async () => {
	try {
		console.log('🗑️  Очистка существующих данных...')

		// Очищаем коллекции (опционально - закомментируйте если не нужно)
		// await Event.deleteMany({});
		// await Registration.deleteMany({});
		// await User.deleteMany({});

		console.log('👤 Создание пользователей...')

		// Создаем администратора
		const admin = await User.findOne({ email: 'artem2006pax@mail.ru' })
		let adminId

		if (!admin) {
			const newAdmin = new User({
				username: 'artem',
				email: 'artem2006pax@mail.ru',
				password: 'Art100306Mar!',
				role: 'admin',
				profile: {
					firstName: 'Артем',
					lastName: 'Администратор',
				},
			})
			await newAdmin.save()
			adminId = newAdmin._id
			console.log('✅ Администратор создан')
		} else {
			adminId = admin._id
			console.log('ℹ️  Администратор уже существует')
		}

		// Создаем дополнительных пользователей
		const users = [
			{
				username: 'organizer1',
				email: 'organizer1@example.com',
				password: 'password123',
				role: 'organizer',
				profile: {
					firstName: 'Иван',
					lastName: 'Организатор',
					organization: 'Event Pro',
					position: 'Менеджер',
				},
			},
			{
				username: 'user1',
				email: 'user1@example.com',
				password: 'password123',
				role: 'user',
				profile: {
					firstName: 'Мария',
					lastName: 'Участник',
				},
			},
		]

		for (const userData of users) {
			const existingUser = await User.findOne({ email: userData.email })
			if (!existingUser) {
				const user = new User(userData)
				await user.save()
				console.log(`✅ Пользователь ${userData.username} создан`)
			}
		}

		console.log('📅 Создание событий...')

		// Создаем события
		const events = [
			{
				title: 'Конференция по веб-разработке 2025',
				description:
					'Ежегодная конференция для веб-разработчиков. Обсудим последние тренды в JavaScript, TypeScript, фреймворках и инструментах разработки. Выступления экспертов, практические мастер-классы и нетворкинг.',
				date: new Date('2025-12-15T10:00:00'),
				endDate: new Date('2025-12-15T18:00:00'),
				location: 'Москва, Конгресс-центр "Технополис"',
				category: 'конференция',
				capacity: 200,
				availableSeats: 200,
				price: 5000,
				imageUrl:
					'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
				status: 'активное',
				organizer: {
					name: 'TechEvents Russia',
					email: 'info@techevents.ru',
					phone: '+7 (495) 123-45-67',
				},
				registrationDeadline: new Date('2025-12-10T23:59:59'),
				tags: [
					'javascript',
					'веб-разработка',
					'программирование',
					'технологии',
				],
				createdBy: adminId,
			},
			{
				title: 'Мастер-класс по Angular и TypeScript',
				description:
					'Углубленный мастер-класс для разработчиков, желающих освоить Angular 14+. Рассмотрим создание компонентов, работу с формами, роутинг, HTTP-запросы, RxJS и лучшие практики разработки.',
				date: new Date('2025-11-25T14:00:00'),
				endDate: new Date('2025-11-25T17:00:00'),
				location: 'Онлайн (Zoom)',
				category: 'мастер-класс',
				capacity: 50,
				availableSeats: 50,
				price: 2500,
				imageUrl:
					'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
				status: 'активное',
				organizer: {
					name: 'Angular Academy',
					email: 'academy@angular-pro.ru',
					phone: '+7 (495) 234-56-78',
				},
				registrationDeadline: new Date('2025-11-23T23:59:59'),
				tags: ['angular', 'typescript', 'frontend', 'обучение'],
				createdBy: adminId,
			},
			{
				title: 'Вебинар: MongoDB для начинающих',
				description:
					'Бесплатный вебинар для тех, кто хочет начать работать с MongoDB. Основы NoSQL, установка, базовые операции CRUD, индексы, агрегация и интеграция с Node.js.',
				date: new Date('2025-11-28T19:00:00'),
				endDate: new Date('2025-11-28T21:00:00'),
				location: 'Онлайн (YouTube Live)',
				category: 'вебинар',
				capacity: 500,
				availableSeats: 500,
				price: 0,
				imageUrl:
					'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
				status: 'активное',
				organizer: {
					name: 'Database School',
					email: 'info@dbschool.ru',
					phone: '+7 (495) 345-67-89',
				},
				registrationDeadline: new Date('2025-11-27T23:59:59'),
				tags: ['mongodb', 'база данных', 'nosql', 'backend'],
				createdBy: adminId,
			},
			{
				title: 'Хакатон: Создай свое приложение за 48 часов',
				description:
					'Двухдневный хакатон для разработчиков всех уровней. Команды работают над реальными проектами, менторская поддержка, призы для победителей. Приветствуются идеи в сфере EdTech, FinTech и GreenTech.',
				date: new Date('2025-12-05T10:00:00'),
				endDate: new Date('2025-12-07T18:00:00'),
				location: 'Санкт-Петербург, IT-Park "Ингрия"',
				category: 'другое',
				capacity: 100,
				availableSeats: 100,
				price: 1000,
				imageUrl:
					'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
				status: 'активное',
				organizer: {
					name: 'HackHub',
					email: 'hackhub@events.ru',
					phone: '+7 (812) 456-78-90',
				},
				registrationDeadline: new Date('2025-12-01T23:59:59'),
				tags: [
					'хакатон',
					'программирование',
					'соревнование',
					'командная работа',
				],
				createdBy: adminId,
			},
			{
				title: 'Семинар: Node.js и Express - создание API',
				description:
					'Практический семинар по созданию RESTful API с использованием Node.js и Express. Рассмотрим архитектуру, middleware, работу с базами данных, аутентификацию и тестирование.',
				date: new Date('2025-12-20T15:00:00'),
				endDate: new Date('2025-12-20T18:00:00'),
				location: 'Москва, Офис Mail.ru Group',
				category: 'семинар',
				capacity: 30,
				availableSeats: 30,
				price: 3000,
				imageUrl:
					'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
				status: 'активное',
				organizer: {
					name: 'Backend Masters',
					email: 'masters@backend.ru',
					phone: '+7 (495) 567-89-01',
				},
				registrationDeadline: new Date('2025-12-18T23:59:59'),
				tags: ['nodejs', 'express', 'api', 'backend'],
				createdBy: adminId,
			},
			{
				title: 'IT-Meetup: Карьера в разработке',
				description:
					'Неформальная встреча разработчиков для обсуждения карьерных вопросов. Как искать работу, проходить собеседования, договариваться о зарплате. Участие HR-специалистов и опытных разработчиков.',
				date: new Date('2025-11-30T18:30:00'),
				endDate: new Date('2025-11-30T21:00:00'),
				location: 'Москва, Антикафе "Циферблат"',
				category: 'другое',
				capacity: 40,
				availableSeats: 40,
				price: 0,
				imageUrl:
					'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
				status: 'активное',
				organizer: {
					name: 'IT Community Moscow',
					email: 'community@it-moscow.ru',
					phone: '+7 (495) 678-90-12',
				},
				tags: ['карьера', 'нетворкинг', 'hr', 'собеседования'],
				createdBy: adminId,
			},
			{
				title: 'Выставка современных технологий TechExpo 2025',
				description:
					'Крупнейшая выставка технологических решений. Более 200 компаний-участников представят свои продукты: от стартапов до корпораций. AI, IoT, Blockchain, VR/AR и многое другое.',
				date: new Date('2025-12-10T09:00:00'),
				endDate: new Date('2025-12-12T20:00:00'),
				location: 'Москва, Экспоцентр на Красной Пресне',
				category: 'выставка',
				capacity: 5000,
				availableSeats: 5000,
				price: 0,
				imageUrl:
					'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
				status: 'активное',
				organizer: {
					name: 'TechExpo International',
					email: 'info@techexpo.ru',
					phone: '+7 (495) 789-01-23',
				},
				registrationDeadline: new Date('2025-12-08T23:59:59'),
				tags: ['выставка', 'технологии', 'инновации', 'бизнес'],
				createdBy: adminId,
			},
			{
				title: 'Концерт: Музыка и код - творческий вечер',
				description:
					'Уникальное мероприятие на стыке музыки и технологий. Live coding музыки, выступления диджеев-программистов, демонстрация аудио-визуальных инсталляций, созданных с помощью кода.',
				date: new Date('2025-12-08T20:00:00'),
				endDate: new Date('2025-12-08T23:30:00'),
				location: 'Москва, Клуб "Космонавт"',
				category: 'концерт',
				capacity: 150,
				availableSeats: 150,
				price: 1500,
				imageUrl:
					'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
				status: 'активное',
				organizer: {
					name: 'Creative Tech Events',
					email: 'creative@tech-events.ru',
					phone: '+7 (495) 890-12-34',
				},
				registrationDeadline: new Date('2025-12-07T23:59:59'),
				tags: ['музыка', 'creative coding', 'искусство', 'развлечения'],
				createdBy: adminId,
			},
			{
				title: 'Завершено: Прошлая конференция DevOps 2025',
				description:
					'Конференция прошла успешно. Более 300 участников, 15 докладов по CI/CD, Kubernetes, Docker и облачным технологиям.',
				date: new Date('2025-11-10T10:00:00'),
				endDate: new Date('2025-11-10T18:00:00'),
				location: 'Москва, Digital October',
				category: 'конференция',
				capacity: 300,
				availableSeats: 0,
				price: 4000,
				status: 'завершено',
				organizer: {
					name: 'DevOps Community',
					email: 'devops@community.ru',
					phone: '+7 (495) 901-23-45',
				},
				tags: ['devops', 'kubernetes', 'docker', 'ci-cd'],
				createdBy: adminId,
			},
		]

		const createdEvents = []
		for (const eventData of events) {
			const event = new Event(eventData)
			await event.save()
			createdEvents.push(event)
			console.log(`✅ Событие создано: ${event.title}`)
		}

		console.log('📝 Создание регистраций...')

		// Создаем тестовые регистрации для нескольких событий
		const participants = [
			{
				firstName: 'Алексей',
				lastName: 'Иванов',
				email: 'alexey.ivanov@example.com',
				phone: '+7 (915) 123-45-67',
				organization: 'Яндекс',
				position: 'Senior Developer',
			},
			{
				firstName: 'Екатерина',
				lastName: 'Петрова',
				email: 'ekaterina.petrova@example.com',
				phone: '+7 (916) 234-56-78',
				organization: 'Сбербанк',
				position: 'Frontend Developer',
			},
			{
				firstName: 'Дмитрий',
				lastName: 'Смирнов',
				email: 'dmitry.smirnov@example.com',
				phone: '+7 (917) 345-67-89',
				organization: 'Mail.ru',
				position: 'Fullstack Developer',
			},
			{
				firstName: 'Анна',
				lastName: 'Козлова',
				email: 'anna.kozlova@example.com',
				phone: '+7 (918) 456-78-90',
				organization: 'Tinkoff',
				position: 'Backend Developer',
			},
			{
				firstName: 'Михаил',
				lastName: 'Новиков',
				email: 'mikhail.novikov@example.com',
				phone: '+7 (919) 567-89-01',
				organization: 'VK',
				position: 'Team Lead',
			},
		]

		// Регистрируем участников на первые 3 активных события
		for (let i = 0; i < Math.min(3, createdEvents.length); i++) {
			const event = createdEvents[i]
			if (event.status === 'активное') {
				for (const participant of participants) {
					const registration = new Registration({
						event: event._id,
						participant: participant,
						status: 'подтверждена',
						paymentStatus: event.price > 0 ? 'оплачено' : 'не оплачено',
						attended: false,
					})
					await registration.save()

					// Уменьшаем доступные места
					event.availableSeats -= 1
					await event.save()
				}
				console.log(`✅ Регистрации созданы для события: ${event.title}`)
			}
		}

		console.log('\n🎉 Миграция завершена успешно!')
		console.log('\n📊 Статистика:')
		console.log(`   - Пользователей: ${await User.countDocuments()}`)
		console.log(`   - Событий: ${await Event.countDocuments()}`)
		console.log(`   - Регистраций: ${await Registration.countDocuments()}`)

		process.exit(0)
	} catch (error) {
		console.error('❌ Ошибка при заполнении данных:', error)
		process.exit(1)
	}
}

// Запуск миграции
seedData()
