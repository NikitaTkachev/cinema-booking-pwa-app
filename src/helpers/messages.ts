export interface IMessage {
  type: 'success'|'error';
  header: string;
  message: string;
}

const messages: {[key: string]: IMessage} = {
  BOOKED: {
    type: 'success',
    header: 'Good job!',
    message: 'Your seat has been successfully booked',
  },
  BUSY: {
    type: 'error',
    header: 'Bad news :(',
    message: 'This seat has been already booked',
  },
  OFFLINE: {
    type: 'error',
    header: 'Off-line mode',
    message: 'Connection has been lost. When it recovers, we will repeat your request.'
  }
}

export const MESSAGES = messages;