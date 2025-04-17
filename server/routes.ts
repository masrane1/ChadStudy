import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertDocumentSchema, 
  insertSubjectSchema, 
  insertRatingSchema, 
  insertCommentSchema, 
  insertAnnouncementSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Public API routes
  
  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubject(id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const { subjectId, year, search } = req.query;
      
      const filters: { subjectId?: number; year?: number; search?: string } = {};
      
      if (subjectId) {
        filters.subjectId = parseInt(subjectId as string);
      }
      
      if (year) {
        filters.year = parseInt(year as string);
      }
      
      if (search) {
        filters.search = search as string;
      }
      
      const documents = await storage.getDocuments(filters);
      
      // Get additional information for each document
      const enhancedDocuments = await Promise.all(documents.map(async (doc) => {
        const subject = await storage.getSubject(doc.subjectId);
        const ratings = await storage.getRatingsByDocument(doc.id);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        const commentCount = (await storage.getCommentsByDocument(doc.id)).length;
        
        return {
          ...doc,
          subject: subject?.name || "Unknown",
          subjectColor: subject?.color || "gray",
          averageRating,
          ratingCount: ratings.length,
          commentCount
        };
      }));
      
      res.json(enhancedDocuments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const subject = await storage.getSubject(document.subjectId);
      const ratings = await storage.getRatingsByDocument(document.id);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;
      const comments = await storage.getCommentsByDocument(document.id);
      
      // Check if user has favorited this document
      let isFavorite = false;
      if (req.isAuthenticated()) {
        const favorite = await storage.getFavoriteByUserAndDocument(req.user.id, document.id);
        isFavorite = !!favorite;
      }
      
      // Get user's rating if they're logged in
      let userRating = 0;
      if (req.isAuthenticated()) {
        const rating = await storage.getUserDocumentRating(req.user.id, document.id);
        userRating = rating ? rating.rating : 0;
      }
      
      const enhancedDocument = {
        ...document,
        subject: subject?.name || "Unknown",
        subjectColor: subject?.color || "gray",
        averageRating,
        ratingCount: ratings.length,
        commentCount: comments.length,
        isFavorite,
        userRating
      };
      
      res.json(enhancedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Increment download count
      await storage.incrementDownloadCount(id);
      
      // In a real application, this would serve the actual file.
      // For now, we'll just return the document details with a success message
      res.json({ 
        message: "Download started", 
        document: { 
          id: document.id, 
          title: document.title, 
          fileName: document.fileName 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Comments routes
  app.get("/api/documents/:id/comments", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const comments = await storage.getCommentsByDocument(documentId);
      
      // Get user info for each comment
      const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role
          } : null
        };
      }));
      
      res.json(enhancedComments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/documents/:id/comments", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const commentData = {
        ...req.body,
        documentId,
        userId: req.user.id,
        isAdminResponse: req.user.role === "admin"
      };
      
      // Validate comment data
      const validatedData = insertCommentSchema.parse(commentData);
      
      const comment = await storage.createComment(validatedData);
      
      // Get user info
      const user = await storage.getUser(comment.userId);
      
      const enhancedComment = {
        ...comment,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role
        } : null
      };
      
      res.status(201).json(enhancedComment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Rating routes
  app.post("/api/documents/:id/ratings", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const ratingData = {
        documentId,
        userId: req.user.id,
        rating: req.body.rating
      };
      
      // Validate rating data
      const validatedData = insertRatingSchema.parse(ratingData);
      
      const rating = await storage.createRating(validatedData);
      const averageRating = await storage.getAverageRating(documentId);
      const ratingCount = (await storage.getRatingsByDocument(documentId)).length;
      
      res.status(201).json({
        rating,
        averageRating,
        ratingCount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Favorite routes
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.user.id);
      
      // Get document details for each favorite
      const enhancedFavorites = await Promise.all(favorites.map(async (favorite) => {
        const document = await storage.getDocument(favorite.documentId);
        const subject = document ? await storage.getSubject(document.subjectId) : null;
        
        return {
          ...favorite,
          document: document ? {
            ...document,
            subject: subject?.name || "Unknown",
            subjectColor: subject?.color || "gray"
          } : null
        };
      }));
      
      res.json(enhancedFavorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/documents/:id/favorites", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if already favorited
      const existingFavorite = await storage.getFavoriteByUserAndDocument(req.user.id, documentId);
      
      if (existingFavorite) {
        return res.status(400).json({ message: "Document already favorited" });
      }
      
      const favoriteData = {
        documentId,
        userId: req.user.id
      };
      
      const favorite = await storage.createFavorite(favoriteData);
      
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to favorite document" });
    }
  });

  app.delete("/api/documents/:id/favorites", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      // Find the favorite
      const favorite = await storage.getFavoriteByUserAndDocument(req.user.id, documentId);
      
      if (!favorite) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      // Delete the favorite
      await storage.deleteFavorite(favorite.id);
      
      res.status(200).json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Announcement routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const announcements = await storage.getAnnouncements(activeOnly);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Remove passwords before sending
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow deleting yourself
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/admin/documents", async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        uploadedBy: req.user.id
      };
      
      // Validate document data
      const validatedData = insertDocumentSchema.parse(documentData);
      
      const document = await storage.createDocument(validatedData);
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updatedDocument = await storage.updateDocument(id, req.body);
      
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/admin/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.post("/api/admin/subjects", async (req, res) => {
    try {
      // Validate subject data
      const validatedData = insertSubjectSchema.parse(req.body);
      
      const subject = await storage.createSubject(validatedData);
      
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.put("/api/admin/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubject(id);
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      const updatedSubject = await storage.updateSubject(id, req.body);
      
      res.json(updatedSubject);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/admin/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  app.post("/api/admin/announcements", async (req, res) => {
    try {
      const announcementData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      // Validate announcement data
      const validatedData = insertAnnouncementSchema.parse(announcementData);
      
      const announcement = await storage.createAnnouncement(validatedData);
      
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put("/api/admin/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const announcement = await storage.getAnnouncement(id);
      
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      
      res.json(updatedAnnouncement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/admin/announcements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAnnouncement(id);
      
      if (!success) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
