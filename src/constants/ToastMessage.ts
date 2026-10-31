export const TOAST_MESSAGES = {
  auth: {
    loginFailed: '로그인에 실패했습니다.',
    invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
    signupFailed: '계정 생성에 실패했습니다.',
    sessionExpired: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
    logoutFailed: '로그아웃에 실패했습니다.',
  },

  mover: {
    notFound: '기사님 정보를 찾을 수 없습니다.',
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
    linkCopyFailed: '링크 복사에 실패했습니다.',

    shareFailed: '공유 기능을 불러오지 못했습니다.',
  },
} as const
