const en = {
  title: 'Service demo', disclaimer: 'Synthetic data only. No real consent or official submission is recorded.',
  loading: 'Connecting your demo account', profile: 'Profile and signature', profileHelp: 'The stored demo guide is shown below. The signature will be uploaded and saved automatically.',
  signature: 'Synthetic signature image', saving: 'Saving to the service…', starting: 'The application starts automatically in a moment.',
  retry: 'Retry', restart: 'Create a new demo', auto: 'Auto-fill in progress. Each stage is saved before continuing.',
  pause: 'Pause', resume: 'Resume', paused: 'Paused. Review the information at your own pace.',
  errorPaused: 'Auto-fill stopped because an operation failed. Retry after checking the message.',
  review: 'Demo answers are filled in. Review or edit them, then continue.',
  expandEditor: 'Expand text', collapseEditor: 'Compact text',
  shortDisclaimer: 'Synthetic data · no official submission',
  fields: {name: 'Name', birth_date: 'Date of birth', nationality: 'Nationality', phone: 'Phone', address: 'Address'},
  draft: {saving:'Saving your changes…',saved:'Changes saved. You can resume after refreshing.',failed:'Could not save changes. Keep this page open and retry.'},
};
export const demoTranslations = {
  en,
  ko: {title:'서비스 체험',disclaimer:'합성 데이터 시연입니다. 실제 약관 동의나 기관 제출은 처리하지 않습니다.',loading:'시연 계정을 연결하고 있습니다',profile:'개인정보·서명 준비',profileHelp:'DB에 보관된 시연 가이드를 표시합니다. 서명 이미지를 업로드하고 자동 저장합니다.',signature:'이름 기반 합성 서명 이미지',saving:'서비스에 저장하고 있습니다…',starting:'잠시 후 신청 화면으로 자동 진행합니다.',retry:'다시 시도',restart:'새 시연 만들기',auto:'자동 입력 중입니다. 단계별 저장 후 다음으로 진행합니다.',pause:'일시 정지',resume:'자동 입력 계속',paused:'일시 정지했습니다. 정보를 천천히 확인하세요.',errorPaused:'처리 실패로 자동 입력을 멈췄습니다. 오류 확인 후 다시 시도하세요.',review:'이제 직접 확인하세요. AI 보완 질문과 문안을 확인·수정한 뒤 최종 내용을 확정하세요.',fields:{name:'이름',birth_date:'생년월일',nationality:'국적',phone:'연락처',address:'주소'}},
  vi: {title:'Trải nghiệm dịch vụ',disclaimer:'Chỉ dùng dữ liệu giả lập. Không ghi nhận đồng ý pháp lý hay nộp hồ sơ thật.',loading:'Đang kết nối tài khoản demo',profile:'Thông tin và chữ ký',profileHelp:'Thông tin được lấy từ hướng dẫn demo đã lưu. Chữ ký sẽ được tải lên và lưu tự động.',signature:'Ảnh chữ ký giả lập',saving:'Đang lưu vào dịch vụ…',starting:'Sắp tự động chuyển sang hồ sơ.',retry:'Thử lại',restart:'Tạo demo mới',auto:'Đang tự động nhập. Mỗi bước được lưu trước khi tiếp tục.',pause:'Tạm dừng',resume:'Tiếp tục',paused:'Đã tạm dừng. Bạn có thể xem kỹ thông tin.',errorPaused:'Tự động nhập đã dừng do lỗi. Kiểm tra thông báo rồi thử lại.',review:'Hãy kiểm tra, trả lời câu hỏi bổ sung và chỉnh sửa trước khi xác nhận tài liệu cuối cùng.',fields:{name:'Họ tên',birth_date:'Ngày sinh',nationality:'Quốc tịch',phone:'Điện thoại',address:'Địa chỉ'}},
  fil: {title:'Demo ng serbisyo',disclaimer:'Kathang-isip na datos lamang. Walang tunay na legal na pahintulot o opisyal na pagsusumite.',loading:'Ikinokonekta ang demo account',profile:'Impormasyon at lagda',profileHelp:'Ipinapakita ang naka-save na gabay. Awtomatikong ia-upload at ise-save ang lagda.',signature:'Larawan ng kathang-isip na lagda',saving:'Sine-save sa serbisyo…',starting:'Awtomatikong magsisimula ang aplikasyon.',retry:'Subukan muli',restart:'Gumawa ng bagong demo',auto:'Awtomatikong paglalagay. Sine-save ang bawat hakbang bago magpatuloy.',pause:'I-pause',resume:'Magpatuloy',paused:'Naka-pause. Suriin nang mabuti ang impormasyon.',errorPaused:'Huminto dahil sa error. Suriin ang mensahe at subukan muli.',review:'Suriin, sagutin ang karagdagang tanong, at baguhin ang draft bago kumpirmahin ang huling dokumento.',fields:{name:'Pangalan',birth_date:'Petsa ng kapanganakan',nationality:'Nasyonalidad',phone:'Telepono',address:'Tirahan'}},
  th: en, km: en, zh: en, ja: en,
};
Object.assign(demoTranslations.ko, {draft:{saving:'수정사항 저장 중…',saved:'수정사항을 저장했습니다. 새로고침 후에도 이어갈 수 있습니다.',failed:'수정사항 저장 실패. 이 화면을 유지하고 연결을 확인해주세요.'}});
Object.assign(demoTranslations.vi, {draft:{saving:'Đang lưu thay đổi…',saved:'Đã lưu thay đổi. Có thể tiếp tục sau khi tải lại.',failed:'Không lưu được. Giữ trang này mở và kiểm tra kết nối.'}});
Object.assign(demoTranslations.fil, {draft:{saving:'Sine-save ang mga pagbabago…',saved:'Na-save na. Maaaring magpatuloy pagkatapos i-refresh.',failed:'Hindi na-save. Panatilihing bukas ang pahina at suriin ang koneksyon.'}});
Object.assign(demoTranslations.ko, {review:'시연 답변을 자동 입력했습니다. 확인·수정 후 다음으로 진행하세요.',expandEditor:'본문 크게 보기',collapseEditor:'본문 접기',shortDisclaimer:'합성 데이터 · 실제 제출 없음'});
Object.assign(demoTranslations.vi, {review:'Đã điền câu trả lời demo. Kiểm tra hoặc sửa rồi tiếp tục.',expandEditor:'Mở rộng nội dung',collapseEditor:'Thu gọn nội dung',shortDisclaimer:'Dữ liệu giả lập · không nộp hồ sơ thật'});
Object.assign(demoTranslations.fil, {review:'Nailagay na ang mga sagot sa demo. Suriin o baguhin bago magpatuloy.',expandEditor:'Palakihin ang teksto',collapseEditor:'Paikliin ang view',shortDisclaimer:'Kathang-isip na datos · walang opisyal na pagsusumite'});
