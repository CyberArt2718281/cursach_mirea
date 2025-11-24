const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    console.log('🔍 Auth middleware для:', req.method, req.path);
    console.log('🔍 Cookies объект:', JSON.stringify(req.cookies));
    console.log('🔍 accessToken:', req.cookies?.accessToken ? 'ЕСТЬ' : 'НЕТ');
    console.log('🔍 Authorization header:', req.header('Authorization'));
    
    // Пробуем получить токен из cookies или заголовка Authorization
    let token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ Токен не найден - отказ в доступе');
      return res.status(401).json({ error: 'Аутентификация требуется' });
    }
    
    console.log('✅ Токен найден, проверяем...');

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Если access token истек, проверяем refresh token
    if (error.name === 'TokenExpiredError' && req.cookies?.refreshToken) {
      try {
        const refreshDecoded = jwt.verify(
          req.cookies.refreshToken, 
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
        );
        
        // Генерируем новый access token
        const newAccessToken = jwt.sign(
          { userId: refreshDecoded.userId },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );
        
        // Устанавливаем новый access token в cookies
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000
        });
        
        req.user = { userId: refreshDecoded.userId };
        return next();
      } catch (refreshError) {
        return res.status(401).json({ error: 'Сессия истекла, требуется повторный вход' });
      }
    }
    
    res.status(401).json({ error: 'Недействительный токен' });
  }
};

// Middleware для проверки роли
const checkRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Ошибка проверки роли:', error);
      res.status(500).json({ error: 'Ошибка проверки роли' });
    }
  };
};

// Middleware для проверки прав администратора
const adminAuth = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Требуются права администратора' });
    }

    req.user.role = user.role;
    next();
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

module.exports = { auth, checkRole, adminAuth };
