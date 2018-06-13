module.exports = function (io, req, notification) {
  // Reload the session - the socket may have changed if the user refreshed their browser
  req.session.reload(function (err) {
    if (err) {
      console.log(err);
    }
    //const socketId = req.session.passport.socket;
    let socketId = '';
    if ('session' in req) {
      if ('passport' in req.session) {
        if ('socket' in req.session.passport) {
          socketId = req.session.passport.socket;
        } else {
          socketId = 'wbxYeJepqiEbCOR2AAAH';
        }
      } else {
        socketId = 'wbxYeJepqiEbCOR2AAAH';
      }
    } else {
      socketId = 'wbxYeJepqiEbCOR2AAAH';
    }
    const userSocket = io.sockets.connected[socketId];
    if (userSocket) {
      Object.assign(notification, { isUpdate: false });

      userSocket.emit('notification', notification);
    }
  });
};
