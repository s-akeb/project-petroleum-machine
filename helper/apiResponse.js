const httpStatus = (code) => {
    if (code === 501) return 500;
    if (code === 402) return 403;
    if (code >= 200 && code < 600) return code;
    return 500;
};

const send = (res, code, message, result = []) => {
    const responseCode = code === 501 ? 500 : code === 402 ? 403 : code;
    return res.status(httpStatus(code)).json({
        responseCode,
        responseMessage: message,
        responseResult: result,
    });
};

module.exports = {
    ok: (res, message, result = []) => send(res, 200, message, result),
    fail: (res, code, message, result = []) => send(res, code, message, result),
};
