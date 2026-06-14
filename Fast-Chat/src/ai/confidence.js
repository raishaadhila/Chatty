const UNCERTAINTY_PATTERNS = [
  /i('m| am) not (sure|certain|confident|able to)/i,
  /i don('t| not) (know|have|understand)/i,
  /tidak (tahu|yakin|pasti|mengerti)/i,
  /maaf,? (saya|aku) (tidak|belum)/i,
  /saya (tidak|belum) bisa/i,
  /please contact (support|admin|the owner|our team)/i,
  /silakan hubungi/i,
  /this requires (a|the|an) human/i,
  /perlu bantuan (admin|staff|manusia)/i,
  /I('d| would) recommend (contacting|speaking|checking)/i,
  /i cannot (process|handle|complete|answer)/i,
  /unable to (process|resolve|handle)/i,
  /beyond my (ability|capability|scope)/i,
];

const ESCALATION_RESPONSE = `Maaf, saya kurang yakin dengan jawabannya. Saya akan menghubungkan Anda dengan tim kami yang akan membantu lebih lanjut. 🙏`;

function detectUncertainty(text) {
  return UNCERTAINTY_PATTERNS.some(pattern => pattern.test(text));
}

function getEscalationResponse() {
  return ESCALATION_RESPONSE;
}

module.exports = { detectUncertainty, getEscalationResponse, UNCERTAINTY_PATTERNS };
