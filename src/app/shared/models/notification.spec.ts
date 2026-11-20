import { Notification } from './notification';

describe('Notification', () => {
  it('should keep title, message and css classes', () => {
    const notification = new Notification('Error:', 'msg', 'alert-danger');
    expect([notification.title, notification.message, notification.classes]).toEqual([
      'Error:',
      'msg',
      'alert-danger',
    ]);
  });
});
