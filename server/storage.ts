import {
  User, InsertUser, Subject, InsertSubject, Document,
  InsertDocument, Rating, InsertRating, Comment, InsertComment,
  Favorite, InsertFavorite, Announcement, InsertAnnouncement
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Subject methods
  getSubject(id: number): Promise<Subject | undefined>;
  getSubjectByName(name: string): Promise<Subject | undefined>;
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<Subject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;

  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(filters?: { subjectId?: number; year?: number; search?: string }): Promise<Document[]>;
  getDocumentsBySubject(subjectId: number): Promise<Document[]>;
  getDocumentsByYear(year: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  incrementDownloadCount(id: number): Promise<void>;

  // Rating methods
  getRating(id: number): Promise<Rating | undefined>;
  getRatingsByDocument(documentId: number): Promise<Rating[]>;
  getRatingsByUser(userId: number): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, rating: Partial<Rating>): Promise<Rating | undefined>;
  deleteRating(id: number): Promise<boolean>;
  getAverageRating(documentId: number): Promise<number>;

  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByDocument(documentId: number): Promise<Comment[]>;
  getCommentsByUser(userId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Favorite methods
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  getFavoritesByDocument(documentId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  getFavoriteByUserAndDocument(userId: number, documentId: number): Promise<Favorite | undefined>;

  // Announcement methods
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  getAnnouncements(activeOnly?: boolean): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  // Collections
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private documents: Map<number, Document>;
  private ratings: Map<number, Rating>;
  private comments: Map<number, Comment>;
  private favorites: Map<number, Favorite>;
  private announcements: Map<number, Announcement>;

  // ID counters
  private userIdCounter: number;
  private subjectIdCounter: number;
  private documentIdCounter: number;
  private ratingIdCounter: number;
  private commentIdCounter: number;
  private favoriteIdCounter: number;
  private announcementIdCounter: number;

  // Session store
  public sessionStore: session.SessionStore;

  constructor() {
    // Initialize collections
    this.users = new Map();
    this.subjects = new Map();
    this.documents = new Map();
    this.ratings = new Map();
    this.comments = new Map();
    this.favorites = new Map();
    this.announcements = new Map();

    // Initialize ID counters
    this.userIdCounter = 1;
    this.subjectIdCounter = 1;
    this.documentIdCounter = 1;
    this.ratingIdCounter = 1;
    this.commentIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.announcementIdCounter = 1;

    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$Yk7Kkl5KGiJsJ7Vu9v6FnecjdJUDQaI/z7vZ2p1RBCGJgSA45flQu", // "adminpassword"
      email: "admin@bachub.com",
      fullName: "Admin User",
      role: "admin"
    });

    // Add default subjects
    const subjectColors = {
      "Mathématiques": "blue",
      "Physique-Chimie": "red",
      "SVT": "green",
      "Français": "yellow",
      "Philosophie": "purple",
      "Histoire-Géo": "orange",
      "Anglais": "indigo"
    };

    Object.entries(subjectColors).forEach(([name, color]) => {
      this.createSubject({ name, color });
    });

    // Seed some sample documents
    const sampleDocuments = [
      {
        title: "Bac D - Épreuve de Mathématiques",
        description: "Sujet complet avec corrigé détaillé de l'épreuve de mathématiques du Baccalauréat série D.",
        year: 2023,
        subjectId: 1, // Mathématiques
        fileName: "math_bac_d_2023.pdf",
        fileSize: 1200000, // 1.2 MB
        uploadedBy: 1,
      },
      {
        title: "Bac A - Sciences de la Vie et de la Terre",
        description: "Épreuve complète de SVT avec schémas et corrigés pour le Baccalauréat série A.",
        year: 2022,
        subjectId: 3, // SVT
        fileName: "svt_bac_a_2022.pdf",
        fileSize: 2400000, // 2.4 MB
        uploadedBy: 1,
      },
      {
        title: "Bac A, C, D - Philosophie",
        description: "Sujets et corrigés de l'épreuve de Philosophie avec méthodologie de dissertation et commentaire.",
        year: 2023,
        subjectId: 5, // Philosophie
        fileName: "philo_bac_acd_2023.pdf",
        fileSize: 1800000, // 1.8 MB
        uploadedBy: 1,
      }
    ];

    sampleDocuments.forEach(doc => this.createDocument(doc));

    // Add a sample announcement
    this.createAnnouncement({
      title: "Nouveaux sujets disponibles",
      content: "Nouveaux sujets de Mathématiques et Sciences Physiques disponibles pour le Bac 2023!",
      active: true,
      createdBy: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Subject methods
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getSubjectByName(name: string): Promise<Subject | undefined> {
    return Array.from(this.subjects.values()).find(
      (subject) => subject.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.subjectIdCounter++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async updateSubject(id: number, subjectData: Partial<Subject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;

    const updatedSubject = { ...subject, ...subjectData };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(filters?: { subjectId?: number; year?: number; search?: string }): Promise<Document[]> {
    let docs = Array.from(this.documents.values());

    if (filters) {
      if (filters.subjectId !== undefined) {
        docs = docs.filter(doc => doc.subjectId === filters.subjectId);
      }
      
      if (filters.year !== undefined) {
        docs = docs.filter(doc => doc.year === filters.year);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        docs = docs.filter(doc => 
          doc.title.toLowerCase().includes(searchLower) || 
          doc.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return docs;
  }

  async getDocumentsBySubject(subjectId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.subjectId === subjectId
    );
  }

  async getDocumentsByYear(year: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.year === year
    );
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const newDocument: Document = { 
      ...document, 
      id,
      downloads: 0,
      createdAt: new Date() 
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument = { ...document, ...documentData };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.downloads += 1;
      this.documents.set(id, document);
    }
  }

  // Rating methods
  async getRating(id: number): Promise<Rating | undefined> {
    return this.ratings.get(id);
  }

  async getRatingsByDocument(documentId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.documentId === documentId
    );
  }

  async getRatingsByUser(userId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.userId === userId
    );
  }

  async createRating(rating: InsertRating): Promise<Rating> {
    // Check if user has already rated this document
    const existingRating = await this.getUserDocumentRating(rating.userId, rating.documentId);
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating.rating;
      this.ratings.set(existingRating.id, existingRating);
      return existingRating;
    } else {
      // Create new rating
      const id = this.ratingIdCounter++;
      const newRating: Rating = { 
        ...rating, 
        id, 
        createdAt: new Date()
      };
      this.ratings.set(id, newRating);
      return newRating;
    }
  }

  async updateRating(id: number, ratingData: Partial<Rating>): Promise<Rating | undefined> {
    const rating = this.ratings.get(id);
    if (!rating) return undefined;

    const updatedRating = { ...rating, ...ratingData };
    this.ratings.set(id, updatedRating);
    return updatedRating;
  }

  async deleteRating(id: number): Promise<boolean> {
    return this.ratings.delete(id);
  }

  async getAverageRating(documentId: number): Promise<number> {
    const ratings = await this.getRatingsByDocument(documentId);
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  async getUserDocumentRating(userId: number, documentId: number): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      (rating) => rating.userId === userId && rating.documentId === documentId
    );
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByDocument(documentId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.documentId === documentId)
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.userId === userId
    );
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const newComment: Comment = { 
      ...comment, 
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, newComment);
    return newComment;
  }

  async updateComment(id: number, commentData: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    const updatedComment = { ...comment, ...commentData };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Favorite methods
  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favorites.get(id);
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }

  async getFavoritesByDocument(documentId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.documentId === documentId
    );
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const newFavorite: Favorite = { 
      ...favorite, 
      id, 
      createdAt: new Date() 
    };
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }

  async getFavoriteByUserAndDocument(userId: number, documentId: number): Promise<Favorite | undefined> {
    return Array.from(this.favorites.values()).find(
      (favorite) => favorite.userId === userId && favorite.documentId === documentId
    );
  }

  // Announcement methods
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcements.get(id);
  }

  async getAnnouncements(activeOnly = false): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter((announcement) => !activeOnly || announcement.active)
      .sort((a, b) => {
        // Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.announcementIdCounter++;
    const newAnnouncement: Announcement = { 
      ...announcement, 
      id, 
      createdAt: new Date(),
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcementData: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;

    const updatedAnnouncement = { ...announcement, ...announcementData };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
