const cloud = require('wx-server-sdk');
cloud.init();
exports.main = async (event, context) => {
  const db = cloud.database();
  const reservation = await db.collection('reservations').doc(event.reservationId).get();
  const openid = cloud.getWXContext().OPENID;
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: 'IgwyXmLF_wbGs4dG0yjgyvsbVJYTo13iXJRo8y5WoS0', // 替换为实际模板 ID
      page: '/pages/success/success',
      data: {
        date1: { value: reservation.data.reserveTime },
        number1: { value: reservation.data.peopleCount },
        thing2: { value: '请按时到店用餐' }
      }
    });
    console.log('订阅消息发送成功:', result);
    return result;
  } catch (err) {
    console.error('订阅消息发送失败:', err);
    return err;
  }
};