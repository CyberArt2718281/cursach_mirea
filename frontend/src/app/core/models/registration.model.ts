export interface Registration {
  _id?: string;
  event: string | any;
  participant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organization?: string;
    position?: string;
  };
  status: 'подтверждена' | 'ожидание' | 'отменена';
  registrationNumber?: string;
  paymentStatus: 'оплачено' | 'не оплачено' | 'возвращено';
  notes?: string;
  attended: boolean;
  attendedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
