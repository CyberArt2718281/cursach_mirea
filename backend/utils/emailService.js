const nodemailer = require('nodemailer')
const QRCode = require('qrcode')

// Создаем транспортер для отправки email
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: parseInt(process.env.EMAIL_PORT),
	secure: process.env.EMAIL_PORT === '465', // true для 465, false для других портов
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
})

// Проверяем подключение
transporter.verify(function (error, success) {
	if (error) {
		console.log('❌ Ошибка настройки email:', error)
	} else {
		console.log('✅ Email сервер готов к отправке писем')
	}
})

/**
 * Отправка email подтверждения регистрации
 */
async function sendRegistrationConfirmation(
	email,
	username,
	confirmationToken
) {
	const confirmationUrl = `${
		process.env.FRONTEND_URL || 'http://localhost:4200'
	}/confirm-email?token=${confirmationToken}`

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: '✅ Подтвердите ваш email - Платформа Событий',
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Добро пожаловать!</h1>
          </div>
          <div class="content">
            <h2>Здравствуйте, ${username}!</h2>
            <p>Спасибо за регистрацию на Платформе Событий. Для завершения регистрации, пожалуйста, подтвердите ваш email адрес.</p>
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="button">Подтвердить Email</a>
            </div>
            <p>Или скопируйте и вставьте эту ссылку в ваш браузер:</p>
            <p style="word-break: break-all; color: #8b5cf6;">${confirmationUrl}</p>
            <p><strong>Важно:</strong> Ссылка действительна в течение 24 часов.</p>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>© 2025 Платформа Событий. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      Здравствуйте, ${username}!
      
      Спасибо за регистрацию на Платформе Событий.
      
      Для подтверждения email перейдите по ссылке:
      ${confirmationUrl}
      
      Ссылка действительна в течение 24 часов.
      
      Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
    `,
	}

	try {
		const info = await transporter.sendMail(mailOptions)
		console.log('✅ Email отправлен:', info.messageId)
		return { success: true, messageId: info.messageId }
	} catch (error) {
		console.error('❌ Ошибка отправки email:', error)
		throw error
	}
}

/**
 * Отправка уведомления о регистрации на событие
 */
async function sendEventRegistrationEmail(
	email,
	username,
	event,
	registrationNumber
) {
	// Генерируем QR-код с данными регистрации
	const qrData = JSON.stringify({
		registrationNumber: registrationNumber,
		eventId: event._id,
		eventTitle: event.title,
		participantEmail: email,
		eventDate: event.date,
	})

	const qrCodeDataURL = await QRCode.toDataURL(qrData, {
		errorCorrectionLevel: 'H',
		type: 'image/png',
		width: 200,
		margin: 1,
		color: {
			dark: '#8b5cf6',
			light: '#ffffff',
		},
	})

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: email,
		subject: `🎫 Подтверждение регистрации на событие: ${event.title}`,
		html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 10px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 20px 15px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8f9fa; padding: 20px 15px; border-radius: 0 0 10px 10px; }
          .content h2 { font-size: 20px; margin-top: 0; }
          .event-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .event-details h3 { margin-top: 0; font-size: 18px; }
          .detail-row { display: block; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row strong { display: block; margin-bottom: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; padding: 10px; }
          @media only screen and (max-width: 600px) {
            .container { padding: 5px; }
            .header { padding: 15px 10px; }
            .header h1 { font-size: 20px; }
            .content { padding: 15px 10px; }
            .content h2 { font-size: 18px; }
            .event-details { padding: 10px; }
            img { max-width: 180px !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Регистрация подтверждена!</h1>
          </div>
          <div class="content">
            <h2>Здравствуйте, ${username}!</h2>
            <p>Ваша регистрация на событие успешно подтверждена.</p>
            
            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 18px; font-weight: bold; color: #8b5cf6; margin-bottom: 15px;">
                🎫 Ваш QR-код для входа
              </div>
              <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px; width: 100%; height: auto; border: 3px solid #8b5cf6; border-radius: 10px; padding: 10px; background: white; display: block; margin: 0 auto;" />
              <div style="margin-top: 15px; font-size: 14px; color: #666;">
                Номер регистрации: <strong>${registrationNumber}</strong>
              </div>
            </div>
            
            <div class="event-details">
              <h3>📅 Детали события</h3>
              <div class="detail-row">
                <strong>Название:</strong>
                <span>${event.title}</span>
              </div>
              <div class="detail-row">
                <strong>Дата:</strong>
                <span>${new Date(event.date).toLocaleString('ru-RU')}</span>
              </div>
              <div class="detail-row">
                <strong>Место:</strong>
                <span>${event.location}</span>
              </div>
              <div class="detail-row">
                <strong>Категория:</strong>
                <span>${event.category}</span>
              </div>
            </div>
            
            <p><strong>Важно:</strong> Предъявите этот QR-код на входе в событие. Вы можете показать его с телефона или распечатать.</p>
            
            <p>Мы ждем вас на мероприятии! До встречи! 🎉</p>
          </div>
          <div class="footer">
            <p>© 2025 Платформа Событий. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
		text: `
      Здравствуйте, ${username}!
      
      Ваша регистрация на событие успешно подтверждена.
      
      🎫 Номер регистрации: ${registrationNumber}
      
      Детали события:
      - Название: ${event.title}
      - Дата: ${new Date(event.date).toLocaleString('ru-RU')}
      - Место: ${event.location}
      - Категория: ${event.category}
      
      В HTML версии письма содержится QR-код для быстрого входа на событие.
      Предъявите QR-код или номер регистрации на входе.
      
      До встречи на мероприятии!
    `,
	}

	try {
		const info = await transporter.sendMail(mailOptions)
		console.log('✅ Email отправлен:', info.messageId)
		return { success: true, messageId: info.messageId }
	} catch (error) {
		console.error('❌ Ошибка отправки email:', error)
		throw error
	}
}

/**
 * Обёртка для отправки email при регистрации на событие
 * Принимает объект регистрации с populated event
 */
async function sendRegistrationEmail(registration) {
	if (!registration.event || !registration.participant) {
		throw new Error('Регистрация должна содержать данные события и участника')
	}

	const event = registration.event
	const participant = registration.participant

	return await sendEventRegistrationEmail(
		participant.email,
		participant.firstName + ' ' + participant.lastName,
		event,
		registration.registrationNumber
	)
}

module.exports = {
	sendRegistrationConfirmation,
	sendEventRegistrationEmail,
	sendRegistrationEmail,
}
