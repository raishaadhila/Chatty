const { getData, setData, updateData } = require('../db/firebase');
const logger = require('../utils/logger');

const STEPS = ['business-profile', 'connect-channel', 'catalog-setup', 'test-ai', 'setup-reports'];

const BUSINESS_TYPES = ['e-commerce', 'food-beverage', 'services', 'other'];
const LANGUAGES = ['bahasa', 'english', 'both'];
const TONES = ['friendly', 'professional', 'casual', 'formal'];

async function getOnboardingStatus(workspaceId) {
  const status = await getData(`/workspaces/${workspaceId}/onboarding`);
  if (!status) {
    return { currentStep: 'business-profile', completed: {}, started: false };
  }
  return status;
}

async function completeStep(workspaceId, step, data) {
  const validStep = STEPS.includes(step);
  if (!validStep) throw new Error(`Invalid onboarding step: ${step}`);

  const status = await getOnboardingStatus(workspaceId);

  switch (step) {
    case 'business-profile':
      if (!data.businessName) throw new Error('Business name is required');
      if (!BUSINESS_TYPES.includes(data.businessType)) throw new Error('Invalid business type');
      if (!LANGUAGES.includes(data.primaryLanguage)) throw new Error('Invalid language selection');

      await updateData(`/workspaces/${workspaceId}/config`, {
        businessName: data.businessName,
        businessType: data.businessType,
        primaryLanguage: data.primaryLanguage,
        brandTone: data.brandTone || 'friendly',
      });
      break;

    case 'connect-channel':
      if (!data.channelType || !data.channelToken) {
        throw new Error('Channel type and token are required');
      }

      await updateData(`/workspaces/${workspaceId}/config`, {
        [`channels.${data.channelType}`]: {
          enabled: true,
          token: data.channelToken,
          connectedAt: Date.now(),
        },
      });
      break;

    case 'catalog-setup':
      if (data.skipped) break;

      if (data.source === 'csv' && data.items) {
        await setData(`/workspaces/${workspaceId}/catalog`, data.items);
      } else if (data.source === 'sheets' && data.sheetUrl) {
        await updateData(`/workspaces/${workspaceId}/config`, {
          catalogSheetUrl: data.sheetUrl,
          catalogSyncEnabled: true,
        });
      }

      if (data.faqs?.length) {
        await setData(`/workspaces/${workspaceId}/faqs`, data.faqs);
      }
      break;

    case 'test-ai':
      break;

    case 'setup-reports':
      if (data.ownerEmail) {
        await updateData(`/workspaces/${workspaceId}/config`, {
          ownerEmail: data.ownerEmail,
          ownerWA: data.ownerWA || '',
          reportSchedule: data.reportSchedule || 'morning',
        });
      }
      break;
  }

  const completed = { ...status.completed, [step]: true };
  const nextIndex = STEPS.indexOf(step) + 1;
  const nextStep = nextIndex < STEPS.length ? STEPS[nextIndex] : null;

  await setData(`/workspaces/${workspaceId}/onboarding`, {
    currentStep: nextStep || 'completed',
    completed,
    started: true,
    completedAt: nextStep ? null : Date.now(),
  });

  return { nextStep, completed, isComplete: !nextStep };
}

function getSampleMessages(businessType) {
  const samples = {
    'e-commerce': [
      'Halo, apakah hoodie warna hitam size L masih ada?',
      'Berapa harga untuk free shipping?',
      'Kapan stok baju biru masuk lagi?',
    ],
    'food-beverage': [
      'Menu apa yang best seller?',
      'Berapa harga nasi gorengnya?',
      'Bisa delivery sampai jam berapa?',
    ],
    services: [
      'Berapa tarif untuk konsultasi 1 jam?',
      'Apakah buka hari Minggu?',
      'Bisa booking online?',
    ],
    other: [
      'Halo, apa produk terbaru?',
      'Berapa harga untuk 1 pcs?',
      'Apakah ada diskon?',
    ],
  };
  return samples[businessType] || samples.other;
}

module.exports = { getOnboardingStatus, completeStep, getSampleMessages, STEPS };
