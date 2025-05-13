const cloud = require('wx-server-sdk');
cloud.init();
exports.main = async (event, context) => {
  const db = cloud.database();
  const reservation = await db.collection('reservations').doc(event.reservationId).get();
  const openid = cloud.getWXContext().OPENID;
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: 'your_template_id', // 替换为你的订阅消息模板ID
      page: '/pages/success/success',
      data: {
        date1: { value: reservation.data.reserveTime },
        number1: { value: reservation.data.peopleCount },
        thing2: { value: '请按时到店用餐' }
      }
    });
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
};