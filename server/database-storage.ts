import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { IStorage } from "./storage";
import {
  users,
  subjects,
  documents,
  ratings,
  comments,
  favorites,
  announcements,
  settings,
  User,
  Subject,
  Document,
  Rating,
  Comment,
  Favorite,
  Announcement,
  Setting,
  InsertUser,
  InsertSubject,
  InsertDocument,
  InsertRating,
  InsertComment,
  InsertFavorite,
  InsertAnnouncement,
  InsertSetting
} from "@shared/schema";
import { eq, and, like, desc, count, avg, inArray } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// DB Session Store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // USER METHODS
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true; // Assuming success, since Drizzle ORM doesn't return count in the result
  }

  // SUBJECT METHODS
  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async getSubjectByName(name: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.name, name));
    return subject;
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(subjectData).returning();
    return subject;
  }

  async updateSubject(id: number, subjectData: Partial<Subject>): Promise<Subject | undefined> {
    const [updatedSubject] = await db
      .update(subjects)
      .set(subjectData)
      .where(eq(subjects.id, id))
      .returning();
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    await db.delete(subjects).where(eq(subjects.id, id));
    return true;
  }

  // DOCUMENT METHODS
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocuments(filters?: { subjectId?: number; year?: number; search?: string }): Promise<Document[]> {
    let queryBuilder = db.select().from(documents);
    
    if (filters) {
      if (filters.subjectId) {
        queryBuilder = queryBuilder.where(eq(documents.subjectId, filters.subjectId));
      }
      
      if (filters.year) {
        queryBuilder = queryBuilder.where(eq(documents.year, filters.year));
      }
      
      if (filters.search) {
        queryBuilder = queryBuilder.where(
          like(documents.title, `%${filters.search}%`)
        );
      }
    }
    
    return await queryBuilder;
  }

  async getDocumentsBySubject(subjectId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.subjectId, subjectId));
  }

  async getDocumentsByYear(year: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.year, year));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(documentData)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  async incrementDownloadCount(id: number): Promise<void> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (doc) {
      await db
        .update(documents)
        .set({ downloads: doc.downloads + 1 })
        .where(eq(documents.id, id));
    }
  }

  // RATING METHODS
  async getRating(id: number): Promise<Rating | undefined> {
    const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
    return rating;
  }

  async getRatingsByDocument(documentId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.documentId, documentId));
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.userId, userId));
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    // Check if user has already rated this document
    const existingRating = await this.getUserDocumentRating(ratingData.userId, ratingData.documentId);
    
    if (existingRating) {
      // Update existing rating
      const [updatedRating] = await db
        .update(ratings)
        .set({ rating: ratingData.rating })
        .where(eq(ratings.id, existingRating.id))
        .returning();
      return updatedRating;
    } else {
      // Create new rating
      const [rating] = await db.insert(ratings).values(ratingData).returning();
      return rating;
    }
  }

  async updateRating(id: number, ratingData: Partial<Rating>): Promise<Rating | undefined> {
    const [updatedRating] = await db
      .update(ratings)
      .set(ratingData)
      .where(eq(ratings.id, id))
      .returning();
    return updatedRating;
  }

  async deleteRating(id: number): Promise<boolean> {
    await db.delete(ratings).where(eq(ratings.id, id));
    return true;
  }

  async getAverageRating(documentId: number): Promise<number> {
    const result = await db
      .select({ averageRating: avg(ratings.rating) })
      .from(ratings)
      .where(eq(ratings.documentId, documentId));
    
    if (!result[0]?.averageRating) return 0;
    return Number(result[0].averageRating);
  }

  async getUserDocumentRating(userId: number, documentId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.userId, userId),
          eq(ratings.documentId, documentId)
        )
      );
    
    return rating;
  }

  // COMMENT METHODS
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async getCommentsByDocument(documentId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.documentId, documentId))
      .orderBy(desc(comments.createdAt));
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.userId, userId));
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async updateComment(id: number, commentData: Partial<Comment>): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set(commentData)
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }

  // FAVORITE METHODS
  async getFavorite(id: number): Promise<Favorite | undefined> {
    const [favorite] = await db.select().from(favorites).where(eq(favorites.id, id));
    return favorite;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavoritesByDocument(documentId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.documentId, documentId));
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(favoriteData).returning();
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    await db.delete(favorites).where(eq(favorites.id, id));
    return true;
  }

  async getFavoriteByUserAndDocument(userId: number, documentId: number): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.documentId, documentId)
        )
      );
    
    return favorite;
  }

  // ANNOUNCEMENT METHODS
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async getAnnouncements(activeOnly = false): Promise<Announcement[]> {
    let queryBuilder = db.select().from(announcements);
    
    if (activeOnly) {
      queryBuilder = queryBuilder.where(eq(announcements.active, true));
    }
    
    return await queryBuilder.orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db.insert(announcements).values(announcementData).returning();
    return announcement;
  }

  async updateAnnouncement(id: number, announcementData: Partial<Announcement>): Promise<Announcement | undefined> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set(announcementData)
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    await db.delete(announcements).where(eq(announcements.id, id));
    return true;
  }

  // SETTINGS METHODS
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async getSettings(keys?: string[]): Promise<Setting[]> {
    if (keys && keys.length > 0) {
      return await db.select().from(settings).where(inArray(settings.key, keys));
    }
    return await db.select().from(settings);
  }

  async createSetting(settingData: InsertSetting): Promise<Setting> {
    const [setting] = await db.insert(settings).values(settingData).returning();
    return setting;
  }

  async updateSetting(id: number, settingData: Partial<Setting>): Promise<Setting | undefined> {
    const [updatedSetting] = await db
      .update(settings)
      .set(settingData)
      .where(eq(settings.id, id))
      .returning();
    return updatedSetting;
  }

  async updateSettingByKey(key: string, value: string): Promise<Setting | undefined> {
    const setting = await this.getSetting(key);
    if (!setting) {
      // Si le paramètre n'existe pas, on le crée
      return await this.createSetting({ key, value });
    }
    
    const [updatedSetting] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return updatedSetting;
  }

  async deleteSetting(id: number): Promise<boolean> {
    await db.delete(settings).where(eq(settings.id, id));
    return true;
  }
}