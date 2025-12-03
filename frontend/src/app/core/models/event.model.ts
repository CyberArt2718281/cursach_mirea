export interface Event {
  _id?: string;
  title: string;
  description: string;
  date: Date | string;
  endDate?: Date | string;
  location: string;
  category: 'конференция' | 'семинар' | 'вебинар' | 'мастер-класс' | 'выставка' | 'концерт' | 'спорт' | 'другое';
  capacity: number;
  availableSeats: number;
  price: number;
  imageUrl?: string;
  status: 'активное' | 'отменено' | 'завершено' | 'черновик';
  organizer: {
    name: string;
    email: string;
    phone?: string;
  };
  registrationDeadline?: Date | string;
  tags?: string[];
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EventStats {
  totalCapacity: number;
  availableSeats: number;
  registeredCount: number;
  confirmedCount: number;
  attendedCount: number;
  paidCount: number;
  occupancyRate: string;
}
