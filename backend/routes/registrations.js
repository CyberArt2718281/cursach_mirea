const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { sendRegistrationEmail } = require('../utils/emailService');

// GET /api/registrations - Получить все регистрации
router.get('/', auth, async (req, res) => {
  try {
    const { eventId, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (eventId) query.event = eventId;
    if (status) query.status = status;

    const registrations = await Registration.find(query)
      .populate('event', 'title date location')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Registration.countDocuments(query);

    res.json({
      registrations,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении регистраций:', error);
    res.status(500).json({ error: 'Ошибка при получении регистраций' });
  }
});

// GET /api/registrations/:id - Получить регистрацию по ID
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event');
    
    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Ошибка при получении регистрации:', error);
    res.status(500).json({ error: 'Ошибка при получении регистрации' });
  }
});

// GET /api/registrations/number/:registrationNumber - Получить по номеру
router.get('/number/:registrationNumber', async (req, res) => {
  try {
    const registration = await Registration.findOne({ 
      registrationNumber: req.params.registrationNumber 
    }).populate('event');
    
    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Ошибка при получении регистрации:', error);
    res.status(500).json({ error: 'Ошибка при получении регистрации' });
  }
});

// POST /api/registrations - Создать регистрацию
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/registrations - тело запроса:', JSON.stringify(req.body, null, 2));
    const { eventId, participant } = req.body;

    // Проверяем существование события
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    // Проверяем доступность мест
    if (event.availableSeats <= 0) {
      return res.status(400).json({ error: 'Нет доступных мест' });
    }

    // Проверяем дедлайн регистрации
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ error: 'Регистрация закрыта' });
    }

    // Проверяем, не зарегистрирован ли уже этот email на событие
    const existingRegistration = await Registration.findOne({
      event: eventId,
      'participant.email': participant.email,
      status: { $ne: 'отменена' }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Вы уже зарегистрированы на это событие' });
    }

    // Создаем регистрацию
    const registration = new Registration({
      event: eventId,
      participant
    });

    await registration.save();

    // Уменьшаем количество доступных мест
    event.availableSeats -= 1;
    await event.save();

    // Получаем полную информацию для email
    const populatedRegistration = await Registration.findById(registration._id).populate('event');

    // Отправляем email с подтверждением
    try {
      await sendRegistrationEmail(populatedRegistration);
    } catch (emailError) {
      console.error('Ошибка при отправке email:', emailError);
      // Не прерываем процесс, регистрация уже создана
    }

    res.status(201).json(populatedRegistration);
  } catch (error) {
    console.error('Ошибка при создании регистрации:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Ошибка при создании регистрации' });
  }
});

// PUT /api/registrations/:id - Обновить регистрацию
router.put('/:id', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    // Обновляем поля
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'registrationNumber') {
        registration[key] = req.body[key];
      }
    });

    await registration.save();

    const updatedRegistration = await Registration.findById(registration._id).populate('event');

    res.json(updatedRegistration);
  } catch (error) {
    console.error('Ошибка при обновлении регистрации:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Ошибка валидации', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Ошибка при обновлении регистрации' });
  }
});

// PATCH /api/registrations/:id/attend - Отметить посещение
router.patch('/:id/attend', auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    if (registration.status !== 'подтверждена') {
      return res.status(400).json({ error: 'Можно отметить только подтвержденные регистрации' });
    }

    registration.attended = true;
    registration.attendedAt = new Date();
    await registration.save();

    const updatedRegistration = await Registration.findById(registration._id).populate('event');

    res.json(updatedRegistration);
  } catch (error) {
    console.error('Ошибка при отметке посещения:', error);
    res.status(500).json({ error: 'Ошибка при отметке посещения' });
  }
});

// DELETE /api/registrations/:id - Отменить регистрацию
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ error: 'Регистрация не найдена' });
    }

    const event = await Event.findById(registration.event);
    
    if (registration.status === 'подтверждена' && event) {
      // Возвращаем место
      event.availableSeats += 1;
      await event.save();
    }

    registration.status = 'отменена';
    await registration.save();

    res.json({ message: 'Регистрация отменена', registration });
  } catch (error) {
    console.error('Ошибка при отмене регистрации:', error);
    res.status(500).json({ error: 'Ошибка при отмене регистрации' });
  }
});

module.exports = router;
