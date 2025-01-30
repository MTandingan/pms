const Constants = require('../helper/constants');
const internalCommentRepository = require("../dao/internalCommentRepository");

module.exports.addComment = async (body) => {
    return await internalCommentRepository.addComment(body);
}

module.exports.updateComment = async (body) => {
    const result = await internalCommentRepository.updateComment(body);

    return (result.affectedRows == Constants.HAS_UPDATED_DATA) ? Constants.HAS_UPDATED_DATA : Constants.STATUS_CODE_ERROR;
}

module.exports.deleteComment = async (body) => {
    const result = await internalCommentRepository.deleteComment(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.deleteCommentByWsqId = async (body) => {
    const result = await internalCommentRepository.deleteCommentByWsqId(body);

    return (result.affectedRows == Constants.HAS_NO_DATA_DELETED) ? Constants.STATUS_CODE_ERROR : Constants.STATUS_CODE_SUCCESS;
}

module.exports.getListOfCommentsByWsqId = async (body) => {
    return await internalCommentRepository.getListOfCommentsByWsqId(body);
}

module.exports.getListOfCommentsAndWsqByCompId = async (body) => {
    return await internalCommentRepository.getListOfCommentsAndWsqByCompId(body);
}


