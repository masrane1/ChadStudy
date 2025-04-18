import { db } from './db';
import { settings } from '@shared/schema';

async function initSettings() {
  console.log('Checking for settings...');

  // Get existing settings
  const existingSettings = await db.select().from(settings);
  const existingKeys = new Set(existingSettings.map(s => s.key));

  // Default settings for footer
  const defaultSettings = [
    { key: 'footer_email', value: 'contact@bachub-tchad.com' },
    { key: 'footer_phone', value: '+235 XX XX XX XX' },
    { key: 'footer_address', value: 'N\'Djamena, Tchad' },
    { key: 'social_facebook', value: 'https://facebook.com' },
    { key: 'social_twitter', value: 'https://twitter.com' },
    { key: 'social_instagram', value: 'https://instagram.com' },
    { key: 'footer_description', value: 'Votre plateforme de ressources éducatives pour réussir votre baccalauréat.' },
    { key: 'footer_copyright', value: '© {year} Bac-Hub Tchad. Tous droits réservés.' },
    { 
      key: 'footer_quick_links', 
      value: JSON.stringify([
        { name: 'Accueil', href: '/' },
        { name: 'Documents', href: '/' },
        { name: 'À propos', href: '/' },
        { name: 'Contact', href: '/' },
      ])
    }
  ];

  // Add missing settings
  let addedCount = 0;
  for (const setting of defaultSettings) {
    if (!existingKeys.has(setting.key)) {
      const [createdSetting] = await db.insert(settings).values(setting).returning();
      console.log(`Created setting: ${createdSetting.key}`);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    console.log(`Added ${addedCount} new settings.`);
  } else {
    console.log('All settings already exist, no new settings added.');
  }
}

export default initSettings;