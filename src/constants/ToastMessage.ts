export const TOAST_MESSAGES = {
  auth: {
    loginFailed: '로그인에 실패했습니다.',
    invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
    signupFailed: '계정 생성에 실패했습니다.',
    sessionExpired: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
    logoutFailed: '로그아웃에 실패했습니다.',
  },

  favorite: {
    updateFailed: '찜 처리에 실패했습니다.',
  },

  estimate: {
    requestSuccess: '견적 요청이 완료되었습니다.',
    requestFailed: '견적 요청에 실패했습니다.',

    confirmSuccess: '견적이 확정되었습니다.',
    confirmFailed: '견적 확정에 실패했습니다.',

    sendSuccess: '견적을 보냈습니다.',
    sendFailed: '견적 전송에 실패했습니다.',
    quoteLimitReached: '이 요청은 견적을 더 받을 수 없습니다.',
    requestNotPending: '이미 마감된 요청입니다.',
    notInServiceArea: '서비스 가능 지역의 요청에만 견적을 보낼 수 있습니다.',

    rejectSuccess: '견적 요청을 반려했습니다.',
    rejectFailed: '견적 요청 반려에 실패했습니다.',
  },

  review: {
    createSuccess: '리뷰가 등록되었습니다.',
    createFailed: '리뷰 등록에 실패했습니다.',
  },

  profile: {
    profileCreateFailed: '프로필 등록에 실패했습니다.',

    updateSuccess: '프로필이 수정되었습니다.',
    updateFailed: '프로필 수정에 실패했습니다.',

    basicInfoUpdateSuccess: '기본 정보가 수정되었습니다.',
    basicInfoUpdateFailed: '기본 정보 수정에 실패했습니다.',
  },

  common: {
    linkCopied: '링크가 복사되었습니다.',
  },
} as const
