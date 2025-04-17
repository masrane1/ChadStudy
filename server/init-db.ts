import { db } from './db';
import { users, subjects, documents, announcements } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function initDatabase() {
  console.log('Initializing database...');

  // Check if users already exist
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log('Database already initialized, skipping...');
    return;
  }

  // Create admin user
  const adminPassword = await hashPassword('admindouleinnova');
  const [adminUser] = await db.insert(users).values({
    username: 'admin',
    email: 'admin@douleinnova.com',
    password: adminPassword,
    fullName: 'Admin Doule Innova',
    role: 'admin'
  }).returning();

  console.log('Created admin user:', adminUser.username);

  // Create student user
  const studentPassword = await hashPassword('elevedouleinnova');
  const [studentUser] = await db.insert(users).values({
    username: 'eleve',
    email: 'eleve@douleinnova.com',
    password: studentPassword,
    fullName: 'Élève Test',
    role: 'user'
  }).returning();

  console.log('Created student user:', studentUser.username);

  // Create subjects
  const subjectColors = {
    "Mathématiques": "blue",
    "Physique-Chimie": "red",
    "SVT": "green",
    "Français": "yellow",
    "Philosophie": "purple",
    "Histoire-Géo": "orange",
    "Anglais": "indigo"
  };

  for (const [name, color] of Object.entries(subjectColors)) {
    const [subject] = await db.insert(subjects).values({ name, color }).returning();
    console.log(`Created subject: ${subject.name}`);
  }

  // Get subject IDs
  const subjectList = await db.select().from(subjects);
  const mathId = subjectList.find(s => s.name === 'Mathématiques')?.id || 1;
  const svtId = subjectList.find(s => s.name === 'SVT')?.id || 3;
  const philoId = subjectList.find(s => s.name === 'Philosophie')?.id || 5;

  // Create sample documents
  const sampleDocuments = [
    {
      title: "Bac D - Épreuve de Mathématiques",
      description: "Sujet complet avec corrigé détaillé de l'épreuve de mathématiques du Baccalauréat série D.",
      year: 2023,
      subjectId: mathId,
      fileName: "math_bac_d_2023.pdf",
      fileSize: 1200000, // 1.2 MB
      uploadedBy: adminUser.id,
      downloads: 0
    },
    {
      title: "Bac A - Sciences de la Vie et de la Terre",
      description: "Épreuve complète de SVT avec schémas et corrigés pour le Baccalauréat série A.",
      year: 2022,
      subjectId: svtId,
      fileName: "svt_bac_a_2022.pdf",
      fileSize: 2400000, // 2.4 MB
      uploadedBy: adminUser.id,
      downloads: 0
    },
    {
      title: "Bac A, C, D - Philosophie",
      description: "Sujets et corrigés de l'épreuve de Philosophie avec méthodologie de dissertation et commentaire.",
      year: 2023,
      subjectId: philoId,
      fileName: "philo_bac_acd_2023.pdf",
      fileSize: 1800000, // 1.8 MB
      uploadedBy: adminUser.id,
      downloads: 0
    }
  ];

  for (const doc of sampleDocuments) {
    const [document] = await db.insert(documents).values(doc).returning();
    console.log(`Created document: ${document.title}`);
  }

  // Create a sample announcement
  const [announcement] = await db.insert(announcements).values({
    title: "Nouveaux sujets disponibles",
    content: "Nouveaux sujets de Mathématiques et Sciences Physiques disponibles pour le Bac 2023!",
    active: true,
    createdBy: adminUser.id
  }).returning();

  console.log(`Created announcement: ${announcement.title}`);
  console.log('Database initialization complete!');
}

// Pour ES modules, nous n'avons pas besoin de cette vérification
// car le script est toujours importé plutôt qu'exécuté directement

export default initDatabase;