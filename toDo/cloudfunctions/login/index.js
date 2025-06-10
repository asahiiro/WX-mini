// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: 'cloud1-8gypolju2461fc18' // 你的云环境ID
});
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
  };
};